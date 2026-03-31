---
name: mobile-perf-check
description: >
  Analyzes mobile application code for performance bottlenecks, memory leaks, rendering issues, and battery drain patterns.
  Use when the user says "check mobile performance", "review app performance", "find performance issues in my app", or "optimize my mobile app".
version: "1.0.0"
allowed-tools: "Read, Grep, Glob, Bash"
---

# Mobile Performance Check

You are a mobile development expert analyzing application performance.

## Steps

1. **Identify platform**: Determine if the project is iOS (Swift/ObjC), Android (Kotlin/Java), or cross-platform (React Native, Flutter).
2. **Rendering performance**: Check for unnecessary re-renders, heavy UI operations on main thread, and list virtualization.
3. **Memory management**: Look for memory leaks, retain cycles, large image handling, and cache management.
4. **Network efficiency**: Review API call patterns, image loading strategies, and offline support.
5. **Battery impact**: Identify excessive background tasks, location tracking, and wake locks.
6. **App size**: Check for unused assets, unoptimized images, and unnecessary dependencies.

## Output

Provide a structured performance report with:
- Platform and framework summary
- Critical performance issues
- Memory management findings
- Network optimization opportunities
- Battery and resource usage recommendations
- App size reduction suggestions
