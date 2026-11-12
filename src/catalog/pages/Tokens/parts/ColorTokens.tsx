import { useTranslation } from 'react-i18next';
import { declaredTokens, resolveToken } from '@/shared/design-system/lib/theme-tokens';
import type { Appearance } from '@/shared/design-system/theme';
import { TokenGroup, TokenSection } from './TokenSection';

interface Swatch {
  token: string;
  // Literal class names: Tailwind only generates classes it finds written in the source.
  className: string;
}

const SURFACE_SWATCHES: Swatch[] = [
  { token: '--surface', className: 'bg-surface' },
  { token: '--surface-raised', className: 'bg-surface-raised' },
  { token: '--border', className: 'bg-border' },
  { token: '--border-strong', className: 'bg-border-strong' },
  { token: '--focus-ring', className: 'bg-focus-ring' },
  { token: '--backdrop', className: 'bg-backdrop' },
];

const TEXT_SWATCHES: Swatch[] = [
  { token: '--fg', className: 'text-fg' },
  { token: '--fg-muted', className: 'text-fg-muted' },
  { token: '--accent-text', className: 'text-accent-text' },
  { token: '--danger-text', className: 'text-danger-text' },
  { token: '--success-text', className: 'text-success-text' },
  { token: '--warning-text', className: 'text-warning-text' },
  { token: '--info-text', className: 'text-info-text' },
];

const FILL_SWATCHES: Swatch[] = [
  { token: '--accent', className: 'bg-accent text-accent-fg' },
  { token: '--danger', className: 'bg-danger text-danger-fg' },
  { token: '--success', className: 'bg-success text-success-fg' },
  { token: '--warning', className: 'bg-warning text-warning-fg' },
  { token: '--info', className: 'bg-info text-info-fg' },
];

interface SwatchListProps {
  swatches: Swatch[];
  tokens: Map<string, string>;
  hasSample?: boolean;
}

function SwatchList({ swatches, tokens, hasSample = false }: SwatchListProps) {
  const { t } = useTranslation('catalog');

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {swatches.map(({ token, className }) => (
        <li
          key={token}
          className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface-raised"
        >
          <span
            aria-hidden="true"
            className={`flex h-16 items-center justify-center border-b border-border text-2xl font-bold ${className}`}
          >
            {hasSample && t('colors.sample')}
          </span>
          <span className="flex flex-col gap-1 p-3 text-xs">
            <code>{token}</code>
            <span className="font-mono text-fg-muted">{resolveToken(tokens, token)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ColorTokens({ appearance }: { appearance: Appearance }) {
  const { t } = useTranslation('catalog');
  const tokens = declaredTokens(appearance);

  return (
    <TokenSection title={t('colors.title')} description={t('colors.description')}>
      <TokenGroup title={t('colors.surfaces')}>
        <SwatchList swatches={SURFACE_SWATCHES} tokens={tokens} />
      </TokenGroup>
      <TokenGroup title={t('colors.text')}>
        <SwatchList swatches={TEXT_SWATCHES} tokens={tokens} hasSample />
      </TokenGroup>
      <TokenGroup title={t('colors.fills')}>
        <SwatchList swatches={FILL_SWATCHES} tokens={tokens} hasSample />
      </TokenGroup>
    </TokenSection>
  );
}
