# 001: Commits

Rules for every commit, on any branch. The branch workflow is in `000-workflow.md`.

## Who commits

Inside the **task delivery flow** (`000-workflow.md`), the task agent commits and pushes its own branch: Mário approved that as a standing rule. Outside it, the agent does **not** run `git commit` or `git push` unless the user explicitly asks ("commit this", "push the branch"); it leaves the changes ready, shows `git status` and the diff, and suggests messages.

## Format (Conventional Commits 1.0.0)

```text
<type>(<scope>): <short description in the imperative>

<optional body: what and why, wrapped at 72>

<optional footer: BREAKING CHANGE: ...>
```

- **Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `build`, `ci`, `revert`.
- **Scope:** the ticket code (`feat(AVG-12): add pilot registration endpoint`) or a domain (`fix(auth): rotate refresh token on reuse`). Ticket work uses the ticket code.
- **Language:** English, imperative ("add", "fix", "remove", not "added" or "fixing"), no final period, first line ≤ 72 characters.

## Modular commits

One commit = one logical change. Do not mix a refactor, a feature, docs and config in the same commit. Use `git diff` and `git add -p` to split.

Good sequence for a ticket:

```text
chore(AVG-12): add ticket folder
feat(AVG-12): add airline entity and migration
feat(AVG-12): add airline list endpoint with pagination
test(AVG-12): cover airline list filters
chore(AVG-12): bump version to 0.3.0
```

Never leave loose "wip", "fix typo" or "address review" commits in what goes up: fold them into the commit they belong to (interactive rebase on the feature branch is fine, it is disposable).

## Version bump

When a ticket changes behaviour, its last commit bumps `version` in that repo's `package.json` with SemVer (major: incompatible change; minor: new behaviour; patch: fix). Propose the number to the user. In flyavg-api the version also stamps the published OpenAPI document. Commit: `chore(AVG-<n>): bump version to <x.y.z>`.

## No trailers (inviolable)

Never include tool trailers in a commit message:

- `Co-Authored-By: ...` added by a tool (Claude, Cursor, Copilot)
- `Generated with ...`, `Generated-by: ...`, `Made-with: ...`

The `commit-msg` hook in `.githooks/` strips them, but write messages without them in the first place. Enable the hooks once per clone: `git config core.hooksPath .githooks`.

The `pre-commit` hook blocks `CLAUDE.md`, `CLAUDE.local.md` and `.claude/settings.local.json`. Agent instructions live in `.claude/skills/`, which is versioned.
