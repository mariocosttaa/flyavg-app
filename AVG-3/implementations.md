# Implementação (app)

## Entregue

- `scripts/generate-api-types.mjs` (`api:types`, `api:types:check`) com a API programática do
  `openapi-typescript`; `src/shared/api/generated/schema.d.ts` gerado a partir do documento da
  API na versão 0.2.0.
- Cliente `api` (`openapi-fetch`), `ApiError` no formato decidido, `toApiError`, `unwrap`,
  `NETWORK_ERROR` para falhas do `fetch` (um pedido cancelado continua a ser um _abort_).
- `errorMessageKey` e `fieldErrorMessageKey`, com as traduções pt e en de todos os códigos que a
  API devolve hoje. `UNKNOWN` passou a `UNKNOWN_ERROR`.
- `createQueryClient` (sem repetir 4xx), `healthKeys`, `useHealth` com teste (MSW tipado pelo
  esquema gerado).
- Sentry do browser carregado sob pedido só com `VITE_SENTRY_DSN`; o SDK fica num _chunk_ à
  parte, que não é pedido sem DSN (confirmado no manifesto do build).

## Alterações fora de `src/shared/api/`

- Renomeação `VITE_ERROR_TRACKING_DSN` → `VITE_SENTRY_DSN` em `env-schema.ts`, no seu teste,
  `vite-env.d.ts`, `.env.example`, `Dockerfile` e README.
- `src/shared/monitoring/sentry.ts` (novo) e uma linha em cada `main.tsx`.
- README: secção do cliente da API.

## Para o Coolify

- `VITE_SENTRY_DSN` (opcional, argumento de build).
- Antes de o definir, acrescentar a origem de ingestão do Sentry a `CSP_CONNECT_SRC`.

## Para a AVG-6

- Ligar `createQueryClient()` a um `QueryClientProvider` nos providers das entradas.
