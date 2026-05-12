import { z } from 'zod';
import { registerSectionType } from './types.js';
import { escapeHtml, safeUrl } from '../../lib/escape.js';

const ctaSchema = z.object({ text: z.string(), url: z.string() });

const schema = z.object({
  badge: z.string().default(''),
  headline_pre: z.string().default(''),
  headline_em: z.string().default(''),
  headline_post: z.string().default(''),
  subheadline: z.string().default(''),
  cta_primary: ctaSchema.default({ text: 'Termin buchen', url: 'termin.html' }),
  cta_secondary: ctaSchema.default({ text: 'Mehr erfahren', url: '#features' }),
  trust_badges: z.array(z.string()).default([]),
});

registerSectionType({
  id: 'hero',
  label: 'Hero (Startbereich)',
  description: 'Der erste Eindruck. Headline, Untertitel, zwei Buttons, Trust-Badges.',
  schema,
  defaults: () => ({
    badge: 'New',
    headline_pre: 'Your headline goes',
    headline_em: 'here.',
    headline_post: '',
    subheadline: 'A short, compelling subheadline. Edit me in the CMS.',
    cta_primary: { text: 'Get started', url: '#' },
    cta_secondary: { text: 'Learn more', url: '#' },
    trust_badges: ['Trust point 1', 'Trust point 2', 'Trust point 3'],
  }),
  render: (data) => {
    const p = schema.safeParse(data);
    if (!p.success) return '<!-- invalid hero -->';
    const d = p.data;
    const badges = d.trust_badges
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join('');
    return `<section class="hero">
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="hero-l">
    ${d.badge ? `<div class="el rv">${escapeHtml(d.badge)}</div>` : ''}
    <h1 class="rv d1">${escapeHtml(d.headline_pre)} <em>${escapeHtml(d.headline_em)}</em>${d.headline_post ? ' ' + escapeHtml(d.headline_post) : ''}</h1>
    <p class="hero-sub rv d2">${escapeHtml(d.subheadline)}</p>
    <div class="hero-cta rv d3">
      <a href="${safeUrl(d.cta_primary.url)}" class="btn btn-blue btn-l">${escapeHtml(d.cta_primary.text)} &rarr;</a>
      <a href="${safeUrl(d.cta_secondary.url)}" class="btn btn-ghost btn-l">${escapeHtml(d.cta_secondary.text)}</a>
    </div>
    ${badges ? `<ul class="trust-row rv d4">${badges}</ul>` : ''}
  </div>
</section>`;
  },
});
