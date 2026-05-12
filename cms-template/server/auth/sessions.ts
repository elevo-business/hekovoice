import { randomBytes } from 'node:crypto';
import { db } from '../db/index.js';
import { env } from '../config.js';

export const SESSION_COOKIE = 'cms_sid';

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'editor';
}

interface SessionRow {
  id: string;
  user_id: number;
  expires_at: number;
}

interface UserRow {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'editor';
}

const insertSession = db.prepare(`
  INSERT INTO sessions (id, user_id, expires_at, created_at, user_agent, ip)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const selectSession = db.prepare<[string], SessionRow>(`
  SELECT id, user_id, expires_at FROM sessions WHERE id = ?
`);

const selectUser = db.prepare<[number], UserRow>(`
  SELECT id, email, name, role FROM users WHERE id = ?
`);

const deleteSession = db.prepare('DELETE FROM sessions WHERE id = ?');
const deleteExpired = db.prepare('DELETE FROM sessions WHERE expires_at < ?');

export function createSession(
  userId: number,
  meta: { userAgent?: string; ip?: string } = {},
): string {
  const id = randomBytes(32).toString('hex');
  const now = Date.now();
  const expiresAt = now + env.SESSION_TTL_HOURS * 60 * 60 * 1000;
  insertSession.run(id, userId, expiresAt, now, meta.userAgent ?? null, meta.ip ?? null);
  return id;
}

export function getSessionUser(sessionId: string | undefined): SessionUser | null {
  if (!sessionId) return null;
  const session = selectSession.get(sessionId);
  if (!session) return null;
  if (session.expires_at < Date.now()) {
    deleteSession.run(sessionId);
    return null;
  }
  const user = selectUser.get(session.user_id);
  return user ?? null;
}

export function destroySession(sessionId: string): void {
  deleteSession.run(sessionId);
}

export function purgeExpiredSessions(): number {
  const result = deleteExpired.run(Date.now());
  return Number(result.changes);
}
