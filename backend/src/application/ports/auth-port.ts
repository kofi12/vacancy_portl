export interface AuthPort {
    getGoogleAuthUrl(): Promise<{ url: string; state: string; codeVerifier: string }>;
    exchangeCodeForGoogleUser(code: string): Promise<{ googleId: string; email: string; name: string }>;
    signToken(payload: { userId: string; role: string }): Promise<string>;
    verifyToken(token: string): Promise<{ userId: string; role: string }>;
}