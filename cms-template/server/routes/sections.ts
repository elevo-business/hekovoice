import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/index.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { audit } from '../lib/audit.js';
import { getSectionType, listSectionTypes } from '../render/sections/index.js';
import { purgeCloudflareCache } from '../lib/cache.js';

interface SectionRow {
  id: number;
  page: string;
  type: string;
  position: number;
  visible: number;
  data: string;
  updated_at: number;
  updated_by: number | null;
}

interface RevisionRow {
  id: number;
  section_id: number;
  data_snapshot: string;
  changed_by: number | null;
  changed_at: number;
  comment: string | null;
}

const selectByPage = db.prepare<[string], SectionRow>(`
  SELECT * FROM sections WHERE page = ? ORDER BY position ASC, id ASC
`);
const selectById = db.prepare<[number], SectionRow>('SELECT * FROM sections WHERE id = ?');
const insertRevision = db.prepare(`
  INSERT INTO revisions (section_id, data_snapshot, changed_by, changed_at, comment)
  VALUES (?, ?, ?, ?, ?)
`);
const updateSection = db.prepare(`
  UPDATE sections SET type = ?, data = ?, visible = ?, updated_at = ?, updated_by = ? WHERE id = ?
`);
const deleteSection = db.prepare('DELETE FROM sections WHERE id = ?');
const insertSection = db.prepare(`
  INSERT INTO sections (page, type, position, visible, data, updated_at, updated_by)
  VALUES (?, ?, ?, 1, ?, ?, ?)
`);
const maxPos = db.prepare<[string], { mp: number | null }>(
  'SELECT MAX(position) AS mp FROM sections WHERE page = ?',
);
const setPosition = db.prepare('UPDATE sections SET position = ? WHERE id = ?');
const selectRevisions = db.prepare<[number], RevisionRow>(
  'SELECT * FROM revisions WHERE section_id = ? ORDER BY changed_at DESC LIMIT 50',
);
const selectRevision = db.prepare<[number, number], RevisionRow>(
  'SELECT * FROM revisions WHERE section_id = ? AND id = ?',
);

export const sectionsRoutes = new Hono();

function parseRow(row: SectionRow) {
  let data: unknown = null;
  try { data = JSON.parse(row.data); } catch { /* keep null */ }
  return {
    id: row.id,
    page: row.page,
    type: row.type,
    position: row.position,
    visible: row.visible === 1,
    data,
    updated_at: row.updated_at,
    updated_by: row.updated_by,
  };
}

sectionsRoutes.get('/types', requireAuth, (c) => {
  return c.json({
    types: listSectionTypes().map((t) => ({
      id: t.id,
      label: t.label,
      description: t.description,
      defaults: t.defaults(),
    })),
  });
});

sectionsRoutes.get('/page/:slug', requireAuth, (c) => {
  const slug = c.req.param('slug') ?? '';
  if (!slug) return c.json({ error: 'invalid_slug' }, 400);
  const rows = selectByPage.all(slug);
  return c.json({ sections: rows.map(parseRow) });
});

sectionsRoutes.get('/:id', requireAuth, (c) => {
  const id = Number(c.req.param('id'));
  const row = selectById.get(id);
  if (!row) return c.json({ error: 'not_found' }, 404);
  return c.json({ section: parseRow(row) });
});

const createSchema = z.object({
  page: z.string().min(1),
  type: z.string().min(1),
  data: z.unknown().optional(),
  position: z.number().int().min(0).optional(),
});

sectionsRoutes.post('/', requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'invalid_input', issues: parsed.error.issues }, 400);
  const type = getSectionType(parsed.data.type);
  if (!type) return c.json({ error: 'unknown_type' }, 400);
  const data = parsed.data.data ?? type.defaults();
  const validated = type.schema.safeParse(data);
  if (!validated.success) return c.json({ error: 'invalid_data', issues: validated.error.issues }, 400);

  const user = c.get('user');
  const pos = parsed.data.position ?? ((maxPos.get(parsed.data.page)?.mp ?? -1) + 1);
  const result = insertSection.run(
    parsed.data.page,
    parsed.data.type,
    pos,
    JSON.stringify(validated.data),
    Date.now(),
    user.id,
  );
  audit(user.id, 'section.create', `section:${result.lastInsertRowid}`, null, {
    page: parsed.data.page,
    type: parsed.data.type,
  });
  void purgeCloudflareCache();
  return c.json({ id: Number(result.lastInsertRowid) }, 201);
});

const updateSchema = z.object({
  type: z.string().optional(),
  data: z.unknown().optional(),
  visible: z.boolean().optional(),
  comment: z.string().max(500).optional(),
});

sectionsRoutes.patch('/:id', requireAuth, async (c) => {
  const id = Number(c.req.param('id'));
  const row = selectById.get(id);
  if (!row) return c.json({ error: 'not_found' }, 404);
  const body = await c.req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'invalid_input', issues: parsed.error.issues }, 400);

  const newType = parsed.data.type ?? row.type;
  const type = getSectionType(newType);
  if (!type) return c.json({ error: 'unknown_type' }, 400);

  let newData = row.data;
  if (parsed.data.data !== undefined) {
    const validated = type.schema.safeParse(parsed.data.data);
    if (!validated.success) return c.json({ error: 'invalid_data', issues: validated.error.issues }, 400);
    newData = JSON.stringify(validated.data);
  } else if (newType !== row.type) {
    const validated = type.schema.safeParse(JSON.parse(row.data));
    if (!validated.success) {
      newData = JSON.stringify(type.defaults());
    }
  }

  const visible = parsed.data.visible === undefined ? row.visible : (parsed.data.visible ? 1 : 0);
  const user = c.get('user');

  db.transaction(() => {
    insertRevision.run(id, row.data, user.id, Date.now(), parsed.data.comment ?? null);
    updateSection.run(newType, newData, visible, Date.now(), user.id, id);
  })();

  audit(user.id, 'section.update', `section:${id}`, null, {
    type_changed: newType !== row.type,
    visibility_changed: visible !== row.visible,
  });
  void purgeCloudflareCache();
  return c.json({ ok: true });
});

sectionsRoutes.delete('/:id', requireAdmin, (c) => {
  const id = Number(c.req.param('id'));
  const row = selectById.get(id);
  if (!row) return c.json({ error: 'not_found' }, 404);
  const user = c.get('user');
  deleteSection.run(id);
  audit(user.id, 'section.delete', `section:${id}`, null, { page: row.page, type: row.type });
  void purgeCloudflareCache();
  return c.json({ ok: true });
});

const reorderSchema = z.object({
  page: z.string().min(1),
  order: z.array(z.number().int()).min(1),
});

sectionsRoutes.put('/reorder', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'invalid_input' }, 400);
  const user = c.get('user');
  db.transaction(() => {
    parsed.data.order.forEach((id, idx) => setPosition.run(idx, id));
  })();
  audit(user.id, 'section.reorder', `page:${parsed.data.page}`, null, {
    count: parsed.data.order.length,
  });
  void purgeCloudflareCache();
  return c.json({ ok: true });
});

sectionsRoutes.get('/:id/revisions', requireAuth, (c) => {
  const id = Number(c.req.param('id'));
  const rows = selectRevisions.all(id);
  return c.json({ revisions: rows.map((r) => ({
    id: r.id,
    section_id: r.section_id,
    changed_at: r.changed_at,
    changed_by: r.changed_by,
    comment: r.comment,
  })) });
});

sectionsRoutes.get('/:id/revisions/:revId', requireAuth, (c) => {
  const id = Number(c.req.param('id'));
  const revId = Number(c.req.param('revId'));
  const rev = selectRevision.get(id, revId);
  if (!rev) return c.json({ error: 'not_found' }, 404);
  let data: unknown = null;
  try { data = JSON.parse(rev.data_snapshot); } catch { /* */ }
  return c.json({
    revision: {
      id: rev.id,
      section_id: rev.section_id,
      changed_at: rev.changed_at,
      changed_by: rev.changed_by,
      comment: rev.comment,
      data,
    },
  });
});

sectionsRoutes.post('/:id/revisions/:revId/restore', requireAuth, async (c) => {
  const id = Number(c.req.param('id'));
  const revId = Number(c.req.param('revId'));
  const row = selectById.get(id);
  const rev = selectRevision.get(id, revId);
  if (!row || !rev) return c.json({ error: 'not_found' }, 404);
  const user = c.get('user');
  db.transaction(() => {
    insertRevision.run(id, row.data, user.id, Date.now(), `Rollback to revision ${revId}`);
    updateSection.run(row.type, rev.data_snapshot, row.visible, Date.now(), user.id, id);
  })();
  audit(user.id, 'section.restore', `section:${id}`, null, { revision_id: revId });
  void purgeCloudflareCache();
  return c.json({ ok: true });
});
