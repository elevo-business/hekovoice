import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/index.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { audit } from '../lib/audit.js';
import { saveUpload, deleteUpload } from '../lib/storage.js';

interface MediaRow {
  id: number;
  filename: string;
  url: string;
  alt: string | null;
  size_bytes: number | null;
  mime: string | null;
  width: number | null;
  height: number | null;
  uploaded_by: number | null;
  uploaded_at: number;
}

const insertMedia = db.prepare(`
  INSERT INTO media (filename, url, alt, size_bytes, mime, uploaded_by, uploaded_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const selectAll = db.prepare<[], MediaRow>('SELECT * FROM media ORDER BY uploaded_at DESC LIMIT 500');
const selectById = db.prepare<[number], MediaRow>('SELECT * FROM media WHERE id = ?');
const updateAlt = db.prepare('UPDATE media SET alt = ? WHERE id = ?');
const deleteMedia = db.prepare('DELETE FROM media WHERE id = ?');

export const mediaRoutes = new Hono();

mediaRoutes.get('/', requireAuth, (c) => {
  return c.json({ media: selectAll.all() });
});

mediaRoutes.post('/upload', requireAuth, async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'file_required' }, 400);
  }
  const buf = Buffer.from(await file.arrayBuffer());
  let saved;
  try {
    saved = saveUpload(file.name, file.type || 'application/octet-stream', buf);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400);
  }
  const user = c.get('user');
  const result = insertMedia.run(
    saved.filename,
    saved.url,
    null,
    saved.size,
    file.type || null,
    user.id,
    Date.now(),
  );
  audit(user.id, 'media.upload', `media:${result.lastInsertRowid}`, null, {
    filename: saved.filename,
    size: saved.size,
  });
  return c.json({
    media: {
      id: Number(result.lastInsertRowid),
      filename: saved.filename,
      url: saved.url,
      size_bytes: saved.size,
      mime: file.type || null,
    },
  }, 201);
});

const altSchema = z.object({ alt: z.string().max(300) });

mediaRoutes.patch('/:id', requireAuth, async (c) => {
  const id = Number(c.req.param('id'));
  const row = selectById.get(id);
  if (!row) return c.json({ error: 'not_found' }, 404);
  const body = await c.req.json().catch(() => null);
  const parsed = altSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'invalid_input' }, 400);
  updateAlt.run(parsed.data.alt, id);
  return c.json({ ok: true });
});

mediaRoutes.delete('/:id', requireAdmin, (c) => {
  const id = Number(c.req.param('id'));
  const row = selectById.get(id);
  if (!row) return c.json({ error: 'not_found' }, 404);
  deleteUpload(row.filename);
  deleteMedia.run(id);
  const user = c.get('user');
  audit(user.id, 'media.delete', `media:${id}`, null, { filename: row.filename });
  return c.json({ ok: true });
});
