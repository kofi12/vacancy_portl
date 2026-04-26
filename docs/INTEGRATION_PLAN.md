# Frontend ↔ Backend Integration Plan

_Status: Complete (Phases 1–5)_
_Last updated: 2026-04-25_

This document is the authoritative step-by-step guide for replacing every piece of mock data in the frontend with real API calls to the Hono backend. Each phase is designed to be executed in order. Within a phase, sections can sometimes be done in parallel (noted where applicable).

---

## Background: Current State

### Frontend
- All data is hard-coded mock data inside `frontend/lib/app-context.tsx`
- `AppProvider` wraps the whole app; components call `useApp()` to read state and call actions
- Login is simulated: clicking "Continue with Google" just sets a hard-coded user object in state
- No HTTP calls are made anywhere — zero fetch/axios usage
- Token storage: not implemented
- Routing: single `app/page.tsx` with view-switching in state (`useState`)

### Backend
- Hono REST API running on port **3001** (set in backend/.env; currently `serve` uses port 3000 — see Phase 1 note)
- All 8 controllers mounted: `/auth`, `/users`, `/orgs`, `/rcfs`, `/applicants`, `/applications`, `/application-documents`, `/rcf-forms`
- Auth: Google OAuth 2.0 with PKCE via arctic v3; JWT signed with HS256
- `GET /auth/google?role=<OWNER|RP>` → sets `oauth_nonce` + `code_verifier` cookies → redirects to Google
- `GET /auth/google/callback?code=...&state=...` → verifies nonce, creates/finds user, currently returns `{ token, user }` JSON (needs to be changed to redirect, see Phase 2)
- Protected routes: all entity controllers require `Authorization: Bearer <token>` header

---

## Key Decisions Made in This Plan

1. **Token storage**: JWT stored in `localStorage`. Simple, works well for SPAs. Can be upgraded to httpOnly cookie later.
2. **API client**: A thin wrapper around `fetch` in `frontend/lib/api-client.ts`. No third-party HTTP library (no axios). No data-fetching library (no React Query, no SWR) to keep dependencies minimal.
3. **Auth callback**: The backend will be modified to redirect to the frontend (`/auth/callback?token=...`) instead of returning JSON. This is the standard pattern for a separate-origin SPA + API.
4. **State management**: Keep `AppContext` as the single source of truth, but back it with real API calls. Data fetched once on login, refreshed manually (via "Refresh" button or on navigation).
5. **Error handling**: A global toast (using the existing `use-toast` hook) for API errors. A 401 response anywhere auto-logs the user out.
6. **Ports**: Backend on `:3001`, Frontend on `:3000`. Currently `src/index.ts` uses port 3000 — this must be changed to 3001 to avoid conflict with Next.js dev server.

---

## Phase 1 — Project Setup

These are prerequisites for everything else. Do this before writing any component code.

### 1.1 Fix backend port

**File**: `backend/src/index.ts`

Change port from `3000` to `3001`:
```ts
serve({ fetch: app.fetch, port: 3001 }, ...)
```

Also add `BACKEND_PORT=3001` to `backend/.env` and read it from there:
```ts
port: parseInt(process.env.BACKEND_PORT ?? '3001')
```

### 1.2 Frontend environment variable

**File**: `frontend/.env.local` (create this file — it is gitignored by Next.js by default)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

`NEXT_PUBLIC_` prefix is required by Next.js to expose a variable to browser code. Without it, the variable will be `undefined` at runtime.

### 1.3 Create the API client

**File**: `frontend/lib/api-client.ts` (create new file)

This is a thin wrapper around the native `fetch` API. Every API call in the app will go through this instead of calling `fetch` directly. Its responsibilities:
- Prepend `NEXT_PUBLIC_API_URL` to every path
- Attach `Authorization: Bearer <token>` header if a token is stored
- Parse response JSON automatically
- Throw a typed error if the response is not OK
- If the response is 401 (Unauthorized), clear the stored token and reload the page (this forces a logout)

```ts
// frontend/lib/api-client.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.reload()
    throw new ApiError(401, 'AUTH_UNAUTHORIZED', 'Session expired')
  }

  const data = await res.json()

  if (!res.ok) {
    throw new ApiError(res.status, data.code ?? 'UNKNOWN', data.message ?? 'Unknown error')
  }

  return data as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
```

### 1.4 Create the auth token utility

**File**: `frontend/lib/auth.ts` (create new file)

Centralises all token read/write so nothing accesses `localStorage` directly for token management:

```ts
// frontend/lib/auth.ts

const TOKEN_KEY = 'token'

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// Decode the JWT payload without verifying signature (browser-side only).
// The server always verifies; this is just for reading the userId and role.
export function decodeToken(token: string): { userId: string; role: string } | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}
```

### 1.5 Define shared frontend types

**File**: `frontend/lib/types.ts` (create new file)

These should exactly match the backend response DTOs. Any time you add a field to a backend DTO, update this file too.

```ts
// frontend/lib/types.ts

export type UserRole = 'OWNER' | 'RP' | 'ADMIN'

export interface User {
  id: string
  fullName: string
  email: string
  role: UserRole
  phone: string | null
  profileCompleted: boolean
}

export interface Org {
  id: string
  ownerId: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Facility {
  id: string
  orgId: string
  name: string
  address: string
  phone: string
  licensedBeds: number
  currentOpenings: number
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export interface Applicant {
  id: string
  rpId: string
  name: string
  age: number
  careNeeds: string
  createdAt: string
  updatedAt: string | null
}

export interface Application {
  id: string
  rcfId: string
  applicantId: string
  rpId: string
  status: 'PENDING' | 'SUBMITTED'
  submittedAt: string | null
  createdAt: string
  updatedAt: string | null
}
```

> **Note**: Once these types exist, the interfaces inside `app-context.tsx` should be removed and replaced with imports from `lib/types.ts`.

---

## Phase 2 — Auth Integration

This is the most architecturally significant phase. The mock login must be replaced with the real Google OAuth flow. Everything else in the app depends on a real JWT existing.

### 2.1 Modify the backend auth callback (backend change)

**File**: `backend/src/presentation/controllers/auth_controller.ts`

Currently the callback handler does:
```ts
return c.json({ token, user })
```

Change it to redirect to the frontend with the token in the URL:
```ts
const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000'
return c.redirect(`${frontendUrl}/auth/callback?token=${token}`)
```

Also add `FRONTEND_URL=http://localhost:3000` to `backend/.env`.

Why a redirect instead of JSON? Because the browser initiated the OAuth flow by navigating to the backend URL directly (not via `fetch`). The response is received by the browser's navigation engine, not JavaScript code. A redirect back to the frontend is the standard way to hand the token back to the SPA.

### 2.2 Create the frontend callback page

**File**: `frontend/app/auth/callback/page.tsx` (create new file and directories)

This page has one job: read the `?token=...` query parameter that the backend redirects to it, store the token, then redirect to the app.

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { storeToken, decodeToken } from '@/lib/auth'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      router.replace('/')
      return
    }
    const payload = decodeToken(token)
    if (!payload) {
      router.replace('/')
      return
    }
    storeToken(token)
    router.replace('/')
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  )
}
```

### 2.3 Update the login screen

**File**: `frontend/components/login-screen.tsx`

Replace the fake `login(role)` call with a real redirect to the backend:

```tsx
function handleGoogleLogin() {
  if (!selectedRole) return
  // Navigate the browser directly to the backend — this is a full redirect, not fetch
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?role=${selectedRole}`
}
```

The button's `onClick` calls `handleGoogleLogin()` instead of `login(selectedRole)`.

Remove the `useApp()` import (no longer needed in this component).

### 2.4 Restore session on app load

**File**: `frontend/lib/app-context.tsx`

On mount, check if a token exists in `localStorage`. If it does:
1. Decode it to get `userId` and `role`
2. Fetch the full user object from `GET /users/:id`
3. If the user is an OWNER, fetch their org from `GET /orgs/owner/:userId` to get `orgId`
4. Set `user` and `userOrgId` in state

If any step fails (e.g. token is expired and the API returns 401), the `apiClient` will auto-clear the token and reload.

```ts
// Inside AppProvider:
useEffect(() => {
  const token = getStoredToken()
  if (!token) return

  const payload = decodeToken(token)
  if (!payload) { clearToken(); return }

  apiClient.get<User>(`/users/${payload.userId}`)
    .then(async (user) => {
      setUser(user)
      if (user.role === 'OWNER') {
        const org = await apiClient.get<Org>(`/orgs/owner/${user.id}`)
        setUserOrgId(org.id)
      }
    })
    .catch(() => clearToken())
}, [])
```

### 2.5 Update logout

**File**: `frontend/lib/app-context.tsx`

The `logout` function must clear the stored token and reset state:

```ts
const logout = useCallback(() => {
  clearToken()
  setUser(null)
  setUserOrgId(null)
  setFacilities([])
  setApplications([])
  setApplicants([])
}, [])
```

### 2.6 Fix the default route in page.tsx

**File**: `frontend/app/page.tsx`

The current default view uses `user?.role === "owner"` — change to `"OWNER"`:
```tsx
const currentView = activeView || (user?.role === 'OWNER' ? 'dashboard' : 'facilities')
```

---

## Phase 3 — Data Layer Refactor

Replace every mock dataset in `AppContext` with real API calls. The goal is that after Phase 3, removing the `MOCK_FACILITIES`, `MOCK_APPLICANTS`, and `MOCK_APPLICATIONS` constants does not break anything.

### 3.1 Remove mock constants

**File**: `frontend/lib/app-context.tsx`

Delete the three `const MOCK_*` arrays entirely after the real data is wired in.

### 3.2 Fetch facilities

Facilities are fetched differently depending on role:
- **OWNER**: `GET /rcfs/org/:orgId` — fetch all RCFs for the owner's org
- **RP**: `GET /rcfs` — fetch all active RCFs (add a `GET /rcfs` endpoint to the backend that returns all active facilities, or use `GET /rcfs/org/:orgId/active` per org if needed)

> **Backend gap**: There is currently no `GET /rcfs` (list all) endpoint. The rcf controller has `GET /org/:orgId` and `GET /org/:orgId/active`. For the RP "Find RCFs" view, you need all active RCFs across all orgs. **Add `GET /rcfs/active`** to `rcf_controller.ts` that calls a new `rcfRepo.findAllActive()` method.

Add this fetch to `AppProvider` — call it after `user` is set:
```ts
// After user is set in the session restore useEffect:
if (user.role === 'OWNER' && orgId) {
  const rcfs = await apiClient.get<Facility[]>(`/rcfs/org/${orgId}`)
  setFacilities(rcfs)
} else if (user.role === 'RP') {
  const rcfs = await apiClient.get<Facility[]>('/rcfs/active')
  setFacilities(rcfs)
}
```

### 3.3 Fetch applicants (RP only)

**File**: `frontend/lib/app-context.tsx`

After user is set and role is RP:
```ts
const applicants = await apiClient.get<Applicant[]>(`/applicants/rp/${user.id}`)
setApplicants(applicants)
```

### 3.4 Fetch applications

- **OWNER**: For each facility, fetch `GET /applications/rcf/:rcfId`. Since an owner may have multiple RCFs, fetch for each and flatten. Alternatively, add `GET /applications/org/:orgId` to the backend — this would be cleaner.

> **Backend gap**: There is no `GET /applications/org/:orgId`. Consider adding it for efficiency. Without it, fetch per-RCF in parallel using `Promise.all`.

- **RP**: `GET /applications/rp/:rpId`

```ts
// OWNER:
const allApps = await Promise.all(
  facilities.map(f => apiClient.get<Application[]>(`/applications/rcf/${f.id}`))
)
setApplications(allApps.flat())

// RP:
const apps = await apiClient.get<Application[]>(`/applications/rp/${user.id}`)
setApplications(apps)
```

### 3.5 Wire actions to real API calls

Each function in `AppContext` that currently mutates local state must instead call the API and then update local state from the response:

| Function | API call | Notes |
|---|---|---|
| `updateFacilityStatus` | `PATCH /rcfs/:id` with `{ isActive, currentOpenings }` | Update local state with response DTO |
| `submitApplication` | `POST /applications` with `{ rcfId, applicantId }` | Append response to local `applications` |
| `createApplicant` | `POST /applicants` with `{ name, age, careNeeds }` (rpId comes from auth on server) | Append response to local `applicants` |
| `updateApplicationStatus` | `PATCH /applications/:id` with `{ status }` | Update in local `applications` array |
| `completeProfile` | `PATCH /users/:id` with `{ fullName, phone }` | Update local `user` |

---

## Phase 4 — Component Integration

With the context backed by real data, most components will work without changes (they just call `useApp()`). But a few components make API calls or navigate in ways that need updating.

### 4.1 Login screen

Already covered in Phase 2.3. The `login(role)` call is replaced by a full-page redirect to the backend auth URL.

The role selector UI stays the same — the role is passed as a query param to the backend.

### 4.2 Owner Dashboard

No component-level API calls needed. It reads from `useApp()` which is now backed by real data. Verify:
- `myFacilities` filters by `f.orgId === userOrgId` — this still works
- `myApplications` filters by checking `myFacilities.some(f => f.id === a.rcfId)` — this still works
- `pendingApplications` counts `status === "PENDING"` — unchanged
- `formatDistanceToNow(new Date(facility.updatedAt))` — `updatedAt` is now always a real ISO string from the DB

### 4.3 Owner Facilities

The "Update Status" modal currently calls `updateFacilityStatus(id, isActive, currentOpenings)`. After Phase 3.5, this calls `PATCH /rcfs/:id`. No component changes needed beyond verifying the action works end-to-end.

### 4.4 Owner Interests

Calls `updateApplicationStatus(id, "SUBMITTED")`. After Phase 3.5, this calls `PATCH /applications/:id`. No component changes needed.

### 4.5 Referrer Facilities

The Apply modal calls `submitApplication(rcfId, applicantId)` and optionally `createApplicant(name, age, careNeeds)` first. After Phase 3.5, these call `POST /applicants` then `POST /applications`. No component changes needed.

The search filter uses `f.address` — this now comes from real DB data. Verify search works.

The "Refresh" button currently just updates a `lastRefreshed` timestamp. After integration, wire it to re-fetch facilities:
```tsx
async function handleRefresh() {
  const rcfs = await apiClient.get<Facility[]>('/rcfs/active')
  // Need to expose a setFacilities or refreshFacilities from context
  setLastRefreshed(new Date())
}
```
Add a `refreshFacilities` function to `AppContext` that re-fetches and updates state.

### 4.6 Referrer Registrations

Reads applications from `useApp()`. No component changes needed after Phase 3.

### 4.7 Profile Page

Reads `user` from `useApp()`. No changes needed — `user` will now be the real user object from the API.

### 4.8 Profile Completion Modal

Calls `completeProfile({ fullName, phone })`. After Phase 3.5, this calls `PATCH /users/:id`. The modal is shown when `!user.profileCompleted`. 

> **Backend note**: The `User` entity and DB schema do not have a `profileCompleted` field — this is frontend-only. The simplest approach: treat `profileCompleted` as `user.phone !== null`. An RP without a phone number hasn't completed their profile. Update the AppContext session restore to derive `profileCompleted` from whether `phone` is set.

---

## Phase 5 — Loading and Error States

Without proper loading/error handling, the app will feel broken when API calls are slow or fail.

### 5.1 Add loading states to AppContext

**File**: `frontend/lib/app-context.tsx`

Add an `isLoading` boolean to the context. Set it `true` while the session restore effect is running (the initial data fetch), set it `false` when done. Components can use this to show a global spinner.

```ts
// In AppProvider:
const [isLoading, setIsLoading] = useState(true) // true until initial fetch completes

// At the end of the session restore useEffect:
setIsLoading(false)
```

**File**: `frontend/app/page.tsx`

Show a full-screen loading state while `isLoading` is true:
```tsx
if (isLoading) {
  return <div className="flex min-h-screen items-center justify-center">
    <p className="text-sm text-muted-foreground">Loading…</p>
  </div>
}
```

### 5.2 Add a toast error utility

The project already has `frontend/hooks/use-toast.ts`. Create a helper for API errors:

**File**: `frontend/lib/handle-error.ts` (create new file)

```ts
import { toast } from '@/hooks/use-toast'

export function handleApiError(e: unknown) {
  const message = e instanceof Error ? e.message : 'Something went wrong'
  toast({ title: 'Error', description: message, variant: 'destructive' })
}
```

Then in any action that calls the API, wrap with try/catch:
```ts
try {
  await apiClient.patch(...)
} catch (e) {
  handleApiError(e)
}
```

### 5.3 Per-action loading states

For buttons that trigger mutations (e.g. "Update Status", "Submit Application"), add a local `isSubmitting` state to disable the button and show a spinner while the API call is in flight:

```tsx
const [isSubmitting, setIsSubmitting] = useState(false)

async function handleSave() {
  setIsSubmitting(true)
  try {
    await updateFacilityStatus(id, isActive, currentOpenings)
    setEditingFacility(null)
  } catch (e) {
    handleApiError(e)
  } finally {
    setIsSubmitting(false)
  }
}

// On the button:
<Button disabled={isSubmitting} onClick={handleSave}>
  {isSubmitting ? 'Saving…' : 'Save'}
</Button>
```

---

## Phase 6 — File Uploads (Post-MVP)

File uploads are deferred until the core data flow is working. These require multipart form data and signed GCS URLs.

### 6.1 RCF form uploads

**Endpoint**: `POST /rcf-forms` (multipart)

The controller expects `multipart/form-data` with fields: `file` (File), `title` (string), `formType` (string), `contentType` (string).

Frontend implementation:
- Add a file upload section to `OwnerFacilities`
- Use a `<input type="file" accept=".pdf">` element
- On submit, build a `FormData` object and call `fetch` directly (not `apiClient`, which sends JSON)
- Show upload progress if possible

### 6.2 Application document uploads

**Endpoint**: `POST /application-documents` (multipart)

Similar to RCF forms. Add to a future "Application Detail" view.

---

## Backend Gaps to Address Before Integration

These are backend changes needed to support the frontend — they are not in the existing controllers:

| Gap | Solution |
|---|---|
| No `GET /rcfs/active` (all active RCFs across all orgs) | Add to `rcf_controller.ts` + `getRcfsByOrgId` equivalent on repo |
| `GET /auth/google/callback` returns JSON instead of redirecting | Change to `c.redirect(FRONTEND_URL/auth/callback?token=...)` |
| `profileCompleted` field does not exist on `User` in DB | Derive it in frontend: `profileCompleted = phone !== null` |
| No `GET /applications/org/:orgId` | Optional optimisation — use `Promise.all` per-RCF fetch as interim |

---

## Integration Order Summary

Execute in this order to always have a runnable app:

1. **Phase 1** — Setup (env vars, api-client, auth utility, types) — no visible change
2. **Phase 2.1** — Backend callback redirects to frontend — backend change only
3. **Phase 2.2–2.3** — Callback page + login redirect — real OAuth now works end-to-end
4. **Phase 2.4–2.5** — Session restore + logout — app can stay logged in on refresh
5. **Phase 3.1–3.4** — Remove mocks, fetch real data into context — app shows real DB data
6. **Phase 3.5** — Wire mutations to API — create/update/delete now persist
7. **Phase 4** — Component-level adjustments (refresh button, loading guards)
8. **Phase 5** — Loading + error states — app feels production-quality
9. **Phase 6** — File uploads — deferred

---

## File Map

Files to **create**:
```
frontend/
├── .env.local
├── lib/
│   ├── api-client.ts
│   ├── auth.ts
│   ├── types.ts
│   └── handle-error.ts
└── app/
    └── auth/
        └── callback/
            └── page.tsx
```

Files to **modify significantly**:
```
frontend/lib/app-context.tsx          — remove mocks, add API calls
frontend/components/login-screen.tsx  — redirect to backend auth URL
frontend/app/page.tsx                 — role check, loading state

backend/src/presentation/controllers/auth_controller.ts  — callback → redirect
backend/src/index.ts                                      — port 3001
backend/.env                                              — FRONTEND_URL
```

Files to **modify lightly** (loading/error state additions):
```
frontend/components/owner-facilities.tsx
frontend/components/referrer-facilities.tsx
frontend/components/profile-completion-modal.tsx
```
