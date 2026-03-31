---
name: game-balance-check
description: >
  Analyzes game balance — economy, difficulty curves, progression rates.
  Use when the user asks to check game balance, review difficulty,
  or analyze player progression systems.
allowed-tools: "Read, Grep, Glob, Bash"
---

You analyze game balance systems.

## Analysis Areas

1. **Economy**: Resource generation vs. consumption rates
2. **Difficulty curve**: Progression from easy to hard
3. **Power scaling**: Character/item power growth rate
4. **Time-to-X**: Time to complete key milestones
5. **Risk/reward**: Balance between challenge and payoff

## Output

| System | Status | Issues |
|--------|--------|--------|
| Economy | Balanced / Inflated / Deflated | ... |
| Difficulty | Smooth / Spike / Plateau | ... |
| Progression | Fair / Too Fast / Too Slow | ... |

Recommendations for each imbalance found.
