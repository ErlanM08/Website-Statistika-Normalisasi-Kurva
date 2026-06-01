import { Calculator, Sigma, TrendingUp } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { formatNumber } from '../utils/format';

export function FormulaPanel() {
  const results = useDataStore((state) => state.results);
  const visible = useDataStore((state) => state.isFormulaVisible);
  if (!visible) return null;

  const steps = [
    ['1', 'fi[%]', '(fi / n) x 100%', results ? `n = ${results.n}` : '--'],
    ['2', 'Fi[%]', 'Sigma fi[%] sampai baris i', results ? `${formatNumber(results.tableRows[results.tableRows.length - 1]?.FiPercent)}%` : '--'],
    ['3', 'u', 'Inverse CDF normal standar', 'Fi[%] = 100% menghasilkan infinity'],
    ['4', 'u Interp.', 'u_int = m.xi + b', results ? `m=${formatNumber(results.regression.m)}, b=${formatNumber(results.regression.b)}` : '--'],
    ['5', 'xbar Teoritik', 'x saat u = 0', formatNumber(results?.meanTeoritik)],
    ['6', 'sigma Teoritik', 'xbar_teoritik - x(u=-1)', formatNumber(results?.stdTeoritik)],
    ['7', "P{u'} dan P{x'}", '(1/sqrt(2pi))e^(-u_int^2/2) / sigma', results ? `sigma=${formatNumber(results.stdTeoritik)}` : '--'],
    ['8', "f{x'}", "P{x'} x Delta x n", results ? `Delta=${formatNumber(results.delta)}` : '--'],
  ];

  return (
    <aside className="card overflow-hidden">
      <div className="border-b border-slate-100 p-6 dark:border-slate-800">
        <h2 className="text-xl font-semibold">Rumus & Keterangan</h2>
        <p className="text-sm tracking-wide text-slate-500 dark:text-slate-400">Pipeline Empirical Distribution Fitting</p>
      </div>
      <div className="space-y-4 p-6">
        {steps.map(([no, title, formula, value]) => (
          <article key={no} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
            <p className="mb-2 flex items-center gap-2 font-bold text-teal-800 dark:text-teal-100">
              {no === '4' ? <TrendingUp className="size-4" /> : no === '6' ? <Sigma className="size-4" /> : <Calculator className="size-4" />}
              {no}. {title}
            </p>
            <div className="rounded-xl bg-slate-50 p-3 font-mono text-sm dark:bg-slate-800">{formula}</div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Nilai aktual: <span className="font-semibold text-teal-700 dark:text-teal-100">{value}</span>
            </p>
          </article>
        ))}
      </div>
      <div className="bg-teal-50 p-6 text-sm text-teal-900 dark:bg-teal-900/30 dark:text-teal-50">
        Tips ahli: baris dengan Fi[%] = 100% otomatis dikeluarkan dari regresi agar nilai infinity tidak merusak model OLS.
      </div>
    </aside>
  );
}
