import type { AuthPort } from '../../application/ports/auth-port';
import * as arctic from 'arctic';
import * as jose from 'jose';

export class GoogleOauthAdapter implements AuthPort {

    private clientId = process.env.GOOGLE_CLIENT_ID as string;
    private clientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
    private redirectUri = process.env.GOOGLE_REDIRECT_URI as string;
    private jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET as string);

    private google = new arctic.Google(this.clientId, this.clientSecret, this.redirectUri)

    async getGoogleAuthUrl(): Promise<{ url: string; state: string; codeVerifier: string }> {
        const state = arctic.generateState();
        const codeVerifier = arctic.generateCodeVerifier();
        const url = this.google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);
        return { url: url.toString(), state, codeVerifier };
    }
    async exchangeCodeForGoogleUser(code: string, codeVerifier: string): Promise<{ googleId: string; email: string; name: string; }> {
        try {
            const googleToken = await this.google.validateAuthorizationCode(code, codeVerifier);
            const idToken = googleToken.idToken();
            const claims = arctic.decodeIdToken(idToken) as { sub: string; email: string; name: string };
            return { googleId: claims.sub, email: claims.email, name: claims.name };
        } catch (e) {
            if (e instanceof arctic.OAuth2RequestError) {
                console.log(e.code, e.cause);
            }
            if (e instanceof arctic.ArcticFetchError) {
                console.log(e.message, e.cause);
            }
            throw e;
        }
    }
    async signToken(payload: { userId: string; role: string; }): Promise<string> {
        return await new jose.SignJWT({ userId: payload.userId, role: payload.role })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(this.jwtSecret)
    }

    async verifyToken(token: string): Promise<{ userId: string; role: string; }> {
        const { payload } = await jose.jwtVerify(token, this.jwtSecret);
        return { userId: payload.userId as string, role: payload.role as string };
    }

}