/**
 * Reins Hook: Context Compact
 *
 * Event: PostToolUse
 * Action: Check context window usage. When >60%, suggest compression.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

interface HookInput {
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_output: string;
  session_id?: string;
}

const COMPACT_THRESHOLD = parseInt(process.env.REINS_COMPACT_THRESHOLD ?? "60", 10);
const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes between suggestions

function getReinsDir(): string {
  const dir = join(process.cwd(), ".reins");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getContextPercentage(): number | null {
  // Try to read from statusLine data or environment
  const pct = process.env.CLAUDE_CONTEXT_PERCENTAGE;
  if (pct) {
    return parseInt(pct, 10);
  }

  // Try to read from .reins/context-usage.json (written by statusLine)
  const usageFile = join(getReinsDir(), "context-usage.json");
  if (existsSync(usageFile)) {
    try {
      const data = JSON.parse(readFileSync(usageFile, "utf-8")) as {
        percentage?: number;
      };
      return data.percentage ?? null;
    } catch {
      return null;
    }
  }

  return null;
}

function main(): void {
  const inputRaw = process.env.CLAUDE_HOOK_INPUT;
  if (!inputRaw) {
    process.exit(0);
  }

  // Parse input (just to validate it's a hook call)
  try {
    JSON.parse(inputRaw) as HookInput;
  } catch {
    process.exit(0);
    return;
  }

  const percentage = getContextPercentage();
  if (percentage === null || percentage < COMPACT_THRESHOLD) {
    process.exit(0);
  }

  // Check cooldown
  const stateFile = join(getReinsDir(), "compact-state.json");
  let lastSuggest = 0;

  if (existsSync(stateFile)) {
    try {
      const state = JSON.parse(readFileSync(stateFile, "utf-8")) as {
        lastSuggest?: number;
      };
      lastSuggest = state.lastSuggest ?? 0;
    } catch {
      // ignore
    }
  }

  const now = Date.now();
  if (now - lastSuggest < COOLDOWN_MS) {
    process.exit(0);
  }

  // Output suggestion
  const severity = percentage >= 80 ? "🔴" : "🟡";
  console.log(
    `\n${severity} Context at ${percentage}% — consider compressing context.\n` +
    `   Mode switch or /compact can help reduce context usage.\n`
  );

  writeFileSync(stateFile, JSON.stringify({ lastSuggest: now }));
}

main();
