import type { ChartType, Plugin } from 'chart.js';

export type ValueLabelFormatter = (value: number, datasetLabel: string, dataIndex: number) => string;

interface ValueLabelsOptions {
  enabled?: boolean;
  formatter?: ValueLabelFormatter;
}

declare module 'chart.js' {
  interface PluginOptionsByType<TType extends ChartType> {
    valueLabels?: ValueLabelsOptions & { readonly chartType?: TType };
  }
}

export const valueLabelPlugin: Plugin<ChartType> = {
  id: 'valueLabels',
  afterDatasetsDraw(chart) {
    const labelOptions = chart.options.plugins?.valueLabels;
    if (labelOptions?.enabled !== true || typeof labelOptions.formatter !== 'function') return;

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

        const label = labelOptions.formatter?.(value, datasetLabel, dataIndex);
        if (!label) return;

        const { x, y } = element.tooltipPosition(true);
        if (x === null || y === null) return;
        ctx.fillText(label, x, y - 6);
      });
    });

    ctx.restore();
  },
};

function getDataValue(raw: unknown): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'object' && raw !== null && 'y' in raw) return Number((raw as { y: unknown }).y);
  return Number.NaN;
}
