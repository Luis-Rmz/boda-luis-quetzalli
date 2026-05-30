'use client';

import { useRef, useState } from 'react';

type Phase = 'visible' | 'fading' | 'gone';

interface Props {
  onComplete: () => void;
}

export default function EntranceOverlay({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('visible');
  const audioRef = useRef<HTMLAudioElement>(null);

  const enter = () => {
    if (phase !== 'visible') return;
    audioRef.current?.play().catch((e: Error) => console.error(e.name, e.message));
    setPhase('fading');
    setTimeout(() => {
      setPhase('gone');
      onComplete();
    }, 1600);
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/dawn.mp3" loop preload="auto" style={{ display: 'none' }} />

      {phase !== 'gone' && (
        <button
          type="button"
          onClick={enter}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            backgroundColor: '#F6F4F0', border: 'none',
            padding: 0, margin: 0, cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            width: '100%', height: '100%',
            opacity: phase === 'fading' ? 0 : 1,
            transition: 'opacity 1.5s ease',
          }}
        >
          <div style={{ position: 'absolute', inset: '20px', pointerEvents: 'none' }}>
            <span className="absolute top-0 left-0    border-t border-l border-black/25 animate-corner" />
            <span className="absolute top-0 right-0   border-t border-r border-black/25 animate-corner" />
            <span className="absolute bottom-0 left-0  border-b border-l border-black/25 animate-corner" />
            <span className="absolute bottom-0 right-0 border-b border-r border-black/25 animate-corner" />
          </div>

          <div className="flex flex-col items-center text-center px-8">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-black/35 animate-fade-up"
              style={{ animationDelay: '1s', marginBottom: '1.25rem' }}>
              Una celebración de amor
            </p>
            <p className="font-serif tracking-[0.2em] text-black/80 animate-fade-up"
              style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)', animationDelay: '1.4s', marginBottom: '1.25rem' }}>
              LUIS &amp; QUETZALLI
            </p>
            <div className="bg-black/20 animate-expand-x"
              style={{ height: '0.5px', width: '40px', marginBottom: '1.25rem', animationDelay: '1.7s' }} />
            <p className="font-serif italic text-black/40 animate-fade-up"
              style={{ fontSize: '0.82rem', animationDelay: '2s', marginBottom: '2rem', lineHeight: 1.7 }}>
              Toca para abrir tu invitación
            </p>
            <div className="animate-fade-up" style={{ animationDelay: '2.3s' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"
                style={{ color: '#688236', animation: 'bob 2s ease-in-out infinite', animationDelay: '3s' }}>
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </button>
      )}
    </>
  );
}
