import { cors } from 'hono/cors';

export const corsMiddleware = cors({
    origin: process.env.CORS_ORIGIN ?? ['http://localhost:3000', 'https://vacancy-portl.vercel.app/'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
});
