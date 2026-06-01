import { ChevronDown, Layers, Palette, RotateCcw, SlidersHorizontal, Tags, X } from 'lucide-react';
import { useState } from 'react';
import { useDataStore } from '../../store/useDataStore';
import type { ChartSettings, LayerControls } from '../../types';

const labels: Record<keyof LayerControls, string> = {
  showFiPolygon: 'Poligon fi',
  showFiCumulative: 'Kumulatif Fi',
  showEmpiricPolygon: 'Poligon empiris',
  showTheoreticalCurve: 'Kurva teoritis',
  showCumulativePolygon: 'Kumulatif',
  showMeanTeoritikLine: 'Mean teoritik',
  showMeanEmpirisLine: 'Mean empiris',
  showShading: 'Shading sigma',
  showBarLabels: 'Label nilai',
};

const colorControls: Array<{ key: keyof Pick<ChartSettings, 'empiricColor' | 'theoreticalColor' | 'cumulativeColor' | 'meanTeoritikColor' | 'meanEmpirisColor'>; label: string }> = [
  { key: 'empiricColor', label: 'fi empiris' },
  { key: 'theoreticalColor', label: "f{x'} teoritis" },
  { key: 'cumulativeColor', label: 'Fi kumulatif' },
  { key: 'meanTeoritikColor', label: 'Mean teoritik' },
  { key: 'meanEmpirisColor', label: 'Mean empiris' },
];

export function LayerControlPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoreConfig, setShowMoreConfig] = useState(false);
  const layers = useDataStore((state) => state.layerControls);
  const chartSettings = useDataStore((state) => state.chartSettings);
  const toggleLayer = useDataStore((state) => state.toggleLayer);
  const setChartSetting = useDataStore((state) => state.setChartSetting);
  const resetChartSettings = useDataStore((state) => state.resetChartSettings);

  return (
    <div className="absolute right-3 top-3 z-50">
      <div className="w-36">
        <button className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 text-sm font-bold text-slate-700 shadow-bloom transition hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100 dark:hover:bg-teal-900/30" onClick={() => setIsOpen((current) => !current)} type="button" aria-expanded={isOpen} title="Buka kontrol layer grafik">
          <Layers className="size-4" />
          Layer
        </button>
        {!isOpen ? (
          <p className="mt-1 rounded-lg bg-white/85 px-2 py-1 text-center text-[10px] leading-snug text-slate-500 shadow-sm dark:bg-slate-900/85 dark:text-slate-400">
            Tampilkan info tambahan di grafik
          </p>
        ) : null}
      </div>

      {isOpen ? (
        <div className="absolute right-0 top-12 w-72 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-bloom dark:border-slate-700 dark:bg-slate-900/95">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
              <Layers className="size-4" /> Kontrol Layer
            </p>
            <button className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-teal-700 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)} type="button" title="Tutup kontrol layer">
              <X className="size-4" />
            </button>
          </div>
          <div className="space-y-2">
            {(Object.keys(labels) as Array<keyof LayerControls>).map((key) => (
              <label key={key} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <input className="size-4 accent-teal-500" type="checkbox" checked={layers[key]} onChange={() => toggleLayer(key)} />
                {labels[key]}
              </label>
            ))}
          </div>

          <button className="mt-3 flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-teal-900/30" onClick={() => setShowMoreConfig((current) => !current)} type="button" aria-expanded={showMoreConfig}>
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-4" /> More Configuration
            </span>
            <ChevronDown className={`size-4 transition ${showMoreConfig ? 'rotate-180' : ''}`} />
          </button>

          {showMoreConfig ? (
            <div className="mt-3 max-h-[300px] overflow-y-auto border-t border-slate-200 pt-3 dark:border-slate-700">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                  <Palette className="size-4" /> Warna Grafik
                </p>
                <button className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-teal-700 dark:text-slate-300 dark:hover:bg-slate-800" onClick={resetChartSettings} title="Reset warna dan label grafik">
                  <RotateCcw className="size-4" />
                </button>
              </div>
              <div className="space-y-2">
                {colorControls.map((control) => (
                  <label key={control.key} className="flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
                    <span>{control.label}</span>
                    <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
                      <span className="size-4 rounded-full border border-black/10" style={{ backgroundColor: chartSettings[control.key] }} />
                      <input className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0" type="color" value={chartSettings[control.key]} onChange={(event) => setChartSetting(control.key, event.target.value)} aria-label={`Pilih warna ${control.label}`} />
                    </span>
                  </label>
                ))}
              </div>

              <div className="my-3 h-px bg-slate-200 dark:bg-slate-700" />

              <p className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                <Tags className="size-4" /> Label Sumbu
              </p>
              <label className="mb-2 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Sumbu X
                <input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" value={chartSettings.xAxisLabel} onChange={(event) => setChartSetting('xAxisLabel', event.target.value)} placeholder="Label sumbu X" />
              </label>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Sumbu Y
                <input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" value={chartSettings.yAxisLabel} onChange={(event) => setChartSetting('yAxisLabel', event.target.value)} placeholder="Label sumbu Y" />
              </label>
            </div>
          ) : (
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Buka untuk mengatur warna grafik dan label sumbu.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
