import { Database, Trash2 } from 'lucide-react';
import { type KeyboardEvent, useEffect, useState } from 'react';
import { useDataStore } from '../store/useDataStore';
import { parseNumber } from '../utils/format';
import { HelpTooltip } from './ui/HelpTooltip';

interface DraftRow {
  xi: string;
  fi: string;
}

export function DataTable() {
  const rawData = useDataStore((state) => state.rawData);
  const updateDataPoint = useDataStore((state) => state.updateDataPoint);
  const removeDataPoint = useDataStore((state) => state.removeDataPoint);
  const [draftRows, setDraftRows] = useState<DraftRow[]>([]);

  useEffect(() => {
    setDraftRows(rawData.map((point) => ({ xi: formatInput(point.xi), fi: formatInput(point.fi) })));
  }, [rawData]);

  const updateDraft = (index: number, key: keyof DraftRow, value: string) => {
    const nextDrafts = draftRows.map((row, itemIndex) => (itemIndex === index ? { ...row, [key]: value } : row));
    setDraftRows(nextDrafts);
  };

  const commitDraft = (index: number) => {
    const nextXi = parseNumber(draftRows[index]?.xi ?? '');
    const nextFi = parseNumber(draftRows[index]?.fi ?? '');
    if (nextXi !== null && nextFi !== null && nextFi > 0) {
      updateDataPoint(index, { xi: nextXi, fi: nextFi });
    }
  };

  const commitOnEnter = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Enter') {
      commitDraft(index);
      event.currentTarget.blur();
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-3" data-tour-id="data-input-list">
      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-teal-50">
        <span className="flex items-center gap-2">
          <Database className="size-4" /> Data Input
          <HelpTooltip title="Data Input" tourStep={4}>
            Daftar ini berisi data yang sudah masuk. Ubah nilai langsung di kotak input, lalu tekan Enter atau klik area lain untuk menyimpan.
          </HelpTooltip>
        </span>
        <span className="rounded-full bg-white/10 px-2 py-1 text-xs">{rawData.length} baris</span>
      </div>

      <div className="input-scrollbar max-h-56 space-y-2 overflow-y-auto pr-1">
        {rawData.length === 0 ? (
          <p className="rounded-xl bg-white/10 px-4 py-5 text-center text-sm text-teal-50/70">Belum ada data yang diinput.</p>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_0.7fr_32px] gap-2 px-2 text-[10px] font-bold uppercase text-teal-50/70">
              <span>xi</span>
              <span>fi</span>
              <span />
            </div>
            {rawData.map((_, index) => (
              <div key={index} className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)_32px] items-center gap-2 rounded-xl bg-white/10 p-2">
                <EditableCell value={draftRows[index]?.xi ?? ''} onChange={(value) => updateDraft(index, 'xi', value)} onBlur={() => commitDraft(index)} onKeyDown={(event) => commitOnEnter(event, index)} label={`Nilai xi baris ${index + 1}`} />
                <EditableCell value={draftRows[index]?.fi ?? ''} onChange={(value) => updateDraft(index, 'fi', value)} onBlur={() => commitDraft(index)} onKeyDown={(event) => commitOnEnter(event, index)} label={`Frekuensi fi baris ${index + 1}`} />
                <DeleteButton onClick={() => removeDataPoint(index)} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function EditableCell({ value, onChange, onBlur, onKeyDown, label }: { value: string; onChange: (value: string) => void; onBlur: () => void; onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void; label: string }) {
  return (
    <input
      className="h-10 min-w-0 rounded-lg border border-white/10 bg-teal-900/30 px-2 text-sm font-bold text-white outline-none transition placeholder:text-teal-50/50 focus:border-teal-300 focus:ring-2 focus:ring-teal-200/20"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      inputMode="decimal"
      aria-label={label}
    />
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="grid size-8 place-items-center rounded-lg text-teal-50/80 transition hover:bg-white/10 hover:text-white" onClick={onClick} title="Hapus data">
      <Trash2 className="size-4" />
    </button>
  );
}

function formatInput(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value).replace('.', ',');
}
