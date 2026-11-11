# 000: Branches, ticket folder and PR flow

This file covers the repository workflow only. Commit messages are in `001-commits.md`; the PR text is in `002-pr-description.md`; promotions between long-lived branches are in the `flyavg-promote` skill.

## Branch roles

| Branch | Role |
|---|---|
| `master` | Production. |
| `staging` | Pre-production, validates what comes from `development`. Not created yet. |
| `development` | Integration. Every ticket starts from here and returns here. |
| `feature/*` | New functionality. |
| `fix/*` | Bug fix. |
| `chore/*` | Technical maintenance without business behaviour change (tooling, deps, config). |
| `refactor/*` | Rewrite without behaviour change. |
| `hotfix/*` | Urgent production fix: starts from `master`, goes to `master`, then to `development`. |

In flyavg-app there is also `main`, the legacy static landing that is live today. It is outside this workflow: never base work on it, never open PRs to it.

## Promotion chain

```text
<type>/AVG-<n> ─▶ development ─▶ staging ─▶ master
```

Until `staging` exists the chain is `development ─▶ master`. Every hop has its own PR. Details, commands and who decides each hop: `flyavg-promote`.

## Branch name (canonical)

Format: `<type>/AVG-<n>`.

- Good: `feature/AVG-12`, `fix/AVG-87`, `chore/AVG-133`.
- Bad: `mario-work`, `feature/stuff`, `feature/AVG-12-login-page` (no description in the name), `FIX-AVG-12`.

## Ticket folder (mandatory)

At the root of each repository the ticket touches, create `AVG-<n>/` right after the branch, with four files. They may start with a heading only; they grow during the work. They are written in pt-PT, the project's language.

| File | Purpose |
|---|---|
| `requirements.md` | Ticket context from Rasteia, the linked requirements (codes and definitions), acceptance criteria. |
| `plan.md` | Technical approach, decisions with their reason, risks, open questions. |
| `tasks.md` | Executable breakdown, as checkboxes. |
| `implementations.md` | Notes while implementing; a closing overview of what was delivered. |

Suggested order: requirements, plan, tasks, code, implementations.

Before creating a new branch, check `development` for a leftover ticket folder from a merged ticket (`ls -d AVG-*/`). If there is one, clean it on `development` first (see below).

## Removing the ticket folder: always on `development`

The folder is working material and must not survive on `development` after the merge. It is removed in its own `chore` commit on `development`, never on a feature branch:

```bash
git checkout development && git pull --ff-only origin development
git rm -r AVG-<n>
git commit -m "chore(AVG-<n>): remove ticket folder after merge"
git push origin development
```

If you find an old ticket folder in the middle of another branch, do not remove it there. Stash your work, clean it on `development` as above, go back, `git rebase development`, `git stash pop`.

## PR flow for a ticket

1. Branch from an up-to-date `development`: `git fetch origin && git checkout -b <type>/AVG-<n> origin/development`.
2. Create the ticket folder and its four files.
3. Implement following the repo's code skill. Commit following `001-commits.md`, only when the user asks.
4. Before the PR, run the review skill of the repo (read-only review subagent) and fix what it finds.
5. Rebase on `origin/development`: `git fetch origin && git rebase origin/development`. Never merge `development` into the branch.
6. With the user's OK, push: `git push -u origin <type>/AVG-<n>`.
7. Ask, then open the PR to `development` with the title and body from `002-pr-description.md`.
8. Integration: the user integrates, unless they asked "auto accept" for this ticket. Then the agent fast-forwards on the command line (`flyavg-promote`, step 1).
9. After integration, remove the ticket folder on `development`.

> **Linear history is not negotiable.** Integration is a fast-forward of rebased commits: `git push origin <type>/AVG-<n>:development`. No merge commits, no squash, no "Rebase and merge" (it rewrites SHAs and makes long-lived branches diverge).

## Long tickets

If a ticket lasts more than a week, prefer incremental PRs to `development` behind a feature flag over a long-lived branch that drifts.

## Anti-patterns

- Committing or pushing without the user's explicit request.
- Working directly on `development` or `master`.
- Branch named after a person or with a description.
- Removing a ticket folder on a feature branch, or before the PR is integrated.
- Integrating through the GitHub button, `gh pr merge`, `git merge`, squash or "Rebase and merge".
- Force-pushing `development`, `staging` or `master` without explicit OK (the only sanctioned case is reconciling a diverged promotion, see `flyavg-promote`).
- `git commit --amend` on pushed commits without the user's OK.
- Deleting any branch, local or remote.
- Touching `main` in flyavg-app.
