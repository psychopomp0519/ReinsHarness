/**
 * Reins Merge — Wrapping Adapter
 *
 * Level 2 merge: wraps external skills as a Reins pack.
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "fs";
import { join, basename } from "path";
import type { SourceAnalysis } from "./analyzer.js";

export interface WrapResult {
  packName: string;
  packPath: string;
  wrappedSkills: number;
  wrappedAgents: number;
}

/**
 * Wrap an analyzed source as a Reins pack.
 */
export function wrapAsPack(
  analysis: SourceAnalysis,
  targetRoot: string,
): WrapResult {
  const packName = sanitizeName(analysis.name);
  const packPath = join(targetRoot, ".reins", "packs", packName);

  // Create pack structure
  mkdirSync(join(packPath, "skills"), { recursive: true });
  mkdirSync(join(packPath, "agents"), { recursive: true });

  // Generate PACK.yaml
  const packYaml = generatePackYaml(packName, analysis);
  writeFileSync(join(packPath, "PACK.yaml"), packYaml, "utf-8");

  // Copy and adapt skills
  let wrappedSkills = 0;
  for (const skill of analysis.skills) {
    try {
      const content = readFileSync(skill.path, "utf-8");
      const adapted = adaptSkillFrontmatter(content, skill.name, packName);
      const targetDir = join(packPath, "skills", skill.name);
      mkdirSync(targetDir, { recursive: true });
      writeFileSync(join(targetDir, "SKILL.md"), adapted, "utf-8");
      wrappedSkills++;
    } catch {
      // skip failed skills
    }
  }

  // Copy agents
  let wrappedAgents = 0;
  for (const agent of analysis.agents) {
    try {
      copyFileSync(agent.path, join(packPath, "agents", `${agent.name}.md`));
      wrappedAgents++;
    } catch {
      // skip
    }
  }

  return { packName, packPath, wrappedSkills, wrappedAgents };
}

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function generatePackYaml(packName: string, analysis: SourceAnalysis): string {
  const skills = analysis.skills.map((s) => `  - ${s.name}`).join("\n");
  const agents = analysis.agents.map((a) => `  - ${a.name}`).join("\n");

  return `name: ${packName}
version: "1.0.0"
description: "Wrapped from external source: ${analysis.name}"
author: "Merged via Reins"
keywords: [merged, external]
source:
  type: ${analysis.sourceType}
  path: ${analysis.sourcePath}
  merge_level: wrap
  merged_at: ${new Date().toISOString()}
skills:
${skills || "  []"}
agents:
${agents || "  []"}
`;
}

function adaptSkillFrontmatter(
  content: string,
  skillName: string,
  packName: string,
): string {
  // If already has frontmatter, preserve it but add pack prefix
  if (content.startsWith("---")) {
    return content.replace(
      /^(---\n)/,
      `---\n# Wrapped by Reins from pack: ${packName}\n`,
    );
  }

  // Add frontmatter if missing
  const frontmatter = `---
name: ${packName}-${skillName}
description: >
  Wrapped skill from ${packName}. ${content.split("\n")[0]?.replace(/^#\s*/, "") || skillName}.
version: "1.0.0"
---

`;
  return frontmatter + content;
}
