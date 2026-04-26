import { Hono } from 'hono';
import { rcfFormService, storageAdapter } from '../../infrastructure/composition_root.ts';
import { authMiddleware } from '../middleware/auth_middleware.ts';
import type { AuthEnv } from '../middleware/auth_middleware.ts';
import { NotFoundError } from '../../application/exceptions/app_errors.ts';
import type { TemplateType, ContentType } from '../../domain/entities/rcf_form.ts';

export const rcfFormController = new Hono<AuthEnv>();

rcfFormController.use('*', authMiddleware);

// POST / — upload and create an RCF form (multipart)
rcfFormController.post('/', async (c) => {
    const body = await c.req.parseBody();
    const file = body['file'] as File;
    const rcfId = body['rcfId'] as string;
    const title = body['title'] as string;
    const formType = body['formType'] as TemplateType;
    const contentType = body['contentType'] as ContentType;

    const storageKey = `rcf-forms/${rcfId}/${crypto.randomUUID()}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
        await storageAdapter.upload(storageKey, buffer, contentType as string);
        const result = await rcfFormService.createRcfForm({
            rcfId,
            fileName: file.name,
            title,
            formType,
            contentType,
            storageKey,
        });
        return c.json(result, 201);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /rcf/:rcfId — list forms for an RCF
rcfFormController.get('/rcf/:rcfId', async (c) => {
    const rcfId = c.req.param('rcfId');

    try {
        const result = await rcfFormService.getRcfFormsByRcfId(rcfId);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /:id — get RCF form by ID
rcfFormController.get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const result = await rcfFormService.getRcfFormById(id);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /:id/download — get signed download URL for an RCF form
rcfFormController.get('/:id/download', async (c) => {
    const id = c.req.param('id');

    try {
        const url = await rcfFormService.getDownloadUrl(id);
        return c.json({ url });
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// DELETE /:id — delete an RCF form
rcfFormController.delete('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const deleted = await rcfFormService.deleteRcfForm(id);
        return c.json(deleted);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});
