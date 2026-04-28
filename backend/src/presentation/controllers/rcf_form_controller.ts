import { Hono } from 'hono';
import { rcfFormService, storageAdapter } from '../../infrastructure/composition_root.ts';
import { authMiddleware } from '../middleware/auth_middleware.ts';
import type { AuthEnv } from '../middleware/auth_middleware.ts';
import { NotFoundError } from '../../application/exceptions/app_errors.ts';
import { StorageError } from '../../infrastructure/storage/storage_error.ts';
import type { TemplateType, ContentType } from '../../domain/entities/rcf_form.ts';

const MIME_MAP: Record<string, string> = {
    PDF: 'application/pdf',
    JSON: 'application/json',
    ZIP: 'application/zip',
    MULTIPART: 'multipart/form-data',
};

export const rcfFormController = new Hono<AuthEnv>();

rcfFormController.use('*', authMiddleware);

rcfFormController.post('/', async (c) => {
    const body = await c.req.parseBody();
    const file = body['file'];
    const rcfId = body['rcfId'] as string;
    const title = body['title'] as string;
    const formType = body['formType'] as TemplateType;
    const contentType = body['contentType'] as ContentType;

    if (!file || typeof file === 'string') {
        return c.json({ message: 'Missing or invalid file field' }, 400);
    }

    try {
        const storageKey = `rcf-forms/${rcfId}/${crypto.randomUUID()}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = MIME_MAP[contentType as string] ?? 'application/octet-stream';
        await storageAdapter.upload(storageKey, buffer, mimeType);
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
        if (e instanceof StorageError) return c.json({ message: 'Storage error: ' + e.message }, 500);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

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
