/**
 * Reins Hook: Security Auto-Trigger
 *
 * Event: PostToolUse (Edit | Write)
 * Action: Detect security-sensitive file modifications and suggest /security review.
 *         Fires once per file per session to avoid noise.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, basename, dirname } from "path";

interface HookInput {
  tool_name: string;
  tool_input: {
    file_path?: string;
    command?: string;
    [key: string]: unknown;
  };
  tool_output?: string;
  session_id?: string;
}

// Patterns that indicate security-sensitive files or directories
const SECURITY_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  { pattern: /\/auth\//, description: "authentication module" },
  { pattern: /\/payment\//, description: "payment module" },
  { pattern: /\/api\//, description: "API endpoint" },
  { pattern: /\.env($|\.)/, description: "environment config" },
  { pattern: /crypto/i, description: "cryptography-related file" },
  { pattern: /session/i, description: "session management file" },
  { pattern: /token/i, description: "token handling file" },
  { pattern: /password/i, description: "password handling file" },
  { pattern: /secret/i, description: "secrets-related file" },
];

function getReinsDir(): string {
  const dir = join(process.cwd(), ".reins");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

interface TriggerState {
  triggeredFiles: string[];
}

function loadState(): TriggerState {
  const stateFile = join(getReinsDir(), "security-trigger-state.json");
  if (existsSync(stateFile)) {
    try {
      return JSON.parse(readFileSync(stateFile, "utf-8")) as TriggerState;
    } catch {
      // corrupted state — reset
    }
  }
  return { triggeredFiles: [] };
}

function saveState(state: TriggerState): void {
  const stateFile = join(getReinsDir(), "security-trigger-state.json");
  writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

function matchesSensitivePattern(filePath: string): string | null {
  for (const { pattern, description } of SECURITY_PATTERNS) {
    if (pattern.test(filePath)) {
      return description;
    }
  }
  return null;
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

  // Only trigger on Edit or Write
  if (!["Edit", "Write"].includes(input.tool_name)) {
    process.exit(0);
  }

  const filePath = input.tool_input.file_path;
  if (!filePath || typeof filePath !== "string") {
    process.exit(0);
    return;
  }

  const description = matchesSensitivePattern(filePath);
  if (!description) {
    process.exit(0);
    return;
  }

  // Check if we already fired for this file in this session
  const state = loadState();
  if (state.triggeredFiles.includes(filePath)) {
    process.exit(0);
    return;
  }

  // Mark file as triggered and warn
  state.triggeredFiles.push(filePath);
  saveState(state);

  const fileName = basename(filePath);
  console.log(
    `\n🔐 Security-sensitive file modified: "${fileName}" (${description}).\n` +
    `   Consider running /security to review this change for vulnerabilities.\n`
  );
}

main();
