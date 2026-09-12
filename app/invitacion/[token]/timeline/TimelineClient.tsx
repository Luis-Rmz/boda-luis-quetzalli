'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Check, Copy, ExternalLink, Gift, MapPin } from 'lucide-react';
import QRCode from 'qrcode';
import type { GuestGroup } from '@/app/data/guests';

export interface GiftDetails {
  paymentUrl?: string;
  revtag?: string;
  clabe?: string;
  beneficiary?: string;
  bankName?: string;
  transferConcept?: string;
  registryUrl?: string;
}

interface Props {
  group: GuestGroup;
  gift: GiftDetails | null;
}

const schedule = [
  {
    time: '1:00 PM',
    title: 'Misa',
    place: 'Templo de Nuestro Señor Redentor "El Mezquitito"',
    location: 'Centro · León, Guanajuato',
    mapsQuery: 'Templo de Nuestro Señor Redentor El Mezquitito, Pedro Moreno 610, Centro, 37000 León de los Aldama, Guanajuato',
  },
  {
    time: '3:00 PM',
    title: 'Recepción',
    place: 'Academia Renacimiento y Trinitate Philharmonia',
    location: 'Los Ramírez · León, Guanajuato',
    mapsQuery: 'Academia Renacimiento y Trinitate Philharmonia, La Trinidad 101, Los Ramírez, 37680 León de los Aldama, Guanajuato',
  },
] as const;

function googleMapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function FormalAttireIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 40"
      width="48"
      height="30"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-salvia"
    >
      <path d="M5 5l11 7L11 18 7 8M27 5l-11 7 5 6 4-10" />
      <path d="M13 14l3-2 3 2-2 5 4 15-5 4-5-4 4-15-2-5Z" />
      <path d="M42 8l5-5 5 5-3 10 9 18H36l9-18-3-10Z" />
      <path d="M42 8c2 2 8 2 10 0M41 23h12" />
    </svg>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex min-h-11 items-center justify-center gap-2 border border-black/20 px-4 font-serif text-xs uppercase tracking-[0.18em] text-black/60 transition-colors hover:border-salvia hover:text-salvia"
      aria-label={`Copiar ${label}`}
    >
      {copied ? <Check aria-hidden="true" size={15} /> : <Copy aria-hidden="true" size={15} />}
      {copied ? 'Copiado' : `Copiar ${label}`}
    </button>
  );
}

export default function TimelineClient({ group, gift }: Props) {
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    if (!gift?.paymentUrl) return;

    let cancelled = false;
    QRCode.toDataURL(gift.paymentUrl, {
      width: 320,
      margin: 2,
      color: { dark: '#1f211b', light: '#f6f4f0' },
      errorCorrectionLevel: 'M',
    }).then((url) => {
      if (!cancelled) setQrCode(url);
    }).catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [gift?.paymentUrl]);

  const firstName = group.adults[0]?.split(' ')[0];
  const hasGiftDetails = Boolean(gift?.paymentUrl || gift?.clabe || gift?.revtag || gift?.registryUrl);

  return (
    <main className="relative h-dvh overflow-hidden text-center">
      <div className="pointer-events-none absolute inset-5 z-20 border border-salvia/40 sm:inset-7" />

      <div className="absolute inset-[21px] overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:thin] sm:inset-[29px]">
      <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col items-center px-6 py-10 sm:px-9 sm:py-12">
        <header className="flex flex-col items-center animate-fade-up">
          <p className="font-serif text-[11px] uppercase tracking-[0.42em] text-black/40 sm:text-xs">
            Luis &amp; Quetzalli
          </p>
          <h1 className="mt-3 font-cursive text-6xl leading-none text-black/90 sm:text-7xl">
            Programa
          </h1>
          <p className="mt-5 font-serif text-xs uppercase tracking-[0.3em] text-salvia sm:text-sm">
            19 de diciembre de 2026
          </p>
          {firstName && (
            <p className="mt-3 font-serif text-sm italic text-black/40">
              Nos alegra compartir este día contigo, {firstName}.
            </p>
          )}
        </header>

        <div className="my-9 flex w-full max-w-md items-center gap-4 animate-expand-x">
          <div className="h-px flex-1 bg-black/20" />
          <span className="text-[11px] text-black/30">◇</span>
          <div className="h-px flex-1 bg-black/20" />
        </div>

        <ol className="relative w-full max-w-lg py-2 before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:bg-black/35">
          {schedule.map((item, index) => {
            const isLeft = index % 2 === 1;

            return (
              <li
                key={`${item.time}-${item.title}`}
                className="grid min-h-52 grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] items-center sm:min-h-56 sm:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)]"
              >
                <div className={isLeft ? 'col-start-1 text-right' : 'col-start-3 text-left'}>
                  <p className="font-serif text-xs uppercase tracking-[0.26em] text-black/75 sm:text-sm">
                    {item.time}
                  </p>
                  <p className="mt-1 font-serif text-sm uppercase tracking-[0.2em] text-black/55 sm:text-base">
                    {item.title}
                  </p>
                  <p className="mt-3 font-serif text-sm leading-snug text-black/65">
                    {item.place}
                  </p>
                  <p className="mt-1 font-serif text-xs italic leading-snug text-black/40">
                    {item.location}
                  </p>
                  <a
                    href={googleMapsUrl(item.mapsQuery)}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-4 inline-flex min-h-10 items-center gap-2 border-b border-black/30 pb-1 font-serif text-[11px] uppercase tracking-[0.14em] text-black/55 transition-colors hover:border-salvia hover:text-salvia ${isLeft ? 'justify-end' : 'justify-start'}`}
                    aria-label={`Ver ubicación de ${item.place} en Google Maps`}
                  >
                    <MapPin aria-hidden="true" size={14} strokeWidth={1.5} />
                    Ver ubicación
                  </a>
                </div>
                <span
                  className={`col-start-2 row-start-1 h-px w-4 bg-black/45 sm:w-6 ${isLeft ? 'justify-self-start' : 'justify-self-end'}`}
                  aria-hidden="true"
                />
              </li>
            );
          })}
        </ol>

        <div className="my-10 flex w-full max-w-md items-center gap-4">
          <div className="h-px flex-1 bg-black/20" />
          <span className="text-[11px] text-black/30">◇</span>
          <div className="h-px flex-1 bg-black/20" />
        </div>

        <section className="flex w-full max-w-lg flex-col items-center pb-10">
          <FormalAttireIcon />
          <p className="mt-5 font-serif text-[11px] uppercase tracking-[0.4em] text-black/40 sm:text-xs">
            Código de vestimenta
          </p>
          <h2 className="mt-3 font-cursive text-5xl leading-none text-black/90 sm:text-6xl">
            Formal
          </h2>
          <p className="mt-5 max-w-sm font-serif text-base leading-relaxed text-black/50">
            Traje o vestido formal.
          </p>
        </section>

        <div className="mb-10 flex w-full max-w-md items-center gap-4">
          <div className="h-px flex-1 bg-black/20" />
          <span className="text-[11px] text-black/30">◇</span>
          <div className="h-px flex-1 bg-black/20" />
        </div>

        <section className="flex w-full max-w-lg flex-col items-center pb-10">
          <Gift aria-hidden="true" className="text-salvia" size={24} strokeWidth={1.25} />
          <p className="mt-5 font-serif text-[11px] uppercase tracking-[0.4em] text-black/40 sm:text-xs">
            Regalos
          </p>
          <h2 className="mt-3 font-cursive text-5xl leading-none text-black/90 sm:text-6xl">
            Nuestra luna de miel
          </h2>
          <p className="mt-5 max-w-md font-serif text-base leading-relaxed text-black/50">
            Ustedes son lo más importante para nosotros y compartir este día juntos es nuestro
            mejor regalo. Si desean contribuir a nuestra luna de miel, recibiremos su detalle
            con muchísimo cariño.
          </p>
          <p className="mt-3 max-w-md font-serif text-sm leading-relaxed text-black/40">
            También habrá sobres disponibles durante la recepción para quienes prefieran
            obsequiar en efectivo.
          </p>

          {hasGiftDetails ? (
            <div className="mt-8 flex w-full flex-col items-center gap-5">
              {qrCode && (
                // A generated QR keeps account details out of the static site bundle.
                <Image
                  src={qrCode}
                  alt="Código QR para contribuir mediante Revolut"
                  width={176}
                  height={176}
                  unoptimized
                  className="h-44 w-44"
                />
              )}

              {gift?.paymentUrl && (
                <a
                  href={gift.paymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 bg-black/85 px-6 font-serif text-sm uppercase tracking-[0.2em] text-crema transition-colors hover:bg-black"
                >
                  Abrir Revolut
                  <ExternalLink aria-hidden="true" size={15} />
                </a>
              )}

              {gift?.revtag && (
                <p className="font-serif text-sm text-black/45">
                  Revtag <span className="text-black/75">@{gift.revtag.replace(/^@/, '')}</span>
                </p>
              )}

              {gift?.clabe && (
                <div className="mt-2 flex w-full flex-col items-center gap-3 border-t border-black/15 pt-6">
                  <p className="font-serif text-[11px] uppercase tracking-[0.3em] text-black/35">
                    Transferencia desde cualquier banco
                  </p>
                  <p className="max-w-sm font-serif text-sm leading-relaxed text-black/45">
                    En la app de tu banco, agrega una cuenta mediante SPEI con los siguientes datos.
                  </p>
                  {gift.bankName && (
                    <p className="font-serif text-sm text-black/55">
                      Banco <span className="text-black/75">{gift.bankName}</span>
                    </p>
                  )}
                  {gift.beneficiary && (
                    <div>
                      <p className="font-serif text-[10px] uppercase tracking-[0.22em] text-black/30">
                        Beneficiarios
                      </p>
                      <p className="mt-1 font-serif text-sm text-black/65">{gift.beneficiary}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-serif text-[10px] uppercase tracking-[0.22em] text-black/30">
                      CLABE
                    </p>
                    <p className="mt-1 break-all font-serif text-base tracking-[0.1em] text-black/75">
                      {gift.clabe}
                    </p>
                  </div>
                  <CopyButton value={gift.clabe} label="CLABE" />
                  {gift.transferConcept && (
                    <div className="mt-2">
                      <p className="font-serif text-[10px] uppercase tracking-[0.22em] text-black/30">
                        Concepto sugerido
                      </p>
                      <p className="mt-1 font-serif text-sm text-black/65">{gift.transferConcept}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5 flex w-full flex-col items-center gap-4 border-t border-black/15 pt-7">
                <p className="font-serif text-[11px] uppercase tracking-[0.35em] text-black/40">
                  Mesa de regalos
                </p>
                {gift?.registryUrl ? (
                  <a
                    href={gift.registryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 border border-black/20 px-5 font-serif text-xs uppercase tracking-[0.18em] text-black/60 transition-colors hover:border-salvia hover:text-salvia"
                  >
                    Ver mesa de regalos
                    <ExternalLink aria-hidden="true" size={14} />
                  </a>
                ) : (
                  <p className="font-serif text-xs uppercase tracking-[0.24em] text-black/35">
                    Próximamente compartiremos el enlace
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-7 font-serif text-xs uppercase tracking-[0.25em] text-black/35">
              Próximamente compartiremos las opciones
            </p>
          )}
        </section>

        <p className="pb-7 font-serif text-[11px] uppercase tracking-[0.28em] text-black/25">
          León, Guanajuato · 19 · 12 · 2026
        </p>
      </div>
      </div>
    </main>
  );
}
