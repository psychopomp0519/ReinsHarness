/**
 * Reins Registry — Auto Trigger
 *
 * Context-based automatic skill activation.
 * Analyzes user input and project state to suggest relevant skills/modes.
 */

export interface TriggerMatch {
  skillName: string;
  confidence: number; // 0-1
  reason: string;
}

interface TriggerRule {
  skillName: string;
  patterns: RegExp[];
  filePatterns?: RegExp[];
  description: string;
}

const TRIGGER_RULES: TriggerRule[] = [
  {
    skillName: "reins-plan-mode",
    patterns: [
      /plan/i, /계획/i, /설계/i, /프로젝트\s*시작/i,
      /break\s*down/i, /task\s*breakdown/i, /requirements/i,
    ],
    description: "Plan mode: user wants to plan or design",
  },
  {
    skillName: "reins-dev-mode",
    patterns: [
      /개발/i, /구현/i, /코딩/i, /implement/i,
      /build/i, /develop/i, /code/i, /만들어/i,
    ],
    description: "Dev mode: user wants to implement",
  },
  {
    skillName: "reins-review-mode",
    patterns: [
      /review/i, /검토/i, /리뷰/i, /확인/i,
      /check/i, /verify/i, /validate/i, /quality/i,
    ],
    description: "Review mode: user wants to verify quality",
  },
  {
    skillName: "reins-discuss-mode",
    patterns: [
      /discuss/i, /토의/i, /토론/i, /의견/i,
      /pros?\s*and\s*cons/i, /장단점/i, /관점/i,
    ],
    description: "Discuss mode: user wants multiple perspectives",
  },
  {
    skillName: "reins-cleanup-mode",
    patterns: [
      /clean\s*up/i, /정리/i, /리팩토링/i, /refactor/i,
      /entropy/i, /dead\s*code/i, /duplicate/i,
    ],
    description: "Cleanup mode: user wants to reduce entropy",
  },
  {
    skillName: "reins-retro-mode",
    patterns: [
      /retro/i, /회고/i, /돌아보/i, /retrospective/i,
      /성과/i, /분석/i, /performance/i,
    ],
    description: "Retro mode: user wants to analyze performance",
  },
  {
    skillName: "reins-convert-plan",
    patterns: [
      /convert.*plan/i, /변환.*계획/i, /PRD.*변환/i,
      /계획서.*변환/i, /import.*plan/i,
    ],
    filePatterns: [/\.md$/, /\.txt$/, /\.docx$/],
    description: "Convert plan: user has an external planning document",
  },
];

/**
 * Analyze user input and return matching triggers.
 * Returns matches sorted by confidence (highest first).
 */
export function findTriggers(userInput: string): TriggerMatch[] {
  const matches: TriggerMatch[] = [];

  for (const rule of TRIGGER_RULES) {
    let matchCount = 0;
    for (const pattern of rule.patterns) {
      if (pattern.test(userInput)) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      const confidence = Math.min(matchCount / rule.patterns.length + 0.3, 1.0);
      matches.push({
        skillName: rule.skillName,
        confidence,
        reason: rule.description,
      });
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}
