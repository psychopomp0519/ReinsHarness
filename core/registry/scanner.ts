/**
 * Reins Registry — Pack Scanner
 *
 * Scans packs/ and .reins/packs/ directories for installed packs.
 * Reads PACK.yaml to build a registry of available packs and their skills.
 */

import { readdirSync, readFileSync, existsSync, statSync } from "fs";
import { join } from "path";

export interface PackMeta {
  name: string;
  version: string;
  description: string;
  author?: string;
  skills: string[];
  agents: string[];
  modes?: string[];
  path: string;
}

/**
 * Scan for installed packs in the given directories.
 */
export function scanPacks(reinsHome: string, projectRoot?: string): PackMeta[] {
  const packs: PackMeta[] = [];

  // Scan built-in packs
  const builtinDir = join(reinsHome, "packs");
  if (existsSync(builtinDir)) {
    packs.push(...scanDirectory(builtinDir));
  }

  // Scan project-local packs
  if (projectRoot) {
    const localDir = join(projectRoot, ".reins", "packs");
    if (existsSync(localDir)) {
      packs.push(...scanDirectory(localDir));
    }
  }

  return packs;
}

function scanDirectory(dir: string): PackMeta[] {
  const packs: PackMeta[] = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const packDir = join(dir, entry);
      if (!statSync(packDir).isDirectory()) continue;

      const meta = readPackMeta(packDir, entry);
      if (meta) {
        packs.push(meta);
      }
    }
  } catch {
    // Directory not readable
  }

  return packs;
}

function readPackMeta(packDir: string, fallbackName: string): PackMeta | null {
  const yamlPath = join(packDir, "PACK.yaml");
  const ymlPath = join(packDir, "PACK.yml");
  const configPath = existsSync(yamlPath) ? yamlPath : existsSync(ymlPath) ? ymlPath : null;

  let name = fallbackName;
  let version = "0.0.0";
  let description = "";
  let author: string | undefined;

  if (configPath) {
    try {
      const content = readFileSync(configPath, "utf-8");
      // Simple YAML parsing for key fields (no external dependency)
      name = extractYamlField(content, "name") ?? fallbackName;
      version = extractYamlField(content, "version") ?? "0.0.0";
      description = extractYamlField(content, "description") ?? "";
      author = extractYamlField(content, "author") ?? undefined;
    } catch {
      // Use fallback values
    }
  }

  // Scan for skills
  const skills = scanSubdir(packDir, "skills");

  // Scan for agents
  const agents = scanSubdir(packDir, "agents");

  // Scan for custom modes
  const modes = scanSubdir(packDir, "modes");

  return {
    name,
    version,
    description,
    author,
    skills,
    agents,
    modes: modes.length > 0 ? modes : undefined,
    path: packDir,
  };
}

function scanSubdir(packDir: string, subdir: string): string[] {
  const dir = join(packDir, subdir);
  if (!existsSync(dir)) return [];

  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith(".md") || statSync(join(dir, f)).isDirectory())
      .map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

/**
 * Simple YAML field extractor (no external dependencies).
 * Only handles top-level scalar fields.
 */
function extractYamlField(content: string, field: string): string | null {
  const regex = new RegExp(`^${field}:\\s*["']?(.+?)["']?\\s*$`, "m");
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}
