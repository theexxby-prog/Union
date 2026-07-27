# 04 · Data model and fixtures

## The rule that matters most

**Every number displayed anywhere in the app derives from `src/data/accounts.ts`.**

No component contains a literal figure. Three accounts across seven screens have to
stay numerically consistent, and derivation from one source is the only thing that
holds under iteration. When someone asks "why does Overview say 96 and the invoice
say 52", the answer has to be arithmetic, not a typo hunt.

Derive wherever possible rather than storing both sides:
- percentage = `delivered / target`
- accept rate = `billable / delivered`
- invoice total = sum of line items
- invested to date = sum of all invoices

Store the inputs. Compute the outputs. Round only at render.

## Types

```ts
export type ServiceId = 'idata' | 'cleanrich' | 'programmatic' | 'leads';

export type StatusState = 'good' | 'needsYou' | 'action' | 'neutral';

export interface QualityMetric {
  label: string;   // 'Field fill'
  value: string;   // '94%'  — pre-formatted, these are not computed
}

export interface Service {
  id: ServiceId;
  name: string;            // 'iData'
  unit: string;            // 'records delivered'
  received: number;        // 38400
  target: number;          // 50000
  /** Overrides the derived headline when the unit is not the pacing basis. */
  headline?: string;       // '2.1M'
  /** Replaces "of {target} {unit}" when spend, not volume, is the basis. */
  subline?: string;        // '$41,200 of $80,000 spent'
  quality: QualityMetric[];   // exactly 2 on the overview card
  status?: StatusState;       // shown instead of the % when present
  statusLabel?: string;       // 'Behind pace'
}

export interface Campaign {
  id: string;
  name: string;            // 'Cloud security whitepaper'
  geo: string;             // 'NAM'
  accepted: number;
  target: number;
  delivered: number;
}

export interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  campaignId: string;
  date: string;            // '22 Jul'
  status: 'accepted' | 'review';
}

export interface Batch {
  id: string;
  serviceId: 'idata' | 'cleanrich';
  name: string;
  records: number;
  date: string;
  sortKey: number;         // 20260702 — see note below
  status: StatusState;
  statusLabel: string;
}

export type JobCardType = 'client_signature' | 'internal_only' | 'msa_covered';

export interface DocumentRecord {
  id: string;              // 'JC-2841'
  title: string;
  kind: string;            // 'Job card' | 'Contract'
  type: JobCardType;
  value: number | null;    // null renders as an em dash
  date: string;
  phase: 0 | 1 | 2 | 3 | 4;   // index into PHASES
  scopeSummary?: string;   // '180 leads at $45 · $8,100 · scope agreed 18 July'
}

export const PHASES = ['Scoped', 'Verified', 'Confirmed', 'Signature', 'Signed'] as const;

export interface InvoiceLine {
  serviceId: ServiceId;
  description: string;     // 'iData · records delivered'
  basis: string;           // '12,400 records at $0.42'
  amount: number;
}

export interface Invoice {
  id: string;              // 'INV-0192'
  period: string;          // 'August 2026'
  issued: string;
  due: string;
  terms: string;           // 'Net 20'
  status: 'open' | 'overdue' | 'paid';
  lines: InvoiceLine[];    // total is summed, never stored
}

export interface Ticket {
  id: string;
  subject: string;
  opened: string;
  status: StatusState;
  statusLabel: string;
}

export interface Contact {
  name: string;
  role: string;            // 'Account manager'
}

export interface Account {
  id: string;                    // url slug: 'acme'
  name: string;
  descriptor: string;            // shown on the picker
  entitlements: ServiceId[];
  heroEyebrow: string;           // 'YOUR PROGRAMME · Q3 2026'
  heroHeadline: string;          // '$58,400 invested, tracking to plan'
  heroSubhead: string;
  user: { name: string; initials: string };
  services: Service[];
  campaigns: Campaign[];
  leads: Lead[];
  batches: Batch[];
  documents: DocumentRecord[];
  invoices: Invoice[];
  tickets: Ticket[];
  contacts: Contact[];
}
```

Put the three account display names in one exported constant at the top of the file
so they can be renamed in one edit.

## Account 1 — full programme

**All four services.** The flagship. Every screen is populated.

`id: 'acme'` · descriptor: "Full programme — data, media, leads"
User: John Carter, `JC`

| Service | received | target | headline | quality |
|---|---|---|---|---|
| iData | 38,400 | 50,000 | — | Field fill 94% · Match 71% |
| CleanRich | 47,200 | 50,000 | — | Corrected 12% · Deduped 6% |
| Programmatic | 41,200 | 80,000 | `2.1M` | Viewability 68% · CTR 0.34% |
| Leads | 96 | 500 | — | 165 delivered · Accept 58% |

Programmatic subline: `$41,200 of $80,000 spent`. Leads status: `action`,
label `Behind pace`.

Media detail: 2,148,300 impressions · 31.2k accounts reached · 99.4% brand safe.
Weekly delivery bars (% heights): 38 52 47 66 71 58 80 74 91 86 100 64 — last is
in-progress and renders `#dde4ee`.

### Invoices — these must reconcile

| Invoice | Period | Amount | Status |
|---|---|---|---|
| INV-0174 | June 2026 | $18,120 | paid |
| INV-0181 | July 2026 | $21,860 | paid |
| INV-0192 | August 2026 | $18,420 | overdue |

**Sum = $58,400 = the hero "invested" figure.** Derive it; do not hardcode it.

INV-0192 lines:

| Description | Basis | Amount |
|---|---|---|
| iData · records delivered | 12,400 records at $0.42 | $5,208 |
| CleanRich · records processed | 18,900 records at $0.11 | $2,079 |
| Programmatic · media spend | 742,000 impressions | $8,793 |
| Lead generation · billable leads | 52 billable of 89 delivered, at $45 | $2,340 |

Sums to $18,420. Issued 1 Aug, due 20 Aug, Net 20.

### Documents

| id | title | kind | type | value | date | phase |
|---|---|---|---|---|---|---|
| JC-2841 | Cloud security, NAM | Job card | client_signature | 8,100 | 18 Jul | 3 |
| JC-2798 | Data platform guide, EMEA | Job card | client_signature | 6,300 | 2 Jul | 4 |
| JC-2765 | Audience build, global | Job card | msa_covered | 21,000 | 14 Jun | 4 |
| MSA | Master services agreement | Contract | msa_covered | null | 3 Mar | 4 |

JC-2841 scope summary: `180 leads at $45 · $8,100 · scope agreed 18 July`

### Leads (5 rows is enough)

| Name | Title | Company | Campaign | Date | Status |
|---|---|---|---|---|---|
| Marcus Reeve | VP Infrastructure | Halden Logistics | Cloud security | 22 Jul | accepted |
| Priya Nandakumar | Head of Data | Corvus Retail Group | Data platform guide | 22 Jul | accepted |
| Daniel Okonjo | IT Director | Meridian Health | Cloud security | 21 Jul | review |
| Sofia Bergqvist | CTO | Nordvik Manufacturing | Infrastructure survey | 21 Jul | review |
| Tom Alderidge | Ops Manager | Fenwick Supply | Data platform guide | 20 Jul | accepted |

All fictional. Never use a real client or contact name anywhere in this repo.

## Account 2 — syndication only

**Leads only.** iData, CleanRich and Programmatic are locked. Proves the shell
degrades without leaving holes — it fills the space with depth on the one service.

descriptor: "Content syndication"
Hero: `312 of 400 leads accepted` · "On pace to complete by 12 September."

| Campaign | accepted | target | delivered |
|---|---|---|---|
| Cloud security whitepaper · NAM | 148 | 180 | 214 |
| Data platform buyers guide · EMEA | 109 | 140 | 168 |
| Infrastructure survey · APAC | 55 | 80 | 91 |

Totals: 312 / 400 accepted, 473 delivered → accept rate 66%. CPL $45.
Invested = 312 × $45 = $14,040. One paid invoice for that amount.

Overview shows one full-width service card plus the locked-services line.

## Account 3 — data only

**iData and CleanRich.** No campaigns at all. This is the stress test: does the
platform hold when there is nothing campaign-shaped on it?

descriptor: "Data services"
Hero: `52,500 records delivered` · "Two data services running. Next batch drops 4 August."

| Service | received | target | quality |
|---|---|---|---|
| iData | 24,000 | 30,000 | Field fill 91% · Match 68% |
| CleanRich | 28,500 | 30,000 | Corrected 15% · Deduped 9% |

Invested = (24,000 × $0.42) + (28,500 × $0.11) = $10,080 + $3,135 = **$13,215**.

Batches for the Data screen: four rows with names like "Q3 universe build — batch 3",
record counts summing to the received figures, dates, and status pills
(`good` = Delivered, `neutral` = Scheduled).

Leads, Media tabs locked. Documents and Invoices populated normally.

## Consistency checks to run before finishing

- Hero invested figure == sum of that account's invoice totals
- Each invoice total == sum of its line amounts
- Service percentage == received / target
- Accept rate == billable / delivered
- Campaign accepted totals == the leads service `received` figure
- Batch record counts == the data service `received` figures
- Every batch carries a `sortKey`, and delivered batches all precede scheduled ones
- No literal number in any `.tsx` file

**Batches are authored grouped by service and displayed chronologically.**
Array order is `idata` b1–b3 then `cleanrich` b1–b2, which is the right shape to
write and the wrong one to read: the Data screen's timeline rendered it in array
order and the dates ran 2 Jul, 18 Jul, 1 Aug, 5 Jul. `batchesByDate()` in
`accounts.ts` is the single chronological view; Data and the programme report
both read it, and the reconciliation gate asserts the sort keys exist and that no
delivered batch post-dates a scheduled one.
