import { authService } from '../../infrastructure/composition_root.ts';
import { Hono } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';

export const authController = new Hono();

authController.get('/google', async (c) => {
    const role = c.req.query('role') ?? 'RP';
    const { url, nonce, codeVerifier } = await authService.initiateGoogleLogin(role);
    setCookie(c, 'oauth_nonce', nonce, { httpOnly: true, sameSite: 'Lax', maxAge: 600 });
    setCookie(c, 'code_verifier', codeVerifier, { httpOnly: true, sameSite: 'Lax', maxAge: 600 });
    return c.redirect(url);
});

authController.get('/google/callback', async (c) => {
    const { code, state: encodedState } = c.req.query();
    const storedNonce = getCookie(c, 'oauth_nonce');
    const codeVerifier = getCookie(c, 'code_verifier');
    deleteCookie(c, 'oauth_nonce');
    deleteCookie(c, 'code_verifier');
    const result = await authService.handleGoogleCallback(
        code,
        codeVerifier as string,
        encodedState,
        storedNonce as string,
    );
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    return c.redirect(`${frontendUrl}/auth/callback?token=${result.token}`);
});
