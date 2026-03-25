# coco-web

First version of Coco's owned site: a lightweight static homepage with no framework build step and no backend.

## Stack

- Plain HTML + CSS
- No runtime dependencies
- Designed to deploy directly from the repo root on Cloudflare Pages

## Local preview

From the repo root, run either option:

### Option A — Python

```bash
python3 -m http.server 8080
```

Then open: <http://localhost:8080>

### Option B — Node

```bash
npx serve .
```

Then open the local URL printed in your terminal.

## Files

- `index.html` — homepage markup
- `styles.css` — site styling

## Deploy to Cloudflare Pages

This repo is set up to work as a **static site** with automatic deploys from GitHub `main`.

### One-time setup

1. Push this repo to GitHub.
2. In Cloudflare, go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Select the `i-am-coco/coco-web` repository.
4. For production, set:
   - **Production branch:** `main`
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
5. Save and deploy.

### Auto-deploy behavior

- Every push to `main` triggers a production deploy.
- Pull requests/branch previews can be enabled in Cloudflare Pages if desired.

## Notes

- No backend required.
- No build pipeline required.
- If you later add a contact form, keep it static-first unless there's a strong reason not to.
