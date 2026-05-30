'use client';

import { useState } from 'react';
import type { GuestGroup } from '@/app/data/guests';

interface Props {
  group: GuestGroup;
  existingRSVP?: { attending: boolean } | null;
}

type Step = 'confirm' | 'details' | 'done';

function fullNames(group: GuestGroup): string {
  const names = group.adults;
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} y ${names[1]}`;
  return names.slice(0, -1).join(', ') + ' y ' + names[names.length - 1];
}

export default function ConfirmarClient({ group, existingRSVP }: Props) {
  const [step, setStep] = useState<Step>(existingRSVP !== null && existingRSVP !== undefined ? 'done' : 'confirm');
  const [attending, setAttending] = useState<boolean | null>(existingRSVP?.attending ?? null);

  const [adultsAttending, setAdultsAttending] = useState<Record<string, boolean>>(
    Object.fromEntries(group.adults.map((n) => [n, true]))
  );
  const [childrenAttending, setChildrenAttending] = useState<Record<string, boolean>>(
    Object.fromEntries(group.children.map((n) => [n, true]))
  );
  const [bringPlusOne, setBringPlusOne] = useState(false);
  const [plusOneName, setPlusOneName] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleAdult = (name: string) =>
    setAdultsAttending((p) => ({ ...p, [name]: !p[name] }));
  const toggleChild = (name: string) =>
    setChildrenAttending((p) => ({ ...p, [name]: !p[name] }));

  const submit = async (
    att: boolean,
    adults: string[],
    children: string[],
    plusOne: string | undefined,
    notes: string
  ) => {
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: group.token,
          groupId: group.id,
          attending: att,
          adultsAttending: adults,
          childrenAttending: children,
          plusOneName: plusOne,
          restrictions: notes,
          submittedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error();
      setAttending(att);
      setStep('done');
    } catch {
      setError('Ocurrió un error. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNo = () => {
    setSubmitting(true);
    submit(false, [], [], undefined, '');
  };

  const handleYes = () => {
    setAttending(true);
    setStep('details');
  };

  const handleSubmitDetails = () => {
    if (bringPlusOne && !plusOneName.trim()) {
      setError('Por favor escribe el nombre de tu acompañante.');
      return;
    }
    setError('');
    setSubmitting(true);
    const confirmedAdults = Object.entries(adultsAttending).filter(([, v]) => v).map(([k]) => k);
    const confirmedChildren = Object.entries(childrenAttending).filter(([, v]) => v).map(([k]) => k);
    submit(true, confirmedAdults, confirmedChildren, bringPlusOne ? plusOneName.trim() : undefined, restrictions);
  };

  /* ─────────── DONE ─────────────────────────────────────── */
  if (step === 'done') {
    return (
      <main className="relative h-dvh flex flex-col items-center justify-center px-10 sm:px-14 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-5 sm:inset-7">
          <span className="absolute top-0 left-0    border-t border-l border-salvia/40 animate-corner" />
          <span className="absolute top-0 right-0   border-t border-r border-salvia/40 animate-corner" />
          <span className="absolute bottom-0 left-0  border-b border-l border-salvia/40 animate-corner" />
          <span className="absolute bottom-0 right-0 border-b border-r border-salvia/40 animate-corner" />
        </div>

        <div className="flex flex-col items-center gap-5 max-w-sm">
          <p className="font-serif text-xs tracking-[0.4em] uppercase text-black/35 animate-fade-up"
            style={{ animationDelay: '0.5s' }}>
            {attending ? 'Confirmado' : 'Recibido'}
          </p>

          <div className="flex items-center gap-4 w-4/5 animate-expand-x" style={{ animationDelay: '1s' }}>
            <div className="flex-1 h-px bg-black/20" />
            <span className="text-black/30 text-[9px]">◇</span>
            <div className="flex-1 h-px bg-black/20" />
          </div>

          {attending ? (
            <>
              <p className="font-cursive text-4xl sm:text-5xl text-black/85 animate-fade-up"
                style={{ animationDelay: '1.4s' }}>
                ¡Nos vemos pronto!
              </p>
              <p className="font-serif text-sm text-black/45 leading-relaxed animate-fade-up"
                style={{ animationDelay: '1.9s' }}>
                Es un honor tenerlos con nosotros en este momento tan especial.
              </p>
              <p className="font-serif text-xs text-salvia tracking-[0.2em] animate-fade-up"
                style={{ animationDelay: '2.2s' }}>
                19 · 12 · 2026
              </p>
              <p className="font-serif text-xs text-black/35 leading-relaxed animate-fade-up"
                style={{ animationDelay: '2.5s' }}>
                Próximamente compartiremos más detalles conforme se acerque la fecha.
              </p>
            </>
          ) : (
            <>
              <p className="font-cursive text-4xl sm:text-5xl text-black/85 animate-fade-up"
                style={{ animationDelay: '1.4s' }}>
                Gracias por avisarnos
              </p>
              <p className="font-serif text-sm text-black/45 leading-relaxed animate-fade-up"
                style={{ animationDelay: '1.9s' }}>
                Los tendremos muy presentes en nuestro día especial.
              </p>
            </>
          )}

          <div className="flex items-center gap-4 w-4/5 animate-expand-x" style={{ animationDelay: '2.9s' }}>
            <div className="flex-1 h-px bg-black/20" />
            <span className="text-black/30 text-[9px]">◇</span>
            <div className="flex-1 h-px bg-black/20" />
          </div>

          <p className="font-serif text-xs text-black/25 tracking-[0.25em] animate-fade-up"
            style={{ animationDelay: '3.2s' }}>
            LUIS &amp; QUETZALLI
          </p>
        </div>
      </main>
    );
  }

  /* ─────────── CONFIRM STEP ─────────────────────────────── */
  if (step === 'confirm') {
    return (
      <main className="relative h-dvh flex flex-col items-center justify-center px-10 sm:px-14 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-5 sm:inset-7">
          <span className="absolute top-0 left-0    border-t border-l border-salvia/40 animate-corner" />
          <span className="absolute top-0 right-0   border-t border-r border-salvia/40 animate-corner" />
          <span className="absolute bottom-0 left-0  border-b border-l border-salvia/40 animate-corner" />
          <span className="absolute bottom-0 right-0 border-b border-r border-salvia/40 animate-corner" />
        </div>

        <div className="flex flex-col items-center gap-5 w-full max-w-sm">

          <p className="font-serif text-xs tracking-[0.4em] uppercase text-black/35 animate-fade-up"
            style={{ animationDelay: '0.8s' }}>
            19 de Diciembre · 2026
          </p>

          <p className="font-cursive text-4xl sm:text-5xl md:text-6xl text-black/85 leading-tight animate-fade-up"
            style={{ animationDelay: '1.3s' }}>
            {fullNames(group)}
          </p>

          {group.children.length > 0 && (
            <div className="flex flex-col items-center gap-0.5 animate-fade-up" style={{ animationDelay: '1.7s' }}>
              {group.children.map((name) => (
                <p key={name} className="font-serif text-xs text-black/35 italic">{name}</p>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 w-4/5 animate-expand-x" style={{ animationDelay: '2.0s' }}>
            <div className="flex-1 h-px bg-black/20" />
            <span className="text-black/30 text-[9px]">◇</span>
            <div className="flex-1 h-px bg-black/20" />
          </div>

          <p className="font-serif text-sm text-black/50 tracking-wide animate-fade-up"
            style={{ animationDelay: '2.4s' }}>
            ¿Podrás acompañarnos?
          </p>

          <p className="font-serif text-xs text-black/35 tracking-wide animate-fade-up"
            style={{ animationDelay: '2.6s' }}>
            Confirma antes del 31 de julio
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full animate-fade-up" style={{ animationDelay: '2.9s' }}>
            <button
              onClick={handleYes}
              className="flex-1 py-3.5 px-6 border border-black/25 font-serif text-sm tracking-[0.2em] uppercase text-black/55 hover:bg-black/5 hover:border-black/35 active:bg-black/10 transition-all duration-300"
            >
              Sí, con gusto asistiré
            </button>
            <button
              onClick={handleNo}
              disabled={submitting}
              className="flex-1 py-3.5 px-6 border border-black/15 font-serif text-sm tracking-[0.2em] uppercase text-black/30 hover:border-black/25 hover:text-black/45 transition-all duration-300 disabled:opacity-40"
            >
              No podré asistir
            </button>
          </div>

        </div>
      </main>
    );
  }

  /* ─────────── DETAILS STEP ─────────────────────────────── */
  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-start px-8 sm:px-14 py-16 overflow-x-hidden">
      <div className="pointer-events-none absolute inset-5 sm:inset-7">
        <span className="absolute top-0 left-0    border-t border-l border-salvia/40 animate-corner" />
        <span className="absolute top-0 right-0   border-t border-r border-salvia/40 animate-corner" />
        <span className="absolute bottom-0 left-0  border-b border-l border-salvia/40 animate-corner" />
        <span className="absolute bottom-0 right-0 border-b border-r border-salvia/40 animate-corner" />
      </div>

      <div className="w-full max-w-sm flex flex-col gap-8 mt-4">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <p className="font-serif text-xs tracking-[0.4em] uppercase text-black/35">
            Detalles de asistencia
          </p>
          <div className="flex items-center gap-4 w-4/5">
            <div className="flex-1 h-px bg-black/20" />
            <span className="text-black/30 text-[9px]">◇</span>
            <div className="flex-1 h-px bg-black/20" />
          </div>
        </div>

        {/* Adults */}
        {group.adults.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="font-serif text-[10px] tracking-[0.3em] uppercase text-black/30 animate-fade-up"
              style={{ animationDelay: '0.7s' }}>
              ¿Quiénes asistirán?
            </p>
            {group.adults.map((name, i) => (
              <button
                key={name}
                type="button"
                onClick={() => toggleAdult(name)}
                className="flex items-center gap-3 w-full text-left animate-fade-up"
                style={{ animationDelay: `${0.85 + i * 0.15}s` }}
              >
                <span className={`w-4 h-4 border flex-shrink-0 transition-all duration-200 flex items-center justify-center
                  ${adultsAttending[name] ? 'border-salvia bg-salvia' : 'border-black/30'}`}>
                  {adultsAttending[name] && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span className={`font-serif text-sm transition-colors duration-200
                  ${adultsAttending[name] ? 'text-black/80' : 'text-black/30 line-through'}`}>
                  {name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Children */}
        {group.children.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="font-serif text-[10px] tracking-[0.3em] uppercase text-black/30 animate-fade-up"
              style={{ animationDelay: `${0.85 + group.adults.length * 0.15 + 0.2}s` }}>
              Niños
            </p>
            {group.children.map((name, i) => (
              <button
                key={name}
                type="button"
                onClick={() => toggleChild(name)}
                className="flex items-center gap-3 w-full text-left animate-fade-up"
                style={{ animationDelay: `${0.85 + group.adults.length * 0.15 + 0.35 + i * 0.15}s` }}
              >
                <span className={`w-4 h-4 border flex-shrink-0 transition-all duration-200 flex items-center justify-center
                  ${childrenAttending[name] ? 'border-salvia bg-salvia' : 'border-black/30'}`}>
                  {childrenAttending[name] && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span className={`font-serif text-sm italic transition-colors duration-200
                  ${childrenAttending[name] ? 'text-black/70' : 'text-black/25 line-through'}`}>
                  {name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* +1 */}
        {group.allowPlusOne && (
          <div className="flex flex-col gap-4 animate-fade-up"
            style={{ animationDelay: `${0.85 + (group.adults.length + group.children.length) * 0.15 + 0.4}s` }}>
            <p className="font-serif text-[10px] tracking-[0.3em] uppercase text-black/30">
              Acompañante
            </p>
            <button
              type="button"
              onClick={() => setBringPlusOne((p) => !p)}
              className="flex items-center gap-3 w-full text-left"
            >
              <span className={`w-4 h-4 border flex-shrink-0 transition-all duration-200 flex items-center justify-center
                ${bringPlusOne ? 'border-salvia bg-salvia' : 'border-black/30'}`}>
                {bringPlusOne && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <span className="font-serif text-sm text-black/75">Llevaré acompañante</span>
            </button>
            {bringPlusOne && (
              <input
                type="text"
                value={plusOneName}
                onChange={(e) => setPlusOneName(e.target.value)}
                placeholder="Nombre del acompañante"
                className="w-full border-b border-black/25 bg-transparent pb-2 font-serif text-sm text-black/75 placeholder:text-black/35 outline-none focus:border-black/55 transition-colors duration-300"
              />
            )}
          </div>
        )}

        {/* Restrictions */}
        <div className="flex flex-col gap-3 animate-fade-up"
          style={{ animationDelay: `${0.85 + (group.adults.length + group.children.length) * 0.15 + 0.6}s` }}>
          <p className="font-serif text-[10px] tracking-[0.3em] uppercase text-black/30">
            Restricciones alimentarias
          </p>
          <textarea
            value={restrictions}
            onChange={(e) => setRestrictions(e.target.value)}
            placeholder="Por favor especificar."
            rows={2}
            className="w-full border-b border-black/25 bg-transparent pb-2 font-serif text-sm text-black/70 placeholder:text-black/35 outline-none focus:border-black/55 transition-colors duration-300 resize-none"
          />
        </div>

        {error && (
          <p className="font-serif text-xs text-red-400 text-center animate-fade-up">{error}</p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 animate-expand-x"
          style={{ animationDelay: `${0.85 + (group.adults.length + group.children.length) * 0.15 + 0.8}s` }}>
          <div className="flex-1 h-px bg-black/20" />
          <span className="text-black/30 text-[9px]">◇</span>
          <div className="flex-1 h-px bg-black/20" />
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-3 animate-fade-up"
          style={{ animationDelay: `${0.85 + (group.adults.length + group.children.length) * 0.15 + 1.0}s` }}>
          <button
            onClick={handleSubmitDetails}
            disabled={submitting}
            className="w-full py-3.5 bg-black/85 text-white font-serif text-sm tracking-[0.25em] uppercase hover:bg-black transition-colors duration-300 disabled:opacity-40"
          >
            {submitting ? 'Enviando…' : 'Confirmar asistencia'}
          </button>
          <button
            onClick={() => setStep('confirm')}
            className="text-center font-serif text-xs text-black/45 tracking-[0.15em] uppercase hover:text-black/65 transition-colors duration-200"
          >
            ← Volver
          </button>
        </div>

      </div>
    </main>
  );
}
