'use client';

import { useEffect, useMemo, useState } from 'react';
import type { GuestGroup } from '@/app/data/guests';
import InvitacionClient from './[token]/InvitacionClient';
import ConfirmarClient from './[token]/confirmar/ConfirmarClient';

interface Props {
  mode: 'invitation' | 'confirm';
}

interface RSVPResponse {
  ok: boolean;
  group?: GuestGroup;
  existingRSVP?: { attending: boolean } | null;
}

function tokenFromPath(pathname: string, mode: Props['mode']): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] !== 'invitacion') return null;
  if (mode === 'confirm' && segments[2] !== 'confirmar') return null;
  return segments[1] ?? null;
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
  const [pathname, setPathname] = useState('');
  const token = useMemo(() => tokenFromPath(pathname, mode), [mode, pathname]);
  const [data, setData] = useState<RSVPResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  useEffect(() => {
    if (!pathname) return;

    if (!token) {
      setFailed(true);
      return;
    }

    let cancelled = false;
    setData(null);
    setFailed(false);

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

  if (mode === 'confirm') {
    return <ConfirmarClient group={data.group} existingRSVP={data.existingRSVP} />;
  }

  return <InvitacionClient group={data.group} />;
}
