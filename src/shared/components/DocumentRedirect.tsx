import { useEffect } from 'react';
import { navigateToDocument } from '@/shared/lib/document-navigation';
import { LoadingScreen } from './LoadingScreen';

interface DocumentRedirectProps {
  /** Same-origin document path served by another HTML entry. */
  to: string;
  /** Replace the current history entry, so Back does not return here. */
  shouldReplace?: boolean;
}

/** Leaves this entry with a full page load; shows the loading screen meanwhile. */
export function DocumentRedirect({ to, shouldReplace = false }: DocumentRedirectProps) {
  useEffect(() => {
    navigateToDocument(to, shouldReplace ? 'replace' : 'push');
  }, [to, shouldReplace]);

  return <LoadingScreen />;
}
