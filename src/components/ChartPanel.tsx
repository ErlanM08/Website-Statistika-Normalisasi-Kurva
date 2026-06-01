import { lazy, Suspense, type ReactNode } from 'react';
import { BarChart3 } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { LayerControlPanel } from './charts/LayerControlPanel';

const FrequencyPolygonChart = lazy(() => import('./charts/FrequencyPolygonChart').then((module) => ({ default: module.FrequencyPolygonChart })));
const CumulativePolygonChart = lazy(() => import('./charts/CumulativePolygonChart').then((module) => ({ default: module.CumulativePolygonChart })));
const BarComparisonChart = lazy(() => import('./charts/BarComparisonChart').then((module) => ({ default: module.BarComparisonChart })));
const FrequencyDistributionChart = lazy(() => import('./ChartPanel/FrequencyDistributionChart').then((module) => ({ default: module.FrequencyDistributionChart })));

export function ChartPanel() {
  const viewMode = useDataStore((state) => state.viewMode);
  const results = useDataStore((state) => state.results);
  const layerControls = useDataStore((state) => state.layerControls);
  const showSecondary = viewMode !== 'compact' && results;
  const showAll = viewMode === 'full' && results;

  return (
    <section className="card p-6" data-tour-id="charts">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Visualisasi Kurva & Distribusi</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Empiris f&#123;x&#125; dibandingkan dengan frekuensi teoritis f&#123;x&apos;&#125;.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">
          <BarChart3 className="size-4" /> Grafik Utama
        </span>
      </div>

      <div className="relative min-h-[480px]" data-export-chart="main">
        <LayerControlPanel />
        <Suspense fallback={<ChartFallback />}>
          <FrequencyPolygonChart />
        </Suspense>
      </div>

      {showSecondary ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <ChartBox>
            <Suspense fallback={<ChartFallback />}>
              <CumulativePolygonChart />
            </Suspense>
          </ChartBox>
          <ChartBox>
            <Suspense fallback={<ChartFallback />}>
              <FrequencyDistributionChart tableRows={results.tableRows} n={results.n} layerControls={layerControls} />
            </Suspense>
          </ChartBox>
        </div>
      ) : null}

      {showAll ? (
        <ChartBox className="mt-6">
          <Suspense fallback={<ChartFallback />}>
            <BarComparisonChart />
          </Suspense>
        </ChartBox>
      ) : null}
    </section>
  );
}

function ChartBox({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`h-80 rounded-xl border border-slate-100 p-4 dark:border-slate-800 ${className}`}>{children}</div>;
}

function ChartFallback() {
  return <div className="grid h-full min-h-80 place-items-center text-sm text-slate-500">Memuat modul grafik...</div>;
}
