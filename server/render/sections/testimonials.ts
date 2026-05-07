import { z } from 'zod';
import { registerSectionType } from './types.js';
import { escapeHtml } from '../../lib/escape.js';

const itemSchema = z.object({
  text: z.string(),
  author: z.string(),
  role: z.string().default(''),
  company: z.string().default(''),
  rating: z.number().min(0).max(5).default(5),
});

const schema = z.object({
  headline: z.string().default('Was Kunden sagen'),
  subheadline: z.string().default(''),
  items: z.array(itemSchema).default([]),
});

registerSectionType({
  id: 'testimonials',
  label: 'Kundenstimmen',
  description: 'Zitate von zufriedenen Kunden.',
  schema,
  defaults: () => ({
    headline: 'Was unsere Kunden sagen',
    subheadline: '',
    items: [
      {
        text: 'Wir haben endlich keine verpassten Anrufe mehr. Der KI-Assistent fasst jedes Gespräch sauber zusammen.',
        author: 'Maria Schmidt',
        role: 'Geschäftsführerin',
        company: 'Schmidt Handwerk GmbH',
        rating: 5,
      },
    ],
  }),
  render: (data) => {
    const p = schema.safeParse(data);
    if (!p.success) return '<!-- invalid testimonials -->';
    const d = p.data;
    const items = d.items
      .map((it) => {
        const stars = '★'.repeat(Math.round(it.rating)) + '☆'.repeat(5 - Math.round(it.rating));
        return `      <figure class="quote-card">
        <div class="stars" aria-label="${it.rating} von 5 Sternen">${stars}</div>
        <blockquote>${escapeHtml(it.text)}</blockquote>
        <figcaption>
          <strong>${escapeHtml(it.author)}</strong>
          ${it.role || it.company ? `<span>${escapeHtml([it.role, it.company].filter(Boolean).join(' · '))}</span>` : ''}
        </figcaption>
      </figure>`;
      })
      .join('\n');
    return `<section class="proof rv" id="proof">
  <div class="wrap">
    <h2>${escapeHtml(d.headline)}</h2>
    ${d.subheadline ? `<p class="lede">${escapeHtml(d.subheadline)}</p>` : ''}
    <div class="quotes">
${items}
    </div>
  </div>
</section>`;
  },
});
