/**
 * Reins Hook: DB Guard
 * Event: PreToolUse (Bash)
 * Blocks dangerous SQL operations: DROP, TRUNCATE, DELETE without WHERE
 * Ref: sangrokjung/claude-forge hooks/db-guard.sh
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

interface DangerousPattern {
  pattern: RegExp;
  description: string;
}

const DANGEROUS_PATTERNS: DangerousPattern[] = [
  {
    pattern: /\bDROP\s+(TABLE|DATABASE|SCHEMA)\b/i,
    description: "DROP TABLE/DATABASE/SCHEMA",
  },
  {
    pattern: /\bTRUNCATE\b/i,
    description: "TRUNCATE",
  },
  {
    pattern: /\bALTER\s+TABLE\s+\S+\s+DROP\b/i,
    description: "ALTER TABLE DROP",
  },
];

/**
 * Check for DELETE without WHERE clause.
 * Matches DELETE FROM ... that does not contain a WHERE keyword.
 */
function hasDeleteWithoutWhere(input: string): boolean {
  const deleteMatch = /\bDELETE\s+FROM\s+\S+/i.exec(input);
  if (!deleteMatch) return false;

  // Get the rest of the statement after DELETE FROM <table>
  const afterDelete = input.slice(deleteMatch.index + deleteMatch[0].length);
  // Check if WHERE appears before the next semicolon or end of string
  const nextSemicolon = afterDelete.indexOf(";");
  const segment = nextSemicolon >= 0 ? afterDelete.slice(0, nextSemicolon) : afterDelete;

  return !/\bWHERE\b/i.test(segment);
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

  if (input.tool_name !== "Bash") {
    process.exit(0);
  }

  const command = input.tool_input.command;
  if (!command || typeof command !== "string") {
    process.exit(0);
    return;
  }

  // Check each dangerous pattern
  for (const { pattern, description } of DANGEROUS_PATTERNS) {
    if (pattern.test(command)) {
      const output: HookOutput = {
        decision: "block",
        reason: `DB Guard: ${description} detected. This operation is blocked for safety.`,
      };
      console.log(JSON.stringify(output));
      console.error(`\u26A0\uFE0F  DB Guard: Blocked dangerous SQL operation — ${description}`);
      process.exit(2);
    }
  }

  // Check DELETE without WHERE
  if (hasDeleteWithoutWhere(command)) {
    const output: HookOutput = {
      decision: "block",
      reason: "DB Guard: DELETE without WHERE clause detected. This operation is blocked for safety.",
    };
    console.log(JSON.stringify(output));
    console.error("\u26A0\uFE0F  DB Guard: Blocked DELETE without WHERE clause");
    process.exit(2);
  }
}

main();
