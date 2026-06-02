import { ChangeEvent, useRef, useState } from 'react';
import { Download, FileUp, Keyboard, Mic, MicOff, Plus, Upload } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import type { RawDataPoint } from '../types';
import { parseBulkInput } from '../utils/inputParser';
import { parseNumber } from '../utils/format';
import { useSpeechInput } from '../hooks/useSpeechInput';
import { Button } from './ui/Button';
import { HelpTooltip } from './ui/HelpTooltip';

interface VoiceBuffer {
  xi: string | null;
  fi: string | null;
}

export function DataInputPanel() {
  const { addDataPoint, addManyDataPoints } = useDataStore();
  const [xi, setXi] = useState('');
  const [fi, setFi] = useState('1');
  const [bulk, setBulk] = useState('');
  const [error, setError] = useState('');
  const [voiceWarning, setVoiceWarning] = useState('');
  const [voiceSuccess, setVoiceSuccess] = useState('');
  const [voiceBuffer, setVoiceBuffer] = useState<VoiceBuffer>({ xi: null, fi: null });
  const toastTimeout = useRef<number | null>(null);
  const speech = useSpeechInput();

  const addManual = () => {
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
    const parsed = parseBulkInput(bulk);
    if (parsed.length === 0) {
      setError('Input masal belum berisi angka valid.');
      return;
    }
    addManyDataPoints(parsed);
    setBulk('');
    setError('');
  };

  const showVoiceSuccess = (message: string, autoDismiss = false) => {
    if (toastTimeout.current) window.clearTimeout(toastTimeout.current);
    setVoiceSuccess(message);
    if (autoDismiss) {
      toastTimeout.current = window.setTimeout(() => setVoiceSuccess(''), 2000);
    }
  };

  const applyVoiceValue = (targetField: 'xi' | 'fi') => {
    const transcriptText = speech.transcript;
    const parsedValue = parseIndonesianSpeechNumber(transcriptText);
    console.log('Transcript:', transcriptText);
    console.log('Parsed value:', parsedValue);
    console.log('Target field:', targetField === 'xi' ? 'Xi' : 'fi');

    if (parsedValue === null) {
      setVoiceWarning('⚠ Tidak dapat mengenali angka. Ucapkan ulang.');
      setVoiceSuccess('');
      return;
    }

    if (targetField === 'xi') {
      setVoiceBuffer({ xi: parsedValue, fi: null });
      setVoiceWarning('');
      showVoiceSuccess(`Xi: ${parsedValue} ✓ — sekarang rekam Fi`);
      setError('');
      speech.setTranscript('');
      return;
    }

    if (!voiceBuffer.xi) {
      setVoiceWarning('Rekam Xi terlebih dahulu sebelum Fi');
      setVoiceSuccess('');
      return;
    }

    const fiValue = Math.trunc(Number(parsedValue));
    if (fiValue <= 0) {
      setVoiceWarning('Fi harus lebih besar dari 0.');
      setVoiceSuccess('');
      return;
    }

    addDataPoint({ xi: Number(voiceBuffer.xi), fi: fiValue });
    setVoiceBuffer({ xi: null, fi: null });
    setVoiceWarning('');
    showVoiceSuccess(`✓ Data Xi=${voiceBuffer.xi}, fi=${fiValue} berhasil ditambahkan!`, true);
    setError('');
    speech.setTranscript('');
  };

  const useVoiceAsXi = () => applyVoiceValue('xi');
  const useVoiceAsFi = () => applyVoiceValue('fi');

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-white/10 p-4" data-tour-id="manual-input">
        <div className="mb-3 flex items-center justify-between gap-3 text-white">
          <h2 className="flex items-center gap-2 font-semibold">
            <Keyboard className="size-5" /> Entri Manual
          </h2>
          <HelpTooltip title="Entri Manual" tourStep={1}>
            Masukkan satu pasangan data. Kolom pertama untuk nilai Xi, kolom kedua untuk frekuensi fi, lalu tekan Tambah.
          </HelpTooltip>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input className="field border-white/20 bg-white/10 text-white placeholder:text-teal-100/60" value={xi} onChange={(event) => setXi(event.target.value)} placeholder="Nilai xi" inputMode="decimal" />
          <input className="field border-white/20 bg-white/10 text-white placeholder:text-teal-100/60" value={fi} onChange={(event) => setFi(event.target.value)} placeholder="Frekuensi fi" inputMode="decimal" />
        </div>
        <Button className="mt-3 w-full" icon={<Plus className="size-4" />} onClick={addManual}>
          Tambah
        </Button>
      </section>

      <section className="rounded-2xl border border-white/15 p-4" data-tour-id="bulk-input">
        <div className="mb-3 flex items-center justify-between gap-3 text-white">
          <h2 className="flex items-center gap-2 font-semibold">
            <Upload className="size-5" /> Input Masal
          </h2>
          <HelpTooltip title="Input Masal" tourStep={2}>
            Tempel daftar angka mentah, satu angka per baris, atau format xi,fi per baris.
          </HelpTooltip>
        </div>
        <textarea className="field min-h-24 w-full border-white/20 bg-white/10 text-white placeholder:text-teal-100/60" value={bulk} onChange={(event) => setBulk(event.target.value)} placeholder="56, 76, 45, 33 atau satu angka per baris" />
        <div className="mt-3 flex gap-2">
          <Button className="flex-1 border-white/50 text-white hover:bg-white/10 dark:text-white" variant="secondary" onClick={addBulk}>
            Proses
          </Button>
          <FileUpload onError={setError} onLoaded={addManyDataPoints} />
        </div>
        <Button
          className="mt-3 w-full border-white/50 text-white hover:bg-white/10 dark:text-white"
          variant="secondary"
          icon={<Download className="size-4" />}
          onClick={() => import('../utils/csvParser').then((module) => module.downloadExcelTemplate())}
        >
          Download Template Excel
        </Button>
      </section>

      <section className="rounded-2xl border border-white/15 p-4" data-tour-id="voice-input">
        <div className="mb-3 flex items-center justify-between gap-3 text-white">
          <h2 className="flex items-center gap-2 font-semibold">
            {speech.isListening ? <MicOff className="size-5 text-red-300" /> : <Mic className="size-5 text-red-300" />} Logika Suara
          </h2>
          <HelpTooltip title="Logika Suara" tourStep={3}>
            Rekam Xi lalu Fi. Setelah Fi dipakai, data langsung masuk ke daftar Data Input.
          </HelpTooltip>
        </div>
        {!speech.isSupported ? (
          <p className="text-sm text-teal-100/80">Browser ini belum mendukung input suara.</p>
        ) : (
          <VoiceControls {...speech} useVoiceAsXi={useVoiceAsXi} useVoiceAsFi={useVoiceAsFi} voiceWarning={voiceWarning} voiceSuccess={voiceSuccess} voiceBuffer={voiceBuffer} />
        )}
      </section>

      {error ? <p className="rounded-xl bg-red-500/20 p-3 text-sm text-red-50">{error}</p> : null}
    </div>
  );
}

function FileUpload({ onLoaded, onError }: { onLoaded: (points: RawDataPoint[]) => void; onError: (message: string) => void }) {
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
        return parser(file);
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

function VoiceControls(props: ReturnType<typeof useSpeechInput> & { useVoiceAsXi: () => void; useVoiceAsFi: () => void; voiceWarning: string; voiceSuccess: string; voiceBuffer: VoiceBuffer }) {
  const toggleListening = () => {
    if (props.isListening) {
      props.stop();
      return;
    }
    props.setTranscript('');
    props.start();
  };

  return (
    <>
      <div className="rounded-xl bg-teal-950/50 p-3 text-sm italic text-teal-50/80">{props.transcript || 'Mendengarkan transkripsi angka Indonesia...'}</div>
      <div className="mt-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-teal-50/85">
        Xi: {props.voiceBuffer.xi ? `${props.voiceBuffer.xi} ✓` : 'menunggu...'} <span className="px-1 text-teal-50/50">|</span> Fi: {props.voiceBuffer.xi ? 'menunggu...' : '—'}
      </div>
      {props.voiceWarning ? <p className="mt-2 rounded-lg bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-50">{props.voiceWarning}</p> : null}
      {props.voiceSuccess ? <p className="mt-2 rounded-lg bg-emerald-400/20 px-3 py-2 text-sm font-semibold text-emerald-50">{props.voiceSuccess}</p> : null}
      <div className="mt-3 grid gap-2">
        <Button className="border-white/50 text-white hover:bg-white/10 dark:text-white" variant="secondary" onClick={toggleListening}>
          {props.isListening ? 'Berhenti' : 'Rekam'}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={props.useVoiceAsXi} disabled={!props.transcript}>
            Pakai sebagai Xi
          </Button>
          <Button onClick={props.useVoiceAsFi} disabled={!props.transcript}>
            Pakai sebagai Fi
          </Button>
        </div>
      </div>
    </>
  );
}

function parseIndonesianSpeechNumber(text: string): string | null {
  if (!text) return null;
  let result = text.toLowerCase().trim();
  if (!result) return null;

  if (/^[\d.,]+$/.test(result)) {
    result = result.replace(/,/g, '.');
    console.log('Raw transcript:', text);
    console.log('After parsing:', result);
    const numericValue = parseFloat(result);
    return Number.isNaN(numericValue) ? null : String(numericValue);
  }

  const [integerText, decimalText] = result.split(/\bkoma\b|\btitik\b/).map((part) => part.trim());
  const integerValue = parseIndonesianInteger(integerText);
  if (integerValue === null) {
    console.log('Raw transcript:', text);
    console.log('After parsing:', result);
    return null;
  }

  if (decimalText) {
    const decimalDigits = parseIndonesianDecimalDigits(decimalText);
    if (decimalDigits === null) {
      console.log('Raw transcript:', text);
      console.log('After parsing:', result);
      return null;
    }
    result = `${integerValue}.${decimalDigits}`;
  } else {
    result = String(integerValue);
  }

  console.log('Raw transcript:', text);
  console.log('After parsing:', result);
  const numericValue = parseFloat(result);
  return Number.isNaN(numericValue) ? null : String(numericValue);
}

function parseIndonesianInteger(text: string): number | null {
  if (/^\d+$/.test(text)) return Number(text);
  const tokens = text.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;

  let total = 0;
  let index = 0;
  while (index < tokens.length) {
    const token = tokens[index];
    const direct = digitWordMap[token];
    if (direct !== undefined) {
      if (tokens[index + 1] === 'ratus') {
        total += direct * 100;
        index += 2;
        continue;
      }
      if (tokens[index + 1] === 'puluh') {
        total += direct * 10;
        index += 2;
        continue;
      }
      if (tokens[index + 1] === 'belas') {
        total += 10 + direct;
        index += 2;
        continue;
      }
      total += direct;
      index += 1;
      continue;
    }
    if (token === 'sepuluh') {
      total += 10;
      index += 1;
      continue;
    }
    if (token === 'sebelas') {
      total += 11;
      index += 1;
      continue;
    }
    if (token === 'seratus') {
      total += 100;
      index += 1;
      continue;
    }
    if (token === 'seribu') {
      total += 1000;
      index += 1;
      continue;
    }
    if (/^\d+$/.test(token)) {
      total += Number(token);
      index += 1;
      continue;
    }
    return null;
  }

  return total;
}

function parseIndonesianDecimalDigits(text: string): string | null {
  if (/^\d+$/.test(text)) return text;
  const digits = text
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      if (/^\d$/.test(token)) return token;
      const digit = digitWordMap[token];
      return digit === undefined ? null : String(digit);
    });

  return digits.every((digit): digit is string => digit !== null) ? digits.join('') : null;
}

const digitWordMap: Record<string, number> = {
  nol: 0,
  satu: 1,
  dua: 2,
  tiga: 3,
  empat: 4,
  lima: 5,
  enam: 6,
  tujuh: 7,
  delapan: 8,
  sembilan: 9,
};
