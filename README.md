# coco-web

Coco's site is now a **real decision inbox for Derek**, backed by a Cloudflare-friendly submit path instead of placeholder dashboard questions.

## What shipped

- `index.html` — homepage with concrete artifact cards, explicit human asks only when needed, and A/B/C + Other response capture
- `app.js` — client-side rendering, submit handling, latest-response log, and explicit storage-status messaging
- `functions/api/decisions.js` — Cloudflare Pages Function for `GET /api/decisions` and `POST /api/decisions`, including Telegram alert delivery after a successful save
- `shared/decision-cards.js` — single source of truth for the shipped artifact cards shown in the inbox
- `state/index.html` — compact `/state/` companion route without placeholder asks
- `styles.css` — shared dense operator-console styling

## Stack

- Plain HTML + CSS + small browser-side JS
- Cloudflare Pages Functions for the API route
- Cloudflare D1 as the durable decision store
- Telegram Bot API as the outbound decision alert path
- No build step

## Local preview

### Static-only preview

```bash
python3 -m http.server 8080
```

Then open:

- <http://localhost:8080>
- <http://localhost:8080/state/>

This renders the UI, but the API route is not available under a plain static server.

### Full-stack Pages preview

```bash
npx wrangler pages dev . --d1 DECISION_DB
```

Then open the local URL printed by Wrangler.

That gives you:

- `/` — inbox UI
- `/state/` — operator snapshot
- `/api/decisions` — Pages Function with a local D1 binding

The function auto-creates its table on first use, so no separate local migration step is required.

To exercise the real alert path locally, also provide:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Production deploy

This repo still deploys directly from `main` to Cloudflare Pages via GitHub Actions.

### Existing deploy assumptions

- **Production branch:** `main`
- **Framework preset:** `None`
- **Build command:** *(leave empty)*
- **Build output directory:** `/`

### Required Pages config

Production needs:

- a **D1 binding** named `DECISION_DB`
- a Pages secret named `TELEGRAM_BOT_TOKEN`
- a Pages secret named `TELEGRAM_CHAT_ID`

Once those are present, `POST /api/decisions` both persists Derek responses and sends a Telegram alert.
