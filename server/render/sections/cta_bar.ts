import { z } from 'zod';
import { registerSectionType } from './types.js';
import { escapeHtml, safeUrl } from '../../lib/escape.js';

const schema = z.object({
  headline: z.string().default(''),
  text: z.string().default(''),
  button_text: z.string().default('Jetzt buchen'),
  button_url: z.string().default('termin.html'),
  variant: z.enum(['blue', 'navy', 'light']).default('blue'),
});

registerSectionType({
  id: 'cta_bar',
  label: 'Call-to-Action Banner',
  description: 'Großer Aufruf zur Aktion (z.B. „Jetzt Termin buchen").',
  schema,
  defaults: () => ({
    headline: 'Bereit für nie wieder verpasste Anrufe?',
    text: '30 Minuten, kein Druck — wir analysieren Ihre Erreichbarkeit kostenlos.',
    button_text: 'Kostenlosen System-Check buchen',
    button_url: 'termin.html',
    variant: 'blue' as const,
  }),
  render: (data) => {
    const p = schema.safeParse(data);
    if (!p.success) return '<!-- invalid cta_bar -->';
    const d = p.data;
    return `<section class="cta-bar cta-${d.variant} rv">
  <div class="wrap cta-content">
    ${d.headline ? `<h2>${escapeHtml(d.headline)}</h2>` : ''}
    ${d.text ? `<p>${escapeHtml(d.text)}</p>` : ''}
    <a href="${safeUrl(d.button_url)}" class="btn btn-dark btn-l">${escapeHtml(d.button_text)} &rarr;</a>
  </div>
</section>`;
  },
});
