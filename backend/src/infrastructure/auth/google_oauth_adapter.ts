import type { AuthPort } from '../../application/ports/auth-port';
import * as arctic from 'arctic';

export class GoogleOauthAdapter implements AuthPort {

    private clientId = process.env.GOOGLE_CLIENT_ID as string;
    private clientSecret = process.env.GOOGLE_SECRET as string;
    private redirectUri = process.env.GOOGLE_REDIRECT_URI as string;

    private google = new arctic.Google(this.clientId, this.clientSecret, this.redirectUri)

    async getGoogleAuthUrl(): Promise<{ url: string; state: string; codeVerifier: string }> {
        const state = arctic.generateState();
        const codeVerifier = arctic.generateCodeVerifier();
        const url = this.google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);
        return { url: url.toString(), state, codeVerifier };
    }
    exchangeCodeForGoogleUser(code: string): Promise<{ googleId: string; email: string; name: string; }> {
        throw new Error('Method not implemented.');
    }
    signToken(payload: { userId: string; role: string; }): Promise<string> {
        throw new Error('Method not implemented.');
    }
    verifyToken(token: string): Promise<{ userId: string; role: string; }> {
        throw new Error('Method not implemented.');
    }

}