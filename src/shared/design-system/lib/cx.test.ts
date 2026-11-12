import { describe, expect, it } from 'vitest';
import { cx } from './cx';

describe('cx', () => {
  it('joins the given classes and skips empty conditions', () => {
    const isSelected = false;

    expect(cx('rounded-md', isSelected && 'bg-accent', null, undefined, 'text-fg')).toBe(
      'rounded-md text-fg',
    );
  });
});
