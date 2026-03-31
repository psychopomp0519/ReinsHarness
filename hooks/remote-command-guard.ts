/**
 * Reins Hook: Remote Command Guard
 * Event: PreToolUse (Bash)
 * Blocks dangerous commands in sessions: env leakage, destructive deletion,
 * permission changes, external network communication
 * Ref: sangrokjung/claude-forge hooks/remote-command-guard.sh
 */

interface HookInput {
  tool_name: string;
  tool_input: {
    command?: string;
    [key: string]: unknown;
  };
}

interface HookOutput {
  decision: "block" | "allow";
  reason?: string;
}

interface BlockedCategory {
  name: string;
  patterns: RegExp[];
}

const BLOCKED_CATEGORIES: BlockedCategory[] = [
  {
    name: "Environment leakage",
    patterns: [
      /\benv\b(?!\s*=)/,
      /\bprintenv\b/,
      /\becho\s+\$SECRET\b/,
      /\becho\s+\$API_KEY\b/,
      /\becho\s+\$TOKEN\b/,
      /\becho\s+\$PASSWORD\b/,
    ],
  },
  {
    name: "Permission changes",
    patterns: [
      /\bchmod\s+777\b/,
      /\bchown\b/,
    ],
  },
  {
    name: "Process killing",
    patterns: [
      /\bkill\s+-9\b/,
      /\bkillall\b/,
      /\bshutdown\b/,
      /\breboot\b/,
    ],
  },
];

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

  if (input.tool_name !== "Bash") {
    process.exit(0);
  }

  const command = input.tool_input.command;
  if (!command || typeof command !== "string") {
    process.exit(0);
    return;
  }

  for (const category of BLOCKED_CATEGORIES) {
    for (const pattern of category.patterns) {
      if (pattern.test(command)) {
        const output: HookOutput = {
          decision: "block",
          reason: `Remote Command Guard: ${category.name} — blocked pattern "${pattern.source}" detected.`,
        };
        console.log(JSON.stringify(output));
        console.error(
          `\u26A0\uFE0F  Remote Command Guard: Blocked — ${category.name}. ` +
          `Command matched pattern: ${pattern.source}`
        );
        process.exit(2);
      }
    }
  }
}

main();
