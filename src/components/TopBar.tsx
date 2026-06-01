import { ChevronDown, Download, FileDown, FileImage, FileJson, FileSpreadsheet, FileText, Map, Moon, PanelRight, Settings, Sun } from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useDataStore } from '../store/useDataStore';
import { parseSessionFile, downloadSession } from '../utils/sessionManager';
import { Button } from './ui/Button';

export function TopBar() {
  const store = useDataStore();
  const reportRef = useRef<HTMLElement | null>(null);

  const loadSession = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    parseSessionFile(file).then(store.loadSession).catch(() => undefined);
  };

  const exportReport = () => {
    const root = document.getElementById('report-root');
    if (store.results && root) import('../utils/exporters').then((module) => module.exportPdf(store.results!, root, store.sessionName));
    reportRef.current = root;
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-5 lg:px-10">
        <div className="flex items-center gap-3">
          <Settings className="size-6 text-teal-700 dark:text-teal-100" />
          <p className="text-lg font-bold text-teal-900 dark:text-teal-100">Normalisasi Kurva Calculator</p>
        </div>
        <nav className="flex items-center gap-1">
          {(['compact', 'standard', 'full'] as const).map((mode) => (
            <button key={mode} className={`rounded-xl px-4 py-2 text-sm font-semibold ${store.viewMode === mode ? 'bg-teal-50 text-teal-800 dark:bg-teal-900/40 dark:text-teal-100' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} onClick={() => store.setViewMode(mode)}>
              {mode === 'compact' ? 'Ringkas' : mode === 'standard' ? 'Standar' : 'Lengkap'}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button className="h-10 px-3" variant="secondary" icon={<Map className="size-4" />} onClick={() => store.startTour(0)} data-tour-id="tour-button">
            Tour
          </Button>
          <button className="icon-button" onClick={store.toggleFormula} title="Rumus" data-tour-id="formula-toggle">
            <PanelRight className="size-5" />
          </button>
          <button className="icon-button" onClick={store.toggleDarkMode} title="Tema">
            {store.isDarkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
          <label className="icon-button cursor-pointer" title="Load session">
            <FileJson className="size-5" />
            <input className="sr-only" type="file" accept="application/json" onChange={loadSession} />
          </label>
          <ExportActions exportReport={exportReport} saveSession={() => downloadSession(store)} />
        </div>
      </div>
    </header>
  );
}

function ExportActions({ exportReport, saveSession }: { exportReport: () => void; saveSession: () => void }) {
  const results = useDataStore((state) => state.results);
  const sessionName = useDataStore((state) => state.sessionName);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  const exportCsv = () => {
    if (!results) return;
    import('../utils/exporters').then((module) => module.exportCsv(results, sessionName));
    setIsOpen(false);
  };

  const exportExcel = () => {
    if (!results) return;
    import('../utils/exporters').then((module) => module.exportExcel(results, sessionName));
    setIsOpen(false);
  };

  const exportPng = () => {
    if (!results) return;
    import('../utils/exporters').then((module) => module.exportFirstChartPng(sessionName));
    setIsOpen(false);
  };

  const exportPdf = () => {
    if (!results) return;
    exportReport();
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2" data-tour-id="export-actions">
      <Button variant="secondary" icon={<Download className="size-4" />} onClick={saveSession}>
        Sesi
      </Button>
      <div ref={menuRef} className="relative">
        <Button className="h-10 w-12 gap-1 p-0" disabled={!results} icon={<Download className="size-5" />} onClick={() => setIsOpen((open) => !open)} title="Download file hasil perhitungan" aria-label="Download file hasil perhitungan" aria-expanded={isOpen}>
          <ChevronDown className="size-3.5" />
          <span className="sr-only">Download file</span>
        </Button>
        {isOpen ? (
          <div className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <button className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800 dark:text-slate-100 dark:hover:bg-teal-900/40" onClick={exportCsv}>
              <FileText className="size-4 text-teal-600 dark:text-teal-300" />
              Download CSV
            </button>
            <button className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800 dark:text-slate-100 dark:hover:bg-teal-900/40" onClick={exportExcel}>
              <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-300" />
              Download Excel
            </button>
            <button className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800 dark:text-slate-100 dark:hover:bg-teal-900/40" onClick={exportPng}>
              <FileImage className="size-4 text-blue-600 dark:text-blue-300" />
              Download PNG
            </button>
            <button className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800 dark:text-slate-100 dark:hover:bg-teal-900/40" onClick={exportPdf}>
              <FileDown className="size-4 text-red-600 dark:text-red-300" />
              Download PDF
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
