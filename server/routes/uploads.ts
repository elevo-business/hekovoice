import { Hono } from 'hono';
import { existsSync, statSync, createReadStream } from 'node:fs';
import { resolve } from 'node:path';
import { Readable } from 'node:stream';
import { getUploadDir } from '../lib/storage.js';

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
};

export const uploadsRoutes = new Hono();

uploadsRoutes.get('/:name', (c) => {
  const name = c.req.param('name');
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return c.notFound();
  const dir = getUploadDir();
  const fullPath = resolve(dir, name);
  if (!fullPath.startsWith(dir)) return c.notFound();
  if (!existsSync(fullPath)) return c.notFound();

  const stat = statSync(fullPath);
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
  const mime = MIME_BY_EXT[ext] ?? 'application/octet-stream';

  const stream = Readable.toWeb(createReadStream(fullPath)) as ReadableStream;
  c.header('Content-Type', mime);
  c.header('Content-Length', String(stat.size));
  c.header('Cache-Control', 'public, max-age=31536000, immutable');
  return c.body(stream);
});
