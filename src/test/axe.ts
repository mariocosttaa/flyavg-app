import axe from 'axe-core';

/**
 * Runs axe-core on a rendered tree and returns its violations as readable lines, so a failing
 * test names the rule and the elements. Contrast needs real layout and CSS, which jsdom lacks:
 * the theme token tests cover it instead.
 */
export async function accessibilityViolations(container: Element): Promise<string[]> {
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });

  return results.violations.map(
    (violation) =>
      `${violation.id}: ${violation.help} (${violation.nodes.map((node) => node.target.join(' ')).join(', ')})`,
  );
}
