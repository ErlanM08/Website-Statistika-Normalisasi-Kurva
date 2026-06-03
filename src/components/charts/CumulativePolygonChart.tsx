import { memo } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import './chartSetup';
import { useDataStore } from '../../store/useDataStore';
import { cumulativeNormalFromDataPoint } from '../../utils/normalDistribution';
import { formatCalculated, formatUserInput } from '../../utils/formatters';
import { createValueLabelPlugin } from './valueLabelPlugin';

interface Point {
  x: number;
  y: number;
}

function CumulativePolygonChartComponent() {
  const results = useDataStore((state) => state.results);
  const layers = useDataStore((state) => state.layerControls);
  const chartSettings = useDataStore((state) => state.chartSettings);
  if (!results) return null;
  const rows = results.tableRows;
  const datasets: ChartData<'line', Point[]>['datasets'] = [
    {
      label: 'Fi[%] empiris',
      data: rows.map((row) => ({ x: row.xi, y: row.FiPercent })),
      borderColor: chartSettings.cumulativeColor,
      backgroundColor: `${chartSettings.cumulativeColor}20`,
      tension: 0.25,
    },
  ];

  if (layers.showCumulativePolygon) {
    datasets.push({
      label: 'Fi[%] teoritis',
      data: rows.map((row) => ({ x: row.xi, y: cumulativeNormalFromDataPoint(row.xi, results.meanTeoritik, results.stdTeoritik) })),
      borderColor: chartSettings.theoreticalColor,
      borderDash: [5, 5],
      tension: 0.35,
    });
  }

  return <Line data={{ datasets }} options={buildOptions(chartSettings.xAxisLabel, chartSettings.yAxisLabel)} plugins={layers.showBarLabels ? [cumulativeValueLabelPlugin] : []} />;
}

const buildOptions = (xAxisLabel: string, yAxisLabel: string): ChartOptions<'line'> => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    title: { display: true, text: 'Poligon Frekuensi Kumulatif' },
    tooltip: {
      callbacks: {
        title: (items) => `Xi: ${formatUserInput(Number(items[0]?.parsed.x ?? 0))}`,
        label: (item) => `${item.dataset.label}: ${formatCalculated(Number(item.parsed.y ?? 0))}%`,
      },
    },
  },
  scales: {
    x: { type: 'linear', title: { display: true, text: xAxisLabel }, grid: { color: '#e5e7eb80' }, ticks: { callback: (value) => formatUserInput(Number(value)) } },
    y: { min: 0, max: 100, title: { display: true, text: yAxisLabel }, ticks: { callback: (value) => `${formatCalculated(Number(value))}%` }, grid: { color: '#e5e7eb80' } },
  },
});

export const CumulativePolygonChart = memo(CumulativePolygonChartComponent);

const cumulativeValueLabelPlugin = createValueLabelPlugin<'line'>((value) => `${formatCalculated(value)}%`);
