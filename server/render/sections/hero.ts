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
    badge: 'Cloud-Telefonie mit KI',
    headline_pre: 'Nie wieder ein Kundengespräch',
    headline_em: 'verpassen.',
    headline_post: '',
    subheadline:
      'HEKO Voice nimmt jeden Anruf an, fasst Gespräche zusammen und hält Sie erreichbar — auch wenn Sie es nicht sind.',
    cta_primary: { text: 'Kostenlosen System-Check buchen', url: 'termin.html' },
    cta_secondary: { text: 'So funktioniert’s', url: '#so-funktionierts' },
    trust_badges: ['DSGVO-konform', 'Server in DE', 'In 1–2 Wochen live'],
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
