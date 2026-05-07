import { Hono } from 'hono';
import { db } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { audit } from '../lib/audit.js';

export const backupRoutes = new Hono();

backupRoutes.get('/export', requireAdmin, (c) => {
  const data = {
    version: 1,
    exported_at: Date.now(),
    pages: db.prepare('SELECT * FROM pages').all(),
    sections: db.prepare('SELECT * FROM sections').all(),
    settings: db.prepare('SELECT * FROM settings').all(),
    media: db.prepare('SELECT * FROM media').all(),
    users: db.prepare('SELECT id, email, name, role, created_at FROM users').all(),
  };
  const user = c.get('user');
  audit(user.id, 'backup.export', null, null, { sections: data.sections.length });
  c.header('Content-Type', 'application/json');
  c.header(
    'Content-Disposition',
    `attachment; filename="hekovoice-backup-${new Date().toISOString().slice(0, 19)}.json"`,
  );
  return c.body(JSON.stringify(data, null, 2));
});
