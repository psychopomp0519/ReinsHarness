/**
 * Reins Guardrails — Validator Engine
 *
 * Runs guardrail rules and produces validation reports.
 */

import {
  BUILTIN_RULES,
  checkRules,
  type GuardrailRule,
  type RuleContext,
  type RuleResult,
  type RuleSeverity,
} from "./rules.js";

export interface ValidationReport {
  timestamp: string;
  context: Partial<RuleContext>;
  results: ValidationEntry[];
  summary: {
    total: number;
    passed: number;
    errors: number;
    warnings: number;
    infos: number;
  };
}

export interface ValidationEntry {
  ruleId: string;
  ruleName: string;
  severity: RuleSeverity;
  result: RuleResult;
}

/**
 * Validate a context against all rules.
 */
export function validate(
  context: RuleContext,
  customRules?: GuardrailRule[],
): ValidationReport {
  const allRules = [...BUILTIN_RULES, ...(customRules || [])];
  const ruleMap = new Map(allRules.map((r) => [r.id, r]));
  const results = checkRules(allRules, context);

  const entries: ValidationEntry[] = [];
  let passed = 0;
  let errors = 0;
  let warnings = 0;
  let infos = 0;

  for (const [ruleId, result] of results) {
    const rule = ruleMap.get(ruleId)!;
    entries.push({
      ruleId,
      ruleName: rule.name,
      severity: rule.severity,
      result,
    });

    if (result.passed) {
      passed++;
    } else {
      switch (rule.severity) {
        case "error": errors++; break;
        case "warning": warnings++; break;
        case "info": infos++; break;
      }
    }
  }

  return {
    timestamp: new Date().toISOString(),
    context: { filePath: context.filePath, mode: context.mode },
    results: entries,
    summary: {
      total: entries.length,
      passed,
      errors,
      warnings,
      infos,
    },
  };
}
