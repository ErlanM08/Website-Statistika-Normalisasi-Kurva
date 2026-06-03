import type { ChartType, Plugin } from 'chart.js';

type LabelFormatter = (value: number, datasetLabel: string, dataIndex: number) => string;

export function createValueLabelPlugin<TType extends ChartType>(formatter: LabelFormatter): Plugin<TType> {
  return {
    id: 'value-label-plugin',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;

      ctx.save();
      ctx.font = '600 11px Inter, ui-sans-serif, system-ui, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      chart.data.datasets.forEach((dataset, datasetIndex) => {
        if (!chart.isDatasetVisible(datasetIndex)) return;
        const meta = chart.getDatasetMeta(datasetIndex);
        const datasetLabel = String(dataset.label ?? '');

        meta.data.forEach((element, dataIndex) => {
          const value = getDataValue(dataset.data[dataIndex]);
          if (!Number.isFinite(value)) return;

          const label = formatter(value, datasetLabel, dataIndex);
          if (!label) return;

          const { x, y } = element.tooltipPosition(true);
          if (x === null || y === null) return;
          ctx.fillText(label, x, y - 6);
        });
      });

      ctx.restore();
    },
  };
}

function getDataValue(raw: unknown): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'object' && raw !== null && 'y' in raw) return Number((raw as { y: unknown }).y);
  return Number.NaN;
}
