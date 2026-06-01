const SQRT_TWO_PI = Math.sqrt(2 * Math.PI);

export function normalPDF(u: number): number {
  if (!Number.isFinite(u)) return 0;
  return Math.exp(-(u * u) / 2) / SQRT_TWO_PI;
}

export function normalCDF(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const erf = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x));

  return 0.5 * (1 + sign * erf);
}

export function inverseNormalCDF(probability: number): number {
  if (probability <= 0) return Number.NEGATIVE_INFINITY;
  if (probability >= 1) return Number.POSITIVE_INFINITY;

  let low = -6;
  let high = 6;
  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2;
    if (normalCDF(mid) < probability) low = mid;
    else high = mid;
  }

  return (low + high) / 2;
}

export function cumulativeNormalFromDataPoint(
  x: number,
  mean: number,
  sigma: number,
): number {
  if (sigma <= 0 || !Number.isFinite(sigma)) return 0;
  return normalCDF((x - mean) / sigma) * 100;
}
