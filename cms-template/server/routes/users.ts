import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { hashPassword } from '../auth/passwords.js';
import { audit } from '../lib/audit.js';

interface UserRow {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  created_at: number;
  last_login_at: number | null;
}

const selectAll = db.prepare<[], UserRow>(
  'SELECT id, email, name, role, created_at, last_login_at FROM users ORDER BY created_at ASC',
);
const selectById = db.prepare<[number], UserRow>(
  'SELECT id, email, name, role, created_at, last_login_at FROM users WHERE id = ?',
);
const selectByEmail = db.prepare<[string], { id: number }>('SELECT id FROM users WHERE email = ?');
const insertUser = db.prepare(`
  INSERT INTO users (email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?)
`);
const updateUser = db.prepare('UPDATE users SET name = ?, role = ? WHERE id = ?');
const updateUserPw = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
const deleteUser = db.prepare('DELETE FROM users WHERE id = ?');
const countAdmins = db.prepare<[], { c: number }>(
  "SELECT COUNT(*) AS c FROM users WHERE role = 'admin'",
);

export const usersRoutes = new Hono();

usersRoutes.get('/', requireAdmin, (c) => {
  return c.json({ users: selectAll.all() });
});

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
  role: z.enum(['admin', 'editor']),
  password: z.string().min(10).max(200),
});

usersRoutes.post('/', requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'invalid_input', issues: parsed.error.issues }, 400);
  const email = parsed.data.email.toLowerCase().trim();
  if (selectByEmail.get(email)) return c.json({ error: 'email_taken' }, 409);
  const hash = await hashPassword(parsed.data.password);
  const result = insertUser.run(email, hash, parsed.data.name, parsed.data.role, Date.now());
  const user = c.get('user');
  audit(user.id, 'user.create', `user:${result.lastInsertRowid}`, null, {
    email,
    role: parsed.data.role,
  });
  return c.json({ id: Number(result.lastInsertRowid) }, 201);
});

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  role: z.enum(['admin', 'editor']).optional(),
  password: z.string().min(10).max(200).optional(),
});

usersRoutes.patch('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'));
  const row = selectById.get(id);
  if (!row) return c.json({ error: 'not_found' }, 404);
  const body = await c.req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'invalid_input' }, 400);

  const newRole = parsed.data.role ?? row.role;
  if (row.role === 'admin' && newRole !== 'admin') {
    if ((countAdmins.get()?.c ?? 0) <= 1) return c.json({ error: 'last_admin' }, 400);
  }

  if (parsed.data.name || parsed.data.role) {
    updateUser.run(parsed.data.name ?? row.name, newRole, id);
  }
  if (parsed.data.password) {
    updateUserPw.run(await hashPassword(parsed.data.password), id);
  }
  const user = c.get('user');
  audit(user.id, 'user.update', `user:${id}`, null, {
    name_changed: !!parsed.data.name,
    role_changed: !!parsed.data.role,
    password_changed: !!parsed.data.password,
  });
  return c.json({ ok: true });
});

usersRoutes.delete('/:id', requireAdmin, (c) => {
  const id = Number(c.req.param('id'));
  const row = selectById.get(id);
  if (!row) return c.json({ error: 'not_found' }, 404);
  const user = c.get('user');
  if (row.id === user.id) return c.json({ error: 'cannot_delete_self' }, 400);
  if (row.role === 'admin' && (countAdmins.get()?.c ?? 0) <= 1) {
    return c.json({ error: 'last_admin' }, 400);
  }
  deleteUser.run(id);
  audit(user.id, 'user.delete', `user:${id}`, null, { email: row.email });
  return c.json({ ok: true });
});
