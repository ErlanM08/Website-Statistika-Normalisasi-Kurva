export type ViewMode = 'compact' | 'standard' | 'full';

export interface RawDataPoint {
  xi: number;
  fi: number;
}

export interface TableRow {
  no: number;
  xi: number;
  fi: number;
  fiPercent: number;
  FiAbsolute: number;
  FiPercent: number;
  u: number;
  uInterpolasi: number;
  Pu: number;
  Px: number;
  fxPrime: number;
  isExcluded: boolean;
}

export interface RegressionResult {
  m: number;
  b: number;
  rSquared: number;
}

export interface StatResults {
  n: number;
  delta: number;
  meanEmpiris: number;
  meanTeoritik: number;
  stdEmpiris: number;
  stdTeoritik: number;
  modus: number[];
  range: number;
  regression: RegressionResult;
  tableRows: TableRow[];
}

export interface SessionData {
  version: '2.0.0';
  sessionName: string;
  rawData: RawDataPoint[];
  delta: number;
  results: StatResults | null;
  chartSettings?: ChartSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ChartSettings {
  empiricColor: string;
  theoreticalColor: string;
  cumulativeColor: string;
  meanTeoritikColor: string;
  meanEmpirisColor: string;
  xAxisLabel: string;
  yAxisLabel: string;
}

export interface LayerControls {
  showFiPolygon: boolean;
  showFiCumulative: boolean;
  showEmpiricPolygon: boolean;
  showTheoreticalCurve: boolean;
  showCumulativePolygon: boolean;
  showMeanTeoritikLine: boolean;
  showMeanEmpirisLine: boolean;
  showShading: boolean;
  showBarLabels: boolean;
}
