/**
 * Reins Hook: Security Guard
 *
 * Event: PreToolUse (Read)
 * Action: Block access to sensitive files (.env, .pem, .key, etc.)
 */

import { basename, resolve } from "path";

interface HookInput {
  tool_name: string;
  tool_input: {
    file_path?: string;
    command?: string;
    [key: string]: unknown;
  };
}

interface HookOutput {
  decision: "block" | "allow";
  reason?: string;
}

// Patterns that indicate sensitive files
const BLOCKED_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  { pattern: /\.env($|\.)/, description: "environment variables file" },
  { pattern: /\.pem$/, description: "PEM certificate/key" },
  { pattern: /\.key$/, description: "private key file" },
  { pattern: /\.p12$/, description: "PKCS#12 certificate" },
  { pattern: /\.pfx$/, description: "PFX certificate" },
  { pattern: /\.jks$/, description: "Java keystore" },
  { pattern: /id_rsa/, description: "SSH private key" },
  { pattern: /id_ed25519/, description: "SSH private key" },
  { pattern: /id_ecdsa/, description: "SSH private key" },
  { pattern: /\.ssh\//, description: "SSH directory" },
  { pattern: /credentials\.json$/, description: "credentials file" },
  { pattern: /secrets?\.(json|yaml|yml|toml)$/, description: "secrets file" },
  { pattern: /\.aws\//, description: "AWS credentials directory" },
  { pattern: /\.gcp\//, description: "GCP credentials directory" },
  { pattern: /token\.json$/, description: "token file" },
  { pattern: /\.npmrc$/, description: "npm config (may contain tokens)" },
  { pattern: /\.pypirc$/, description: "PyPI config (may contain tokens)" },
];

// Allowlist for files that match patterns but are safe
const ALLOWED_PATTERNS: RegExp[] = [
  /\.env\.example$/,
  /\.env\.template$/,
  /\.env\.sample$/,
  /\.env\.test$/,
];

function isBlocked(filePath: string): { blocked: boolean; reason: string } {
  const normalized = resolve(filePath);
  const name = basename(normalized);

  // Check allowlist first
  for (const allow of ALLOWED_PATTERNS) {
    if (allow.test(name) || allow.test(normalized)) {
      return { blocked: false, reason: "" };
    }
  }

  // Check blocklist
  for (const { pattern, description } of BLOCKED_PATTERNS) {
    if (pattern.test(name) || pattern.test(normalized)) {
      return {
        blocked: true,
        reason: `🔒 Access blocked: "${name}" is a ${description}. ` +
          `Reins security guard prevents reading sensitive files.`,
      };
    }
  }

  return { blocked: false, reason: "" };
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

  if (input.tool_name !== "Read") {
    process.exit(0);
  }

  const filePath = input.tool_input.file_path;
  if (!filePath || typeof filePath !== "string") {
    process.exit(0);
    return;
  }

  const result = isBlocked(filePath);

  if (result.blocked) {
    const output: HookOutput = {
      decision: "block",
      reason: result.reason,
    };
    // Output to stdout for Claude Code to read
    console.log(JSON.stringify(output));
    // Also print warning to stderr for visibility
    console.error(result.reason);
    process.exit(2);
  }
}

main();
