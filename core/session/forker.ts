/**
 * Reins Session Forker — Branch-based session forking
 *
 * Allows creating divergent session branches from a parent session,
 * each backed by its own git branch. Useful for exploring alternative
 * approaches in parallel.
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

/** Metadata for a forked session */
export interface ForkInfo {
  name: string;
  parentSession: string;
  branch: string;
  createdAt: string;
}

/** Result of a fork operation */
export interface ForkResult {
  success: boolean;
  message: string;
  fork?: ForkInfo;
}

/** Comparison between two forks */
export interface ForkComparison {
  from: string;
  to: string;
  aheadBy: number;
  behindBy: number;
  diff: string;
}

/** Registry file for forks stored at .reins/forks.json */
interface ForkRegistry {
  forks: ForkInfo[];
}

const FORK_REGISTRY = ".reins/forks.json";
const BRANCH_PREFIX = "reins-fork/";

/**
 * Run a git command in the given project root and return stdout.
 */
function git(projectRoot: string, args: string): string {
  return execSync(`git ${args}`, {
    cwd: projectRoot,
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();
}

/**
 * Load the fork registry from disk.
 */
function loadForkRegistry(projectRoot: string): ForkRegistry {
  const filePath = join(projectRoot, FORK_REGISTRY);
  if (!existsSync(filePath)) {
    return { forks: [] };
  }
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as ForkRegistry;
}

/**
 * Save the fork registry to disk.
 */
function saveForkRegistry(projectRoot: string, registry: ForkRegistry): void {
  const dir = join(projectRoot, ".reins");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(
    join(projectRoot, FORK_REGISTRY),
    JSON.stringify(registry, null, 2),
    "utf-8",
  );
}

/**
 * Fork the current session by creating a new git branch and registering
 * a new session entry. The fork branches from the current HEAD.
 *
 * @param projectRoot - Absolute path to the project root
 * @param forkName - Short name for the fork
 * @param parentSession - ID or name of the parent session
 * @returns ForkResult indicating success or failure
 */
export function forkSession(
  projectRoot: string,
  forkName: string,
  parentSession: string,
): ForkResult {
  const branchName = `${BRANCH_PREFIX}${forkName}`;

  try {
    // Create and checkout the new branch
    git(projectRoot, `checkout -b ${branchName}`);

    const fork: ForkInfo = {
      name: forkName,
      parentSession,
      branch: branchName,
      createdAt: new Date().toISOString(),
    };

    const registry = loadForkRegistry(projectRoot);
    registry.forks.push(fork);
    saveForkRegistry(projectRoot, registry);

    return {
      success: true,
      message: `Forked session "${parentSession}" as "${forkName}" on branch ${branchName}`,
      fork,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Failed to fork session: ${msg}` };
  }
}

/**
 * List all registered forks.
 *
 * @param projectRoot - Absolute path to the project root
 * @returns Array of ForkInfo objects
 */
export function listForks(projectRoot: string): ForkInfo[] {
  const registry = loadForkRegistry(projectRoot);
  return registry.forks;
}

/**
 * Compare two forks by their branches.
 *
 * @param projectRoot - Absolute path to the project root
 * @param fromFork - Name of the base fork
 * @param toFork - Name of the target fork
 * @returns ForkComparison with diff and commit distance
 */
export function compareForks(
  projectRoot: string,
  fromFork: string,
  toFork: string,
): ForkComparison {
  const fromBranch = `${BRANCH_PREFIX}${fromFork}`;
  const toBranch = `${BRANCH_PREFIX}${toFork}`;

  const diff = git(projectRoot, `diff ${fromBranch}..${toBranch}`);

  // Count commits ahead/behind
  const revList = git(
    projectRoot,
    `rev-list --left-right --count ${fromBranch}...${toBranch}`,
  );
  const parts = revList.split(/\s+/);
  const behindBy = parseInt(parts[0], 10) || 0;
  const aheadBy = parseInt(parts[1], 10) || 0;

  return {
    from: fromFork,
    to: toFork,
    aheadBy,
    behindBy,
    diff,
  };
}
