/**
 * Reins Updater — Rollback
 *
 * Restores from a backup created during update.
 */

import { readdirSync, existsSync, cpSync } from "fs";
import { join } from "path";

export interface RollbackResult {
  success: boolean;
  backupUsed: string;
  message: string;
}

/**
 * Find the most recent backup.
 */
export function findLatestBackup(reinsHome: string): string | null {
  const backupDir = join(reinsHome, ".reins", "backups");
  if (!existsSync(backupDir)) return null;

  try {
    const entries = readdirSync(backupDir)
      .filter((e) => e.startsWith("backup-"))
      .sort()
      .reverse();

    return entries.length > 0 ? join(backupDir, entries[0]) : null;
  } catch {
    return null;
  }
}

/**
 * List all available backups.
 */
export function listBackups(reinsHome: string): string[] {
  const backupDir = join(reinsHome, ".reins", "backups");
  if (!existsSync(backupDir)) return [];

  try {
    return readdirSync(backupDir)
      .filter((e) => e.startsWith("backup-"))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

/**
 * Restore from a specific backup.
 */
export function rollback(reinsHome: string, backupPath?: string): RollbackResult {
  const targetBackup = backupPath ?? findLatestBackup(reinsHome);

  if (!targetBackup) {
    return {
      success: false,
      backupUsed: "",
      message: "No backup found to restore from",
    };
  }

  if (!existsSync(targetBackup)) {
    return {
      success: false,
      backupUsed: targetBackup,
      message: `Backup not found: ${targetBackup}`,
    };
  }

  try {
    // Restore backed-up files
    const filesToRestore = ["package.json", "CLAUDE.md", "tsconfig.json"];
    for (const file of filesToRestore) {
      const src = join(targetBackup, file);
      if (existsSync(src)) {
        cpSync(src, join(reinsHome, file));
      }
    }

    // Restore hooks dist
    const hooksDist = join(targetBackup, "hooks-dist");
    if (existsSync(hooksDist)) {
      cpSync(hooksDist, join(reinsHome, "hooks", "dist"), { recursive: true });
    }

    return {
      success: true,
      backupUsed: targetBackup,
      message: `Restored from: ${targetBackup}`,
    };
  } catch (err) {
    return {
      success: false,
      backupUsed: targetBackup,
      message: `Rollback failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
