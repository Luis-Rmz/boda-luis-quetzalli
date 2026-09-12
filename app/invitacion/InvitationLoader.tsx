'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import type { GuestGroup } from '@/app/data/guests';
import InvitacionClient from './[token]/InvitacionClient';
import ConfirmarClient from './[token]/confirmar/ConfirmarClient';
import TimelineClient, { type GiftDetails } from './[token]/timeline/TimelineClient';

interface Props {
  mode: 'invitation' | 'confirm' | 'timeline';
}

interface RSVPResponse {
  ok: boolean;
  group?: GuestGroup;
  existingRSVP?: { attending: boolean } | null;
  gift?: GiftDetails | null;
}

function tokenFromPath(pathname: string, mode: Props['mode']): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] !== 'invitacion') return null;
  if (mode === 'confirm' && segments[2] !== 'confirmar') return null;
  if (mode === 'timeline' && segments[2] !== 'timeline') return null;
  return segments[1] ?? null;
}

const subscribeToPathname = () => () => undefined;

function FrameMessage({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative h-dvh flex flex-col items-center justify-center px-10 sm:px-14 text-center overflow-hidden">
      <div className="pointer-events-none absolute inset-5 sm:inset-7">
        <span className="absolute top-0 left-0 border-t border-l border-salvia/40 animate-corner" />
        <span className="absolute top-0 right-0 border-t border-r border-salvia/40 animate-corner" />
        <span className="absolute bottom-0 left-0 border-b border-l border-salvia/40 animate-corner" />
        <span className="absolute bottom-0 right-0 border-b border-r border-salvia/40 animate-corner" />
      </div>
      <div className="flex flex-col items-center gap-5 max-w-sm">
        <div className="flex items-center gap-4 w-4/5 animate-expand-x">
          <div className="flex-1 h-px bg-black/20" />
          <span className="text-black/30 text-[11px]">◇</span>
          <div className="flex-1 h-px bg-black/20" />
        </div>
        {children}
        <p className="font-serif text-[13px] text-black/25 tracking-[0.25em] animate-fade-up">
          LUIS &amp; QUETZALLI
        </p>
      </div>
    </main>
  );
}

export default function InvitationLoader({ mode }: Props) {
  const pathname = useSyncExternalStore(
    subscribeToPathname,
    () => window.location.pathname,
    () => '',
  );
  const token = tokenFromPath(pathname, mode);
  const [data, setData] = useState<RSVPResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!pathname || !token) return;

    let cancelled = false;

    fetch(`/api/rsvp?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('request failed');
        return res.json() as Promise<RSVPResponse>;
      })
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, token]);

  if (failed || (pathname && !token)) {
    return (
      <FrameMessage>
        <p className="font-cursive text-4xl sm:text-5xl text-black/85 animate-fade-up">
          Invitación no encontrada
        </p>
        <p className="font-serif text-base text-black/45 leading-relaxed animate-fade-up">
          Revisa que el enlace esté completo.
        </p>
      </FrameMessage>
    );
  }

  if (!data) {
    return (
      <FrameMessage>
        <p className="font-serif text-[13px] tracking-[0.4em] uppercase text-black/35 animate-fade-up">
          Cargando invitación
        </p>
      </FrameMessage>
    );
  }

  if (!data.group) {
    return (
      <FrameMessage>
        <p className="font-cursive text-4xl sm:text-5xl text-black/85 animate-fade-up">
          Invitación no encontrada
        </p>
        <p className="font-serif text-base text-black/45 leading-relaxed animate-fade-up">
          Revisa que el enlace esté completo.
        </p>
      </FrameMessage>
    );
  }

  if (mode === 'timeline') {
    if (!data.existingRSVP?.attending) {
      return (
        <FrameMessage>
          <p className="font-cursive text-4xl sm:text-5xl text-black/85 animate-fade-up">
            Programa reservado
          </p>
          <p className="font-serif text-base text-black/45 leading-relaxed animate-fade-up">
            Confirma tu asistencia para consultar los detalles de la boda.
          </p>
          <a
            href={`/invitacion/${data.group.token}/confirmar`}
            className="border-b border-black/60 pb-1 font-cursive text-3xl text-black/80 transition-colors hover:text-salvia"
          >
            Confirmar asistencia
          </a>
        </FrameMessage>
      );
    }

    return <TimelineClient group={data.group} gift={data.gift ?? null} />;
  }

  if (mode === 'confirm') {
    return <ConfirmarClient group={data.group} existingRSVP={data.existingRSVP} />;
  }

  return <InvitacionClient group={data.group} />;
}
