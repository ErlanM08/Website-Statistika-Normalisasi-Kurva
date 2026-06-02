import { memo } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import './chartSetup';
import { useDataStore } from '../../store/useDataStore';
import { formatCalculated, formatIntegerInput, formatUserInput } from '../../utils/formatters';

interface Point {
  x: number;
  y: number;
}

function FrequencyPolygonChartComponent() {
  const results = useDataStore((state) => state.results);
  const layers = useDataStore((state) => state.layerControls);
  const chartSettings = useDataStore((state) => state.chartSettings);

  if (!results) return <EmptyChart title="Jalankan normalisasi untuk melihat grafik utama." />;

  const rows = results.tableRows;
  const maxY = Math.max(...rows.map((row) => Math.max(row.fi, row.fxPrime)), 1);
  const datasets: ChartData<'line', Point[]>['datasets'] = [];

  if (layers.showEmpiricPolygon) {
    datasets.push({
      label: 'f{x} empiris',
      data: rows.map((row) => ({ x: row.xi, y: row.fi })),
      borderColor: chartSettings.empiricColor,
      backgroundColor: `${chartSettings.empiricColor}20`,
      pointRadius: 4,
      tension: 0.25,
    });
  }
  if (layers.showTheoreticalCurve) {
    datasets.push({
      label: "f{x'} teoritis",
      data: rows.map((row) => ({ x: row.xi, y: row.fxPrime })),
      borderColor: chartSettings.theoreticalColor,
      backgroundColor: layers.showShading ? `${chartSettings.theoreticalColor}25` : `${chartSettings.theoreticalColor}00`,
      fill: layers.showShading,
      pointRadius: 3,
      tension: 0.4,
    });
  }
  addMeanLine(datasets, results.meanTeoritik, maxY, 'Rata-Rata Teoritik', chartSettings.meanTeoritikColor, layers.showMeanTeoritikLine);
  addMeanLine(datasets, results.meanEmpiris, maxY, 'Rata-Rata Sample', chartSettings.meanEmpirisColor, layers.showMeanEmpirisLine);

  return <Line data={{ datasets }} options={options('Poligon Frekuensi', chartSettings.xAxisLabel, chartSettings.yAxisLabel)} />;
}

const options = (title: string, xAxisLabel: string, yAxisLabel: string): ChartOptions<'line'> => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'nearest', intersect: false },
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true } },
    tooltip: {
      callbacks: {
        title: (items) => `Xi: ${formatUserInput(Number(items[0]?.parsed.x ?? 0))}`,
        label: (item) => {
          const value = Number(item.parsed.y ?? 0);
          return item.dataset.label?.includes("f{x'}") ? `f{x'}: ${formatCalculated(value)}` : `fi: ${formatIntegerInput(value)}`;
        },
      },
    },
    title: { display: true, text: title },
  },
  scales: {
    x: { type: 'linear', title: { display: true, text: xAxisLabel }, grid: { color: '#e5e7eb80' }, ticks: { callback: (value) => formatUserInput(Number(value)) } },
    y: { beginAtZero: true, title: { display: true, text: yAxisLabel }, grid: { color: '#e5e7eb80' }, ticks: { callback: (value) => formatIntegerInput(Number(value)) } },
  },
});

function addMeanLine(datasets: ChartData<'line', Point[]>['datasets'], x: number, maxY: number, label: string, color: string, enabled: boolean) {
  if (!enabled) return;
  datasets.push({ label, data: [{ x, y: 0 }, { x, y: maxY * 1.08 }], borderColor: color, borderDash: [6, 6], pointRadius: 0 });
}

function EmptyChart({ title }: { title: string }) {
  return <div className="grid h-full place-items-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500">{title}</div>;
}

export const FrequencyPolygonChart = memo(FrequencyPolygonChartComponent);
