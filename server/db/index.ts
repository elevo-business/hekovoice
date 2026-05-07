import Database from 'better-sqlite3';
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, 'migrations');

mkdirSync(dirname(resolve(env.DATABASE_PATH)), { recursive: true });

export const db = new Database(env.DATABASE_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    name        TEXT PRIMARY KEY,
    applied_at  INTEGER NOT NULL
  );
`);

export function runMigrations(): void {
  const applied = new Set(
    db.prepare<[], { name: string }>('SELECT name FROM schema_migrations').all().map((r) => r.name),
  );

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const insertApplied = db.prepare(
    'INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)',
  );

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    db.transaction(() => {
      db.exec(sql);
      insertApplied.run(file, Date.now());
    })();
    console.log(`[migrate] applied ${file}`);
  }
}

// Apply migrations eagerly so any importer can prepare statements at module
// init without hitting "no such table" errors. Idempotent — only runs once
// per process (modules are cached).
runMigrations();

export type Row = Record<string, unknown>;
