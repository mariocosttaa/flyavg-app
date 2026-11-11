---
name: flyavg-pr-summary
description: >
  Writes a high-level summary of a FlyAVG feature or phase, in pt-PT, for a Rasteia ticket or a
  PR description: what will be done (Coberto) and what will not (Adiado), with the reason behind
  each non-obvious decision. Built from the plan, the requirements or what the user provides,
  always after asking scope questions. Use when the user asks for a "pr-summary", "resumo da
  feature", "overview", "resumo para o Rasteia" or a presentation of a ticket or phase to
  someone else. Not implementation docs (code skills) and not a review checklist (review skills).
---

# flyavg-pr-summary: feature or phase summary

| | |
|---|---|
| **Folder** | `.claude/skills/pr-summary/` (identical copy in flyavg-api and flyavg-app) |
| **Skill name** | `flyavg-pr-summary` |
| **Output** | `AVG-<n>/pr-summary.md`, or pasted directly when the user wants it for Rasteia or a PR |
| **Skeleton** | `references/template.md` |

Not to be confused with the ticket documents (`requirements.md`, `plan.md`, `tasks.md`), which stay focused on what this ticket implements, nor with the PR description of `flyavg-git` (`002-pr-description.md`), which narrates what was delivered.

## Step 0 (mandatory): clarify before writing

Gather the source (approved plan, ticket folder, the ticket and requirements in Rasteia, or what the user pastes) and ask scope questions until the scope is closed:

- **Covered vs not covered:** what is in this delivery and what is out?
- **Covered later vs dropped:** something that looks "out" may belong to the phase, only at another time. These are different things.
- **Data model:** new tables and columns, types (enum vs text), nullability, unique keys, foreign keys and `ON DELETE`, group vs airline ownership.
- **API:** which endpoints, request and response shapes, pagination.
- **Permissions:** who can do what, with group or airline scope.
- **Languages:** what the pilot sees in Portuguese and English.
- **Decisions:** which choices deserve one sentence of "why".

If the user says "go with what you have", proceed with the best assumption and mark it explicitly as an assumption.

## Principles

1. **Readable at a glance, not too technical.** It is for someone else to understand what and why quickly. Fine technical detail lives in `plan.md`.
2. **Coberto vs Adiado, never "fora de âmbito"** for work that belongs to the phase.
3. **Do not distribute work across tickets** ("será tratado noutro ticket"). Say what is covered and, below, what is not.
4. **Keep the "Adiado" list here only.** Do not copy it into `requirements.md` or `plan.md`.
5. **A standalone artifact.** It is often pasted and then deleted; nothing depends on it.
6. **Show the why** of each non-obvious decision in one sentence (e.g. why `RESTRICT` on a foreign key, why the airline owns routes, why an enum).
7. **pt-PT**, formal register, short sentences, presentation tone.
8. **Do not invent** what was not decided: ask, or mark it as an assumption.

## Document structure

Adapt to the feature; not every section always applies.

1. **Title:** `# <Feature name> (AVG-<n>)`.
2. **Intro (2 to 4 lines):** what it is and what it is for; one structuring decision if there is one.
3. **Modelo de dados:** per new table, `| Campo | Tipo | Notas |`; then references and `ON DELETE` in a code block with bullets justifying each choice.
4. **Estado e derivações:** what is computed on read vs stored, with the rule.
5. **API:** endpoints in code blocks, with pagination and error codes when relevant.
6. **Permissões:** who accesses, which permission, group or airline scope, how it is enforced.
7. **Plano de implementação:** numbered high-level steps.
8. **Âmbito:** two subsections, **Coberto** and **Adiado (não desta fase)**.

## Style

- Tables for data models; code blocks for endpoints, keys and derived rules.
- Bold the key term of each bullet; short bullets.
- Explain acronyms on first use (PIREP, ACARS, ICAO).
