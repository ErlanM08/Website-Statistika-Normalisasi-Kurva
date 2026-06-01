import { memo } from 'react';
import { Scatter } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import './chartSetup';
import { useDataStore } from '../../store/useDataStore';
import { formatCalculated, formatUserInput } from '../../utils/formatters';

function RegressionScatterChartComponent() {
  const results = useDataStore((state) => state.results);
  if (!results) return null;
  const points = results.tableRows.filter((row) => !row.isExcluded).map((row) => ({ x: row.xi, y: row.u }));
  const xs = points.map((point) => point.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);

  return (
    <Scatter
      data={{
        datasets: [
          { label: 'xi vs u', data: points, borderColor: '#0056c5', backgroundColor: '#0056c5', pointRadius: 5 },
          {
            label: `Regresi R2=${results.regression.rSquared.toFixed(4)}`,
            data: [minX, maxX].map((x) => ({ x, y: results.regression.m * x + results.regression.b })),
            borderColor: '#00bfa5',
            backgroundColor: '#00bfa5',
            showLine: true,
            pointRadius: 0,
          },
        ],
      }}
      options={options}
    />
  );
}

const options: ChartOptions<'scatter'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    title: { display: true, text: 'Scatter Regresi xi vs u' },
    tooltip: {
      callbacks: {
        title: (items) => `Xi: ${formatUserInput(Number(items[0]?.parsed.x ?? 0))}`,
        label: (item) => `u: ${formatCalculated(Number(item.parsed.y ?? 0))}`,
      },
    },
  },
  scales: {
    x: { type: 'linear', grid: { color: '#e5e7eb80' }, ticks: { callback: (value) => formatUserInput(Number(value)) } },
    y: { grid: { color: '#e5e7eb80' }, ticks: { callback: (value) => formatCalculated(Number(value)) } },
  },
};

export const RegressionScatterChart = memo(RegressionScatterChartComponent);
