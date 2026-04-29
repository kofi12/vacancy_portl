import { Hono } from 'hono';
import { applicationDocumentService, storageAdapter } from '../../infrastructure/composition_root.ts';
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

export const applicationDocumentController = new Hono<AuthEnv>();

applicationDocumentController.use('*', authMiddleware);

// POST / — upload and create an application document (multipart)
applicationDocumentController.post('/', async (c) => {
    const body = await c.req.parseBody();
    const file = body['file'];
    const applicationId = body['applicationId'] as string;
    const type = body['type'] as TemplateType;
    const contentType = body['contentType'] as ContentType;

    if (!file || typeof file === 'string') {
        return c.json({ message: 'Missing or invalid file field' }, 400);
    }

    try {
        const storageKey = `application-documents/${applicationId}/${crypto.randomUUID()}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = MIME_MAP[contentType as string] ?? 'application/octet-stream';
        await storageAdapter.upload(storageKey, buffer, mimeType);
        const result = await applicationDocumentService.uploadDocument({
            applicationId,
            type,
            originalFileName: file.name,
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

// GET /application/:applicationId — list documents for an application
applicationDocumentController.get('/application/:applicationId', async (c) => {
    const applicationId = c.req.param('applicationId');

    try {
        const result = await applicationDocumentService.getDocumentsByApplicationId(applicationId);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /:id — get document by ID
applicationDocumentController.get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const result = await applicationDocumentService.getDocumentById(id);
        return c.json(result);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// GET /:id/download — get signed download URL for a document
applicationDocumentController.get('/:id/download', async (c) => {
    const id = c.req.param('id');

    try {
        const url = await applicationDocumentService.getDownloadUrl(id);
        return c.json({ url });
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});

// DELETE /:id — delete a document
applicationDocumentController.delete('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const deleted = await applicationDocumentService.deleteDocument(id);
        return c.json(deleted);
    } catch (e) {
        if (e instanceof NotFoundError) return c.json({ code: e.code, message: e.message }, 404);
        return c.json({ message: 'Internal server error' }, 500);
    }
});
