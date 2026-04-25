import type { Context } from 'hono';
import {
    ApplicationError,
    NotFoundError,
    ForbiddenError,
    BusinessRuleError,
    ConflictError,
} from '../../application/exceptions/app_errors.ts';

export const errorHandler = (err: Error, c: Context) => {
    if (err instanceof NotFoundError) return c.json({ code: err.code, message: err.message }, 404);
    if (err instanceof ForbiddenError) return c.json({ code: err.code, message: err.message }, 403);
    if (err instanceof BusinessRuleError) return c.json({ code: err.code, message: err.message }, 422);
    if (err instanceof ConflictError) return c.json({ code: err.code, message: err.message }, 409);
    if (err instanceof ApplicationError) return c.json({ code: err.code, message: err.message }, 500);
    return c.json({ message: 'Internal server error' }, 500);
};
