export function formatNumber(value: number | null | undefined, digits = 4): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '--';
  return value.toFixed(digits);
}

export function formatCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '--';
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 }).format(value);
}

export function parseNumber(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (normalized === '') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toCsvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.split('"').join('""')}"` : text;
}

export function toSafeFilename(value: string, fallback = 'normalisasi-kurva'): string {
  const safe = value
    .trim()
    .split('')
    .map((character) => (isInvalidFilenameCharacter(character) ? '-' : character))
    .join('')
    .replace(/\s+/g, ' ')
    .replace(/\.+$/g, '')
    .slice(0, 120);
  return safe || fallback;
}

function isInvalidFilenameCharacter(character: string): boolean {
  return character.charCodeAt(0) < 32 || '<>:"/\\|?*'.includes(character);
}
