import { Hono } from 'hono';
import { applicationService } from '../../infrastructure/composition_root.ts';
import { Role } from '../../domain/entities/user.ts';
import { Status } from '../../domain/entities/application.ts';
import { authMiddleware } from '../middleware/auth_middleware.ts';
import type { AuthEnv } from '../middleware/auth_middleware.ts';
import { BusinessRuleError, ForbiddenError, NotFoundError } from '../../application/exceptions/app_errors.ts';

export const applicationController = new Hono<AuthEnv>();

applicationController.use('*', authMiddleware);

// POST / — create a new application
applicationController.post('/', async (c) => {
    const { rcfId, applicantId } = await c.req.json();
    const rpId = c.get('user').id;

    try {
        const result = await applicationService.createApplication({ rcfId, applicantId, rpId });
        return c.json(result, 201);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        if (e instanceof BusinessRuleError) return c.json({ code: e.code, message: e.message }, 422);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// POST /:id/submit — submit an application (RP only)
applicationController.post('/:id/submit', async (c) => {
    const applicationId = c.req.param('id');
    const requestingRpId = c.get('user').id;

    try {
        const result = await applicationService.submitApplication({ applicationId, requestingRpId });
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        if (e instanceof ForbiddenError) return c.json({ code: e.code, message: e.message }, 403);
        if (e instanceof BusinessRuleError) return c.json({ code: e.code, message: e.message }, 422);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// PATCH /:id/status — update application status (owner only)
applicationController.patch('/:id/status', async (c) => {
    const user = c.get('user');
    if (user.role !== Role.OWNER && user.role !== Role.ADMIN) {
        return c.json({ message: 'Forbidden' }, 403);
    }

    const applicationId = c.req.param('id');
    const { status, declineReason } = await c.req.json();

    const validStatuses = [Status.IN_REVIEW, Status.ACCEPTED, Status.DECLINED];
    if (!validStatuses.includes(status)) {
        return c.json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, 422);
    }


    try {
        const result = await applicationService.updateApplicationStatus({ applicationId, status, declineReason });
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        if (e instanceof BusinessRuleError) return c.json({ code: e.code, message: e.message }, 422);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /rcf/:rcfId — list applications for an RCF
applicationController.get('/rcf/:rcfId', async (c) => {
    const rcfId = c.req.param('rcfId');

    try {
        const result = await applicationService.getApplicationsByRcfId(rcfId);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /rp/:rpId/rcf/:rcfId — list applications for an RP filtered by RCF
applicationController.get('/rp/:rpId/rcf/:rcfId', async (c) => {
    const user = c.get('user');
    const rpId = c.req.param('rpId');
    const rcfId = c.req.param('rcfId');

    const isAdmin = user.role === Role.ADMIN;
    if (!isAdmin && user.id !== rpId) {
        return c.json({ message: 'Forbidden' }, 403);
    }

    try {
        const result = await applicationService.getApplicationsByRpIdAndRcfId(rpId, rcfId);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /rp/:rpId — list applications for an RP
applicationController.get('/rp/:rpId', async (c) => {
    const user = c.get('user');
    const rpId = c.req.param('rpId');

    const isAdmin = user.role === Role.ADMIN;
    if (!isAdmin && user.id !== rpId) {
        return c.json({ message: 'Forbidden' }, 403);
    }

    try {
        const result = await applicationService.getApplicationsByRpId(rpId);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /applicant/:applicantId — list applications for an applicant
applicationController.get('/applicant/:applicantId', async (c) => {
    const applicantId = c.req.param('applicantId');

    try {
        const result = await applicationService.getApplicationsByApplicantId(applicantId);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /:id — get application by ID
applicationController.get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const result = await applicationService.getApplicationById(id);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// DELETE /:id — delete an application (RP only)
applicationController.delete('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    try {
        const deleted = await applicationService.deleteApplication(id, user.id);
        return c.json(deleted);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        if (e instanceof ForbiddenError) return c.json({ code: e.code, message: e.message }, 403);
        return c.json({ message: 'Internal server error' }, 500);
    }
});
