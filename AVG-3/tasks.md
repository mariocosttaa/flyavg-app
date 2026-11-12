# Tarefas (app)

## Subtarefas do Rasteia

- [ ] OpenAPI gerado e cliente tipado para o frontend (fecha a última subtarefa da AVG-1)
- [ ] Health check, registos estruturados e Sentry (parte do browser)

## Decomposição

- [ ] Pasta do ticket
- [ ] Dependências: openapi-fetch, @tanstack/react-query, @sentry/react, openapi-typescript
- [ ] Scripts `api:types` e `api:types:check`; `generated/schema.d.ts` versionado
- [ ] Cliente `api` com `openapi-fetch`
- [ ] `ApiError`, `toApiError`, `unwrap` no formato decidido
- [ ] Mapeamento código → chave i18n e traduções pt/en dos códigos atuais
- [ ] `createQueryClient`, `healthKeys`, `useHealth` e teste
- [ ] `VITE_SENTRY_DSN` e Sentry carregado só com DSN
- [ ] README
- [ ] Versão 0.2.0
