---
name: flyavg-promote
description: >
  Moves a FlyAVG ticket up the chain <type>/AVG-123 → development → staging → master, in
  flyavg-api and flyavg-app: pre-flight checks, the PR to development (integrated by the agent
  only on "auto accept"), removing the ticket folder on development, and the promotion PRs to
  staging and master, always fast-forwarded on the command line and always asking before
  staging or master. Use when the user says promote, ship, release, "abrir PR", "subir",
  "passar para staging/master", "auto aceitar", "fechar o ticket" or "remover a pasta".
  Branch names and commits are in flyavg-git.
---

# flyavg-promote: from ticket to production

| | |
|---|---|
| **Folder** | `.claude/skills/promote-ticket/` (identical copy in flyavg-api and flyavg-app) |
| **Skill name** | `flyavg-promote` |
| **Complements** | `flyavg-git` (branches, commits, PR text) |

## The chain

```text
<type>/AVG-<n> ─▶ development ─▶ staging ─▶ master (production)
      PR #1           PR #2         PR #3
```

**`staging` does not exist yet.** Until Mário creates it, PR #2 goes `development → master` and Step 4 is skipped. Keep the staging steps; they apply as soon as the branch exists (check with `git ls-remote --heads origin staging`).

`main` in flyavg-app is the legacy static landing and is never part of a promotion.

| Hop | PR | Who integrates |
|---|---|---|
| ticket → `development` | always opened by the agent | The user, unless they asked **auto accept** for this ticket |
| `development` → `staging` | always opened by the agent | **Always ask.** Auto accept does not apply |
| `staging` (or `development`) → `master` | always opened by the agent | **Always ask.** Production |

Auto accept covers only the hop and the ticket it was asked for.

## Rules for every step

- **Commits and pushes only on explicit request.** Ask before each one.
- **Linear history.** Integrate only by fast-forward on the command line: `git push origin <source>:<target>`. GitHub marks the PR as merged by itself. Never the merge button, `gh pr merge`, `git merge`, squash or "Rebase and merge".
- **Same SHAs at the end.** Promotion creates no new commits. When a promotion is done, the branches it passed through point to the same commit:
  ```bash
  git fetch origin
  git rev-parse origin/development origin/master        # add origin/staging when it exists
  ```
  If `development` got a commit after the promotion (e.g. the folder removal), promote it too.
- **Update the local ref before pushing it.** `git push origin X:Y` sends the local `X`: run `git fetch origin X:X` first.
- **Several repositories go up together**, in order: `flyavg-api`, then `flyavg-app`, at every hop. Never leave one repo promoted and the other behind.
- **Never delete branches**, not even after integration.
- **Deploys are Coolify's job.** Coolify builds each environment from its branch. After a promotion, check the deployment finished for the right commit (the `bindamy-vps` skill shows how) before saying it is live. Decided (AVG-7): `development` deploys automatically to the dev environment (`dev.flyavg.com`, `api.dev.flyavg.com`); `master` deploys to production (`app.flyavg.com`, `api.flyavg.com`) and only moves with the user's explicit approval; `staging` comes later, when the branch is created.

## Step 0: before going up

1. **Version.** If the ticket changes behaviour, bump `version` in `package.json` as the ticket's last commit (`flyavg-git`, `001-commits.md`). Propose the number.
2. **Rebase on `development`:** `git fetch origin && git rebase origin/development`. Never merge the other way.
3. **Local checks, all green.** The exact scripts are in the repo's code skill; at least lint, typecheck, unit tests, e2e of the touched flows, build and `npm audit --audit-level=high`.
4. **Review.** The repo's review skill ran and its findings are fixed or explicitly accepted by the user.
5. **Brand.** No hardcoded group name in code: `grep -rn "AVAGroup" src/` returns only i18n strings or seeds, never logic (requirement AVG_GRP_009).

## Step 1: PR of the ticket to `development`

1. With the user's OK: `git push -u origin <type>/AVG-<n>`.
2. Ask, then open the PR (title and pt-PT body from `flyavg-git`, `002-pr-description.md`):
   ```bash
   gh pr create --base development --head <type>/AVG-<n> \
     --title "<type>(AVG-<n>): <pt-PT description>" --body-file <body.md>
   ```
3. **Without auto accept:** stop here and tell the user the PR is waiting.
   **With auto accept for this ticket**, once checks are green:
   ```bash
   git fetch origin development
   git rebase origin/development                              # only if development moved
   git push --force-with-lease origin <type>/AVG-<n>          # only after that rebase
   git merge-base --is-ancestor origin/development <type>/AVG-<n>   # must pass
   git push origin <type>/AVG-<n>:development                 # fast-forward
   ```
   Rewriting the feature branch is fine, it is disposable. `development` is never rewritten.
4. Confirm: `gh pr view <n> --json state` returns `MERGED`.

## Step 2: remove the ticket folder, on `development`

```bash
git checkout development && git pull --ff-only origin development
git rm -r AVG-<n>
git commit -m "chore(AVG-<n>): remove ticket folder after merge"
git push origin development
```

Never on the feature branch, never before the PR is integrated.

## Step 3: `development` → `staging` (when staging exists)

1. Open the promotion PR, for record and approval:
   ```bash
   gh pr create --base staging --head development \
     --title "release(staging): AVG-<n> <short pt-PT description>" --body-file <body.md>
   ```
2. **Ask** whether to integrate. Without an explicit yes, stop.
3. With the OK:
   ```bash
   git fetch origin development:development staging
   git merge-base --is-ancestor origin/staging development    # must pass
   git diff --stat origin/staging development                 # only the expected delta
   git push origin development:staging
   ```
4. If `--is-ancestor` fails, the branches diverged: see *Reconciling diverged long-lived branches* below.

## Step 4: `staging` → `master` (production)

While `staging` does not exist, the source is `development`.

1. Open the release PR:
   ```bash
   gh pr create --base master --head staging \
     --title "release(master): AVG-<n> <short pt-PT description>" --body-file <body.md>
   ```
2. **Ask.** Production never moves without an explicit yes for this step.
3. With the OK:
   ```bash
   git fetch origin staging:staging master
   git merge-base --is-ancestor origin/master staging         # must pass
   git push origin staging:master
   ```

## Step 5: close

- Branches promoted to the same SHA (`git rev-parse`).
- Coolify deployments finished for that SHA in every environment touched; the health check answers.
- Move the ticket in Rasteia only if the user asks (the `rasteia` skill; read before writing).
- Do not delete the feature branch. If it looks obsolete, say so and leave it to the user.

## Hotfix

`hotfix/AVG-<n>` starts from `master`, PR to `master` (always ask), then the same commits go to `development` (and `staging`) by fast-forward or, if `development` is ahead, by rebasing the hotfix onto it and following Step 1.

## Reconciling diverged long-lived branches

Symptom: `merge-base --is-ancestor` fails although the content is the same (a long-lived branch was rewritten). On the source branch, with the user's explicit OK for the force-push:

1. Measure the real content delta: `git diff --stat origin/<target> origin/<source>`.
2. Rebase the source on the target: `git rebase origin/<target>`. Patch-equivalent commits are skipped.
3. Doc conflicts: keep the target's version. In a rebase, `--ours` is the target: `git checkout --ours <file> && git add <file> && git rebase --continue`.
4. Validate: `git merge-base --is-ancestor origin/<target> <source>` and the diff stat shows only the expected delta.
5. `git push --force-with-lease origin <source>`. This is the only sanctioned force-push on a long-lived branch, and only with explicit OK.

## Anti-patterns

- Integrating into staging or master without asking, even after an earlier auto accept.
- The GitHub merge button, `gh pr merge`, `git merge`, squash, "Rebase and merge".
- Removing the ticket folder on the feature branch or before integration.
- Promoting the API without the app (or the opposite) in the same hop.
- Pushing a promotion with a stale local ref.
- Force-pushing a long-lived branch without explicit OK.
- Saying it is live before Coolify finished deploying that commit.
- Deleting branches. Touching `main` in flyavg-app.
