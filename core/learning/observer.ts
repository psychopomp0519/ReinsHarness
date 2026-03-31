/**
 * Reins Learning — Observer
 *
 * Watches for events (failures, corrections, patterns) and records them.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";

export interface LearningEvent {
  type: "error" | "correction" | "pattern" | "preference";
  timestamp: string;
  sessionId: string;
  mode: string;
  description: string;
  context: string;
  resolution?: string;
}

/**
 * Record a learning event.
 */
export function recordEvent(projectRoot: string, event: LearningEvent): void {
  const dir = join(projectRoot, ".reins", "learnings");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const fileMap: Record<string, string> = {
    error: "errors.jsonl",
    correction: "errors.jsonl",
    pattern: "patterns.jsonl",
    preference: "preferences.jsonl",
  };

  const filename = fileMap[event.type] || "patterns.jsonl";
  const filepath = join(dir, filename);

  appendFileSync(filepath, JSON.stringify(event) + "\n", "utf-8");
}

/**
 * Read recent learnings of a given type.
 */
export function readLearnings(
  projectRoot: string,
  type: "errors" | "patterns" | "preferences",
  limit: number = 50,
): LearningEvent[] {
  const filepath = join(projectRoot, ".reins", "learnings", `${type}.jsonl`);

  if (!existsSync(filepath)) {
    return [];
  }

  try {
    const lines = readFileSync(filepath, "utf-8").trim().split("\n");
    return lines
      .filter((l) => l.trim())
      .slice(-limit)
      .map((l) => JSON.parse(l) as LearningEvent);
  } catch {
    return [];
  }
}
