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

  const play = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.play().catch((e: Error) => console.error(e.name, e.message));
  }, []);

  return (
    <AudioCtx.Provider value={{ play }}>
      <audio
        ref={audioRef}
        src="/audio/dawn.mp3"
        loop
        preload="auto"
        style={{ display: 'none' }}
      />
      {children}
    </AudioCtx.Provider>
  );
}
