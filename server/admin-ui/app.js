// HEKO Voice CMS — Admin SPA (Alpine.js)

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
      this.editTab = 'form';
      this.modal = 'section-edit';
      this.$nextTick(() => this.renderEditForm());
    },
    openEditSection(s) {
      this.edit = {
        id: s.id, type: s.type, visible: !!s.visible,
        data: JSON.parse(JSON.stringify(s.data || {})),
        dataJson: JSON.stringify(s.data || {}, null, 2),
      };
      this.editTab = 'form';
      this.revisions = [];
      this.modal = 'section-edit';
      this.$nextTick(() => this.renderEditForm());
    },
    onTypeChange() {
      const t = this.types.find((x) => x.id === this.edit.type);
      if (!t) return;
      this.edit.data = JSON.parse(JSON.stringify(t.defaults));
      this.edit.dataJson = JSON.stringify(this.edit.data, null, 2);
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
        if (this.edit.id) {
          await api('/sections/' + this.edit.id, {
            method: 'PATCH',
            body: JSON.stringify({ type: this.edit.type, data, visible: this.edit.visible }),
          });
        } else {
          await api('/sections', {
            method: 'POST',
            body: JSON.stringify({ page: this.currentPage(), type: this.edit.type, data }),
          });
        }
        this.toast('Gespeichert.', 'success');
        this.closeModal();
        await this.loadSections();
      } catch (e) {
        this.toast('Fehler: ' + e.message, 'error');
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
      catch (e) { this.toast('Fehler: ' + e.message, 'error'); }
    },

    async toggleVisibility(s) {
      try {
        await api('/sections/' + s.id, { method: 'PATCH', body: JSON.stringify({ visible: !s.visible }) });
        s.visible = !s.visible;
      } catch (e) { this.toast('Fehler: ' + e.message, 'error'); }
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
      } catch (e) { this.toast('Fehler: ' + e.message, 'error'); }
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
      catch (e) { this.toast('Reorder fehlgeschlagen: ' + e.message, 'error'); await this.loadSections(); }
    },

    /* ─── Media ───────────────────────────────────────────── */
    async uploadFile(e) {
      const file = e.target.files?.[0]; if (!file) return;
      const fd = new FormData(); fd.append('file', file);
      this.loading = true;
      try { await apiUpload('/media/upload', fd); this.toast('Hochgeladen.', 'success'); await this.loadMedia(); }
      catch (err) { this.toast('Upload fehlgeschlagen: ' + err.message, 'error'); }
      finally { this.loading = false; e.target.value = ''; }
    },
    async updateAlt(m, alt) {
      if (alt === (m.alt || '')) return;
      try { await api('/media/' + m.id, { method: 'PATCH', body: JSON.stringify({ alt }) }); m.alt = alt; }
      catch (e) { this.toast('Fehler: ' + e.message, 'error'); }
    },
    async deleteMedia(m) {
      this.confirmData = {
        title: 'Bild löschen?',
        message: `„${m.filename}" wird gelöscht. Dies kann Sections beeinflussen, in denen das Bild verwendet wird.`,
        action: async () => {
          try { await api('/media/' + m.id, { method: 'DELETE' }); this.toast('Gelöscht.', 'success'); await this.loadMedia(); }
          catch (e) { this.toast('Fehler: ' + e.message, 'error'); }
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
      } catch (e) { this.toast('Fehler: ' + e.message, 'error'); }
      finally { this.loading = false; }
    },

    /* ─── Users ───────────────────────────────────────────── */
    openAddUser() {
      this.userEdit = { id: null, name: '', email: '', role: 'editor', password: '' };
      this.modal = 'user-edit';
    },
    openEditUser(u) {
      this.userEdit = { id: u.id, name: u.name, email: u.email, role: u.role, password: '' };
      this.modal = 'user-edit';
    },
    async saveUser() {
      this.loading = true;
      try {
        if (this.userEdit.id) {
          const body = { name: this.userEdit.name, role: this.userEdit.role };
          if (this.userEdit.password) body.password = this.userEdit.password;
          await api('/users/' + this.userEdit.id, { method: 'PATCH', body: JSON.stringify(body) });
        } else {
          await api('/users', { method: 'POST', body: JSON.stringify(this.userEdit) });
        }
        this.toast('Benutzer gespeichert.', 'success');
        this.closeModal();
        await this.loadUsers();
      } catch (e) {
        this.toast('Fehler: ' + (e.data?.error || e.message), 'error');
      } finally { this.loading = false; }
    },
    async deleteUser(u) {
      this.confirmData = {
        title: 'Benutzer löschen?',
        message: `„${u.name}" (${u.email}) wird unwiderruflich gelöscht.`,
        action: async () => {
          try { await api('/users/' + u.id, { method: 'DELETE' }); this.toast('Gelöscht.', 'success'); await this.loadUsers(); }
          catch (e) { this.toast('Fehler: ' + (e.data?.error || e.message), 'error'); }
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
