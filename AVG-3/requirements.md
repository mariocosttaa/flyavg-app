# AVG-3: API NestJS base: configuração, validação, erros e documentação OpenAPI

Tarefa da fase 1 no Rasteia (AVG-3). Fecha também a última subtarefa da AVG-1: "Contrato entre
repositórios: cliente tipado gerado do OpenAPI da API".

## Subtarefas

1. Módulos config, validação global e filtro de erros.
2. OpenAPI gerado e cliente tipado para o frontend.
3. Health check, registos estruturados e Sentry.

## Requisitos ligados

- **AVG_NFR_002, Segurança.** O sistema deve seguir as boas práticas OWASP: hash forte de
  palavras-passe, validação de entradas, CSP e limites de pedidos.
- **AVG_NFR_005, Observabilidade.** O sistema deve ter registo de erros, registos estruturados,
  métricas e verificações de saúde.

## Decisões da fase 1 que se aplicam

- REST sem prefixo de versão; a versão da API é a do `package.json` e carimba o OpenAPI.
- Todos os erros saem de um filtro global com `{ statusCode, code, message, details?, errors?,
requestId }`; a app traduz pelo `code`.
- DTOs com class-validator e `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`); Zod
  só para a configuração.
- `openapi/openapi.json` versionado na API; o CI falha se estiver desatualizado e bloqueia
  alterações incompatíveis sem versão _major_.
- Cliente da app com `openapi-typescript` e `openapi-fetch`, envolvido em hooks do TanStack Query.
- Registo de erros com Sentry, ligado nesta tarefa e ativo só quando há DSN configurado. O
  sistema de métricas continua em aberto (antes do lançamento).

## Critérios de aceitação

- Pedido inválido devolve `400` com `VALIDATION_FAILED` e um código por campo; campos
  desconhecidos são rejeitados.
- Qualquer erro (rota desconhecida, corpo demasiado grande, JSON inválido, limite de pedidos,
  erro inesperado) sai com o formato decidido e com `requestId`, igual ao cabeçalho
  `x-request-id`.
- Helmet com CSP para respostas JSON, CORS pela lista do ambiente, limite de corpo de 100 KB e
  limite de pedidos global.
- `npm run openapi:export` escreve `openapi/openapi.json` sem servidor nem base de dados, e
  `npm run openapi:check` falha quando o ficheiro está desatualizado.
- Sentry só é inicializado com `SENTRY_DSN`; o filtro envia apenas erros 5xx.
- Os registos levam o id do pedido e escondem cabeçalhos de autenticação, cookies e segredos.

## Critérios de aceitação da app

- `npm run api:types` gera os tipos a partir do `openapi.json` da API e `npm run api:types:check`
  falha quando o ficheiro gerado está desatualizado.
- Todas as chamadas passam pelo cliente `openapi-fetch` gerado; os erros chegam como `ApiError`
  com o `code` da API e são traduzidos por esse código, em pt e en.
- O Sentry do browser só é carregado com `VITE_SENTRY_DSN`.
