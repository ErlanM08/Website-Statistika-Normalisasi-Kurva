import { CircleHelp } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useRef, useState } from 'react';
import { useDataStore } from '../../store/useDataStore';

interface HelpTooltipProps {
  title: string;
  children: ReactNode;
  tourStep?: number;
}

export function HelpTooltip({ title, children, tourStep }: HelpTooltipProps) {
  const startTour = useDataStore((state) => state.startTour);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [position, setPosition] = useState({ left: 16, top: 16, width: 320 });
  const updatePosition = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const margin = 12;
    const width = Math.min(320, window.innerWidth - margin * 2);
    const centeredLeft = rect.left + rect.width / 2 - width / 2;
    const left = Math.min(Math.max(centeredLeft, margin), window.innerWidth - width - margin);
    const top = Math.min(rect.bottom + 8, window.innerHeight - margin);
    setPosition({ left, top, width });
  }, []);

  return (
    <span className="group relative inline-flex shrink-0">
      <button
        ref={buttonRef}
        type="button"
        className="grid size-6 place-items-center rounded-lg text-current opacity-75 outline-none transition hover:bg-white/10 hover:opacity-100 focus:bg-white/10 focus:opacity-100"
        aria-label={title}
        onClick={() => startTour(tourStep ?? 0)}
        onFocus={updatePosition}
        onMouseEnter={updatePosition}
      >
        <CircleHelp className="size-4" />
      </button>
      <span
        className="pointer-events-none fixed z-[80] translate-y-1 whitespace-normal rounded-xl bg-slate-950 px-4 py-3 text-left text-xs font-medium leading-5 text-white opacity-0 shadow-xl ring-1 ring-white/10 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
        style={{ left: position.left, top: position.top, width: position.width }}
      >
        <span className="mb-1 block font-bold text-teal-200">{title}</span>
        {children}
      </span>
    </span>
  );
}
