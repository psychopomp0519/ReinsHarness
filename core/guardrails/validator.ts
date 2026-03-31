/**
 * Reins Guardrails — Validator Engine
 *
 * Runs guardrail rules and produces validation reports.
 * Uses first-match-wins evaluation from claude-code-harness pattern.
 */

import {
  BUILTIN_RULES,
  evaluateRules,
  checkRules,
  type GuardrailRule,
  type RuleContext,
  type HookResult,
  type RuleDecision,
  type RuleSeverity,
} from "./rules.js";

export interface ValidationReport {
  timestamp: string;
  context: Partial<RuleContext>;
  decision: RuleDecision;
  results: ValidationEntry[];
  summary: {
    total: number;
    approved: number;
    denied: number;
    asked: number;
  };
}

export interface ValidationEntry {
  ruleId: string;
  ruleName: string;
  severity: RuleSeverity;
  result: HookResult;
}

/**
 * Quick check — first-match-wins, returns single decision.
 */
export function quickCheck(
  context: RuleContext,
  customRules?: GuardrailRule[],
): HookResult {
  const allRules = [...BUILTIN_RULES, ...(customRules || [])];
  return evaluateRules(context, allRules);
}

/**
 * Full validation — runs all rules and produces a report.
 */
export function validate(
  context: RuleContext,
  customRules?: GuardrailRule[],
): ValidationReport {
  const allRules = [...BUILTIN_RULES, ...(customRules || [])];
  const ruleMap = new Map(allRules.map((r) => [r.id, r]));
  const results = checkRules(allRules, context);

  const entries: ValidationEntry[] = [];
  let approved = 0;
  let denied = 0;
  let asked = 0;

  for (const [ruleId, result] of results) {
    const rule = ruleMap.get(ruleId)!;
    entries.push({
      ruleId,
      ruleName: rule.name,
      severity: rule.severity,
      result,
    });

    switch (result.decision) {
      case "approve": approved++; break;
      case "deny": denied++; break;
      case "ask": asked++; break;
    }
  }

  // Overall decision: deny > ask > approve
  let decision: RuleDecision = "approve";
  if (denied > 0) decision = "deny";
  else if (asked > 0) decision = "ask";

  return {
    timestamp: new Date().toISOString(),
    context: { filePath: context.filePath, mode: context.mode, toolName: context.toolName },
    decision,
    results: entries,
    summary: {
      total: entries.length,
      approved,
      denied,
      asked,
    },
  };
}
