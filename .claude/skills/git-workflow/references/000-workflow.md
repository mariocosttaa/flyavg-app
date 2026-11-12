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

## Task delivery flow (standing rule from Mário, 2026-11-12)

Mário approved this flow for every Rasteia task. It is the standing authorization for commits, pushes and the ticket → `development` integration; it does not cover `staging` or `master`.

1. **Pick up.** Read the task, its subtasks and its linked requirements in Rasteia (`rasteia` skill, FlyAVG keys). Set the task to `em_curso` immediately.
2. **One task, one subagent, one worktree.** The coordinating session launches a subagent per task, working in its own worktree, never in the main checkout:
   ```bash
   git -C <repo> fetch origin
   git -C <repo> worktree add ../.worktrees/<repo>-AVG-<n> -b <type>/AVG-<n> origin/development
   ```
   Tasks in different repos, or touching different files, run in parallel. Tasks touching the same files run one after the other.
3. **Implement.** Ticket folder first, then code and tests following the repo's code skill. The task agent commits (`001-commits.md`) and pushes its branch.
4. **Review before delivering.** A read-only review subagent runs the repo's review skill on the branch. All checks pass (`npm run check`, or the scripts in the code skill). Findings are fixed before delivery.
5. **Deliver without waiting.** Rebase on `origin/development`, open the PR to `development` (`002-pr-description.md`), and integrate it by fast-forward on the command line (`flyavg-promote`, step 1). Then remove the ticket folder on `development` and remove the worktree (`git worktree remove`). Never delete the branch.
6. **Close in Rasteia.** Tick each subtask that is really done, by sending the full `subtasks` list `[{ id, title, done }]` in `PATCH /work-items/{id}` (there is no per-subtask route). Set the task to `concluida` only when every subtask is ticked; otherwise it stays `em_curso` and the summary says what is missing.
7. **Promotion to `master` always asks Mário first.**

## PR flow for a ticket

1. Branch from an up-to-date `development` in a worktree (see above).
2. Create the ticket folder and its four files.
3. Implement following the repo's code skill. Commit following `001-commits.md`.
4. Before the PR, run the review skill of the repo (read-only review subagent) and fix what it finds.
5. Rebase on `origin/development`: `git fetch origin && git rebase origin/development`. Never merge `development` into the branch.
6. Push: `git push -u origin <type>/AVG-<n>`.
7. Open the PR to `development` with the title and body from `002-pr-description.md`.
8. Integrate by fast-forward on the command line (`flyavg-promote`, step 1), without waiting, under the task delivery flow.
9. After integration, remove the ticket folder on `development`, update Rasteia, remove the worktree.

> **Linear history is not negotiable.** Integration is a fast-forward of rebased commits: `git push origin <type>/AVG-<n>:development`. No merge commits, no squash, no "Rebase and merge" (it rewrites SHAs and makes long-lived branches diverge).

## Long tickets

If a ticket lasts more than a week, prefer incremental PRs to `development` behind a feature flag over a long-lived branch that drifts.

## Anti-patterns

- Committing or pushing outside the task delivery flow without the user's explicit request.
- Working directly on `development` or `master`.
- Branch named after a person or with a description.
- Removing a ticket folder on a feature branch, or before the PR is integrated.
- Integrating through the GitHub button, `gh pr merge`, `git merge`, squash or "Rebase and merge".
- Force-pushing `development`, `staging` or `master` without explicit OK (the only sanctioned case is reconciling a diverged promotion, see `flyavg-promote`).
- `git commit --amend` on pushed commits without the user's OK.
- Deleting any branch, local or remote.
- Touching `main` in flyavg-app.
