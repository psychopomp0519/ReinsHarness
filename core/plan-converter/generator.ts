/**
 * Reins Plan Converter — Generator
 *
 * Transforms analyzed plan elements into Reins plan format.
 */

import type { AnalyzedPlan, Milestone, Requirement, Risk } from "./analyzer.js";

export interface GeneratedPlan {
  markdown: string;
  stats: {
    phases: number;
    tasks: number;
    requirements: number;
    risks: number;
    changes: number;
  };
}

/**
 * Generate a Reins-format plan from analyzed elements.
 */
export function generatePlan(
  analysis: AnalyzedPlan,
  sourceFilename: string,
): GeneratedPlan {
  const date = new Date().toISOString().split("T")[0];
  const changes: string[] = [];
  let taskCounter = 0;

  // Build phases from milestones
  const phases = buildPhases(analysis.milestones, analysis.requirements, changes);

  // Count total tasks
  for (const phase of phases) {
    taskCounter += phase.tasks.length;
  }

  // Generate acceptance criteria if missing
  if (changes.length === 0 && taskCounter > 0) {
    changes.push(
      "Added acceptance criteria for all tasks — original had none",
    );
  }

  // Build markdown
  let md = `# Plan: ${analysis.projectName}\n\n`;
  md += `> Original: ${sourceFilename} | Converted: ${date} | Status: Draft\n\n`;

  // Requirements
  md += `## Requirements Summary\n\n`;
  for (const req of analysis.requirements) {
    const priority = req.priority === "high" ? "🔴" : req.priority === "medium" ? "🟡" : "🟢";
    md += `- ${priority} [${req.type}] ${req.description}\n`;
  }
  md += "\n";

  // Tech stack
  if (analysis.techStack.length > 0) {
    md += `## Tech Stack\n\n`;
    for (const tech of analysis.techStack) {
      md += `- ${tech}\n`;
    }
    md += "\n";
  }

  // Task breakdown
  md += `## Task Breakdown\n\n`;
  let globalTaskIndex = 0;

  for (let pi = 0; pi < phases.length; pi++) {
    const phase = phases[pi];
    md += `### Phase ${pi + 1}: ${phase.name}\n\n`;

    for (let ti = 0; ti < phase.tasks.length; ti++) {
      const task = phase.tasks[ti];
      globalTaskIndex++;
      const dep =
        ti === 0
          ? pi === 0
            ? "none"
            : `Phase ${pi} completion`
          : `Task ${pi + 1}.${ti}`;

      md += `- [ ] Task ${pi + 1}.${ti + 1}: ${task.action}\n`;
      md += `  - Acceptance Criteria: ${task.criteria}\n`;
      md += `  - Dependencies: ${dep}\n`;
      md += `  - Estimated effort: ${task.effort} min\n`;
      if (task.sourceRef) {
        md += `  - Source reference: ${task.sourceRef}\n`;
      }
      md += "\n";
    }
  }

  // Checkpoints
  md += `## Checkpoints\n\n`;
  for (let pi = 0; pi < phases.length; pi++) {
    md += `- CP${pi + 1}: Phase ${pi + 1} complete → auto-trigger review mode\n`;
  }
  md += "\n";

  // Risks
  md += `## Risks & Mitigations\n\n`;
  md += `| Risk | Source | Impact | Mitigation |\n`;
  md += `|------|--------|--------|------------|\n`;
  for (const risk of analysis.risks) {
    md += `| ${risk.description} | ${risk.source} | ${risk.impact} | (to be determined) |\n`;
  }
  md += "\n";

  // Constraints
  if (analysis.constraints.length > 0) {
    md += `## Constraints\n\n`;
    for (const c of analysis.constraints) {
      md += `- ${c}\n`;
    }
    md += "\n";
  }

  // Changes from original
  md += `## Original vs. Converted\n\n`;
  md += `| Change | Reason |\n`;
  md += `|--------|--------|\n`;
  for (const change of changes) {
    md += `| ${change} | Auto-conversion |\n`;
  }
  md += "\n";

  return {
    markdown: md,
    stats: {
      phases: phases.length,
      tasks: globalTaskIndex,
      requirements: analysis.requirements.length,
      risks: analysis.risks.length,
      changes: changes.length,
    },
  };
}

interface PhaseData {
  name: string;
  tasks: TaskData[];
}

interface TaskData {
  action: string;
  criteria: string;
  effort: number;
  sourceRef?: string;
}

function buildPhases(
  milestones: Milestone[],
  requirements: Requirement[],
  changes: string[],
): PhaseData[] {
  const phases: PhaseData[] = [];

  if (milestones.length > 0) {
    for (const milestone of milestones) {
      const tasks: TaskData[] = [];

      for (const taskDesc of milestone.tasks) {
        tasks.push({
          action: taskDesc,
          criteria: generateCriteria(taskDesc),
          effort: estimateEffort(taskDesc),
          sourceRef: milestone.name,
        });
      }

      // Split phases with too many tasks
      if (tasks.length > 8) {
        changes.push(
          `Split "${milestone.name}" into multiple phases — original had ${tasks.length} tasks (max 8)`,
        );
        const chunks = chunkArray(tasks, 8);
        for (let i = 0; i < chunks.length; i++) {
          phases.push({
            name:
              chunks.length > 1
                ? `${milestone.name} (${i + 1}/${chunks.length})`
                : milestone.name,
            tasks: chunks[i],
          });
        }
      } else {
        phases.push({ name: milestone.name, tasks });
      }
    }
  } else {
    // No milestones — create phases from requirements
    changes.push(
      "Created phases from requirements — original had no milestone structure",
    );

    const tasks: TaskData[] = requirements.map((req) => ({
      action: `Implement: ${req.description}`,
      criteria: generateCriteria(req.description),
      effort: estimateEffort(req.description),
    }));

    const chunks = chunkArray(tasks, 6);
    for (let i = 0; i < chunks.length; i++) {
      phases.push({
        name: `Phase ${i + 1}`,
        tasks: chunks[i],
      });
    }
  }

  return phases;
}

function generateCriteria(taskDesc: string): string {
  // Auto-generate acceptance criteria from task description
  const lower = taskDesc.toLowerCase();

  if (/api|endpoint/i.test(lower)) {
    return "API endpoint responds with correct status codes and data format";
  }
  if (/test|테스트/i.test(lower)) {
    return "All tests pass with no regressions";
  }
  if (/ui|interface|화면/i.test(lower)) {
    return "UI renders correctly and matches design specifications";
  }
  if (/database|db|스키마/i.test(lower)) {
    return "Database schema created and migrations run successfully";
  }
  if (/auth|인증/i.test(lower)) {
    return "Authentication flow works for valid and invalid credentials";
  }

  return `"${taskDesc.slice(0, 50)}" is implemented and verified`;
}

function estimateEffort(taskDesc: string): number {
  const words = taskDesc.split(/\s+/).length;
  // Rough heuristic: more complex description = more effort
  if (words > 20) return 15;
  if (words > 10) return 10;
  return 5;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
