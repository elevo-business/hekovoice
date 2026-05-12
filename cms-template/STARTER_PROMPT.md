# Starter prompt for a new Claude Code session

Paste the block below into a new Claude Code session **after** you have copied
the `cms-template/` contents into your project directory. It briefs Claude on
what's already in place so it can start adapting/extending instead of explaining.

---

```
I have a section-based CMS template installed in this repo (see README.md at
the root). It's a Hono + SQLite + Alpine.js single-container app:

- Public pages are server-rendered from a sections list in SQLite.
- Admin SPA is at /admin (Shopify-style split-screen editor with live preview,
  no-code text extraction for raw_html sections, typed sections, media library,
  settings, users, backup).
- Auth uses bcrypt + httpOnly session cookies.
- Migrations + admin auto-seed run on boot.

What I want to do is: <DESCRIBE YOUR GOAL — e.g. "migrate my existing static
site at ./public/index.html into the CMS so non-tech teammates can edit copy"
or "add a 'team' page with bio cards" or "deploy this to Coolify at
mysite.example.com" or "add a blog section type with markdown body and
cover image">.

Before you start:
1. Read README.md to understand the file layout and adaptation points.
2. Read server/index.ts to confirm boot wiring.
3. Ask me clarifying questions only if the goal is ambiguous — otherwise plan
   the change as a small set of focused edits and execute.

Constraints:
- Keep the codebase small. No new dependencies unless I approve.
- Don't reorganize directories. Follow the existing conventions.
- For any DB schema change, add a new migration file in
  server/db/migrations/NNN_*.sql — don't edit old ones.
- For any new section type, copy an existing one in server/render/sections/
  and register via registerSectionType.
- Test locally with `npm run dev` after each meaningful change.
```

---

## Tips for adapting it

- **The smallest "make it mine" PR**: change the `<title>`/`<h1>` in
  `server/admin-ui/index.html`, swap brand colors in `server/admin-ui/styles.css`
  `:root`, replace `server/render/templates/index.head.html` with your real
  head, set `ADMIN_EMAIL`/`ADMIN_PASSWORD` env, deploy.
- **Add another page**: drop `{slug}.head.html` + `{slug}.tail.html` into
  `server/render/templates/`, add `{ slug: 'newpage' }` to `PAGES` in
  `server/lib/seed-content.ts`, add a sidebar nav button in
  `server/admin-ui/index.html`.
- **Migrate an existing site**: drop your `index.html` at the repo root, add
  `{ slug: 'index', file: 'index.html' }` in `seed-content.ts`, boot once.
  The body is split at `<!-- ═══ Section name ═══ -->` markers — pre-insert
  those before seeding if you want clean section boundaries.
- **Rotate everything before exposing**: regenerate `SESSION_SECRET`, rotate
  the bootstrap admin password, never commit `.env`.
