/**
 * Reins Performance Profiler
 *
 * Tracks session performance metrics including token usage, response times,
 * tool call counts, and mode durations. Profiles can be started, stopped,
 * and exported as structured reports.
 */

import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

/** A single recorded metric entry */
export interface MetricEntry {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  mode?: string;
}

/** Aggregate stats for a single metric name */
export interface MetricSummary {
  name: string;
  count: number;
  total: number;
  min: number;
  max: number;
  avg: number;
  unit: string;
}

/** Duration a mode was active */
export interface ModeDuration {
  mode: string;
  durationMs: number;
  enteredAt: string;
  exitedAt: string | null;
}

/** Complete profile for a session */
export interface ProfileData {
  sessionId: string;
  startedAt: string;
  stoppedAt: string | null;
  metrics: MetricEntry[];
  modeDurations: ModeDuration[];
}

/** Structured report generated from profile data */
export interface ProfileReport {
  sessionId: string;
  durationMs: number;
  metricSummaries: MetricSummary[];
  modeDurations: ModeDuration[];
  totalTokens: number;
  totalToolCalls: number;
  avgResponseTimeMs: number;
}

/** In-memory store for active profiles */
const activeProfiles = new Map<string, ProfileData>();

/**
 * Start profiling a new session.
 *
 * @param sessionId - Unique identifier for the session
 * @returns The initialized ProfileData
 */
export function startProfile(sessionId: string): ProfileData {
  const profile: ProfileData = {
    sessionId,
    startedAt: new Date().toISOString(),
    stoppedAt: null,
    metrics: [],
    modeDurations: [],
  };
  activeProfiles.set(sessionId, profile);
  return profile;
}

/**
 * Stop profiling a session and finalize its data.
 *
 * @param sessionId - The session to stop profiling
 * @returns The finalized ProfileData, or null if session not found
 */
export function stopProfile(sessionId: string): ProfileData | null {
  const profile = activeProfiles.get(sessionId);
  if (!profile) {
    return null;
  }

  profile.stoppedAt = new Date().toISOString();

  // Close any open mode durations
  for (const md of profile.modeDurations) {
    if (md.exitedAt === null) {
      md.exitedAt = profile.stoppedAt;
      const entered = new Date(md.enteredAt).getTime();
      const exited = new Date(md.exitedAt).getTime();
      md.durationMs = exited - entered;
    }
  }

  activeProfiles.delete(sessionId);
  return profile;
}

/**
 * Record a single metric value for a session.
 *
 * Common metric names:
 * - "tokens" (unit: "tokens") — token usage
 * - "response_time" (unit: "ms") — response latency
 * - "tool_calls" (unit: "count") — tool invocations
 *
 * @param sessionId - The session to record against
 * @param name - Metric name
 * @param value - Numeric value
 * @param unit - Unit label (e.g. "ms", "tokens", "count")
 * @param mode - Optional current mode
 * @returns true if the metric was recorded, false if session not found
 */
export function recordMetric(
  sessionId: string,
  name: string,
  value: number,
  unit: string,
  mode?: string,
): boolean {
  const profile = activeProfiles.get(sessionId);
  if (!profile) {
    return false;
  }

  profile.metrics.push({
    name,
    value,
    unit,
    timestamp: new Date().toISOString(),
    mode,
  });

  return true;
}

/**
 * Record a mode transition for duration tracking.
 *
 * @param sessionId - The session to record against
 * @param mode - The mode being entered
 * @returns true if recorded, false if session not found
 */
export function recordModeEntry(sessionId: string, mode: string): boolean {
  const profile = activeProfiles.get(sessionId);
  if (!profile) {
    return false;
  }

  const now = new Date().toISOString();

  // Close the previous open mode duration
  for (const md of profile.modeDurations) {
    if (md.exitedAt === null) {
      md.exitedAt = now;
      const entered = new Date(md.enteredAt).getTime();
      const exited = new Date(now).getTime();
      md.durationMs = exited - entered;
    }
  }

  profile.modeDurations.push({
    mode,
    durationMs: 0,
    enteredAt: now,
    exitedAt: null,
  });

  return true;
}

/**
 * Compute aggregate summaries for each distinct metric name.
 */
function summarizeMetrics(metrics: MetricEntry[]): MetricSummary[] {
  const grouped = new Map<string, MetricEntry[]>();
  for (const m of metrics) {
    const list = grouped.get(m.name) ?? [];
    list.push(m);
    grouped.set(m.name, list);
  }

  const summaries: MetricSummary[] = [];
  for (const [name, entries] of grouped) {
    const values = entries.map((e) => e.value);
    const total = values.reduce((a, b) => a + b, 0);
    summaries.push({
      name,
      count: values.length,
      total,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: total / values.length,
      unit: entries[0].unit,
    });
  }

  return summaries;
}

/**
 * Generate a structured performance report from a profile.
 * Works with both active and completed profiles.
 *
 * @param profile - The ProfileData to analyze
 * @returns A ProfileReport with aggregated metrics
 */
export function generateReport(profile: ProfileData): ProfileReport {
  const startMs = new Date(profile.startedAt).getTime();
  const endMs = profile.stoppedAt
    ? new Date(profile.stoppedAt).getTime()
    : Date.now();

  const summaries = summarizeMetrics(profile.metrics);

  const tokenSummary = summaries.find((s) => s.name === "tokens");
  const toolCallSummary = summaries.find((s) => s.name === "tool_calls");
  const responseSummary = summaries.find((s) => s.name === "response_time");

  return {
    sessionId: profile.sessionId,
    durationMs: endMs - startMs,
    metricSummaries: summaries,
    modeDurations: profile.modeDurations,
    totalTokens: tokenSummary?.total ?? 0,
    totalToolCalls: toolCallSummary?.total ?? 0,
    avgResponseTimeMs: responseSummary?.avg ?? 0,
  };
}

/**
 * Save a profile report to disk as JSON.
 *
 * @param projectRoot - Absolute path to the project root
 * @param report - The report to save
 * @returns The file path where the report was saved
 */
export function saveReport(projectRoot: string, report: ProfileReport): string {
  const dir = join(projectRoot, ".reins", "profiles");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const filePath = join(dir, `${report.sessionId}.json`);
  writeFileSync(filePath, JSON.stringify(report, null, 2), "utf-8");
  return filePath;
}
