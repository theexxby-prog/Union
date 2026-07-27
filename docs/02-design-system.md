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
| Page canvas | `#f4f7fb` | `--dbsl-grey-soft` |
| Section card | `#ffffff` | — |
| Row hover | `#eaeef6` | product-specific |
| Table header band | `#e3e9f3` | product-specific |
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

The scale below is the **presentation-first** revision, amended 27 Jul 2026. The
original column was set for a 1200px content canvas; the app now runs on a
1560px canvas (see *Layout canvas*) and is read across a room during a walkthrough,
not at arm's length. Every role moved up roughly 25%.

| Role | Face | Weight | Size | Tracking |
|---|---|---|---|---|
| Hero headline | Montserrat | 700 | 40px | -0.02em |
| Sub-page headline | Montserrat | 700 | 34px | -0.02em |
| Large number | Montserrat | 700 | 34px | -0.02em |
| Metric number | Montserrat | 700 | 34px | -0.02em |
| Service card number | Montserrat | 700 | 33px | -0.02em |
| Wordmark | Montserrat | 700 | 18px | -0.02em |
| Section title | Sora | 600 | 13px | 0.12em, uppercase |
| Eyebrow | Sora | 600 | 12px | 0.12em, uppercase |
| Hero subhead | Sora | 400 | 16px | — |
| Tab | Sora | 400–600 | 16px | — |
| Body / row primary | Sora | 400–500 | 15.5px | — |
| Row secondary / caption | Sora | 400 | 14px | — |
| Status pill | Sora | 600 | 13px | — |

Base `font-size` on `body` is **15px** (was 12.5px).

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

13px, weight 600, `border-radius: 999px`, padding `5px 13px`.

Implement as a single `<StatusPill state="good|needsYou|action|neutral">` component.
Nothing else in the app renders a pill-shaped status.

### The quiet variant

`<StatusPill quiet>` drops the chip and keeps the colour. Use it for the
**expected** state in a dense table: five identical "Delivered" chips in a column
make the one "Scheduled" harder to find, not easier. The exception keeps its chip
and wins the column outright. The closed set of four is unchanged — this is a
rendering of a state, not a fifth state.

In use: Data and report batch rows (Delivered quiet, Scheduled chipped), campaign
drop schedules, and Media account engagement (Medium/Low quiet, High chipped).

## Marks — one form per question

Three marks look superficially similar and answer different questions. They must
not be confusable.

| Mark | Question | Form |
|---|---|---|
| `ProgressRule` | how full? | one continuous 3px track, accent blue on hairline |
| `PhaseStrip` | which stage? | 7px capsules, 14px gaps; done = teal, current = blue, waiting on you = red |
| `PaceBars` | how much, when? | column chart, muted fill for future periods |

`ProgressRule` is deliberately the thinnest mark in the product: the number it
sits under is the point, not the bar. On service cards the percentage sits beside
the rule rather than in the card header — it gives the bar a value to be, and it
keeps the header free so cards with a status pill and cards without still share
a baseline.

## Metric strip ranking

A tile flagged `primary` takes the hero fill and a 40px number instead of 34px.
Exactly one per strip, and only where the screen genuinely has a headline figure
(Media → accounts engaged; Leads → billable). Without a rank, four tiles at
identical weight shout equally and the eye has nowhere to land first.

## Shape

- Cards / hero: `border-radius: 18px` (hero), `16px` (section cards and card grids)
- Buttons, chips, pills: `border-radius: 999px` — always fully rounded
- Borders: `1px solid #e7edf5` — hairline everywhere
- No rounded corners on single-sided borders

## Layout canvas

Amended 27 Jul 2026, replacing the original 1200px centred column.

- **Chrome and tabs are full-bleed** and sticky: white bar, hairline underneath,
  spanning the whole viewport. Tabs sit at 16px with 40px gaps so the nav reads as
  a row of destinations rather than a cluster. **Locked tabs sort to the end** —
  they are the upsell surface, and sitting mid-row they interrupted the scan
  across the destinations you can actually reach.
- **Content runs to `max-width: 1560px`** with 32px side padding, centred. On a
  1680px display this leaves a thin gutter instead of the dead third the old
  1200px column produced.
- **The canvas behind the content is Soft Grey `#F4F7FB`.** This is the approved
  "Option A" treatment. Content does not sit on the grey — every section is a
  white card on it.

### Section — the unit of a screen

Each screen is a stack of `Section`s: an uppercase title (13px, optional
right-hand slot for a control or pill) above a **white card**, `radius 16px`,
hairline border, `padding 22px 26px`. Tables, charts and row-lists all live inside
one. A `bare` section skips the white card for children that already carry their
own surface — a hairline grid, a metric strip, a tinted approval card.

Two-column composition uses `Cols` (a 3-track grid; the primary child takes
`lg:col-span-2`). It is `items-start`, so a short side card sits at its natural
height rather than stretching to match a tall neighbour.

### Table header

`TableHead` is a **grey band flush to the top of the Section card** — Soft Grey
`#F4F7FB` fill, `padding 13px 26px`, top corners rounded to the card. The same
logic as the canvas: grey is chrome, white is content, so the header reads as a
different kind of thing without a heavier rule. Column labels darken from
`muted` to `secondary` for contrast on the fill.

It carries no bottom border — the first row's own `border-t` supplies that. It
assumes it is the first child of a Section body; its negative top margin cancels
the card's padding.

The band fill is **`#e3e9f3`, darker than both the canvas (`#f4f7fb`) and the row
hover tint (`#eaeef6`)**. It has to be darker than the canvas: the band meets the
card's top edge, so a fill at canvas value disappears into the grey immediately
outside the card. Darker than the hover tint too, so the two never trade places.

## Layout primitives

### Hero card

On every page. The anchor of the screen.

```
┌──────────────────────────────────────────────┐
│ EYEBROW · CONTEXT              (blue #146EF5)│
│ Headline sentence with the one number        │  Montserrat 700 40px navy
│ Supporting sentence.                         │  Sora 16px #4a5563
│ [Red CTA]  [white pill]  [white pill]        │
└──────────────────────────────────────────────┘
  bg #eaf0f9 · border #dbe4f0 · radius 18 · padding 30px 34px
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

## Hover

One tint, `#eaeef6` (`bg-row-hover`), on every pointer-over surface: table rows,
expandable rows, menu items, the account picker, linked service cards. It is a
clear step down from white — enough to say "this is the record you are about to
act on" from across a room.

Row hover is **full-bleed to the card edge**. Rows carry `-mx-[26px] px-[26px]`,
cancelling the Section card's padding, so the tint and the divider run edge to
edge while the content box stays put. Read-only tables get it too — at 1560px it
is what keeps the eye on one record across the width.

Secondary surfaces (white pill buttons) hover to the page tint `#f4f7fb`
(`bg-page`), one step lighter, so a button never competes with a row.

## Motion

Fades and short slides, 120–320ms, `cubic-bezier(.2,0,.2,1)`. No bounce, no spring.
Used for tab changes, account switches, and hover tints. Respect
`prefers-reduced-motion`.

## Say it once

The most common legibility failure in this product is not density, it is
repetition. A hero that states a number, a metric strip that restates it, and a
card that restates it again give the eye three equal candidates and no answer.
A chart is not exempt: a bar per invoice period on the Invoices screen was the
History table underneath it, drawn — and since the periods bill similar amounts,
it drew three near-equal columns that said nothing. It was replaced with a
per-service spend breakdown, which is the one commercial question no other screen
answers.

The hero carries the **sentence**. Everything below it carries facts the sentence
does not. Concretely: the Media hero no longer restates spend, budget or pace —
the strip and the pacing card both carry those — and the Data service cards no
longer carry a quality line, because the Quality strip directly beneath them is
the same two figures at four times the size.

## Voice

Business-formal, plain, outcome-driven. Sentence case. Active voice.

**Avoid:** "revolutionary", "cutting-edge", "next-gen", "world-class", "seamless",
"leverage", "unlock", "empower", "simply", "just", "successfully". No exclamation
marks. No apologising in error states.

**Client-facing screens show only state and action.** No internal pipeline stages,
no workflow internals, no system vocabulary. The client sees "Awaiting your
signature", not "stage 6 of 9 — pending_client_countersign".
