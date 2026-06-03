import { memo } from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import './chartSetup';
import { useDataStore } from '../../store/useDataStore';
import { formatCalculated, formatIntegerInput, formatUserInput } from '../../utils/formatters';
import { createValueLabelPlugin } from './valueLabelPlugin';

function BarComparisonChartComponent() {
  const results = useDataStore((state) => state.results);
  const chartSettings = useDataStore((state) => state.chartSettings);
  const showValueLabels = useDataStore((state) => state.layerControls.showBarLabels);
  if (!results) return null;
  const labels = results.tableRows.map((row) => formatUserInput(row.xi));

  return (
    <Bar
      data={{
        labels,
        datasets: [
          { label: 'fi empiris', data: results.tableRows.map((row) => row.fi), backgroundColor: `${chartSettings.empiricColor}cc` },
          { label: "f{x'} teoritis", data: results.tableRows.map((row) => row.fxPrime), backgroundColor: `${chartSettings.theoreticalColor}cc` },
        ],
      }}
      options={buildOptions(chartSettings.xAxisLabel, chartSettings.yAxisLabel)}
      plugins={showValueLabels ? [barValueLabelPlugin] : []}
    />
  );
}

const buildOptions = (xAxisLabel: string, yAxisLabel: string): ChartOptions<'bar'> => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    title: { display: true, text: 'Perbandingan fi dan f{x\'}' },
    tooltip: {
      callbacks: {
        title: (items) => `Xi: ${items[0].label}`,
        label: (item) => {
          const value = Number(item.parsed.y ?? 0);
          return item.dataset.label?.includes("f{x'}") ? `f{x'}: ${formatCalculated(value)}` : `fi: ${formatIntegerInput(value)}`;
        },
      },
    },
  },
  scales: { y: { beginAtZero: true, title: { display: true, text: yAxisLabel }, grid: { color: '#e5e7eb80' }, ticks: { callback: (value) => formatIntegerInput(Number(value)) } }, x: { title: { display: true, text: xAxisLabel }, grid: { display: false } } },
});

export const BarComparisonChart = memo(BarComparisonChartComponent);

const barValueLabelPlugin = createValueLabelPlugin<'bar'>((value, datasetLabel) => (datasetLabel.includes("f{x'}") ? formatCalculated(value) : formatIntegerInput(value)));
