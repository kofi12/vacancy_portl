import { Hono } from 'hono';
import { userService } from '../../infrastructure/composition_root.ts';
import { authMiddleware } from '../middleware/auth_middleware.ts';
import type { AuthEnv } from '../middleware/auth_middleware.ts';
import { NotFoundError } from '../../application/exceptions/app_errors.ts';

export const userController = new Hono<AuthEnv>();

userController.use('*', authMiddleware);

// POST / — create a user
userController.post('/', async (c) => {
    const body = await c.req.json();

    try {
        const result = await userService.createUser(body);
        return c.json(result, 201);
    } catch (e) {
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /email/:email — get user by email
userController.get('/email/:email', async (c) => {
    const email = c.req.param('email');

    try {
        const result = await userService.getUserByEmail(email);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /:id — get user by ID
userController.get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const result = await userService.getUserById(id);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// PATCH /:id — update a user
userController.patch('/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();

    try {
        const result = await userService.updateUser(id, body);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// DELETE /:id — delete a user
userController.delete('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const deleted = await userService.deleteUser(id);
        return c.json(deleted);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});
