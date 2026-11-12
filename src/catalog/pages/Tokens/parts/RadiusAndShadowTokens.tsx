import { useTranslation } from 'react-i18next';
import { TokenSection } from './TokenSection';

const RADII = [
  { name: 'rounded-sm', className: 'rounded-sm' },
  { name: 'rounded-md', className: 'rounded-md' },
  { name: 'rounded-lg', className: 'rounded-lg' },
  { name: 'rounded-xl', className: 'rounded-xl' },
  { name: 'rounded-full', className: 'rounded-full' },
];

const SHADOWS = [
  { name: 'shadow-raised', key: 'raised', className: 'shadow-raised' },
  { name: 'shadow-overlay', key: 'overlay', className: 'shadow-overlay' },
] as const;

export function RadiusAndShadowTokens() {
  const { t } = useTranslation('catalog');

  return (
    <div className="grid gap-12 md:grid-cols-2">
      <TokenSection title={t('radius.title')}>
        <ul className="flex flex-wrap gap-6">
          {RADII.map(({ name, className }) => (
            <li key={name} className="flex flex-col items-center gap-2">
              <span
                aria-hidden="true"
                className={`size-16 border-2 border-border-strong bg-surface-raised ${className}`}
              />
              <code className="text-xs">{name}</code>
            </li>
          ))}
        </ul>
      </TokenSection>
      <TokenSection title={t('shadow.title')}>
        <ul className="flex flex-wrap gap-6">
          {SHADOWS.map(({ name, key, className }) => (
            <li
              key={name}
              className={`flex w-48 flex-col gap-1 rounded-lg bg-surface-raised p-4 ${className}`}
            >
              <code className="text-xs">{name}</code>
              <span className="text-sm text-fg-muted">{t(`shadow.${key}`)}</span>
            </li>
          ))}
        </ul>
      </TokenSection>
    </div>
  );
}
