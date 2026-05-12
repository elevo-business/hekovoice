import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { env, isProd } from './config.js';
// Importing the db module also runs migrations (eager init).
import './db/index.js';
import { purgeExpiredSessions } from './auth/sessions.js';
import { seedInitialContent } from './lib/seed-content.js';
import { seedInitialUser } from './lib/seed-user.js';
import { authRoutes } from './routes/auth.js';
import { healthRoutes } from './routes/health.js';
import { publicRoutes } from './routes/public.js';
import { sectionsRoutes } from './routes/sections.js';
import { settingsRoutes } from './routes/settings.js';
import { mediaRoutes } from './routes/media.js';
import { usersRoutes } from './routes/users.js';
import { uploadsRoutes } from './routes/uploads.js';
import { backupRoutes } from './routes/backup.js';
import { adminRoutes } from './routes/admin.js';

purgeExpiredSessions();
setInterval(purgeExpiredSessions, 60 * 60 * 1000).unref();

// Bootstrap admin user from ADMIN_EMAIL/ADMIN_PASSWORD if missing.
try {
  await seedInitialUser();
} catch (err) {
  console.error('[seed-user] failed:', err);
}

// Auto-seed sections from bundled index.html / termin.html on first boot.
// No-op once any page has sections — admin can edit freely afterwards.
try {
  seedInitialContent();
} catch (err) {
  console.error('[seed-content] failed:', err);
}

const app = new Hono();

app.use('*', logger());

// API
app.route('/api', healthRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/sections', sectionsRoutes);
app.route('/api/settings', settingsRoutes);
app.route('/api/media', mediaRoutes);
app.route('/api/users', usersRoutes);
app.route('/api/backup', backupRoutes);

// Static: uploaded media
app.route('/uploads', uploadsRoutes);

// Admin SPA (HTML + assets)
app.route('/admin', adminRoutes);

// Public site
app.route('/', publicRoutes);

app.notFound((c) => {
  const accept = c.req.header('accept') ?? '';
  if (accept.includes('text/html')) {
    return c.html('<!doctype html><meta charset="utf-8"><title>404</title><h1>404</h1><p>Seite nicht gefunden.</p>', 404);
  }
  return c.json({ error: 'not_found' }, 404);
});

app.onError((err, c) => {
  console.error('[error]', err);
  return c.json(
    { error: 'internal', message: isProd ? undefined : err.message },
    500,
  );
});

const port = env.PORT;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[server] listening on http://localhost:${info.port}`);
});
