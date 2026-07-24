# Datamatics Business Solutions (DBSL) — Brand & Design Rules

**Binding for every UI, document, deck, email, report, and marketing asset in this repo.** Do not invent colors, fonts, spacing, or components outside this file. Source of truth: DBSL Brand Communication Playbook (v2, June 2026).

Drop `dbsl-tokens.css` (shipped alongside this file) into the project and link it once; style against the `var(--*)` tokens rather than hard-coding values.

---

## 1. Naming rule (hard rule)

Write **"Datamatics Business Solutions"**, **"DBSL"**, or the approved regional entity name. Never shorten to just **"Datamatics"**. Never use **"DBS"** standalone.

## 2. Color palette — use these exact hexes

| Name | Hex | Token | Role |
|---|---|---|---|
| Deep Tech Navy | `#07111F` | `--dbsl-navy` | Foundation / dark backgrounds, enterprise trust |
| Tech Blue | `#146EF5` | `--dbsl-blue` | Systems, links, tech headings, transformation |
| Electric Cyan | `#00FFF7` | `--dbsl-cyan` | AI / data energy; headings on dark (sparingly) |
| Tech Teal | `#34A49E` | `--dbsl-teal` | Transformation, clarity, callouts |
| DBSL Red | `#B20101` | `--dbsl-red` | CTAs and campaign accent — **accent only, never large fills** |
| Electric Yellow | `#FFFC00` | `--dbsl-yellow` | High-visibility accent, eyebrows (sparingly) |
| Soft Grey | `#F4F7FB` | `--dbsl-grey-soft` | Light page surface, breathing space |
| Cloud Grey | `#C5CDD8` | `--dbsl-grey-cloud` | Neutral, borders, hierarchy |

Rules:
- Navy is the foundation. Keep **1–2 dominant color families per asset** (navy + one accent).
- Semantic aliases exist — prefer them: `--brand-primary` (red CTA), `--brand-secondary` (blue), `--brand-highlight` (cyan), `--brand-support` (teal), `--brand-attention` (yellow), `--surface-page/-card/-dark`, `--text-strong/-body/-muted/-on-dark/-highlight`, `--link`, `--focus-ring`.
- Signature gradients only: `--gradient-navy-blue`, `--gradient-navy-teal`, `--gradient-navy-red` (diagonal ≈160°), `--gradient-cyan-teal` (emphasis callouts). **No purple/violet gradients.**
- House style for covers/heroes/social/decks: navy → blue/teal/red gradient, abstract data imagery, cyan or yellow headline, **red pill CTA**, logo/monogram top-left (documents) or top-right (social tiles).

## 3. Typography

- **Montserrat** (`--font-display`) — H1, hero, large display numerals. Weights 700–800, tracking `-0.02em`.
- **Sora** (`--font-heading` / `--font-body`) — H2 and below, subheads, body, labels. Body line-height 1.6.
- Eyebrows/labels: Sora 700, UPPERCASE, tracking `0.14em` (`--ls-eyebrow`).
- **Only these two families.** Never Inter, Roboto, Arial, or Poppins.
- Casing: sentence case for headings and body; UPPERCASE only for eyebrows and button labels; Title Case only for proper product names.
- Minimum sizes: body ≥16px · slide text ≥24px (1920×1080) · print ≥12pt.
- Scale tokens: `--fs-display` 72 · `--fs-h1` 48 · `--fs-h2` 36 · `--fs-h3` 26 · `--fs-h4` 20 · `--fs-lead` 20 · `--fs-body` 16 · `--fs-sm` 14 · `--fs-xs` 12.

## 4. Layout, shape, and effects

- 4px spacing grid (`--space-1`…`--space-24`). Containers: 720 / 1040 / 1280px. Section rhythm `--section-y` (96px).
- Structured grid, generous whitespace, **left-aligned copy**, rhythm: eyebrow → headline → subhead → CTA.
- Radii: media/social tiles square (`0`); cards and callouts 10–16px (`--radius-md`/`--radius-lg`); buttons, chips, tags full pills (`--radius-pill`).
- Cards: white surface, hairline `--border-subtle`, `--shadow-sm`, generous padding, optional 3px brand-color top accent. Dark cards = navy with translucent white borders.
- Shadows are soft and navy-tinted (`--shadow-xs`…`--shadow-lg`). Cyan glow (`--shadow-glow-cyan`) is reserved for AI/energy emphasis only.
- Focus: Tech Blue ring with soft 3px halo. Hover brightens fills (`brightness(1.08)`) or lowers link opacity; press `scale(.97)`.
- Motion: fades and short slides, 120–320ms, `cubic-bezier(.2,0,.2,1)`. **No bounce, no spring.**
- Transparency/blur used sparingly — translucent white chips/panels on dark heroes. No heavy glassmorphism.

## 5. Iconography & imagery

- Icons: **Tabler Icons** (24px grid, 2px line) — `https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css`, rendered as `<i class="ti ti-name">`. Icons sit in small rounded blue/teal tiles when featured.
- **No emoji anywhere.** No unicode-as-icon.
- The only proprietary mark is the DBSL red "D/5" monogram — never redraw, recolor, stretch, or add effects to the logo; keep generous clear space. Full lockup on light backgrounds, white lockup on navy.
- Imagery: dark navy gradients with data-visualisation renders (node networks, particle waves, light streams). Photography = warm-lit corporate office, cool-balanced. **Never draw imagery with hand-written SVG** — use image placeholders and request real assets.

## 6. Voice & tone

Business-formal, global, intelligent-but-plain, structured, outcome-driven. Confident without exaggeration. "We" for DBSL; "organizations / enterprises / businesses / you" for the audience. Third-person institutional voice for boilerplate and thought leadership; second person for campaign CTAs. Short-to-medium active-voice sentences, clarity over jargon, globally neutral business English (no regional idioms).

**Use:** transformation, scalability, efficiency, visibility, intelligence, optimization, modernization, business outcomes, enterprise operations, value creation, AI-enabled, automation, intelligent operations, digital workflows, data-driven, technology-led, operational intelligence, compliance, accuracy, governance, financial visibility, process excellence, business continuity.

**Never:** "revolutionary", "game-changing", "cutting-edge", "next-gen", "world-class", "best-in-class" (unless proven), "amazing", "we are super excited", "leading enterprise", synergy, disruption, paradigm shift, rockstars, ninja, hustle, overused "leverage". No overpromising or aggressive sales language.

**Good:** "DBSL helps enterprises streamline finance and accounting operations through scalable delivery models and tech-enabled workflows."
**Avoid:** "DBSL is passionately committed toward revolutionizing the future-ready ecosystem through cutting-edge capabilities."

Brand personality: Intelligent · Reliable · Modern · Structured · Strategic · Credible.

## 7. Corporate boilerplate (verbatim, updated June 2026)

> Datamatics Business Solutions is a global Business Process Management (BPM) company enabling organizations to scale operations with greater efficiency, visibility, and control. Established in 1982 as part of the Datamatics Group, the organization brings over four decades of operational expertise across global markets. The company delivers solutions across B2B Data, Demand Generation, Marketing Services, Market Research & Business Intelligence, CPA Outsourcing, and Finance & Accounting (F&A) Outsourcing. With a presence across the US, UK, and other global markets, Datamatics Business Solutions partners with enterprises, accounting firms, and growing businesses to build scalable, compliant, and future-ready operations.

## 8. Setup checklist for any new file

1. Link `dbsl-tokens.css`.
2. Add the Google Fonts link for Montserrat + Sora (in the token file's header comment).
3. Add the Tabler icons stylesheet if icons are needed.
4. Set page background `var(--surface-page)` (light) or `var(--surface-dark)` (dark), text `var(--text-body)` / `var(--text-on-dark)`.
5. Define `a` and `a:hover` as `var(--link)` / `var(--link-hover)` so links are never browser-blue.
6. Component recipe: primary button = red pill, white Sora 600 label, `--radius-pill`; secondary = transparent with `--border-strong`; eyebrow above every section headline.
