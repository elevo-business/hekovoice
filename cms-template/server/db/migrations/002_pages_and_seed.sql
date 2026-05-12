-- Pages: each URL = one page, holds layout + ordered sections

CREATE TABLE IF NOT EXISTS pages (
  slug         TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  layout       TEXT NOT NULL DEFAULT 'default',
  meta         TEXT NOT NULL DEFAULT '{}',
  updated_at   INTEGER NOT NULL,
  updated_by   INTEGER REFERENCES users(id) ON DELETE SET NULL
);

INSERT OR IGNORE INTO pages (slug, title, updated_at) VALUES
  ('index',  'Home', strftime('%s','now') * 1000);

-- Default global settings (override via the Settings UI after first login)
INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES
  ('site.title',          '"My Site"',                   strftime('%s','now') * 1000),
  ('site.description',    '"Edit me in the CMS."',       strftime('%s','now') * 1000),
  ('site.og_image',       '""',                          strftime('%s','now') * 1000),
  ('contact.phone',       '""',                          strftime('%s','now') * 1000),
  ('contact.phone_link',  '""',                          strftime('%s','now') * 1000),
  ('contact.email',       '""',                          strftime('%s','now') * 1000),
  ('contact.whatsapp',    '""',                          strftime('%s','now') * 1000),
  ('contact.company',     '""',                          strftime('%s','now') * 1000),
  ('contact.address',     '""',                          strftime('%s','now') * 1000),
  ('contact.ceo',         '""',                          strftime('%s','now') * 1000),
  ('contact.register',    '""',                          strftime('%s','now') * 1000),
  ('contact.vat_id',      '""',                          strftime('%s','now') * 1000),
  ('tracking.gtm_id',     '""',                          strftime('%s','now') * 1000),
  ('tracking.ga4_id',     '""',                          strftime('%s','now') * 1000),
  ('tracking.gads_id',    '""',                          strftime('%s','now') * 1000),
  ('tracking.fb_pixel',   '""',                          strftime('%s','now') * 1000),
  ('integration.pipedrive_form_url', '""',               strftime('%s','now') * 1000);
