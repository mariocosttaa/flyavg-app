/**
 * Full page load, for paths served by another HTML entry (portal and admin).
 * Kept in its own module so tests can replace the browser navigation.
 */
export function navigateToDocument(path: string, mode: 'push' | 'replace' = 'push'): void {
  if (mode === 'replace') {
    window.location.replace(path);

    return;
  }

  window.location.assign(path);
}
