import { Hono } from 'hono';
import { rcfService } from '../../infrastructure/composition_root.ts';
import { authMiddleware } from '../middleware/auth_middleware.ts';
import type { AuthEnv } from '../middleware/auth_middleware.ts';
import { ConflictError, NotFoundError } from '../../application/exceptions/app_errors.ts';

export const rcfController = new Hono<AuthEnv>();

rcfController.use('*', authMiddleware);

// POST / — create an RCF
rcfController.post('/', async (c) => {
    const body = await c.req.json();

    try {
        const result = await rcfService.createRcf(body);
        return c.json(result, 201);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        if (e instanceof ConflictError) return c.json({ code: e.code, message: e.message }, 409);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /org/:orgId/active — list active RCFs with openings for an org
rcfController.get('/org/:orgId/active', async (c) => {
    const orgId = c.req.param('orgId');

    try {
        const result = await rcfService.getActiveRcfsWithOpeningsByOrgId(orgId);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /org/:orgId — list all RCFs for an org
rcfController.get('/org/:orgId', async (c) => {
    const orgId = c.req.param('orgId');

    try {
        const result = await rcfService.getRcfsByOrgId(orgId);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /:id — get RCF by ID
rcfController.get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const result = await rcfService.getRcfById(id);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// PATCH /:id — update an RCF
rcfController.patch('/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();

    try {
        const result = await rcfService.updateRcf(id, body);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        if (e instanceof ConflictError) return c.json({ code: e.code, message: e.message }, 409);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// DELETE /:id — delete an RCF
rcfController.delete('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const deleted = await rcfService.deleteRcf(id);
        return c.json(deleted);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});
