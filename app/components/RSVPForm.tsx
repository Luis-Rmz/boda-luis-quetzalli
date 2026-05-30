'use client';

import { useState } from 'react';
import type { GuestGroup } from '@/app/data/guests';

interface Props {
  group: GuestGroup;
}

type Step = 'confirm' | 'details' | 'done';

export default function RSVPForm({ group }: Props) {
  const [step, setStep] = useState<Step>('confirm');
  const [attending, setAttending] = useState<boolean | null>(null);

  // Which adults confirmed attendance
  const [adultsAttending, setAdultsAttending] = useState<Record<string, boolean>>(
    Object.fromEntries(group.adults.map((n) => [n, true]))
  );
  // Which children confirmed
  const [childrenAttending, setChildrenAttending] = useState<Record<string, boolean>>(
    Object.fromEntries(group.children.map((n) => [n, true]))
  );
  // +1
  const [bringPlusOne, setBringPlusOne] = useState(false);
  const [plusOneName, setPlusOneName] = useState('');
  // Restrictions
  const [restrictions, setRestrictions] = useState('');
  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleAdult = (name: string) =>
    setAdultsAttending((prev) => ({ ...prev, [name]: !prev[name] }));

  const toggleChild = (name: string) =>
    setChildrenAttending((prev) => ({ ...prev, [name]: !prev[name] }));

  const handleNotAttending = async () => {
    setSubmitting(true);
    await submit(false, [], [], undefined, '');
  };

  const handleSubmitDetails = async () => {
    if (bringPlusOne && !plusOneName.trim()) {
      setError('Por favor escribe el nombre de tu acompañante.');
      return;
    }
    setError('');
    setSubmitting(true);
    const confirmedAdults = Object.entries(adultsAttending)
      .filter(([, v]) => v).map(([k]) => k);
    const confirmedChildren = Object.entries(childrenAttending)
      .filter(([, v]) => v).map(([k]) => k);
    await submit(true, confirmedAdults, confirmedChildren, bringPlusOne ? plusOneName.trim() : undefined, restrictions);
  };

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
      if (!res.ok) throw new Error('server error');
      setStep('done');
    } catch {
      setError('Ocurrió un error. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── DONE ─────────────────────────────────────────────── */
  if (step === 'done') {
    return (
      <div className="flex flex-col items-center text-center py-10 px-6 gap-6">
        <div className="flex items-center gap-4 w-4/5 max-w-xs">
          <div className="flex-1 h-px bg-black/20" />
          <span className="text-black/30 text-[10px]">◇</span>
          <div className="flex-1 h-px bg-black/20" />
        </div>
        {attending !== false ? (
          <>
            <p className="font-serif text-xs tracking-[0.35em] uppercase text-black/40">
              ¡Nos vemos pronto!
            </p>
            <p className="font-cursive text-3xl sm:text-4xl text-black/80 leading-tight">
              Gracias por confirmar
            </p>
            <p className="font-serif text-sm text-black/50 max-w-xs leading-relaxed">
              Estamos muy felices de que sean parte de este día tan especial para nosotros.
            </p>
          </>
        ) : (
          <>
            <p className="font-serif text-xs tracking-[0.35em] uppercase text-black/40">
              Recibido
            </p>
            <p className="font-cursive text-3xl sm:text-4xl text-black/80 leading-tight">
              Gracias por avisarnos
            </p>
            <p className="font-serif text-sm text-black/50 max-w-xs leading-relaxed">
              Los tendremos presentes en nuestro día especial.
            </p>
          </>
        )}
        <div className="flex items-center gap-4 w-4/5 max-w-xs">
          <div className="flex-1 h-px bg-black/20" />
          <span className="text-black/30 text-[10px]">◇</span>
          <div className="flex-1 h-px bg-black/20" />
        </div>
      </div>
    );
  }

  /* ── CONFIRM STEP ─────────────────────────────────────── */
  if (step === 'confirm') {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-8 px-6">
        <p className="font-serif text-xs tracking-[0.35em] uppercase text-black/40">
          Confirma tu asistencia
        </p>

        {/* Guest names */}
        <div className="flex flex-col items-center gap-1">
          {group.adults.map((name) => (
            <p key={name} className="font-serif text-lg sm:text-xl text-black/80 tracking-wide">
              {name}
            </p>
          ))}
          {group.children.map((name) => (
            <p key={name} className="font-serif text-base text-black/50 italic">
              {name}
            </p>
          ))}
          {group.allowPlusOne && (
            <p className="font-serif text-sm text-salvia italic mt-1">+ acompañante</p>
          )}
        </div>

        <div className="flex items-center gap-4 w-3/5">
          <div className="flex-1 h-px bg-black/15" />
          <span className="text-black/20 text-[9px]">◇</span>
          <div className="flex-1 h-px bg-black/15" />
        </div>

        {/* Yes / No */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <button
            onClick={() => { setAttending(true); setStep('details'); }}
            className="flex-1 py-3 px-6 border border-black/20 font-serif text-sm tracking-[0.2em] uppercase text-black/70 hover:bg-black/5 hover:border-black/40 transition-all duration-300"
          >
            Sí, asistiré
          </button>
          <button
            onClick={() => { setAttending(false); handleNotAttending(); }}
            disabled={submitting}
            className="flex-1 py-3 px-6 border border-black/10 font-serif text-sm tracking-[0.2em] uppercase text-black/35 hover:border-black/25 hover:text-black/50 transition-all duration-300 disabled:opacity-40"
          >
            No podré asistir
          </button>
        </div>
      </div>
    );
  }

  /* ── DETAILS STEP ─────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-7 py-8 px-6 max-w-sm mx-auto w-full">

      <p className="font-serif text-xs tracking-[0.35em] uppercase text-black/40 text-center">
        Detalles de tu asistencia
      </p>

      {/* Adults */}
      {group.adults.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="font-serif text-[10px] tracking-[0.3em] uppercase text-black/35">
            ¿Quiénes asistirán?
          </p>
          {group.adults.map((name) => (
            <label key={name} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => toggleAdult(name)}
                className={`w-4 h-4 border flex-shrink-0 transition-all duration-200 cursor-pointer flex items-center justify-center
                  ${adultsAttending[name] ? 'border-salvia bg-salvia' : 'border-black/25 bg-transparent'}`}
              >
                {adultsAttending[name] && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className={`font-serif text-sm transition-colors duration-200 ${adultsAttending[name] ? 'text-black/80' : 'text-black/30 line-through'}`}>
                {name}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Children */}
      {group.children.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="font-serif text-[10px] tracking-[0.3em] uppercase text-black/35">
            Niños
          </p>
          {group.children.map((name) => (
            <label key={name} className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => toggleChild(name)}
                className={`w-4 h-4 border flex-shrink-0 transition-all duration-200 cursor-pointer flex items-center justify-center
                  ${childrenAttending[name] ? 'border-salvia bg-salvia' : 'border-black/25 bg-transparent'}`}
              >
                {childrenAttending[name] && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className={`font-serif text-sm italic transition-colors duration-200 ${childrenAttending[name] ? 'text-black/60' : 'text-black/25 line-through'}`}>
                {name}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* +1 */}
      {group.allowPlusOne && (
        <div className="flex flex-col gap-3">
          <p className="font-serif text-[10px] tracking-[0.3em] uppercase text-black/35">
            Acompañante
          </p>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setBringPlusOne((p) => !p)}
              className={`w-4 h-4 border flex-shrink-0 transition-all duration-200 cursor-pointer flex items-center justify-center
                ${bringPlusOne ? 'border-salvia bg-salvia' : 'border-black/25 bg-transparent'}`}
            >
              {bringPlusOne && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className="font-serif text-sm text-black/70">Llevaré acompañante</span>
          </label>
          {bringPlusOne && (
            <input
              type="text"
              value={plusOneName}
              onChange={(e) => setPlusOneName(e.target.value)}
              placeholder="Nombre del acompañante"
              className="mt-1 w-full border-b border-black/20 bg-transparent pb-2 font-serif text-sm text-black/70 placeholder:text-black/25 outline-none focus:border-black/50 transition-colors duration-200"
            />
          )}
        </div>
      )}

      {/* Restrictions */}
      <div className="flex flex-col gap-3">
        <p className="font-serif text-[10px] tracking-[0.3em] uppercase text-black/35">
          Restricciones alimentarias
        </p>
        <textarea
          value={restrictions}
          onChange={(e) => setRestrictions(e.target.value)}
          placeholder="Alergias, preferencias vegetarianas, etc. (opcional)"
          rows={3}
          className="w-full border-b border-black/20 bg-transparent pb-2 font-serif text-sm text-black/70 placeholder:text-black/25 outline-none focus:border-black/50 transition-colors duration-200 resize-none"
        />
      </div>

      {error && (
        <p className="font-serif text-xs text-red-400 text-center">{error}</p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmitDetails}
        disabled={submitting}
        className="w-full py-3 bg-black/85 text-white font-serif text-sm tracking-[0.25em] uppercase hover:bg-black transition-colors duration-300 disabled:opacity-40"
      >
        {submitting ? 'Enviando…' : 'Confirmar asistencia'}
      </button>

      <button
        onClick={() => setStep('confirm')}
        className="text-center font-serif text-xs text-black/30 tracking-[0.15em] uppercase hover:text-black/50 transition-colors duration-200"
      >
        ← Volver
      </button>

    </div>
  );
}
