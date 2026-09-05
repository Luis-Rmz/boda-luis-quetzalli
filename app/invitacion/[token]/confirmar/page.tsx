import { notFound } from 'next/navigation';
import { getGroupByToken, GUEST_GROUPS } from '@/app/data/guests';
import ConfirmarClient from './ConfirmarClient';

export function generateStaticParams() {
  return GUEST_GROUPS.map((group) => ({ token: group.token }));
}

export const dynamicParams = false;

export default async function ConfirmarPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const group = getGroupByToken(token);

  if (!group) notFound();

  return <ConfirmarClient group={group} />;
}
