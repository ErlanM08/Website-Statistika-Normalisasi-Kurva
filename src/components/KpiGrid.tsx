import { Activity, BarChart3, Binary, Gauge, Hash, Ruler, Sigma, Target } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { formatCalculated, formatUserInput } from '../utils/formatters';

const icons = [Hash, Binary, Activity, Target, Sigma, Gauge, Ruler, BarChart3];

export function KpiGrid() {
  const results = useDataStore((state) => state.results);
  const cards = [
    { label: 'Jumlah Data', value: results ? results.n.toString() : '--', symbol: 'n', caption: 'Jumlah frekuensi total' },
    {
      label: 'Range',
      value: results ? formatCalculated(results.range) : '--',
      symbol: 'R = Xmax - Xmin',
      caption: 'Rentang data (xmax - xmin)',
      title: 'Rentang data (xmax - xmin)',
    },
    { label: 'Rata-Rata Sample', value: results ? formatCalculated(results.meanEmpiris) : '--', symbol: 'x̄', caption: 'Rata-rata data aktual' },
    {
      label: 'Rata-Rata Teoritik',
      value: results ? formatCalculated(results.meanTeoritik) : '--',
      symbol: "x̄'",
      caption: 'Rata-rata kurva teoritis',
    },
    { label: 'Std Deviasi Sample', value: results ? formatCalculated(results.stdEmpiris) : '--', symbol: 's', caption: 'Simpangan baku data aktual' },
    {
      label: 'Std Deviasi Teoritik',
      value: results ? formatCalculated(results.stdTeoritik) : '--',
      symbol: "σ'",
      caption: 'Simpangan baku teoritis',
    },
    {
      label: 'Delta (Δ)',
      value: results && results.delta > 0 ? formatUserInput(results.delta) : '--',
      symbol: 'Δ',
      caption: 'Jarak antar nilai data',
      title: results && results.delta > 0 ? undefined : 'Tambahkan minimal 2 data untuk menghitung Delta',
    },
    { label: 'Modus', value: results ? results.modus.map((value) => formatCalculated(value)).join(', ') : '--', symbol: 'Mo', caption: 'Nilai dengan fi tertinggi' },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8" data-tour-id="kpi">
      {cards.map(({ label, value, symbol, caption, title }, index) => {
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
            <p className="pt-2 text-xs font-semibold italic text-slate-400 dark:text-slate-500">{symbol}</p>
            <p className="mt-auto pt-2 text-sm text-slate-500 dark:text-slate-400">{caption}</p>
          </article>
        );
      })}
    </section>
  );
}
