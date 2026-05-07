-- HEKO Voice CMS — Initial Schema

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK(role IN ('admin','editor')),
  created_at    INTEGER NOT NULL,
  last_login_at INTEGER
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  user_agent TEXT,
  ip         TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_exp  ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS sections (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  page       TEXT NOT NULL DEFAULT 'index',
  type       TEXT NOT NULL,
  position   INTEGER NOT NULL,
  visible    INTEGER NOT NULL DEFAULT 1,
  data       TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_sections_page_pos ON sections(page, position);

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS revisions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id    INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  data_snapshot TEXT NOT NULL,
  changed_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  changed_at    INTEGER NOT NULL,
  comment       TEXT
);
CREATE INDEX IF NOT EXISTS idx_revisions_section ON revisions(section_id, changed_at DESC);

CREATE TABLE IF NOT EXISTS media (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  filename    TEXT NOT NULL,
  url         TEXT NOT NULL,
  alt         TEXT,
  size_bytes  INTEGER,
  mime        TEXT,
  width       INTEGER,
  height      INTEGER,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_media_uploaded ON media(uploaded_at DESC);

CREATE TABLE IF NOT EXISTS audit_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  target     TEXT,
  metadata   TEXT,
  ip         TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

CREATE TABLE IF NOT EXISTS login_attempts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ip         TEXT NOT NULL,
  email      TEXT,
  success    INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip, created_at DESC);
