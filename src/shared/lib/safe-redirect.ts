/**
 * Returns `value` when it is a path on this origin, otherwise `fallback`.
 * Parsed with URL, not prefixes: browsers strip tabs and newlines, so "/\t/evil.com"
 * passes a prefix check and becomes "//evil.com".
 */
export function safeRedirect(value: string | null, fallback: string): string {
  if (!value?.startsWith('/')) {
    return fallback;
  }

  try {
    const url = new URL(value, window.location.origin);

    // Anything that resolves to another origin is an open redirect.
    if (url.origin !== window.location.origin) {
      return fallback;
    }

    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
