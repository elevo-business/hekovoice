import { runMigrations, db } from '../db/index.js';
import { hashPassword } from '../auth/passwords.js';
import { env } from '../config.js';

runMigrations();

if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
  console.error('[seed] ADMIN_EMAIL and ADMIN_PASSWORD must be set in env');
  process.exit(1);
}

const email = env.ADMIN_EMAIL.toLowerCase().trim();

const existing = db
  .prepare<[string], { id: number }>('SELECT id FROM users WHERE email = ?')
  .get(email);

if (existing) {
  console.log(`[seed] admin ${email} already exists (id=${existing.id})`);
  process.exit(0);
}

const hash = await hashPassword(env.ADMIN_PASSWORD);

const result = db
  .prepare(
    `INSERT INTO users (email, password_hash, name, role, created_at)
     VALUES (?, ?, ?, 'admin', ?)`,
  )
  .run(email, hash, env.ADMIN_NAME, Date.now());

console.log(`[seed] created admin ${email} (id=${result.lastInsertRowid})`);
