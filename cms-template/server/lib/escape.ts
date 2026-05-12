const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input).replace(/[&<>"']/g, (c) => HTML_ENTITIES[c] ?? c);
}

export function escapeAttr(input: unknown): string {
  return escapeHtml(input);
}

export function safeUrl(input: unknown): string {
  const s = String(input ?? '').trim();
  if (/^javascript:/i.test(s)) return '#';
  return escapeAttr(s);
}
