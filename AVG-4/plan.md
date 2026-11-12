# Plano: pipeline de CI da app

## Abordagem

GitHub Actions em `.github/workflows/ci.yml`, com três jobs:

1. **Lint, test and build:** Node do `.nvmrc` com cache npm, `npm ci`, `typecheck`, `lint:check`, `format:check`, `test:cov`, `build` (inclui a verificação de fronteiras entre os bundles do portal e do admin) e `npm audit --audit-level=high`.
2. **Playwright smoke:** `npx playwright install --with-deps chromium` e `npm run test:e2e` (o `playwright.config.ts` faz o build e serve com `vite preview`). Em falha, o relatório fica como artefacto durante 7 dias.
3. **Docker image:** Buildx e `docker/build-push-action` com `push: false` e cache GHA.

Gatilhos: PR e push para `development`, `staging` e `master`. Concorrência por ref, cancelando execuções anteriores só em PR. Permissões mínimas (`contents: read`).

`.github/dependabot.yml` semanal para npm e GitHub Actions, com PRs para `development`.

## Decisões

- **Sem passo de deploy:** o Coolify publica a partir dos ramos (decisão 18). O ramo legado `main` não está coberto.
- **Actions fixadas na versão major atual** (checkout v7, setup-node v7, upload-artifact v7, setup-buildx v4, build-push v7); o Dependabot mantém-nas atualizadas.
- **Chromium descarregado no CI**, em vez de `PLAYWRIGHT_CHANNEL=chrome`, que é só para uso local.
- **`target-branch: development` no Dependabot:** o ramo por omissão da app no GitHub é o legado `main`, onde as atualizações não podem entrar.

## Riscos e questões em aberto

- O GitHub só lê o `dependabot.yml` do ramo por omissão. Na app esse ramo é `main` (legado), por isso o Dependabot só fica ativo quando o ramo por omissão passar a `development` (ou `master`): a decidir pelo Mário.
- Tornar o CI obrigatório nos PRs (branch protection) é configuração do GitHub, fora do repositório: a confirmar com o Mário.
