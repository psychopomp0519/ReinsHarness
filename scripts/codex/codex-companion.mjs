#!/usr/bin/env node
/**
 * Codex Companion — Command dispatcher for Codex integration
 *
 * Usage:
 *   node codex-companion.mjs review <file-or-diff>
 *   node codex-companion.mjs rescue <task-description>
 *   node codex-companion.mjs status
 *   node codex-companion.mjs result <job-id>
 *   node codex-companion.mjs cancel <job-id>
 *
 * Ref: openai/codex-plugin-cc/plugins/codex/scripts/codex-companion.mjs
 */

import { CodexAppServerClient } from "./lib/app-server.mjs";
import { createJob, updateJob, loadJobs, cancelJob, getJob } from "./lib/job-control.mjs";
import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";

const [, , command, ...args] = process.argv;

async function main() {
  switch (command) {
    case "review":
      await handleReview(args.join(" "));
      break;
    case "rescue":
      await handleRescue(args.join(" "));
      break;
    case "status":
      handleStatus();
      break;
    case "result":
      handleResult(args[0]);
      break;
    case "cancel":
      handleCancel(args[0]);
      break;
    default:
      console.log("Usage: codex-companion.mjs <review|rescue|status|result|cancel> [args]");
      process.exit(1);
  }
}

async function handleReview(target) {
  let content;

  if (target && existsSync(target)) {
    content = readFileSync(target, "utf-8");
  } else {
    // Use git diff
    try {
      content = execSync("git diff HEAD", { encoding: "utf-8" });
      if (!content.trim()) {
        content = execSync("git diff --cached", { encoding: "utf-8" });
      }
    } catch {
      console.error("No target file or git diff available.");
      process.exit(1);
    }
  }

  console.log("Connecting to Codex app-server...");
  const client = await CodexAppServerClient.connect({ transport: "direct" });

  try {
    const prompt = `Review the following code for bugs, security issues, performance problems, and best practices violations. Be specific and actionable.\n\n${content}`;
    console.log("Sending review request...");
    const result = await client.createTurn(prompt);
    console.log("\n━━━ Codex Review ━━━");
    console.log(typeof result === "string" ? result : JSON.stringify(result, null, 2));
  } finally {
    client.close();
  }
}

async function handleRescue(description) {
  if (!description) {
    console.error("Task description required: codex-companion.mjs rescue <description>");
    process.exit(1);
  }

  const job = createJob(description);
  console.log(`Job created: ${job.id}`);
  console.log(`Task: ${description}`);

  updateJob(job.id, { status: "running", pid: process.pid });

  console.log("Connecting to Codex app-server...");
  const client = await CodexAppServerClient.connect({ transport: "direct" });

  try {
    const prompt = `Complete the following task:\n\n${description}\n\nProvide the implementation with clear file paths and code.`;
    const result = await client.createTurn(prompt);
    const output = typeof result === "string" ? result : JSON.stringify(result, null, 2);
    updateJob(job.id, { status: "completed", result: output });
    console.log("\n━━━ Task Completed ━━━");
    console.log(output);
  } catch (err) {
    updateJob(job.id, { status: "failed", error: err.message });
    console.error(`Task failed: ${err.message}`);
  } finally {
    client.close();
  }
}

function handleStatus() {
  const jobs = loadJobs();
  if (jobs.length === 0) {
    console.log("No Codex jobs found.");
    return;
  }

  console.log("━━━ Codex Jobs ━━━");
  for (const job of jobs.slice(-10)) {
    const icon = {
      pending: "⏳",
      running: "🔄",
      completed: "✅",
      failed: "❌",
      cancelled: "🚫",
    }[job.status] || "❓";

    console.log(`  ${icon} ${job.id} [${job.status}] — ${job.description}`);
    if (job.completedAt) {
      console.log(`     Started: ${job.startedAt} | Completed: ${job.completedAt}`);
    }
  }
}

function handleResult(jobId) {
  if (!jobId) {
    console.error("Job ID required: codex-companion.mjs result <job-id>");
    process.exit(1);
  }

  const job = getJob(jobId);
  if (!job) {
    console.error(`Job not found: ${jobId}`);
    process.exit(1);
  }

  console.log(`Job: ${job.id} [${job.status}]`);
  console.log(`Task: ${job.description}`);

  if (job.result) {
    console.log("\n━━━ Result ━━━");
    console.log(job.result);
  } else if (job.error) {
    console.log("\n━━━ Error ━━━");
    console.log(job.error);
  } else {
    console.log("\nNo result yet. Job may still be running.");
  }
}

function handleCancel(jobId) {
  if (!jobId) {
    console.error("Job ID required: codex-companion.mjs cancel <job-id>");
    process.exit(1);
  }

  cancelJob(jobId);
  console.log(`Job ${jobId} cancelled.`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
