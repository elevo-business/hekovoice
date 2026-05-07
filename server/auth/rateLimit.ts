import { db } from '../db/index.js';

const MAX_FAILS_PER_MINUTE = 5;

const insertAttempt = db.prepare(`
  INSERT INTO login_attempts (ip, email, success, created_at) VALUES (?, ?, ?, ?)
`);

const countRecentFails = db.prepare<[string, number], { c: number }>(`
  SELECT COUNT(*) AS c FROM login_attempts
  WHERE ip = ? AND success = 0 AND created_at > ?
`);

export function recordLoginAttempt(ip: string, email: string | null, success: boolean): void {
  insertAttempt.run(ip, email, success ? 1 : 0, Date.now());
}

export function isRateLimited(ip: string): boolean {
  const cutoff = Date.now() - 60_000;
  const row = countRecentFails.get(ip, cutoff);
  return (row?.c ?? 0) >= MAX_FAILS_PER_MINUTE;
}
