import indexCss from '../index.css?raw';
import type { Airline, Appearance, ResolvedTheme } from '../theme';

// Only these files may hold token rules; the other token files (@theme, @font-face) do not.
const TOKEN_STYLESHEETS = import.meta.glob<string>(
  ['../tokens/primitives.css', '../themes/*.css'],
  { query: '?raw', import: 'default', eager: true },
);

// Resolves the semantic tokens of one theme from the CSS source itself, applying the same
// cascade as the browser, so tests and the catalog check what actually ships.

export const AIRLINES: (Airline | null)[] = [null, 'taag', 'world'];
export const THEMES: ResolvedTheme[] = ['light', 'dark'];
export const APPEARANCES: Appearance[] = AIRLINES.flatMap((airline) =>
  THEMES.map((theme) => ({ airline, theme })),
);

export interface TokenRule {
  airline?: string;
  theme?: string;
  specificity: number;
  order: number;
  declarations: Map<string, string>;
}

const COMMENT = /\/\*[\s\S]*?\*\//g;
const RULE = /([^{}]+)\{([^{}]*)\}/g;
const IMPORT = /@import '\.\/([\w/-]+\.css)';/g;
const SELECTOR = /^:root((?:\[data-(?:airline|theme)='[a-z]+'\])*)$/;
const ATTRIBUTE = /\[data-(airline|theme)='([a-z]+)'\]/g;
const VARIABLE_REFERENCE = /^var\((--[\w-]+)\)$/;

function parseDeclarations(body: string): Map<string, string> {
  const declarations = new Map<string, string>();

  for (const declaration of body.split(';')) {
    const separator = declaration.indexOf(':');

    if (separator === -1) {
      if (declaration.trim()) {
        throw new Error(`Unsupported declaration in theme CSS: "${declaration.trim()}"`);
      }

      continue;
    }

    declarations.set(
      declaration.slice(0, separator).trim(),
      declaration.slice(separator + 1).trim(),
    );
  }

  return declarations;
}

function parseRule(selector: string, body: string, order: number): TokenRule {
  const match = SELECTOR.exec(selector.trim());

  if (!match) {
    throw new Error(`Unsupported selector in theme CSS: "${selector.trim()}"`);
  }

  const rule: TokenRule = { specificity: 1, order, declarations: parseDeclarations(body) };

  for (const [, attribute, value] of (match[1] ?? '').matchAll(ATTRIBUTE)) {
    rule[attribute === 'airline' ? 'airline' : 'theme'] = value;
    rule.specificity += 1;
  }

  return rule;
}

/**
 * Flat `:root[...] { --token: value; }` rules only. Anything else (an at-rule, a nested block)
 * throws: applying it unconditionally would let the contrast test pass on CSS that differs.
 */
export function parseTokenRules(sources: string[]): TokenRule[] {
  const css = sources.join('\n').replaceAll(COMMENT, '');
  const unparsed = css.replaceAll(RULE, '').trim();

  if (css.includes('@') || unparsed) {
    throw new Error(`Unsupported CSS in theme files: "${unparsed || css.slice(css.indexOf('@'))}"`);
  }

  return [...css.matchAll(RULE)].map(([, selector = '', body = ''], order) =>
    parseRule(selector, body, order),
  );
}

/** Token stylesheets in the order index.css imports them, which is the cascade order. */
export function orderedTokenSources(index: string, stylesheets: Record<string, string>): string[] {
  const imported = [...index.matchAll(IMPORT)]
    .map(([, file = '']) => `../${file}`)
    .filter((file) => file in stylesheets);
  const missing = Object.keys(stylesheets).filter((file) => !imported.includes(file));

  if (missing.length > 0) {
    throw new Error(`index.css does not import ${missing.join(', ')}`);
  }

  return imported.map((file) => stylesheets[file] ?? '');
}

export const TOKEN_RULES = parseTokenRules(orderedTokenSources(indexCss, TOKEN_STYLESHEETS));

function matches(rule: TokenRule, { airline, theme }: Appearance): boolean {
  const isAirlineMatch = rule.airline === undefined || rule.airline === airline;
  const isThemeMatch = rule.theme === undefined || rule.theme === theme;

  return isAirlineMatch && isThemeMatch;
}

/** Declared value of every custom property on <html> for one appearance, var() unresolved. */
export function declaredTokens(appearance: Appearance): Map<string, string> {
  const winners = TOKEN_RULES.filter((rule) => matches(rule, appearance)).sort(
    (first, second) => first.specificity - second.specificity || first.order - second.order,
  );

  return new Map(winners.flatMap((rule) => [...rule.declarations]));
}

/** Final value of a token, following var() chains; throws on a missing or circular reference. */
export function resolveToken(
  tokens: Map<string, string>,
  name: string,
  seen: string[] = [],
): string {
  const value = tokens.get(name);

  if (value === undefined) {
    throw new Error(`Token ${name} is not defined`);
  }

  if (seen.includes(name)) {
    throw new Error(`Circular token reference: ${[...seen, name].join(' -> ')}`);
  }

  const reference = VARIABLE_REFERENCE.exec(value)?.[1];

  return reference ? resolveToken(tokens, reference, [...seen, name]) : value;
}

/** Airline rules, for checks on how each airline overrides the base theme. */
export function airlineRules(airline: Airline): { light?: TokenRule; dark?: TokenRule } {
  const rules = TOKEN_RULES.filter((rule) => rule.airline === airline);

  return {
    light: rules.find((rule) => rule.theme === undefined),
    dark: rules.find((rule) => rule.theme === 'dark'),
  };
}

export function baseRules(): { light?: TokenRule; dark?: TokenRule } {
  const rules = TOKEN_RULES.filter((rule) => rule.airline === undefined);
  const semantic = rules.filter((rule) => rule.declarations.has('--surface'));

  return {
    light: semantic.find((rule) => rule.theme === undefined),
    dark: semantic.find((rule) => rule.theme === 'dark'),
  };
}
