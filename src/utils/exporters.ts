import ExcelJS from 'exceljs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import type { StatResults } from '../types';
import { toSafeFilename } from './format';

const headers = ['No.', 'Xi', 'fi', 'fi[%]', 'Fi', 'Fi[%]', 'u', 'u Interpolasi', "P{u'}", "P{x'}", "f{x'}"];

export function exportCsv(results: StatResults, projectName?: string): void {
  const rows = results.tableRows.map((row) => [
    row.no,
    row.xi,
    row.fi,
    row.fiPercent,
    row.FiAbsolute,
    row.FiPercent,
    row.isExcluded ? 'infinity' : row.u,
    row.uInterpolasi,
    row.isExcluded ? 0 : row.Pu,
    row.isExcluded ? 0 : row.Px,
    row.isExcluded ? 0 : row.fxPrime,
  ]);
  downloadBlob(Papa.unparse([headers, ...rows]), `${toSafeFilename(projectName ?? '')}.csv`, 'text/csv;charset=utf-8');
}

export function exportExcel(results: StatResults, projectName?: string): void {
  void (async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Normalisasi');
    worksheet.addRow(headers);
    results.tableRows.forEach((row) => {
      worksheet.addRow([
        row.no,
        row.xi,
        row.fi,
        row.fiPercent,
        row.FiAbsolute,
        row.FiPercent,
        row.isExcluded ? 'infinity' : row.u,
        row.uInterpolasi,
        row.isExcluded ? 0 : row.Pu,
        row.isExcluded ? 0 : row.Px,
        row.isExcluded ? 0 : row.fxPrime,
      ]);
    });
    worksheet.columns.forEach((column) => {
      column.width = 14;
    });
    worksheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    downloadBinaryBlob(buffer, `${toSafeFilename(projectName ?? '')}.xlsx`);
  })();
}

export function exportFirstChartPng(projectName?: string): void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-export-chart="main"] canvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `${toSafeFilename(projectName ?? '')}.png`;
  link.click();
}

export async function exportPdf(results: StatResults, root: HTMLElement, projectName?: string): Promise<void> {
  const title = projectName?.trim() || 'Laporan Normalisasi Kurva';
  const image = await html2canvas(root, { scale: 2, backgroundColor: '#f8f9fb' });
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  pdf.setFontSize(16);
  pdf.text(title, 14, 14);
  pdf.setFontSize(10);
  pdf.text(`n=${results.n} | delta=${results.delta.toFixed(4)} | R2=${results.regression.rSquared.toFixed(4)}`, 14, 22);
  pdf.addImage(image.toDataURL('image/png'), 'PNG', 10, 30, 277, 155);
  pdf.save(`${toSafeFilename(title)}.pdf`);
}

function downloadBlob(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function downloadBinaryBlob(buffer: ExcelJS.Buffer, filename: string): void {
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
