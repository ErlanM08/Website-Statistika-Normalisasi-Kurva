import type { RawDataPoint, RegressionResult, StatResults } from '../types';
import { inverseNormalCDF, normalPDF } from './normalDistribution';

const CUMULATIVE_EPSILON = 1e-10;

const sortData = (data: RawDataPoint[]): RawDataPoint[] =>
  data.filter((point) => point.fi > 0).sort((a, b) => a.xi - b.xi);

export function computeRelativeFreq(data: RawDataPoint[]): number[] {
  const n = data.reduce((sum, point) => sum + point.fi, 0);
  return n === 0 ? data.map(() => 0) : data.map((point) => (point.fi / n) * 100);
}

export function computeCumulativeFreq(relFreq: number[]): number[] {
  let cumulative = 0;
  return relFreq.map((value) => {
    cumulative += value;
    if (cumulative >= 100 - CUMULATIVE_EPSILON) return 100;
    return Math.min(cumulative, 100);
  });
}

export function inverseCDFInterpolate(probability: number): number {
  if (probability >= 100) return Number.POSITIVE_INFINITY;
  if (probability <= 0) return Number.NEGATIVE_INFINITY;
  return inverseNormalCDF(probability / 100);
}

export function computeOLSRegression(xi: number[], u: number[]): RegressionResult {
  const pairs = xi
    .map((x, index) => ({ x, y: u[index] }))
    .filter((item) => Number.isFinite(item.y));
  if (pairs.length < 2) return { m: 0, b: 0, rSquared: 0 };

  const n = pairs.length;
  const sumX = pairs.reduce((sum, item) => sum + item.x, 0);
  const sumY = pairs.reduce((sum, item) => sum + item.y, 0);
  const sumXY = pairs.reduce((sum, item) => sum + item.x * item.y, 0);
  const sumXX = pairs.reduce((sum, item) => sum + item.x * item.x, 0);
  const denominator = n * sumXX - sumX * sumX;
  const m = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const b = (sumY - m * sumX) / n;
  const meanY = sumY / n;
  const ssTot = pairs.reduce((sum, item) => sum + (item.y - meanY) ** 2, 0);
  const ssRes = pairs.reduce((sum, item) => sum + (item.y - (m * item.x + b)) ** 2, 0);

  return { m, b, rSquared: ssTot === 0 ? 1 : 1 - ssRes / ssTot };
}

export function computeMeanTeoritik(xi: number[], u: number[]): number {
  const regression = computeOLSRegression(xi, u);
  return regression.m === 0 ? computeWeightedAverage(xi, xi.map(() => 1)) : -regression.b / regression.m;
}

export function computeStdTeoritik(meanTeoritik: number, xi: number[], u: number[]): number {
  const regression = computeOLSRegression(xi, u);
  if (regression.m === 0) return 0;
  const xAtMinusOne = (-1 - regression.b) / regression.m;
  return Math.abs(meanTeoritik - xAtMinusOne);
}

export { normalPDF };

export function computePx(Pu: number, sigmaTeoritik: number): number {
  return sigmaTeoritik <= 0 ? 0 : Pu / sigmaTeoritik;
}

export function computeFxPrime(Px: number, delta: number, n: number): number {
  return Px * delta * n;
}

export function computeMeanEmpiris(data: RawDataPoint[]): number {
  const sorted = sortData(data);
  return computeWeightedAverage(sorted.map((point) => point.xi), sorted.map((point) => point.fi));
}

export function computeStdEmpiris(data: RawDataPoint[], mean: number): number {
  const n = data.reduce((sum, point) => sum + point.fi, 0);
  if (n <= 1) return 0;
  const variance = data.reduce((sum, point) => sum + point.fi * (point.xi - mean) ** 2, 0) / (n - 1);
  return Math.sqrt(variance);
}

export function computeModus(data: RawDataPoint[]): number[] {
  const sorted = sortData(data);
  const maxFi = Math.max(...sorted.map((point) => point.fi), 0);
  return sorted.filter((point) => point.fi === maxFi).map((point) => point.xi);
}

export function computeRange(data: RawDataPoint[]): number {
  const sorted = sortData(data);
  if (sorted.length === 0) return 0;
  return sorted[sorted.length - 1].xi - sorted[0].xi;
}

export function computePolmanStats(data: RawDataPoint[], delta = 0): StatResults {
  const sorted = sortData(data);
  const n = sorted.reduce((sum, point) => sum + point.fi, 0);
  const relFreq = computeRelativeFreq(sorted);
  const cumFreq = computeCumulativeFreq(relFreq);
  const cumFi = computeCumulativeAbsoluteFreq(sorted);
  const u = cumFreq.map((value) => inverseCDFInterpolate(value));
  const xi = sorted.map((point) => point.xi);
  const regression = computeOLSRegression(xi, u);
  const meanEmpiris = computeMeanEmpiris(sorted);
  const meanTeoritik = regression.m === 0 ? computeMeanTeoritik(xi, u) : -regression.b / regression.m;
  const stdEmpiris = computeStdEmpiris(sorted, meanEmpiris);
  const stdTeoritik =
    regression.m === 0 ? computeStdTeoritik(meanTeoritik, xi, u) : Math.abs(meanTeoritik - (-1 - regression.b) / regression.m);
  const effectiveDelta = delta > 0 ? delta : inferDelta(sorted);
  const tableRows = sorted.map((point, index) => {
    const isUInfinite = !Number.isFinite(u[index]);
    const uInterpolasi = regression.m * point.xi + regression.b;
    const Pu = normalPDF(uInterpolasi);
    const Px = computePx(Pu, stdTeoritik);
    const fxPrime = computeFxPrime(Px, effectiveDelta, n);

    return {
      no: index + 1,
      xi: point.xi,
      fi: point.fi,
      fiPercent: relFreq[index],
      FiAbsolute: cumFi[index],
      FiPercent: cumFreq[index],
      u: u[index],
      uInterpolasi,
      Pu,
      Px,
      fxPrime,
      isExcluded: isUInfinite,
    };
  });

  return {
    n,
    delta: effectiveDelta,
    meanEmpiris,
    meanTeoritik,
    stdEmpiris,
    stdTeoritik,
    modus: computeModus(sorted),
    range: computeRange(sorted),
    regression,
    tableRows,
  };
}

function computeWeightedAverage(values: number[], weights: number[]): number {
  const totalWeight = weights.reduce((sum, value) => sum + value, 0);
  if (totalWeight === 0 || values.length === 0) return 0;
  return values.reduce((sum, value, index) => sum + value * weights[index], 0) / totalWeight;
}

function computeCumulativeAbsoluteFreq(data: RawDataPoint[]): number[] {
  let cumulative = 0;
  return data.map((point) => {
    cumulative += point.fi;
    return cumulative;
  });
}

export function inferDelta(data: RawDataPoint[]): number {
  const sorted = sortData(data);
  if (sorted.length < 2) return 0;
  const gaps = sorted.slice(1).map((point, index) => Math.abs(point.xi - sorted[index].xi));
  const positiveGaps = gaps.filter((gap) => gap > 0);
  if (positiveGaps.length === 0) return 0;
  return roundDelta(Math.min(...positiveGaps));
}

function roundDelta(minGap: number): number {
  const mag = Math.pow(10, Math.max(0, Math.round(-Math.log10(minGap))));
  return Math.round(minGap * mag) / mag;
}
