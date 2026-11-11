import type { RequestHandler } from 'msw';

// Default handlers per domain are added here as the API client grows; tests override with server.use().
export const handlers: RequestHandler[] = [];
