import { Hono } from 'hono';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { z } from 'zod';
import { db } from '../db/index.js';
import { verifyPassword } from '../auth/passwords.js';
import {
  SESSION_COOKIE,
  createSession,
  destroySession,
  getSessionUser,
} from '../auth/sessions.js';
import { recordLoginAttempt, isRateLimited } from '../auth/rateLimit.js';
import { isProd, env } from '../config.js';
import { audit } from '../lib/audit.js';

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});

interface UserAuthRow {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  password_hash: string;
}

const findUserByEmail = db.prepare<[string], UserAuthRow>(
  'SELECT id, email, name, role, password_hash FROM users WHERE email = ?',
);

const updateLastLogin = db.prepare(
  'UPDATE users SET last_login_at = ? WHERE id = ?',
);

export const authRoutes = new Hono();

authRoutes.post('/login', async (c) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (isRateLimited(ip)) {
    return c.json({ error: 'too_many_attempts', retry_after_s: 60 }, 429);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid_input' }, 400);
  }

  const { email, password } = parsed.data;
  const user = findUserByEmail.get(email.toLowerCase().trim());

  const ok = user ? await verifyPassword(password, user.password_hash) : false;
  recordLoginAttempt(ip, email, ok);

  if (!ok || !user) {
    return c.json({ error: 'invalid_credentials' }, 401);
  }

  const sid = createSession(user.id, {
    userAgent: c.req.header('user-agent') ?? undefined,
    ip,
  });
  updateLastLogin.run(Date.now(), user.id);
  audit(user.id, 'auth.login', `user:${user.id}`, ip);

  setCookie(c, SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'Lax',
    path: '/',
    maxAge: env.SESSION_TTL_HOURS * 60 * 60,
  });

  return c.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

authRoutes.post('/logout', (c) => {
  const sid = getCookie(c, SESSION_COOKIE);
  if (sid) {
    const user = getSessionUser(sid);
    destroySession(sid);
    if (user) audit(user.id, 'auth.logout', `user:${user.id}`, null);
  }
  deleteCookie(c, SESSION_COOKIE, { path: '/' });
  return c.json({ ok: true });
});

authRoutes.get('/me', (c) => {
  const sid = getCookie(c, SESSION_COOKIE);
  const user = getSessionUser(sid);
  if (!user) return c.json({ user: null });
  return c.json({ user });
});
