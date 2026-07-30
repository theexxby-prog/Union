# Bubbler

A standalone, single-file web app for punching see-through "bubbles" into a
masked photo. Pick a photo, cover it with a mask (black / white / blur / custom
color), then tap to add draggable, pinch-resizable bubbles that reveal the photo
underneath. Export via the native share sheet or as a PNG download.

Everything lives in `index.html` — no build step, no dependencies, no backend.
It is unrelated to the Union portal; it just shares this repository.

## Deploying to Cloudflare Pages

Three options, fastest first:

### Option 1 — Direct upload (no setup, ~1 minute)

1. Go to the Cloudflare dashboard → **Workers & Pages** → **Create** →
   **Pages** → **Upload assets**.
2. Name the project (e.g. `bubbler`) and drag the `bubbler` folder (or just
   `index.html`) into the upload box.
3. Done — it's live at `https://bubbler.pages.dev` (or similar).

### Option 2 — Auto-deploy from GitHub Actions

The workflow at `.github/workflows/deploy-bubbler.yml` deploys this folder to
Cloudflare Pages on every push to `main` that touches `bubbler/`. To enable it,
add two repository secrets (**Settings → Secrets and variables → Actions**):

- `CLOUDFLARE_API_TOKEN` — create at dash.cloudflare.com → My Profile →
  API Tokens, using the **Edit Cloudflare Workers** template (covers Pages).
- `CLOUDFLARE_ACCOUNT_ID` — shown in the dashboard URL or on any zone's
  Overview page.

Then run the workflow manually once (**Actions → Deploy Bubbler to Cloudflare
Pages → Run workflow**) or push to `main`. The first run creates the Pages
project automatically.

### Option 3 — Wrangler from your own machine

```sh
npx wrangler login
npx wrangler pages deploy bubbler --project-name=bubbler
```
