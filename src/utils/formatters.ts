export function formatUserInput(value: number): string {
  if (!Number.isFinite(value)) return '--';
  return parseFloat(value.toFixed(10)).toString();
}

export function formatCalculated(value: number): string {
  if (!Number.isFinite(value)) return '--';
  return value.toFixed(4);
}

export function formatIntegerInput(value: number): string {
  if (!Number.isFinite(value)) return '--';
  return Math.round(value).toString();
}
