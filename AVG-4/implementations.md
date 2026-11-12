# Implementação

- `.github/workflows/ci.yml`: jobs `checks`, `e2e` (Playwright com Chromium) e `docker`.
- `.github/dependabot.yml`: npm e GitHub Actions, semanal à segunda-feira, PRs para `development`, atualizações minor e patch agrupadas.
- `README.md`: badge e secção CI.

## Verificação local

- `ci.yml` validado com `@action-validator/cli` e `dependabot.yml` com `check-jsonschema` (schema do Dependabot).
- `typecheck`, `lint:check`, `format:check`, `test:cov`, `build` e `npm audit --audit-level=high` verdes, em Node 22 e 24.
- `test:e2e` verde (3 testes de fumo).
- `docker build .` verde.
