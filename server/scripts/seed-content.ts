import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runMigrations, db } from '../db/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

runMigrations();

const countSections = db.prepare<[string], { c: number }>(
  'SELECT COUNT(*) AS c FROM sections WHERE page = ?',
);

const insertSection = db.prepare(`
  INSERT INTO sections (page, type, position, visible, data, updated_at)
  VALUES (?, ?, ?, 1, ?, ?)
`);

const MARKER_RE = /<!--\s*═{3}\s*([^═]+?)\s*═{3}\s*-->/;

function extractBodyContent(html: string): string {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m && m[1] ? m[1] : '';
}

function splitAtMarkers(body: string): { label: string; html: string }[] {
  const lines = body.split('\n');
  const result: { label: string; html: string }[] = [];
  let currentLabel = 'Top of body';
  let buffer: string[] = [];
  for (const line of lines) {
    const m = line.match(MARKER_RE);
    if (m && m[1]) {
      if (buffer.length > 0 && buffer.some((l) => l.trim().length > 0)) {
        result.push({ label: currentLabel, html: buffer.join('\n').trim() });
      }
      currentLabel = m[1].trim();
      buffer = [line];
    } else {
      buffer.push(line);
    }
  }
  if (buffer.length > 0 && buffer.some((l) => l.trim().length > 0)) {
    result.push({ label: currentLabel, html: buffer.join('\n').trim() });
  }
  return result;
}

function seedPage(slug: string, fileName: string): void {
  const existing = countSections.get(slug);
  if ((existing?.c ?? 0) > 0) {
    console.log(`[seed-content] page "${slug}" already has sections — skipping`);
    return;
  }
  const html = readFileSync(join(REPO_ROOT, fileName), 'utf8');
  const body = extractBodyContent(html);
  if (!body) {
    console.error(`[seed-content] could not extract <body> from ${fileName}`);
    return;
  }
  const blocks = splitAtMarkers(body);
  const now = Date.now();
  let pos = 0;
  for (const block of blocks) {
    const data = JSON.stringify({
      label: block.label,
      html: block.html,
    });
    insertSection.run(slug, 'raw_html', pos++, data, now);
  }
  console.log(`[seed-content] seeded ${blocks.length} sections for "${slug}" from ${fileName}`);
}

seedPage('index', 'index.html');
seedPage('termin', 'termin.html');

console.log('[seed-content] done');
