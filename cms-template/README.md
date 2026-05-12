# CMS Template

A lightweight, self-hostable section-based CMS for static-feeling websites.
Hono + SQLite + Alpine.js, single Docker container, ~30 source files.

## What you get

- **Public renderer** — server-rendered HTML from a SQLite-backed sections list.
- **Admin SPA** at `/admin` — sidebar nav, section list with drag-reorder, Shopify-style
  split-screen live preview, no-code text editor for raw HTML sections (including
  texts inside `<script>` literals), typed sections (hero/CTA/FAQ/pricing/testimonials),
  media library, settings, user management, JSON backup export.
- **Auth** — bcrypt cost-12, session cookies (httpOnly, sameSite=Lax), rate-limited login.
- **Migrations** — run on boot, idempotent.
- **Auto-seed** — admin user from `ADMIN_EMAIL`/`ADMIN_PASSWORD` env on first boot.
- **Dockerfile** — multi-stage, ~150 MB final image, runs Node 22.

## Quick start (local)

```bash
npm install
echo "SESSION_SECRET=$(openssl rand -hex 32)" > .env
echo "ADMIN_EMAIL=admin@example.com" >> .env
echo "ADMIN_PASSWORD=$(openssl rand -base64 24)" >> .env
npm run dev
# → http://localhost:3000        (public site)
# → http://localhost:3000/admin  (CMS)
```

## Required env vars

| Var | Required | Default | Purpose |
|---|---|---|---|
| `SESSION_SECRET` | yes | — | min 32 chars, signs session cookies |
| `ADMIN_EMAIL` | first boot | — | bootstraps an admin account |
| `ADMIN_PASSWORD` | first boot | — | min 10 chars |
| `ADMIN_NAME` | no | `Admin` | display name for the seeded user |
| `DATABASE_PATH` | no | `./data/cms.db` | sqlite file location |
| `PORT` | no | `3000` | |
| `PUBLIC_URL` | no | `http://localhost:3000` | used in absolute URLs |
| `SESSION_TTL_HOURS` | no | `168` | (7 days) |
| `R2_*` | no | — | Cloudflare R2 for media (optional; falls back to local disk) |
| `CLOUDFLARE_API_TOKEN`, `CF_ZONE_ID` | no | — | enables cache-purge on save |

## Adapting it to your project

1. **Add a page**: drop `{slug}.head.html` and `{slug}.tail.html` into
   `server/render/templates/`, then add `{ slug }` to the `PAGES` array in
   `server/lib/seed-content.ts`. Templates support `{{TITLE}}`, `{{META_DESC}}`,
   `{{OG_TITLE}}`, `{{OG_DESC}}`, `{{OG_IMAGE}}`, `{{CONFIG_OVERRIDES}}`.
2. **Add a section type**: copy `server/render/sections/hero.ts` → give it a new
   `id`, define the zod `schema`, write `render(data)`. It auto-appears in the
   admin "Section hinzufügen" dropdown.
3. **Migrate an existing static site**: drop your `whatever.html` files at the
   repo root and add `{ slug: 'page', file: 'whatever.html' }` to the `PAGES`
   array. On first boot, the body is split at `<!-- ═══ Label ═══ -->` comment
   markers and seeded as `raw_html` sections — editors then use the no-code
   "Texte" tab to edit copy without touching markup.
4. **Brand the admin**: edit `server/admin-ui/index.html` title + h1 ("CMS").
   Visual tokens are in `server/admin-ui/styles.css` `:root` (brand colors,
   radii, shadows, motion). Icon set is in `server/admin-ui/app.js` top.
5. **Brand the settings groups**: edit `SETTINGS_GROUPS` + `SETTINGS_LABELS`
   in `server/admin-ui/app.js`. Default settings are seeded in
   `server/db/migrations/002_pages_and_seed.sql`.

## Deploy (Coolify / any Docker host)

```dockerfile
# A Dockerfile is included. Just point Coolify at your git repo.
# Set env vars in the Coolify UI:
#   SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, PUBLIC_URL
# Mount a persistent volume at /app/data (sqlite lives there).
```

## File map

```
server/
├── index.ts              # boot, mounts routes, runs migrations + seeds
├── config.ts             # zod env schema
├── auth/                 # bcrypt + session cookies + login rate-limit
├── db/                   # better-sqlite3 + migrations
├── lib/                  # cache, escape, audit, storage (R2/local), seed-{user,content}
├── middleware/auth.ts    # require-login wrapper
├── render/               # public-page server renderer
│   ├── layout.ts         # head/tail template loader
│   ├── page.ts           # main renderer
│   ├── sections/         # typed section render fns (hero, faq, raw, ...)
│   └── templates/        # {slug}.head.html / {slug}.tail.html
├── routes/               # /api/* + /admin/* + public catch-all
├── admin-ui/             # static SPA — app.js (Alpine), index.html, styles.css
└── scripts/              # cli: migrate, seed
```

## License

Use it however you like. No warranty.
