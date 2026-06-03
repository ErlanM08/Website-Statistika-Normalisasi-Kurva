import { useEffect, useMemo, useRef, useState } from 'react';

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionAlternativeList {
  readonly length: number;
  item(index: number): SpeechRecognitionResultItem;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternativeList;
  [index: number]: SpeechRecognitionAlternativeList;
}

interface SpeechRecognitionEventLike {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEventLike {
  error?: string;
  message?: string;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export function useSpeechInput() {
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const SpeechRecognition = useMemo(() => getSpeechRecognition(), []);
  const isSupported = Boolean(SpeechRecognition);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
  };

  const start = () => {
    if (!SpeechRecognition) return;
    clearSilenceTimer();
    recognitionRef.current?.stop();

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const latestResult = event.results[event.results.length - 1];
      const text = latestResult?.[0]?.transcript?.trim() ?? '';
      setTranscript(text);
      if (text) {
        setError('');
        clearSilenceTimer();
      }
    };
    recognition.onerror = (event) => {
      clearSilenceTimer();
      setIsListening(false);
      setError(getSpeechErrorMessage(event.error));
    };
    recognition.onend = () => {
      clearSilenceTimer();
      setIsListening(false);
    };
    recognitionRef.current = recognition;
    setTranscript('');
    setError('');
    setIsListening(true);

    silenceTimerRef.current = window.setTimeout(() => {
      setError('Suara tidak terdeteksi. Pastikan mikrofon aktif dan coba lagi.');
      recognitionRef.current?.stop();
      setIsListening(false);
    }, 3000);

    try {
      recognition.start();
    } catch {
      clearSilenceTimer();
      setIsListening(false);
      setError('Perekaman suara gagal dimulai. Coba tekan Rekam sekali lagi.');
    }
  };

  const stop = () => {
    clearSilenceTimer();
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  useEffect(() => () => {
    clearSilenceTimer();
    recognitionRef.current?.stop();
  }, []);

  return { transcript, setTranscript, error, isListening, isSupported, start, stop };
}

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

function getSpeechErrorMessage(error?: string): string {
  if (error === 'not-allowed' || error === 'service-not-allowed') return 'Akses mikrofon ditolak. Izinkan mikrofon di browser lalu coba lagi.';
  if (error === 'no-speech') return 'Suara tidak terdeteksi. Pastikan mikrofon aktif dan coba lagi.';
  if (error === 'audio-capture') return 'Mikrofon tidak tersedia atau sedang dipakai aplikasi lain.';
  if (error === 'network') return 'Layanan pengenal suara gagal terhubung. Periksa koneksi lalu coba lagi.';
  return 'Perekaman suara gagal. Coba ulangi dengan suara lebih jelas.';
}
