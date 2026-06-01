import { ChangeEvent, useState } from 'react';
import { Download, FileUp, Keyboard, Mic, MicOff, Plus, Upload } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import type { DataType, RawDataPoint } from '../types';
import { parseBulkInput, parseGroupedBulkInput, parseVoiceNumbers } from '../utils/inputParser';
import { parseNumber } from '../utils/format';
import { formatUserInput } from '../utils/formatters';
import { useSpeechInput } from '../hooks/useSpeechInput';
import { Button } from './ui/Button';
import { HelpTooltip } from './ui/HelpTooltip';

export function DataInputPanel() {
  const { addDataPoint, addManyDataPoints, dataType } = useDataStore();
  const [xi, setXi] = useState('');
  const [classStart, setClassStart] = useState('');
  const [classEnd, setClassEnd] = useState('');
  const [fi, setFi] = useState('1');
  const [bulk, setBulk] = useState('');
  const [error, setError] = useState('');
  const speech = useSpeechInput();

  const parsedClassStart = parseNumber(classStart);
  const parsedClassEnd = parseNumber(classEnd);
  const groupedPreviewXi = parsedClassStart !== null && parsedClassEnd !== null && parsedClassEnd > parsedClassStart ? (parsedClassStart + parsedClassEnd) / 2 : null;

  const addManual = () => {
    if (dataType === 'grouped') {
      const parsedFi = parseNumber(fi);
      if (parsedClassStart === null || parsedClassEnd === null || parsedFi === null || parsedFi < 0) {
        setError('Masukkan batas kelas dan frekuensi yang valid.');
        return;
      }
      if (parsedClassEnd <= parsedClassStart) {
        setError('Batas Atas harus lebih besar dari Batas Bawah.');
        return;
      }
      if (parsedFi === 0) {
        setError('Frekuensi 0 dilewati.');
        return;
      }
      addDataPoint({ classStart: parsedClassStart, classEnd: parsedClassEnd, xi: (parsedClassStart + parsedClassEnd) / 2, fi: parsedFi });
      setClassStart('');
      setClassEnd('');
      setFi('1');
      setError('');
      return;
    }

    const parsedXi = parseNumber(xi);
    const parsedFi = parseNumber(fi);
    if (parsedXi === null || parsedFi === null || parsedFi < 0) {
      setError('Masukkan nilai numerik yang valid.');
      return;
    }
    if (parsedFi === 0) {
      setError('Frekuensi 0 dilewati.');
      return;
    }
    addDataPoint({ xi: parsedXi, fi: parsedFi });
    setXi('');
    setFi('1');
    setError('');
  };

  const addBulk = () => {
    const parsed = dataType === 'grouped' ? parseGroupedBulkInput(bulk) : parseBulkInput(bulk);
    if (parsed.length === 0) {
      setError('Input masal belum berisi angka valid.');
      return;
    }
    addManyDataPoints(parsed);
    setBulk('');
    setError('');
  };

  const addVoice = () => {
    const parsed = parseVoiceNumbers(speech.transcript);
    if (parsed.length > 0) addManyDataPoints(parsed);
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-white/10 p-4" data-tour-id="manual-input">
        <div className="mb-3 flex items-center justify-between gap-3 text-white">
          <h2 className="flex items-center gap-2 font-semibold">
            <Keyboard className="size-5" /> Entri Manual
          </h2>
          <HelpTooltip title="Entri Manual" tourStep={2}>
            {dataType === 'grouped' ? 'Masukkan batas bawah, batas atas, dan frekuensi. Nilai Xi dihitung otomatis sebagai titik tengah kelas.' : 'Masukkan satu pasangan data. Kolom pertama untuk nilai Xi, kolom kedua untuk frekuensi fi, lalu tekan Tambah.'}
          </HelpTooltip>
        </div>
        {dataType === 'grouped' ? (
          <>
            <div className="mb-1 grid grid-cols-3 gap-2 px-1 text-[10px] font-bold uppercase text-teal-50/70">
              <span>Batas Bawah</span>
              <span>Batas Atas</span>
              <span>Frekuensi</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input className="field border-white/20 bg-white/10 text-white placeholder:text-teal-100/60" value={classStart} onChange={(event) => setClassStart(event.target.value)} placeholder="59.5" inputMode="decimal" aria-label="Batas Bawah" />
              <input className="field border-white/20 bg-white/10 text-white placeholder:text-teal-100/60" value={classEnd} onChange={(event) => setClassEnd(event.target.value)} placeholder="60.5" inputMode="decimal" aria-label="Batas Atas" />
              <input className="field border-white/20 bg-white/10 text-white placeholder:text-teal-100/60" value={fi} onChange={(event) => setFi(event.target.value)} placeholder="3" inputMode="decimal" aria-label="Frekuensi" />
            </div>
            <p className="mt-2 rounded-xl bg-teal-950/30 px-3 py-2 text-xs font-semibold text-teal-50/85">
              xi = {groupedPreviewXi === null ? '--' : formatUserInput(groupedPreviewXi)}
            </p>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <input className="field border-white/20 bg-white/10 text-white placeholder:text-teal-100/60" value={xi} onChange={(event) => setXi(event.target.value)} placeholder="Nilai xi" inputMode="decimal" />
            <input className="field border-white/20 bg-white/10 text-white placeholder:text-teal-100/60" value={fi} onChange={(event) => setFi(event.target.value)} placeholder="Frekuensi fi" inputMode="decimal" />
          </div>
        )}
        <Button className="mt-3 w-full" icon={<Plus className="size-4" />} onClick={addManual}>
          Tambah
        </Button>
      </section>

      <section className="rounded-2xl border border-white/15 p-4" data-tour-id="bulk-input">
        <div className="mb-3 flex items-center justify-between gap-3 text-white">
          <h2 className="flex items-center gap-2 font-semibold">
            <Upload className="size-5" /> Input Masal
          </h2>
          <HelpTooltip title="Input Masal" tourStep={3}>
            {dataType === 'grouped' ? 'Gunakan format batasBawah-batasAtas:frekuensi per baris. Nilai Xi dihitung otomatis dari titik tengah.' : 'Tempel daftar angka mentah, satu angka per baris, atau format xi,fi per baris.'}
          </HelpTooltip>
        </div>
        <textarea className="field min-h-24 w-full border-white/20 bg-white/10 text-white placeholder:text-teal-100/60" value={bulk} onChange={(event) => setBulk(event.target.value)} placeholder={dataType === 'grouped' ? 'Format: batasBawah-batasAtas:frekuensi\nContoh:\n59.5-60.5:3\n60.5-61.5:7\n61.5-62.5:12' : '56, 76, 45, 33 atau satu angka per baris'} />
        <div className="mt-3 flex gap-2">
          <Button className="flex-1 border-white/50 text-white hover:bg-white/10 dark:text-white" variant="secondary" onClick={addBulk}>
            Proses
          </Button>
          <FileUpload dataType={dataType} onError={setError} onLoaded={addManyDataPoints} />
        </div>
        <Button
          className="mt-3 w-full border-white/50 text-white hover:bg-white/10 dark:text-white"
          variant="secondary"
          icon={<Download className="size-4" />}
          onClick={() => import('../utils/csvParser').then((module) => module.downloadExcelTemplate(dataType))}
        >
          Download Template Excel
        </Button>
      </section>

      <section className="rounded-2xl border border-white/15 p-4" data-tour-id="voice-input">
        <div className="mb-3 flex items-center justify-between gap-3 text-white">
          <h2 className="flex items-center gap-2 font-semibold">
            {speech.isListening ? <MicOff className="size-5 text-red-300" /> : <Mic className="size-5 text-red-300" />} Logika Suara
          </h2>
          <HelpTooltip title="Logika Suara" tourStep={4}>
            Rekam angka dengan bahasa Indonesia. Setelah transkripsi muncul, tekan Pakai untuk memasukkan data ke daftar.
          </HelpTooltip>
        </div>
        {!speech.isSupported ? <p className="text-sm text-teal-100/80">Browser ini belum mendukung input suara.</p> : <VoiceControls {...speech} addVoice={addVoice} />}
      </section>

      {error ? <p className="rounded-xl bg-red-500/20 p-3 text-sm text-red-50">{error}</p> : null}
    </div>
  );
}

function FileUpload({ dataType, onLoaded, onError }: { dataType: DataType; onLoaded: (points: RawDataPoint[]) => void; onError: (message: string) => void }) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension !== 'xlsx' && extension !== 'xls' && extension !== 'csv') {
      onError('Format file harus .csv, .xlsx, atau .xls.');
      event.target.value = '';
      return;
    }

    import('../utils/csvParser')
      .then((module) => {
        const parser = extension === 'csv' ? module.parseCsvFile : module.parseExcelFile;
        return parser(file, dataType);
      })
      .then((points) => {
        if (points.length === 0) {
          onError('File tidak berisi data valid.');
          return;
        }
        onLoaded(points);
        onError('');
      })
      .catch((error: Error) => onError(error.message))
      .finally(() => {
        event.target.value = '';
      });
  };
  return (
    <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-teal-100/50 px-3 text-sm font-semibold text-white hover:bg-white/10" title="Upload CSV atau Excel dengan kolom Xi dan fi">
      <FileUp className="size-4" />
      <input className="sr-only" type="file" accept=".csv,.xlsx,.xls,text/csv" onChange={onChange} />
    </label>
  );
}

function VoiceControls(props: ReturnType<typeof useSpeechInput> & { addVoice: () => void }) {
  return (
    <>
      <div className="rounded-xl bg-teal-950/50 p-3 text-sm italic text-teal-50/80">{props.transcript || 'Mendengarkan transkripsi angka Indonesia...'}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button className="border-white/50 text-white hover:bg-white/10 dark:text-white" variant="secondary" onClick={props.isListening ? props.stop : props.start}>
          {props.isListening ? 'Berhenti' : 'Rekam'}
        </Button>
        <Button onClick={props.addVoice} disabled={!props.transcript}>
          Pakai
        </Button>
      </div>
    </>
  );
}
