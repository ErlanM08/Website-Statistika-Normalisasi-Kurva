import { Gauge, Play, RotateCcw } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { DataInputPanel } from './DataInputPanel';
import { DataTable } from './DataTable';
import { Button } from './ui/Button';
import { HelpTooltip } from './ui/HelpTooltip';

export function Sidebar() {
  const sessionName = useDataStore((state) => state.sessionName);
  const setSessionName = useDataStore((state) => state.setSessionName);
  const analyze = useDataStore((state) => state.analyze);
  const clearData = useDataStore((state) => state.clearData);
  const rawData = useDataStore((state) => state.rawData);
  const warning = rawData.reduce((sum, point) => sum + point.fi, 0) < 3;

  return (
    <aside className="input-scrollbar flex h-dvh w-full flex-col overflow-y-auto bg-teal-700 p-6 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-[400px]">
      <div className="mb-8 flex items-center gap-4">
        <div className="grid size-14 place-items-center rounded-full border-2 border-white/60">
          <Gauge className="size-8" />
        </div>
        <div>
          <p className="text-xl font-semibold">StatCurve Pro</p>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-100">Polman Bandung</p>
        </div>
      </div>

      <label className="mb-4 block text-sm font-semibold text-teal-50" data-tour-id="project-name">
        <span className="flex items-center gap-2">
          Nama Project
          <HelpTooltip title="Nama Project" tourStep={0}>
            Nama ini menjadi identitas perhitungan dan dipakai sebagai nama file saat export CSV, Excel, PNG, PDF, atau session.
          </HelpTooltip>
        </span>
        <input
          className="field mt-2 w-full border-white/20 bg-white/10 text-white placeholder:text-teal-100/60"
          value={sessionName}
          onChange={(event) => setSessionName(event.target.value)}
          placeholder="Contoh: Dimensi Produk Juli 2026"
        />
      </label>

      {warning ? <p className="mb-3 rounded-xl bg-amber-300/20 p-3 text-sm text-amber-50">Minimal 3 data untuk analisis valid.</p> : null}

      <DataInputPanel />
      <DataTable />

      <div className="mt-auto pt-6">
        <div className="mb-5 h-px bg-white/20" />
        <div className="space-y-3">
          <Button className="h-14 w-full gap-3 text-base" icon={<Play className="size-7 shrink-0" strokeWidth={2.5} />} onClick={analyze} disabled={rawData.length === 0} title="Hitung KPI, tabel detail, dan grafik normalisasi" data-tour-id="analyze">
            Jalankan Normalisasi
          </Button>
          <Button className="h-11 w-full border-white/35 bg-white/5 text-sm text-white hover:bg-white/10 dark:text-white [&_svg]:size-4" variant="secondary" icon={<RotateCcw />} onClick={clearData}>
            Reset
          </Button>
        </div>
      </div>
    </aside>
  );
}
