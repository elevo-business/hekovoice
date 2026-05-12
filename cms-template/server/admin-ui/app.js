// CMS — Admin SPA (Alpine.js)

/* ─── SVG icon set (Heroicons outline, 24×24, stroke 1.5) ──── */
const ICONS = {
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM19.5 8.25l-3.75-3.75"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>',
  drag: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.75l6 6 9-13.5"/></svg>',
  warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>',
  error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18L18 6M6 6l12 12"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>',
  external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>',
  page: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>',
  photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>',
  cog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>',
  archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.179-.398a2.25 2.25 0 001.423-1.423l.398-1.178.398 1.178a2.25 2.25 0 001.423 1.423l1.179.398-1.179.398a2.25 2.25 0 00-1.423 1.423z"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/></svg>',
  text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>',
  rotate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>',
  cursor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>',
};
function iconHtml(name) { return ICONS[name] || ''; }
window.iconHtml = iconHtml;

const SETTINGS_GROUPS = [
  { title: 'Site & SEO',    keys: ['site.title','site.description','site.og_image'] },
  { title: 'Kontakt',       keys: ['contact.phone','contact.phone_link','contact.email','contact.whatsapp'] },
  { title: 'Firmendaten',   keys: ['contact.company','contact.address','contact.ceo','contact.register','contact.vat_id'] },
  { title: 'Tracking',      keys: ['tracking.gtm_id','tracking.ga4_id','tracking.gads_id','tracking.fb_pixel'] },
  { title: 'Integrationen', keys: ['integration.pipedrive_form_url'] },
];

const SETTINGS_LABELS = {
  'site.title': 'Seitentitel',
  'site.description': 'Meta-Beschreibung',
  'site.og_image': 'OG-Bild URL',
  'contact.phone': 'Telefon (Anzeige)',
  'contact.phone_link': 'Telefon (Link, ohne Leerzeichen)',
  'contact.email': 'E-Mail',
  'contact.whatsapp': 'WhatsApp-Nummer',
  'contact.company': 'Firmenname',
  'contact.address': 'Adresse',
  'contact.ceo': 'Geschäftsführung',
  'contact.register': 'Handelsregister',
  'contact.vat_id': 'USt-IdNr.',
  'tracking.gtm_id': 'GTM-Container-ID',
  'tracking.ga4_id': 'GA4 Measurement-ID',
  'tracking.gads_id': 'Google Ads Tag-ID',
  'tracking.fb_pixel': 'Meta Pixel-ID',
  'integration.pipedrive_form_url': 'Pipedrive Form URL',
};

async function api(path, opts = {}) {
  const res = await fetch('/api' + path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw Object.assign(new Error(data?.error || res.statusText), { status: res.status, data });
  return data;
}

async function apiUpload(path, formData) {
  const res = await fetch('/api' + path, {
    credentials: 'same-origin',
    method: 'POST',
    body: formData,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw Object.assign(new Error(data?.error || res.statusText), { status: res.status, data });
  return data;
}

window.cms = function () {
  return {
    view: 'login',
    user: null,
    tab: 'page-index',
    loading: false,
    loginForm: { email: '', password: '' },
    loginError: '',
    sections: [],
    types: [],
    media: [],
    users: [],
    settings: {},
    settingsGroups: SETTINGS_GROUPS,
    edit: null,
    editTab: 'form',
    revisions: [],
    userEdit: null,
    modal: null,
    confirmData: { title: '', message: '', action: () => {} },
    toasts: [],
    toastSeq: 1,
    dragIdx: null,
    previewVersion: 0,
    previewLoading: false,
    get previewUrl() {
      if (!this.edit) return '';
      const sep = this.currentPageUrl().includes('?') ? '&' : '?';
      return this.currentPageUrl() + sep + 'cmsv=' + this.previewVersion + (this.edit.id ? '#cms-section-' + this.edit.id : '');
    },
    reloadPreview() {
      this.previewLoading = true;
      this.previewVersion++;
    },

    async init() {
      try {
        const me = await api('/auth/me');
        if (me.user) {
          this.user = me.user;
          this.view = 'app';
          await this.loadAll();
        }
      } catch {}
    },

    async login() {
      this.loading = true; this.loginError = '';
      try {
        const r = await api('/auth/login', { method: 'POST', body: JSON.stringify(this.loginForm) });
        this.user = r.user;
        this.view = 'app';
        await this.loadAll();
      } catch (e) {
        this.loginError = e.status === 429 ? 'Zu viele Versuche. Bitte 1 Minute warten.' : 'E-Mail oder Passwort falsch.';
      } finally { this.loading = false; }
    },

    async logout() {
      try { await api('/auth/logout', { method: 'POST' }); } catch {}
      this.user = null; this.view = 'login';
      this.loginForm = { email: '', password: '' };
    },

    async loadAll() {
      const t = await api('/sections/types');
      this.types = t.types;
      await this.loadSections();
      await this.loadSettings();
    },

    setTab(t) {
      this.tab = t;
      if (t.startsWith('page-')) this.loadSections();
      if (t === 'media') this.loadMedia();
      if (t === 'users') this.loadUsers();
      if (t === 'settings') this.loadSettings();
    },

    currentPage() { return this.tab.replace('page-', ''); },
    currentPageTitle() { return this.currentPage() === 'index' ? 'Startseite' : 'Termin-Seite'; },
    currentPageUrl() { return this.currentPage() === 'index' ? '/' : '/termin'; },

    async loadSections() {
      if (!this.tab.startsWith('page-')) return;
      const r = await api('/sections/page/' + this.currentPage());
      this.sections = r.sections;
    },

    async loadMedia() {
      const r = await api('/media');
      this.media = r.media;
    },

    async loadUsers() {
      const r = await api('/users');
      this.users = r.users;
    },

    async loadSettings() {
      const r = await api('/settings');
      this.settings = {};
      for (const k of Object.keys(r.settings)) {
        const v = r.settings[k];
        this.settings[k] = typeof v === 'string' ? v : JSON.stringify(v);
      }
    },

    typeLabel(id) { return this.types.find((t) => t.id === id)?.label || id; },
    typeDescription(id) { return this.types.find((t) => t.id === id)?.description || ''; },
    sectionLabel(s) {
      const d = s.data || {};
      return d.label || d.headline || d.headline_pre || s.type || `Section ${s.id}`;
    },
    sectionTextCount(s) {
      if (s.type !== 'raw_html') return null; // typed sections always editable
      try {
        const html = s.data?.html || '';
        return parseEditableFields(html).fields.length;
      } catch { return 0; }
    },
    settingsLabel(key) { return SETTINGS_LABELS[key] || key; },

    formatDate(ts) { if (!ts) return '—'; return new Date(ts).toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'}); },
    formatSize(b) { if (!b) return ''; return b > 1024*1024 ? (b/1024/1024).toFixed(1)+' MB' : Math.round(b/1024)+' KB'; },

    toast(msg, kind = 'success') {
      const id = this.toastSeq++;
      this.toasts.push({ id, msg, kind });
      setTimeout(() => { this.toasts = this.toasts.filter((t) => t.id !== id); }, 3500);
    },

    /* ─── Section editor ──────────────────────────────────── */
    openAddSection() {
      this.edit = { id: null, type: 'raw_html', visible: true, data: null, dataJson: '' };
      this.onTypeChange();
      this.modal = 'section-edit';
      this.previewLoading = true;
      this.previewVersion++;
      this.$nextTick(() => this.renderEditForm());
    },
    openEditSection(s) {
      this.edit = {
        id: s.id, type: s.type, visible: !!s.visible,
        data: JSON.parse(JSON.stringify(s.data || {})),
        dataJson: JSON.stringify(s.data || {}, null, 2),
      };
      this.editTab = s.type === 'raw_html' ? 'texts' : 'form';
      this.revisions = [];
      this.modal = 'section-edit';
      this.previewLoading = true;
      this.previewVersion++;
      if (s.type === 'raw_html') this.extractTexts();
      this.$nextTick(() => this.renderEditForm());
    },
    /* ─── Text extraction (raw_html sections, no-code mode) ── */
    extractedFields: [],
    extractTexts() {
      if (!this.edit || this.edit.type !== 'raw_html') {
        this.extractedFields = [];
        return;
      }
      const html = this.edit.data?.html || '';
      const result = parseEditableFields(html);
      this.extractedFields = result.fields;
      // Persist marked HTML so subsequent edits address the same elements.
      this.edit.data.html = result.markedHtml;
      this.edit.dataJson = JSON.stringify(this.edit.data, null, 2);
    },
    updateExtractedField(idx, key, value) {
      const field = this.extractedFields[idx];
      if (!field) return;
      field[key] = value;
      this.edit.data.html = applyFieldsToHtml(this.edit.data.html, this.extractedFields);
      this.edit.dataJson = JSON.stringify(this.edit.data, null, 2);
    },
    switchToTextsTab() {
      this.editTab = 'texts';
      // Re-extract in case HTML was edited via HTML tab
      this.extractTexts();
    },
    onTypeChange() {
      const t = this.types.find((x) => x.id === this.edit.type);
      if (!t) return;
      this.edit.data = JSON.parse(JSON.stringify(t.defaults));
      this.edit.dataJson = JSON.stringify(this.edit.data, null, 2);
      if (this.edit.type === 'raw_html') {
        this.editTab = 'texts';
        this.extractTexts();
      } else {
        this.editTab = 'form';
      }
      this.$nextTick(() => this.renderEditForm());
    },

    renderEditFormHtml() { return ''; },

    renderEditForm() {
      const host = document.getElementById('dynamic-form-host');
      if (!host) return;
      host.innerHTML = '';
      if (!this.edit?.data) return;
      const node = this.buildFields(this.edit.data, '', null, this.edit.type);
      host.appendChild(node);
    },

    buildFields(value, path, parentArray, type) {
      const wrap = document.createElement('div');
      const isObject = value && typeof value === 'object' && !Array.isArray(value);
      const isArray = Array.isArray(value);
      if (isObject) {
        for (const k of Object.keys(value)) {
          wrap.appendChild(this.buildField(k, value[k], path ? `${path}.${k}` : k, value, k));
        }
      } else if (isArray) {
        const list = document.createElement('div');
        list.className = 'array-list';
        value.forEach((item, idx) => {
          const it = document.createElement('div'); it.className = 'array-item';
          const rm = document.createElement('button');
          rm.type = 'button'; rm.className = 'btn icon danger remove'; rm.textContent = '✕';
          rm.title = 'Eintrag entfernen';
          rm.onclick = () => { value.splice(idx, 1); this.renderEditForm(); this.syncJson(); };
          it.appendChild(rm);
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            for (const k of Object.keys(item)) {
              it.appendChild(this.buildField(k, item[k], '', item, k));
            }
          } else {
            it.appendChild(this.buildField('', item, '', value, idx));
          }
          list.appendChild(it);
        });
        wrap.appendChild(list);
        const add = document.createElement('button');
        add.type = 'button'; add.className = 'btn ghost array-add';
        add.textContent = '+ Eintrag hinzufügen';
        add.onclick = () => {
          const tpl = value.length > 0 ? cloneEmpty(value[0]) : '';
          value.push(tpl);
          this.renderEditForm(); this.syncJson();
        };
        wrap.appendChild(add);
      }
      return wrap;
    },

    buildField(key, value, path, parent, parentKey) {
      const lbl = document.createElement('label');
      if (key) {
        const span = document.createElement('span');
        span.textContent = humanize(key);
        lbl.appendChild(span);
      }
      const isPrimitive = value === null || ['string','number','boolean'].includes(typeof value);
      const isObject = value && typeof value === 'object' && !Array.isArray(value);
      const isArray = Array.isArray(value);
      if (isPrimitive) {
        const isHtmlField = key === 'html';
        const isLong = isHtmlField || (typeof value === 'string' && value.length > 80);
        const input = document.createElement(isLong ? 'textarea' : 'input');
        if (!isLong) input.type = (typeof value === 'number') ? 'number' : 'text';
        if (typeof value === 'boolean') {
          input.type = 'checkbox'; input.checked = value;
          input.onchange = () => { parent[parentKey] = input.checked; this.syncJson(); };
        } else {
          input.value = value ?? '';
          if (isHtmlField) input.rows = 10;
          input.oninput = () => {
            parent[parentKey] = (typeof value === 'number') ? Number(input.value) : input.value;
            this.syncJson();
          };
        }
        lbl.appendChild(input);
      } else if (isObject) {
        const fs = document.createElement('fieldset');
        fs.style.cssText = 'border:1px solid var(--border);padding:12px;border-radius:6px;margin-bottom:12px;background:#f8fafc';
        if (key) { const lg = document.createElement('legend'); lg.textContent = humanize(key); lg.style.padding='0 6px'; lg.style.fontSize='12px'; lg.style.fontWeight='600'; lg.style.color='var(--navy)'; fs.appendChild(lg); }
        for (const k of Object.keys(value)) fs.appendChild(this.buildField(k, value[k], '', value, k));
        return fs;
      } else if (isArray) {
        const fs = document.createElement('fieldset');
        fs.style.cssText = 'border:1px solid var(--border);padding:12px;border-radius:6px;margin-bottom:12px;background:#fff';
        if (key) { const lg = document.createElement('legend'); lg.textContent = humanize(key) + ` (${value.length})`; lg.style.padding='0 6px'; lg.style.fontSize='12px'; lg.style.fontWeight='600'; fs.appendChild(lg); }
        fs.appendChild(this.buildFields(value, '', parent, null));
        return fs;
      }
      return lbl;
    },

    syncJson() {
      if (this.edit?.data) this.edit.dataJson = JSON.stringify(this.edit.data, null, 2);
    },

    async saveSection() {
      this.loading = true;
      try {
        let data = this.edit.data;
        if (this.editTab === 'json') {
          try { data = JSON.parse(this.edit.dataJson); }
          catch (e) { this.toast('Ungültiges JSON: ' + e.message, 'error'); return; }
        }
        // Strip the temporary data-cms-edit markers from raw_html before saving
        if (this.edit.type === 'raw_html' && data?.html) {
          data = { ...data, html: stripCmsEditMarkers(data.html) };
        }
        if (this.edit.id) {
          await api('/sections/' + this.edit.id, {
            method: 'PATCH',
            body: JSON.stringify({ type: this.edit.type, data, visible: this.edit.visible }),
          });
        } else {
          const r = await api('/sections', {
            method: 'POST',
            body: JSON.stringify({ page: this.currentPage(), type: this.edit.type, data }),
          });
          this.edit.id = r.id;
        }
        this.toast('Gespeichert.', 'success');
        await this.loadSections();
        this.previewLoading = true;
        this.previewVersion++;
      } catch (e) {
        this.toast('Fehler: ' + humanizeApiError(e), 'error');
      } finally { this.loading = false; }
    },

    confirmDelete(s) {
      this.confirmData = {
        title: 'Section löschen?',
        message: `„${this.sectionLabel(s)}" wird unwiderruflich gelöscht.`,
        action: () => this.deleteSection(s),
      };
      this.modal = 'confirm';
    },

    async deleteSection(s) {
      try { await api('/sections/' + s.id, { method: 'DELETE' }); this.toast('Gelöscht.', 'success'); await this.loadSections(); }
      catch (e) { this.toast('Fehler: ' + humanizeApiError(e), 'error'); }
    },

    async toggleVisibility(s) {
      try {
        await api('/sections/' + s.id, { method: 'PATCH', body: JSON.stringify({ visible: !s.visible }) });
        s.visible = !s.visible;
      } catch (e) { this.toast('Fehler: ' + humanizeApiError(e), 'error'); }
    },

    async loadRevisions() {
      this.editTab = 'revisions';
      if (!this.edit.id) return;
      const r = await api(`/sections/${this.edit.id}/revisions`);
      this.revisions = r.revisions;
    },

    async restoreRevision(r) {
      try {
        await api(`/sections/${this.edit.id}/revisions/${r.id}/restore`, { method: 'POST' });
        this.toast('Version wiederhergestellt.', 'success');
        await this.loadSections();
        const updated = this.sections.find((s) => s.id === this.edit.id);
        if (updated) this.openEditSection(updated);
      } catch (e) { this.toast('Fehler: ' + humanizeApiError(e), 'error'); }
    },

    /* ─── Drag & drop reorder ─────────────────────────────── */
    onDragStart(e, idx) { this.dragIdx = idx; e.dataTransfer.effectAllowed = 'move'; },
    onDragOver(e, idx) {
      if (this.dragIdx === null || this.dragIdx === idx) return;
      const moved = this.sections.splice(this.dragIdx, 1)[0];
      this.sections.splice(idx, 0, moved);
      this.dragIdx = idx;
    },
    onDrop() { this.commitReorder(); },
    onDragEnd() { this.dragIdx = null; },
    async commitReorder() {
      const order = this.sections.map((s) => s.id);
      try { await api('/sections/reorder', { method: 'PUT', body: JSON.stringify({ page: this.currentPage(), order }) }); }
      catch (e) { this.toast('Reorder fehlgeschlagen: ' + humanizeApiError(e), 'error'); await this.loadSections(); }
    },

    /* ─── Media ───────────────────────────────────────────── */
    async uploadFile(e) {
      const file = e.target.files?.[0]; if (!file) return;
      const fd = new FormData(); fd.append('file', file);
      this.loading = true;
      try { await apiUpload('/media/upload', fd); this.toast('Hochgeladen.', 'success'); await this.loadMedia(); }
      catch (err) { this.toast('Upload fehlgeschlagen: ' + humanizeApiError(err), 'error'); }
      finally { this.loading = false; e.target.value = ''; }
    },
    async updateAlt(m, alt) {
      if (alt === (m.alt || '')) return;
      try { await api('/media/' + m.id, { method: 'PATCH', body: JSON.stringify({ alt }) }); m.alt = alt; }
      catch (e) { this.toast('Fehler: ' + humanizeApiError(e), 'error'); }
    },
    async deleteMedia(m) {
      this.confirmData = {
        title: 'Bild löschen?',
        message: `„${m.filename}" wird gelöscht. Dies kann Sections beeinflussen, in denen das Bild verwendet wird.`,
        action: async () => {
          try { await api('/media/' + m.id, { method: 'DELETE' }); this.toast('Gelöscht.', 'success'); await this.loadMedia(); }
          catch (e) { this.toast('Fehler: ' + humanizeApiError(e), 'error'); }
        },
      };
      this.modal = 'confirm';
    },
    copyUrl(url) {
      const full = location.origin + url;
      navigator.clipboard.writeText(full).then(() => this.toast('URL kopiert.', 'success'));
    },

    /* ─── Settings ────────────────────────────────────────── */
    async saveSettings() {
      this.loading = true;
      try {
        const payload = {};
        for (const k of Object.keys(this.settings)) payload[k] = this.settings[k];
        await api('/settings', { method: 'PATCH', body: JSON.stringify(payload) });
        this.toast('Einstellungen gespeichert.', 'success');
      } catch (e) { this.toast('Fehler: ' + humanizeApiError(e), 'error'); }
      finally { this.loading = false; }
    },

    /* ─── Users ───────────────────────────────────────────── */
    openAddUser() {
      this.userEdit = { id: null, name: '', email: '', role: 'editor', password: '', passwordVisible: false, justGenerated: false };
      this.modal = 'user-edit';
    },
    openEditUser(u) {
      this.userEdit = { id: u.id, name: u.name, email: u.email, role: u.role, password: '', passwordVisible: false, justGenerated: false };
      this.modal = 'user-edit';
    },
    generatePassword() {
      const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
      const symbols = '!@#$%&*+-=?';
      const buf = new Uint32Array(14);
      crypto.getRandomValues(buf);
      let pw = '';
      for (let i = 0; i < 14; i++) pw += charset[buf[i] % charset.length];
      // Sprinkle in 2 symbols at random positions
      const sym = new Uint32Array(2);
      crypto.getRandomValues(sym);
      const arr = pw.split('');
      arr[sym[0] % arr.length] = symbols[sym[0] % symbols.length];
      arr[sym[1] % arr.length] = symbols[sym[1] % symbols.length];
      this.userEdit.password = arr.join('');
      this.userEdit.passwordVisible = true;
      this.userEdit.justGenerated = true;
    },
    async copyPassword() {
      try {
        await navigator.clipboard.writeText(this.userEdit.password);
        this.toast('Passwort kopiert.', 'success');
      } catch {
        this.toast('Konnte Passwort nicht kopieren — bitte manuell kopieren.', 'error');
      }
    },
    pwStrength(pw) {
      if (!pw) return { pct: 0, label: '', color: '#e2e8f0' };
      let score = 0;
      if (pw.length >= 10) score++;
      if (pw.length >= 14) score++;
      if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
      if (/[0-9]/.test(pw)) score++;
      if (/[^a-zA-Z0-9]/.test(pw)) score++;
      const levels = [
        { pct: 20, label: 'Zu kurz',   color: '#dc2626' },
        { pct: 40, label: 'Schwach',   color: '#f59e0b' },
        { pct: 60, label: 'Mittel',    color: '#f59e0b' },
        { pct: 80, label: 'Gut',       color: '#059669' },
        { pct: 100, label: 'Sehr gut', color: '#059669' },
      ];
      return levels[Math.min(score, levels.length) - 1] || levels[0];
    },
    validateUserBeforeSave() {
      const u = this.userEdit;
      if (!u.name || u.name.trim().length < 1) return 'Name fehlt.';
      if (!u.id) {
        if (!u.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email)) return 'Bitte gültige E-Mail-Adresse eingeben.';
        if (!u.password || u.password.length < 10) return 'Passwort muss mindestens 10 Zeichen haben.';
      } else if (u.password && u.password.length < 10) {
        return 'Neues Passwort muss mindestens 10 Zeichen haben.';
      }
      return null;
    },
    async saveUser() {
      const validationError = this.validateUserBeforeSave();
      if (validationError) { this.toast(validationError, 'error'); return; }
      this.loading = true;
      try {
        if (this.userEdit.id) {
          const body = { name: this.userEdit.name.trim(), role: this.userEdit.role };
          if (this.userEdit.password) body.password = this.userEdit.password;
          await api('/users/' + this.userEdit.id, { method: 'PATCH', body: JSON.stringify(body) });
        } else {
          await api('/users', { method: 'POST', body: JSON.stringify({
            name: this.userEdit.name.trim(),
            email: this.userEdit.email.trim().toLowerCase(),
            role: this.userEdit.role,
            password: this.userEdit.password,
          }) });
        }
        this.toast('Benutzer gespeichert.', 'success');
        this.closeModal();
        await this.loadUsers();
      } catch (e) {
        this.toast(humanizeApiError(e, 'user'), 'error');
      } finally { this.loading = false; }
    },
    async deleteUser(u) {
      this.confirmData = {
        title: 'Benutzer löschen?',
        message: `„${u.name}" (${u.email}) wird unwiderruflich gelöscht.`,
        action: async () => {
          try { await api('/users/' + u.id, { method: 'DELETE' }); this.toast('Gelöscht.', 'success'); await this.loadUsers(); }
          catch (e) { this.toast('Fehler: ' + humanizeApiError(e), 'error'); }
        },
      };
      this.modal = 'confirm';
    },

    closeModal() { this.modal = null; this.edit = null; this.userEdit = null; },
  };
};

function humanize(k) {
  return String(k).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ─── HTML text-field extractor for non-coders ────────────────
 * parseEditableFields(html) walks the HTML once, finds "leaf" content
 * elements (h1..h6, p, blockquote, a, button, li) — leaf meaning they
 * contain no further editable element. Each gets a stable data-cms-edit
 * marker so we can update its text/href across re-renders without re-
 * indexing.
 *
 * It also walks <script> tags and pulls out string literals that look
 * like user-visible content (length, contains spaces, not URL/path/
 * identifier). Each is wrapped with a `/*cmsstrN*\/` comment-marker
 * placed immediately before the quoted string so subsequent updates can
 * locate it deterministically.
 *
 * Both kinds of markers are stripped on save (see stripCmsEditMarkers).
 */
const EDITABLE_TAGS = new Set(['h1','h2','h3','h4','h5','h6','p','a','button','li','blockquote']);
const SKIP_TAGS = new Set(['style','noscript','svg','iframe','canvas','template']);
const SCRIPT_MIN_LEN = 12;

function parseEditableFields(html) {
  const doc = new DOMParser().parseFromString('<div id="cms-root">' + (html || '') + '</div>', 'text/html');
  const root = doc.getElementById('cms-root');
  const fields = [];
  let nextId = 1;
  function hasEditableDescendant(node) {
    for (const child of node.querySelectorAll('*')) {
      if (EDITABLE_TAGS.has(child.tagName.toLowerCase())) return true;
    }
    return false;
  }
  function walk(node) {
    if (!node || node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    if (SKIP_TAGS.has(tag)) return;
    if (tag === 'script') {
      const result = markScriptStrings(node.textContent || '', nextId);
      if (result.fields.length > 0) {
        node.textContent = result.content;
        for (const f of result.fields) fields.push(f);
        nextId = result.nextId;
      }
      return;
    }
    if (EDITABLE_TAGS.has(tag) && !hasEditableDescendant(node)) {
      const text = (node.textContent || '').trim();
      if (text.length > 0) {
        const id = 'cms' + nextId++;
        node.setAttribute('data-cms-edit', id);
        const field = { id, tag, text, original: text };
        if (/^h[1-6]$/.test(tag)) { field.kind = 'heading'; field.label = 'Überschrift ' + tag.toUpperCase(); }
        else if (tag === 'p') { field.kind = 'paragraph'; field.label = 'Absatz'; }
        else if (tag === 'blockquote') { field.kind = 'paragraph'; field.label = 'Zitat'; }
        else if (tag === 'a') { field.kind = 'link'; field.href = node.getAttribute('href') || ''; field.label = 'Link'; }
        else if (tag === 'button') { field.kind = 'button'; field.label = 'Button'; }
        else if (tag === 'li') { field.kind = 'listitem'; field.label = 'Listeneintrag'; }
        fields.push(field);
        return;
      }
    }
    for (const child of node.children) walk(child);
  }
  walk(root);
  return { markedHtml: root.innerHTML, fields };
}

function applyFieldsToHtml(html, fields) {
  const doc = new DOMParser().parseFromString('<div id="cms-root">' + (html || '') + '</div>', 'text/html');
  const root = doc.getElementById('cms-root');
  // HTML element edits first
  for (const field of fields) {
    if (field.kind === 'scriptString') continue;
    const el = root.querySelector('[data-cms-edit="' + field.id + '"]');
    if (!el) continue;
    el.textContent = field.text;
    if (field.kind === 'link' && typeof field.href === 'string') {
      if (field.href.length > 0) el.setAttribute('href', field.href);
      else el.removeAttribute('href');
    }
  }
  // Script string edits — mutate each script's textContent in sequence so
  // multiple edits in the same script all stick.
  const scripts = root.querySelectorAll('script');
  for (const field of fields) {
    if (field.kind !== 'scriptString') continue;
    const marker = '/*' + field.id + '*/';
    for (const scriptEl of scripts) {
      const content = scriptEl.textContent || '';
      const idx = content.indexOf(marker);
      if (idx === -1) continue;
      const afterMarker = idx + marker.length;
      const quoteChar = content[afterMarker];
      if (quoteChar !== "'" && quoteChar !== '"' && quoteChar !== '`') break;
      let i = afterMarker + 1;
      while (i < content.length) {
        if (content[i] === '\\') { i += 2; continue; }
        if (content[i] === quoteChar) break;
        i++;
      }
      if (i >= content.length) break;
      const endOfString = i + 1;
      const newEscaped = encodeJsString(field.text, quoteChar);
      const newString = quoteChar + newEscaped + quoteChar;
      scriptEl.textContent = content.slice(0, afterMarker) + newString + content.slice(endOfString);
      break;
    }
  }
  return root.innerHTML;
}

function stripCmsEditMarkers(html) {
  const doc = new DOMParser().parseFromString('<div id="cms-root">' + (html || '') + '</div>', 'text/html');
  const root = doc.getElementById('cms-root');
  root.querySelectorAll('[data-cms-edit]').forEach((el) => el.removeAttribute('data-cms-edit'));
  // Strip script-string markers (/*cmsstr12*/)
  root.querySelectorAll('script').forEach((script) => {
    let content = script.textContent || '';
    content = content.replace(/\/\*cmsstr\d+\*\//g, '');
    script.textContent = content;
  });
  return root.innerHTML;
}

/* ─── Script string utilities ────────────────────────────────── */

function markScriptStrings(scriptContent, startId) {
  const fields = [];
  let result = '';
  let lastEnd = 0;
  let nextId = startId;
  const pattern = /(['"`])((?:\\.|(?!\1).)*)\1/g;
  let match;
  while ((match = pattern.exec(scriptContent)) !== null) {
    const quoteChar = match[1];
    const rawText = match[2];
    const decoded = decodeJsString(rawText, quoteChar);
    if (looksLikeContent(decoded)) {
      const id = 'cmsstr' + nextId++;
      result += scriptContent.slice(lastEnd, match.index);
      result += '/*' + id + '*/';
      result += match[0];
      lastEnd = match.index + match[0].length;
      fields.push({
        id,
        kind: 'scriptString',
        quoteChar,
        text: decoded,
        original: decoded,
        label: 'Skript-Text',
      });
    }
  }
  result += scriptContent.slice(lastEnd);
  return { content: result, fields, nextId };
}

function decodeJsString(raw, quoteChar) {
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === '\\' && i + 1 < raw.length) {
      const next = raw[i + 1];
      if (next === 'n') { out += '\n'; i++; }
      else if (next === 'r') { out += '\r'; i++; }
      else if (next === 't') { out += '\t'; i++; }
      else if (next === '\\') { out += '\\'; i++; }
      else if (next === quoteChar) { out += quoteChar; i++; }
      else if (next === 'u' && i + 5 < raw.length) {
        const hex = raw.slice(i + 2, i + 6);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) { out += String.fromCharCode(parseInt(hex, 16)); i += 5; }
        else { out += ch; }
      } else { out += next; i++; }
    } else {
      out += ch;
    }
  }
  return out;
}

function encodeJsString(text, quoteChar) {
  let out = text.replace(/\\/g, '\\\\');
  if (quoteChar === "'") out = out.replace(/'/g, "\\'");
  else if (quoteChar === '"') out = out.replace(/"/g, '\\"');
  else if (quoteChar === '`') out = out.replace(/`/g, '\\`');
  if (quoteChar !== '`') {
    out = out.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
  }
  return out;
}

function looksLikeContent(text) {
  if (text.length < SCRIPT_MIN_LEN) return false;
  if (!/\s/.test(text)) return false;
  if (/^https?:\/\//i.test(text)) return false;
  if (/^\/[a-z]/i.test(text)) return false;
  if (/^[A-Z][A-Z0-9_-]+$/.test(text)) return false;
  if (text.startsWith('${') || text.includes('${')) return false;
  if (/^[a-z][a-zA-Z]*\s*[(=]/.test(text)) return false;
  if (/^\s*[<>]/.test(text)) return false;
  if (/^[a-z-]+:\s*\S/i.test(text) && !text.includes(' ')) return false;
  return true;
}

const FIELD_LABELS_DE = {
  email: 'E-Mail', name: 'Name', password: 'Passwort', role: 'Rolle',
  type: 'Section-Typ', data: 'Daten', visible: 'Sichtbarkeit',
  alt: 'Alt-Text', filename: 'Dateiname',
};
const ERROR_MESSAGES_DE = {
  email_taken:        'Diese E-Mail-Adresse ist bereits vergeben.',
  invalid_credentials:'E-Mail oder Passwort falsch.',
  unauthorized:       'Bitte zuerst einloggen.',
  forbidden:          'Du hast keine Berechtigung für diese Aktion.',
  not_found:          'Eintrag nicht gefunden.',
  last_admin:         'Der letzte Admin kann nicht entfernt werden.',
  cannot_delete_self: 'Du kannst dich nicht selbst löschen.',
  too_many_attempts:  'Zu viele Versuche. Bitte 1 Minute warten.',
  file_too_large:     'Datei ist zu groß (max. 10 MB).',
  mime_not_allowed:   'Dateityp nicht erlaubt (nur Bilder).',
  unknown_type:       'Unbekannter Section-Typ.',
};

function humanizeApiError(e, context) {
  const code = e?.data?.error;
  if (code && ERROR_MESSAGES_DE[code]) return ERROR_MESSAGES_DE[code];
  const issues = e?.data?.issues;
  if (Array.isArray(issues) && issues.length > 0) {
    const parts = issues.slice(0, 3).map((iss) => {
      const field = iss.path?.[0];
      const label = (field && FIELD_LABELS_DE[field]) || field || 'Feld';
      if (iss.code === 'too_small' && iss.minimum) return `${label}: mindestens ${iss.minimum} Zeichen.`;
      if (iss.code === 'invalid_string' && iss.validation === 'email') return `${label}: ungültige E-Mail-Adresse.`;
      if (iss.code === 'invalid_type') return `${label}: erwartet ${iss.expected}, war ${iss.received}.`;
      return `${label}: ${iss.message}`;
    });
    return parts.join(' · ');
  }
  if (code) return code;
  return e?.message || 'Unbekannter Fehler.';
}

function cloneEmpty(template) {
  if (template === null) return null;
  if (Array.isArray(template)) return [];
  if (typeof template === 'object') {
    const out = {};
    for (const k of Object.keys(template)) out[k] = cloneEmpty(template[k]);
    return out;
  }
  if (typeof template === 'number') return 0;
  if (typeof template === 'boolean') return false;
  return '';
}
