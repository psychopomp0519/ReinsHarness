/**
 * Reins Hook: Output Secret Filter
 *
 * Event: PostToolUse
 * Action: Scan tool output for potential secrets (API keys, tokens, passwords).
 *         Warns but does not block.
 */

interface HookInput {
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_output?: string;
  session_id?: string;
}

// Patterns that indicate potential secrets in output
const SECRET_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  {
    pattern: /AKIA[0-9A-Z]{16}/,
    description: "AWS Access Key ID",
  },
  {
    pattern: /Bearer\s+[A-Za-z0-9\-._~+\/]+=*/,
    description: "Bearer token",
  },
  {
    pattern: /password\s*[=:]\s*\S+/i,
    description: "password value",
  },
  {
    pattern: /api[_-]?key\s*[=:]\s*\S+/i,
    description: "API key value",
  },
  {
    pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/,
    description: "private key block",
  },
  {
    pattern: /-----BEGIN\s+EC\s+PRIVATE\s+KEY-----/,
    description: "EC private key block",
  },
  {
    pattern: /secret[_-]?key\s*[=:]\s*\S+/i,
    description: "secret key value",
  },
  {
    pattern: /ghp_[A-Za-z0-9]{36}/,
    description: "GitHub personal access token",
  },
  {
    pattern: /sk-[A-Za-z0-9]{20,}/,
    description: "OpenAI / Stripe secret key",
  },
  {
    pattern: /xox[bprs]-[A-Za-z0-9\-]+/,
    description: "Slack token",
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

  const output = input.tool_output;
  if (!output || typeof output !== "string") {
    process.exit(0);
    return;
  }

  const findings: string[] = [];

  for (const { pattern, description } of SECRET_PATTERNS) {
    if (pattern.test(output)) {
      findings.push(description);
    }
  }

  if (findings.length > 0) {
    const uniqueFindings = [...new Set(findings)];
    console.log(
      `\n⚠️  Potential secrets detected in tool output!\n` +
      `   Found: ${uniqueFindings.join(", ")}\n` +
      `   Review the output carefully — secrets may have been exposed.\n` +
      `   Consider rotating any credentials that were displayed.\n`
    );
  }
}

main();
