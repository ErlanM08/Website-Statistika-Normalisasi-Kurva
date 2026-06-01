import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { DataType, RawDataPoint } from '../types';
import { parseNumber } from './format';

interface ExcelRow {
  Xi: number;
  fi: number;
  'Batas Bawah'?: number;
  'Batas Atas'?: number;
  xi?: number;
}

export function parseCsvFile(file: File, dataType: DataType = 'single'): Promise<RawDataPoint[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      complete: (result) => {
        const points = result.data.flatMap((row) => {
          if (dataType === 'grouped') {
            const classStart = parseNumber(row[0] ?? '');
            const classEnd = parseNumber(row[1] ?? '');
            const fi = parseNumber(row[3] ?? row[2] ?? '');
            if (classStart === null || classEnd === null || fi === null || classEnd <= classStart) return [];
            return [{ classStart, classEnd, xi: (classStart + classEnd) / 2, fi }];
          }
          const xi = parseNumber(row[0] ?? '');
          const fi = parseNumber(row[1] ?? '1');
          return xi !== null && fi !== null ? [{ xi, fi }] : [];
        });
        resolve(points);
      },
      error: (error: Error) => reject(error),
    });
  });
}

export function parseExcelFile(file: File, dataType: DataType = 'single'): Promise<RawDataPoint[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet) as ExcelRow[];

        if (dataType === 'grouped') {
          if (!rows[0] || !('Batas Bawah' in rows[0]) || !('Batas Atas' in rows[0]) || !('fi' in rows[0])) {
            reject(new Error('Format salah: header kolom harus "Batas Bawah", "Batas Atas", "xi", dan "fi"'));
            return;
          }

          const points = rows.map((row) => {
            const classStart = Number(row['Batas Bawah']);
            const classEnd = Number(row['Batas Atas']);
            return { classStart, classEnd, xi: (classStart + classEnd) / 2, fi: Number(row.fi) };
          });
          if (points.some((point) => !Number.isFinite(point.classStart) || !Number.isFinite(point.classEnd) || point.classEnd <= point.classStart || !Number.isFinite(point.fi))) {
            reject(new Error('Format salah: batas kelas dan fi harus berisi angka valid'));
            return;
          }

          resolve(points);
          return;
        }

        if (!rows[0] || !('Xi' in rows[0]) || !('fi' in rows[0])) {
          reject(new Error('Format salah: header kolom harus "Xi" dan "fi"'));
          return;
        }

        const points = rows.map((row) => ({ xi: Number(row.Xi), fi: Number(row.fi) }));
        if (points.some((point) => !Number.isFinite(point.xi) || !Number.isFinite(point.fi))) {
          reject(new Error('Format salah: kolom "Xi" dan "fi" harus berisi angka'));
          return;
        }

        resolve(points);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('File Excel tidak dapat dibaca'));
      }
    };
    reader.onerror = () => reject(new Error('File Excel tidak dapat dibaca'));
    reader.readAsArrayBuffer(file);
  });
}

export function downloadExcelTemplate(dataType: DataType = 'single'): void {
  if (dataType === 'grouped') {
    const rows = [['Batas Bawah', 'Batas Atas', 'xi', 'fi'], ...Array.from({ length: 10 }, (_, index) => ['', '', { f: `((A${index + 2}+B${index + 2})/2)` }, ''])];
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet['!cols'] = [{ wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 }];
    applyHeaderStyle(worksheet, 4);
    for (let row = 2; row <= 11; row += 1) {
      const cell = worksheet[`C${row}`];
      if (cell) cell.s = { fill: { fgColor: { rgb: 'E5E7EB' } }, protection: { locked: true } };
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'template-normalisasi-kurva.xlsx');
    return;
  }

  const rows = [['Xi', 'fi'], ...Array.from({ length: 10 }, () => ['', ''])];
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet['!cols'] = [{ wch: 14 }, { wch: 14 }];
  applyHeaderStyle(worksheet, 2);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, 'template-normalisasi-kurva.xlsx');
}

function applyHeaderStyle(worksheet: XLSX.WorkSheet, columns: number): void {
  for (let index = 0; index < columns; index += 1) {
    const address = XLSX.utils.encode_cell({ r: 0, c: index });
    const cell = worksheet[address];
    if (cell) cell.s = { font: { bold: true } };
  }
}
