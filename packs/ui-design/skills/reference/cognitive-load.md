# Cognitive Load Reference

## Three Types of Cognitive Load

| Type | Definition | Design Lever |
|------|-----------|--------------|
| **Intrinsic** | Inherent complexity of the task itself | Cannot be removed, only managed — break complex tasks into steps |
| **Extraneous** | Load caused by bad design, not the task | Eliminate — this is pure waste (confusing layout, unclear labels, visual clutter) |
| **Germane** | Productive load spent learning and forming mental models | Encourage — use consistent patterns so learning transfers across the interface |

The goal: minimize extraneous load so users can spend their limited cognitive budget on intrinsic and germane processing.

## Working Memory Limits

Working memory holds roughly **4 items** at a time (Cowan, 2001). Practical implications:

| Element | Limit | Why |
|---------|-------|-----|
| Pricing tiers | Max 3 | Users cannot compare more than 3 plans without a matrix |
| Navigation items (top-level) | Max 7 | Beyond 7, group into categories or use mega-menu |
| Form fields visible at once | 5-7 | Chunk longer forms into steps |
| Dashboard metrics (primary) | 3-4 | Additional metrics go to a detail view |
| Toast/notification actions | 1-2 | More than 2 choices in a transient element causes panic |

## 8 Named Violations

### 1. Wall of Options

**Description:** Too many choices presented simultaneously. The user freezes (Hick's Law) or picks poorly because they cannot evaluate all options.

**Symptoms:** Settings pages with 30+ toggles. Mega-forms with every field visible. Dropdown menus with 50+ items.

**Fix:** Progressive disclosure. Show the top 3-5 options; hide the rest behind "Show more" or a search filter. Use smart defaults so most users never need the advanced options.

---

### 2. Memory Bridge

**Description:** The user must remember information from one screen and carry it mentally to another screen to complete a task.

**Symptoms:** A confirmation page that does not repeat what the user entered. A multi-step flow where step 3 references a choice made in step 1 without displaying it. Comparison tools that require switching tabs.

**Fix:** Persist context. Show a summary sidebar, breadcrumb with selections, or sticky header that carries forward key choices. Never force the user to memorize and re-enter data.

---

### 3. Hidden Navigation

**Description:** Important actions are buried behind menus, hover states, or icons with no labels. Users do not know the action exists.

**Symptoms:** Critical functions only in a hamburger menu on desktop. Actions hidden behind a "..." overflow menu with no indication of what is inside. Icon-only toolbars with no tooltips.

**Fix:** Surface primary actions. The top 1-2 actions for any context should be visible as labeled buttons. Secondary actions can live in menus, but the menu trigger must hint at contents (e.g., "More actions" not just "...").

---

### 4. Jargon Barrier

**Description:** The interface uses domain-specific or technical terms without explanation, alienating users who are not specialists.

**Symptoms:** Labels like "Idempotency Key", "TTL", or "Webhook" shown to non-technical end users. Error messages with HTTP status codes. Abbreviations without expansion.

**Fix:** Plain language first, technical term second. Use tooltips or inline help for necessary jargon: "Retry safety (idempotency key)". Test labels with someone outside the team.

---

### 5. Visual Noise Floor

**Description:** Too many visual elements compete for attention. Nothing stands out because everything shouts equally.

**Symptoms:** Every card has a border, shadow, and badge. Multiple competing CTAs on the same screen. Dense data tables with no row grouping or alternating colors. Excessive use of bold, color, and icons.

**Fix:** Reduce and create hierarchy. Apply the squint test: squint at the screen and check if the primary action is still obvious. Remove decorative borders. Use whitespace as a separator instead of lines. Limit color accents to 1-2 per view.

---

### 6. Inconsistent Pattern

**Description:** The same action works differently in different parts of the interface, forcing users to re-learn behavior they thought they understood.

**Symptoms:** "Save" auto-saves in one section but requires a button click in another. Clicking a table row navigates in one view but selects in another. Date pickers use different formats across forms.

**Fix:** Standardize. Audit all instances of repeated patterns (save, delete, select, navigate) and make them behave identically. Document interaction patterns in a design system.

---

### 7. Multi-Task Demand

**Description:** The interface requires the user to attend to multiple things simultaneously — reading instructions while filling a form, monitoring a timer while editing content.

**Symptoms:** Instructions disappear when the input field gains focus. A countdown timer runs while the user is expected to make a complex decision. Required reference material is in a separate tab.

**Fix:** Serialize steps. Show instructions inline and persistently. Pause timers during active input. Embed reference material in context (inline expansion, side panel) rather than requiring tab-switching.

---

### 8. Context Switch

**Description:** The interface forces the user to shift mental models — switching from reading to calculating, from browsing to configuring, from one conceptual domain to another — without a clear transition.

**Symptoms:** A billing page interleaved with account settings. A dashboard that mixes operational metrics with marketing analytics. An editor that requires switching between visual and code modes to complete a single task.

**Fix:** Group related actions. Each screen or section should serve one mental model. If a task requires multiple modes, provide a clear transition (a named step, a tab, a modal) so the user can consciously shift gears.
