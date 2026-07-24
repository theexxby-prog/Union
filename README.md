# Union

A client-facing portal for **Datamatics Business Solutions (DBSL)**. A client
signs in and sees everything they run with DBSL in one place — data services,
programmatic media, lead generation, documents, and invoices.

This is an **internal demo artifact**: all data is mock, there is no backend, no
authentication, and no API. See `CLAUDE.md` and `docs/` for the full brief and
the binding brand rules.

## Stack

React 18 · TypeScript · Vite 6 · Tailwind CSS 4 · React Router 7

Tailwind 4 is configured entirely through the `@theme` block in
`src/styles/tokens.css` — there is no `tailwind.config.js`. The `@` path alias
resolves to `src/`.

## Develop

```bash
npm install
npm run dev        # start the dev server
npm run build      # typecheck + production build to dist/
npm run typecheck  # tsc --noEmit
npm run verify     # reconcile every number across all accounts (docs/04)
```

## How the data works

Every number in the app derives from one module, `src/data/accounts.ts`. No
component contains a literal figure — three accounts across seven screens stay
consistent only because everything is computed from raw inputs there:

- percentage = `received / target`
- accept rate = `billable / delivered`
- invoice total = sum of its line items
- invested to date = sum of all invoice totals

`npm run verify` enforces these relationships and fails the build if any number
drifts.

## Layout

```
src/
  styles/tokens.css   token layer — brand tokens + product-scale extension + @theme
  data/               types, fixtures (accounts.ts), formatting helpers
  components/         shell chrome, status pills, layout primitives
  screens/            one file per route
docs/                 brief, design system, screen specs, data model, deploy
brand/                DBSL brand rules + official design tokens (binding)
reference/            screens.html — the rendered visual target
scripts/              reconciliation check
```

## Deploy

Static site on Vercel. `vercel.json` carries the SPA rewrite (the negative
lookahead on `assets/` is load-bearing). See `docs/05-deploy.md`.
