/**
 * Reins Learning — Rule Promoter
 *
 * Promotes recurring learnings (3+ occurrences) into rules.
 */

import { readLearnings, type LearningEvent } from "./observer.js";

export interface PromotionCandidate {
  pattern: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  suggestedRule: string;
}

/**
 * Analyze learnings and find patterns that should be promoted to rules.
 */
export function findPromotionCandidates(
  projectRoot: string,
  threshold: number = 3,
): PromotionCandidate[] {
  const errors = readLearnings(projectRoot, "errors", 200);
  const patterns = readLearnings(projectRoot, "patterns", 200);

  const allEvents = [...errors, ...patterns];
  const grouped = groupBySimilarity(allEvents);

  return grouped
    .filter((g) => g.count >= threshold)
    .map((g) => ({
      pattern: g.description,
      occurrences: g.count,
      firstSeen: g.events[0].timestamp,
      lastSeen: g.events[g.events.length - 1].timestamp,
      suggestedRule: generateRuleSuggestion(g.description, g.events),
    }));
}

interface EventGroup {
  description: string;
  count: number;
  events: LearningEvent[];
}

function groupBySimilarity(events: LearningEvent[]): EventGroup[] {
  const groups: EventGroup[] = [];

  for (const event of events) {
    const normalized = normalizeDescription(event.description);
    const existing = groups.find(
      (g) => normalizeDescription(g.description) === normalized,
    );

    if (existing) {
      existing.count++;
      existing.events.push(event);
    } else {
      groups.push({
        description: event.description,
        count: 1,
        events: [event],
      });
    }
  }

  return groups.sort((a, b) => b.count - a.count);
}

function normalizeDescription(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/\d+/g, "N")
    .replace(/["'][^"']*["']/g, "STR")
    .replace(/\s+/g, " ")
    .trim();
}

function generateRuleSuggestion(
  description: string,
  events: LearningEvent[],
): string {
  const resolutions = events
    .filter((e) => e.resolution)
    .map((e) => e.resolution!);

  if (resolutions.length > 0) {
    return `When "${description}" occurs, apply: ${resolutions[0]}`;
  }

  return `Watch for: "${description}" — occurred ${events.length} times`;
}
