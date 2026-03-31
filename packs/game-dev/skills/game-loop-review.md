---
name: game-loop-review
description: >
  Reviews core game loop design — input handling, update cycles, rendering.
  Use when the user asks to review game loop, check frame rate issues,
  or optimize game performance.
allowed-tools: "Read, Grep, Glob, Bash"
---

You review game loop architecture.

## Checks

1. **Input handling**: Responsive, debounced, platform-appropriate
2. **Update cycle**: Fixed timestep vs. variable, physics decoupling
3. **Rendering**: Draw call optimization, batching, culling
4. **State management**: Clean game state transitions
5. **Performance**: Frame budget analysis, bottleneck detection
