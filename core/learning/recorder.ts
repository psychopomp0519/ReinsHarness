/**
 * Reins Learning — Recorder
 *
 * Higher-level recording functions for specific event types.
 */

import { recordEvent, type LearningEvent } from "./observer.js";

/**
 * Record an error that occurred during task execution.
 */
export function recordError(
  projectRoot: string,
  sessionId: string,
  mode: string,
  error: string,
  context: string,
  resolution?: string,
): void {
  recordEvent(projectRoot, {
    type: resolution ? "correction" : "error",
    timestamp: new Date().toISOString(),
    sessionId,
    mode,
    description: error,
    context,
    resolution,
  });
}

/**
 * Record a user preference observation.
 */
export function recordPreference(
  projectRoot: string,
  sessionId: string,
  mode: string,
  preference: string,
  context: string,
): void {
  recordEvent(projectRoot, {
    type: "preference",
    timestamp: new Date().toISOString(),
    sessionId,
    mode,
    description: preference,
    context,
  });
}

/**
 * Record a detected pattern.
 */
export function recordPattern(
  projectRoot: string,
  sessionId: string,
  mode: string,
  pattern: string,
  context: string,
): void {
  recordEvent(projectRoot, {
    type: "pattern",
    timestamp: new Date().toISOString(),
    sessionId,
    mode,
    description: pattern,
    context,
  });
}
