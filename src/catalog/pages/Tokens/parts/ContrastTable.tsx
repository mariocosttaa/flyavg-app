import { useTranslation } from 'react-i18next';
import { contrastRatio, CONTRAST_REQUIREMENTS } from '@/shared/design-system/lib/contrast';
import { cx } from '@/shared/design-system/lib/cx';
import { declaredTokens, resolveToken } from '@/shared/design-system/lib/theme-tokens';
import type { Appearance } from '@/shared/design-system/theme';
import { useFormat } from '@/shared/i18n/use-format';
import { TokenSection } from './TokenSection';

const CELL = 'border-b border-border px-3 py-2';

// Truncated, not rounded: 4.498 must not show as a passing 4.50.
const truncate = (ratio: number) => Math.floor(ratio * 100) / 100;

export function ContrastTable({ appearance }: { appearance: Appearance }) {
  const { t } = useTranslation('catalog');
  const format = useFormat();
  const tokens = declaredTokens(appearance);
  const formatRatio = (value: number) =>
    t('contrast.ratioValue', {
      value: format.number(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    });

  return (
    <TokenSection title={t('contrast.title')} description={t('contrast.description')}>
      <div className="overflow-x-auto rounded-lg border border-border bg-surface-raised">
        <table className="w-full text-left text-sm">
          <thead className="text-fg-muted">
            <tr>
              <th scope="col" className={cx(CELL, 'font-medium')}>
                {t('contrast.foreground')}
              </th>
              <th scope="col" className={cx(CELL, 'font-medium')}>
                {t('contrast.background')}
              </th>
              <th scope="col" className={cx(CELL, 'font-medium')}>
                {t('contrast.ratio')}
              </th>
              <th scope="col" className={cx(CELL, 'font-medium')}>
                {t('contrast.minimum')}
              </th>
              <th scope="col" className={cx(CELL, 'font-medium')}>
                {t('contrast.result')}
              </th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {CONTRAST_REQUIREMENTS.map(({ foreground, background, minimum }) => {
              const ratio = contrastRatio(
                resolveToken(tokens, foreground),
                resolveToken(tokens, background),
              );
              const isPassing = ratio >= minimum;

              return (
                <tr key={`${foreground} ${background}`}>
                  <td className={CELL}>
                    <code>{foreground}</code>
                  </td>
                  <td className={CELL}>
                    <code>{background}</code>
                  </td>
                  <td className={CELL}>{formatRatio(truncate(ratio))}</td>
                  <td className={CELL}>{formatRatio(minimum)}</td>
                  <td
                    className={cx(
                      CELL,
                      'font-medium',
                      isPassing ? 'text-success-text' : 'text-danger-text',
                    )}
                  >
                    {isPassing ? t('contrast.pass') : t('contrast.fail')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TokenSection>
  );
}
