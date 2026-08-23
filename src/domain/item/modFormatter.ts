export function formatModText(mod: unknown): string {
  if (!mod) return '';
  if (typeof mod === 'string') return mod;
  if (typeof mod === 'object') {
    const obj = mod as Record<string, unknown>;
    if (typeof obj.text === 'string') return obj.text;
    if (typeof obj.name === 'string') return obj.name;
    if (typeof obj.description === 'string') return obj.description;
    if (Array.isArray(obj.mods)) return obj.mods.map(formatModText).join(', ');
    if (typeof obj.id === 'string') return obj.id;
    if (typeof obj.hash === 'string') return obj.hash;
  }
  return String(mod);
}
