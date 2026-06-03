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
    row.Pu,
    row.Px,
    row.fxPrime,
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
        row.Pu,
        row.Px,
        row.fxPrime,
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
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const restoreLayout = setTemporaryExportWidth(root);
  await waitForLayout();

  pdf.setFontSize(16);
  pdf.text(title, 14, 14);
  pdf.setFontSize(10);
  pdf.text(`n=${results.n} | delta=${results.delta.toFixed(4)} | R2=${results.regression.rSquared.toFixed(4)}`, 14, 22);

  try {
    const sections = Array.from(root.children).filter((child): child is HTMLElement => child instanceof HTMLElement && child.offsetHeight > 0);
    let cursorY = 30;

    for (const section of sections.length > 0 ? sections : [root]) {
      const canvas = await html2canvas(section, {
        scale: 2,
        useCORS: true,
        windowWidth: 1200,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: '#f8f9fb',
      });
      cursorY = addCanvasToPdf(pdf, canvas, cursorY);
    }

    pdf.save(`${toSafeFilename(title)}.pdf`);
  } finally {
    restoreLayout();
  }
}

function setTemporaryExportWidth(element: HTMLElement): () => void {
  const previousWidth = element.style.width;
  const previousMinWidth = element.style.minWidth;
  const previousMaxWidth = element.style.maxWidth;

  element.style.width = '1200px';
  element.style.minWidth = '1100px';
  element.style.maxWidth = '1200px';

  return () => {
    element.style.width = previousWidth;
    element.style.minWidth = previousMinWidth;
    element.style.maxWidth = previousMaxWidth;
  };
}

function waitForLayout(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

function addCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement, startY: number): number {
  const margin = 10;
  const gap = 6;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let cursorY = startY;
  let sourceY = 0;

  while (sourceY < canvas.height) {
    const availableHeight = pageHeight - cursorY - margin;
    if (availableHeight < 35) {
      pdf.addPage();
      cursorY = margin;
    }

    const pageAvailableHeight = pageHeight - cursorY - margin;
    const sliceHeight = Math.min(canvas.height - sourceY, Math.floor((pageAvailableHeight * canvas.width) / contentWidth));
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;
    const context = pageCanvas.getContext('2d');
    if (!context) break;

    context.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
    const slicePdfHeight = (sliceHeight * contentWidth) / canvas.width;
    pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', margin, cursorY, contentWidth, slicePdfHeight);
    sourceY += sliceHeight;
    cursorY += slicePdfHeight + gap;

    if (sourceY < canvas.height) {
      pdf.addPage();
      cursorY = margin;
    }
  }

  return cursorY;
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
