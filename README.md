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

## Pages

| URL | Brand | Look |
|---|---|---|
| `/` | AVAGroup | Night and amber, Sora |
| `/taag-virtual/` | TAAG Virtual | Light surface and dark brown panels inspired by flytaag.com, Kufam for headings, Sora for text |
| `/world-virtual/` | World Virtual | World blue, Sora |

## Files

| File | What it holds |
|---|---|
| `index.html`, `taag-virtual/index.html`, `world-virtual/index.html` | **Generated**: do not edit by hand, see below |
| `tools/templates/*.html` | Page markup, with `<!--LOGO-->` and `<!--MARK-->` placeholders |
| `tools/build.py` | Inlines the brand-kit logos into the templates |
| `copy.js` | AVAGroup texts (EN and PT). Only EN is active for now: see `LANGS` in `main.js` |
| `taag-virtual/page.js`, `world-virtual/page.js` | Texts and routes of each airline |
| `styles.css` | Shared layout and animation, with semantic tokens (`--bg`, `--fg`, `--accent`…) |
| `taag-virtual/theme.css`, `world-virtual/theme.css` | Token overrides per airline |
| `main.js` | Language, intro, routes map, departure board, parallax |
| `nginx.conf` | gzip, cache headers, font MIME type, relative redirects |

## Changing a page

Edit the template in `tools/templates/`, then regenerate (the brand kit lives next to this repo):

```sh
python3 tools/build.py ../brand-design
```

The logos are inlined, not linked, so the letters, flight line and plane can animate.
Flight numbers and routes are demo data.
