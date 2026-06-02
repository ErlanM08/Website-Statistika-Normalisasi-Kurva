import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';

interface TourStep {
  targetId: string;
  title: string;
  body: string;
}

interface AnchorBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

const tourSteps: TourStep[] = [
  {
    targetId: 'project-name',
    title: 'Nama Project',
    body: 'Mulai dari sini. Isi nama perhitungan agar hasil export CSV, Excel, PNG, PDF, dan session punya identitas yang jelas.',
  },
  {
    targetId: 'manual-input',
    title: 'Entri Manual',
    body: 'Masukkan pasangan Xi dan fi, lalu tekan Tambah untuk memasukkan data ke daftar.',
  },
  {
    targetId: 'bulk-input',
    title: 'Input Masal dan Upload',
    body: 'Tempel banyak data sekaligus, upload CSV/Excel, atau download template Excel dengan header Xi dan fi.',
  },
  {
    targetId: 'voice-input',
    title: 'Logika Suara',
    body: 'Jika browser mendukung, rekam angka dalam bahasa Indonesia. Setelah transkripsi sesuai, tekan Pakai.',
  },
  {
    targetId: 'data-input-list',
    title: 'Cek dan Edit Data',
    body: 'Semua data yang masuk tampil di sini. Kamu bisa mengubah Xi atau fi langsung, lalu tekan Enter atau klik keluar untuk menyimpan.',
  },
  {
    targetId: 'analyze',
    title: 'Jalankan Normalisasi',
    body: 'Setelah data tersedia, klik tombol ini untuk menghitung KPI, tabel detail, delta otomatis, dan semua grafik.',
  },
  {
    targetId: 'kpi',
    title: 'Ringkasan KPI',
    body: 'Bagian ini menampilkan n, Delta, rata-rata, simpangan baku, range, dan modus sebagai ringkasan hasil analisis.',
  },
  {
    targetId: 'charts',
    title: 'Area Grafik',
    body: 'Grafik utama membandingkan frekuensi empiris dengan kurva teoritis. Mode Standar dan Lengkap menampilkan grafik tambahan.',
  },
  {
    targetId: 'table-detail',
    title: 'Tabel Hasil Perhitungan',
    body: 'Bagian ini berisi tombol Lihat Tabel Detail. Gunakan untuk membuka 11 kolom pada Tabel Hasil Perhitungan.',
  },
  {
    targetId: 'formula-toggle',
    title: 'Panel Rumus',
    body: 'Klik ikon panel untuk melihat urutan rumus dan nilai aktual yang dipakai dalam pipeline normalisasi.',
  },
  {
    targetId: 'export-actions',
    title: 'Simpan dan Export',
    body: 'Gunakan tombol ini untuk menyimpan session, export tabel ke CSV/Excel, export grafik ke PNG, atau membuat laporan PDF.',
  },
];

export function TourOverlay() {
  const isTourActive = useDataStore((state) => state.isTourActive);
  const tourStepIndex = useDataStore((state) => state.tourStepIndex);
  const stopTour = useDataStore((state) => state.stopTour);
  const nextTourStep = useDataStore((state) => state.nextTourStep);
  const previousTourStep = useDataStore((state) => state.previousTourStep);
  const setTourStep = useDataStore((state) => state.setTourStep);
  const [anchor, setAnchor] = useState<AnchorBox | null>(null);
  const step = tourSteps[Math.min(tourStepIndex, tourSteps.length - 1)];
  const stepNumber = Math.min(tourStepIndex + 1, tourSteps.length);

  useEffect(() => {
    if (!isTourActive) return undefined;
    if (tourStepIndex >= tourSteps.length) {
      stopTour();
      return undefined;
    }

    const updateAnchor = () => {
      const target = document.querySelector<HTMLElement>(`[data-tour-id="${step.targetId}"]`);
      if (!target) {
        setAnchor(null);
        return;
      }

      target.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
      window.setTimeout(() => {
        const rect = target.getBoundingClientRect();
        setAnchor({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }, 180);
    };

    updateAnchor();
    window.addEventListener('resize', updateAnchor);
    window.addEventListener('scroll', updateAnchor, true);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') stopTour();
      if (event.key === 'ArrowRight') (tourStepIndex === tourSteps.length - 1 ? stopTour : nextTourStep)();
      if (event.key === 'ArrowLeft') previousTourStep();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('resize', updateAnchor);
      window.removeEventListener('scroll', updateAnchor, true);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isTourActive, nextTourStep, previousTourStep, setTourStep, step.targetId, stopTour, tourStepIndex]);

  const popupStyle = useMemo(() => getPopupStyle(anchor), [anchor]);
  const highlightStyle = anchor
    ? {
        top: Math.max(anchor.top - 8, 8),
        left: Math.max(anchor.left - 8, 8),
        width: anchor.width + 16,
        height: anchor.height + 16,
      }
    : null;

  if (!isTourActive) return null;

  return (
    <div className="fixed inset-0 z-[120] pointer-events-none">
      <div className="absolute inset-0 bg-slate-950/45" />
      {highlightStyle ? (
        <div className="absolute rounded-2xl border-2 border-teal-300 bg-teal-300/10 shadow-[0_0_0_9999px_rgba(15,23,42,0.42)] transition-all" style={highlightStyle} />
      ) : null}

      <section
        className="pointer-events-auto absolute w-[min(360px,calc(100vw-32px))] rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900"
        style={popupStyle}
        role="dialog"
        aria-live="polite"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-100">
              Tour {stepNumber}/{tourSteps.length}
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{step.title}</h2>
          </div>
          <button className="grid size-9 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800" onClick={stopTour} title="Tutup tour">
            <X className="size-5" />
          </button>
        </div>

        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{step.body}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={previousTourStep}
            disabled={tourStepIndex === 0}
          >
            <ChevronLeft className="size-4" /> Sebelumnya
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-bold text-teal-950 hover:bg-teal-100"
            onClick={tourStepIndex === tourSteps.length - 1 ? stopTour : nextTourStep}
          >
            {tourStepIndex === tourSteps.length - 1 ? 'Selesai' : 'Lanjut'}
            {tourStepIndex === tourSteps.length - 1 ? null : <ChevronRight className="size-4" />}
          </button>
        </div>
      </section>
    </div>
  );
}

function getPopupStyle(anchor: AnchorBox | null): React.CSSProperties {
  const margin = 16;
  if (!anchor) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  const popupWidth = Math.min(360, window.innerWidth - 32);
  const left = Math.min(Math.max(anchor.left, margin), window.innerWidth - popupWidth - margin);
  const placeBelow = anchor.top + anchor.height + 250 < window.innerHeight;
  const top = placeBelow ? anchor.top + anchor.height + margin : Math.max(margin, anchor.top - 250 - margin);

  return { top, left };
}
