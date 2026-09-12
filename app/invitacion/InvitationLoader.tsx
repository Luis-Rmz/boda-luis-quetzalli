'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import type { GuestGroup } from '@/app/data/guests';
import InvitacionClient from './[token]/InvitacionClient';
import ConfirmarClient from './[token]/confirmar/ConfirmarClient';
import TimelineClient, { type GiftDetails } from './[token]/timeline/TimelineClient';
import {
  invitationRouteFromPath,
  navigateInvitation,
  subscribeToInvitationPath,
  type InvitationMode,
} from './navigation';

interface Props {
  mode: InvitationMode;
}

interface RSVPResponse {
  ok: boolean;
  group?: GuestGroup;
  existingRSVP?: { attending: boolean } | null;
  gift?: GiftDetails | null;
}

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
    subscribeToInvitationPath,
    () => window.location.pathname,
    () => '',
  );
  const route = invitationRouteFromPath(pathname);
  const activeMode = route?.mode ?? mode;
  const token = route?.token ?? null;
  const requestKey = route ? `${route.mode}:${route.token}` : '';
  const [loaded, setLoaded] = useState<{ key: string; data: RSVPResponse } | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const data = loaded?.key === requestKey ? loaded.data : null;
  const failed = failedKey === requestKey;

  useEffect(() => {
    if (!pathname || !token) return;

    let cancelled = false;

    fetch(`/api/rsvp?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('request failed');
        return res.json() as Promise<RSVPResponse>;
      })
      .then((response) => {
        if (!cancelled) setLoaded({ key: requestKey, data: response });
      })
      .catch(() => {
        if (!cancelled) setFailedKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, requestKey, token]);

  if (failed || (pathname && !route)) {
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

  if (activeMode === 'timeline') {
    if (!data.existingRSVP?.attending) {
      return (
        <FrameMessage>
          <p className="font-cursive text-4xl sm:text-5xl text-black/85 animate-fade-up">
            Programa reservado
          </p>
          <p className="font-serif text-base text-black/45 leading-relaxed animate-fade-up">
            Confirma tu asistencia para consultar los detalles de la boda.
          </p>
          <button
            type="button"
            onClick={() => navigateInvitation(`/invitacion/${data.group!.token}/confirmar`)}
            className="border-b border-black/60 pb-1 font-cursive text-3xl text-black/80 transition-colors hover:text-salvia"
          >
            Confirmar asistencia
          </button>
        </FrameMessage>
      );
    }

    return <TimelineClient group={data.group} gift={data.gift ?? null} />;
  }

  if (activeMode === 'confirm') {
    return <ConfirmarClient group={data.group} existingRSVP={data.existingRSVP} />;
  }

  return <InvitacionClient group={data.group} />;
}
