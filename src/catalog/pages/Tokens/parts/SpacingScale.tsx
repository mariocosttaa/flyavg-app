import { useTranslation } from 'react-i18next';
import { TokenSection } from './TokenSection';

const PIXELS_PER_STEP = 4;

// The allowed steps, with literal width classes so Tailwind generates them.
const SPACING_STEPS = [
  { step: 0.5, className: 'w-0.5' },
  { step: 1, className: 'w-1' },
  { step: 1.5, className: 'w-1.5' },
  { step: 2, className: 'w-2' },
  { step: 3, className: 'w-3' },
  { step: 4, className: 'w-4' },
  { step: 5, className: 'w-5' },
  { step: 6, className: 'w-6' },
  { step: 8, className: 'w-8' },
  { step: 10, className: 'w-10' },
  { step: 12, className: 'w-12' },
  { step: 16, className: 'w-16' },
  { step: 20, className: 'w-20' },
  { step: 24, className: 'w-24' },
];

export function SpacingScale() {
  const { t } = useTranslation('catalog');

  return (
    <TokenSection title={t('spacing.title')} description={t('spacing.description')}>
      <ul className="flex flex-col gap-2">
        {SPACING_STEPS.map(({ step, className }) => (
          <li key={step} className="flex items-center gap-4 text-sm">
            <code className="w-12 shrink-0">{step}</code>
            <span className="w-16 shrink-0 text-fg-muted tabular-nums">
              {t('spacing.value', { pixels: step * PIXELS_PER_STEP })}
            </span>
            <span aria-hidden="true" className={`h-4 rounded-sm bg-accent ${className}`} />
          </li>
        ))}
      </ul>
    </TokenSection>
  );
}
