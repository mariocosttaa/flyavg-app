// The component catalog is a third HTML entry built only for these VITE_APP_ENV values.
// Shared by vite.config.ts and the bundle check, so both read the same rule.
export const CATALOG_ENVIRONMENTS = ['development', 'staging'];

/** An unset or unknown value counts as production: the catalog is left out. */
export function isCatalogBuilt(appEnvironment) {
  return CATALOG_ENVIRONMENTS.includes(appEnvironment);
}
