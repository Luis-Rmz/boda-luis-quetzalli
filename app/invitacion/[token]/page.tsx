import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getGroupByToken, GUEST_GROUPS } from '@/app/data/guests';
import InvitacionClient from './InvitacionClient';

export function generateStaticParams() {
  return GUEST_GROUPS.map((group) => ({ token: group.token }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const group = getGroupByToken(token);

  if (!group) return {};

  const names = group.adults.join(' y ');
  const title = 'Luis & Quetzalli';
  const description = `Invitación para: ${names}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://luisyquetzalli.com/invitacion/${token}`,
      images: [
        {
          url: 'https://luisyquetzalli.com/L&Q.png',
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
      images: ['https://luisyquetzalli.com/L&Q.png'],
    },
  };
}

export default async function InvitacionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const group = getGroupByToken(token);

  if (!group) notFound();

  return <InvitacionClient group={group} />;
}
