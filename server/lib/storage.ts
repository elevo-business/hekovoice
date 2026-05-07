import { mkdirSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { resolve, dirname, extname, basename } from 'node:path';
import { randomBytes } from 'node:crypto';
import { env } from '../config.js';

const UPLOAD_DIR = resolve(dirname(env.DATABASE_PATH), 'uploads');
mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
]);

const MAX_BYTES = 10 * 1024 * 1024;

export interface SavedFile {
  filename: string;
  path: string;
  url: string;
  size: number;
}

function safeStem(name: string): string {
  return name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'file';
}

export function getUploadDir(): string {
  return UPLOAD_DIR;
}

export function saveUpload(
  originalName: string,
  mime: string,
  buffer: Buffer,
): SavedFile {
  if (buffer.byteLength === 0) throw new Error('empty file');
  if (buffer.byteLength > MAX_BYTES) throw new Error('file_too_large');
  if (!ALLOWED_MIME.has(mime)) throw new Error('mime_not_allowed');

  const ext = extname(originalName).toLowerCase().replace(/[^.a-z0-9]/g, '') || mimeExt(mime);
  const stem = safeStem(basename(originalName, extname(originalName)));
  const id = randomBytes(6).toString('hex');
  const filename = `${stem}-${id}${ext}`;
  const fullPath = resolve(UPLOAD_DIR, filename);
  writeFileSync(fullPath, buffer);
  return {
    filename,
    path: fullPath,
    url: `/uploads/${filename}`,
    size: buffer.byteLength,
  };
}

export function deleteUpload(filename: string): boolean {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '');
  if (!safe || safe !== filename) return false;
  const fullPath = resolve(UPLOAD_DIR, safe);
  if (!fullPath.startsWith(UPLOAD_DIR)) return false;
  if (!existsSync(fullPath)) return false;
  unlinkSync(fullPath);
  return true;
}

function mimeExt(mime: string): string {
  switch (mime) {
    case 'image/jpeg': return '.jpg';
    case 'image/png':  return '.png';
    case 'image/webp': return '.webp';
    case 'image/gif':  return '.gif';
    case 'image/svg+xml': return '.svg';
    case 'image/avif': return '.avif';
    default: return '';
  }
}
