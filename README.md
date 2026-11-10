# flyavg-app

Coming soon page for **AVAGroup · Angola Virtual Airliners Group** (Season 3).

Static HTML, CSS and JS, no build step, served by nginx.

## Run locally

```sh
python3 -m http.server 8765
# open http://localhost:8765
```

## Git hooks

After cloning, enable the hooks once:

```sh
git config core.hooksPath .githooks
```

- `commit-msg` removes AI attribution trailers from commit messages.
- `pre-commit` blocks `CLAUDE.md` and `.claude/` from being committed.

## Deploy (Coolify)

- Build pack: **Dockerfile** (at the repo root)
- Port: **80**
- The image has a healthcheck on `/`

## Files

| File | What it holds |
|---|---|
| `index.html` | Markup, with the logo and icon SVG inlined from the brand kit |
| `copy.js` | All texts (EN and PT). Only EN is active for now: see `LANGS` in `main.js` |
| `styles.css` | Brand tokens, layout and animation |
| `main.js` | Language, intro, routes map, departure board, parallax |
| `nginx.conf` | gzip, cache headers, font MIME type |
