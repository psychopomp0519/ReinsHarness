/**
 * Codex Job Control — Track background Codex tasks
 *
 * Ref: openai/codex-plugin-cc/plugins/codex/scripts/lib/job-control.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const JOBS_DIR = join(process.cwd(), ".reins", "codex");
const JOBS_FILE = join(JOBS_DIR, "jobs.json");

/**
 * @typedef {object} Job
 * @property {string} id
 * @property {string} description
 * @property {"pending"|"running"|"completed"|"failed"|"cancelled"} status
 * @property {string} startedAt
 * @property {string} [completedAt]
 * @property {number} [pid]
 * @property {string} [result]
 * @property {string} [error]
 */

function ensureDir() {
  if (!existsSync(JOBS_DIR)) {
    mkdirSync(JOBS_DIR, { recursive: true });
  }
}

/**
 * Load all jobs.
 * @returns {Job[]}
 */
export function loadJobs() {
  if (!existsSync(JOBS_FILE)) return [];
  try {
    return JSON.parse(readFileSync(JOBS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

/**
 * Save all jobs.
 * @param {Job[]} jobs
 */
export function saveJobs(jobs) {
  ensureDir();
  writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), "utf-8");
}

/**
 * Create a new job.
 * @param {string} description
 * @returns {Job}
 */
export function createJob(description) {
  const jobs = loadJobs();
  const job = {
    id: `codex-${Date.now().toString(36)}`,
    description,
    status: "pending",
    startedAt: new Date().toISOString(),
  };
  jobs.push(job);
  saveJobs(jobs);
  return job;
}

/**
 * Update a job's status.
 * @param {string} jobId
 * @param {Partial<Job>} updates
 */
export function updateJob(jobId, updates) {
  const jobs = loadJobs();
  const job = jobs.find((j) => j.id === jobId);
  if (job) {
    Object.assign(job, updates);
    if (updates.status === "completed" || updates.status === "failed" || updates.status === "cancelled") {
      job.completedAt = new Date().toISOString();
    }
    saveJobs(jobs);
  }
}

/**
 * Get a specific job.
 * @param {string} jobId
 * @returns {Job|undefined}
 */
export function getJob(jobId) {
  return loadJobs().find((j) => j.id === jobId);
}

/**
 * Cancel a job by killing its process.
 * @param {string} jobId
 */
export function cancelJob(jobId) {
  const job = getJob(jobId);
  if (job && job.pid && job.status === "running") {
    try {
      process.kill(job.pid, "SIGTERM");
    } catch {
      // process may have already exited
    }
  }
  updateJob(jobId, { status: "cancelled" });
}
