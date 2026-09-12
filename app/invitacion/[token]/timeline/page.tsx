import { GUEST_GROUPS } from '@/app/data/guests';
import InvitationLoader from '../../InvitationLoader';

export function generateStaticParams() {
  return GUEST_GROUPS.map((group) => ({ token: group.token }));
}

export const dynamicParams = false;

export default function TimelinePage() {
  return <InvitationLoader mode="timeline" />;
}
