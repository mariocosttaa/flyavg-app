import { parseEnvironment as parseEnvironment } from './env-schema';

export type { Environment } from './env-schema';

// Fail fast at startup with a clear message instead of broken requests later.
export const env = parseEnvironment(import.meta.env);
