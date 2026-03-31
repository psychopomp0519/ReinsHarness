/**
 * Reins Mode Engine — State management
 *
 * Reads/writes mode state and progress tracking.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export interface ModeState {
  currentMode: string | null;
  lastTransition: string | null;
  progress: ProgressInfo | null;
}

export interface ProgressInfo {
  totalTasks: number;
  completedTasks: number;
  currentPhase: string | null;
  currentTask: string | null;
}

const STATE_FILE = ".reins/state.json";

/**
 * Load current mode state from .reins/state.json
 */
export function loadState(projectRoot: string): ModeState {
  const stateFile = join(projectRoot, STATE_FILE);

  if (!existsSync(stateFile)) {
    return {
      currentMode: null,
      lastTransition: null,
      progress: null,
    };
  }

  try {
    const raw = readFileSync(stateFile, "utf-8");
    return JSON.parse(raw) as ModeState;
  } catch {
    return {
      currentMode: null,
      lastTransition: null,
      progress: null,
    };
  }
}

/**
 * Save mode state to .reins/state.json
 */
export function saveState(projectRoot: string, state: ModeState): void {
  const dir = join(projectRoot, ".reins");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const stateFile = join(projectRoot, STATE_FILE);
  writeFileSync(stateFile, JSON.stringify(state, null, 2) + "\n", "utf-8");
}

/**
 * Parse progress from docs/progress.md
 */
export function parseProgress(projectRoot: string): ProgressInfo | null {
  const progressFile = join(projectRoot, "docs", "progress.md");

  if (!existsSync(progressFile)) {
    return null;
  }

  try {
    const content = readFileSync(progressFile, "utf-8");
    const lines = content.split("\n");

    let totalTasks = 0;
    let completedTasks = 0;
    let currentPhase: string | null = null;
    let currentTask: string | null = null;

    for (const line of lines) {
      // Count tasks: - [ ] or - [x]
      if (/^- \[[ x]\]/.test(line)) {
        totalTasks++;
        if (/^- \[x\]/i.test(line)) {
          completedTasks++;
        } else if (!currentTask) {
          // First unchecked task is the current one
          currentTask = line.replace(/^- \[ \]\s*/, "").trim();
        }
      }

      // Track current phase
      if (/^### Phase \d+/.test(line) && !currentTask) {
        currentPhase = line.replace(/^### /, "").trim();
      }
    }

    return { totalTasks, completedTasks, currentPhase, currentTask };
  } catch {
    return null;
  }
}
