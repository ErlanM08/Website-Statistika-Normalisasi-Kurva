import type { RawDataPoint } from '../types';
import { parseNumber } from './format';

const numberWords = new Map<string, number>([
  ['nol', 0],
  ['satu', 1],
  ['dua', 2],
  ['tiga', 3],
  ['empat', 4],
  ['lima', 5],
  ['enam', 6],
  ['tujuh', 7],
  ['delapan', 8],
  ['sembilan', 9],
  ['sepuluh', 10],
  ['sebelas', 11],
]);

const numericTokens = new Set(['belas', 'puluh', 'ratus', 'koma', 'poin', 'seratus']);

export function parseBulkInput(text: string): RawDataPoint[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length > 1) {
    return lines.flatMap((line) => {
      const values = line.split(/[;,\s]+/).map((token) => parseNumber(token)).filter((value): value is number => value !== null);
      if (values.length === 0) return [];
      return [{ xi: values[0], fi: values[1] ?? 1 }];
    });
  }
  const singleLineValues = lines[0]?.split(/[;,\s]+/).map((token) => parseNumber(token)).filter((value): value is number => value !== null) ?? [];
  if (singleLineValues.length === 2 && /[,;]/.test(lines[0] ?? '')) return [{ xi: singleLineValues[0], fi: singleLineValues[1] }];

  const tokens = text
    .split(/[\s,;]+/)
    .map((token) => Number(token.trim().replace(',', '.')))
    .filter((value) => Number.isFinite(value));
  const map = new Map<number, number>();
  tokens.forEach((value) => map.set(value, (map.get(value) ?? 0) + 1));
  return Array.from(map.entries()).map(([xi, fi]) => ({ xi, fi }));
}

export function parseVoiceNumbers(text: string): RawDataPoint[] {
  const tokens = text.toLowerCase().replace(/[.,]/g, ' ').split(/\s+/).filter(Boolean);
  const values: number[] = [];
  let index = 0;

  while (index < tokens.length) {
    const direct = Number(tokens[index]);
    if (Number.isFinite(direct)) {
      values.push(direct);
      index += 1;
      continue;
    }

    const parsed = parseIndonesianNumber(tokens, index);
    if (parsed) {
      values.push(parsed.value);
      index = parsed.nextIndex;
      continue;
    }
    index += 1;
  }

  const map = new Map<number, number>();
  values.forEach((value) => map.set(value, (map.get(value) ?? 0) + 1));
  return Array.from(map.entries()).map(([xi, fi]) => ({ xi, fi }));
}

function parseIndonesianNumber(tokens: string[], start: number): { value: number; nextIndex: number } | null {
  if (!isNumberToken(tokens[start])) return null;
  let index = start;
  const integerWords: string[] = [];

  while (index < tokens.length && isNumberToken(tokens[index]) && !['koma', 'poin'].includes(tokens[index])) {
    integerWords.push(tokens[index]);
    index += 1;
  }

  let value = parseIntegerWords(integerWords);
  if (index < tokens.length && ['koma', 'poin'].includes(tokens[index])) {
    index += 1;
    let decimal = '';
    while (index < tokens.length && numberWords.has(tokens[index])) {
      decimal += String(numberWords.get(tokens[index]));
      index += 1;
    }
    if (decimal) value += Number(`0.${decimal}`);
  }

  return { value, nextIndex: index };
}

function parseIntegerWords(words: string[]): number {
  if (words.length === 0) return 0;
  if (words[0] === 'seratus') return 100 + parseIntegerWords(words.slice(1));
  if (words.length >= 2 && words[1] === 'ratus') return (numberWords.get(words[0]) ?? 0) * 100 + parseIntegerWords(words.slice(2));
  if (words.length >= 2 && words[1] === 'puluh') return (numberWords.get(words[0]) ?? 0) * 10 + parseIntegerWords(words.slice(2));
  if (words.length >= 2 && words[1] === 'belas') return 10 + (numberWords.get(words[0]) ?? 0);
  const direct = numberWords.get(words[0]);
  if (direct !== undefined) return direct;
  const parsed = Number(words[0]);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isNumberToken(token: string): boolean {
  return numberWords.has(token) || numericTokens.has(token) || Number.isFinite(Number(token));
}
