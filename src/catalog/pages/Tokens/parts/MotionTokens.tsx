import { useTranslation } from 'react-i18next';
import { TokenGroup, TokenSection } from './TokenSection';

const DURATIONS = [
  { name: 'duration-fast', key: 'durationFast' },
  { name: 'duration-normal', key: 'durationNormal' },
  { name: 'duration-slow', key: 'durationSlow' },
] as const;

const EASINGS = [
  { name: 'ease-standard', key: 'easeStandard' },
  { name: 'ease-enter', key: 'easeEnter' },
  { name: 'ease-exit', key: 'easeExit' },
] as const;

const LAYERS = [
  { name: 'z-dropdown', key: 'zDropdown' },
  { name: 'z-sticky', key: 'zSticky' },
  { name: 'z-overlay', key: 'zOverlay' },
  { name: 'z-modal', key: 'zModal' },
  { name: 'z-toast', key: 'zToast' },
] as const;

type UsageKey = (typeof DURATIONS | typeof EASINGS | typeof LAYERS)[number]['key'];

function TokenList({ tokens }: { tokens: readonly { name: string; key: UsageKey }[] }) {
  const { t } = useTranslation('catalog');

  return (
    <dl className="flex flex-col gap-2 text-sm">
      {tokens.map(({ name, key }) => (
        <div key={name} className="flex gap-4">
          <dt className="w-36 shrink-0">
            <code>{name}</code>
          </dt>
          <dd className="text-fg-muted">{t(`motion.usage.${key}`)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function MotionTokens() {
  const { t } = useTranslation('catalog');

  return (
    <TokenSection title={t('motion.title')} description={t('motion.description')}>
      <div className="grid gap-8 md:grid-cols-3">
        <TokenGroup title={t('motion.durations')}>
          <TokenList tokens={DURATIONS} />
        </TokenGroup>
        <TokenGroup title={t('motion.easings')}>
          <TokenList tokens={EASINGS} />
        </TokenGroup>
        <TokenGroup title={t('motion.layers')}>
          <TokenList tokens={LAYERS} />
        </TokenGroup>
      </div>
    </TokenSection>
  );
}
