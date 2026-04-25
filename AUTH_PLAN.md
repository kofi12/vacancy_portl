# Plan: Auth Implementation

## Context
The backend has no auth yet. `infrastructure/auth/` is empty. `arctic` (v3.7) and `jose` (v6.2) are already installed. `AuthPort` is defined. A misplaced stub (`application/services/auth_adapter.ts`) needs to be deleted — it belongs in `infrastructure/auth/`. The goal is full Google OAuth + stateless JWT using the existing port/adapter pattern.

---

## Reusable Existing Code
- `application/ports/auth-port.ts` — `AuthPort` interface (already correct, no changes needed)
- `domain/entities/user.ts` — `User.createFromGoogle(role, fullName, email, phone, authSubject)` and `User.reconstitute()`
- `application/services/user_service.ts` — `createUserFromGoogle()` already exists; **do not call it from AuthService** — call the repo directly to avoid double-wrapping
- `infrastructure/composition_root.ts` — existing wiring pattern to follow
- `application/exceptions/app_errors.ts` — extend with 3 new codes

---

## Step 1: Delete misplaced stub
Delete `backend/src/application/services/auth_adapter.ts` — it's in the wrong layer.

---

## Step 2: Add `findByAuthSubject` to UserRepo
**`domain/repositories/user_repo.ts`**
Add to interface:
```ts
findByAuthSubject(authSubject: string): Promise<User | null>
```

**`infrastructure/persistence/repositories/user_infra.ts`**
Implement it:
```ts
async findByAuthSubject(authSubject: string): Promise<User | null> {
    const user = await prisma.user.findFirst({ where: { authSubject } })
    return user ? UserMapper.toDomain(user) : null
}
```

---

## Step 3: Add auth error codes
**`application/exceptions/app_errors.ts`** — add to `AppErrorCode` enum and wire to subclasses:
- `AUTH_INVALID_STATE = "AUTH_INVALID_STATE"` → `BusinessRuleError`
- `AUTH_INVALID_TOKEN = "AUTH_INVALID_TOKEN"` → `ForbiddenError`
- `AUTH_UNAUTHORIZED = "AUTH_UNAUTHORIZED"` → `ForbiddenError`

---

## Step 4: Create the OAuth adapter
**`infrastructure/auth/google_oauth_adapter.ts`** — implements `AuthPort`

Constructor reads from env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `JWT_SECRET`

- `getGoogleAuthUrl()` — uses `arctic` `Google` class + `generateState()`; returns `{ url, state }`
- `exchangeCodeForGoogleUser(code)` — exchanges code for tokens via arctic; decodes Google ID token to extract `sub`, `email`, `name`; returns `{ googleId, email, name }`
- `signToken(payload)` — `jose` `SignJWT`, `HS256`, 7-day expiry, signs with `JWT_SECRET`
- `verifyToken(token)` — `jose` `jwtVerify`; returns `{ userId, role }`

---

## Step 5: Create AuthService
**`application/services/auth_service.ts`**

Dependencies (injected): `UserRepo`, `AuthPort`

Methods (stubs only per project convention):
- `initiateGoogleLogin(role: string): Promise<{ url: string; encodedState: string }>`
  - Calls `authPort.getGoogleAuthUrl()`
  - Encodes state as base64 JSON: `{ nonce: state, role }` — controller stores `nonce` in cookie and passes full encoded state to Google
- `handleGoogleCallback(code: string, encodedState: string, storedNonce: string): Promise<{ token: string; user: UserResponseDto }>`
  - Decodes `encodedState`, verifies `nonce === storedNonce` → throw `AUTH_INVALID_STATE` if mismatch
  - Calls `authPort.exchangeCodeForGoogleUser(code)` → `{ googleId, email, name }`
  - Calls `userRepo.findByAuthSubject(googleId)` — if found, skip creation
  - If not found: calls `User.createFromGoogle(role, name, email, null, googleId)` + `userRepo.create(user)`
  - Calls `authPort.signToken({ userId: user.id, role: user.role })` → JWT
  - Returns `{ token, user: toResponseDto(user) }`

Error pattern: catch domain exceptions → throw matching `ApplicationError`; pass through `ApplicationError`; catch-all → `UnexpectedError`.

---

## Step 6: Auth middleware
**`presentation/middleware/auth_middleware.ts`** — Hono `createMiddleware`:
- Reads `Authorization: Bearer <token>` header
- Calls `authAdapter.verifyToken(token)` → throws `ForbiddenError(AUTH_INVALID_TOKEN)` on failure
- Calls `userRepo.findById(payload.userId)` → throws `ForbiddenError(AUTH_UNAUTHORIZED)` if null
- Sets `c.set('user', user)` — controllers read `c.get('user')`

---

## Step 7: Auth controller
**`presentation/controllers/auth_controller.ts`** — `new Hono()` instance

`GET /auth/google?role=<role>`
- Reads `role` query param (default `"RP"` if missing)
- Calls `authService.initiateGoogleLogin(role)` → `{ url, encodedState }`
- Sets `oauth_state` cookie = the nonce (httpOnly, sameSite=lax, maxAge=600)
- Returns `c.redirect(url)`, passing `encodedState` to Google as `state`

`GET /auth/google/callback`
- Reads `code` + `state` from query params
- Reads `oauth_state` cookie (the stored nonce)
- Calls `authService.handleGoogleCallback(code, state, storedNonce)`
- Clears `oauth_state` cookie
- Returns `{ token, user }` as JSON

---

## Step 8: Wire composition root + index
**`infrastructure/composition_root.ts`**
```ts
export const authAdapter = new GoogleOAuthAdapter()
export const authService = new AuthService(userRepo, authAdapter)
```

**`src/index.ts`**
```ts
import { authController } from './presentation/controllers/auth_controller.ts'
app.route('/auth', authController)
```

---

## Files to Create
| File | Purpose |
|------|---------|
| `infrastructure/auth/google_oauth_adapter.ts` | Implements `AuthPort` with arctic + jose |
| `application/services/auth_service.ts` | `initiateGoogleLogin` + `handleGoogleCallback` |
| `presentation/middleware/auth_middleware.ts` | JWT verification + user hydration |
| `presentation/controllers/auth_controller.ts` | Two OAuth routes |

## Files to Modify
| File | Change |
|------|--------|
| `domain/repositories/user_repo.ts` | Add `findByAuthSubject` to interface |
| `infrastructure/persistence/repositories/user_infra.ts` | Implement `findByAuthSubject` |
| `application/exceptions/app_errors.ts` | Add 3 auth error codes |
| `infrastructure/composition_root.ts` | Wire `authAdapter` + `authService` |
| `src/index.ts` | Mount auth controller |

## Files to Delete
| File | Reason |
|------|--------|
| `application/services/auth_adapter.ts` | Wrong layer — infrastructure belongs in `infrastructure/auth/` |

## Env Vars (add to `backend/.env`)
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
JWT_SECRET=
```

---

## Verification
1. Start Postgres + backend: `docker-compose up -d postgres && npm run dev`
2. `GET http://localhost:3000/auth/google?role=RP` — should redirect to Google consent screen
3. Complete Google sign-in — callback should return `{ token, user }` JSON
4. Sign in again with same Google account — same `user.id` returned, no duplicate created
5. `GET http://localhost:3000/users/me` with `Authorization: Bearer <token>` — should return the user
6. Same route with an invalid token — should return `403`
