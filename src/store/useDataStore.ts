import { create } from 'zustand';
import type { ChartSettings, DataType, GroupedInterval, LayerControls, RawDataPoint, SessionData, StatResults, ViewMode } from '../types';
import { computePolmanStats, inferDelta } from '../utils/statistics';

export interface DataStore {
  dataType: DataType;
  rawData: RawDataPoint[];
  groupedData: GroupedInterval[];
  delta: number;
  results: StatResults | null;
  sessionName: string;
  viewMode: ViewMode;
  isTableVisible: boolean;
  isFormulaVisible: boolean;
  isGuideVisible: boolean;
  isTourActive: boolean;
  tourStepIndex: number;
  layerControls: LayerControls;
  chartSettings: ChartSettings;
  isDarkMode: boolean;
  isAnalyzing: boolean;
  setDataType: (type: DataType) => void;
  setSessionName: (name: string) => void;
  addDataPoint: (point: RawDataPoint) => void;
  addManyDataPoints: (points: RawDataPoint[]) => void;
  updateDataPoint: (index: number, point: RawDataPoint) => void;
  removeDataPoint: (index: number) => void;
  clearData: () => void;
  analyze: () => void;
  setViewMode: (mode: ViewMode) => void;
  toggleTable: () => void;
  toggleFormula: () => void;
  openGuide: () => void;
  closeGuide: () => void;
  startTour: (stepIndex?: number) => void;
  stopTour: () => void;
  nextTourStep: () => void;
  previousTourStep: () => void;
  setTourStep: (stepIndex: number) => void;
  toggleLayer: (key: keyof LayerControls) => void;
  setChartSetting: <K extends keyof ChartSettings>(key: K, value: ChartSettings[K]) => void;
  resetChartSettings: () => void;
  toggleDarkMode: () => void;
  loadSession: (session: SessionData) => void;
  exportSession: () => SessionData;
}

const defaultLayers: LayerControls = {
  showFiPolygon: true,
  showFiCumulative: true,
  showEmpiricPolygon: true,
  showTheoreticalCurve: true,
  showCumulativePolygon: true,
  showMeanTeoritikLine: true,
  showMeanEmpirisLine: true,
  showShading: false,
  showBarLabels: false,
};

const defaultChartSettings: ChartSettings = {
  empiricColor: '#0056c5',
  theoreticalColor: '#00bfa5',
  cumulativeColor: '#0056c5',
  meanTeoritikColor: '#006b5c',
  meanEmpirisColor: '#b81d27',
  xAxisLabel: 'Xi (Nilai Dimensi)',
  yAxisLabel: 'Frekuensi (buah)',
};

const initialDark = typeof localStorage !== 'undefined' && localStorage.getItem('normalcurve-theme') === 'dark';
const initialRawData: RawDataPoint[] = [
  { xi: 70, fi: 3 },
  { xi: 74, fi: 12 },
  { xi: 78, fi: 18 },
  { xi: 82, fi: 11 },
  { xi: 86, fi: 6 },
];

export const useDataStore = create<DataStore>((set, get) => ({
  dataType: 'single',
  rawData: initialRawData,
  groupedData: [],
  delta: inferDelta(initialRawData, 'single'),
  results: null,
  sessionName: 'Sesi Normalisasi Kurva',
  viewMode: 'standard',
  isTableVisible: false,
  isFormulaVisible: false,
  isGuideVisible: false,
  isTourActive: false,
  tourStepIndex: 0,
  layerControls: defaultLayers,
  chartSettings: defaultChartSettings,
  isDarkMode: initialDark,
  isAnalyzing: false,

  setDataType: (type) =>
    set((state) => ({
      dataType: type,
      delta: inferDelta(state.rawData, type),
      results: null,
    })),
  setSessionName: (name) => set({ sessionName: name }),
  addDataPoint: (point) => {
    if (point.fi <= 0) return;
    set((state) => {
      const rawData = mergePoints([...state.rawData, point]);
      return {
        rawData,
        delta: inferDelta(rawData, state.dataType),
        results: null,
      };
    });
  },
  addManyDataPoints: (points) => {
    const validPoints = points.filter((point) => point.fi > 0);
    set((state) => {
      const rawData = mergePoints([...state.rawData, ...validPoints]);
      return {
        rawData,
        delta: inferDelta(rawData, state.dataType),
        results: null,
      };
    });
  },
  updateDataPoint: (index, point) =>
    set((state) => {
      const rawData = mergePoints(state.rawData.map((item, itemIndex) => (itemIndex === index ? point : item)));
      return {
        rawData,
        delta: inferDelta(rawData, state.dataType),
        results: null,
      };
    }),
  removeDataPoint: (index) =>
    set((state) => {
      const rawData = state.rawData.filter((_, itemIndex) => itemIndex !== index);
      return {
        rawData,
        delta: inferDelta(rawData, state.dataType),
        results: null,
      };
    }),
  clearData: () =>
    set((state) => ({
      rawData: [],
      groupedData: [],
      delta: inferDelta([], state.dataType),
      results: null,
    })),
  analyze: () => {
    const state = get();
    const { rawData, dataType } = state;
    if (rawData.length === 0) return;
    set({ isAnalyzing: true });
    console.log('Delta dikirim ke computePolmanStats:', state.delta);
    const results = computePolmanStats(rawData, dataType, 0);
    set({ results, delta: results.delta, isAnalyzing: false });
  },
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleTable: () => set((state) => ({ isTableVisible: !state.isTableVisible })),
  toggleFormula: () => set((state) => ({ isFormulaVisible: !state.isFormulaVisible })),
  openGuide: () => set({ isTourActive: true, tourStepIndex: 0, isGuideVisible: false }),
  closeGuide: () => set({ isGuideVisible: false }),
  startTour: (stepIndex = 0) => set({ isTourActive: true, tourStepIndex: stepIndex, isGuideVisible: false }),
  stopTour: () => set({ isTourActive: false }),
  nextTourStep: () => set((state) => ({ tourStepIndex: state.tourStepIndex + 1 })),
  previousTourStep: () => set((state) => ({ tourStepIndex: Math.max(0, state.tourStepIndex - 1) })),
  setTourStep: (stepIndex) => set({ tourStepIndex: stepIndex }),
  toggleLayer: (key) => set((state) => ({ layerControls: { ...state.layerControls, [key]: !state.layerControls[key] } })),
  setChartSetting: (key, value) => set((state) => ({ chartSettings: { ...state.chartSettings, [key]: value } })),
  resetChartSettings: () => set({ chartSettings: defaultChartSettings }),
  toggleDarkMode: () => {
    const next = !get().isDarkMode;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('normalcurve-theme', next ? 'dark' : 'light');
    set({ isDarkMode: next });
  },
  loadSession: (session) =>
    set({
      dataType: session.dataType,
      rawData: session.rawData,
      groupedData: session.groupedData,
      delta: session.results?.delta ?? inferDelta(session.rawData, session.dataType),
      results: session.results,
      sessionName: session.sessionName,
      chartSettings: session.chartSettings ?? defaultChartSettings,
    }),
  exportSession: () => {
    const state = get();
    const now = new Date().toISOString();
    return {
      version: '2.0.0',
      sessionName: state.sessionName,
      dataType: state.dataType,
      rawData: state.rawData,
      groupedData: state.groupedData,
      delta: state.delta,
      results: state.results,
      chartSettings: state.chartSettings,
      createdAt: now,
      updatedAt: now,
    };
  },
}));

function mergePoints(points: RawDataPoint[]): RawDataPoint[] {
  const map = new Map<string, RawDataPoint>();
  points.forEach((point) => {
    const key = point.classStart !== undefined && point.classEnd !== undefined ? `${point.classStart}:${point.classEnd}` : `xi:${point.xi}`;
    const current = map.get(key);
    map.set(key, current ? { ...current, fi: current.fi + point.fi } : point);
  });
  return Array.from(map.values())
    .sort((a, b) => a.xi - b.xi);
}
