import type { Airline, ResolvedTheme } from '../theme';
import primitivesCss from '../tokens/primitives.css?raw';
import baseCss from '../themes/base.css?raw';
import taagCss from '../themes/taag.css?raw';
import worldCss from '../themes/world.css?raw';

// Resolves the semantic tokens of one theme from the CSS source itself, applying the same
// cascade as the browser, so tests and the catalog check what actually ships.

export interface Appearance {
  airline: Airline | null;
  theme: ResolvedTheme;
}

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
const SELECTOR = /^:root((?:\[data-(?:airline|theme)='[a-z]+'\])*)$/;
const ATTRIBUTE = /\[data-(airline|theme)='([a-z]+)'\]/g;
const VARIABLE_REFERENCE = /^var\((--[\w-]+)\)$/;

function parseDeclarations(body: string): Map<string, string> {
  const declarations = new Map<string, string>();

  for (const declaration of body.split(';')) {
    const separator = declaration.indexOf(':');

    if (separator === -1) {
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

function parseRules(sources: string[]): TokenRule[] {
  const css = sources.join('\n').replaceAll(COMMENT, '');

  return [...css.matchAll(RULE)].map(([, selector = '', body = ''], order) =>
    parseRule(selector, body, order),
  );
}

// Import order of index.css: primitives, then the base theme, then the airline themes.
export const TOKEN_RULES = parseRules([primitivesCss, baseCss, taagCss, worldCss]);

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
