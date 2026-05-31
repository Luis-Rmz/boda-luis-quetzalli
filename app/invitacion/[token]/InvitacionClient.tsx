'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GuestGroup } from '@/app/lib/sheets';
import { useAudio } from '@/app/invitacion/AudioContext';

interface Props {
  group: GuestGroup;
}

export default function InvitacionClient({ group }: Props) {
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [overlayFading, setOverlayFading] = useState(false);
  const [invitationVisible, setInvitationVisible] = useState(false);
  const { play } = useAudio();
  const router = useRouter();

  const enter = () => {
    if (overlayFading) return;
    play();
    setOverlayFading(true);
    setTimeout(() => {
      setOverlayVisible(false);
      setInvitationVisible(true);
    }, 1600);
  };

  const goToConfirm = () => {
    router.push(`/invitacion/${group.token}/confirmar`);
  };

  return (
    <>
      {/* ── OVERLAY ─────────────────────────────────────── */}
      {overlayVisible && (
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
            opacity: overlayFading ? 0 : 1,
            transition: 'opacity 1.5s ease',
          }}
        >
          <div style={{ position: 'absolute', inset: '20px', pointerEvents: 'none' }}>
            <span className="absolute top-0 left-0    border-t border-l border-salvia/40 animate-corner" />
            <span className="absolute top-0 right-0   border-t border-r border-salvia/40 animate-corner" />
            <span className="absolute bottom-0 left-0  border-b border-l border-salvia/40 animate-corner" />
            <span className="absolute bottom-0 right-0 border-b border-r border-salvia/40 animate-corner" />
          </div>
          <div className="flex flex-col items-center justify-center gap-10 text-center px-8"
            style={{ width: '100%', maxWidth: '360px' }}>

            {/* Cita */}
            <p className="font-serif italic text-salvia animate-fade-up"
              style={{ animationDelay: '1s', fontSize: '0.88rem', lineHeight: 1.9, maxWidth: '300px' }}>
              "Soy incapaz de precisar el momento, el lugar, la mirada o las palabras que sentaron los cimientos. Ha pasado demasiado tiempo. Estaba ya a mitad de camino cuando fui consciente de haberlo emprendido."
            </p>

            {/* Toca + flecha */}
            <div className="flex flex-col items-center gap-3">
              <p className="font-serif italic text-salvia animate-fade-up"
                style={{ fontSize: '0.9rem', animationDelay: '1.6s', lineHeight: 1.7 }}>
                Toca para abrir tu invitación
              </p>
              <div className="animate-fade-up" style={{ animationDelay: '2s' }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none"
                  style={{ color: '#688236', animation: 'bob 2s ease-in-out infinite', animationDelay: '2.5s' }}>
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

          </div>
        </button>
      )}

      {/* ── INVITATION ──────────────────────────────────── */}
      {invitationVisible && (
        <main className="relative h-dvh flex flex-col items-center justify-center px-10 sm:px-14 py-10 sm:py-14 text-center overflow-hidden">

          {/* Corner frame */}
          <div className="pointer-events-none absolute inset-5 sm:inset-7">
            <span className="absolute top-0 left-0    border-t border-l border-salvia/40 animate-corner" style={{ animationDelay: '0s' }} />
            <span className="absolute top-0 right-0   border-t border-r border-salvia/40 animate-corner" style={{ animationDelay: '0s' }} />
            <span className="absolute bottom-0 left-0  border-b border-l border-salvia/40 animate-corner" style={{ animationDelay: '0s' }} />
            <span className="absolute bottom-0 right-0 border-b border-r border-salvia/40 animate-corner" style={{ animationDelay: '0s' }} />
          </div>

          <div className="w-full max-w-md flex flex-col items-center">

            {/* 1. Nombres */}
            <div className="flex flex-col items-center">
              <h1 className="text-[8vw] sm:text-5xl md:text-6xl font-serif tracking-[0.25em] text-black ml-3 animate-fade-up"
                style={{ animationDelay: '5.2s' }}>
                LUIS
              </h1>
              <span className="block text-[8vw] sm:text-5xl md:text-6xl font-cursive text-black leading-none my-1 opacity-90 animate-fade-up"
                style={{ animationDelay: '5.7s' }}>
                y
              </span>
              <h1 className="text-[8vw] sm:text-5xl md:text-6xl font-serif tracking-[0.25em] text-black ml-3 animate-fade-up"
                style={{ animationDelay: '6.2s' }}>
                QUETZALLI
              </h1>
            </div>

            {/* 2. Imagen */}
            <div className="flex items-center gap-4 my-2 sm:my-4 w-4/5">
              <div className="flex-1 h-px bg-black/20 animate-expand-x" style={{ animationDelay: '6.8s' }} />
              <span className="text-black/30 text-[10px] animate-fade-up" style={{ animationDelay: '7.0s' }}>◇</span>
              <div className="flex-1 h-px bg-black/20 animate-expand-x" style={{ animationDelay: '6.8s' }} />
            </div>

            <img src="/building.png" alt="Academia Renacimiento y Trinitate"
              className="w-32 sm:w-44 md:w-52 h-auto animate-fade-up"
              style={{ animationDelay: '7.5s' }} />

            {/* 3. Te invitamos */}
            <div className="flex items-center gap-4 my-2 sm:my-4 w-4/5">
              <div className="flex-1 h-px bg-black/20 animate-expand-x" style={{ animationDelay: '8.2s' }} />
              <span className="text-black/30 text-[10px] animate-fade-up" style={{ animationDelay: '8.4s' }}>◇</span>
              <div className="flex-1 h-px bg-black/20 animate-expand-x" style={{ animationDelay: '8.2s' }} />
            </div>

            <p className="text-xs tracking-[0.4em] uppercase font-serif text-salvia mb-1 animate-fade-up"
              style={{ animationDelay: '8.8s' }}>
              Te invitamos a celebrar
            </p>

            <p className="text-xs tracking-[0.4em] uppercase font-serif text-salvia mb-2 sm:mb-4 animate-fade-up"
              style={{ animationDelay: '9.2s' }}>
              Nuestra boda
            </p>

            {/* 4. Fecha y lugar */}
            <p className="text-xs sm:text-sm tracking-[0.35em] uppercase font-serif text-black/60 animate-fade-up"
              style={{ animationDelay: '9.7s' }}>
              19 de Diciembre, 2026
            </p>

            <p className="text-sm sm:text-base font-serif italic text-salvia mt-1 mb-3 sm:mb-5 animate-fade-up"
              style={{ animationDelay: '10.1s' }}>
              Academia Renacimiento, León, Guajuato.
            </p>

            {/* 5. CTA */}
            <button
              type="button"
              onClick={goToConfirm}
              className="animate-fade-up group cursor-pointer"
              style={{ animationDelay: '10.6s', background: 'none', border: 'none', padding: 0 }}
            >
              <span className="text-3xl sm:text-4xl md:text-5xl font-cursive text-black group-hover:opacity-60 transition-opacity"
                style={{ borderBottom: '1px solid currentColor', paddingBottom: '2px' }}>
                Confirma tu asistencia
              </span>
            </button>

          </div>
        </main>
      )}
    </>
  );
}
