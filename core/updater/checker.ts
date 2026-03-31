/**
 * Reins Updater — Version Checker
 *
 * Checks for available updates via GitHub releases API.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

export interface VersionInfo {
  current: string;
  latest: string;
  updateAvailable: boolean;
  releaseUrl?: string;
  releaseNotes?: string;
  publishedAt?: string;
}

/**
 * Get the current installed version.
 */
export function getCurrentVersion(reinsHome: string): string {
  const pkgPath = join(reinsHome, "package.json");
  if (!existsSync(pkgPath)) {
    return "0.0.0";
  }

  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

/**
 * Check for the latest version from GitHub releases.
 */
export async function checkLatestVersion(
  owner: string = "reins-ai",
  repo: string = "reins",
): Promise<VersionInfo> {
  const current = getCurrentVersion(
    join(process.env.REINS_HOME ?? process.cwd()),
  );

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
    const response = await fetch(url, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });

    if (!response.ok) {
      return { current, latest: current, updateAvailable: false };
    }

    const data = (await response.json()) as {
      tag_name?: string;
      html_url?: string;
      body?: string;
      published_at?: string;
    };

    const latest = (data.tag_name ?? "").replace(/^v/, "");

    return {
      current,
      latest: latest || current,
      updateAvailable: latest !== "" && latest !== current && compareVersions(latest, current) > 0,
      releaseUrl: data.html_url,
      releaseNotes: data.body?.slice(0, 500),
      publishedAt: data.published_at,
    };
  } catch {
    return { current, latest: current, updateAvailable: false };
  }
}

/**
 * Simple semver comparison: returns positive if a > b.
 */
function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }

  return 0;
}
