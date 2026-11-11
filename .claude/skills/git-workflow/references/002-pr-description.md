# 002: Pull request title and description

PR text is written in **pt-PT** (European Portuguese, formal register), the project's language. Commits stay in English.

## Title

```text
<type>(AVG-<n>): <short description in pt-PT>
```

Example: `feat(AVG-12): registo de pilotos e adesão ao grupo`.

Promotion PRs: `release(staging): AVG-<n> <short description>` and `release(master): ...` (see `flyavg-promote`).

## Source of truth, in this order

1. The ticket folder `AVG-<n>/` (`requirements.md`, `plan.md`, `tasks.md`, `implementations.md`).
2. The ticket and its requirements in Rasteia.
3. The real diff and commits, to confirm what was actually implemented. Never describe work that is not in the diff.

If context is missing, ask before writing.

## Body structure: head, trunk and limbs

Narrative paragraphs under functional headings, ready to paste.

- **Contexto** (head, one short paragraph): the goal of the change and the problem behind it.
- **O que foi feito** (trunk, two to four paragraphs by theme): what changed and why it was needed.
- **Como testar** (steps a reviewer can follow, the only place where a short list is fine).
- **Impacto e riscos** (limbs, one paragraph): expected impact, residual risks, validation done or pending, brief follow-ups.

## Tone and rules

- Direct and professional pt-PT; short sentences; no meta comments ("analisei", "com base no diff").
- No technical references in the narrative unless the user asks: no file paths, branch names, commit hashes or "ver diff".
- Stay within the ticket's scope; do not mix themes from other tickets.
- When the change has UI, add screenshots (desktop and mobile) under "Como testar".

## Opening the PR

Ask before opening it, then:

```bash
gh pr create --base development --head <type>/AVG-<n> \
  --title "<type>(AVG-<n>): <pt-PT description>" --body-file AVG-<n>/pr-body.md
```

Write the body to a file first (never inline in the shell) and delete that file afterwards if it is not meant to stay in the ticket folder.
