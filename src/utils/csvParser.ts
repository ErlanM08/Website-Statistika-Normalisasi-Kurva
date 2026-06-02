import ExcelJS from 'exceljs';
import Papa from 'papaparse';
import type { RawDataPoint } from '../types';
import { parseNumber } from './format';

export function parseCsvFile(file: File): Promise<RawDataPoint[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      complete: (result) => {
        const points = result.data.flatMap((row) => {
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

export async function parseExcelFile(file: File): Promise<RawDataPoint[]> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new Error('File Excel tidak berisi sheet');

    const headers = [cellToString(sheet.getRow(1).getCell(1)), cellToString(sheet.getRow(1).getCell(2))];
    if (headers[0] !== 'Xi' || headers[1] !== 'fi') {
      throw new Error('Format salah: header kolom harus "Xi" dan "fi"');
    }

    const points: RawDataPoint[] = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const xiText = cellToString(row.getCell(1));
      const fiText = cellToString(row.getCell(2));
      if (!xiText && !fiText) return;
      const xi = Number(xiText);
      const fi = Number(fiText);
      points.push({ xi, fi });
    });

    if (points.some((point) => !Number.isFinite(point.xi) || !Number.isFinite(point.fi))) {
      throw new Error('Format salah: kolom "Xi" dan "fi" harus berisi angka');
    }

    return points;
  } catch (error) {
    throw error instanceof Error ? error : new Error('File Excel tidak dapat dibaca');
  }
}

export function downloadExcelTemplate(): void {
  void (async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template');
    worksheet.columns = [
      { header: 'Xi', key: 'xi', width: 14 },
      { header: 'fi', key: 'fi', width: 14 },
    ];
    for (let index = 0; index < 10; index += 1) {
      worksheet.addRow({ xi: '', fi: '' });
    }
    worksheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    downloadBinaryBlob(buffer, 'template-normalisasi-kurva.xlsx');
  })();
}

function cellToString(cell: ExcelJS.Cell): string {
  const value = cell.value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    if ('result' in value) return String(value.result ?? '').trim();
    if ('text' in value) return String(value.text ?? '').trim();
    if ('richText' in value) return value.richText.map((item) => item.text).join('').trim();
  }
  return String(value).trim();
}

function downloadBinaryBlob(buffer: ExcelJS.Buffer, filename: string): void {
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
