# coco-web

Coco's site is now a **static operator dashboard for Derek**, not a public landing page.

## What it contains

- `index.html` — homepage with the Derek inbox (`Need from Derek`) and an operator snapshot
- `state/index.html` — dedicated `/state/` route for goals, agents, KPIs, blockers, and next actions
- `styles.css` — shared styling for both pages

The content is intentionally **static-first** and Cloudflare Pages-friendly. Current values are placeholder/manual snapshots shaped to match a future live state feed.

## Stack

- Plain HTML + CSS
- No runtime dependencies
- No build step
- Designed to deploy directly from the repo root on Cloudflare Pages

## Local preview

From the repo root, run either option:

### Option A — Python

```bash
python3 -m http.server 8080
```

Then open:

- <http://localhost:8080>
- <http://localhost:8080/state/>

### Option B — Node

```bash
npx serve .
```

Then open the local URL printed in your terminal.

## Deploy to Cloudflare Pages

This repo is set up to work as a **static site** with automatic deploys from GitHub `main`.

### Production settings

- **Production branch:** `main`
- **Framework preset:** `None`
- **Build command:** *(leave empty)*
- **Build output directory:** `/`

## Notes

- No backend required.
- No SPA/router required.
- If live state is added later, prefer generating static files or static JSON over adding runtime complexity.
