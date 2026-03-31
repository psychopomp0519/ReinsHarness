/**
 * Reins Merge — Native Converter
 *
 * Level 3 merge: converts external skills to native Reins format.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import type { SourceAnalysis, SkillInfo } from "./analyzer.js";

export interface ConvertResult {
  convertedSkills: ConvertedSkill[];
  totalConverted: number;
  totalFailed: number;
}

export interface ConvertedSkill {
  originalName: string;
  newName: string;
  path: string;
  changes: string[];
}

/**
 * Convert external skills to native Reins format.
 */
export function convertToNative(
  analysis: SourceAnalysis,
  targetRoot: string,
): ConvertResult {
  const converted: ConvertedSkill[] = [];
  let failed = 0;

  for (const skill of analysis.skills) {
    try {
      const result = convertSkill(skill, analysis.name, targetRoot);
      converted.push(result);
    } catch {
      failed++;
    }
  }

  return {
    convertedSkills: converted,
    totalConverted: converted.length,
    totalFailed: failed,
  };
}

function convertSkill(
  skill: SkillInfo,
  sourceName: string,
  targetRoot: string,
): ConvertedSkill {
  const content = readFileSync(skill.path, "utf-8");
  const changes: string[] = [];

  // Determine new name
  const newName = `reins-${sourceName}-${skill.name}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");

  // Extract or generate frontmatter
  let body = content;
  let existingFrontmatter: Record<string, string> = {};

  if (content.startsWith("---")) {
    const endIdx = content.indexOf("---", 3);
    if (endIdx > 0) {
      const fm = content.slice(3, endIdx).trim();
      body = content.slice(endIdx + 3).trim();

      // Simple key-value extraction
      for (const line of fm.split("\n")) {
        const match = line.match(/^(\w[\w-]*)\s*:\s*(.+)/);
        if (match) {
          existingFrontmatter[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
        }
      }
    }
  }

  // Build Reins-standard frontmatter
  const description = existingFrontmatter["description"]
    || `Converted skill from ${sourceName}. ${body.split("\n")[0]?.replace(/^#\s*/, "") || skill.name}`;

  if (!existingFrontmatter["name"]) {
    changes.push("Added name field");
  }
  if (existingFrontmatter["name"] !== newName) {
    changes.push(`Renamed: ${existingFrontmatter["name"] || skill.name} → ${newName}`);
  }
  if (!existingFrontmatter["description"]) {
    changes.push("Generated description from content");
  }
  if (!existingFrontmatter["version"]) {
    changes.push("Added version field");
  }

  const newContent = `---
name: ${newName}
description: >
  ${description.replace(/\n/g, "\n  ")}
version: "${existingFrontmatter["version"] || "1.0.0"}"
---

${body}
`;

  // Write to skills directory
  const skillDir = join(targetRoot, "skills", newName);
  mkdirSync(skillDir, { recursive: true });
  const skillPath = join(skillDir, "SKILL.md");
  writeFileSync(skillPath, newContent, "utf-8");

  return {
    originalName: skill.name,
    newName,
    path: skillPath,
    changes,
  };
}
