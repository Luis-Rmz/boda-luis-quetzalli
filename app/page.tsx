'use client';

import { useState } from 'react';
import EntranceOverlay from './components/EntranceOverlay';

function Invitation() {
  return (
    <main className="relative h-dvh flex flex-col items-center justify-center px-10 sm:px-14 py-10 sm:py-14 text-center overflow-hidden">

      {/* Marco dibujado desde las 4 esquinas */}
      <div className="pointer-events-none absolute inset-5 sm:inset-7">
        <span className="absolute top-0 left-0    border-t border-l border-black/25 animate-corner" style={{ animationDelay: '0s' }} />
        <span className="absolute top-0 right-0   border-t border-r border-black/25 animate-corner" style={{ animationDelay: '0s' }} />
        <span className="absolute bottom-0 left-0  border-b border-l border-black/25 animate-corner" style={{ animationDelay: '0s' }} />
        <span className="absolute bottom-0 right-0 border-b border-r border-black/25 animate-corner" style={{ animationDelay: '0s' }} />
      </div>

      <div className="w-full max-w-md flex flex-col items-center">

        <p className="text-xs tracking-[0.4em] uppercase font-serif text-black/40 mb-2 sm:mb-4 animate-fade-up"
          style={{ animationDelay: '4.5s' }}>
          Te invitamos a celebrar
        </p>

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

        <div className="flex items-center gap-4 my-2 sm:my-4 w-4/5">
          <div className="flex-1 h-px bg-black/20 animate-expand-x" style={{ animationDelay: '7.0s' }} />
          <span className="text-black/30 text-[10px] animate-fade-up" style={{ animationDelay: '7.3s' }}>◇</span>
          <div className="flex-1 h-px bg-black/20 animate-expand-x" style={{ animationDelay: '7.0s' }} />
        </div>

        <img src="/building.svg" alt="Academia Renacimiento y Trinitate"
          className="w-32 sm:w-44 md:w-52 h-auto mix-blend-multiply opacity-85 animate-fade-up"
          style={{ animationDelay: '7.8s' }} />

        <div className="flex items-center gap-4 my-2 sm:my-4 w-4/5">
          <div className="flex-1 h-px bg-black/20 animate-expand-x" style={{ animationDelay: '8.5s' }} />
          <span className="text-black/30 text-[10px] animate-fade-up" style={{ animationDelay: '8.8s' }}>◇</span>
          <div className="flex-1 h-px bg-black/20 animate-expand-x" style={{ animationDelay: '8.5s' }} />
        </div>

        <p className="text-xs sm:text-sm tracking-[0.35em] uppercase font-serif text-black/60 animate-fade-up"
          style={{ animationDelay: '9.2s' }}>
          19 de Diciembre, 2026
        </p>

        <p className="text-sm sm:text-base font-serif italic text-salvia mt-1 mb-3 sm:mb-5 animate-fade-up"
          style={{ animationDelay: '9.7s' }}>
          Academia Renacimiento y Trinitate
        </p>

        {/* CTA */}
        <button
          type="button"
          className="animate-fade-up group cursor-pointer"
          style={{ animationDelay: '10.3s', background: 'none', border: 'none', padding: 0 }}
        >
          <span className="text-3xl sm:text-4xl md:text-5xl font-cursive text-black group-hover:opacity-60 transition-opacity"
            style={{ borderBottom: '1px solid currentColor', paddingBottom: '2px' }}>
            Confirma tu asistencia
          </span>
        </button>

      </div>
    </main>
  );
}

export default function Home() {
  const [entered, setEntered] = useState(false);

  return (
    <>
      <EntranceOverlay onComplete={() => setEntered(true)} />
      {entered && <Invitation />}
    </>
  );
}
