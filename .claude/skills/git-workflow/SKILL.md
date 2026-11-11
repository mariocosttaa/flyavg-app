---
name: flyavg-git
description: >
  Git workflow for FlyAVG (flyavg-api and flyavg-app): branch roles and names (<type>/AVG-123),
  the ticket folder, commits (Conventional Commits in English, no trailers), rebase-only linear
  history, pull requests and their description in pt-PT. Use when creating a branch, starting a
  ticket, committing (only when the user asks), preparing or opening a PR, rebasing, or when the
  user mentions git, branch, commit, push, PR, merge or rebase. Promotions between long-lived
  branches are in flyavg-promote.
---

# flyavg-git: branches, commits and pull requests

| | |
|---|---|
| **Folder** | `.claude/skills/git-workflow/` (identical copy in flyavg-api and flyavg-app) |
| **Skill name** | `flyavg-git` |
| **Sibling skills** | `flyavg-promote` (promotion chain), `flyavg-pr-summary` (feature summary), the repo's code skill (`flyavg-api-code` or `flyavg-app-code`) and review skill (`flyavg-api-review` or `flyavg-app-review`) |

## Step 0 (mandatory)

Read in full, in this order:

1. `references/000-workflow.md`: branch roles, names, ticket folder, PR flow, linear history.
2. `references/001-commits.md`: commit message format, modular commits, no trailers.
3. `references/002-pr-description.md`: title and body of a PR, in pt-PT.

## Quick checklist

- [ ] Never run `git commit` or `git push` without an explicit request from the user. Each commit and each push needs its own OK; "carry on" is not a standing authorization.
- [ ] Work starts from `development`, on a branch named `<type>/AVG-<n>` (types: `feature`, `fix`, `chore`, `refactor`, `hotfix`). No description in the branch name.
- [ ] Right after creating the branch, create the ticket folder `AVG-<n>/` at the repo root with `requirements.md`, `plan.md`, `tasks.md`, `implementations.md`.
- [ ] Commits in English, Conventional Commits, imperative, first line ≤ 72 characters, one logical change per commit, no trailers.
- [ ] Rebase on `origin/development` before the PR; never merge `development` into the branch.
- [ ] PR to `development`, title `<type>(AVG-<n>): <pt-PT description>`, body in pt-PT.
- [ ] Integration is fast-forward on the command line only. Never the GitHub merge button, `gh pr merge`, `git merge`, squash or "Rebase and merge".
- [ ] Never delete branches, local or remote. Only the user deletes branches.
- [ ] The ticket folder leaves the repo in a `chore` commit on `development`, after the merge. Never on the feature branch.
- [ ] Multi-repo tickets go up together, in this order: `flyavg-api`, then `flyavg-app`.

## Repositories and long-lived branches

| Branch | Role |
|---|---|
| `master` | Production. Last stable version. |
| `staging` | Pre-production. **Does not exist yet**: until it does, promotion goes `development → master`. |
| `development` | Integration. Daily base: tickets start here and come back here. |
| `main` (flyavg-app only) | Legacy branch with the static "coming soon" page that is live today. **Not part of this workflow**: never branch from it, never target it, never promote into it. Mário will retire it. |

## Tracker

Tickets live in Rasteia (project AVAGroup, key `AVG`). The ticket code `AVG-<n>` is the same in the branch, the folder, the commit scope and the PR title. Requirement codes look like `AVG_NFR_002`. Use the `rasteia` skill to read a ticket and its requirements before writing `requirements.md`.
