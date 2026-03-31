/**
 * Reins Merge — Source Analyzer
 *
 * Analyzes external Claude Code plugins/harnesses to determine
 * structure, capabilities, and recommended merge level.
 */

import { readdirSync, readFileSync, existsSync, statSync } from "fs";
import { join, basename } from "path";

export type MergeLevel = "coexist" | "wrap" | "convert";

export interface SourceAnalysis {
  name: string;
  sourcePath: string;
  sourceType: "plugin" | "harness" | "skills-collection" | "unknown";
  hasClaudeMd: boolean;
  hasAgentsMd: boolean;
  skills: SkillInfo[];
  agents: AgentInfo[];
  hooks: string[];
  configFiles: string[];
  recommendedLevel: MergeLevel;
  recommendation: string;
  complexity: "low" | "medium" | "high";
}

export interface SkillInfo {
  name: string;
  path: string;
  hasDescription: boolean;
  hasFrontmatter: boolean;
}

export interface AgentInfo {
  name: string;
  path: string;
}

/**
 * Analyze an external source directory.
 */
export function analyzeSource(sourcePath: string): SourceAnalysis {
  if (!existsSync(sourcePath)) {
    throw new Error(`Source path not found: ${sourcePath}`);
  }

  const name = basename(sourcePath);

  const hasClaudeMd = existsSync(join(sourcePath, "CLAUDE.md"));
  const hasAgentsMd = existsSync(join(sourcePath, "AGENTS.md"));
  const skills = findSkills(sourcePath);
  const agents = findAgents(sourcePath);
  const hooks = findHooks(sourcePath);
  const configFiles = findConfigFiles(sourcePath);

  const sourceType = detectSourceType(sourcePath, hasClaudeMd, skills, hooks);
  const complexity = assessComplexity(skills, agents, hooks);
  const recommendedLevel = recommendMergeLevel(sourceType, complexity, skills);

  const recommendation = generateRecommendation(
    recommendedLevel,
    sourceType,
    skills.length,
    agents.length,
    hooks.length,
  );

  return {
    name,
    sourcePath,
    sourceType,
    hasClaudeMd,
    hasAgentsMd,
    skills,
    agents,
    hooks,
    configFiles,
    recommendedLevel,
    recommendation,
    complexity,
  };
}

function findSkills(root: string): SkillInfo[] {
  const skills: SkillInfo[] = [];
  const searchDirs = ["skills", ".claude/skills", "commands"];

  for (const dir of searchDirs) {
    const fullDir = join(root, dir);
    if (!existsSync(fullDir)) continue;

    try {
      const entries = readdirSync(fullDir);
      for (const entry of entries) {
        const entryPath = join(fullDir, entry);

        // Directory with SKILL.md
        if (statSync(entryPath).isDirectory()) {
          const skillMd = join(entryPath, "SKILL.md");
          if (existsSync(skillMd)) {
            const content = readFileSync(skillMd, "utf-8");
            skills.push({
              name: entry,
              path: skillMd,
              hasDescription: /^description:/m.test(content),
              hasFrontmatter: content.startsWith("---"),
            });
          }
        }

        // Flat .md file
        if (entry.endsWith(".md") && statSync(entryPath).isFile()) {
          const content = readFileSync(entryPath, "utf-8");
          skills.push({
            name: entry.replace(/\.md$/, ""),
            path: entryPath,
            hasDescription: /^description:/m.test(content),
            hasFrontmatter: content.startsWith("---"),
          });
        }
      }
    } catch {
      // skip
    }
  }

  return skills;
}

function findAgents(root: string): AgentInfo[] {
  const agents: AgentInfo[] = [];
  const searchDirs = ["agents", ".claude/agents"];

  for (const dir of searchDirs) {
    const fullDir = join(root, dir);
    if (!existsSync(fullDir)) continue;

    try {
      const entries = readdirSync(fullDir);
      for (const entry of entries) {
        if (entry.endsWith(".md")) {
          agents.push({
            name: entry.replace(/\.md$/, ""),
            path: join(fullDir, entry),
          });
        }
      }
    } catch {
      // skip
    }
  }

  return agents;
}

function findHooks(root: string): string[] {
  const hooks: string[] = [];
  const searchDirs = ["hooks", ".claude/hooks"];

  for (const dir of searchDirs) {
    const fullDir = join(root, dir);
    if (!existsSync(fullDir)) continue;

    try {
      const entries = readdirSync(fullDir);
      for (const entry of entries) {
        if (/\.(ts|js)$/.test(entry) && !entry.endsWith(".d.ts")) {
          hooks.push(entry);
        }
      }
    } catch {
      // skip
    }
  }

  return hooks;
}

function findConfigFiles(root: string): string[] {
  const configs: string[] = [];
  const candidates = [
    "settings.json",
    ".claude/settings.json",
    "plugin.json",
    ".claude-plugin/plugin.json",
    "package.json",
  ];

  for (const file of candidates) {
    if (existsSync(join(root, file))) {
      configs.push(file);
    }
  }

  return configs;
}

function detectSourceType(
  root: string,
  hasClaudeMd: boolean,
  skills: SkillInfo[],
  hooks: string[],
): SourceAnalysis["sourceType"] {
  if (existsSync(join(root, ".claude-plugin", "plugin.json"))) {
    return "plugin";
  }
  if (hasClaudeMd && (skills.length > 0 || hooks.length > 0)) {
    return "harness";
  }
  if (skills.length > 0) {
    return "skills-collection";
  }
  return "unknown";
}

function assessComplexity(
  skills: SkillInfo[],
  agents: AgentInfo[],
  hooks: string[],
): "low" | "medium" | "high" {
  const total = skills.length + agents.length + hooks.length;
  if (total <= 3) return "low";
  if (total <= 10) return "medium";
  return "high";
}

function recommendMergeLevel(
  sourceType: SourceAnalysis["sourceType"],
  complexity: "low" | "medium" | "high",
  skills: SkillInfo[],
): MergeLevel {
  // Simple skills collections → wrap
  if (sourceType === "skills-collection" && complexity === "low") {
    return "wrap";
  }

  // Plugins with standard structure → coexist
  if (sourceType === "plugin") {
    return "coexist";
  }

  // Complex harnesses → coexist (too risky to convert)
  if (complexity === "high") {
    return "coexist";
  }

  // Skills with compatible frontmatter → wrap
  const compatibleSkills = skills.filter((s) => s.hasFrontmatter);
  if (compatibleSkills.length === skills.length && skills.length > 0) {
    return "wrap";
  }

  return "coexist";
}

function generateRecommendation(
  level: MergeLevel,
  sourceType: string,
  skillCount: number,
  agentCount: number,
  hookCount: number,
): string {
  const parts = [];
  parts.push(`Source type: ${sourceType}`);
  parts.push(`Found: ${skillCount} skills, ${agentCount} agents, ${hookCount} hooks`);

  switch (level) {
    case "coexist":
      parts.push("Recommendation: Install alongside Reins. Low risk, immediate availability.");
      break;
    case "wrap":
      parts.push("Recommendation: Wrap as a Reins pack. Moderate effort, unified command interface.");
      break;
    case "convert":
      parts.push("Recommendation: Convert to native Reins skills. High effort, best integration.");
      break;
  }

  return parts.join(" | ");
}
