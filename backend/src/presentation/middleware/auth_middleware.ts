import { createMiddleware } from 'hono/factory';
import type { User } from '../../domain/entities/user.ts';
import { authAdapter, userRepo } from '../../infrastructure/composition_root.ts';

export type AuthEnv = {
    Variables: {
        user: User;
    };
};

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) return c.json({ message: 'Unauthorized' }, 403);

    try {
        const { userId } = await authAdapter.verifyToken(token);
        const user = await userRepo.findById(userId);
        c.set('user', user);
        await next();
    } catch (e) {
        return c.json({ message: 'Unauthorized' }, 403);
    }
});
