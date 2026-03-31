/**
 * Reins Mode Engine — Core mode switching logic
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { ModeState, loadState, saveState } from "./state.js";
import { isValidTransition, type ModeTransition } from "./transitions.js";

export type ModeName =
  | "plan"
  | "dev"
  | "review"
  | "discuss"
  | "cleanup"
  | "security"
  | "retro"
  | "deploy"
  | "bridge";

export const MODE_ICONS: Record<ModeName, string> = {
  plan: "📋",
  dev: "🔨",
  review: "🔍",
  discuss: "💬",
  cleanup: "🧹",
  security: "🔒",
  retro: "📊",
  deploy: "🚀",
  bridge: "🌐",
};

export const MANUAL_ONLY_MODES: ModeName[] = ["security", "deploy", "bridge"];

export const ALL_MODES: ModeName[] = [
  "plan", "dev", "review", "discuss", "cleanup",
  "security", "retro", "deploy", "bridge",
];

interface TransitionResult {
  success: boolean;
  from: ModeName | null;
  to: ModeName;
  message: string;
}

/**
 * Switch to a new mode.
 */
export function switchMode(targetMode: ModeName, projectRoot: string): TransitionResult {
  if (!ALL_MODES.includes(targetMode)) {
    return {
      success: false,
      from: null,
      to: targetMode,
      message: `Unknown mode: "${targetMode}". Available: ${ALL_MODES.join(", ")}`,
    };
  }

  const state = loadState(projectRoot);
  const currentMode = state.currentMode;

  // Check transition validity
  if (currentMode && !isValidTransition(currentMode, targetMode)) {
    // Not blocking, just warn
  }

  // Update state
  state.currentMode = targetMode;
  state.lastTransition = new Date().toISOString();
  saveState(projectRoot, state);

  // Write current mode file for statusLine
  const reinsDir = join(projectRoot, ".reins");
  if (!existsSync(reinsDir)) {
    mkdirSync(reinsDir, { recursive: true });
  }
  writeFileSync(join(reinsDir, "current-mode"), targetMode, "utf-8");

  // Record in history
  recordTransition(projectRoot, {
    from: currentMode,
    to: targetMode,
    timestamp: new Date().toISOString(),
    reason: "user-initiated",
  });

  const icon = MODE_ICONS[targetMode];
  return {
    success: true,
    from: currentMode as ModeName | null,
    to: targetMode,
    message: `${icon} Switched to ${targetMode.charAt(0).toUpperCase() + targetMode.slice(1)} Mode`,
  };
}

/**
 * Get current mode status.
 */
export function getStatus(projectRoot: string): ModeState {
  return loadState(projectRoot);
}

/**
 * Get transition history.
 */
export function getHistory(projectRoot: string): ModeTransition[] {
  const historyFile = join(projectRoot, ".reins", "mode-history.jsonl");
  if (!existsSync(historyFile)) {
    return [];
  }

  const lines = readFileSync(historyFile, "utf-8").trim().split("\n");
  return lines
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as ModeTransition);
}

function recordTransition(projectRoot: string, transition: ModeTransition): void {
  const reinsDir = join(projectRoot, ".reins");
  if (!existsSync(reinsDir)) {
    mkdirSync(reinsDir, { recursive: true });
  }

  const historyFile = join(reinsDir, "mode-history.jsonl");
  const entry = JSON.stringify(transition) + "\n";
  appendFileSync(historyFile, entry, "utf-8");
}
