import { handle } from 'hono/cloudflare-pages';
import { createApiRouter } from '../../src/server/api';

const app = createApiRouter();

// Cloudflare Pages Functions entry point for all /api/* routes
export const onRequest = handle(app);
