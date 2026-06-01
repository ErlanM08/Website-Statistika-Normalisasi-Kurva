# Agent.md — Normalisasi Kurva Calculator v2.0

## Project Context
React 18 + Vite 5 + TypeScript strict + Tailwind CSS v3. Fully client-side, no backend.
Deploy ke Vercel. Metode: Empirical Distribution Fitting (Polman Bandung) — 8 tahap pipeline.
Lihat PRD.md untuk spesifikasi fitur dan DESIGN.md untuk sistem desain.

## Core Principles
- TypeScript strict — tidak ada `any` kecuali dipaksa library
- Kalkulasi HANYA di `utils/statistics.ts` dan `utils/normalDistribution.ts`
- Komponen UI tidak boleh mengandung logika hitung
- Zustand `useDataStore` = single source of truth
- Tailwind only — tidak ada inline style atau CSS modules
- Chart.js lazy-loaded via dynamic import
- Max 150 baris per file komponen

---

## Directory Structure


---

## Key Types (types/index.ts)
```typescript
type DataType = 'single' | 'grouped';

interface RawDataPoint { xi: number; fi: number; }

interface GroupedInterval {
  classStart: number; classEnd: number; midpoint: number; frequency: number;
}

interface TableRow {
  no: number; xi: number; fi: number;
  fiPercent: number;     // (fi/n)*100
  FiPercent: number;     // kumulatif fi[%]
  u: number;             // invers CDF interpolasi tabel
  uInterpolasi: number;  // OLS: m*xi + b
  Pu: number;            // (1/√2π)*e^(-u_int²/2)
  Px: number;            // Pu / sigmaTeoritik
  fxPrime: number;       // Px * delta * n
  isExcluded: boolean;   // true jika Fi[%]=100% (u=∞)
}

interface RegressionResult { m: number; b: number; rSquared: number; }

interface StatResults {
  n: number; delta: number;
  meanEmpiris: number; meanTeoritik: number;
  stdEmpiris: number; stdTeoritik: number;
  modus: number[]; range: number;
  regression: RegressionResult;
  tableRows: TableRow[];
}

interface SessionData {
  version: '2.0.0'; sessionName: string; dataType: DataType;
  rawData: RawDataPoint[]; groupedData: GroupedInterval[];
  delta: number; results: StatResults | null;
  createdAt: string; updatedAt: string;
}
```

---

## Statistics Utils Contract (utils/statistics.ts)
Semua fungsi HARUS pure — tidak ada side effects.
```typescript
export function computePolmanStats(data: RawDataPoint[], type: DataType, delta: number): StatResults
export function computeRelativeFreq(data: RawDataPoint[]): number[]
export function computeCumulativeFreq(relFreq: number[]): number[]
export function inverseCDFInterpolate(probability: number): number  // Infinity jika p >= 1.0
export function computeOLSRegression(xi: number[], u: number[]): RegressionResult  // exclude Infinity
export function computeMeanTeoritik(xi: number[], u: number[]): number  // interpolasi x saat u=0
export function computeStdTeoritik(meanTeoritik: number, xi: number[], u: number[]): number
export function normalPDF(u: number): number  // (1/√2π)*e^(-u²/2)
export function computePx(Pu: number, sigmaTeoritik: number): number
export function computeFxPrime(Px: number, delta: number, n: number): number
export function computeMeanEmpiris(data: RawDataPoint[]): number
export function computeStdEmpiris(data: RawDataPoint[], mean: number): number
export function computeModus(data: RawDataPoint[]): number[]
export function computeRange(data: RawDataPoint[]): number
```

---

## Zustand Store Shape (store/useDataStore.ts)
```typescript
interface LayerControls {
  showEmpiricPolygon: boolean;    // default: true
  showTheoreticalCurve: boolean;  // default: true
  showCumulativePolygon: boolean; // default: true
  showMeanTeoritikLine: boolean;  // default: true
  showMeanEmpirisLine: boolean;   // default: true
  showShading: boolean;           // default: false
  showBarLabels: boolean;         // default: false
}

interface DataStore {
  dataType: DataType; rawData: RawDataPoint[];
  groupedData: GroupedInterval[]; delta: number;
  results: StatResults | null; sessionName: string;
  viewMode: 'compact' | 'standard' | 'full';
  isTableVisible: boolean; isFormulaVisible: boolean;
  layerControls: LayerControls; isDarkMode: boolean; isAnalyzing: boolean;

  setDataType: (type: DataType) => void;
  setDelta: (delta: number) => void;
  addDataPoint: (point: RawDataPoint) => void;
  removeDataPoint: (index: number) => void;
  clearData: () => void;
  analyze: () => void;
  setViewMode: (mode: 'compact' | 'standard' | 'full') => void;
  toggleTable: () => void; toggleFormula: () => void;
  toggleLayer: (key: keyof LayerControls) => void;
  toggleDarkMode: () => void;
  loadSession: (session: SessionData) => void;
  exportSession: () => SessionData;
}
```

---

## KPI Cards Rules
8 cards — SELALU TAMPIL, tidak bisa di-hide:
`n` | `Δ` | `x̄ Empiris` | `x̄ Teoritik` | `σ Empiris` | `σ Teoritik` | `Range` | `Modus`
Tampilkan "--" sebelum analyze. Format: `toFixed(4)`.

## ChartPanel Rules
4 komponen terpisah, semua gunakan `React.memo`:
- `FrequencyPolygonChart` — fi vs f{x'} overlay ← GRAFIK UTAMA
- `CumulativePolygonChart` — Fi[%] empiris vs teoritis
- `BarComparisonChart` — bar chart fi vs f{x'}
- `RegressionScatterChart` — xi vs u + garis regresi

LayerControlPanel: `absolute top-3 right-3 z-50`.
Tooltip wajib: xi, fi, u, u_int, f{x'}.

## TableDetail Rules
Kolom: No | xi | fi | fi[%] | Fi[%] | u | u Interp. | P{u'} | P{x'} | f{x'}
- isExcluded=true: "∞" di kolom u, "0" di kolom P/f
- Tooltip di header, format `toFixed(4)`, default hidden

## FormulaPanel Rules
8 rumus pipeline berurutan. Highlight nilai aktual dengan span teal setelah analyze.
Default hidden.

## Session Manager (utils/sessionManager.ts)
```typescript
export function downloadSession(store: DataStore, name?: string): void
export function parseSessionFile(file: File): Promise<SessionData>
export function validateSession(data: unknown): data is SessionData
// validateSession: cek version==='2.0.0', rawData array. Return false jika invalid.
```

## Voice Input Rules
- Cek `window.SpeechRecognition || window.webkitSpeechRecognition`
- Tidak support → sembunyikan mic, tampilkan notice
- `lang = 'id-ID'`, mapping kata angka Indonesia → angka
- Transkripsi real-time sebelum konfirmasi

## Export Implementation
- CSV: Blob + createObjectURL, 10 kolom
- Excel: SheetJS, header bold, auto-width
- PNG: `chart.toBase64Image()` via ref
- PDF: jsPDF landscape A4 — header → KPI → tabel → 4 grafik → rumus

## Validation Rules
- Non-numerik: inline error merah, block submit
- n < 3: warning banner
- fi = 0: skip + toast
- Fi[%] = 100%: u=∞, exclude regresi, f{x'}=0
- Delta = 0: error di field

## Tailwind Dark Mode
`darkMode: 'class'` di tailwind.config.ts. Init di `main.tsx` baca localStorage.

## Vercel Deployment
`vercel.json`: `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }`
Build: `vite build`, output: `dist`, tidak ada env vars.

## Coding Standards
- Functional + hooks only, tidak ada class components
- PascalCase komponen, camelCase functions, UPPER_SNAKE constants
- `React.memo` semua chart, `toFixed(4)` semua angka, `?.` untuk null safety