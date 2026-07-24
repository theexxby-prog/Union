# 03 · Screens

`reference/screens.html` shows Overview, Leads, Documents and Invoices rendered.
Open it. It is more precise than this document for anything visual.

## Routes

| Route | Screen | Notes |
|---|---|---|
| `/` | Account picker | Entry. Choose which client you are viewing as |
| `/:accountId` | Overview | |
| `/:accountId/data` | Data | iData + CleanRich |
| `/:accountId/media` | Media | Programmatic |
| `/:accountId/leads` | Leads | Syndication + lead gen |
| `/:accountId/documents` | Documents | Job cards, contracts |
| `/:accountId/invoices` | Invoices | Payment folds in here |
| `/:accountId/support` | Support | Feedback folds in here |
| `/:accountId/account` | Account settings | Reached via the gear, not a tab |

A service route for an unentitled service redirects to Overview.

## Tab rationale

Seven top-level tabs is the ceiling. This set absorbs everything so it does not need
to change later:

- **Data** holds iData and CleanRich — both are data services
- **Invoices** absorbs Payment
- **Support** absorbs Feedback
- **Account** lives behind the gear, not as a tab
- **Reports** is an action inside each service, not a global tab — a report is always
  *of* something

## Account picker (`/`)

Entry screen. Makes the multi-account story the first thing anyone sees, which is
the point of the demo.

Centred, generous whitespace. DBSL monogram + "Union" wordmark. One line of context.
Then the accounts as selectable rows or cards — company name, and a line naming what
they buy ("Full programme — data, media, leads" / "Content syndication").

No password field. No fake login. This is a viewing-as picker and should read as one.

## Overview

The anchor screen. See reference HTML.

1. Hero — total invested, pacing sentence, CTA + status pills
2. `SERVICES` eyebrow
3. Hairline grid of service cards, one per entitled service

**Service card contents:**
```
Service name                    77%   ← or a status pill if there is an issue
38,400                                ← Montserrat 700 24px
of 50,000 records delivered           ← 11.5px muted
──────────────────────────────        ← 2px progress rule
Field fill 94% · Match 71%            ← 11.5px, the two quality metrics
```

The percentage top-right is replaced by a status pill when the service needs
attention. Only one thing occupies that slot.

Grid is one column per service at desktop width (up to 4 across), wrapping to 2
columns below 1024px. A single-service account gets one full-width card plus the
supporting metric strip — see reference screen 5.

## Leads

1. Hero — `96 billable leads of 500`, subhead naming delivered count and anything
   awaiting review
2. Metric strip, 4 columns, hairline grid: Delivered · Billable · Accept rate ·
   Cost per lead
3. `RECENT LEADS` eyebrow with a campaign filter chip on the right
4. Hairline rows: contact name + title/company on two lines, campaign, date, status

**Billable vs delivered must both be visible** and clearly distinguished. This is
the single most confusion-prone pair of numbers in the product.

Lead statuses in this demo: `Accepted` (good) and `Your review` (needs you).
Do not add a rejection state — deliberately out of scope for this demo.

## Documents

Proves the pattern extends to workflow state rather than percentages.

1. Hero — `One document needs your signature`
2. `AWAITING YOU` eyebrow
3. Active job card: bordered card with title, scope summary line, status pill, and a
   **phase strip** — Scoped · Verified · Confirmed · Signature · Signed
4. `ALL DOCUMENTS` eyebrow
5. Hairline rows: document name + type, value, date, status

Job card types: `client_signature`, `internal_only`, `msa_covered`. Only the first
requires client action; `msa_covered` renders as a neutral pill reading
"MSA covered".

Five client-facing phases. Do not expose more granular internal stages.

## Invoices

1. Hero — `$18,420 due`, subhead with overdue status and next issue date
2. Invoice identifier eyebrow with an overdue pill right-aligned, then issue/due line
3. **Line items, one per service** — description + basis on two lines, amount right
4. Total row with a `1px solid #07111F` top border — the only non-hairline rule in
   the product, used once, to close the invoice
5. `HISTORY` eyebrow, hairline rows of settled invoices

The line item basis line is where billable-vs-delivered appears in commercial form:
`52 billable of 89 delivered, at $45`.

## Data

Two services on one screen. For each: name, headline number, progress rule, quality
metrics. Below, a table of batch deliveries — batch name, record count, date, status.

Batches, not campaigns. No pacing curve. This screen exists partly to prove the
platform is not campaign-shaped.

## Media

1. Hero — `2,148,300 impressions`, spend and flight completion in the subhead
2. Metric strip: Viewability · CTR · Accounts reached · Brand safe
3. `WEEKLY DELIVERY` — 12 bars, `#146EF5`, last bar `#dde4ee` for in-progress.
   Plain divs, no charting library.
4. `TOP PLACEMENTS` hairline table — placement, impressions, CTR

Placement names must be **generic categories**, never real publisher names.

## Support

Simplest screen. Hero with a `Raise a request` CTA. A hairline table of tickets —
subject, opened date, status. Below, a short block naming the client's DBSL contacts
(account manager, campaign manager) with role labels. Fictional names only.

## Account (behind the gear)

Company details, users on the account with roles, notification preferences as
non-functional toggles. Low fidelity is fine — it exists so the gear icon is not a
dead end.

## Empty and locked states

- **Locked service:** greyed tab with a lock. Route redirects to Overview. On
  Overview, one line at the bottom: "Programmatic and audience data are available on
  your account." with a `Learn more` pill. One line. Never a banner.
- **Empty table:** one sentence saying what will appear here and, if relevant, what
  the client can do. Never "No data found."
