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
  ('index',  'Startseite',     strftime('%s','now') * 1000),
  ('termin', 'Termin buchen',  strftime('%s','now') * 1000);

-- Default global settings
INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES
  ('site.title',          '"HEKO Voice – Nie wieder verpasste Anrufe."', strftime('%s','now') * 1000),
  ('site.description',    '"HEKO Voice ersetzt Ihre alte Telefonanlage durch ein KI-gestütztes System. Wir richten alles ein. Sie telefonieren einfach."', strftime('%s','now') * 1000),
  ('site.og_image',       '"https://heko-bs.de/voice/og-image.jpg"',  strftime('%s','now') * 1000),
  ('contact.phone',       '"+49 (0) 2451 - 66066"',                   strftime('%s','now') * 1000),
  ('contact.phone_link',  '"+4924516606"',                            strftime('%s','now') * 1000),
  ('contact.email',       '"info@heko-bs.de"',                        strftime('%s','now') * 1000),
  ('contact.whatsapp',    '"4924516606"',                             strftime('%s','now') * 1000),
  ('contact.company',     '"Heko Büroservice GmbH & Co. KG"',         strftime('%s','now') * 1000),
  ('contact.address',     '"An Fürthenrode 53, 52511 Geilenkirchen"', strftime('%s','now') * 1000),
  ('contact.ceo',         '"Joost Heinen, Nadine Krantz"',            strftime('%s','now') * 1000),
  ('contact.register',    '"HRA 7637, Amtsgericht Aachen"',           strftime('%s','now') * 1000),
  ('contact.vat_id',      '"DE 268 541 980"',                         strftime('%s','now') * 1000),
  ('tracking.gtm_id',     '"GTM-XXXXXXX"',                            strftime('%s','now') * 1000),
  ('tracking.ga4_id',     '"G-744VWWPK9B"',                           strftime('%s','now') * 1000),
  ('tracking.gads_id',    '"AW-364517411"',                           strftime('%s','now') * 1000),
  ('tracking.fb_pixel',   '""',                                       strftime('%s','now') * 1000),
  ('integration.pipedrive_form_url', '"https://webforms.pipedrive.com/f/63tNEpJ3ONLHbsJGN7qUiPS5JurmHTfBOkeYjiH8ym4BGkgziEaPlNcHynX5g4C9XR"', strftime('%s','now') * 1000);
