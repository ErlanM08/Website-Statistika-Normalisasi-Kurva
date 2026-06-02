import { useEffect } from 'react';
import { BarChart3, Download, FileSpreadsheet, Keyboard, Play, Table2, X } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';

const guideSections = [
  {
    title: '1. Siapkan project',
    icon: Keyboard,
    items: [
      'Isi Nama Project agar file export mudah dikenali.',
      'Gunakan Data Tunggal untuk nilai Xi dan frekuensi fi.',
      'Delta dihitung otomatis dari data dan ditampilkan di KPI.',
    ],
  },
  {
    title: '2. Masukkan data',
    icon: FileSpreadsheet,
    items: [
      'Gunakan Entri Manual untuk menambah satu pasangan Xi dan fi.',
      'Gunakan Input Masal untuk daftar angka mentah yang dipisah koma, spasi, atau baris.',
      'Upload CSV/Excel jika data sudah ada di file. Template Excel tersedia di tombol Download Template Excel.',
      'Data yang sudah masuk bisa diedit langsung pada daftar Data Input.',
    ],
  },
  {
    title: '3. Jalankan analisis',
    icon: Play,
    items: [
      'Pastikan minimal ada data. Delta akan dihitung otomatis saat normalisasi dijalankan.',
      'Klik Jalankan Normalisasi untuk menghitung tabel, KPI, dan grafik.',
      'Jika hasil belum berubah setelah edit data, jalankan normalisasi ulang.',
    ],
  },
  {
    title: '4. Baca hasil',
    icon: BarChart3,
    items: [
      'KPI menampilkan ringkasan n, Delta, mean, sigma, range, dan modus.',
      'Grafik utama membandingkan frekuensi empiris dengan frekuensi teoritis normal.',
      'Mode Standar dan Lengkap menampilkan grafik tambahan untuk kumulatif, bar, dan distribusi fi-Fi.',
      'Kontrol Layer dapat dipakai untuk menampilkan atau menyembunyikan garis tertentu.',
    ],
  },
  {
    title: '5. Tabel Hasil Perhitungan',
    icon: Table2,
    items: [
      'Klik Lihat Tabel Detail untuk membuka 11 kolom pada Tabel Hasil Perhitungan.',
      'Baris dengan Fi[%] = 100 otomatis memakai u = infinity dan f{x\'} = 0.',
      'Kolom data input tampil apa adanya, sedangkan hasil kalkulasi tampil 4 desimal.',
    ],
  },
  {
    title: '6. Simpan dan export',
    icon: Download,
    items: [
      'Gunakan Sesi untuk menyimpan pekerjaan dalam JSON dan memuatnya kembali nanti.',
      'Export CSV/Excel untuk tabel, PNG untuk grafik, dan PDF untuk laporan.',
      'Nama file export mengikuti Nama Project yang sedang dipakai.',
    ],
  },
];

export function GuideModal() {
  const isOpen = useDataStore((state) => state.isGuideVisible);
  const closeGuide = useDataStore((state) => state.closeGuide);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeGuide();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeGuide, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={closeGuide}>
      <section
        className="max-h-[90dvh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6 dark:border-slate-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-100">Panduan Penggunaan</p>
            <h2 id="guide-title" className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
              Cara memakai Normalisasi Kurva Calculator
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Ikuti urutan singkat ini dari input data sampai export laporan.
            </p>
          </div>
          <button className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800" onClick={closeGuide} title="Tutup panduan">
            <X className="size-5" />
          </button>
        </div>

        <div className="input-scrollbar max-h-[calc(90dvh-132px)] overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {guideSections.map((section) => {
              const Icon = section.icon;
              return (
                <article key={section.title} className="rounded-2xl border border-slate-100 p-5 dark:border-slate-800">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-100">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="font-semibold text-slate-950 dark:text-white">{section.title}</h3>
                  </div>
                  <ul className="space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl bg-teal-50 p-5 text-sm text-teal-950 dark:bg-teal-900/30 dark:text-teal-50">
            Urutan paling aman: isi Nama Project, masukkan data Xi-fi, cek daftar Data Input, lalu klik Jalankan Normalisasi.
          </div>
        </div>
      </section>
    </div>
  );
}
