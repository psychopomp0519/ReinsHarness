/**
 * Reins Hook: Learning Observer
 *
 * Event: Stop
 * Action: Record failure/correction patterns to .reins/learnings/
 */

import { existsSync, mkdirSync, appendFileSync, readFileSync } from "fs";
import { join } from "path";

interface HookInput {
  session_id?: string;
  stop_reason?: string;
  transcript_summary?: string;
}

interface LearningEntry {
  timestamp: string;
  session_id: string;
  type: "error" | "pattern" | "preference";
  description: string;
  context: string;
}

function getLearningsDir(): string {
  const dir = join(process.cwd(), ".reins", "learnings");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function recordEntry(entry: LearningEntry, filename: string): void {
  const dir = getLearningsDir();
  const filepath = join(dir, filename);
  appendFileSync(filepath, JSON.stringify(entry) + "\n", "utf-8");
}

function extractPatternsFromTranscript(transcript: string): LearningEntry[] {
  const entries: LearningEntry[] = [];
  const sessionId = process.env.CLAUDE_SESSION_ID ?? "unknown";
  const timestamp = new Date().toISOString();

  // Detect error patterns
  const errorPatterns = [
    /error[:\s]+(.+)/gi,
    /failed[:\s]+(.+)/gi,
    /fix(?:ed|ing)?[:\s]+(.+)/gi,
  ];

  for (const pattern of errorPatterns) {
    let match;
    while ((match = pattern.exec(transcript)) !== null) {
      entries.push({
        timestamp,
        session_id: sessionId,
        type: "error",
        description: match[1].trim().slice(0, 200),
        context: match.input.slice(Math.max(0, match.index - 50), match.index + 100).trim(),
      });
    }
  }

  return entries;
}

function main(): void {
  const inputRaw = process.env.CLAUDE_HOOK_INPUT;
  if (!inputRaw) {
    process.exit(0);
  }

  let input: HookInput;
  try {
    input = JSON.parse(inputRaw) as HookInput;
  } catch {
    process.exit(0);
    return;
  }

  const sessionId = input.session_id ?? process.env.CLAUDE_SESSION_ID ?? "unknown";
  const timestamp = new Date().toISOString();

  // Record session end
  const sessionEntry: LearningEntry = {
    timestamp,
    session_id: sessionId,
    type: "pattern",
    description: `Session ended: ${input.stop_reason ?? "unknown"}`,
    context: input.transcript_summary?.slice(0, 500) ?? "",
  };
  recordEntry(sessionEntry, "patterns.jsonl");

  // Extract and record any error patterns from transcript
  if (input.transcript_summary) {
    const patterns = extractPatternsFromTranscript(input.transcript_summary);
    for (const entry of patterns) {
      recordEntry(entry, "errors.jsonl");
    }
  }
}

main();
