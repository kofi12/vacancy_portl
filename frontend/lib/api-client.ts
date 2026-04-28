const RAW_BASE_URL = process.env.NEXT_PUBLIC_API_URL

if (!RAW_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined")
}

const BASE_URL = RAW_BASE_URL.replace(/\/$/, "")

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

function clearTokenAndRedirect() {
  if (typeof window === "undefined") return

  localStorage.removeItem("token")
  window.location.href = "/"
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function parseResponse(res: Response) {
  const text = await res.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await parseResponse(res)

  if (res.status === 401) {
    clearTokenAndRedirect()
    throw new ApiError(401, "AUTH_UNAUTHORIZED", "Session expired")
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.code ?? "UNKNOWN",
      data?.message ?? `Request failed with status ${res.status}`,
    )
  }

  return data as T
}

async function requestForm<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  })

  const data = await parseResponse(res)

  if (res.status === 401) {
    clearTokenAndRedirect()
    throw new ApiError(401, "AUTH_UNAUTHORIZED", "Session expired")
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.code ?? "UNKNOWN",
      data?.message ?? `Request failed with status ${res.status}`,
    )
  }

  return data as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  postForm: <T>(path: string, formData: FormData) =>
    requestForm<T>(path, formData),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
}