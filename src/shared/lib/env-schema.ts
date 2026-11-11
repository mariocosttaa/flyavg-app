import { z } from 'zod';

// Kept free of import.meta.env so the schema can be tested with any input.
const schema = z.object({
  VITE_API_URL: z.url(),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']),
  VITE_SITE_URL: z.url(),
  // An empty value in .env means "not configured".
  VITE_ERROR_TRACKING_DSN: z
    .string()
    .optional()
    .transform((value) => value || undefined),
});

export type Environment = z.infer<typeof schema>;

export function parseEnvironment(source: Record<string, unknown>): Environment {
  const result = schema.safeParse(source);

  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }

  return result.data;
}
