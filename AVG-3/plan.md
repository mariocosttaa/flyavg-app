# Plano técnico (app)

A parte da app desta tarefa é o cliente tipado (subtarefa "OpenAPI gerado e cliente tipado para o
frontend", que fecha também a AVG-1) e o Sentry do lado do browser (subtarefa "Health check,
registos estruturados e Sentry"). A AVG-6 corre em paralelo noutra worktree, por isso as
alterações ficam dentro de `src/shared/api/`, do `package.json`, dos scripts e do namespace
`errors` do i18n, com as exceções mínimas listadas abaixo.

## Cliente gerado

- `openapi-typescript` gera `src/shared/api/generated/schema.d.ts` a partir do
  `openapi/openapi.json` da API. O ficheiro gerado fica versionado e nunca se edita à mão.
- `npm run api:types` lê `../flyavg-api/openapi/openapi.json` por omissão (checkout da API ao lado
  da app); `OPENAPI_PATH` aponta para outro ficheiro (por exemplo uma worktree ou uma versão
  fixada). `npm run api:types:check` gera para um ficheiro temporário e compara com o versionado,
  sem depender do `git diff` (que ignora ficheiros por versionar). O CI precisa de um checkout da
  API, na versão que a app usa, ao lado da app.
- `openapi-typescript` 7 declara `typescript ^5` como _peer_; o repositório usa TypeScript 6. Um
  `overrides` no `package.json` liga-o ao TypeScript do projeto. A geração foi confirmada com o
  TypeScript 6.
- `openapi-fetch` cria o cliente `api` com `VITE_API_URL`. O `fetch` passa por uma função que
  chama `globalThis.fetch` em cada pedido: o `openapi-fetch` guarda o `fetch` no momento em que o
  cliente é criado, e assim o MSW (testes) e, mais tarde, o `authFetch` da sessão funcionam.
- `apiFetch` (base provisória da AVG-1) é removido: nada o usava.

## Erros

- `ApiError` segue o formato decidido: `status`, `code`, `details` (objeto), `fieldErrors` (de
  `errors`) e `requestId`. `toApiError` valida o corpo sem confiar nele; sem `code` fica
  `UNKNOWN_ERROR`, e uma falha do próprio `fetch` fica `NETWORK_ERROR`.
- `unwrap` transforma o resultado do `openapi-fetch` em dados ou em `ApiError`.
- `errorMessageKey(code)` devolve `errors:<code>` quando existe tradução e `errors:UNKNOWN_ERROR`
  caso contrário; `fieldErrorMessageKey` faz o mesmo para os códigos por campo
  (`errors:validation.<code>`, com os `params` para interpolação).
- O namespace `errors` passa a ter, em pt e en, os códigos que a API devolve hoje. A chave antiga
  `UNKNOWN` passa a `UNKNOWN_ERROR`, como na skill (só era usada no próprio ficheiro).

## TanStack Query

- `createQueryClient()` em `src/shared/api/query-client.ts`, com os valores da skill (sem repetir
  4xx). Ligar o `QueryClientProvider` às entradas fica para a AVG-6, que é dona dos providers.
- `healthKeys` e `useHealth()` são a primeira chamada tipada, usada só por um teste. Não há ecrãs.

## Sentry no browser

- `@sentry/react`, carregado com `import()` só quando `VITE_SENTRY_DSN` existe, para não pesar no
  bundle de quem não o usa. `environment` = `VITE_APP_ENV`, sem dados pessoais.
- Exceções fora de `src/shared/api/`, mínimas: renomear `VITE_ERROR_TRACKING_DSN` para
  `VITE_SENTRY_DSN` (schema, teste, `vite-env.d.ts`, `.env.example`, Dockerfile, README), o módulo
  `src/shared/monitoring/sentry.ts` e uma linha em cada `main.tsx`.
- O nginx envia `connect-src` só para a própria origem e para a API. Antes de definir
  `VITE_SENTRY_DSN` num ambiente, o `CSP_CONNECT_SRC` no Coolify tem de incluir a origem de
  ingestão do Sentry (`https://<org>.ingest.sentry.io` ou a região usada).

## Versão

Nova funcionalidade sem quebrar nada: `0.1.0` → `0.2.0`.
