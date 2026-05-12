import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/index.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { audit } from '../lib/audit.js';
import { purgeCloudflareCache } from '../lib/cache.js';

interface SettingRow {
  key: string;
  value: string;
  updated_at: number;
}

const selectAll = db.prepare<[], SettingRow>('SELECT * FROM settings ORDER BY key');
const upsert = db.prepare(`
  INSERT INTO settings (key, value, updated_at, updated_by)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by
`);
const deleteSetting = db.prepare('DELETE FROM settings WHERE key = ?');

export const settingsRoutes = new Hono();

settingsRoutes.get('/', requireAuth, (c) => {
  const out: Record<string, unknown> = {};
  for (const row of selectAll.all()) {
    try { out[row.key] = JSON.parse(row.value); } catch { out[row.key] = row.value; }
  }
  return c.json({ settings: out });
});

const patchSchema = z.record(z.string(), z.unknown());

settingsRoutes.patch('/', requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'invalid_input' }, 400);
  const user = c.get('user');
  const now = Date.now();
  const keys = Object.keys(parsed.data);
  db.transaction(() => {
    for (const k of keys) {
      const v = parsed.data[k];
      if (v === null) deleteSetting.run(k);
      else upsert.run(k, JSON.stringify(v), now, user.id);
    }
  })();
  audit(user.id, 'settings.update', null, null, { keys });
  void purgeCloudflareCache();
  return c.json({ ok: true, updated: keys.length });
});
