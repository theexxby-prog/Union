# 05 · Deploy

Target: **`union.mehtahouse.cc`**, static site on Vercel.

There are no secrets, no environment variables, and no backend. If a step in this
build ever seems to require an API key, the scope has been misunderstood.

## Vercel settings

Vercel auto-detects Vite. Confirm:

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |
| Node version | 20 or 22 |

## SPA routing — do not skip this

React Router uses client-side routes. Without a rewrite, a direct hit on
`/acme/invoices` returns 404. Add `vercel.json` at the repo root:

```json
{
  "rewrites": [
    { "source": "/((?!assets/).*)", "destination": "/index.html" }
  ]
}
```

The `(?!assets/)` negative lookahead is load-bearing. A plain `/(.*)` catch-all
serves `index.html` for JavaScript asset requests, which breaks the app the first
time a chunk filename changes after a rebuild.

## Steps for the repo owner

1. Create a new **empty** GitHub repo — no README, no `.gitignore`, no licence
2. Upload the project files through the GitHub web UI (`Add file` → `Upload files`,
   drag the folder in). No git commands needed
3. In Vercel: `Add New` → `Project` → import the repo → Deploy
4. Vercel → Project → Settings → Domains → add `union.mehtahouse.cc`
5. Vercel shows the exact CNAME record — add it at the DNS provider for
   `mehtahouse.cc`. Propagation is usually minutes
6. Optional while internal: Settings → Deployment Protection → Password Protection

After this, every future change is: replace the files in GitHub, Vercel redeploys
automatically.

## Do not

- Do not push to the Pulse repo or any existing Datamatics Business Solutions repo
- Do not modify anything relating to `pulse.datamaticsbpm.com` or
  `datamatics.mehtahouse.cc` — those are separate and stay untouched
- Do not commit a `.env` file. There should be nothing to put in one

## Notes on `.gitignore`

Include at minimum:

```
node_modules
dist
.DS_Store
*.local
.vercel
```
