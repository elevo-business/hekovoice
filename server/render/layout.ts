import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { escapeHtml } from '../lib/escape.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = join(__dirname, 'templates');

const templateCache = new Map<string, string>();

function loadTemplate(name: string): string {
  const cached = templateCache.get(name);
  if (cached !== undefined) return cached;
  const path = join(TEMPLATE_DIR, name);
  if (!existsSync(path)) throw new Error(`template not found: ${name}`);
  const content = readFileSync(path, 'utf8');
  templateCache.set(name, content);
  return content;
}

export interface LayoutContext {
  slug: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDesc: string;
  ogImage: string;
  configOverrides: Record<string, unknown>;
  bodyHtml: string;
  extraHead?: string;
}

export function renderLayout(ctx: LayoutContext): string {
  const headTpl = loadTemplate(`${ctx.slug}.head.html`);
  const tailTpl = loadTemplate(`${ctx.slug}.tail.html`);

  const overridesJson = JSON.stringify(ctx.configOverrides ?? {});
  const overrideScript =
    Object.keys(ctx.configOverrides ?? {}).length > 0
      ? `<script>(function(){try{Object.assign(window.HEKO_CONFIG||(window.HEKO_CONFIG={}),${overridesJson});}catch(e){console.error('config override failed',e)}})();</script>`
      : '';

  const head = headTpl
    .replaceAll('{{TITLE}}', escapeHtml(ctx.title))
    .replaceAll('{{META_DESC}}', escapeHtml(ctx.description))
    .replaceAll('{{OG_TITLE}}', escapeHtml(ctx.ogTitle))
    .replaceAll('{{OG_DESC}}', escapeHtml(ctx.ogDesc))
    .replaceAll('{{OG_IMAGE}}', escapeHtml(ctx.ogImage))
    .replaceAll('{{CONFIG_OVERRIDES}}', `${ctx.extraHead ?? ''}${overrideScript}`);

  return `${head}\n${ctx.bodyHtml}\n${tailTpl}`;
}
