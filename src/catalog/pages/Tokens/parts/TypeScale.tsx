import { useTranslation } from 'react-i18next';
import { TokenGroup, TokenSection } from './TokenSection';

// Literal class names: Tailwind only generates classes it finds written in the source.
const TYPE_STEPS = [
  { name: 'text-xs', className: 'text-xs' },
  { name: 'text-sm', className: 'text-sm' },
  { name: 'text-base', className: 'text-base' },
  { name: 'text-lg', className: 'text-lg' },
  { name: 'text-xl', className: 'text-xl' },
  { name: 'text-2xl', className: 'text-2xl' },
  { name: 'text-3xl', className: 'text-3xl' },
  { name: 'text-4xl', className: 'text-4xl' },
];

const FAMILIES = [
  { name: 'font-sans', key: 'sans', className: 'font-sans' },
  { name: 'font-display', key: 'display', className: 'font-display font-bold' },
  { name: 'font-brand', key: 'brand', className: 'font-brand font-bold' },
  { name: 'font-mono', key: 'mono', className: 'font-mono font-medium' },
] as const;

const WEIGHTS = [
  { name: 'font-light', key: 'light', className: 'font-light' },
  { name: 'font-medium', key: 'medium', className: 'font-medium' },
  { name: 'font-bold', key: 'bold', className: 'font-bold' },
] as const;

const ROW = 'flex flex-col gap-1 border-b border-border pb-3';
const DISPLAY_CLASSES = 'text-display font-display';
const LABEL_CLASSES = 'tracking-label';

export function TypeScale() {
  const { t } = useTranslation('catalog');

  return (
    <TokenSection title={t('typography.title')}>
      <TokenGroup title={t('typography.scale')}>
        <ul className="flex flex-col gap-3">
          {TYPE_STEPS.map(({ name, className }) => (
            <li key={name} className={ROW}>
              <code className="text-xs text-fg-muted">{name}</code>
              <span className={className}>{t('typography.sample')}</span>
            </li>
          ))}
          <li className={ROW}>
            <code className="text-xs text-fg-muted">{DISPLAY_CLASSES}</code>
            <span className="font-display text-display font-bold">
              {t('typography.displaySample')}
            </span>
          </li>
        </ul>
      </TokenGroup>
      <TokenGroup title={t('typography.families')}>
        <ul className="flex flex-col gap-3">
          {FAMILIES.map(({ name, key, className }) => (
            <li key={name} className={ROW}>
              <code className="text-xs text-fg-muted">{name}</code>
              <span className="text-xs text-fg-muted">{t(`typography.familyNames.${key}`)}</span>
              <span className={`text-2xl ${className}`}>
                {key === 'mono' ? t('typography.codeSample') : t('typography.sample')}
              </span>
            </li>
          ))}
        </ul>
      </TokenGroup>
      <TokenGroup title={t('typography.weights')}>
        <ul className="flex flex-col gap-3">
          {WEIGHTS.map(({ name, key, className }) => (
            <li key={name} className={ROW}>
              <code className="text-xs text-fg-muted">{name}</code>
              <span className={`text-xl ${className}`}>{t(`typography.weightNames.${key}`)}</span>
            </li>
          ))}
          <li className={ROW}>
            <code className="text-xs text-fg-muted">{LABEL_CLASSES}</code>
            <span className="text-xs text-fg-muted">{t('typography.labelTracking')}</span>
            <span className="text-sm font-medium tracking-label uppercase">
              {t('typography.labelSample')}
            </span>
          </li>
        </ul>
      </TokenGroup>
    </TokenSection>
  );
}
