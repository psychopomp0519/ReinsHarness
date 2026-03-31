/**
 * Reins Hook: Auto Checkpoint
 *
 * Event: PostToolUse (Write | Edit | MultiEdit)
 * Action: Track file changes. When N files have been modified,
 *         suggest a git commit checkpoint.
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const CHECKPOINT_THRESHOLD = parseInt(process.env.REINS_CHECKPOINT_THRESHOLD ?? "5", 10);

interface HookInput {
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_output: string;
  session_id?: string;
}

function getReinsDir(): string {
  const dir = join(process.cwd(), ".reins");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getChangedFilesCount(): number {
  try {
    const output = execSync("git diff --name-only HEAD 2>/dev/null || git diff --name-only", {
      encoding: "utf-8",
      timeout: 5000,
    }).trim();
    if (!output) return 0;
    return output.split("\n").length;
  } catch {
    return 0;
  }
}

function getUntrackedFilesCount(): number {
  try {
    const output = execSync("git ls-files --others --exclude-standard", {
      encoding: "utf-8",
      timeout: 5000,
    }).trim();
    if (!output) return 0;
    return output.split("\n").length;
  } catch {
    return 0;
  }
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
    return; // unreachable but satisfies TS
  }

  const tool = input.tool_name;
  if (!["Write", "Edit", "MultiEdit"].includes(tool)) {
    process.exit(0);
  }

  const changedCount = getChangedFilesCount() + getUntrackedFilesCount();

  if (changedCount >= CHECKPOINT_THRESHOLD) {
    // Track last suggestion time to avoid spamming
    const stateFile = join(getReinsDir(), "checkpoint-state.json");
    let lastSuggest = 0;

    if (existsSync(stateFile)) {
      try {
        const state = JSON.parse(readFileSync(stateFile, "utf-8"));
        lastSuggest = state.lastSuggest ?? 0;
      } catch {
        // ignore
      }
    }

    const now = Date.now();
    const cooldown = 5 * 60 * 1000; // 5 minutes

    if (now - lastSuggest > cooldown) {
      console.log(
        `\n⚡ Checkpoint suggestion: ${changedCount} files changed since last commit.\n` +
        `   Consider committing: git add -A && git commit -m "checkpoint"\n`
      );

      writeFileSync(stateFile, JSON.stringify({ lastSuggest: now }));
    }
  }
}

main();
