/**
 * Reins Snapshot Manager — Git-based snapshot system
 *
 * Creates, restores, lists, and compares named snapshots using git tags.
 * Each snapshot is stored as a git tag with the prefix "reins-snapshot-".
 */

import { execSync } from "child_process";

/** Metadata for a single snapshot */
export interface SnapshotMeta {
  name: string;
  timestamp: string;
  mode: string;
  branch: string;
  commitHash: string;
  description: string;
}

/** Result returned by snapshot operations */
export interface SnapshotResult {
  success: boolean;
  message: string;
  snapshot?: SnapshotMeta;
}

/** Diff summary between two snapshots */
export interface SnapshotComparison {
  from: string;
  to: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
  diff: string;
}

const TAG_PREFIX = "reins-snapshot-";

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
 * Create a new snapshot by tagging the current HEAD.
 *
 * @param projectRoot - Absolute path to the project root
 * @param name - Short name for the snapshot (alphanumeric + hyphens)
 * @param mode - Current reins mode at snapshot time
 * @param description - Human-readable description of the snapshot
 * @returns SnapshotResult indicating success or failure
 */
export function createSnapshot(
  projectRoot: string,
  name: string,
  mode: string,
  description: string = "",
): SnapshotResult {
  const tagName = `${TAG_PREFIX}${name}`;

  try {
    const branch = git(projectRoot, "rev-parse --abbrev-ref HEAD");
    const commitHash = git(projectRoot, "rev-parse HEAD");
    const timestamp = new Date().toISOString();

    const tagMessage = JSON.stringify({
      name,
      timestamp,
      mode,
      branch,
      commitHash,
      description,
    } satisfies SnapshotMeta);

    git(projectRoot, `tag -a ${tagName} -m '${tagMessage.replace(/'/g, "'\\''")}'`);

    return {
      success: true,
      message: `Snapshot "${name}" created at ${commitHash.substring(0, 8)}`,
      snapshot: { name, timestamp, mode, branch, commitHash, description },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Failed to create snapshot: ${msg}` };
  }
}

/**
 * Restore a snapshot by checking out the tagged commit.
 *
 * @param projectRoot - Absolute path to the project root
 * @param name - Name of the snapshot to restore
 * @returns SnapshotResult indicating success or failure
 */
export function restoreSnapshot(
  projectRoot: string,
  name: string,
): SnapshotResult {
  const tagName = `${TAG_PREFIX}${name}`;

  try {
    git(projectRoot, `checkout ${tagName}`);
    return {
      success: true,
      message: `Restored snapshot "${name}"`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Failed to restore snapshot: ${msg}` };
  }
}

/**
 * List all reins snapshots in the repository.
 *
 * @param projectRoot - Absolute path to the project root
 * @returns Array of SnapshotMeta for each snapshot found
 */
export function listSnapshots(projectRoot: string): SnapshotMeta[] {
  try {
    const tags = git(projectRoot, `tag -l '${TAG_PREFIX}*'`);
    if (!tags) {
      return [];
    }

    const snapshots: SnapshotMeta[] = [];

    for (const tag of tags.split("\n")) {
      const snapshotName = tag.replace(TAG_PREFIX, "");
      try {
        const rawMessage = git(projectRoot, `tag -l --format='%(contents)' ${tag}`);
        const meta = JSON.parse(rawMessage) as SnapshotMeta;
        snapshots.push(meta);
      } catch {
        // If the tag message isn't valid JSON, build minimal metadata
        const commitHash = git(projectRoot, `rev-list -n 1 ${tag}`);
        snapshots.push({
          name: snapshotName,
          timestamp: "",
          mode: "unknown",
          branch: "",
          commitHash,
          description: "",
        });
      }
    }

    return snapshots;
  } catch {
    return [];
  }
}

/**
 * Compare two snapshots and return a diff summary.
 *
 * @param projectRoot - Absolute path to the project root
 * @param fromName - Name of the base snapshot
 * @param toName - Name of the target snapshot
 * @returns SnapshotComparison with diff details
 */
export function compareSnapshots(
  projectRoot: string,
  fromName: string,
  toName: string,
): SnapshotComparison {
  const fromTag = `${TAG_PREFIX}${fromName}`;
  const toTag = `${TAG_PREFIX}${toName}`;

  const diff = git(projectRoot, `diff ${fromTag}..${toTag}`);
  const shortstat = git(projectRoot, `diff --shortstat ${fromTag}..${toTag}`);

  let filesChanged = 0;
  let insertions = 0;
  let deletions = 0;

  // Parse shortstat: "3 files changed, 10 insertions(+), 2 deletions(-)"
  const filesMatch = shortstat.match(/(\d+)\s+files?\s+changed/);
  const insMatch = shortstat.match(/(\d+)\s+insertions?/);
  const delMatch = shortstat.match(/(\d+)\s+deletions?/);

  if (filesMatch) filesChanged = parseInt(filesMatch[1], 10);
  if (insMatch) insertions = parseInt(insMatch[1], 10);
  if (delMatch) deletions = parseInt(delMatch[1], 10);

  return {
    from: fromName,
    to: toName,
    filesChanged,
    insertions,
    deletions,
    diff,
  };
}
