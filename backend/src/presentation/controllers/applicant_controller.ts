import { Hono } from 'hono';
import { applicantService } from '../../infrastructure/composition_root.ts';
import { Role } from '../../domain/entities/user.ts';
import { authMiddleware } from '../middleware/auth_middleware.ts';
import type { AuthEnv } from '../middleware/auth_middleware.ts';
import { ForbiddenError, NotFoundError } from '../../application/exceptions/app_errors.ts';

export const applicantController = new Hono<AuthEnv>();

applicantController.use('*', authMiddleware);

// POST / — create a new applicant
applicantController.post('/', async (c) => {
    const { name } = await c.req.json();
    const rpId = c.get('user').id;

    try {
        const result = await applicantService.createApplicant({ rpId, name });
        return c.json(result, 201);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /rp/:rpId — list applicants for an RP
applicantController.get('/rp/:rpId', async (c) => {
    const user = c.get('user');
    const rpId = c.req.param('rpId');

    const isAdmin = user.role === Role.ADMIN;
    if (!isAdmin && user.id !== rpId) {
        return c.json({ message: 'Forbidden' }, 403);
    }

    try {
        const result = await applicantService.getApplicantsByRpId(rpId);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /:id — get applicant by ID
applicantController.get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const result = await applicantService.getApplicantById(id);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// PATCH /:id — update an applicant (owner RP only)
applicantController.patch('/:id', async (c) => {
    const id = c.req.param('id');
    const requestingRpId = c.get('user').id;
    const body = await c.req.json();

    try {
        const result = await applicantService.updateApplicant(id, requestingRpId, body);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        if (e instanceof ForbiddenError) return c.json({ code: e.code, message: e.message }, 403);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// DELETE /:id — delete an applicant (owner RP only)
applicantController.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const requestingRpId = c.get('user').id;

    try {
        const deleted = await applicantService.deleteApplicant(id, requestingRpId);
        return c.json(deleted);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        if (e instanceof ForbiddenError) return c.json({ code: e.code, message: e.message }, 403);
        return c.json({ message: 'Internal server error' }, 500);
    }
});
