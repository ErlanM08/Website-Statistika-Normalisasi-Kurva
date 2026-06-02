import { memo } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import '../charts/chartSetup';
import type { LayerControls, TableRow } from '../../types';
import { formatCalculated, formatIntegerInput, formatUserInput } from '../../utils/formatters';
import { useDataStore } from '../../store/useDataStore';

interface Point {
  x: number;
  y: number;
}

interface FrequencyDistributionChartProps {
  tableRows: TableRow[];
  n: number;
  layerControls: LayerControls;
}

function FrequencyDistributionChartComponent({ tableRows, n, layerControls }: FrequencyDistributionChartProps) {
  const chartSettings = useDataStore((state) => state.chartSettings);
  const datasets: ChartData<'line', Point[]>['datasets'] = [];

  if (layerControls.showFiPolygon) {
    datasets.push({
      label: 'fi - Frekuensi (buah)',
      data: tableRows.map((row) => ({ x: row.xi, y: row.fi })),
      borderColor: chartSettings.empiricColor,
      backgroundColor: `${chartSettings.empiricColor}1A`,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.3,
      fill: false,
    });
  }

  if (layerControls.showFiCumulative) {
    datasets.push({
      label: 'Fi - Frekuensi kumulatif (buah)',
      data: tableRows.map((row) => ({ x: row.xi, y: row.FiAbsolute })),
      borderColor: chartSettings.cumulativeColor,
      backgroundColor: `${chartSettings.cumulativeColor}1A`,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.3,
      fill: false,
      borderDash: [5, 5],
    });
  }

  return (
    <div className="h-full">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Poligon Frekuensi - fi & Fi (buah)</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Distribusi dan akumulasi frekuensi data</p>
      </div>
      <div className="h-[calc(100%-56px)]">
        <Line data={{ datasets }} options={buildOptions(tableRows, n, chartSettings.xAxisLabel, chartSettings.yAxisLabel)} />
      </div>
    </div>
  );
}

function buildOptions(tableRows: TableRow[], n: number, xAxisLabel: string, yAxisLabel: string): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        align: 'center',
        labels: { usePointStyle: true },
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            const row = tableRows[items[0]?.dataIndex ?? 0];
            return `Xi    : ${formatUserInput(row?.xi ?? Number(items[0]?.parsed.x ?? 0))}`;
          },
          label: (item) => {
            const row = tableRows[item.dataIndex];
            if (item.dataset.label?.startsWith('Fi')) return `Fi    : ${formatIntegerInput(row?.FiAbsolute ?? Number(item.parsed.y ?? 0))}`;
            return `fi    : ${formatIntegerInput(row?.fi ?? Number(item.parsed.y ?? 0))}`;
          },
          afterBody: (items) => {
            const row = tableRows[items[0]?.dataIndex ?? 0];
            if (!row) return [];
            return [`fi[%] : ${formatCalculated(row.fiPercent)}%`, `Fi[%] : ${formatCalculated(row.FiPercent)}%`];
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: xAxisLabel },
        grid: { display: true, color: '#e5e7eb80' },
        ticks: { callback: (value) => formatUserInput(Number(value)) },
      },
      y: {
        beginAtZero: true,
        suggestedMax: n + n * 0.1,
        title: { display: true, text: yAxisLabel },
        grid: { display: true, color: '#e5e7eb80' },
        ticks: { callback: (value) => formatIntegerInput(Number(value)) },
      },
    },
  };
}

export const FrequencyDistributionChart = memo(FrequencyDistributionChartComponent);
