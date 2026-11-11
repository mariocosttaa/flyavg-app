---
name: flyavg-app-review
description: Code review for flyavg-app (FlyAVG React 19 + Vite + React Router 7 SPA) at the end of every ticket, before the pull request. Runs a read-only review subagent over the diff against development with the FlyAVG checklist (i18n, design tokens, accessibility, URL state for lists, lazy routes, auth/session, tests, no admin code in the portal bundle) and returns ranked findings. Use when an implementation is finished, before opening or approving a PR, when reviewing a diff or branch, or when the user says "review", "code review", "revê", "check before PR" in flyavg-app.
---

# flyavg-app review

The final step of every implementation in flyavg-app, **before** the rebase, push and PR.
Whoever wrote the code does not review it: the review runs in a subagent with a clean context
and only reads.

Sibling skills: **`flyavg-app-code`** (the standards being checked), **`flyavg-git`**
(branches, commits, PR; read it after the review), **`flyavg-promote`** (promotions).

## When

All of these are true:

- The ticket's implementation is complete on its branch `<type>/AVG-123`.
- The checks from `flyavg-app-code` pass: typecheck, lint, unit tests, build, and e2e when a
  critical flow changed.
- The ticket folder (see `flyavg-git`) explains what was asked and what was done.

Also on request, for any branch or diff the user names.

## Steps

1. Collect: branch name, ticket code and summary, the user's constraints (what must not
   change), and decisions taken on purpose that a reviewer might flag.
2. Launch one subagent (`Agent` tool, `general-purpose`) with the prompt below, filled in.
   It must not edit files, run git write commands, install packages or push.
3. When it returns, show the user the findings in pt-PT, each with your recommendation: fix
   now, fix in a follow-up ticket, or ignore (with the reason).
4. Decide with the user what to fix. Apply only the agreed fixes, rerun the checks, and note
   in the ticket folder what changed because of the review.
5. Only then rebase, push and open the PR (`flyavg-git`), each step only when the user asks.
   Commits may already exist on the branch (the user may ask for them earlier); the review
   covers committed and uncommitted work alike.

## Subagent prompt (template)

```text
You are reviewing a change in flyavg-app at <absolute repo path>. You only read and run
read-only checks. Do not edit files, do not run git commands that change state, do not
install packages, do not push.

Read, in this order:
1. .claude/skills/code-review/SKILL.md and .claude/skills/code-review/references/checklist.md
2. .claude/skills/code-agent/SKILL.md
3. The code-agent references that match the change: <list, e.g. 003, 004, 008, 011, 012, 013>

What was asked:
<ticket AVG-123: title, goal, acceptance criteria, constraints, what must not change>

What was done:
- Branch: <type>/AVG-123, compared with development.
- See the whole change, committed and not committed:
    BASE=$(git merge-base development HEAD)
    git diff $BASE --stat && git diff $BASE
    git status --porcelain
    git ls-files --others --exclude-standard   (read new untracked files in full)
- Author's notes: <ticket folder path and the files in it>.
- Deliberate decisions to confirm, not to flag blindly: <list>

Points of attention:
<tricky logic, edge cases, places where tests could pass without the change, scope creep>

You may run: npm run typecheck, npm run lint, npx vitest run <paths>, npm run build
(and inspect dist/ for the portal/admin boundary). Do not run e2e against shared environments.

Output, in English:
- Findings ranked from most to least severe. Each one: number, severity (Blocker / Should fix
  / Note), file:line, the problem, a concrete failure scenario, and the suggested fix.
- Only findings you verified in the code. Mark anything uncertain as "Unverified".
- Checklist sections with nothing to report: one line saying "OK".
- End with a verdict: approve, approve with notes, or request changes.
```

The subagent replies in English; translate for the user when presenting.

## Severity

| Level | Meaning | Examples |
|---|---|---|
| Blocker | Must be fixed before the PR | Security issue, token in storage, admin code in portal bundle, broken flow, hardcoded UI strings, missing `en` keys, failing checks |
| Should fix | Fix in this ticket unless the user decides otherwise | Missing tests for changed behaviour, list state not in URL, a11y gap, raw color, missing empty/error state |
| Note | Optional | Naming, small simplifications, follow-up ideas |

## Rules

- One review per ticket at the end, plus a short re-review only if the fixes were large.
- The reviewer never fixes; the main session fixes after agreement.
- Findings about other repos (API contract, error codes) become a request to the API's agent
  through the user, never edits in `flyavg-api`.
