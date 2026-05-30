export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getGroupByToken } from '@/app/data/guests';
import { getExistingRSVP } from '@/app/lib/sheets';
import ConfirmarClient from './ConfirmarClient';

export default async function ConfirmarPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const group = getGroupByToken(token);

  if (!group) notFound();

  // Si ya respondió, mostrar directamente la pantalla final
  const existing = await getExistingRSVP(token);

  return <ConfirmarClient group={group} existingRSVP={existing} />;
}
