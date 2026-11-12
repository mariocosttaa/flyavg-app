# Implementação

- `.github/workflows/ci.yml`: jobs `checks`, `e2e` (Playwright com Chromium) e `docker`.
- `.github/dependabot.yml`: npm e GitHub Actions, semanal à segunda-feira, PRs para `development`, atualizações minor e patch agrupadas.
- `README.md`: badge e secção CI.

## Verificação local

- `ci.yml` validado com `@action-validator/cli` e `dependabot.yml` com `check-jsonschema` (schema do Dependabot).
- `typecheck`, `lint:check`, `format:check`, `test:cov`, `build` e `npm audit --audit-level=high` verdes, em Node 22 e 24.
- `test:e2e` verde (3 testes de fumo).
- `docker build .` verde.

## Dockerfile

O Coolify passa `NODE_ENV=production` também no build, o que fazia o `npm ci` saltar as dependências de desenvolvimento (o primeiro deploy da API de produção falhou com `nest: not found`). O build passa a instalar sempre as dependências de desenvolvimento (`npm ci --include=dev`).
