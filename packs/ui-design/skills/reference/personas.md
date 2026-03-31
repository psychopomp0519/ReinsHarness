# Test Personas Reference

Use these personas to stress-test interfaces from different user perspectives. Select 2-3 personas relevant to your interface type and walk through key flows from each perspective.

---

## 1. Alex — Power User

**Profile:** Daily user who has internalized the interface. Values speed above all else. Will find and memorize every keyboard shortcut. Gets frustrated by confirmations, wizards, and anything that slows a routine task.

**Behaviors:**
- Skips onboarding and tutorials immediately
- Uses keyboard shortcuts, tab order, and browser search to navigate
- Opens multiple tabs/instances to work in parallel
- Customizes settings, creates templates, sets up automations
- Files bug reports with reproduction steps

**Test Questions:**
1. Can Alex complete the top 3 tasks without touching the mouse?
2. Are there keyboard shortcuts for frequent actions, and are they discoverable (but not forced)?
3. Does the interface offer bulk operations for repetitive tasks?
4. Can Alex skip confirmations for low-risk, repeatable actions?

**Red Flags:**
- Mandatory multi-step wizards for simple actions
- No keyboard shortcut support or undiscoverable shortcuts
- Forced confirmation dialogs on every save/delete with no "don't ask again" option
- No way to customize the default view or workflow

---

## 2. Jordan — First-Timer

**Profile:** Arrived from a marketing link or colleague's recommendation. Has never seen this product before. Reads button labels carefully. Gets anxious about making irreversible mistakes. Abandons flows if confused.

**Behaviors:**
- Reads every label and description before clicking
- Hovers over elements hoping for tooltips
- Uses the back button frequently when uncertain
- Searches for help documentation when stuck
- Abandons signup or checkout if it feels too long or asks for too much

**Test Questions:**
1. Can Jordan understand what the product does within 10 seconds of landing?
2. Can Jordan complete the primary task without external help or documentation?
3. Are error messages specific enough for Jordan to fix the problem without guessing?
4. Is every piece of jargon either avoided or explained inline?

**Red Flags:**
- Placeholder-only form labels that disappear on focus
- Technical jargon with no explanation (API, webhook, slug)
- No visible "undo" or "go back" path after a mistake
- Empty states that provide no guidance on what to do next

---

## 3. Sam — Accessibility User

**Profile:** Uses a screen reader (NVDA/JAWS on Windows, VoiceOver on Mac/iOS). Navigates entirely by keyboard. May also have low vision and use high-contrast mode or zoom at 200%. Evaluates interfaces by how well they respect semantic HTML.

**Behaviors:**
- Navigates by headings, landmarks, and tab order
- Relies on aria-labels, alt text, and live regions for dynamic content
- Uses high contrast and enlarged text settings
- Tests focus management after modals, toasts, and route changes
- Avoids interfaces that trap keyboard focus

**Test Questions:**
1. Can Sam navigate to and activate every interactive element using only the keyboard?
2. Does the screen reader announce dynamic changes (toasts, form errors, live data)?
3. Do all images, icons, and charts have meaningful alt text or aria-labels?

**Red Flags:**
- Interactive elements that are not focusable or have no visible focus indicator
- Modals or drawers that do not trap focus (or trap it and never release it)
- Color as the only indicator of state (error = red, success = green, with no icon or text)
- Custom components that ignore ARIA patterns (custom dropdown, custom checkbox)

---

## 4. Riley — Stress Tester

**Profile:** Pushes the system to its limits, intentionally or through legitimate extreme use. Has thousands of items, pastes War and Peace into text fields, uploads 100 MB files, and clicks submit 15 times while the spinner is showing.

**Behaviors:**
- Creates items with very long names, special characters, and emoji
- Uploads maximum-size or wrong-format files to test validation
- Performs rapid sequential actions (double-click, fast navigation)
- Tests with thousands of rows/items to check pagination and performance
- Uses the interface in unexpected order (skip steps, go back, refresh mid-flow)

**Test Questions:**
1. Does the interface degrade gracefully with 10,000+ items (pagination, virtual scroll)?
2. Are submit buttons disabled after click to prevent duplicate submissions?
3. What happens when Riley pastes 50,000 characters into a text field?
4. Does the system handle concurrent edits or race conditions?

**Red Flags:**
- No character limits or file size validation on inputs
- Tables that render all rows in the DOM regardless of count
- Double-submit creating duplicate records
- Application crash or blank screen on unexpected input

---

## 5. Casey — Distracted Mobile User

**Profile:** Using a phone one-handed on a bus with a spotty 3G connection. Gets interrupted by notifications, puts the phone down mid-task, and comes back 10 minutes later. Has large fingers and a cracked screen protector.

**Behaviors:**
- Uses only one thumb to tap; avoids top corners of the screen
- Gets interrupted mid-flow and returns to a potentially stale page
- Experiences slow loads, timeouts, and partial page renders
- Fat-fingers small touch targets, especially close-together links
- Rotates between portrait and landscape accidentally

**Test Questions:**
1. Are all touch targets at least 44x44px with adequate spacing between them?
2. Does the interface preserve form state if Casey switches apps and returns?
3. Is the experience usable on a slow 3G connection (loading states, offline handling)?
4. Can Casey complete the primary task one-handed without reaching the top of the screen?

**Red Flags:**
- Touch targets smaller than 44x44px or placed too close together
- Form data lost when the user navigates away and returns
- No loading states or timeout handling for slow connections
- Critical actions placed in the top corners of the screen (unreachable one-handed)

---

## Persona Selection Table

Use this table to pick the right test personas for your interface type:

| Interface Type | Primary Personas | Why |
|----------------|-----------------|-----|
| Dashboard | Alex, Sam | Power users live here; accessibility of data viz is critical |
| E-commerce | Casey, Riley, Jordan | Mobile shoppers, edge-case pricing, first-time buyers |
| Form-heavy | Jordan, Sam, Riley | New users struggle with forms; a11y and validation matter most |
| Content / blog | Casey, Jordan | Mobile readers, first-time visitors from search |
| Admin / tool | Alex, Riley | Power users doing bulk operations; stress on data volume |
| Onboarding | Jordan, Casey | First impressions; must work for confused and distracted users |
| Data table | Alex, Riley, Sam | Keyboard navigation, large datasets, screen reader row handling |
