import { useMemo, useRef, useState } from 'react';

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

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export function useSpeechInput() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const SpeechRecognition = useMemo(() => getSpeechRecognition(), []);
  const isSupported = Boolean(SpeechRecognition);

  const start = () => {
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const text = Array.from({ length: event.results.length }, (_, index) => event.results[index][0].transcript).join(' ');
      setTranscript(text);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return { transcript, setTranscript, isListening, isSupported, start, stop };
}

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}
