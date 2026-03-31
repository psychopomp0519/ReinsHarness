/**
 * Reins Custom Mode YAML Engine
 *
 * Loads and parses custom mode definitions from .reins/modes/*.yaml files.
 * Includes a simple built-in YAML parser so no external dependencies are needed.
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { join, extname, basename } from "path";

/** A single step in a custom mode workflow */
export interface WorkflowStep {
  name: string;
  description: string;
  agent?: string;
  action?: string;
}

/** Trigger that can activate a mode automatically */
export interface ModeTrigger {
  event: string;
  condition?: string;
}

/** Agent configuration within a custom mode */
export interface AgentConfig {
  name: string;
  role: string;
  systemPrompt?: string;
}

/** Full definition of a custom mode loaded from YAML */
export interface CustomModeDefinition {
  name: string;
  description: string;
  workflow: WorkflowStep[];
  agents: AgentConfig[];
  triggers: ModeTrigger[];
  allowedTools: string[];
}

/** Result of loading a custom mode */
export interface CustomModeLoadResult {
  success: boolean;
  mode?: CustomModeDefinition;
  error?: string;
  filePath: string;
}

const MODES_DIR = ".reins/modes";

/**
 * Simple YAML parser for mode definitions.
 * Handles scalar values, lists, and one level of nested maps.
 * This is intentionally minimal — no external dependencies required.
 *
 * @param yamlText - Raw YAML string
 * @returns Parsed object
 */
export function parseCustomModeYaml(yamlText: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yamlText.split("\n");

  let currentKey = "";
  let currentList: unknown[] | null = null;
  let currentMap: Record<string, string> | null = null;
  let listOfMaps: Record<string, string>[] | null = null;
  let currentMapInList: Record<string, string> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];

    // Skip empty lines and comments
    if (raw.trim() === "" || raw.trim().startsWith("#")) {
      continue;
    }

    const indent = raw.length - raw.trimStart().length;
    const trimmed = raw.trim();

    // Top-level key (no indent)
    if (indent === 0 && trimmed.includes(":")) {
      // Flush previous state
      if (currentKey) {
        if (listOfMaps && listOfMaps.length > 0) {
          if (currentMapInList) {
            listOfMaps.push(currentMapInList);
            currentMapInList = null;
          }
          result[currentKey] = listOfMaps;
          listOfMaps = null;
        } else if (currentList) {
          result[currentKey] = currentList;
          currentList = null;
        } else if (currentMap) {
          result[currentKey] = currentMap;
          currentMap = null;
        }
      }

      const colonIdx = trimmed.indexOf(":");
      currentKey = trimmed.substring(0, colonIdx).trim();
      const value = trimmed.substring(colonIdx + 1).trim();

      if (value) {
        // Inline value — strip quotes
        result[currentKey] = stripQuotes(value);
        currentKey = "";
      }
      continue;
    }

    if (!currentKey) continue;

    // List item starting with "- "
    if (trimmed.startsWith("- ")) {
      const itemContent = trimmed.substring(2).trim();

      // Check if it's "- key: value" (start of a map in a list)
      if (itemContent.includes(":")) {
        if (!listOfMaps) {
          listOfMaps = [];
        }
        // Flush previous map-in-list
        if (currentMapInList) {
          listOfMaps.push(currentMapInList);
        }
        currentMapInList = {};
        const cIdx = itemContent.indexOf(":");
        const k = itemContent.substring(0, cIdx).trim();
        const v = itemContent.substring(cIdx + 1).trim();
        currentMapInList[k] = stripQuotes(v);
      } else {
        // Simple list item
        if (!currentList) {
          currentList = [];
        }
        currentList.push(stripQuotes(itemContent));
      }
      continue;
    }

    // Continuation of a map-in-list (indented key: value under a "- " item)
    if (currentMapInList && indent >= 4 && trimmed.includes(":")) {
      const cIdx = trimmed.indexOf(":");
      const k = trimmed.substring(0, cIdx).trim();
      const v = trimmed.substring(cIdx + 1).trim();
      currentMapInList[k] = stripQuotes(v);
      continue;
    }

    // Nested key: value under a top-level key (simple map)
    if (indent >= 2 && trimmed.includes(":") && !trimmed.startsWith("- ")) {
      if (!currentMap && !listOfMaps) {
        currentMap = {};
      }
      if (currentMap) {
        const cIdx = trimmed.indexOf(":");
        const k = trimmed.substring(0, cIdx).trim();
        const v = trimmed.substring(cIdx + 1).trim();
        currentMap[k] = stripQuotes(v);
      }
    }
  }

  // Flush final state
  if (currentKey) {
    if (listOfMaps) {
      if (currentMapInList) {
        listOfMaps.push(currentMapInList);
      }
      result[currentKey] = listOfMaps;
    } else if (currentList) {
      result[currentKey] = currentList;
    } else if (currentMap) {
      result[currentKey] = currentMap;
    }
  }

  return result;
}

/**
 * Strip surrounding single or double quotes from a string.
 */
function stripQuotes(s: string): string {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1);
  }
  return s;
}

/**
 * Convert a parsed YAML object into a CustomModeDefinition.
 */
function toCustomMode(parsed: Record<string, unknown>): CustomModeDefinition {
  const name = String(parsed["name"] ?? "unnamed");
  const description = String(parsed["description"] ?? "");

  // Parse workflow steps
  const rawWorkflow = parsed["workflow"];
  const workflow: WorkflowStep[] = [];
  if (Array.isArray(rawWorkflow)) {
    for (const item of rawWorkflow) {
      if (typeof item === "object" && item !== null) {
        const step = item as Record<string, string>;
        workflow.push({
          name: step["name"] ?? "",
          description: step["description"] ?? "",
          agent: step["agent"],
          action: step["action"],
        });
      }
    }
  }

  // Parse agents
  const rawAgents = parsed["agents"];
  const agents: AgentConfig[] = [];
  if (Array.isArray(rawAgents)) {
    for (const item of rawAgents) {
      if (typeof item === "object" && item !== null) {
        const ag = item as Record<string, string>;
        agents.push({
          name: ag["name"] ?? "",
          role: ag["role"] ?? "",
          systemPrompt: ag["systemPrompt"],
        });
      }
    }
  }

  // Parse triggers
  const rawTriggers = parsed["triggers"];
  const triggers: ModeTrigger[] = [];
  if (Array.isArray(rawTriggers)) {
    for (const item of rawTriggers) {
      if (typeof item === "object" && item !== null) {
        const tr = item as Record<string, string>;
        triggers.push({
          event: tr["event"] ?? "",
          condition: tr["condition"],
        });
      }
    }
  }

  // Parse allowed tools
  const rawTools = parsed["allowedTools"];
  const allowedTools: string[] = [];
  if (Array.isArray(rawTools)) {
    for (const item of rawTools) {
      allowedTools.push(String(item));
    }
  }

  return { name, description, workflow, agents, triggers, allowedTools };
}

/**
 * Load a single custom mode definition from a YAML file.
 *
 * @param filePath - Absolute path to the YAML file
 * @returns CustomModeLoadResult with the parsed mode or error
 */
export function loadCustomMode(filePath: string): CustomModeLoadResult {
  try {
    if (!existsSync(filePath)) {
      return { success: false, error: `File not found: ${filePath}`, filePath };
    }

    const raw = readFileSync(filePath, "utf-8");
    const parsed = parseCustomModeYaml(raw);
    const mode = toCustomMode(parsed);

    return { success: true, mode, filePath };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg, filePath };
  }
}

/**
 * Load all custom mode definitions from .reins/modes/ directory.
 *
 * @param projectRoot - Absolute path to the project root
 * @returns Array of CustomModeLoadResult for each .yaml file found
 */
export function loadAllCustomModes(projectRoot: string): CustomModeLoadResult[] {
  const modesDir = join(projectRoot, MODES_DIR);
  if (!existsSync(modesDir)) {
    return [];
  }

  const results: CustomModeLoadResult[] = [];
  const entries = readdirSync(modesDir);

  for (const entry of entries) {
    const ext = extname(entry).toLowerCase();
    if (ext === ".yaml" || ext === ".yml") {
      const filePath = join(modesDir, entry);
      results.push(loadCustomMode(filePath));
    }
  }

  return results;
}
