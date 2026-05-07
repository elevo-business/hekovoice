import { db } from '../db/index.js';

const insertAudit = db.prepare(`
  INSERT INTO audit_log (user_id, action, target, metadata, ip, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

export function audit(
  userId: number | null,
  action: string,
  target: string | null,
  ip: string | null,
  metadata?: Record<string, unknown>,
): void {
  insertAudit.run(
    userId,
    action,
    target,
    metadata ? JSON.stringify(metadata) : null,
    ip,
    Date.now(),
  );
}
