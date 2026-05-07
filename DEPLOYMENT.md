# Deployment-Anleitung — HEKO Voice CMS auf Coolify

Schritt-für-Schritt-Setup für `hekocms-preview.elevo.solutions`.

---

## Voraussetzungen

- Coolify-Server mit Zugriff
- Domain `hekocms-preview.elevo.solutions` zeigt per DNS auf den Coolify-Server (A-Record)
- Cloudflare API-Token (optional, für Cache-Purge)

---

## 1. Coolify-Projekt anlegen

1. In Coolify auf **+ New Resource** → **Application**.
2. Source: **Public Repository** (oder GitHub-Integration auf `elevo-business/hekovoice`).
3. Branch: `claude/fix-server-offline-Y53iH` (später `main`).
4. Build Pack: **Dockerfile** (nicht Nixpacks).
5. Port: `3000`.
6. Volume hinzufügen: Source `cms-data`, Destination `/data` (für SQLite + Uploads).

---

## 2. Environment-Variablen setzen

In Coolify unter **Environment Variables**:

| Key                    | Value                                                   | Pflicht |
| ---------------------- | ------------------------------------------------------- | ------- |
| `NODE_ENV`             | `production`                                            | ✅ |
| `SESSION_SECRET`       | Zufallswert, 64 Byte hex (siehe unten)                  | ✅ |
| `ADMIN_EMAIL`          | `hey@elevo.solutions`                                   | ✅ (nur erster Run) |
| `ADMIN_PASSWORD`       | sicheres Passwort, ≥ 10 Zeichen                         | ✅ (nur erster Run) |
| `ADMIN_NAME`           | `Admin`                                                 | optional |
| `DATABASE_PATH`        | `/data/cms.db`                                          | ✅ |
| `PUBLIC_URL`           | `https://hekocms-preview.elevo.solutions`               | ✅ |
| `CLOUDFLARE_API_TOKEN` | Token mit Cache-Purge-Recht                             | optional |
| `CF_ZONE_ID`           | Zone-ID von `elevo.solutions` aus dem Cloudflare-Dashboard | optional |

**SESSION_SECRET generieren** (lokal im Terminal):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> 🔒 **`ADMIN_PASSWORD` nach dem ersten Deploy entfernen!** Es wird nur einmalig zum Anlegen des Admin-Accounts genutzt. Danach bei Bedarf im Admin-Panel zurücksetzen.

---

## 3. Domain konfigurieren

In Coolify unter **Domains**:
- Domain: `hekocms-preview.elevo.solutions`
- Path: `/`
- HTTPS: aktivieren (Let's Encrypt)

In Cloudflare DNS:
- A-Record `hekocms-preview` → IP des Coolify-Servers
- Proxy: **Auf** (orange Wolke) für CDN-Caching

---

## 4. Cloudflare Page Rules / Cache Rules

Für optimales Caching unter Cloudflare → Rules → Page Rules (oder Cache Rules):

| URL-Match                                       | Verhalten              |
| ----------------------------------------------- | ---------------------- |
| `hekocms-preview.elevo.solutions/admin*`        | Cache: **Bypass**      |
| `hekocms-preview.elevo.solutions/api/*`         | Cache: **Bypass**      |
| `hekocms-preview.elevo.solutions/uploads/*`     | Cache: **30 Tage**     |
| `hekocms-preview.elevo.solutions/*`             | Cache: **1 Stunde** Edge, Browser **1 Min** |

> Der Server schickt bereits `Cache-Control: public, max-age=60, s-maxage=86400` für `/` und `/termin`. Cloudflare respektiert das automatisch — Page Rules sind nur Feinschliff.

---

## 5. Initial-Deployment

1. In Coolify auf **Deploy**.
2. Build dauert ~2 Minuten beim ersten Mal (Native Module für `better-sqlite3` + `bcrypt`).
3. Logs beobachten: erwartete Output:
   ```
   [migrate] applied 001_init.sql
   [migrate] applied 002_pages_and_seed.sql
   [server] listening on http://localhost:3000
   ```
4. Initial-Inhalte aus den HTML-Dateien laden (einmalig, nach erstem Deploy):
   - In Coolify → Container Terminal öffnen
   - Ausführen: `node dist/server/scripts/seed-content.js`
   - Erwartetet Output: `[seed-content] seeded 40 sections for "index"...`

---

## 6. Erster Login

1. Browser öffnen: `https://hekocms-preview.elevo.solutions/admin`
2. Login mit `ADMIN_EMAIL` und `ADMIN_PASSWORD`.
3. **`ADMIN_PASSWORD` jetzt aus Coolify-Env-Variablen entfernen** (Sicherheit).
4. Admin-Account funktioniert weiter — die Variable ist nur für die initiale Erstellung gedacht.

---

## 7. Smoke-Tests nach Deploy

Vom Browser:
- ✅ `https://hekocms-preview.elevo.solutions/` → Startseite rendert wie aktuell
- ✅ `https://hekocms-preview.elevo.solutions/termin` → Termin-Seite rendert
- ✅ `https://hekocms-preview.elevo.solutions/admin` → CMS-Login erscheint
- ✅ `https://hekocms-preview.elevo.solutions/api/health` → `{"status":"ok"}`

Im Admin:
- ✅ Login geht durch
- ✅ Sidebar zeigt alle Bereiche
- ✅ Sections-Liste zeigt 40 Einträge für „Startseite"
- ✅ Klick auf Section → Editor öffnet
- ✅ Bild-Upload in Mediathek funktioniert

---

## 8. Backup-Strategie

### Automatisch (empfohlen)

Coolify-Cronjob anlegen (oder externer Scheduler):
- **Frequenz:** 2× täglich (z.B. 03:00 und 15:00)
- **Befehl:** `cp /data/cms.db /data/backups/cms-$(date +\%Y\%m\%d-\%H\%M).db && find /data/backups -name '*.db' -mtime +30 -delete`

Optional: Backups auf S3/R2 hochladen mit `rclone` oder via Cloudflare-R2-CLI.

### Manuell

In der Admin-UI: Sidebar → 💾 Backup → JSON herunterladen.

---

## 9. Updates / Re-Deploys

1. Code-Änderungen auf Branch pushen.
2. In Coolify: **Deploy** klicken (oder Auto-Deploy bei Push aktivieren).
3. Build → Container-Restart → live.
4. Daten in `/data/cms.db` und `/data/uploads/` bleiben durch Volume erhalten.
5. Bei Schema-Änderungen werden Migrations automatisch ausgeführt.

---

## 10. Troubleshooting

### Container startet nicht

Logs in Coolify prüfen. Häufigste Ursache: `SESSION_SECRET` zu kurz (< 32 Zeichen) → Server stürzt mit Validierungs-Fehler ab.

### Login funktioniert nicht

- HTTPS aktiv? Cookies werden in Production nur via HTTPS gesetzt.
- Cookie blockiert? Cross-Site-Restrictions prüfen.
- Account existiert? In Container-Shell: `sqlite3 /data/cms.db "SELECT email,role FROM users;"`

### Bilder werden nach Upload nicht angezeigt

- Volume `/data` korrekt gemountet? In Coolify-Resource-Settings prüfen.
- Datei wirklich gespeichert? `ls /data/uploads/` im Container-Shell.

### Cache zeigt alte Inhalte

- Cloudflare Cache-Purge: in CF-Dashboard → Caching → **Purge Everything**
- Alternativ: API-Token + Zone-ID in Env setzen, dann macht das CMS das automatisch bei jedem Save.

---

## Migration auf Production-Domain (später)

Wenn das System unter `hekocms-preview.elevo.solutions` getestet ist und live gehen soll:

1. Neue Coolify-App mit produktiver Domain anlegen (z.B. `cms.heko-bs.de` oder `heko-bs.de/voice`).
2. **Volume kopieren:** alte Coolify-App → SQLite-Datei und `uploads/` ins neue Volume kopieren.
3. DNS umstellen.
4. Initiales Seeding **nicht** nochmal ausführen (Daten sind ja schon da).
5. Smoke-Tests wie oben.

---

*Stand: Mai 2026 · Version 1.0*
