# Color Reference

## OKLCH Color Space

**Why OKLCH over HSL:** HSL is not perceptually uniform. A blue at `hsl(240, 100%, 50%)` and a yellow at `hsl(60, 100%, 50%)` have the same L value but wildly different perceived brightness. This makes it impossible to build consistent color palettes by adjusting only one axis.

OKLCH (Lightness, Chroma, Hue) fixes this. Two colors with the same L value in OKLCH actually look equally bright to the human eye.

```css
/* OKLCH syntax: oklch(lightness chroma hue) */
/* lightness: 0% (black) to 100% (white) */
/* chroma: 0 (gray) to ~0.4 (maximum saturation, varies by hue) */
/* hue: 0-360 degrees */

--color-primary: oklch(55% 0.25 250);   /* vivid blue */
--color-success: oklch(55% 0.20 145);   /* green at same perceived brightness */
--color-warning: oklch(75% 0.15 85);    /* yellow — higher L because yellow is naturally light */
--color-error:   oklch(55% 0.22 25);    /* red at same perceived brightness as primary */
```

**Practical advantage:** When you set L to the same value across your palette, all colors appear equally prominent. This eliminates the "the yellow looks washed out but the blue is fine" problem.

## Tinted Neutrals

Pure gray (`oklch(95% 0 0)` / `#f2f2f2`) looks sterile and slightly cold. Tinted neutrals add a tiny amount of chroma and a warm hue to create surfaces that feel intentional.

```css
/* Instead of pure gray backgrounds */
--surface-1: oklch(98% 0.005 60);   /* barely warm white */
--surface-2: oklch(95% 0.01 60);    /* warm light gray */
--surface-3: oklch(90% 0.01 60);    /* warm medium gray */
--border:    oklch(85% 0.01 60);    /* warm border */

/* For cool-toned brands, shift hue toward blue */
--surface-1: oklch(98% 0.005 250);  /* barely cool white */
--surface-2: oklch(95% 0.01 250);   /* cool light gray */
```

**Rule of thumb:** Keep chroma between `0.005` and `0.015` for neutrals. Higher than that and the surface starts to look colored rather than neutral.

## The 60-30-10 Rule

Distribute color usage across three tiers to create visual balance:

| Tier | Percentage | Role | Example |
|------|-----------|------|---------|
| 60% | Dominant | Background and surface | White/neutral backgrounds, cards |
| 30% | Secondary | Supporting structure | Navigation, sidebars, secondary buttons |
| 10% | Accent | Call to action, emphasis | Primary buttons, links, badges, focus rings |

**How to check:** Screenshot the page, squint, and estimate the color distribution. If your accent color covers more than 15% of the viewport, it stops being an accent and becomes visual noise.

## Dark Mode

Dark mode is NOT an inverted light mode. Directly inverting colors creates harsh contrast, oversaturated colors, and broken visual hierarchy.

**Key principles:**

1. **Reduce font weight.** Light text on dark backgrounds appears heavier than dark text on light backgrounds. Consider using a lighter font weight (400 instead of 500) or slightly reducing font size in dark mode.

2. **Desaturate colors.** Vivid colors that work on white backgrounds are painful on dark surfaces. Reduce chroma by 20-30%:
   ```css
   --color-primary-light: oklch(55% 0.25 250);  /* light mode */
   --color-primary-dark:  oklch(70% 0.18 250);  /* dark mode: higher L, lower chroma */
   ```

3. **Surface elevation replaces shadows.** In light mode, cards float above the background via box-shadow. In dark mode, shadows are invisible against dark backgrounds. Instead, use lighter surface colors to indicate elevation:
   ```css
   --surface-base: oklch(15% 0.01 250);   /* lowest layer */
   --surface-1:    oklch(20% 0.01 250);   /* card */
   --surface-2:    oklch(25% 0.01 250);   /* raised card, dropdown */
   --surface-3:    oklch(30% 0.01 250);   /* modal, popover */
   ```

4. **Reduce contrast slightly.** Pure white (`#fff`) on pure black (`#000`) creates harsh vibration. Use off-white text (`oklch(90% 0 0)`) on dark gray (`oklch(15% 0.01 hue)`) for comfortable reading.

## Token Hierarchy

Color tokens should follow a two-tier (or three-tier) hierarchy:

### Primitive Tokens (Tier 1)
Raw color values, named by color and shade. Never referenced directly in components.

```css
--blue-50:  oklch(97% 0.02 250);
--blue-100: oklch(93% 0.05 250);
--blue-500: oklch(55% 0.25 250);
--blue-900: oklch(25% 0.10 250);
--red-500:  oklch(55% 0.22 25);
```

### Semantic Tokens (Tier 2)
Purpose-based aliases that reference primitives. Components use these.

```css
--color-primary:     var(--blue-500);
--color-error:       var(--red-500);
--color-surface:     var(--gray-50);
--color-text:        var(--gray-900);
--color-border:      var(--gray-200);
```

### Component Tokens (Tier 3, optional)
Scoped to a specific component. Useful in large systems.

```css
--button-bg:       var(--color-primary);
--button-bg-hover: var(--blue-600);
--card-bg:         var(--color-surface);
```

**Why this matters:** When rebranding, you change primitive tokens. When switching to dark mode, you change semantic tokens. When redesigning a single component, you change component tokens. Each tier isolates a different kind of change.

## Alpha-as-Design-Smell Warning

Using `opacity` or alpha channels (rgba, oklch with `/alpha`) to create color variations is a code smell in most cases:

**Problems with alpha:**
- Colors change depending on what is behind them — a 50% opacity blue looks different on white vs. on gray vs. on an image
- Overlapping transparent elements create unpredictable muddy colors
- Performance cost of compositing layers
- Cannot be represented as a single hex value in design handoffs

**When alpha IS appropriate:**
- Overlays and scrims (dimming background behind a modal)
- Glass/blur effects (intentional transparency)
- Disabled states (where you want the background to show through)

**Instead of alpha, use explicit colors:**
```css
/* Bad: depends on background */
--button-hover: oklch(55% 0.25 250 / 0.1);

/* Good: explicit, predictable color */
--button-hover: oklch(95% 0.03 250);
```

## Dangerous Color Combinations

Avoid these combinations — they fail accessibility, cause visual vibration, or mislead users:

| Combination | Problem |
|-------------|---------|
| Red text on green (or vice versa) | Indistinguishable for ~8% of males with color vision deficiency |
| Pure red + pure blue adjacent | Chromatic aberration / vibration at the boundary |
| Low-contrast gray text on white | Fails WCAG AA (requires 4.5:1 for normal text, 3:1 for large) |
| Green = good, red = bad (color only) | Must pair with icons, labels, or patterns for color-blind users |
| Saturated background + saturated text | Eye strain; one must be desaturated |
| Yellow text on white | Insufficient contrast in almost all cases |
| Neon/fluorescent on dark backgrounds | Causes halation (glowing/bleeding effect) for users with astigmatism |
