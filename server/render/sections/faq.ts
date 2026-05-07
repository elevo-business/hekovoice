import { z } from 'zod';
import { registerSectionType } from './types.js';
import { escapeHtml } from '../../lib/escape.js';

const schema = z.object({
  headline: z.string().default('Häufig gestellte Fragen'),
  subheadline: z.string().default(''),
  items: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .default([]),
});

registerSectionType({
  id: 'faq',
  label: 'FAQ (Häufige Fragen)',
  description: 'Aufklappbare Frage-Antwort-Liste. Wird auch als Schema.org-FAQ ausgegeben.',
  schema,
  defaults: () => ({
    headline: 'Häufig gestellte Fragen',
    subheadline: 'Was Sie wissen sollten, bevor Sie umsteigen.',
    items: [
      { question: 'Behalte ich meine bestehenden Rufnummern?', answer: 'Ja, zu 100%. Wir portieren alle Rufnummern nahtlos.' },
      { question: 'Wie lange dauert die Umstellung?', answer: 'In der Regel 1–2 Wochen.' },
    ],
  }),
  render: (data) => {
    const p = schema.safeParse(data);
    if (!p.success) return '<!-- invalid faq -->';
    const d = p.data;
    const items = d.items
      .map(
        (it) => `      <details class="faq-i">
        <summary>${escapeHtml(it.question)}</summary>
        <div class="faq-a">${escapeHtml(it.answer)}</div>
      </details>`,
      )
      .join('\n');
    return `<section class="faq rv" id="faq">
  <div class="wrap">
    <div class="faq-head">
      <h2>${escapeHtml(d.headline)}</h2>
      ${d.subheadline ? `<p>${escapeHtml(d.subheadline)}</p>` : ''}
    </div>
    <div class="faq-list">
${items}
    </div>
  </div>
</section>`;
  },
});

export function buildFaqSchemaJson(items: { question: string; answer: string }[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    })),
  });
}
