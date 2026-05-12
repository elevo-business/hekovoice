import { db } from '../db/index.js';
import { hashPassword } from '../auth/passwords.js';
import { env } from '../config.js';

interface UserRow { id: number; }

const findUser = db.prepare<[string], UserRow>('SELECT id FROM users WHERE email = ?');
const insertUser = db.prepare(`
  INSERT INTO users (email, password_hash, name, role, created_at)
  VALUES (?, ?, ?, 'admin', ?)
`);

export interface SeedUserResult {
  status: 'created' | 'exists' | 'no_email' | 'no_password';
  email?: string;
  id?: number;
}

export async function seedInitialUser(): Promise<SeedUserResult> {
  if (!env.ADMIN_EMAIL) {
    console.log('[seed-user] ADMIN_EMAIL not set — skipping admin bootstrap');
    return { status: 'no_email' };
  }

  const email = env.ADMIN_EMAIL.toLowerCase().trim();
  const existing = findUser.get(email);
  if (existing) {
    console.log(`[seed-user] admin ${email} already exists (id=${existing.id})`);
    return { status: 'exists', email, id: existing.id };
  }

  if (!env.ADMIN_PASSWORD) {
    console.warn(
      `[seed-user] no admin user found and ADMIN_PASSWORD is not set. ` +
      `Set both ADMIN_EMAIL and ADMIN_PASSWORD env vars to bootstrap an admin account.`,
    );
    return { status: 'no_password', email };
  }

  const hash = await hashPassword(env.ADMIN_PASSWORD);
  const result = insertUser.run(email, hash, env.ADMIN_NAME, Date.now());
  const id = Number(result.lastInsertRowid);
  console.log(`[seed-user] created admin ${email} (id=${id})`);
  return { status: 'created', email, id };
}
