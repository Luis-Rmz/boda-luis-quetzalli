'use client';

import { createContext, useContext, useRef, useCallback } from 'react';

interface AudioContextValue {
  play: () => void;
}

const AudioCtx = createContext<AudioContextValue>({ play: () => {} });

export function useAudio() {
  return useContext(AudioCtx);
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const retryHandlerRef = useRef<(() => void) | null>(null);

  const play = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;

    if (retryHandlerRef.current) {
      document.removeEventListener('pointerdown', retryHandlerRef.current);
      document.removeEventListener('touchend', retryHandlerRef.current);
      retryHandlerRef.current = null;
    }

    el.loop = true;
    el.volume = 0.35;

    if (el.readyState === HTMLMediaElement.HAVE_NOTHING) {
      el.load();
    }

    el.play().catch((e: Error) => {
      console.error(e.name, e.message);

      const retry = () => {
        retryHandlerRef.current = null;
        void el.play().catch((err: Error) => console.error(err.name, err.message));
      };

      retryHandlerRef.current = retry;
      document.addEventListener('pointerdown', retry, { once: true });
      document.addEventListener('touchend', retry, { once: true });
    });
  }, []);

  return (
    <AudioCtx.Provider value={{ play }}>
      <audio
        ref={audioRef}
        src="/audio/dawn.mp3"
        preload="auto"
        loop
        playsInline
        style={{ display: 'none' }}
      />
      {children}
    </AudioCtx.Provider>
  );
}
