# Folio — Plan

Personal landing page for Raagul R. Single page, brutalist console aesthetic.
Plan covers IA, tokens, components, copy, images, stack, and build order.

## 1. Brief (one line)

Text on paper, mono-first, information-dense, zero decoration, zero motion.
Reader: hiring manager or peer designer. Let work speak.

## 2. Information architecture

Single page, six sections, top-anchored by a fixed status bar.

| #  | Section    | Purpose                                    | Nav label     |
|----|------------|--------------------------------------------|---------------|
| 00 | StatusBar  | Identity, location, availability, nav      | (always on)   |
| 01 | Index      | Hero statement + table-of-contents         | `01 INDEX`    |
| 02 | Profile    | Dossier: role, org, focus, education       | `02 PROFILE`  |
| 03 | Work       | Project log, expandable case studies       | `03 WORK`     |
| 04 | Writing    | Essay log, external links                  | `04 WRITING`  |
| 05 | Contact    | Email, socials, Tomo line                  | `05 CONTACT`  |
| —  | Footer     | © line, last-updated date                  | —             |

No other pages. No `/about`, no `/blog`, no `/work/slug`. Writing links leave
the site. Work case studies expand inline.

## 3. Design tokens

Defined in `/styles/tokens.css` as CSS custom properties. Tailwind v4 reads
them via `@theme`. No hex values in component files.

### 3.1 Color
```
--bg:     #F2F0EA   /* warm off-white, single solid background */
--fg:     #0E0E0C   /* near-black, not pure */
--muted:  #6B6862   /* metadata, labels, line numbers */
--rule:   #D4D0C6   /* 1px dividers, frames */
--accent: #C2410C   /* links, focus, AVAILABLE pill only */
```
No gradients. No shadows. No glassmorphism. No dark mode.

### 3.2 Typography
```
--font-mono: "JetBrains Mono", ui-monospace, Menlo, monospace
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif
```
Mono is ~80% of the page. Sans only for section titles + hero.
No serif. No italic. Ever.

Scale (rem, 16px root):
```
--t-meta:    0.75rem   /* 12px — mono meta rows, line numbers */
--t-body:    0.875rem  /* 14px — mono body */
--t-body-lg: 1rem      /* 16px — emphasized mono body, dek */
--t-h:       1.5rem    /* 24px — sans section titles */
--t-hero:    3.5rem    /* 56px — sans hero line only */
```
Line height: `1.5` body, `1.1` display. Tracking: `-0.01em` on sans.

### 3.3 Layout
```
--max-w:   1200px
--gutter:  24px
--cols:    12
--rule-w:  1px
```
Desktop: 12-col grid, hairline 1px rules between sections, visible line
numbers in the left gutter (muted). Mobile (<720px): single column, rules
span the full width, line gutter hidden.

### 3.4 Spacing
Tight. 8px base unit. Section vertical padding: `64px` desktop, `40px` mobile.
Row padding in tables: `10px` vertical, `0` horizontal (gutters handle it).

## 4. Components

Six components. No more. Built from raw HTML — `<table>`, `<dl>`,
`<details>` — semantic first.

### 4.1 `Mark`
Single ASCII asterisk (`*`). Used in StatusBar only. Not a logo. Not a link.

### 4.2 `StatusBar`
Fixed top, 36px, `--bg` with 1px bottom rule. Mono 12px.
Content: `* RAAGUL.R   LEAD DESIGNER, SALESFORCE   BLR → HYD   [ AVAILABLE: Q3 2026 ]`
Right side: anchors `01 · 02 · 03 · 04 · 05` separated by middots, muted
until hovered. Availability pill: `--accent` text, 1px accent border, 2px
horizontal padding. Pill color is driven by a single config var
(`AVAILABILITY_STATE` in `/content/profile.ts`) — options: `available`,
`booked`, `hidden`.
Mobile: horizontal scroll on the row, no hamburger, no collapse.

### 4.3 `SectionHeader`
Two lines:
1. Mono 12px muted: `// 02 — PROFILE`
2. Sans 24px, tight tracking: `Profile`
16px gap between the two. 1px top rule spans full width.

### 4.4 `KeyValueTable`
Rendered as `<dl>`. Two columns:
- `<dt>` mono 12px muted, uppercase, 160px fixed width
- `<dd>` mono 14px fg, fills remainder
Row separator: 1px `--rule` bottom border, except last row.
Used in Profile and Contact.

### 4.5 `LogTable`
Rendered as `<table>`. Monospace throughout. Column headers in 12px muted
uppercase, 1px bottom rule. Rows: 14px, 10px vertical padding, 1px bottom
rule. Last column is always a link arrow `→` in accent on hover.
Props: `columns`, `rows`, `expandable?: boolean`.
When `expandable`, each row is an `ExpandableRow`.

### 4.6 `ExpandableRow`
Uses native `<details>`/`<summary>` for no-JS support. `<summary>` is the
table row. Expanded panel: mono 14px, `--bg`, 24px top padding, 1px top
rule inside the frame.
Content: problem / approach / outcome (≤200 words) + 1–2 figures.
URL hash sync: on toggle, set `location.hash` to `#work/slug`. On mount,
if hash matches, open the row.
Transition: `height` 150ms ease-out only. Respect `prefers-reduced-motion`.
Keyboard: `Enter` / `Space` toggles (native `<details>` handles this).

## 5. Content

### 5.1 StatusBar
```
* RAAGUL.R   LEAD DESIGNER, SALESFORCE   BLR → HYD   [ AVAILABLE: Q3 2026 ]
```
State variable drives the pill. If `booked`: `[ BOOKED THROUGH Q4 2026 ]`.
If `hidden`: pill omitted entirely.

### 5.2 Index — hero options (pick one)
**A (recommended)** —
> I design the behavioral primitives behind AI agents at Salesforce.

**B** —
> I design how AI agents behave — their defaults, their interruptions,
> the moments they ask.

**C** —
> Lead designer at Salesforce, working on AI agent interactions.

Dek (mono 16px, two lines, under hero — draft paired with **A**):
> Nine years in. Currently: interaction grammar for agents that act on
> behalf of people. Before: design systems, tooling, B2B surfaces.

### 5.3 Index — TOC table
Rendered as `<table>`. Columns: `#`, `SECTION`, `SUMMARY`, `→`.
```
01  PROFILE   Role, focus, education, location          →
02  WORK      Projects, case studies, ongoing           →
03  WRITING   Essays and notes                          →
04  CONTACT   Email, socials, music                     →
```
(Index itself is 01; table lists 02–05, shown as 01–04 rows per brief's TOC
convention — will confirm numbering with Raagul before build.)

### 5.4 Profile — key/value
```
ROLE         Lead Designer
ORG          Salesforce — Experience Org
FOCUS        AI agent interactions, behavioral primitives, design systems
EDUCATION    IDC, IIT Bombay — Interaction Design, 2018
LOCATION     Bangalore → Hyderabad (2026)
PRIOR        [to confirm — prior roles]
WRITING      See 04
SOUND        Tomo — ambient electronic
CONTACT      See 05
```

### 5.5 Profile — free-text (pick one)
**Warmer (default)** —
> I work on the defaults, recovery paths, and interruption patterns for
> Salesforce's agent surfaces. Before that: design systems, developer
> tooling, and a few years on consumer surfaces that no longer exist.
> Outside of work I build small things — a budgeting bot, a studio canvas,
> a book — and release ambient music as Tomo.

**Drier** —
> Nine years designing B2B software. Currently: AI agent interactions at
> Salesforce. Independent work and writing below; music as Tomo, linked
> in Contact.

### 5.6 Work — log rows
```
DATE  PROJECT              CONTEXT                  ROLE              LINK
2026  Logic Kit            Salesforce, internal     Lead designer     →
2026  Atelier              Independent R&D          Designer / build  →
2025  Budgy                Independent              Designer / build  →
2024  Design Days Diary    Book project             Editor / design   →
2023  [PRIOR-1]            [Salesforce]             [IC → lead]       →
2020  [PRIOR-2]            [Earlier role]           [IC]              →
```
Placeholders in brackets — to confirm with Raagul.

Case-study schema (per row, ≤200 words total):
```
PROBLEM    one paragraph
APPROACH   one paragraph, 2–4 sentences
OUTCOME    one paragraph, 1–3 sentences
FIGURES    1–2 images (see §6)
```

### 5.7 Writing — log rows (drafts, placeholders for real posts)
```
DATE   TITLE                                         TOPIC          LEN
2026   Behavioral primitives for agents              Design / AI    12 min
2026   The default question is the design            Design / AI    6 min
2025   What design systems borrow from linguistics   Systems        9 min
2025   Against speculative design as ornament        Critique       7 min
2024   Notes from editing a book on process          Process        5 min
```
Mark drafts with `[DRAFT]` suffix in the TITLE column. Each row links out
to the post URL — no excerpts on the index.

### 5.8 Contact
```
EMAIL      raagul@[DOMAIN]       (domain to confirm)
LINKEDIN   /in/raagul-r
ARE.NA    /raagul
READING    /readings             (optional, include if live)
SOUND      Tomo — ambient electronic.  →
```
No freeform prose. One line each.

### 5.9 Footer
```
© 2026 R.R — last updated [YYYY-MM-DD]
```
`last updated` is generated at build time.

## 6. Image plan

Generated via the `nano-banana` skill (Gemini 2.5 Flash Image).
Format: 1600×800 (2:1), PNG, exported at 2x for retina (`@2x.png`).
Location: `/public/img/work/[slug]/`. Each image sits inside a 1px ruled
frame; mono caption below.

No hero image. No profile portrait. No section dividers. No decorative art.
Images appear only in expanded Work rows. Maximum 2 images per project.

### 6.1 Caption format
```
FIG. 03.N — [caption], [year]
```
`03` is section index, `N` is image index within the project (1, 2). Mono
12px, muted, left-aligned under frame.

### 6.2 Per-project image briefs

Each brief includes the nano-banana prompt seed. Register: process
photograph, screenshot, wireframe, or diagram. Muted and technical.
Palette must read against `#F2F0EA` paper; avoid saturated colors.
If a real screenshot is available, prefer it over a generation — the
generation is the fallback.

#### Logic Kit (2026, Salesforce internal)
- **FIG. 03.1** — Component inventory diagram.
  *Prompt:* "Clean technical diagram on warm off-white paper (#F2F0EA),
  near-black linework (#0E0E0C), 1px strokes. Inventory grid of 12 small
  UI primitives: button, toggle, field, chip, menu, tab, tag, checkbox,
  stepper, slider, avatar, badge. Each inside a 1px square frame with a
  mono label underneath. Uniform spacing. No color, no shadows, no 3D.
  Reference: Berkeley Graphics, Rauno Freiberg component sheets."
- **FIG. 03.2** — Primitive state matrix.
  *Prompt:* "Monochrome state matrix on warm off-white. Rows: default,
  hover, focus, active, disabled. Columns: button, toggle, field. 1px
  grid, mono labels. Single ochre accent (#C2410C) only on the 'focus'
  row to mark the focus ring. Flat, documentary."

#### Atelier (2026, Independent R&D)
- **FIG. 03.1** — Canvas UI capture.
  *Prompt:* "Stylized screenshot of a desktop canvas application on warm
  off-white. Infinite grid background (1px, #D4D0C6). Floating rectangular
  note cards with mono text, connected by 1px lines. Left sidebar with
  tool icons, mono labels. Near-black UI chrome (#0E0E0C). No window
  shadows. No drop shadows on cards. Documentary, not marketing."
- **FIG. 03.2** — Tool palette detail.
  *Prompt:* "Detail crop of the Atelier tool palette: 8 icons in a vertical
  strip, 1px frames, mono labels, warm off-white background. Flat."

#### Budgy (2025, Independent)
- **FIG. 03.1** — WhatsApp chat UI.
  *Prompt:* "Stylized mobile screenshot of a WhatsApp conversation on warm
  off-white paper background (not the real WhatsApp teal). User message
  bubbles in near-black outline (1px), bot responses inline. Sample
  exchange: '85 coffee', bot reply '→ logged. this week: 420 on food.'
  Mono font throughout. No gradients. No iOS chrome. Flat illustration,
  documentary."
- **FIG. 03.2** — Weekly summary card.
  *Prompt:* "Mono table on warm off-white showing a weekly spend
  breakdown: categories (food, transit, rent, misc) with amounts. 1px
  rules. One row highlighted in ochre (#C2410C) text. Flat."

#### Design Days Diary (2024, Book)
- **FIG. 03.1** — Book spread.
  *Prompt:* "Overhead photograph of an open softcover book on a plain
  warm off-white surface. Left page: dense mono text in two columns.
  Right page: a single large diagram. Neutral lighting, no shadows, no
  hands, no props. Documentary. The book is the subject. No gloss."
- **FIG. 03.2** — Cover detail.
  *Prompt:* "Close crop of the book cover: title set in mono on plain
  off-white card stock, no illustration, subtle paper texture. Flat
  overhead shot."

#### [PRIOR-1] and [PRIOR-2]
Hold. Images only after project details are confirmed.

### 6.3 Rendering rules
- Frame: `<figure>` with 1px `--rule` border, no padding, image fills.
- Caption: `<figcaption>` mono 12px muted, 8px top margin.
- Width: 100% of the expanded panel's text column (max ~720px). Not
  full-bleed.
- `loading="lazy"`, explicit `width`/`height` to prevent CLS.
- `alt` text: factual, no marketing. Example: "Component inventory
  diagram showing twelve UI primitives in a 1px grid."

## 7. Technical stack

- **Next.js 15** (App Router), React server components by default.
- **TypeScript** strict mode.
- **Tailwind CSS v4** — `@theme` reads tokens from `/styles/tokens.css`.
  No inline hex. No arbitrary values except for one-off pixel tweaks.
- **Fonts** — self-hosted via `next/font/local` (if Berkeley Mono licensed)
  or `next/font/google` for JetBrains Mono + Inter. `display: swap`,
  preloaded, subset to Latin.
- **No client state libraries.** No animation libraries. No UI kits.
- **No analytics** on launch. If Plausible added later, no banner needed.
- **Deploy:** Vercel.

### 7.1 File structure
```
/app
  layout.tsx            Fonts, metadata, viewport, theme-color
  page.tsx              The single page — imports each section
  globals.css           Tailwind entry + token import + resets
/components
  StatusBar.tsx
  SectionHeader.tsx
  KeyValueTable.tsx
  LogTable.tsx
  ExpandableRow.tsx
  Mark.tsx
/content
  profile.ts            Dossier key/values + free-text + availability state
  work.ts               Work rows + case studies + figure refs
  writing.ts            Writing rows
  contact.ts            Contact key/values
/styles
  tokens.css            CSS custom properties
/public
  /img/work/logic-kit/fig-1.png, fig-1@2x.png, fig-2.png, fig-2@2x.png
  /img/work/atelier/...
  /img/work/budgy/...
  /img/work/ddd/...
  /fonts/...            (if self-hosting)
plan.md                 This file
README.md               Minimal — build commands only
```

### 7.2 Data shape (content files)
```ts
// /content/work.ts
export type Figure = {
  src: string;       // /img/work/logic-kit/fig-1.png
  src2x: string;
  width: number;
  height: number;
  caption: string;   // "FIG. 03.1 — Logic Kit component inventory, 2026"
  alt: string;
};
export type WorkRow = {
  slug: string;      // logic-kit
  date: string;      // 2026
  project: string;
  context: string;
  role: string;
  link?: string;     // external URL, optional
  caseStudy: {
    problem: string;
    approach: string;
    outcome: string;
    figures: Figure[];
  } | null;
};
```

## 8. Accessibility

- Semantic HTML first: `<header>`, `<nav>`, `<main>`, `<section>`, `<table>`,
  `<dl>`, `<details>`, `<figure>`. ARIA only where HTML falls short.
- Color contrast: body text on `--bg` = 15.8:1 (AAA). Muted on `--bg` =
  5.1:1 (AA, sufficient for metadata). Accent on `--bg` = 4.9:1 (AA for
  UI). Link underlines remove reliance on color.
- Keyboard: every interactive element focusable. Focus ring: 2px
  `--accent` outline, 2px offset. Skip-link to `#main`.
- `prefers-reduced-motion` — no motion to reduce, but honor it defensively
  on the `<details>` height transition.
- `<details>` gives JS-free toggling and correct ARIA semantics.

## 9. Performance targets

- Page weight ≤150KB gzipped (excluding images).
- Total JS ≤30KB gzipped on first load. Only `ExpandableRow` client logic
  (hash sync) needs JS — everything else is static HTML/CSS.
- LCP <1s on 3G Fast.
- CLS = 0 (explicit image dimensions, no late-inserted content).
- Lighthouse 100 across all four.
- No hydration-only content — page renders identically with JS disabled.

## 10. Build order

1. **Plan approval** — this doc. Confirm open decisions in §11.
2. **Scaffold** — Next.js 15, Tailwind v4, tokens, fonts, layout shell.
3. **StatusBar** + global layout + footer. Review.
4. **Index** (hero + TOC). Review.
5. **Profile**. Review.
6. **Work** (LogTable + one ExpandableRow wired end-to-end with
   placeholder figures). Review.
7. **Writing** + **Contact**. Review.
8. **Images** — generate via nano-banana, drop into `/public/img/work/*`,
   wire captions.
9. **QA** — keyboard nav, JS-off render, Lighthouse, contrast audit,
   print stylesheet (bonus, optional).
10. **Deploy** to Vercel.

## 11. Open decisions (need answers before scaffold)

1. **Mono font:** Berkeley Mono (requires license drop-in) or JetBrains
   Mono (default)?
2. **Sans font:** Inter (default) or Söhne (licensed)?
3. **Hero statement:** A, B, or C (§5.2)? Recommendation: A.
4. **Profile free-text:** Warmer or drier (§5.5)? Recommendation: warmer.
5. **Contact email domain:** the brief placeholder is `raagul@—.in`.
6. **Prior roles:** two rows needed for Work (§5.6) — names, dates,
   contexts, roles.
7. **Writing posts:** are the placeholder titles (§5.7) directionally
   right, or should they be replaced with actual planned pieces?
8. **Availability pill state:** `AVAILABLE: Q3 2026` — confirm exact
   wording, and whether it should appear at all.
9. **Numbering:** brief shows TOC rows as `01`–`04` even though Index
   itself is `01`. Keep brief's numbering or renumber sections `01`–`05`
   across StatusBar + TOC + SectionHeaders? Recommendation: renumber —
   StatusBar nav = 01…05, TOC lists 02…05.
10. **Last-updated date:** build-time stamp (automatic) or manual field
    in `/content/profile.ts`?

Answer these and I scaffold.

