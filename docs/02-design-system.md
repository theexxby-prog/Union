# 02 · Design system

`brand/dbsl-brand-rules.md` and `brand/dbsl-tokens.css` are the client's official
design system. **Read them.** They are binding on palette, typefaces, and naming.

But they were written for decks, social tiles, and marketing pages — 72px display
type, 96px section rhythm, gradient heroes. A data-dense portal cannot run on those
values without becoming three screens tall.

This document is the **product UI extension**: the playbook's palette and typefaces
at product scale, plus the semantic states a portal needs and marketing does not.

Where this document and the playbook differ on **scale**, this document wins.
Where they differ on **palette, typeface, or naming**, the playbook wins.

---

## Colors actually used

Import `brand/dbsl-tokens.css` and use its variables. This is the subset Union uses.

| Purpose | Value | Token |
|---|---|---|
| Page background | `#ffffff` | — |
| Hairline / divider | `#e7edf5` | `--grey-100` |
| Hero card fill | `#eaf0f9` | product-specific |
| Hero card border | `#dbe4f0` | product-specific |
| Headline / primary text | `#07111F` | `--dbsl-navy` |
| Body text | `#2b3644` | `--text-body` |
| Secondary text | `#4a5563` | `--grey-700` |
| Muted / labels | `#8a96a6` | `--grey-500` |
| Accent, progress, active tab | `#146EF5` | `--dbsl-blue` |
| Primary CTA | `#B20101` | `--dbsl-red` |
| Positive | `#2a847f` | `--teal-600` |

### Banned in product UI

- **Electric Cyan `#00FFF7`** and **Electric Yellow `#FFFC00`**. They are
  high-visibility marketing accents built for something on screen for four seconds.
  A portal someone stares at for twenty minutes needs a quieter palette.
- **Gradients.** Including the playbook's signature gradients. A flat fill ages
  better; gradients are the most dateable thing in a UI.
- **Drop shadows.** Hairlines and whitespace do the separating.

If asked to justify: they remain valid brand colors for marketing assets. They are
scoped out of the product surface deliberately.

### Red discipline

Red means **you need to act, or something is wrong**. CTA pills, overdue, behind
pace. Nothing else. Never a chart series, never a nav highlight, never decoration.
If red appears anywhere it does not mean "act," the CTA loses its meaning.

## Typography

| Role | Face | Weight | Size | Tracking |
|---|---|---|---|---|
| Hero headline | Montserrat | 700 | 26px | -0.02em |
| Sub-page headline | Montserrat | 700 | 25px | -0.02em |
| Large number | Montserrat | 700 | 24px | -0.02em |
| Metric number | Montserrat | 700 | 20px | -0.02em |
| Wordmark | Montserrat | 700 | 14px | -0.02em |
| Eyebrow | Sora | 600 | 11px | 0.14em, uppercase |
| Hero subhead | Sora | 400 | 13px | — |
| Body / row primary | Sora | 400–500 | 12.5px | — |
| Row secondary / caption | Sora | 400 | 11.5px | — |
| Status pill | Sora | 600 | 11px | — |

**Montserrat is for numbers and headlines only.** Everything else is Sora.
Sentence case everywhere except eyebrows, which are uppercase.

Apply `font-variant-numeric: tabular-nums` at the app root so numeric columns align.

## Status pills — exactly four states

This is a closed set. Do not invent a fifth. Every state in every screen maps to one
of these.

| State | Meaning | Text | Background |
|---|---|---|---|
| **Good** | Complete, healthy, paid, signed | `#2a847f` | `#e6f2f1` |
| **Needs you** | Waiting on the client to act | `#0f57c9` | `#e8f0fe` |
| **Action** | Overdue, behind pace, at risk | `#B20101` | `#fbeaea` |
| **Neutral** | Informational, no action implied | `#4a5563` | `#f1f4f9` |

11px, weight 600, `border-radius: 999px`, padding `2px 9px`.

Implement as a single `<StatusPill state="good|needsYou|action|neutral">` component.
Nothing else in the app renders a pill-shaped status.

## Shape

- Cards / hero: `border-radius: 14px` (hero), `12px` (card grids)
- Buttons, chips, pills: `border-radius: 999px` — always fully rounded
- Borders: `1px solid #e7edf5` — hairline everywhere
- No rounded corners on single-sided borders

## Layout primitives

### Hero card

On every page. The anchor of the screen.

```
┌──────────────────────────────────────────────┐
│ EYEBROW · CONTEXT              (blue #146EF5)│
│ Headline sentence with the one number        │  Montserrat 700 26px navy
│ Supporting sentence.                         │  Sora 13px #4a5563
│ [Red CTA]  [white pill]  [white pill]        │
└──────────────────────────────────────────────┘
  bg #eaf0f9 · border #dbe4f0 · radius 14 · padding 18px 20px
```

**The headline is always a sentence containing the one number that matters on that
page.** Not a label and a figure — a sentence. `$58,400 invested, tracking to plan`.
`96 billable leads of 500`. `One document needs your signature`.

Exactly one red CTA per hero. Secondary actions are white pills with `#dbe4f0` border.

### Hairline card grid

Used for the services grid and metric strips. No individual card borders — a 1px
gap over a hairline background creates the dividers.

```css
display: grid;
gap: 1px;
background: #e7edf5;
border: 1px solid #e7edf5;
border-radius: 12px;
overflow: hidden;
/* children: background: #fff; padding: 14px 15px; */
```

### Progress rule

2px tall. `#146EF5` fill on `#e7edf5` track. No radius, no label inside.

### Phase strip

Where a thing has workflow stages rather than a percentage (job cards), the progress
rule becomes a phase strip in the same slot at the same visual weight: N equal
columns, each a 2px bar above an 11px label.

- Completed phases: bar `#146EF5`, label `#07111F`
- Current phase: bar `#B20101`, label `#B20101` weight 600 (only if it needs the
  client to act — otherwise `#146EF5` and navy)
- Future phases: bar `#e7edf5`, label `#8a96a6`

### Data rows

Hairline-separated, no card wrapper, no zebra striping. Header row uses the eyebrow
style in `#8a96a6`. Right-aligned numeric columns with fixed widths.

## Chrome

```
┌───────────────────────────────────────────────────────────┐
│ [D] Union                 [Account ▾] 🔔 ⚙ (avatar)      │  ← client controls right
├───────────────────────────────────────────────────────────┤
│ Overview  Data  Media  Leads  Documents  Invoices  Support│  ← tabs
├───────────────────────────────────────────────────────────┤
│                                                           │
│  [ hero card ]                                            │
│  SECTION EYEBROW                                          │
│  content                                                  │
```

- Logo mark: 21px rounded square, `#B20101` fill, white "D" in Montserrat 700 11px.
  **Do not redraw or restyle the DBSL logo** — this is a simple monogram stand-in.
- Tabs: 12.5px Sora. Inactive `#8a96a6`. Active `#07111F` weight 500 with a 2px
  `#146EF5` bottom border.
- Locked services: shown, `#b6bfcc`, with a lock icon. Never hidden — the locked
  item is the only upsell surface in the product, and it gets one line, never a banner.

## Icons

Tabler Icons, outline only, 2px stroke — mandated by the playbook.
`npm i @tabler/icons-react`. No emoji. No other icon set.

## Motion

Fades and short slides, 120–320ms, `cubic-bezier(.2,0,.2,1)`. No bounce, no spring.
Used sparingly — tab changes and account switches only. Respect
`prefers-reduced-motion`.

## Voice

Business-formal, plain, outcome-driven. Sentence case. Active voice.

**Avoid:** "revolutionary", "cutting-edge", "next-gen", "world-class", "seamless",
"leverage", "unlock", "empower", "simply", "just", "successfully". No exclamation
marks. No apologising in error states.

**Client-facing screens show only state and action.** No internal pipeline stages,
no workflow internals, no system vocabulary. The client sees "Awaiting your
signature", not "stage 6 of 9 — pending_client_countersign".
