export interface AuthPort {
    getGoogleAuthUrl(state: string): Promise<{ url: string; codeVerifier: string }>;
    exchangeCodeForGoogleUser(code: string, codeVerifier: string): Promise<{ googleId: string; email: string; name: string }>;
    signToken(payload: { userId: string; role: string }): Promise<string>;
    verifyToken(token: string): Promise<{ userId: string; role: string }>;
}