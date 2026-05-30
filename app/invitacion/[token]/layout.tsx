import { AudioProvider } from '@/app/invitacion/AudioContext';

export default function InvitacionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AudioProvider>{children}</AudioProvider>;
}
