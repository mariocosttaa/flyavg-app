import { describe, expect, it } from 'vitest';

// pt and en must expose the same keys per namespace: no missing, no extra.
const pt = import.meta.glob<{ default: object }>('./locales/pt/*.json', { eager: true });
const en = import.meta.glob<{ default: object }>('./locales/en/*.json', { eager: true });

function keys(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]: [string, unknown]) =>
    child && typeof child === 'object' ? keys(child, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}

describe('locales', () => {
  it('have the same namespaces in pt and en', () => {
    const names = (files: object) => Object.keys(files).map((file) => file.split('/').pop());

    expect(names(en).sort()).toEqual(names(pt).sort());
  });

  it.each(Object.keys(pt))('has the same keys in en for %s', (file) => {
    const enFile = en[file.replace('/pt/', '/en/')];

    expect(enFile).toBeDefined();
    expect(keys(enFile?.default ?? {}).sort()).toEqual(keys(pt[file]?.default ?? {}).sort());
  });
});
