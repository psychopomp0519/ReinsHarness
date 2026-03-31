/**
 * Reins Plan Converter — Analyzer
 *
 * Extracts structured elements from parsed documents.
 */

import type { ParsedDocument, Section } from "./parser.js";

export interface AnalyzedPlan {
  projectName: string;
  overview: string;
  requirements: Requirement[];
  techStack: string[];
  milestones: Milestone[];
  constraints: string[];
  risks: Risk[];
  references: string[];
}

export interface Requirement {
  description: string;
  type: "functional" | "non-functional";
  priority: "high" | "medium" | "low";
}

export interface Milestone {
  name: string;
  description: string;
  tasks: string[];
}

export interface Risk {
  description: string;
  source: "stated" | "inferred";
  impact: "high" | "medium" | "low";
}

/**
 * Analyze a parsed document to extract plan elements.
 */
export function analyzeDocument(doc: ParsedDocument): AnalyzedPlan {
  return {
    projectName: doc.title,
    overview: extractOverview(doc.sections),
    requirements: extractRequirements(doc.sections),
    techStack: extractTechStack(doc.sections, doc.rawText),
    milestones: extractMilestones(doc.sections),
    constraints: extractConstraints(doc.sections),
    risks: extractRisks(doc.sections, doc.rawText),
    references: extractReferences(doc.sections),
  };
}

function extractOverview(sections: Section[]): string {
  // Look for overview/summary/introduction section
  const overviewSection = sections.find((s) =>
    /overview|summary|introduction|개요|요약|소개/i.test(s.title),
  );

  if (overviewSection) {
    return overviewSection.content.trim().slice(0, 500);
  }

  // Fallback: first section's content
  return sections[0]?.content.trim().slice(0, 500) ?? "";
}

function extractRequirements(sections: Section[]): Requirement[] {
  const requirements: Requirement[] = [];

  const reqSections = sections.filter((s) =>
    /require|feature|기능|요구|스펙|spec/i.test(s.title),
  );

  for (const section of reqSections) {
    const isFunctional = /non.?func|비기능/i.test(section.title) ? false : true;

    for (const item of section.items) {
      requirements.push({
        description: item,
        type: isFunctional ? "functional" : "non-functional",
        priority: inferPriority(item),
      });
    }
  }

  // If no requirements section found, extract from all list items
  if (requirements.length === 0) {
    for (const section of sections) {
      for (const item of section.items.slice(0, 20)) {
        requirements.push({
          description: item,
          type: "functional",
          priority: "medium",
        });
      }
    }
  }

  return requirements;
}

function extractTechStack(sections: Section[], rawText: string): string[] {
  const techSection = sections.find((s) =>
    /tech|stack|기술|아키텍처|architecture/i.test(s.title),
  );

  if (techSection) {
    return techSection.items.length > 0
      ? techSection.items
      : techSection.content
          .split("\n")
          .filter((l) => l.trim())
          .slice(0, 10);
  }

  // Infer from content
  const techs: string[] = [];
  const techPatterns: Record<string, RegExp> = {
    "React": /react/i,
    "Next.js": /next\.?js/i,
    "TypeScript": /typescript/i,
    "Python": /python/i,
    "Node.js": /node\.?js/i,
    "PostgreSQL": /postgres/i,
    "MongoDB": /mongo/i,
    "Docker": /docker/i,
    "AWS": /\baws\b/i,
  };

  for (const [name, pattern] of Object.entries(techPatterns)) {
    if (pattern.test(rawText)) {
      techs.push(name);
    }
  }

  return techs;
}

function extractMilestones(sections: Section[]): Milestone[] {
  const milestones: Milestone[] = [];

  // Look for phase/milestone/sprint sections
  const phaseSections = sections.filter((s) =>
    /phase|milestone|sprint|단계|마일스톤|스프린트/i.test(s.title),
  );

  if (phaseSections.length > 0) {
    for (const section of phaseSections) {
      milestones.push({
        name: section.title,
        description: section.content.trim().slice(0, 200),
        tasks: section.items,
      });
    }
  } else {
    // Create milestones from top-level sections
    const topSections = sections.filter(
      (s) => s.level === 2 && s.items.length > 0,
    );
    for (const section of topSections) {
      milestones.push({
        name: section.title,
        description: section.content.trim().slice(0, 200),
        tasks: section.items,
      });
    }
  }

  return milestones;
}

function extractConstraints(sections: Section[]): string[] {
  const constraintSection = sections.find((s) =>
    /constraint|limitation|제약|제한/i.test(s.title),
  );

  return constraintSection?.items ?? [];
}

function extractRisks(sections: Section[], rawText: string): Risk[] {
  const risks: Risk[] = [];

  // Stated risks
  const riskSection = sections.find((s) =>
    /risk|리스크|위험/i.test(s.title),
  );

  if (riskSection) {
    for (const item of riskSection.items) {
      risks.push({
        description: item,
        source: "stated",
        impact: inferPriority(item) as "high" | "medium" | "low",
      });
    }
  }

  // Inferred risks
  if (/external\s*api|외부\s*api/i.test(rawText)) {
    risks.push({
      description: "External API dependency — rate limiting, downtime risk",
      source: "inferred",
      impact: "medium",
    });
  }

  if (/database\s*migration|마이그레이션/i.test(rawText)) {
    risks.push({
      description: "Database migration — data loss risk during schema changes",
      source: "inferred",
      impact: "high",
    });
  }

  return risks;
}

function extractReferences(sections: Section[]): string[] {
  const refSection = sections.find((s) =>
    /reference|참고|참조|link/i.test(s.title),
  );

  return refSection?.items ?? [];
}

function inferPriority(text: string): "high" | "medium" | "low" {
  if (/critical|must|필수|반드시|중요/i.test(text)) return "high";
  if (/optional|선택|nice.to.have/i.test(text)) return "low";
  return "medium";
}
