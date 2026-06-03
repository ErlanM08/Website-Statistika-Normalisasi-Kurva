import { describe, expect, it } from 'vitest';
import { computeOLSRegression, computePolmanStats, inferDelta, inverseCDFInterpolate } from './statistics';

describe('statistics pipeline', () => {
  it('computes a complete Polman table and keeps theoretical values for cumulative 100 percent row', () => {
    const results = computePolmanStats(
      [
        { xi: 70, fi: 3 },
        { xi: 74, fi: 12 },
        { xi: 78, fi: 18 },
        { xi: 82, fi: 11 },
        { xi: 86, fi: 6 },
      ],
      4,
    );

    expect(results.n).toBe(50);
    expect(results.tableRows).toHaveLength(5);
    expect(results.tableRows[4].FiAbsolute).toBe(50);
    expect(results.tableRows[4].isExcluded).toBe(true);
    expect(results.tableRows[4].fxPrime).toBeGreaterThan(0);
    expect(results.stdTeoritik).toBeGreaterThan(0);
  });

  it('returns infinity for inverse CDF at cumulative percent 100', () => {
    expect(inverseCDFInterpolate(100)).toBe(Number.POSITIVE_INFINITY);
    expect(inverseCDFInterpolate(0)).toBe(Number.NEGATIVE_INFINITY);
  });

  it('uses xi as X and u as Y while excluding infinity in OLS regression', () => {
    const regression = computeOLSRegression([1, 2, 3], [2, 4, Number.POSITIVE_INFINITY]);

    expect(regression.m).toBeCloseTo(2, 8);
    expect(regression.b).toBeCloseTo(0, 8);
  });

  it('matches the Polman sample behavior for final infinite-u row', () => {
    const xi = [6.001, 6.002, 6.003, 6.004, 6.005, 6.006, 6.007, 6.008, 6.009, 6.01];
    const fi = [1, 3, 8, 15, 35, 42, 36, 18, 6, 2];
    const results = computePolmanStats(
      xi.map((value, index) => ({ xi: value, fi: fi[index] })),
      0.001,
    );

    expect(results.regression.m).toBeCloseTo(603.667, 0);
    expect(results.regression.b).toBeCloseTo(-3625.242, 0);
    expect(results.meanTeoritik).toBeCloseTo(6.0055, 3);
    expect(results.stdTeoritik).toBeCloseTo(0.0016, 3);
    expect(results.tableRows[0].fxPrime).toBeCloseTo(1.245, 0);
    expect(results.tableRows[4].fxPrime).toBeGreaterThan(38);
    expect(results.tableRows[4].fxPrime).toBeLessThan(41);
    expect(results.tableRows[9].u).toBe(Number.POSITIVE_INFINITY);
    expect(results.tableRows[9].isExcluded).toBe(true);
    expect(results.tableRows[9].uInterpolasi).toBeCloseTo(2.7959, 3);
    expect(results.tableRows[9].Pu).toBeCloseTo(0.0080, 3);
    expect(results.tableRows[9].Px).toBeCloseTo(4.8336, 2);
    expect(results.tableRows[9].fxPrime).toBeCloseTo(0.8024, 3);
    expect(results.tableRows.reduce((sum, row) => sum + row.fxPrime, 0)).toBeCloseTo(165.6234, 2);
  });

  it('uses delta in fxPrime for a compact symmetric dataset', () => {
    const xi = [5.01, 5.02, 5.03, 5.04, 5.05];
    const fi = [3, 6, 9, 6, 3];
    const results = computePolmanStats(
      xi.map((value, index) => ({ xi: value, fi: fi[index] })),
      0.01,
    );
    const totalFxPrime = results.tableRows.reduce((sum, row) => sum + row.fxPrime, 0);

    expect(results.tableRows[0].fxPrime).toBeCloseTo(4.153, 0);
    expect(results.tableRows[2].fxPrime).toBeCloseTo(8.115, 0);
    expect(results.tableRows[4].isExcluded).toBe(true);
    expect(results.tableRows[4].FiPercent).toBe(100);
    expect(results.tableRows[4].fxPrime).toBeGreaterThan(0);
    expect(totalFxPrime).toBeGreaterThan(25);
    expect(totalFxPrime).toBeLessThan(28);
  });

  it('infers delta automatically when no delta is supplied', () => {
    const results = computePolmanStats(
      [
        { xi: 5.01, fi: 3 },
        { xi: 5.02, fi: 6 },
        { xi: 5.03, fi: 9 },
      ],
    );

    expect(results.delta).toBe(0.01);
  });

  it('returns zero delta when data has fewer than two distinct rows', () => {
    const results = computePolmanStats([{ xi: 5.01, fi: 3 }]);

    expect(results.delta).toBe(0);
  });

  it('rounds inferred delta to avoid floating point noise', () => {
    expect(
      inferDelta(
        [
          { xi: 5.01, fi: 1 },
          { xi: 5.019999999999999, fi: 1 },
        ],
      ),
    ).toBe(0.01);
    expect(
      inferDelta(
        [
          { xi: 6.001, fi: 1 },
          { xi: 6.002, fi: 1 },
        ],
      ),
    ).toBe(0.001);
  });
});
