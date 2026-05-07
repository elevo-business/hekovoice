import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { SESSION_COOKIE, getSessionUser, type SessionUser } from '../auth/sessions.js';

declare module 'hono' {
  interface ContextVariableMap {
    user: SessionUser;
  }
}

export async function requireAuth(c: Context, next: Next) {
  const sid = getCookie(c, SESSION_COOKIE);
  const user = getSessionUser(sid);
  if (!user) return c.json({ error: 'unauthorized' }, 401);
  c.set('user', user);
  await next();
}

export async function requireAdmin(c: Context, next: Next) {
  const sid = getCookie(c, SESSION_COOKIE);
  const user = getSessionUser(sid);
  if (!user) return c.json({ error: 'unauthorized' }, 401);
  if (user.role !== 'admin') return c.json({ error: 'forbidden' }, 403);
  c.set('user', user);
  await next();
}
