import { useEffect } from 'react';
import { useLocation } from 'react-router';

/** Resets scroll on a new page, not on search param changes, so pagination does not jump. */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
