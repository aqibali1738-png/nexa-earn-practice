import { createApiRouter } from '../src/server/api';
import { getRequestListener } from '@hono/node-server';

export const config = {
  // Edge runtime for ultra-fast, low-latency execution on Vercel
  runtime: 'edge',
};

const app = createApiRouter();

/**
 * Universal Vercel Handler:
 * Supports both Vercel Edge Runtime (standard Request/Response)
 * and Node.js Serverless runtime (req: IncomingMessage, res: ServerResponse).
 */
export default async function handler(req: any, res?: any) {
  // If invoked in Web Standard environment (Vercel Edge or fetch-based invocation)
  if (req instanceof Request || (!res && req?.headers)) {
    const url = new URL(req.url);
    const matchedPath = req.headers.get('x-matched-path') || req.headers.get('x-invoke-path');
    if (matchedPath && matchedPath !== url.pathname) {
      url.pathname = matchedPath;
      return app.fetch(new Request(url.toString(), req));
    }
    return app.fetch(req);
  }

  // If invoked in Node.js Serverless environment
  const nodeListener = getRequestListener(app.fetch);
  return nodeListener(req, res);
}
