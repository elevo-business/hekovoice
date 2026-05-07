import { Hono } from 'hono';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADMIN_DIR = join(__dirname, '..', 'admin-ui');

const indexHtml = readFileSync(join(ADMIN_DIR, 'index.html'), 'utf8');
const appJs = readFileSync(join(ADMIN_DIR, 'app.js'), 'utf8');
const stylesCss = readFileSync(join(ADMIN_DIR, 'styles.css'), 'utf8');

export const adminRoutes = new Hono();

adminRoutes.get('/app.js', (c) => {
  c.header('Content-Type', 'text/javascript; charset=utf-8');
  c.header('Cache-Control', 'no-cache');
  return c.body(appJs);
});

adminRoutes.get('/styles.css', (c) => {
  c.header('Content-Type', 'text/css; charset=utf-8');
  c.header('Cache-Control', 'no-cache');
  return c.body(stylesCss);
});

adminRoutes.get('*', (c) => {
  c.header('Content-Type', 'text/html; charset=utf-8');
  c.header('Cache-Control', 'no-store');
  c.header('X-Frame-Options', 'DENY');
  return c.body(indexHtml);
});
