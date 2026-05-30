export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { getGroupByToken } from '@/app/data/guests';
import { getExistingRSVP } from '@/app/lib/sheets';
import InvitacionClient from './InvitacionClient';

export default async function InvitacionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const group = getGroupByToken(token);

  if (!group) notFound();

  // Si ya respondió, mandarlo directo a la pantalla de confirmación
  const existing = await getExistingRSVP(token);
  if (existing !== null) {
    redirect(`/invitacion/${token}/confirmar`);
  }

  return <InvitacionClient group={group} />;
}
