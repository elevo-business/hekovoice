import { db } from '../db/index.js';
import { renderLayout } from './layout.js';
import { getSectionType } from './sections/index.js';
import './sections/index.js';

interface SectionRow {
  id: number;
  type: string;
  position: number;
  visible: number;
  data: string;
}

interface SettingRow {
  key: string;
  value: string;
}

const selectSections = db.prepare<[string], SectionRow>(`
  SELECT id, type, position, visible, data
  FROM sections
  WHERE page = ? AND visible = 1
  ORDER BY position ASC
`);

const selectAllSettings = db.prepare<[], SettingRow>(
  'SELECT key, value FROM settings',
);

function loadSettings(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const row of selectAllSettings.all()) {
    try {
      out[row.key] = JSON.parse(row.value);
    } catch {
      out[row.key] = row.value;
    }
  }
  return out;
}

function get<T>(settings: Record<string, unknown>, key: string, fallback: T): T {
  return (settings[key] as T | undefined) ?? fallback;
}

export function renderPage(slug: string): string {
  const sections = selectSections.all(slug);
  const bodyParts: string[] = [];
  for (const sec of sections) {
    const type = getSectionType(sec.type);
    if (!type) {
      bodyParts.push(`<!-- unknown section type: ${sec.type} (id=${sec.id}) -->`);
      continue;
    }
    let data: unknown;
    try {
      data = JSON.parse(sec.data);
    } catch {
      bodyParts.push(`<!-- invalid section data id=${sec.id} -->`);
      continue;
    }
    bodyParts.push(`<!-- section ${sec.id} (${sec.type}) -->`);
    bodyParts.push(`<a id="cms-section-${sec.id}" aria-hidden="true" tabindex="-1" style="display:block;height:0;width:0;overflow:hidden;scroll-margin-top:90px;outline:none"></a>`);
    bodyParts.push(type.render(data));
  }

  const settings = loadSettings();

  const titleKey = slug === 'index' ? 'site.title' : `page.${slug}.title`;
  const descKey = slug === 'index' ? 'site.description' : `page.${slug}.description`;

  return renderLayout({
    slug,
    title: get(settings, titleKey, get(settings, 'site.title', 'HEKO Voice')),
    description: get(settings, descKey, get(settings, 'site.description', '')),
    ogTitle: get(settings, titleKey, get(settings, 'site.title', 'HEKO Voice')),
    ogDesc: get(settings, descKey, get(settings, 'site.description', '')),
    ogImage: get(settings, 'site.og_image', ''),
    configOverrides: {
      gtmId: get(settings, 'tracking.gtm_id', ''),
      gadsId: get(settings, 'tracking.gads_id', ''),
      ga4Id: get(settings, 'tracking.ga4_id', ''),
      fbPixelId: get(settings, 'tracking.fb_pixel', ''),
      pipedriveFormUrl: get(settings, 'integration.pipedrive_form_url', ''),
      phone: get(settings, 'contact.phone', ''),
      phoneCta: get(settings, 'contact.phone_link', ''),
      whatsapp: get(settings, 'contact.whatsapp', ''),
      email: get(settings, 'contact.email', ''),
      company: get(settings, 'contact.company', ''),
      address: get(settings, 'contact.address', ''),
      ceo: get(settings, 'contact.ceo', ''),
      register: get(settings, 'contact.register', ''),
      vatId: get(settings, 'contact.vat_id', ''),
    },
    bodyHtml: bodyParts.join('\n'),
  });
}
