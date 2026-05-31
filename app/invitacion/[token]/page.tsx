export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getGroupByTokenFromSheet, getExistingRSVP } from '@/app/lib/sheets';
import InvitacionClient from './InvitacionClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const group = await getGroupByTokenFromSheet(token);

  if (!group) return {};

  const names = group.adults.join(' y ');
  const title = `Invitación para: ${names}`;
  const description = 'Luis & Quetzalli · 19 de Diciembre 2026';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://luisyquetzalli.com/invitacion/${token}`,
      images: [
        {
          url: 'https://luisyquetzalli.com/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Luis & Quetzalli · 19 · 12 · 2026',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://luisyquetzalli.com/og-image.png'],
    },
  };
}

export default async function InvitacionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const group = await getGroupByTokenFromSheet(token);

  if (!group) notFound();

  const existing = await getExistingRSVP(token);
  if (existing !== null) {
    redirect(`/invitacion/${token}/confirmar`);
  }

  return <InvitacionClient group={group} />;
}
