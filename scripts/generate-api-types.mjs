// Generates src/shared/api/generated/schema.d.ts from the flyavg-api OpenAPI document.
// The source is ../flyavg-api/openapi/openapi.json (an API checkout next to the app), or
// OPENAPI_PATH. `--check` compares instead of writing and fails when the committed file is stale.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import openapiTS, { astToString, COMMENT_HEADER } from 'openapi-typescript';

const ROOT = path.resolve(import.meta.dirname, '..');
const DEFAULT_SOURCE = '../flyavg-api/openapi/openapi.json';
const OUTPUT = path.join(ROOT, 'src/shared/api/generated/schema.d.ts');

const source = path.resolve(ROOT, process.env.OPENAPI_PATH || DEFAULT_SOURCE);

if (!existsSync(source)) {
  console.error(`OpenAPI document not found: ${source}. Set OPENAPI_PATH.`);
  process.exit(1);
}

const ast = await openapiTS(pathToFileURL(source));
const schema = `${COMMENT_HEADER}${astToString(ast)}`;

if (process.argv.includes('--check')) {
  const committed = existsSync(OUTPUT) ? readFileSync(OUTPUT, 'utf8') : '';

  if (committed !== schema) {
    console.error('src/shared/api/generated/schema.d.ts is stale: run `npm run api:types`.');
    process.exit(1);
  }

  console.log('API types are up to date.');
} else {
  mkdirSync(path.dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, schema);
  console.log(`Wrote ${path.relative(ROOT, OUTPUT)} from ${source}`);
}
