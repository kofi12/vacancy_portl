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

// Decode JWT payload without verifying signature — server always verifies.
// Used only to read userId and role on the client.
export function decodeToken(token: string): { userId: string; role: string } | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}
