# HEKO Voice CMS — Technisches Konzept

**Stand:** 2026-05-07
**Branch:** `claude/fix-server-offline-Y53iH`
**Autor:** Claude (zur Abnahme durch elevo-business)

---

## 1. Ziele & Anforderungen

### Geschäftsziele
- Webseite `heko-bs.de/voice` muss von **2–5 Personen ohne Code-Kenntnisse** bearbeitbar sein
- Texte, Preise, Bilder und ganze Sections sollen änderbar sein (Reihenfolge, hinzufügen, löschen)
- Änderungen sollen **sofort live** gehen (keine Wartezeit auf Build-Prozesse)
- Fehler müssen **rückgängig** gemacht werden können

### Nicht-Ziele (bewusst ausgeschlossen)
- Mehrsprachigkeit (kann später ergänzt werden)
- A/B-Testing (kann später ergänzt werden)
- Blog/News-Bereich (nicht angefragt)
- Public API für Dritt-Apps

---

## 2. Tech-Stack

| Bereich       | Technologie                  | Warum?                                                                 |
| ------------- | ---------------------------- | ---------------------------------------------------------------------- |
| Backend       | **Node.js + Hono**           | Klein, schnell, modern. Single Binary deploybar.                       |
| Datenbank     | **SQLite (better-sqlite3)**  | Eine Datei. Kein DB-Server nötig. Backup = Datei kopieren.             |
| Auth          | **bcrypt + Session-Cookies** | Battle-tested, einfacher als JWT für Admin-Panels.                     |
| Templating    | **Eta** (oder eigene JS-Render-Funktion) | Server-Side-Rendering aus DB-Inhalt.                       |
| Image-Storage | **Cloudflare R2**            | Ihr nutzt bereits Cloudflare. S3-kompatibel, sehr günstig.             |
| Admin-UI      | **Alpine.js + Tailwind CDN** | Kein Build-Schritt. Single HTML-Datei. Wartbar auch ohne Vorerfahrung. |
| Hosting       | **Coolify (Docker)**         | Bereits eingerichtet. Single-Container-Deploy.                         |
| Caching       | **Cloudflare Edge Cache**    | Public Pages werden gecacht; bei Save → Cache-Purge per API.           |

**Warum SQLite und nicht Postgres?**
Die Site hat 1 Tabelle Content + ein paar User. SQLite reicht völlig, ist robust, und Backup ist trivial. Falls später nötig, ist die Migration zu Postgres geradlinig.

---

## 3. System-Architektur

```
                       ┌─────────────────────────┐
                       │     Cloudflare CDN      │
                       │   (heko-bs.de/voice)    │
                       └────────────┬────────────┘
                                    │ Cache-MISS / Admin
                                    ▼
                       ┌─────────────────────────┐
                       │   Coolify Container     │
                       │  ┌───────────────────┐  │
   Browser  ────HTTP───┤  │  Node.js + Hono   │  │
                       │  │                   │  │
                       │  │  / → Public HTML  │  │
                       │  │  /admin → SPA     │  │
                       │  │  /api/* → JSON    │  │
                       │  └─────────┬─────────┘  │
                       │            │             │
                       │  ┌─────────▼─────────┐  │
                       │  │  SQLite (Volume)  │  │
                       │  │  /data/cms.db     │  │
                       │  └───────────────────┘  │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │   Cloudflare R2 Bucket  │
                       │  (Bilder, Logos, Icons) │
                       └─────────────────────────┘
```

**Request-Fluss public:**
1. Besucher → Cloudflare → falls gecacht: direkt ausliefern
2. Cache-Miss → Coolify → SSR HTML aus SQLite → zurück zu CF → cachen → an Besucher

**Request-Fluss admin:**
1. Login → `/api/auth/login` → Session-Cookie
2. Bearbeiten → `/api/content/...` → DB-Update → Cache-Purge bei Cloudflare
3. Innerhalb 1 Sekunde live

---

## 4. Datenmodell (SQLite Schema)

```sql
-- Benutzer
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','editor')),
  created_at INTEGER NOT NULL,
  last_login INTEGER
);

-- Sessions (alternativ zu JWT)
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at INTEGER NOT NULL
);

-- Sections (= jeder Block der Seite)
CREATE TABLE sections (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL,         -- 'hero','features','pricing','faq',...
  position INTEGER NOT NULL,  -- für Reihenfolge
  visible INTEGER NOT NULL DEFAULT 1,
  data TEXT NOT NULL,         -- JSON mit Section-spezifischen Feldern
  updated_at INTEGER NOT NULL,
  updated_by INTEGER REFERENCES users(id)
);

-- Globale Einstellungen (Logo, Farben, Footer, Meta-Tags)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Versionsverlauf (für Rollback)
CREATE TABLE revisions (
  id INTEGER PRIMARY KEY,
  section_id INTEGER NOT NULL REFERENCES sections(id),
  data_snapshot TEXT NOT NULL,  -- vorheriger Stand
  changed_by INTEGER REFERENCES users(id),
  changed_at INTEGER NOT NULL,
  comment TEXT
);

-- Mediathek
CREATE TABLE media (
  id INTEGER PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,             -- R2-URL
  alt TEXT,
  size INTEGER,
  mime TEXT,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at INTEGER NOT NULL
);

-- Audit-Log
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,          -- 'login','section.update','section.delete',...
  target TEXT,                   -- z.B. 'section:42'
  metadata TEXT,                 -- JSON
  created_at INTEGER NOT NULL
);
```

---

## 5. Content-Schema — alle Sections von index.html

Jede Section hat einen Typ und ein JSON-Schema. Das Admin-UI rendert pro Typ ein passendes Formular.

| #  | Typ                  | Felder (Beispiele)                                                  |
| -- | -------------------- | ------------------------------------------------------------------- |
| 1  | `nav`                | logo, links[], cta_text, cta_url                                    |
| 2  | `hero`               | headline, subheadline, cta_primary, cta_secondary, badge_text       |
| 3  | `social_proof`       | items[] (text)                                                      |
| 4  | `pain`               | headline, items[] (icon, title, text)                               |
| 5  | `image_break`        | image_id, alt, overlay_text                                         |
| 6  | `stats`              | items[] (value, label)                                              |
| 7  | `how_it_works`       | headline, steps[] (number, title, text, icon)                       |
| 8  | `quote`              | text, author, role                                                  |
| 9  | `features_bento`     | headline, cards[] (size, title, text, image, icon)                  |
| 10 | `logo_marquee`       | logos[] (image_id, name, link)                                      |
| 11 | `testimonials`       | items[] (text, author, role, company, avatar_id, rating)            |
| 12 | `team`               | headline, members[] (name, role, photo_id, bio)                     |
| 13 | `partner_logos`      | logos[]                                                             |
| 14 | `branchen`           | headline, cards[] (name, icon, description, pain, solution)         |
| 15 | `roi_box`            | headline, bullets[], cta_text                                       |
| 16 | `calculator`         | headline, default_calls, savings_per_call, fields[]                 |
| 17 | `pricing`            | headline, plans[] (name, price, features[], highlight, cta)         |
| 18 | `faq`                | headline, items[] (question, answer)                                |
| 19 | `lead_magnet`        | headline, text, form_url, button_text                               |
| 20 | `cta_bar`            | text, button_text, button_url                                       |
| 21 | `footer`             | columns[], legal_links[], contact (phone, email, address)           |
| 22 | `cookie_banner`      | text, accept_text, decline_text                                     |
| 23 | `legal_impressum`    | content (Markdown)                                                  |
| 24 | `legal_datenschutz`  | content (Markdown)                                                  |
| 25 | `whatsapp_button`    | enabled, number, prefill_text                                       |
| 26 | `exit_intent`        | enabled, headline, text, cta                                        |

**Globale Settings (`settings`-Tabelle):**
- `site_title`, `meta_description`, `og_image`
- `brand_color_primary` (`--blue`), `brand_color_secondary` (`--navy`)
- `google_ads_id`, `ga4_id`, `pipedrive_form_url`
- `whatsapp_number`, `phone_number`, `email`
- `schema_org_json` (für SEO)

---

## 6. API-Endpoints

```
POST   /api/auth/login            → Login (E-Mail + Passwort)
POST   /api/auth/logout
GET    /api/auth/me               → aktueller User

GET    /api/sections              → alle Sections (sortiert)
GET    /api/sections/:id
POST   /api/sections              → neue Section anlegen
PATCH  /api/sections/:id          → Inhalte updaten (auto-revision)
DELETE /api/sections/:id          → Section löschen
PUT    /api/sections/reorder      → Reihenfolge ändern

GET    /api/sections/:id/revisions       → History
POST   /api/sections/:id/revisions/:rev  → Rollback

GET    /api/settings              → alle globalen Settings
PATCH  /api/settings              → Settings updaten

POST   /api/media/upload          → Bild hochladen (→ R2)
GET    /api/media                 → Mediathek auflisten
DELETE /api/media/:id

GET    /api/users                 → (admin only)
POST   /api/users                 → (admin only)
PATCH  /api/users/:id
DELETE /api/users/:id

POST   /api/preview               → temporäre Preview-URL erzeugen
POST   /api/cache/purge           → CF-Cache leeren (auto bei jedem save)

GET    /api/backup/export         → DB als JSON downloaden (admin only)
```

---

## 7. Admin-UI — Screens

### `/admin/login`
- E-Mail + Passwort
- "Angemeldet bleiben"-Checkbox
- Bei 3 Fehlversuchen: 60s Sperre

### `/admin` (Dashboard)
- Liste aller Sections — drag & drop sortierbar
- Pro Section: Vorschaubild + Titel + Sichtbarkeits-Toggle + Edit-Button + Löschen
- Button **"+ Section hinzufügen"** → Modal mit Typ-Auswahl
- Sidebar: Globale Settings, Mediathek, Benutzer, Backup, Logout
- **Live-Vorschau** (rechte Seite, optional aufklappbar)

### `/admin/section/:id` (Editor)
- Formular passend zum Typ (Felder aus Schema)
- Inline-Bild-Upload für jedes Bild-Feld → öffnet Mediathek-Picker
- Markdown-Editor für längere Texte (FAQ-Antworten, Datenschutz)
- "Vorschau"-Button (öffnet Site mit Draft-Cookie)
- "Speichern" + "Speichern & veröffentlichen"
- Versionsverlauf-Tab → letzte 20 Versionen, Rollback per Klick

### `/admin/media`
- Grid mit allen Bildern
- Drag & Drop Upload
- Pro Bild: alt-Text editierbar, Größe, "wird verwendet in:" (Liste der Sections)

### `/admin/users` (nur Admin)
- Liste mit Rolle
- Einladen per E-Mail (oder direkt anlegen)
- Passwort-Reset

### `/admin/settings` (nur Admin)
- Brand (Logo, Farben)
- SEO (Meta-Tags, og:image)
- Tracking-IDs (GA4, Google Ads, Pipedrive)
- Kontakt-Daten (in Footer + Schema.org)

---

## 8. Auth & Rollen

| Aktion                          | Admin | Editor |
| ------------------------------- | ----- | ------ |
| Sections bearbeiten             | ✅    | ✅     |
| Sections hinzufügen / löschen   | ✅    | ❌     |
| Globale Settings ändern         | ✅    | ❌     |
| Benutzer verwalten              | ✅    | ❌     |
| Backup erstellen                | ✅    | ❌     |
| Mediathek (upload, edit)        | ✅    | ✅     |
| Versions-Rollback               | ✅    | ✅     |

**Sicherheit:**
- Passwörter mit bcrypt (cost=12)
- Sessions mit `httpOnly`, `secure`, `sameSite=lax`-Cookies
- CSRF-Token bei mutating Requests
- Rate-Limiting auf `/api/auth/login` (5 Versuche / Minute / IP)
- Audit-Log für jede Änderung
- Admin-Routen require `role === 'admin'`

---

## 9. Deployment auf Coolify

### Dockerfile (vereinfacht)
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build  # nur falls TS
EXPOSE 3000
VOLUME ["/data"]   # SQLite + Uploads-Mirror
CMD ["node", "dist/server.js"]
```

### Coolify-Konfiguration
- **App-Typ:** Dockerfile
- **Volume-Mount:** `/data` → persistente DB
- **Env-Variablen:**
  - `SESSION_SECRET` (random 64-byte hex)
  - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET`
  - `CLOUDFLARE_API_TOKEN` (für Cache-Purge)
  - `CF_ZONE_ID`
  - `ADMIN_EMAIL` (für Initial-Setup)
- **Domain:** `heko-bs.de/voice` → reverse proxy zum Container
- **Health-Check:** `GET /api/health`

### Cloudflare-Konfiguration
- DNS: A-Record auf Coolify-Server-IP
- Page Rules:
  - `/admin/*` → Cache-Bypass
  - `/api/*` → Cache-Bypass
  - `/*` → Cache 1h, edge 24h
- API-Token (für Cache-Purge): Zone.Cache Purge

### Backup-Strategie
- **Automatisch:** SQLite-Snapshot 2× täglich → R2-Bucket (gezippt, datiert)
- **Manuell:** "Backup downloaden"-Button in Admin
- **Retention:** 30 Tage tägliche Backups

---

## 10. Roadmap — 4 Phasen

### Phase 1: Backend-Grundlage (~2 Tage)
- [ ] Repo-Struktur (`/server`, `/admin`, `/public`)
- [ ] Hono-Server, SQLite-Schema, Migrations
- [ ] Auth (Login, Sessions, bcrypt)
- [ ] User-Seed (1 Admin-User aus ENV anlegen)
- [ ] Dockerfile + lokal lauffähig

### Phase 2: Content-Migration (~2 Tage)
- [ ] `index.html` parsen → JSON-Content extrahieren
- [ ] Initial-Seed: alle 25 Sections mit aktuellen Inhalten in DB
- [ ] Public-Renderer: HTML aus DB rendern (1:1 wie aktuell)
- [ ] Sicherstellen: identische Optik wie statisches HTML

### Phase 3: Admin-Panel (~3 Tage)
- [ ] Login-Page
- [ ] Dashboard (Section-Liste, drag & drop)
- [ ] Editor pro Section-Typ (Formulare aus Schema)
- [ ] Mediathek + R2-Upload
- [ ] Versionsverlauf + Rollback
- [ ] Preview-Modus
- [ ] Benutzer-Verwaltung
- [ ] Settings-UI

### Phase 4: Deployment & Polishing (~1 Tag)
- [ ] Coolify-Deployment
- [ ] Cloudflare-Cache-Purge-Integration
- [ ] Backup-Cronjob
- [ ] Schulungs-Dokument für Team (Screenshots, Step-by-Step)
- [ ] Smoke-Tests

**Gesamt: ~8 Arbeitstage** (kann je nach Detailtiefe variieren)

---

## 11. Risiken & offene Fragen

### Risiken
| Risiko                                      | Mitigation                                                    |
| ------------------------------------------- | ------------------------------------------------------------- |
| Pipedrive-Form bricht durch dyn. Rendering  | Form als unveränderlichen Block belassen, nur Texte drumrum   |
| SEO-Verlust durch Server-Rendering          | Schema.org + Meta-Tags 1:1 übernehmen, sitemap.xml generieren |
| Performance schlechter als statisch         | Cloudflare-Cache + ETag, gleiche Lighthouse-Scores prüfen     |
| Editoren überschreiben sich gegenseitig     | Optimistic Locking (`updated_at`-Check) + Konflikt-Warnung    |
| DB-Datei korrupt                            | 2× tägliche Backups + WAL-Mode in SQLite                      |

### Offene Fragen für dich
1. **Domain-Setup:** Soll das CMS unter `heko-bs.de/voice/admin` laufen oder unter Subdomain wie `cms.heko-bs.de`?
2. **R2 vs lokales Volume:** Bilder in Cloudflare R2 (empfohlen) oder direkt im Coolify-Volume?
3. **Initial-Admin-User:** Welche E-Mail-Adresse soll der erste Admin-Account haben?
4. **`termin.html`:** Soll die Termin-Seite auch ins CMS, oder bleibt sie wie sie ist?
5. **Custom Domain für Tests:** Gibt es eine Staging-/Test-Domain auf Cloudflare, wo wir vorher testen können?
6. **Schulung:** Möchtest du am Ende ein Video-Walkthrough oder reicht ein bebildertes PDF?

---

## 12. Was als nächstes passiert

Nach deiner Freigabe dieses Konzepts:
1. Ich beantworte die offenen Fragen mit dir (Punkt 11)
2. Ich starte **Phase 1** (Backend-Grundlage) auf Branch `claude/fix-server-offline-Y53iH`
3. Pro Phase committe ich zwischendurch, du kannst jederzeit reviewen
4. Vor Live-Schaltung: gemeinsamer Test in einer Staging-Umgebung

**Bitte gib Feedback zu:**
- ❓ Ist der Funktionsumfang richtig (zu viel, zu wenig, fehlt was)?
- ❓ Tech-Stack: Einverstanden mit SQLite + Hono + Alpine.js?
- ❓ Roadmap: Reihenfolge sinnvoll, Zeit realistisch?
- ❓ Antworten zu den 6 offenen Fragen
