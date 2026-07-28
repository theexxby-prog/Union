# CLAUDE.md — Union

Read this first, then `docs/01-brief.md` through `docs/05-deploy.md`, then open
`reference/screens.html` in a browser. The reference file is the visual target.
Prose describes intent; the HTML shows the answer. When they disagree, the HTML wins.

## What this is

**Union** is the client-facing portal for **Datamatics Business Solutions (DBSL)**.
A client sees everything they are running with DBSL in one place — data services,
programmatic media, lead generation, documents, invoices.

## Trajectory — read before proposing architecture

Union is intended to become **the successor to the existing Pulse platform**, not a
second front end alongside it. Pulse is frozen: it is now client-visible and takes
no further feature work. Over time Union absorbs what Pulse does — including the
ops-facing side (campaign setup, delivery operations, admin) — and Pulse retires.

Two partner integrations land in Union on the way there: **Relish** (contact and
company enrichment) and **Propensity** (programmatic advertising reporting). Both
are read via partner APIs. The September epics describe that work.

**Current phase is still demo.** The constraints below are real and binding *now*,
but they are phase-scoped, not permanent. Do not quietly break them because the
trajectory implies they will change one day — but do say so when a request has
crossed the line, so they can be retired deliberately rather than eroded.

### Phase-scoped constraints (binding in the current phase)

- All data is mock. Fixtures in the repo. No backend, no database, no API calls.
- No authentication. No login form. No user accounts. No sessions. Audience and
  account selection are "viewing as" devices, not sign-in.
- No environment variables. No API keys. No secrets. If you find yourself wanting
  a `.env`, you have misunderstood the current scope.
- No analytics, no telemetry, no error reporting services.
- It must build with `npm run build` and deploy as a static site with zero config.

### What will have to change when the phase does

Recorded so the eventual change is a decision rather than a surprise:

- **Writes.** Everything today is read-only presentation over derived fixtures.
  Campaign setup and ops workflows mean mutation — which brings validation,
  permissions, and audit, none of which exist.
- **Hard rule 4** (one fixtures module) is what makes every screen reconcile. It
  works because nothing changes. It does not survive real mutable state, and the
  reconciliation gate will need rethinking at the same time.
- **Auth.** The account picker is the seam where a real session eventually goes,
  and the entitlement gating on tabs is already the shape role gating will need.
- **The Propensity API key** must never reach client-side code — query-parameter
  auth means it would land in logs and referrers. Server-side only, whenever a
  server appears.

## Hard rules

1. **Never write "Datamatics" alone.** It is "Datamatics Business Solutions" or
   "DBSL". This is a binding brand rule from the client's playbook. Applies to UI
   copy, comments, README, everything.
2. **Do not touch or reference the existing Pulse app.** Different product,
   different repo, different design language. Union is built fresh. Do not import
   Pulse components, do not copy its patterns, do not mention it in the codebase.
3. **Typefaces are Montserrat and Sora only.** Never Inter, Roboto, Arial, Poppins,
   or system-ui as a primary. Self-host via `@fontsource-variable/montserrat` and
   `@fontsource-variable/sora`. No Google Fonts `<link>` at runtime.
4. **All displayed numbers come from one fixtures module.** Never hardcode a number
   in a component. See `docs/04-data-model.md` — this is the single most important
   structural rule in the build. Three accounts across seven screens must stay
   numerically consistent, and the only way that holds is derivation from one source.
5. **No gradients, no drop shadows, no glassmorphism** in the product UI.
6. **Electric Cyan and Electric Yellow are banned from the product UI.** They are
   marketing colors. See `docs/02-design-system.md`.

## Stack

React 18 · TypeScript · Vite 6 · Tailwind CSS 4 · React Router 7

Tailwind 4 uses CSS `@theme` — there is no `tailwind.config.js`. Do not create one.

Path alias `@` resolves to `src/`.

## Build order

Work in this sequence. Do not skip ahead to screens before the token layer and
fixtures are done — everything downstream depends on them.

1. Scaffold: Vite + React + TS, Tailwind 4, React Router 7, fontsource packages
2. Token layer: `src/styles/` — import `dbsl-tokens.css`, add the product extension
3. Types + fixtures: `src/data/` — three accounts, fully populated
4. Shell: chrome, tabs, account switcher, entitlement gating
5. Screens in order: Overview → Leads → Documents → Invoices → Data → Media → Support
6. Account picker entry screen
7. `npm run build` clean, `tsc --noEmit` clean

## Verification before you call it done

- `npm run build` succeeds with no errors
- `npx tsc --noEmit` passes
- Every account renders every entitled screen without a crash
- Switching accounts changes nav, hero copy, and every number on screen
- No number appears in any `.tsx` file — grep for digits in components and justify
  every hit
- No occurrence of the word "Datamatics" that is not followed by "Business Solutions"
- No `.env`, no API call, no `fetch()` to anything

## Things that are not in scope

Dark mode. Mobile layouts below 768px (desktop-first, graceful is enough).
Internationalisation. Accessibility beyond sane semantics, visible focus rings, and
alt text. Tests. Storybook. A component library.

Do not add these. If a screen would be better with one, note it and move on.

## Layout revision — shipped 27 Jul 2026

Two user-approved changes are now in the build. Do not undo them.

**"Option A — soft grey canvas"** (approved 24 Jul): the content canvas is brand
Soft Grey `#F4F7FB`; every section sits on a white rounded card over it, so white
reads as "content", not "background". Chrome and tabs stay white (navy chrome
Option B was NOT chosen). Hero card, navy total rule, and pills unchanged.

**"Keep top tabs, widen + enlarge"** with **"+25%, presentation-first" type**
(approved 27 Jul): chrome and tabs are full-bleed and sticky; content runs to
`max-width: 1560px` with 32px side padding; the whole type scale moved up ~25%
(body 15px). See the *Layout canvas* and *Typography* sections of
`docs/02-design-system.md` for the recorded values.

Screens compose from `Section` / `Cols` / `Row` / `TableHead` in
`src/components/ui.tsx`. Do not reintroduce loose row-lists sitting directly on
the grey canvas — they must be wrapped in a `Section`.
