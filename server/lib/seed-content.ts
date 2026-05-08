import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../db/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MARKER_RE = /<!--\s*═{3}\s*([^═]+?)\s*═{3}\s*-->/;

const PAGES: { slug: string; file: string }[] = [
  { slug: 'index',  file: 'index.html' },
  { slug: 'termin', file: 'termin.html' },
];

function findHtmlFile(name: string): string | null {
  const candidates = [
    resolve(process.cwd(), name),
    resolve(__dirname, '..', '..', '..', name),
    resolve(__dirname, '..', '..', name),
    resolve(__dirname, '..', name),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

function extractBodyContent(html: string): string {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m && m[1] ? m[1] : '';
}

function splitAtMarkers(body: string): { label: string; html: string }[] {
  const lines = body.split('\n');
  const out: { label: string; html: string }[] = [];
  let label = 'Top of body';
  let buf: string[] = [];
  const flush = () => {
    if (buf.length > 0 && buf.some((l) => l.trim().length > 0)) {
      out.push({ label, html: buf.join('\n').trim() });
    }
  };
  for (const line of lines) {
    const m = line.match(MARKER_RE);
    if (m && m[1]) {
      flush();
      label = m[1].trim();
      buf = [line];
    } else {
      buf.push(line);
    }
  }
  flush();
  return out;
}

export interface SeedOptions { force?: boolean; }
export interface SeedResult { seeded: number; skippedPages: string[]; missingFiles: string[]; }

export function seedInitialContent(opts: SeedOptions = {}): SeedResult {
  const countSections = db.prepare<[string], { c: number }>(
    'SELECT COUNT(*) AS c FROM sections WHERE page = ?',
  );
  const deletePageSections = db.prepare('DELETE FROM sections WHERE page = ?');
  const insertSection = db.prepare(`
    INSERT INTO sections (page, type, position, visible, data, updated_at)
    VALUES (?, ?, ?, 1, ?, ?)
  `);

  let seeded = 0;
  const skippedPages: string[] = [];
  const missingFiles: string[] = [];

  for (const { slug, file } of PAGES) {
    const existing = countSections.get(slug)?.c ?? 0;
    if (existing > 0 && !opts.force) {
      skippedPages.push(`${slug} (${existing} sections)`);
      continue;
    }

    const path = findHtmlFile(file);
    if (!path) {
      missingFiles.push(file);
      console.warn(`[seed-content] ${file} not found — skipping ${slug}`);
      continue;
    }

    const html = readFileSync(path, 'utf8');
    const body = extractBodyContent(html);
    if (!body) {
      console.warn(`[seed-content] no <body> in ${file}`);
      continue;
    }

    const blocks = splitAtMarkers(body);
    const now = Date.now();
    db.transaction(() => {
      if (opts.force && existing > 0) deletePageSections.run(slug);
      blocks.forEach((b, i) => {
        insertSection.run(slug, 'raw_html', i, JSON.stringify({ label: b.label, html: b.html }), now);
      });
    })();
    seeded += blocks.length;
    console.log(`[seed-content] seeded ${blocks.length} sections for "${slug}" from ${path}`);
  }

  if (skippedPages.length > 0) {
    console.log(`[seed-content] skipped (already seeded): ${skippedPages.join(', ')}`);
  }
  return { seeded, skippedPages, missingFiles };
}
