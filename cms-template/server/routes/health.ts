import { Hono } from 'hono';
import { db } from '../db/index.js';

export const healthRoutes = new Hono();

healthRoutes.get('/health', (c) => {
  try {
    db.prepare('SELECT 1').get();
    return c.json({ status: 'ok', db: 'ok', ts: Date.now() });
  } catch (err) {
    return c.json(
      { status: 'error', db: 'fail', error: (err as Error).message },
      503,
    );
  }
});
