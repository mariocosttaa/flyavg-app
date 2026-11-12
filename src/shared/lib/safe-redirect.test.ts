import { describe, expect, it } from 'vitest';
import { safeRedirect } from './safe-redirect';

// Open redirect protection for ?redirect=: only same-origin paths survive.
describe('safeRedirect', () => {
  const FALLBACK = '/pilot';

  it.each([
    ['an absolute URL', 'https://evil.example'],
    ['a protocol-relative URL', '//evil.example'],
    ['a backslash that browsers read as a slash', '/\\evil.example'],
    ['a tab that browsers strip', '/\t/evil.example'],
    ['a newline that browsers strip', '/\n/evil.example'],
    ['a javascript: URL', 'javascript:alert(1)'],
    ['a relative path', 'pilot'],
    ['an empty value', ''],
    ['a missing value', null],
  ])('rejects %s', (_case, value) => {
    expect(safeRedirect(value, FALLBACK)).toBe(FALLBACK);
  });

  it('keeps a portal path with its query and hash', () => {
    expect(safeRedirect('/flights/bookings?page=2#top', FALLBACK)).toBe(
      '/flights/bookings?page=2#top',
    );
  });

  it('keeps an admin path, which another entry serves on the same origin', () => {
    expect(safeRedirect('/admin/pilots', FALLBACK)).toBe('/admin/pilots');
  });

  it('normalises dot segments instead of escaping the origin', () => {
    expect(safeRedirect('/../admin/../pilot', FALLBACK)).toBe('/pilot');
  });
});
