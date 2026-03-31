/**
 * Reins Registry — Resource Resolver
 *
 * Resolves skill/agent/mode names to their actual file paths.
 */

import { existsSync } from "fs";
import { join } from "path";
import type { PackMeta } from "./scanner.js";

export interface ResolvedResource {
  type: "skill" | "agent" | "mode";
  name: string;
  path: string;
  pack?: string;
}

/**
 * Resolve a resource name to its file path.
 * Search order: built-in skills → pack skills → project-local
 */
export function resolveResource(
  name: string,
  reinsHome: string,
  packs: PackMeta[],
): ResolvedResource | null {
  // 1. Check built-in skills
  const builtinSkill = join(reinsHome, "skills", name, "SKILL.md");
  if (existsSync(builtinSkill)) {
    return { type: "skill", name, path: builtinSkill };
  }

  // 2. Check built-in agents
  const builtinAgent = join(reinsHome, "agents", `${name}.md`);
  if (existsSync(builtinAgent)) {
    return { type: "agent", name, path: builtinAgent };
  }

  // 3. Check pack skills and agents
  for (const pack of packs) {
    const packSkill = join(pack.path, "skills", name, "SKILL.md");
    if (existsSync(packSkill)) {
      return { type: "skill", name, path: packSkill, pack: pack.name };
    }

    const packSkillFlat = join(pack.path, "skills", `${name}.md`);
    if (existsSync(packSkillFlat)) {
      return { type: "skill", name, path: packSkillFlat, pack: pack.name };
    }

    const packAgent = join(pack.path, "agents", `${name}.md`);
    if (existsSync(packAgent)) {
      return { type: "agent", name, path: packAgent, pack: pack.name };
    }
  }

  return null;
}

/**
 * List all available resources across built-in and packs.
 */
export function listResources(
  reinsHome: string,
  packs: PackMeta[],
): ResolvedResource[] {
  const resources: ResolvedResource[] = [];

  // Built-in skills (directories in skills/)
  const { readdirSync, statSync } = require("fs");
  const skillsDir = join(reinsHome, "skills");
  if (existsSync(skillsDir)) {
    try {
      for (const entry of readdirSync(skillsDir) as string[]) {
        const skillPath = join(skillsDir, entry, "SKILL.md");
        if (existsSync(skillPath)) {
          resources.push({ type: "skill", name: entry, path: skillPath });
        }
      }
    } catch {
      // ignore
    }
  }

  // Pack resources
  for (const pack of packs) {
    for (const skill of pack.skills) {
      resources.push({
        type: "skill",
        name: skill,
        path: join(pack.path, "skills", skill),
        pack: pack.name,
      });
    }
    for (const agent of pack.agents) {
      resources.push({
        type: "agent",
        name: agent,
        path: join(pack.path, "agents", `${agent}.md`),
        pack: pack.name,
      });
    }
  }

  return resources;
}
