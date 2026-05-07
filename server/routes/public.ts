import { Hono } from 'hono';
import { db } from '../db/index.js';
import { renderPage } from '../render/page.js';

export const publicRoutes = new Hono();

const pageExists = db.prepare<[string], { slug: string }>(
  'SELECT slug FROM pages WHERE slug = ?',
);

publicRoutes.get('/', (c) => {
  const html = renderPage('index');
  c.header('Cache-Control', 'public, max-age=60, s-maxage=86400');
  return c.html(html);
});

publicRoutes.get('/termin', (c) => {
  if (!pageExists.get('termin')) return c.notFound();
  const html = renderPage('termin');
  c.header('Cache-Control', 'public, max-age=60, s-maxage=86400');
  return c.html(html);
});

publicRoutes.get('/termin.html', (c) => c.redirect('/termin', 301));
