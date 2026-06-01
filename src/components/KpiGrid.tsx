import { Activity, BarChart3, Binary, Gauge, Hash, Ruler, Sigma, Target } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { formatCalculated, formatUserInput } from '../utils/formatters';

const icons = [Hash, Binary, Activity, Target, Sigma, Gauge, Ruler, BarChart3];

export function KpiGrid() {
  const results = useDataStore((state) => state.results);
  const cards = [
    { label: 'N', value: results ? results.n.toString() : '--', caption: 'Jumlah frekuensi total' },
    {
      label: 'DELTA (Δ)',
      value: results && results.delta > 0 ? formatUserInput(results.delta) : '--',
      caption: results && results.delta > 0 ? 'Dihitung otomatis dari data' : 'Tambahkan minimal 2 data untuk menghitung delta',
      title: results && results.delta > 0 ? 'Delta dihitung otomatis dari data' : 'Tambahkan minimal 2 data untuk menghitung delta',
    },
    { label: 'xbar Empiris', value: results ? formatCalculated(results.meanEmpiris) : '--', caption: 'Rata-rata data aktual' },
    { label: 'xbar Teoritik', value: results ? formatCalculated(results.meanTeoritik) : '--', caption: 'Rata-rata kurva teoritis' },
    { label: 'sigma Empiris', value: results ? formatCalculated(results.stdEmpiris) : '--', caption: 'Simpangan baku data aktual' },
    { label: 'sigma Teoritik', value: results ? formatCalculated(results.stdTeoritik) : '--', caption: 'Simpangan baku teoritis' },
    { label: 'Range', value: results ? formatCalculated(results.range) : '--', caption: 'Rentang data (xmax - xmin)' },
    { label: 'Modus', value: results ? results.modus.map((value) => formatCalculated(value)).join(', ') : '--', caption: 'Nilai dengan fi tertinggi' },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8" data-tour-id="kpi">
      {cards.map(({ label, value, caption, title }, index) => {
        const Icon = icons[index];
        return (
          <article key={label} className="card flex min-h-36 flex-col p-5" title={title}>
            <div className="mb-4 flex items-center justify-between">
              <p className="min-w-0 pr-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
              <Icon className="size-5 shrink-0 text-teal-700 dark:text-teal-100" />
            </div>
            <p className="break-words text-[clamp(1.25rem,1.4vw,1.5rem)] font-semibold leading-tight text-slate-950 dark:text-white" title={value}>
              {value}
            </p>
            <p className="mt-auto pt-3 text-sm text-slate-500 dark:text-slate-400">{caption}</p>
          </article>
        );
      })}
    </section>
  );
}
