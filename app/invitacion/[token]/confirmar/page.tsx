export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getGroupByTokenFromSheet, getExistingRSVP } from '@/app/lib/sheets';
import ConfirmarClient from './ConfirmarClient';

export default async function ConfirmarPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const group = await getGroupByTokenFromSheet(token);

  if (!group) notFound();

  const existing = await getExistingRSVP(token);

  return <ConfirmarClient group={group} existingRSVP={existing} />;
}
