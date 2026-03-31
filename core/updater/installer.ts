/**
 * Reins Updater — Installer
 *
 * Performs the actual update: backup → pull → install → build → verify.
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, cpSync } from "fs";
import { join } from "path";

export interface UpdateResult {
  success: boolean;
  fromVersion: string;
  toVersion: string;
  backupPath: string;
  steps: UpdateStep[];
}

export interface UpdateStep {
  name: string;
  status: "success" | "failed" | "skipped";
  message: string;
}

/**
 * Execute a full update.
 */
export function performUpdate(reinsHome: string, currentVersion: string): UpdateResult {
  const steps: UpdateStep[] = [];
  const backupDir = join(reinsHome, ".reins", "backups");
  const backupPath = join(backupDir, `backup-${currentVersion}-${Date.now()}`);

  // Step 1: Create backup
  try {
    mkdirSync(backupDir, { recursive: true });
    // Backup critical files
    const filesToBackup = ["package.json", "CLAUDE.md", "tsconfig.json"];
    mkdirSync(backupPath, { recursive: true });
    for (const file of filesToBackup) {
      const src = join(reinsHome, file);
      if (existsSync(src)) {
        cpSync(src, join(backupPath, file));
      }
    }
    // Backup hooks dist
    const hooksDist = join(reinsHome, "hooks", "dist");
    if (existsSync(hooksDist)) {
      cpSync(hooksDist, join(backupPath, "hooks-dist"), { recursive: true });
    }
    steps.push({ name: "Backup", status: "success", message: `Backed up to ${backupPath}` });
  } catch (err) {
    steps.push({ name: "Backup", status: "failed", message: String(err) });
    return { success: false, fromVersion: currentVersion, toVersion: currentVersion, backupPath, steps };
  }

  // Step 2: Git pull
  try {
    execSync("git pull origin main", { cwd: reinsHome, timeout: 30000, stdio: "pipe" });
    steps.push({ name: "Git Pull", status: "success", message: "Pulled latest changes" });
  } catch (err) {
    steps.push({ name: "Git Pull", status: "failed", message: String(err) });
    return { success: false, fromVersion: currentVersion, toVersion: currentVersion, backupPath, steps };
  }

  // Step 3: npm install
  try {
    execSync("npm install", { cwd: reinsHome, timeout: 60000, stdio: "pipe" });
    steps.push({ name: "npm install", status: "success", message: "Dependencies updated" });
  } catch (err) {
    steps.push({ name: "npm install", status: "failed", message: String(err) });
    return { success: false, fromVersion: currentVersion, toVersion: currentVersion, backupPath, steps };
  }

  // Step 4: Build core
  try {
    execSync("npm run build", { cwd: reinsHome, timeout: 30000, stdio: "pipe" });
    steps.push({ name: "Build Core", status: "success", message: "Core built" });
  } catch (err) {
    steps.push({ name: "Build Core", status: "failed", message: String(err) });
  }

  // Step 5: Build hooks
  try {
    execSync("npm run build:hooks", { cwd: reinsHome, timeout: 30000, stdio: "pipe" });
    steps.push({ name: "Build Hooks", status: "success", message: "Hooks rebuilt" });
  } catch (err) {
    steps.push({ name: "Build Hooks", status: "failed", message: String(err) });
  }

  // Step 6: Verify
  try {
    const version = execSync(`${join(reinsHome, "bin", "reins")} --version`, {
      encoding: "utf-8",
      timeout: 5000,
    }).trim();
    steps.push({ name: "Verify", status: "success", message: version });
  } catch {
    steps.push({ name: "Verify", status: "failed", message: "Version check failed" });
  }

  const newVersion = steps.find((s) => s.name === "Verify")?.message.replace("Reins v", "") ?? currentVersion;
  const allSuccess = steps.every((s) => s.status !== "failed");

  return {
    success: allSuccess,
    fromVersion: currentVersion,
    toVersion: newVersion,
    backupPath,
    steps,
  };
}
