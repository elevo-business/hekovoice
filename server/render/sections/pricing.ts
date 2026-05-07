import { z } from 'zod';
import { registerSectionType } from './types.js';
import { escapeHtml, safeUrl } from '../../lib/escape.js';

const planSchema = z.object({
  name: z.string(),
  price: z.string(),
  period: z.string().default('/ Monat'),
  features: z.array(z.string()).default([]),
  cta_text: z.string().default('Auswählen'),
  cta_url: z.string().default('termin.html'),
  highlight: z.boolean().default(false),
  badge: z.string().default(''),
});

const schema = z.object({
  headline: z.string().default('Transparente Preise'),
  subheadline: z.string().default(''),
  plans: z.array(planSchema).default([]),
});

registerSectionType({
  id: 'pricing',
  label: 'Preise & Pakete',
  description: 'Tarif-Tabelle mit beliebig vielen Plänen.',
  schema,
  defaults: () => ({
    headline: 'Transparente Preise — keine versteckten Kosten',
    subheadline: 'Wählen Sie das Paket, das zu Ihrem Team passt.',
    plans: [
      {
        name: 'Starter',
        price: '9,90 €',
        period: '/ Nutzer / Monat',
        features: ['Cloud-Anlage', '1 Rufnummer', 'Mobile App'],
        cta_text: 'Termin buchen',
        cta_url: 'termin.html',
        highlight: false,
        badge: '',
      },
      {
        name: 'Pro',
        price: '14,90 €',
        period: '/ Nutzer / Monat',
        features: ['Alles aus Starter', 'KI-Assistent', 'Teams-Integration', 'Gesprächs-Zusammenfassung'],
        cta_text: 'Termin buchen',
        cta_url: 'termin.html',
        highlight: true,
        badge: 'Beliebt',
      },
      {
        name: 'Business',
        price: '19,90 €',
        period: '/ Nutzer / Monat',
        features: ['Alles aus Pro', 'CRM-Anbindung', 'Premium-Support'],
        cta_text: 'Termin buchen',
        cta_url: 'termin.html',
        highlight: false,
        badge: '',
      },
    ],
  }),
  render: (data) => {
    const p = schema.safeParse(data);
    if (!p.success) return '<!-- invalid pricing -->';
    const d = p.data;
    const plans = d.plans
      .map(
        (pl) => `      <div class="plan${pl.highlight ? ' plan-hl' : ''}">
        ${pl.badge ? `<div class="plan-badge">${escapeHtml(pl.badge)}</div>` : ''}
        <h3 class="plan-name">${escapeHtml(pl.name)}</h3>
        <div class="plan-price"><span class="plan-amount">${escapeHtml(pl.price)}</span><span class="plan-period">${escapeHtml(pl.period)}</span></div>
        <ul class="plan-feats">
${pl.features.map((f) => `          <li>${escapeHtml(f)}</li>`).join('\n')}
        </ul>
        <a href="${safeUrl(pl.cta_url)}" class="btn ${pl.highlight ? 'btn-blue' : 'btn-ghost'} btn-m">${escapeHtml(pl.cta_text)}</a>
      </div>`,
      )
      .join('\n');
    return `<section class="pricing rv">
  <div class="wrap">
    <div class="pricing-head">
      <h2>${escapeHtml(d.headline)}</h2>
      ${d.subheadline ? `<p>${escapeHtml(d.subheadline)}</p>` : ''}
    </div>
    <div class="plans">
${plans}
    </div>
  </div>
</section>`;
  },
});
