import { Hono } from 'hono';
import { orgService } from '../../infrastructure/composition_root.ts';
import { authMiddleware } from '../middleware/auth_middleware.ts';
import type { AuthEnv } from '../middleware/auth_middleware.ts';
import { ConflictError, NotFoundError } from '../../application/exceptions/app_errors.ts';

export const orgController = new Hono<AuthEnv>();

orgController.use('*', authMiddleware);

// POST / — create an organization
orgController.post('/', async (c) => {
    const { name } = await c.req.json();
    const ownerId = c.get('user').id;

    try {
        const result = await orgService.createOrg({ ownerId, name });
        return c.json(result, 201);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        if (e instanceof ConflictError) return c.json({ code: e.code, message: e.message }, 409);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /owner/:ownerId — get organization by owner ID
orgController.get('/owner/:ownerId', async (c) => {
    const ownerId = c.req.param('ownerId');

    try {
        const result = await orgService.getOrgByOwnerId(ownerId);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /:id — get organization by ID
orgController.get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const result = await orgService.getOrgById(id);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// PATCH /:id — update an organization
orgController.patch('/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();

    try {
        const result = await orgService.updateOrg(id, body);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// DELETE /:id — delete an organization
orgController.delete('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const deleted = await orgService.deleteOrg(id);
        return c.json(deleted);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});
