import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { serve } from '@hono/node-server';
import { env, isProd } from './config.js';
import { runMigrations } from './db/index.js';
import { purgeExpiredSessions } from './auth/sessions.js';
import { authRoutes } from './routes/auth.js';
import { healthRoutes } from './routes/health.js';
import { requireAuth } from './middleware/auth.js';

runMigrations();
purgeExpiredSessions();
setInterval(purgeExpiredSessions, 60 * 60 * 1000).unref();

const app = new Hono();

app.use('*', logger());
app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
    imgSrc: ["'self'", 'data:', 'https:'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
    connectSrc: ["'self'"],
  },
}));

app.route('/api', healthRoutes);
app.route('/api/auth', authRoutes);

app.get('/api/admin/ping', requireAuth, (c) => {
  const user = c.get('user');
  return c.json({ pong: true, user });
});

app.get('/', (c) =>
  c.text('HEKO Voice CMS — Phase 1 backend running. Public renderer arrives in Phase 2.'),
);

app.notFound((c) => c.json({ error: 'not_found' }, 404));

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
