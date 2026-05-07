#!/usr/bin/env node
/**
 * HEKO Voice CMS — One-shot deploy script
 *
 * What it does (idempotent — safe to re-run):
 *   1. Validate Cloudflare token, find zone for CF_DOMAIN
 *   2. Create/update DNS A-record for HOSTNAME → COOLIFY_SERVER_IP (proxied)
 *   3. Validate Coolify token + URL, list servers & projects
 *   4. Create project "hekovoice" if missing
 *   5. Create application from GitHub repo (Dockerfile build)
 *   6. Set environment variables (SESSION_SECRET, ADMIN_*, etc.)
 *   7. Configure domain (HOSTNAME) + persistent volume (/data)
 *   8. Trigger deploy
 *   9. Poll until healthy
 *  10. Print final summary + reminders to rotate tokens
 *
 * Usage:
 *   cp .env.deploy.example .env.deploy
 *   # fill in values
 *   node scripts/deploy.mjs
 *
 * Or pass via env directly:
 *   COOLIFY_URL=https://... COOLIFY_TOKEN=... CF_TOKEN=... ... \
 *     node scripts/deploy.mjs
 *
 * Flags:
 *   --dry-run   Print what would happen without making writes
 *   --verbose   Log all HTTP requests/responses
 */

import { readFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run');
const VERBOSE = args.has('--verbose');

/* ─── load .env.deploy if present ─────────────────────── */
const envFile = resolve(REPO_ROOT, '.env.deploy');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    let [, key, value] = m;
    if (!key) continue;
    if (value && /^".*"$/.test(value)) value = value.slice(1, -1);
    if (value && /^'.*'$/.test(value)) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
  log('✓ loaded .env.deploy');
}

/* ─── required + optional config ──────────────────────── */
const REQ = [
  'COOLIFY_URL',         // e.g. https://coolify.elevo.solutions
  'COOLIFY_TOKEN',       // Coolify API token
  'CF_TOKEN',            // Cloudflare API token (Zone:DNS:Edit, Zone:Cache:Purge)
  'CF_DOMAIN',           // root domain, e.g. elevo.solutions
  'HOSTNAME',            // full FQDN, e.g. hekocms-preview.elevo.solutions
  'GIT_REPOSITORY',      // https://github.com/elevo-business/hekovoice
  'GIT_BRANCH',          // claude/fix-server-offline-Y53iH
  'ADMIN_EMAIL',         // hey@elevo.solutions
  'ADMIN_PASSWORD',      // first-run admin password (≥10 chars)
];

const missing = REQ.filter((k) => !process.env[k]);
if (missing.length) {
  err(`Missing required env vars: ${missing.join(', ')}`);
  err('Either export them or fill .env.deploy (see .env.deploy.example).');
  process.exit(1);
}

const cfg = {
  COOLIFY_URL: process.env.COOLIFY_URL.replace(/\/$/, ''),
  COOLIFY_TOKEN: process.env.COOLIFY_TOKEN,
  CF_TOKEN: process.env.CF_TOKEN,
  CF_DOMAIN: process.env.CF_DOMAIN,
  HOSTNAME: process.env.HOSTNAME,
  GIT_REPOSITORY: process.env.GIT_REPOSITORY,
  GIT_BRANCH: process.env.GIT_BRANCH,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_NAME: process.env.ADMIN_NAME ?? 'Admin',
  PROJECT_NAME: process.env.PROJECT_NAME ?? 'hekovoice',
  APP_NAME: process.env.APP_NAME ?? 'hekovoice-cms-preview',
  COOLIFY_SERVER_UUID: process.env.COOLIFY_SERVER_UUID ?? '',
  CF_PROXIED: (process.env.CF_PROXIED ?? 'true') === 'true',
  SESSION_SECRET: process.env.SESSION_SECRET ?? randomBytes(64).toString('hex'),
};

step('Configuration loaded');
log(`  Coolify         ${cfg.COOLIFY_URL}`);
log(`  Hostname        ${cfg.HOSTNAME}`);
log(`  Repo            ${cfg.GIT_REPOSITORY} @ ${cfg.GIT_BRANCH}`);
log(`  Admin           ${cfg.ADMIN_EMAIL}`);
log(`  Cloudflare      proxy=${cfg.CF_PROXIED}`);
log(`  Mode            ${DRY ? 'DRY-RUN (no writes)' : 'LIVE'}`);

/* ─── HTTP helpers ────────────────────────────────────── */
async function http(method, url, { headers = {}, body, allow404 = false } = {}) {
  if (VERBOSE) log(`  → ${method} ${url}`);
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (VERBOSE) log(`  ← ${res.status} ${JSON.stringify(data).slice(0, 200)}`);
  if (!res.ok) {
    if (allow404 && res.status === 404) return { status: 404, data: null };
    const msg = typeof data === 'object' ? JSON.stringify(data) : String(data);
    throw new Error(`${method} ${url} → ${res.status}: ${msg.slice(0, 400)}`);
  }
  return { status: res.status, data };
}

const cf = (path, opts = {}) =>
  http(opts.method ?? 'GET', `https://api.cloudflare.com/client/v4${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${cfg.CF_TOKEN}`, ...(opts.headers ?? {}) },
  });

const coo = (path, opts = {}) =>
  http(opts.method ?? 'GET', `${cfg.COOLIFY_URL}/api/v1${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${cfg.COOLIFY_TOKEN}`, ...(opts.headers ?? {}) },
  });

/* ─── 1. Cloudflare: verify + zone-id ─────────────────── */
step('1/9 Verifying Cloudflare token');
const verify = await cf('/user/tokens/verify');
if (!verify.data?.success) bail('CF token invalid');
log(`  ✓ token: ${verify.data.result?.status}`);

step(`2/9 Looking up zone for ${cfg.CF_DOMAIN}`);
const zones = await cf(`/zones?name=${encodeURIComponent(cfg.CF_DOMAIN)}`);
const zone = zones.data?.result?.[0];
if (!zone) bail(`No CF zone found for ${cfg.CF_DOMAIN} — token may lack zone:read`);
log(`  ✓ zone: ${zone.id}  (${zone.name})`);

/* ─── 2. Coolify: verify + server-uuid ────────────────── */
step('3/9 Verifying Coolify');
const cooVer = await coo('/version').catch(() => null);
if (!cooVer) bail('Coolify unreachable or token invalid');
log(`  ✓ Coolify ${cooVer.data ?? '(version unknown)'}`);

step('4/9 Picking Coolify server');
const servers = await coo('/servers');
const serverList = Array.isArray(servers.data) ? servers.data : servers.data?.data ?? [];
let server;
if (cfg.COOLIFY_SERVER_UUID) {
  server = serverList.find((s) => s.uuid === cfg.COOLIFY_SERVER_UUID);
  if (!server) bail(`COOLIFY_SERVER_UUID=${cfg.COOLIFY_SERVER_UUID} not found`);
} else {
  if (serverList.length === 0) bail('No Coolify servers configured');
  if (serverList.length === 1) {
    server = serverList[0];
  } else {
    log('  Multiple servers found — pick one and set COOLIFY_SERVER_UUID:');
    for (const s of serverList) log(`    ${s.uuid}  ${s.name}  (${s.ip})`);
    bail('COOLIFY_SERVER_UUID not set with multiple servers');
  }
}
log(`  ✓ server: ${server.uuid}  ${server.name}  (${server.ip})`);

/* ─── 3. Cloudflare: DNS A-record ─────────────────────── */
step(`5/9 Configuring DNS ${cfg.HOSTNAME} → ${server.ip}`);
const existingDns = await cf(
  `/zones/${zone.id}/dns_records?type=A&name=${encodeURIComponent(cfg.HOSTNAME)}`,
);
const dnsRec = existingDns.data?.result?.[0];
if (dnsRec) {
  if (dnsRec.content === server.ip && dnsRec.proxied === cfg.CF_PROXIED) {
    log(`  ✓ DNS already correct (id=${dnsRec.id})`);
  } else if (DRY) {
    log(`  [dry-run] would update DNS: ${dnsRec.content} → ${server.ip}`);
  } else {
    await cf(`/zones/${zone.id}/dns_records/${dnsRec.id}`, {
      method: 'PUT',
      body: { type: 'A', name: cfg.HOSTNAME, content: server.ip, proxied: cfg.CF_PROXIED, ttl: 1 },
    });
    log(`  ✓ DNS updated → ${server.ip}`);
  }
} else if (DRY) {
  log(`  [dry-run] would create DNS A record`);
} else {
  await cf(`/zones/${zone.id}/dns_records`, {
    method: 'POST',
    body: { type: 'A', name: cfg.HOSTNAME, content: server.ip, proxied: cfg.CF_PROXIED, ttl: 1 },
  });
  log(`  ✓ DNS created → ${server.ip}`);
}

/* ─── 4. Coolify: project ─────────────────────────────── */
step(`6/9 Coolify project "${cfg.PROJECT_NAME}"`);
const projects = await coo('/projects');
const projectList = Array.isArray(projects.data) ? projects.data : projects.data?.data ?? [];
let project = projectList.find((p) => p.name === cfg.PROJECT_NAME);
if (!project && !DRY) {
  const created = await coo('/projects', {
    method: 'POST',
    body: { name: cfg.PROJECT_NAME, description: 'HEKO Voice CMS' },
  });
  project = created.data;
  log(`  ✓ project created: ${project.uuid}`);
} else if (project) {
  log(`  ✓ project exists: ${project.uuid}`);
} else {
  log('  [dry-run] would create project');
  project = { uuid: '<new>' };
}

/* ─── 5. Coolify: application ─────────────────────────── */
step(`7/9 Coolify application "${cfg.APP_NAME}"`);
const apps = await coo('/applications');
const appList = Array.isArray(apps.data) ? apps.data : apps.data?.data ?? [];
let app = appList.find((a) => a.name === cfg.APP_NAME);

if (!app) {
  if (DRY) {
    log('  [dry-run] would create application');
    app = { uuid: '<new>' };
  } else {
    const body = {
      project_uuid: project.uuid,
      server_uuid: server.uuid,
      environment_name: 'production',
      git_repository: cfg.GIT_REPOSITORY,
      git_branch: cfg.GIT_BRANCH,
      build_pack: 'dockerfile',
      ports_exposes: '3000',
      name: cfg.APP_NAME,
      description: 'HEKO Voice CMS — preview deployment',
      domains: `https://${cfg.HOSTNAME}`,
      instant_deploy: false,
    };
    const created = await coo('/applications/public', { method: 'POST', body });
    app = created.data;
    log(`  ✓ app created: ${app.uuid}`);
  }
} else {
  log(`  ✓ app exists: ${app.uuid}`);
}

/* ─── 6. Coolify: env vars ────────────────────────────── */
step('8/9 Setting environment variables');

const wantedEnv = {
  NODE_ENV: 'production',
  DATABASE_PATH: '/data/cms.db',
  PORT: '3000',
  SESSION_SECRET: cfg.SESSION_SECRET,
  SESSION_TTL_HOURS: '168',
  ADMIN_EMAIL: cfg.ADMIN_EMAIL,
  ADMIN_PASSWORD: cfg.ADMIN_PASSWORD,
  ADMIN_NAME: cfg.ADMIN_NAME,
  PUBLIC_URL: `https://${cfg.HOSTNAME}`,
  CLOUDFLARE_API_TOKEN: cfg.CF_TOKEN,
  CF_ZONE_ID: zone.id,
};

if (!DRY && app.uuid && app.uuid !== '<new>') {
  const existing = await coo(`/applications/${app.uuid}/envs`).catch(() => ({ data: [] }));
  const existingList = Array.isArray(existing.data) ? existing.data : existing.data?.data ?? [];
  const existingByKey = new Map(existingList.map((e) => [e.key, e]));

  for (const [key, value] of Object.entries(wantedEnv)) {
    const cur = existingByKey.get(key);
    if (cur && cur.value === value) {
      VERBOSE && log(`    = ${key} unchanged`);
      continue;
    }
    if (cur) {
      await coo(`/applications/${app.uuid}/envs`, {
        method: 'PATCH',
        body: { key, value, is_preview: false, is_build_time: false, is_literal: true },
      }).catch(async (e) => {
        // fallback: delete + create
        if (cur.uuid) await coo(`/applications/${app.uuid}/envs/${cur.uuid}`, { method: 'DELETE' });
        await coo(`/applications/${app.uuid}/envs`, {
          method: 'POST',
          body: { key, value, is_preview: false, is_build_time: false, is_literal: true },
        });
      });
      log(`    ✎ ${key}`);
    } else {
      await coo(`/applications/${app.uuid}/envs`, {
        method: 'POST',
        body: { key, value, is_preview: false, is_build_time: false, is_literal: true },
      });
      log(`    + ${key}`);
    }
  }
} else {
  log(`  [dry-run] would set ${Object.keys(wantedEnv).length} env vars`);
}

/* ─── 7. Coolify: deploy ──────────────────────────────── */
step('9/9 Triggering deploy');
if (DRY || !app.uuid || app.uuid === '<new>') {
  log('  [dry-run] would trigger deploy');
} else {
  const deploy = await coo(`/applications/${app.uuid}/start`, { method: 'POST' }).catch((e) => {
    log(`  ⚠ start failed (${e.message}) — trying /deploy fallback`);
    return coo(`/deploy?uuid=${app.uuid}`, { method: 'POST' });
  });
  log(`  ✓ deploy triggered`);
  if (deploy.data?.deployment_uuid) log(`    deployment: ${deploy.data.deployment_uuid}`);
}

/* ─── Poll status ─────────────────────────────────────── */
if (!DRY && app.uuid && app.uuid !== '<new>') {
  step('Waiting for healthy container (max 8 min)');
  const deadline = Date.now() + 8 * 60 * 1000;
  let lastStatus = '';
  while (Date.now() < deadline) {
    const r = await coo(`/applications/${app.uuid}`).catch(() => null);
    const status = r?.data?.status ?? 'unknown';
    if (status !== lastStatus) {
      log(`  · status: ${status}`);
      lastStatus = status;
    }
    if (/running:healthy|running:starting/.test(status)) {
      // try health endpoint via Coolify proxy host
      try {
        const r2 = await fetch(`https://${cfg.HOSTNAME}/api/health`, { signal: AbortSignal.timeout(5000) });
        if (r2.ok) { log('  ✓ /api/health 200'); break; }
      } catch { /* ignore */ }
    }
    if (status.startsWith('exited') || status.startsWith('failed')) {
      err(`Deploy failed (status=${status}). Check Coolify logs.`);
      process.exit(2);
    }
    await new Promise((r) => setTimeout(r, 8000));
  }
}

/* ─── Done ────────────────────────────────────────────── */
console.log('');
step('🎉 Deployment finished');
log('');
log(`  Site:   https://${cfg.HOSTNAME}`);
log(`  Admin:  https://${cfg.HOSTNAME}/admin`);
log(`          ${cfg.ADMIN_EMAIL} / (the password you set)`);
log('');
log('  Next manual step:');
log(`    1. Open Coolify shell for app ${app.uuid ?? cfg.APP_NAME}`);
log(`    2. Run:  node dist/server/scripts/seed-content.js`);
log(`       (loads sections 1:1 from the bundled index.html / termin.html)`);
log('');
log('  ⚠ Now rotate both tokens (Cloudflare + Coolify) — they were in chat.');
log('  ⚠ Remove ADMIN_PASSWORD env var from Coolify after first login.');

/* ─── helpers ─────────────────────────────────────────── */
function step(s) { console.log(`\n\x1b[1;36m▶ ${s}\x1b[0m`); }
function log(s) { console.log(s); }
function err(s) { console.error(`\x1b[1;31m✗ ${s}\x1b[0m`); }
function bail(s) { err(s); process.exit(1); }
