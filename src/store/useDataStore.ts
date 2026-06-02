import { create } from 'zustand';
import type { ChartSettings, LayerControls, RawDataPoint, SessionData, StatResults, ViewMode } from '../types';
import { computePolmanStats, inferDelta } from '../utils/statistics';

export interface DataStore {
  rawData: RawDataPoint[];
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
  setSessionName: (name: string) => void;
  addDataPoint: (point: RawDataPoint) => void;
  addManyDataPoints: (points: RawDataPoint[]) => void;
  replaceDataPoints: (points: RawDataPoint[]) => void;
  updateDataPoint: (index: number, point: RawDataPoint) => void;
  removeDataPoint: (index: number) => void;
  clearData: () => void;
  clearResults: () => void;
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
const initialRawData: RawDataPoint[] = [];

export const useDataStore = create<DataStore>((set, get) => ({
  rawData: initialRawData,
  delta: inferDelta(initialRawData),
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

  setSessionName: (name) => set({ sessionName: name }),
  addDataPoint: (point) => {
    if (point.fi <= 0) return;
    set((state) => {
      const rawData = mergePoints([...state.rawData, point]);
      return {
        rawData,
        delta: inferDelta(rawData),
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
        delta: inferDelta(rawData),
        results: null,
      };
    });
  },
  replaceDataPoints: (points) => {
    const rawData = mergePoints(points.filter((point) => point.fi > 0));
    set({
      rawData,
      delta: inferDelta(rawData),
      results: null,
    });
  },
  updateDataPoint: (index, point) =>
    set((state) => {
      const rawData = mergePoints(state.rawData.map((item, itemIndex) => (itemIndex === index ? point : item)));
      return {
        rawData,
        delta: inferDelta(rawData),
        results: null,
      };
    }),
  removeDataPoint: (index) =>
    set((state) => {
      const rawData = state.rawData.filter((_, itemIndex) => itemIndex !== index);
      return {
        rawData,
        delta: inferDelta(rawData),
        results: null,
      };
    }),
  clearData: () =>
    set({
      rawData: [],
      delta: inferDelta([]),
      results: null,
    }),
  clearResults: () => set({ results: null }),
  analyze: () => {
    const state = get();
    const { rawData } = state;
    if (rawData.length === 0) return;
    set({ isAnalyzing: true });
    const results = computePolmanStats(rawData, 0);
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
      rawData: session.rawData,
      delta: session.results?.delta ?? inferDelta(session.rawData),
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
      rawData: state.rawData,
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
    const key = `xi:${point.xi}`;
    const current = map.get(key);
    map.set(key, current ? { ...current, fi: current.fi + point.fi } : point);
  });
  return Array.from(map.values())
    .sort((a, b) => a.xi - b.xi);
}
