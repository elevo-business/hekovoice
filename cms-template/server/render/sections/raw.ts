import { z } from 'zod';
import { registerSectionType } from './types.js';

const schema = z.object({
  label: z.string().default('HTML-Block'),
  html: z.string().default(''),
});

registerSectionType({
  id: 'raw_html',
  label: 'HTML-Block (frei)',
  description: 'Beliebiger HTML-Code. Geeignet für komplexe Bereiche, die noch keinen typisierten Editor haben.',
  schema,
  defaults: () => ({ label: 'Neuer HTML-Block', html: '<section class="rv">\n  <h2>Überschrift</h2>\n  <p>Text…</p>\n</section>' }),
  render: (data) => {
    const parsed = schema.safeParse(data);
    if (!parsed.success) return '<!-- invalid raw_html -->';
    return parsed.data.html;
  },
});
