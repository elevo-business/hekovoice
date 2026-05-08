import { Hono } from 'hono';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADMIN_DIR = join(__dirname, '..', 'admin-ui');

const indexHtmlRaw = readFileSync(join(ADMIN_DIR, 'index.html'), 'utf8');
const appJs = readFileSync(join(ADMIN_DIR, 'app.js'), 'utf8');
const stylesCss = readFileSync(join(ADMIN_DIR, 'styles.css'), 'utf8');

function loadAlpine(): string {
  const candidates = [
    resolve(process.cwd(), 'node_modules/alpinejs/dist/cdn.min.js'),
    resolve(__dirname, '..', '..', 'node_modules/alpinejs/dist/cdn.min.js'),
    resolve(__dirname, '..', '..', '..', 'node_modules/alpinejs/dist/cdn.min.js'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return readFileSync(p, 'utf8');
  }
  console.error('[admin] alpine.min.js not found in node_modules — check Dockerfile');
  return '/* alpinejs missing */';
}

const alpineJs = loadAlpine();

// Cache-bust admin assets per server boot. Hash of the bundled JS/CSS so the
// browser always fetches fresh code after a deploy.
const ASSET_VERSION = createHash('sha1')
  .update(appJs)
  .update(stylesCss)
  .update(alpineJs)
  .digest('hex')
  .slice(0, 10);

const indexHtml = indexHtmlRaw.replaceAll('{{ASSET_VERSION}}', ASSET_VERSION);

export const adminRoutes = new Hono();

adminRoutes.get('/app.js', (c) => {
  c.header('Content-Type', 'text/javascript; charset=utf-8');
  c.header('Cache-Control', 'no-store, must-revalidate');
  return c.body(appJs);
});

adminRoutes.get('/alpine.min.js', (c) => {
  c.header('Content-Type', 'text/javascript; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=31536000, immutable');
  return c.body(alpineJs);
});

adminRoutes.get('/styles.css', (c) => {
  c.header('Content-Type', 'text/css; charset=utf-8');
  c.header('Cache-Control', 'no-store, must-revalidate');
  return c.body(stylesCss);
});

adminRoutes.get('*', (c) => {
  c.header('Content-Type', 'text/html; charset=utf-8');
  c.header('Cache-Control', 'no-store, must-revalidate');
  c.header('X-Frame-Options', 'DENY');
  return c.body(indexHtml);
});
