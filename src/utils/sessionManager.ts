import type { DataStore } from '../store/useDataStore';
import type { RawDataPoint, SessionData } from '../types';
import { toSafeFilename } from './format';

export function downloadSession(store: DataStore, name?: string): void {
  const session = store.exportSession();
  const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${toSafeFilename(name ?? session.sessionName)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function parseSessionFile(file: File): Promise<SessionData> {
  return file.text().then((text) => {
    const parsed: unknown = JSON.parse(text);
    if (!validateSession(parsed)) throw new Error('File sesi tidak valid');
    return parsed;
  });
}

export function validateSession(data: unknown): data is SessionData {
  if (!isRecord(data)) return false;
  return data.version === '2.0.0' && typeof data.sessionName === 'string' && isRawDataArray(data.rawData);
}

function isRawDataArray(value: unknown): value is RawDataPoint[] {
  return Array.isArray(value) && value.every((item) => isRecord(item) && typeof item.xi === 'number' && typeof item.fi === 'number');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
