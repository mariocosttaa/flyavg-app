# Tarefas (app)

## Subtarefas do Rasteia

- [x] OpenAPI gerado e cliente tipado para o frontend (fecha a última subtarefa da AVG-1)
- [x] Health check, registos estruturados e Sentry (parte do browser)

## Decomposição

- [x] Pasta do ticket
- [x] Dependências: openapi-fetch, @tanstack/react-query, @sentry/react, openapi-typescript
- [x] Scripts `api:types` e `api:types:check`; `generated/schema.d.ts` versionado
- [x] Cliente `api` com `openapi-fetch`
- [x] `ApiError`, `toApiError`, `unwrap` no formato decidido
- [x] Mapeamento código → chave i18n e traduções pt/en dos códigos atuais
- [x] `createQueryClient`, `healthKeys`, `useHealth` e teste
- [x] `VITE_SENTRY_DSN` e Sentry carregado só com DSN
- [x] README
- [x] Versão 0.3.0
