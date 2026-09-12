export type InvitationMode = 'invitation' | 'confirm' | 'timeline';

export interface InvitationRoute {
  mode: InvitationMode;
  token: string;
}

export function invitationRouteFromPath(pathname: string): InvitationRoute | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] !== 'invitacion' || !segments[1]) return null;

  if (segments.length === 2) {
    return { mode: 'invitation', token: segments[1] };
  }

  if (segments.length === 3 && segments[2] === 'confirmar') {
    return { mode: 'confirm', token: segments[1] };
  }

  if (segments.length === 3 && segments[2] === 'timeline') {
    return { mode: 'timeline', token: segments[1] };
  }

  return null;
}

export function subscribeToInvitationPath(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

export function navigateInvitation(pathname: string, options?: { replace?: boolean }): void {
  const method = options?.replace ? 'replaceState' : 'pushState';
  window.history[method]({}, '', pathname);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
