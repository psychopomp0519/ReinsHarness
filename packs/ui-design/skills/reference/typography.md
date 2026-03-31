# Typography Reference

## Modular Scale Ratios

A modular scale generates consistent, harmonious font sizes from a base size and a ratio. Multiply the base by the ratio repeatedly to get each step.

| Ratio | Name | Use Case |
|-------|------|----------|
| 1.125 | Minor Second | Dense UI, data-heavy dashboards — tight size differences |
| 1.200 | Minor Third | General-purpose apps, admin interfaces |
| 1.250 | Major Third | Content sites, blogs — comfortable reading hierarchy |
| 1.333 | Perfect Fourth | Marketing pages, editorial — clear hierarchy |
| 1.414 | Augmented Fourth | Bold editorial, portfolios |
| 1.500 | Perfect Fifth | Landing pages — dramatic contrast between heading/body |
| 1.618 | Golden Ratio | Hero-heavy marketing — use sparingly, large jumps between steps |

**Example (base 16px, ratio 1.250):**

| Step | Size | Typical Use |
|------|------|-------------|
| -1 | 12.8px | Caption, fine print |
| 0 | 16px | Body text |
| 1 | 20px | H4 / large body |
| 2 | 25px | H3 |
| 3 | 31.25px | H2 |
| 4 | 39px | H1 |
| 5 | 48.8px | Display / hero |

## Vertical Rhythm

Use line-height as the base spacing unit for vertical rhythm. If body text has `line-height: 1.5` on a 16px base, the rhythm unit is **24px**. All vertical spacing (margins, padding, gaps) should be multiples of this unit.

```css
:root {
  --rhythm: 1.5rem; /* 24px at 16px base */
}

h2 { margin-top: calc(var(--rhythm) * 2); margin-bottom: var(--rhythm); }
p  { margin-bottom: var(--rhythm); }
```

**Line-height guidelines:**

| Element | Line-height |
|---------|-------------|
| Body text (14-18px) | 1.5 - 1.6 |
| Large headings (32px+) | 1.1 - 1.2 |
| Small headings (20-28px) | 1.25 - 1.35 |
| Captions and UI labels | 1.3 - 1.4 |

## Fluid Typography with clamp()

Fluid type scales font size smoothly between a minimum and maximum based on viewport width.

```css
/* Fluid body: 16px at 320px viewport, 20px at 1280px viewport */
font-size: clamp(1rem, 0.833rem + 0.42vw, 1.25rem);
```

**When to use fluid type:**
- Marketing and landing pages — headings that scale with the viewport
- Editorial and content sites — body text that adapts to screen size
- Portfolio and showcase sites — display text

**When NOT to use fluid type:**
- App UI with fixed scale — toolbars, sidebars, form labels should be consistent, not viewport-dependent
- Data tables — column alignment breaks if text size shifts
- Components shared across contexts — a button label should not change size based on where it is rendered

## Font Alternatives

When selecting fonts, consider these high-quality alternatives to common choices:

**Instead of Inter:**
- **Instrument Sans** — similar geometric clarity with more personality; excellent for product UI
- **Plus Jakarta Sans** — warmer, slightly rounded; good for friendly SaaS products
- **Outfit** — geometric but softer; works well for both headings and body

**Instead of Roboto:**
- **Albert Sans** — cleaner geometry with better optical sizing
- **General Sans** — slightly more character than Roboto, still neutral

**Instead of Open Sans:**
- **Source Sans 3** — Adobe's open-source workhorse, updated with variable font support
- **Nunito Sans** — rounded terminals give a friendlier feel

## Font Loading — Preventing FOUT

Flash of Unstyled Text (FOUT) causes a visible layout shift when web fonts load. Use `size-adjust` and metric overrides to make the fallback font match the web font's metrics.

```css
@font-face {
  font-family: 'Instrument Sans';
  src: url('/fonts/InstrumentSans-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
  /* Metric overrides to match system fallback */
  size-adjust: 102%;
  ascent-override: 95%;
  descent-override: 22%;
  line-gap-override: 0%;
}

/* Fallback stack */
body {
  font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

**Key properties:**
- `font-display: swap` — show fallback immediately, swap when loaded
- `size-adjust` — scale the font to match the fallback's overall size
- `ascent-override` / `descent-override` — match vertical metrics to prevent layout shift
- `line-gap-override` — adjust line gap to match fallback

**Additional strategies:**
- Preload critical fonts: `<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>`
- Subset fonts to the character sets you actually use (Latin, Latin Extended)
- Use variable fonts — one file for all weights instead of multiple files

## OpenType Features

Modern fonts include OpenType features that improve readability and polish. Enable them via CSS:

```css
/* Tabular (monospaced) numbers — essential for tables, prices, counters */
.data-table td { font-variant-numeric: tabular-nums; }

/* Diagonal fractions — renders 1/2 as a proper fraction */
.recipe-amount { font-variant-numeric: diagonal-fractions; }

/* Small caps — for abbreviations and acronyms */
abbr { font-variant-caps: all-small-caps; }

/* Ligatures — enable for body text, disable for code */
body { font-variant-ligatures: common-ligatures; }
code { font-variant-ligatures: none; }

/* Stylistic alternates — font-specific alternate glyphs */
.heading { font-feature-settings: 'salt' 1; }
```

**When to use each feature:**

| Feature | CSS Property | Use When |
|---------|-------------|----------|
| `tabular-nums` | `font-variant-numeric: tabular-nums` | Numbers in tables, prices, timers, counters |
| `diagonal-fractions` | `font-variant-numeric: diagonal-fractions` | Recipe amounts, dimensions, ratios |
| `all-small-caps` | `font-variant-caps: all-small-caps` | Abbreviations (NASA, API), legal text |
| `common-ligatures` | `font-variant-ligatures: common-ligatures` | Body text (fi, fl, ffi ligatures) |
| `no-ligatures` | `font-variant-ligatures: none` | Code blocks, monospaced text |
| `ordinal` | `font-variant-numeric: ordinal` | Dates (1st, 2nd, 3rd) |
