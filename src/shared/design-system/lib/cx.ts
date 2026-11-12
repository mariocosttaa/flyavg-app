/** Joins class names, skipping false, null and undefined, so conditions read inline. */
export function cx(...classNames: (string | false | null | undefined)[]): string {
  return classNames.filter(Boolean).join(' ');
}
