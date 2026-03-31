# Nielsen Heuristics Scoring Rubric

## Scale

Each heuristic is scored 0-4. Total possible: **40**.

| Score | Meaning |
|-------|---------|
| 0 | Not addressed at all; fundamental violation |
| 1 | Major problems; heuristic violated in most flows |
| 2 | Partial compliance; several notable issues remain |
| 3 | Good compliance; minor issues only |
| 4 | Excellent; fully satisfied with no notable issues |

## Rating Bands

| Range | Rating | Implication |
|-------|--------|-------------|
| 36-40 | Excellent | Ship-ready; polish only |
| 28-35 | Good | Minor issues; safe to ship with follow-ups |
| 20-27 | Acceptable | Needs targeted fixes before release |
| 12-19 | Poor | Significant rework required |
| 0-11 | Critical | Fundamental redesign needed |

## Heuristics and Checklists

### H1 — Visibility of System Status

The system keeps users informed about what is going on through timely feedback.

- [ ] Loading and progress indicators present for async operations
- [ ] Current state is visually clear (active nav, selected item, form progress)
- [ ] Real-time feedback on user actions (button press, form input)

### H2 — Match Between System and Real World

The system uses language and concepts familiar to the user, not developer jargon.

- [ ] Labels and copy use plain, audience-appropriate language
- [ ] Icons and metaphors map to real-world objects the user recognizes
- [ ] Information appears in a natural, logical order

### H3 — User Control and Freedom

Users can undo, redo, and exit unwanted states easily.

- [ ] Undo/redo available for destructive actions
- [ ] Clear "back" or "cancel" paths from any flow
- [ ] Confirmation prompts before irreversible operations

### H4 — Consistency and Standards

The interface follows platform conventions and its own internal patterns.

- [ ] UI elements behave the same way throughout the product
- [ ] Terminology is consistent across pages and flows
- [ ] Platform conventions respected (e.g., link styles, form patterns)

### H5 — Error Prevention

The design prevents errors before they happen, rather than relying on error messages.

- [ ] Destructive actions require confirmation
- [ ] Input constraints communicated before submission (format hints, character limits)
- [ ] Defaults and suggestions reduce chance of wrong input

### H6 — Recognition Rather Than Recall

The interface minimizes memory load by making elements, actions, and options visible.

- [ ] Key actions and navigation always visible, not hidden behind menus
- [ ] Form fields show labels (not placeholder-only)
- [ ] Recently used items or history accessible where relevant

### H7 — Flexibility and Efficiency of Use

The system caters to both novice and expert users.

- [ ] Keyboard shortcuts or accelerators available for frequent actions
- [ ] Customizable or adaptive interface elements where appropriate
- [ ] Progressive disclosure: simple first, advanced on demand

### H8 — Aesthetic and Minimalist Design

Interfaces do not contain irrelevant or rarely needed information.

- [ ] Content hierarchy is clear; primary actions are visually dominant
- [ ] No decorative elements that compete with functional content
- [ ] White space used effectively to reduce cognitive load

### H9 — Help Users Recognize, Diagnose, and Recover from Errors

Error messages are expressed in plain language with constructive suggestions.

- [ ] Error messages describe the problem in user terms, not codes
- [ ] Messages suggest a concrete next step or fix
- [ ] Errors appear near the relevant field or action, not just in a toast

### H10 — Help and Documentation

Easy-to-search help is available, focused on the user's task.

- [ ] Contextual help or tooltips available for complex features
- [ ] Documentation is task-oriented, not feature-oriented
- [ ] Search or FAQ accessible from within the product
