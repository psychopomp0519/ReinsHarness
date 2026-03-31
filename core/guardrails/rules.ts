/**
 * Reins Guardrails — Declarative rule definitions
 *
 * Pattern: claude-code-harness declarative rule table with
 * toolPattern regex matching + first-match-wins evaluation.
 * Ref: Chachamaru127/claude-code-harness/core/src/guardrails/rules.ts
 */

export type RuleDecision = "approve" | "deny" | "ask";
export type RuleSeverity = "error" | "warning" | "info";

export interface GuardrailRule {
  id: string;
  name: string;
  description: string;
  severity: RuleSeverity;
  toolPattern: RegExp;
  evaluate: (context: RuleContext) => HookResult | null;
}

export interface RuleContext {
  input: string;
  filePath?: string;
  content?: string;
  mode?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  projectRoot?: string;
}

export interface HookResult {
  decision: RuleDecision;
  message: string;
  details?: string;
}

/**
 * Built-in guardrail rules.
 * Evaluated sequentially — first match wins.
 */
export const BUILTIN_RULES: GuardrailRule[] = [
  // R01: Block sudo commands
  {
    id: "R01-no-sudo",
    name: "No Sudo",
    description: "Block sudo and su commands",
    severity: "error",
    toolPattern: /^Bash$/,
    evaluate: (ctx) => {
      if (!ctx.input) return null;
      if (/\bsudo\b|\bsu\s+-/.test(ctx.input)) {
        return { decision: "deny", message: "sudo/su commands are blocked" };
      }
      return null;
    },
  },

  // R02: Block force push
  {
    id: "R02-no-force-push",
    name: "No Force Push",
    description: "Block git push --force on protected branches",
    severity: "error",
    toolPattern: /^Bash$/,
    evaluate: (ctx) => {
      if (!ctx.input) return null;
      if (/git\s+push\s+.*--force/.test(ctx.input)) {
        return { decision: "deny", message: "Force push is blocked. Use --force-with-lease if needed." };
      }
      return null;
    },
  },

  // R03: Block git reset --hard on main/master
  {
    id: "R03-no-reset-hard",
    name: "No Reset Hard on Protected",
    description: "Block git reset --hard on main/master branches",
    severity: "error",
    toolPattern: /^Bash$/,
    evaluate: (ctx) => {
      if (!ctx.input) return null;
      if (/git\s+reset\s+--hard/.test(ctx.input)) {
        return { decision: "ask", message: "git reset --hard detected. Confirm this is intentional." };
      }
      return null;
    },
  },

  // R04: Warn on secret file reads
  {
    id: "R04-secret-file-read",
    name: "Secret File Read Warning",
    description: "Warn when reading files that may contain secrets",
    severity: "warning",
    toolPattern: /^Read$/,
    evaluate: (ctx) => {
      if (!ctx.filePath) return null;
      if (/\.(env|pem|key|p12|pfx)$|\.ssh\/|credentials\.json|secrets?\.(json|yaml)/.test(ctx.filePath)) {
        return { decision: "deny", message: `Blocked read of sensitive file: ${ctx.filePath}` };
      }
      return null;
    },
  },

  // R05: Ask confirmation for rm -rf
  {
    id: "R05-confirm-rm-rf",
    name: "Confirm rm -rf",
    description: "Ask confirmation before recursive forced deletion",
    severity: "error",
    toolPattern: /^Bash$/,
    evaluate: (ctx) => {
      if (!ctx.input) return null;
      if (/rm\s+(-rf|-fr)\s/.test(ctx.input)) {
        return { decision: "ask", message: "rm -rf detected. Confirm deletion target is correct." };
      }
      return null;
    },
  },

  // R06: Block --no-verify flag
  {
    id: "R06-no-skip-hooks",
    name: "No Skip Hooks",
    description: "Block git commit --no-verify to prevent hook bypass",
    severity: "warning",
    toolPattern: /^Bash$/,
    evaluate: (ctx) => {
      if (!ctx.input) return null;
      if (/--no-verify/.test(ctx.input)) {
        return { decision: "deny", message: "--no-verify is not allowed. Fix the hook issue instead." };
      }
      return null;
    },
  },

  // R07: Detect hardcoded secrets in written content
  {
    id: "R07-no-secrets-in-code",
    name: "No Secrets in Code",
    description: "Detect hardcoded secrets, API keys, and passwords in file writes",
    severity: "error",
    toolPattern: /^(Write|Edit|MultiEdit)$/,
    evaluate: (ctx) => {
      if (!ctx.content) return null;

      const patterns = [
        /(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}/gi,
        /(?:api_?key|apikey|secret_?key)\s*[:=]\s*["'][^"']{8,}/gi,
        /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g,
        /(?:AKIA|ASIA)[A-Z0-9]{16}/g,
      ];

      for (const pattern of patterns) {
        if (pattern.test(ctx.content)) {
          return {
            decision: "ask",
            message: `Potential secret detected in ${ctx.filePath || "content"}`,
            details: `Pattern: ${pattern.source}`,
          };
        }
      }
      return null;
    },
  },

  // R08: Warn on writes outside project root
  {
    id: "R08-no-out-of-project-write",
    name: "No Out-of-Project Writes",
    description: "Warn when writing files outside the project directory",
    severity: "warning",
    toolPattern: /^(Write|Edit)$/,
    evaluate: (ctx) => {
      if (!ctx.filePath || !ctx.projectRoot) return null;
      if (!ctx.filePath.startsWith(ctx.projectRoot)) {
        return {
          decision: "ask",
          message: `Writing outside project root: ${ctx.filePath}`,
        };
      }
      return null;
    },
  },

  // R09: Block bash redirect to protected paths
  {
    id: "R09-no-redirect-protected",
    name: "No Redirect to Protected Paths",
    description: "Block bash redirects to .env, .git/, .ssh/ and other protected paths",
    severity: "error",
    toolPattern: /^Bash$/,
    evaluate: (ctx) => {
      if (!ctx.input) return null;
      if (/>\s*\.env|tee\s+\.git\/|>\s*\.ssh\/|tee\s+\.ssh\/|>\s*\.git\//.test(ctx.input)) {
        return { decision: "deny", message: "Redirect to protected path (.env, .git/, .ssh/) is blocked" };
      }
      return null;
    },
  },

  // R10: Infrastructure file change warning
  {
    id: "R10-infra-file-warning",
    name: "Infrastructure File Change Warning",
    description: "Warn when modifying infrastructure files like package.json, Dockerfile, CI configs",
    severity: "warning",
    toolPattern: /^(Write|Edit)$/,
    evaluate: (ctx) => {
      if (!ctx.filePath) return null;
      if (/(?:^|\/)(package\.json|Dockerfile|docker-compose\.ya?ml|tsconfig\.json|\.eslintrc.*)$|\.github\/workflows\//.test(ctx.filePath)) {
        return {
          decision: "ask",
          message: "Modifying infrastructure file. Confirm this is intentional.",
        };
      }
      return null;
    },
  },

  // R11: Protected branch direct push warning
  {
    id: "R11-no-direct-push-protected",
    name: "Protected Branch Direct Push Warning",
    description: "Warn when pushing directly to main/master without a PR",
    severity: "warning",
    toolPattern: /^Bash$/,
    evaluate: (ctx) => {
      if (!ctx.input) return null;
      if (/git\s+push\s+origin\s+(main|master)(?:\s|$)/.test(ctx.input)) {
        return {
          decision: "ask",
          message: "Direct push to protected branch (main/master) detected. Consider using a PR instead.",
        };
      }
      return null;
    },
  },
];

/**
 * Evaluate rules against a context. First match wins.
 * Returns 'approve' if no rule matches.
 */
export function evaluateRules(
  context: RuleContext,
  rules: GuardrailRule[] = BUILTIN_RULES,
): HookResult {
  for (const rule of rules) {
    if (context.toolName && !rule.toolPattern.test(context.toolName)) {
      continue;
    }

    const result = rule.evaluate(context);
    if (result !== null) {
      return result;
    }
  }

  return { decision: "approve", message: "No rules triggered" };
}

// Legacy compat
export type RuleResult = HookResult;
export function checkRules(
  rules: GuardrailRule[],
  context: RuleContext,
): Map<string, HookResult> {
  const results = new Map<string, HookResult>();

  for (const rule of rules) {
    if (context.toolName && !rule.toolPattern.test(context.toolName)) {
      results.set(rule.id, { decision: "approve", message: "Tool pattern mismatch — skipped" });
      continue;
    }

    try {
      const result = rule.evaluate(context);
      results.set(rule.id, result ?? { decision: "approve", message: "No issue" });
    } catch (err) {
      results.set(rule.id, {
        decision: "deny",
        message: `Rule check failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  return results;
}
