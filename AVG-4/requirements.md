# AVG-4: CI/CD e ambientes de staging e produção

Tarefa do Rasteia `1ed766e8-21e7-4957-8a7b-71e00d5eac0b` (fase 1).

## Subtarefas

- Pipeline por repositório: lint, testes e build (**esta entrega**).
- Docker e publicação automática em staging da api e da app (sessão coordenadora, Coolify).
- Postgres com PostGIS, Redis e cópias diárias (sessão coordenadora, Coolify).

## Requisitos ligados

- **AVG_NFR_007, Testes automáticos.** O código deve ter testes unitários e testes ponta a ponta dos fluxos críticos, obrigatórios na integração contínua.
- **AVG_NFR_011, Ambientes e publicação.** O sistema deve ter ambientes de desenvolvimento, staging e produção com publicação automática.
- **AVG_NFR_006, Cópias de segurança.** Adiado por decisão do Mário (decisão 19); fora desta entrega.

## Decisões da fase 1 aplicáveis

- **4. Contrato OpenAPI.** O CI falha se o `openapi/openapi.json` estiver desatualizado (chega com a AVG-3).
- **9. Testes ponta a ponta.** Postgres e Redis próprios para testes, com as mesmas imagens no CI (chega com a AVG-2/AVG-3).
- **18. Ramos e ambientes.** O Coolify publica a partir dos ramos `development`, `staging` e `master`; o CI não publica.

## Critérios de aceitação

- Cada PR e cada push para `development`, `staging` ou `master` corre lint, formatação, tipos, testes, build e auditoria de dependências.
- A imagem Docker é construída (sem publicar) para detetar falhas no Dockerfile.
- O pipeline está verde no código atual.
