# AVG-7: Registar as decisões de arquitetura

## Contexto

Tarefa da fase 1 no Rasteia. As decisões de arquitetura da fase 1 foram aprovadas pelo Mário a 11 de novembro de 2026 e estão publicadas na página "Decisões" da fase 1 no Rasteia.

## Objetivo

As skills do `flyavg-app` (`.claude/skills/`) passam a refletir essas decisões como regras firmes, sem marcas "Decision pending (AVG-7)".

## Critérios de aceitação

- Nenhuma marca "Decision pending (AVG-7)" em `.claude/skills`.
- Cada decisão tomada fica escrita como regra, marcada "Decided (AVG-7)".
- Cada tema ainda em aberto fica marcado "Open (<fase ou momento>)".
- As marcas de AVG-5 e AVG-6 ficam como estão.
- As skills partilhadas (`git-workflow`, `promote-ticket`, `pr-summary`) ficam iguais nos dois repositórios.
