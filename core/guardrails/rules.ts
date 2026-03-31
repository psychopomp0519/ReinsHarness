/**
 * Reins Guardrails — Declarative rule definitions
 *
 * Rules that can be checked programmatically against code/behavior.
 */

export type RuleSeverity = "error" | "warning" | "info";

export interface GuardrailRule {
  id: string;
  name: string;
  description: string;
  severity: RuleSeverity;
  check: (context: RuleContext) => RuleResult;
}

export interface RuleContext {
  filePath?: string;
  content?: string;
  mode?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
}

export interface RuleResult {
  passed: boolean;
  message: string;
  details?: string;
}

/**
 * Built-in guardrail rules.
 */
export const BUILTIN_RULES: GuardrailRule[] = [
  {
    id: "no-secrets-in-code",
    name: "No Secrets in Code",
    description: "Detect hardcoded secrets, API keys, and passwords",
    severity: "error",
    check: (ctx) => {
      if (!ctx.content) return { passed: true, message: "No content to check" };

      const patterns = [
        /(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}/gi,
        /(?:api_?key|apikey|secret_?key)\s*[:=]\s*["'][^"']{8,}/gi,
        /(?:token)\s*[:=]\s*["'][A-Za-z0-9_\-.]{20,}/gi,
        /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g,
        /(?:AKIA|ASIA)[A-Z0-9]{16}/g, // AWS access key
      ];

      for (const pattern of patterns) {
        if (pattern.test(ctx.content)) {
          return {
            passed: false,
            message: `Potential secret detected in ${ctx.filePath || "content"}`,
            details: `Pattern matched: ${pattern.source}`,
          };
        }
      }

      return { passed: true, message: "No secrets detected" };
    },
  },
  {
    id: "no-console-in-prod",
    name: "No Console Logs in Production",
    description: "Warn about console.log statements in non-test files",
    severity: "warning",
    check: (ctx) => {
      if (!ctx.content || !ctx.filePath) return { passed: true, message: "N/A" };
      if (/\.(test|spec|mock)\./i.test(ctx.filePath)) {
        return { passed: true, message: "Test file — console allowed" };
      }

      const consoleCount = (ctx.content.match(/console\.(log|debug|info)\(/g) || []).length;
      if (consoleCount > 0) {
        return {
          passed: false,
          message: `${consoleCount} console.log statement(s) found`,
        };
      }

      return { passed: true, message: "No console logs" };
    },
  },
  {
    id: "mode-required",
    name: "Mode Required",
    description: "All work should happen within a mode",
    severity: "info",
    check: (ctx) => {
      if (!ctx.mode || ctx.mode === "none") {
        return {
          passed: false,
          message: "No active mode. Use /mode <name> to activate.",
        };
      }
      return { passed: true, message: `Active mode: ${ctx.mode}` };
    },
  },
];

/**
 * Run all rules against a context.
 */
export function checkRules(
  rules: GuardrailRule[],
  context: RuleContext,
): Map<string, RuleResult> {
  const results = new Map<string, RuleResult>();

  for (const rule of rules) {
    try {
      results.set(rule.id, rule.check(context));
    } catch (err) {
      results.set(rule.id, {
        passed: false,
        message: `Rule check failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  return results;
}
