# PRD — Normalisasi Kurva Calculator
**Version:** 2.0.0 | **Stack:** React 18 + Vite 5 + TypeScript + Tailwind CSS v3 | **Deploy:** Vercel

---

## 1. Overview
**Product Name:** Normalisasi Kurva Calculator  
**Target Users:** Mahasiswa, Pelajar, dan Pengajar Statistika (khususnya Teknik & Manufaktur)  
**Goal:** Menghitung dan memvisualisasikan normalisasi kurva menggunakan metode Empirical Distribution Fitting (Metode Polman Bandung) — membangun kurva distribusi normal teoritis dari data empiris dan membandingkannya secara langsung. Mendukung Data Tunggal dan Data Kelompok.

---

## 2. Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend Framework | React 18 + Vite 5 + TypeScript (strict mode) |
| Styling | Tailwind CSS v3 + clsx + tailwind-merge |
| Charting | Chart.js 4 + react-chartjs-2 |
| State Management | Zustand |
| Voice Input | Web Speech API (native browser) |
| CSV Parsing | PapaParse |
| PDF Export | jsPDF + html2canvas |
| Excel Export | SheetJS (xlsx) |
| Session Persistence | JSON download/upload (client-side) |
| Routing | React Router v6 (hash routing) |
| Deployment | Vercel (auto-deploy from main branch) |

---

## 3. Metode Kalkulasi: Empirical Distribution Fitting (Polman Bandung)

Metode ini membangun kurva distribusi normal teoritis dari data empiris melalui 8 tahap berurutan.
Semua implementasi ada di `src/utils/statistics.ts` dan `src/utils/normalDistribution.ts`.

### Pipeline Kalkulasi (8 Tahap)

| Tahap | Nama Kolom | Rumus |
|---|---|---|
| 1 | fi[%] — Frekuensi Relatif | `(fi / n) × 100%` |
| 2 | Fi[%] — Frekuensi Kumulatif Relatif | `Σ fi[%]` dari baris 1 s/d i |
| 3 | u — Invers CDF | Interpolasi linear dari tabel CDF normal standar |
| 4 | u Interpolasi — Regresi OLS | `u_int = m·xi + b` (xi=X, u tabel=Y) |
| 5 | x̄ Teoritik | Interpolasi x saat u=0 dari pasangan (xi, u) |
| 6 | σ Teoritik | `σ = x̄_teoritik - x_(u=-1)` |
| 7a | P{u'} — PDF Normal Standar | `(1/√2π) · e^(-u_int²/2)` |
| 7b | P{x'} — PDF Skala Data Asli | `P{u'} / σ_teoritik` |
| 8 | f{x'} — Frekuensi Teoritis Normal | `P{x'} · Δ · n` |

### Aturan Kasus Khusus
- Fi[%] = 100% → u = ∞, kolom P{u'}/P{x'}/f{x'} = 0, baris dikecualikan dari regresi
- Δ (delta) = jarak seragam antar xi (data tunggal) atau lebar kelas (data kelompok)
- u Interpolasi (kolom E) yang dipakai untuk P{u'}, P{x'}, f{x'} — bukan u tabel langsung
- σ di P{x'} adalah σ TEORITIK

---

## 4. Core Features

### 4.1 Data Input (4 Metode)
- **Manual satu per satu** — input field + tombol "Tambah"
- **Input + frekuensi** — dua kolom: Nilai xi & Frekuensi fi
- **Voice input** — Web Speech API, transkripsi real-time, support "dua puluh tiga" → 23
- **Bulk input** — textarea `56,76,45,33` atau upload file CSV

**Toggle tipe data:** "Data Tunggal" | "Data Kelompok (Interval)"
**Input delta (Δ):** field wajib diisi, default otomatis dihitung dari data jika seragam

### 4.2 KPI Cards (Selalu Tampil — Tidak Bisa Di-hide)
8 cards:
- n (jumlah data total), Δ (delta/resolusi)
- x̄ Empiris, x̄ Teoritik
- σ Empiris, σ Teoritik
- Range, Modus

### 4.3 Tabel Detail (Collapsible — Default: Hidden)
10 kolom sesuai metode Polman Bandung:
No. | Xi | fi | fi[%] | Fi | Fi[%] | u | u Interp. | P{u'} | P{x'} | f{x'}
interface TableRow {
  no: number;
  xi: number;
  fi: number;
  fiPercent: number;      // fi[%]
  FiAbsolute: number;     // Fi (kumulatif buah) ← TAMBAH INI
  FiPercent: number;      // Fi[%]
  u: number;
  uInterpolasi: number;
  Pu: number;
  Px: number;
  fxPrime: number;
  isExcluded: boolean;
}
Tooltip penjelasan singkat di setiap header kolom.

### 4.4 Visualisasi Grafik

**Mode Tampilan:** 🎯 Ringkas | 📊 Standar (default) | 🔬 Lengkap

**Layer Control Panel (checkbox, floating di pojok grafik):**
- ☑ Poligon Frekuensi Empiris f{x}
- ☑ Kurva Frekuensi Teoritis f{x'} ← OUTPUT UTAMA
- ☑ Garis x̄ Teoritik & x̄ Empiris
- ☐ Area Shading ±1σ / ±2σ / ±3σ (default off)
- ☐ Label Nilai (default off)
- ☑ Poligon Frekuensi Kumulatif

**4 Grafik:**
1. Poligon Frekuensi — fi (empiris) vs f{x'} (teoritis) overlay ← UTAMA
2. Poligon Frekuensi Kumulatif — Fi[%] vs kumulatif teoritis
3. Bar Chart — perbandingan fi dan f{x'} per kelas
4. Scatter Plot — xi vs u + garis regresi (indikator normalitas)

**Interaksi:** Hover tooltip: xi, fi, u, u_int, f{x'}, posisi relatif x̄

### 4.5 Panel Rumus & Keterangan (Collapsible — Default: Hidden)
- 8 rumus pipeline berurutan dengan penjelasan
- Highlight nilai aktual dalam rumus setelah analyze
- Step-by-step calculation trace per kolom

### 4.6 Session Management (JSON)
- **Save Session (.json)** — simpan state + hasil kalkulasi
- **Load Session (.json)** — restore semua state dari file sebelumnya

### 4.7 Export
- **CSV** — tabel 10 kolom
- **Excel (.xlsx)** — tabel dengan formatting
- **PNG** — tiap grafik individual
- **PDF** — laporan lengkap: KPI + tabel + 4 grafik + rumus

---

## 5. UI Architecture

Responsive: Mobile = vertikal stack. Tabel & rumus auto-collapse di < 768px.

---

## 6. Design System — Teal Precision
- Primary: Teal `#00bfa5`, Secondary: Blue `#0056c5`, Error: Red `#b81d27`
- Font: Inter, Surface: `#f8f9fb`, Card: `#ffffff`
- Shadow: `0px 4px 20px rgba(0,0,0,0.05)`, Radius: 12px komponen / 16px card
- Dark mode: class-based, disimpan di localStorage

---

## 7. Validation Rules
- Non-numerik → inline error merah
- n < 3 → warning "Minimal 3 data untuk analisis valid"
- fi = 0 → baris dilewati + info toast
- Fi[%] = 100% → u = ∞, dikecualikan dari regresi otomatis
- Delta = 0 → error "Delta tidak boleh 0"
- Voice tidak support → sembunyikan mic, tampilkan notice

---

## 8. Performance Targets
- LCP < 2.0s, INP < 150ms, CLS < 0.05
- Chart.js lazy-loaded, debounce 300ms textarea

---

## 9. File Structure
---

## 10. Session JSON Schema v2
```json
{
  "version": "2.0.0",
  "sessionName": "Dimensi Produk Juli 2026",
  "dataType": "single",
  "rawData": [{ "xi": 6.001, "fi": 1 }],
  "groupedData": [],
  "delta": 0.001,
  "results": {
    "meanEmpiris": 6.0055,
    "meanTeoritik": 6.0055,
    "stdEmpiris": 0.0018,
    "stdTeoritik": 0.0016,
    "regressionM": 603.667,
    "regressionB": -3625.242,
    "tableRows": []
  },
  "createdAt": "2026-06-01T11:00:00+07:00",
  "updatedAt": "2026-06-01T11:30:00+07:00"
}
```

---

## 11. Out of Scope (v2.0)
- Backend / database / auth
- Uji Normalitas formal (Shapiro-Wilk) — v3.0
- Perbandingan 2 dataset — v3.0