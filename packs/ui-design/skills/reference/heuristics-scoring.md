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

| Score | Criteria |
|-------|----------|
| 0 | No feedback — user is guessing what happened |
| 1 | Delayed or unclear feedback; status indicators missing for major flows |
| 2 | Basic feedback present but inconsistent across flows |
| 3 | Clear feedback for most actions; minor gaps in progress indication |
| 4 | Every action confirms; progress always visible; state is always obvious |

### H2 — Match Between System and Real World

The system uses language and concepts familiar to the user, not developer jargon.

- [ ] Labels and copy use plain, audience-appropriate language
- [ ] Icons and metaphors map to real-world objects the user recognizes
- [ ] Information appears in a natural, logical order

| Score | Criteria |
|-------|----------|
| 0 | Interface dominated by developer jargon, codes, or internal terminology |
| 1 | Frequent unfamiliar terms; information order feels arbitrary |
| 2 | Mostly understandable but several labels or flows feel unnatural |
| 3 | Language is clear and logical; minor jargon or ordering issues |
| 4 | All copy reads naturally; icons and metaphors immediately understood; logical flow throughout |

### H3 — User Control and Freedom

Users can undo, redo, and exit unwanted states easily.

- [ ] Undo/redo available for destructive actions
- [ ] Clear "back" or "cancel" paths from any flow
- [ ] Confirmation prompts before irreversible operations

| Score | Criteria |
|-------|----------|
| 0 | No undo, no back, no cancel — user is trapped in flows |
| 1 | Exit paths exist but are hard to find; no undo for destructive actions |
| 2 | Back/cancel available in most flows but undo is missing or inconsistent |
| 3 | Good control with minor gaps; undo available for most destructive actions |
| 4 | Full undo/redo; clear exit from every state; confirmations on all irreversible operations |

### H4 — Consistency and Standards

The interface follows platform conventions and its own internal patterns.

- [ ] UI elements behave the same way throughout the product
- [ ] Terminology is consistent across pages and flows
- [ ] Platform conventions respected (e.g., link styles, form patterns)

| Score | Criteria |
|-------|----------|
| 0 | No consistent patterns; every screen feels like a different product |
| 1 | Major inconsistencies in interaction patterns or terminology |
| 2 | Generally consistent but several notable deviations from platform or internal conventions |
| 3 | Strong consistency; minor terminology or styling deviations |
| 4 | Fully consistent internal patterns; platform conventions respected throughout |

### H5 — Error Prevention

The design prevents errors before they happen, rather than relying on error messages.

- [ ] Destructive actions require confirmation
- [ ] Input constraints communicated before submission (format hints, character limits)
- [ ] Defaults and suggestions reduce chance of wrong input

| Score | Criteria |
|-------|----------|
| 0 | No error prevention — users can easily destroy data or submit invalid input with no warning |
| 1 | Minimal prevention; destructive actions lack confirmation; no input hints |
| 2 | Some constraints and confirmations but gaps in critical flows |
| 3 | Good prevention for most flows; smart defaults present; minor gaps |
| 4 | Comprehensive prevention; constraints communicated upfront; destructive actions always confirmed; smart defaults throughout |

### H6 — Recognition Rather Than Recall

The interface minimizes memory load by making elements, actions, and options visible.

- [ ] Key actions and navigation always visible, not hidden behind menus
- [ ] Form fields show labels (not placeholder-only)
- [ ] Recently used items or history accessible where relevant

| Score | Criteria |
|-------|----------|
| 0 | User must memorize commands, paths, or data; critical actions hidden |
| 1 | Heavy reliance on recall; placeholder-only labels; no visible history |
| 2 | Most actions visible but some key functions require memory or exploration |
| 3 | Good visibility; persistent labels; minor recall demands |
| 4 | Everything recognizable; persistent labels; recent history available; no hidden critical actions |

### H7 — Flexibility and Efficiency of Use

The system caters to both novice and expert users.

- [ ] Keyboard shortcuts or accelerators available for frequent actions
- [ ] Customizable or adaptive interface elements where appropriate
- [ ] Progressive disclosure: simple first, advanced on demand

| Score | Criteria |
|-------|----------|
| 0 | One rigid path for all users; no shortcuts, no customization |
| 1 | Minimal flexibility; no keyboard shortcuts; all users forced through the same steps |
| 2 | Some shortcuts or alternative paths but limited customization |
| 3 | Good flexibility; keyboard shortcuts for common actions; progressive disclosure present |
| 4 | Expert accelerators, customizable workflows, progressive disclosure, and adaptive UI all present |

### H8 — Aesthetic and Minimalist Design

Interfaces do not contain irrelevant or rarely needed information.

- [ ] Content hierarchy is clear; primary actions are visually dominant
- [ ] No decorative elements that compete with functional content
- [ ] White space used effectively to reduce cognitive load

| Score | Criteria |
|-------|----------|
| 0 | Cluttered, noisy interface; no visual hierarchy; decoration competes with content |
| 1 | Significant clutter; unclear hierarchy; multiple competing calls to action |
| 2 | Some hierarchy but unnecessary elements remain; whitespace underused |
| 3 | Clean design with clear hierarchy; minor clutter or redundant elements |
| 4 | Every element earns its place; clear hierarchy; effective whitespace; primary actions unmistakable |

### H9 — Help Users Recognize, Diagnose, and Recover from Errors

Error messages are expressed in plain language with constructive suggestions.

- [ ] Error messages describe the problem in user terms, not codes
- [ ] Messages suggest a concrete next step or fix
- [ ] Errors appear near the relevant field or action, not just in a toast

| Score | Criteria |
|-------|----------|
| 0 | No error messages, or errors shown as raw codes/stack traces |
| 1 | Error messages exist but are cryptic, vague, or blame the user |
| 2 | Messages are understandable but lack next steps or appear far from the problem |
| 3 | Clear error messages near the relevant context; most suggest a fix |
| 4 | All errors are plain-language, contextual, suggest specific recovery steps, and help prevent recurrence |

### H10 — Help and Documentation

Easy-to-search help is available, focused on the user's task.

- [ ] Contextual help or tooltips available for complex features
- [ ] Documentation is task-oriented, not feature-oriented
- [ ] Search or FAQ accessible from within the product

| Score | Criteria |
|-------|----------|
| 0 | No help, no documentation, no tooltips anywhere |
| 1 | Help exists but is hard to find, outdated, or feature-oriented instead of task-oriented |
| 2 | Documentation available but lacks contextual help; search is missing or poor |
| 3 | Good contextual help and task-oriented docs; minor coverage gaps |
| 4 | Contextual tooltips everywhere needed; searchable, task-oriented docs; help accessible from within every flow |
