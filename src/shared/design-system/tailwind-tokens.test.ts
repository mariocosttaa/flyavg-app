import { compile } from '@tailwindcss/node';
import { describe, expect, it } from 'vitest';
import indexCss from './index.css?raw';

// Compiles the real index.css with the same Tailwind version as the build and asks it for
// classes: only our tokens may produce CSS, Tailwind's default palette and scales may not.

declare global {
  interface ImportMeta {
    // Vitest runs in Node; declared here so the app program does not take in all Node types.
    readonly dirname: string;
  }
}

// Imports inside index.css resolve from its own folder on disk, as in the Vite build.
const DESIGN_SYSTEM = import.meta.dirname;

async function generatedClasses(candidates: string[]): Promise<string[]> {
  const compiler = await compile(indexCss, { base: DESIGN_SYSTEM, onDependency: () => undefined });
  const output = compiler.build(candidates);

  return candidates.filter((candidate) => output.includes(`.${candidate} {`));
}

describe('Tailwind utilities', () => {
  it('drops the default palette and scales', async () => {
    const defaults = [
      'bg-red-500',
      'text-blue-600',
      'border-gray-200',
      'bg-white',
      'text-black',
      'shadow-lg',
      'rounded-2xl',
      'font-semibold',
      'font-serif',
      'tracking-wide',
      'leading-loose',
      'ease-in-out',
      'text-5xl',
      'drop-shadow-md',
    ];

    expect(await generatedClasses(defaults)).toEqual([]);
  });

  it('generates the token utilities (positive control for the check above)', async () => {
    const tokens = [
      'bg-surface',
      'text-fg-muted',
      'border-border-strong',
      'bg-danger',
      'text-info-text',
      'shadow-raised',
      'rounded-xl',
      'font-medium',
      'font-display',
      'font-brand',
      'tracking-label',
      'leading-relaxed',
      'ease-standard',
      'text-display',
      'duration-fast',
      'z-modal',
      'animate-spin',
      'p-4',
    ];

    expect(await generatedClasses(tokens)).toEqual(tokens);
  });

  it('keeps the keyword colors that are not palette values', async () => {
    expect(await generatedClasses(['bg-transparent', 'text-current', 'bg-inherit'])).toEqual([
      'bg-transparent',
      'text-current',
      'bg-inherit',
    ]);
  });
});
