'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

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
  const hasPlaybackConsentRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const syncPlaybackState = () => {
      setIsPlaying(!el.paused);
      if (!el.paused) {
        hasPlaybackConsentRef.current = true;
        setNeedsInteraction(false);
      }
    };
    el.addEventListener('play', syncPlaybackState);
    el.addEventListener('pause', syncPlaybackState);
    el.addEventListener('ended', syncPlaybackState);

    return () => {
      el.removeEventListener('play', syncPlaybackState);
      el.removeEventListener('pause', syncPlaybackState);
      el.removeEventListener('ended', syncPlaybackState);

      if (retryHandlerRef.current) {
        document.removeEventListener('pointerdown', retryHandlerRef.current);
        document.removeEventListener('touchend', retryHandlerRef.current);
      }
    };
  }, []);

  const play = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;

    if (retryHandlerRef.current) {
      document.removeEventListener('pointerdown', retryHandlerRef.current);
      document.removeEventListener('touchend', retryHandlerRef.current);
      retryHandlerRef.current = null;
    }

    el.loop = true;
    el.muted = false;
    el.volume = 0.35;

    if (el.readyState === HTMLMediaElement.HAVE_NOTHING) {
      el.load();
    }

    el.play().catch((e: Error) => {
      if (e.name !== 'NotAllowedError') console.error(e.name, e.message);

      const retry = () => {
        retryHandlerRef.current = null;
        void el.play().catch((err: Error) => console.error(err.name, err.message));
      };

      retryHandlerRef.current = retry;
      document.addEventListener('pointerdown', retry, { once: true });
      document.addEventListener('touchend', retry, { once: true });
    });
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      const isInternalRoute = /\/invitacion\/[^/]+\/(confirmar|timeline)\/?$/.test(window.location.pathname);
      const el = audioRef.current;

      if (!isInternalRoute || !el?.paused || hasPlaybackConsentRef.current) {
        setNeedsInteraction(false);
        return;
      }

      setNeedsInteraction(true);
      play();
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [play]);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;

    if (el.paused) {
      play();
      return;
    }

    el.pause();
  }, [play]);

  return (
    <AudioCtx.Provider value={{ play }}>
      <audio
        ref={audioRef}
        preload="auto"
        loop
        playsInline
        style={{ display: 'none' }}
      >
        <source src="/audio/dawn.mp3" type="audio/mpeg" />
      </audio>
      {children}
      {needsInteraction && (
        <button
          type="button"
          onClick={() => {
            play();
            setNeedsInteraction(false);
          }}
          className="fixed inset-0 z-[60] flex h-full w-full cursor-pointer flex-col items-center justify-center border-0 bg-[#F6F4F0] px-8 text-center"
        >
          <span className="pointer-events-none absolute inset-5 border border-salvia/40 sm:inset-7" />
          <Volume2 size={22} strokeWidth={1.25} className="mb-5 text-salvia" />
          <span className="font-serif text-sm italic text-salvia">
            Toca para continuar
          </span>
        </button>
      )}
      <button
        type="button"
        onClick={toggle}
        className="fixed bottom-8 right-8 z-40 flex size-9 items-center justify-center border border-salvia/50 bg-[#F6F4F0]/90 text-salvia backdrop-blur-sm transition-colors hover:border-salvia hover:bg-[#F6F4F0] sm:bottom-10 sm:right-10"
        aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
        title={isPlaying ? 'Pausar música' : 'Reproducir música'}
      >
        {isPlaying ? <Volume2 size={17} strokeWidth={1.5} /> : <VolumeX size={17} strokeWidth={1.5} />}
      </button>
    </AudioCtx.Provider>
  );
}
