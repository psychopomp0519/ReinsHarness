/**
 * Reins Mode Engine — Transition rules
 *
 * Defines which mode transitions are natural/suggested
 * vs. unusual (but still allowed).
 */

export interface ModeTransition {
  from: string | null;
  to: string;
  timestamp: string;
  reason: string;
}

/**
 * Natural transitions — these are suggested automatically.
 *
 * Format: from → to[]
 * Any transition is ALLOWED, but these are the suggested/expected ones.
 */
const NATURAL_TRANSITIONS: Record<string, string[]> = {
  plan: ["dev"],                    // Plan approved → start developing
  dev: ["review", "discuss"],       // Checkpoint or need discussion
  review: ["dev", "deploy"],        // Issues fixed or ready to deploy
  discuss: ["plan", "dev"],         // Decision made → plan or implement
  cleanup: ["dev", "review"],       // After cleanup → continue work
  security: ["dev", "review"],      // Security issues → fix or verify
  retro: ["plan"],                  // Lessons learned → new plan
  deploy: ["retro"],                // After deploy → retrospective
  bridge: ["dev", "review"],        // External AI input → continue
};

/**
 * Check if a transition is a natural/expected flow.
 * All transitions are allowed; this just identifies natural ones.
 */
export function isValidTransition(from: string, to: string): boolean {
  const natural = NATURAL_TRANSITIONS[from];
  if (!natural) return true; // Unknown mode → allow anything
  return natural.includes(to);
}

/**
 * Get suggested next modes from the current mode.
 */
export function getSuggestedTransitions(from: string): string[] {
  return NATURAL_TRANSITIONS[from] ?? [];
}

/**
 * Get a human-readable reason for a suggested transition.
 */
export function getTransitionReason(from: string, to: string): string {
  const reasons: Record<string, Record<string, string>> = {
    plan: {
      dev: "Plan approved — ready to implement",
    },
    dev: {
      review: "Phase checkpoint — verify implementation",
      discuss: "Design question — need team input",
    },
    review: {
      dev: "Issues found — fix and continue",
      deploy: "All checks passed — ready for deployment",
    },
    discuss: {
      plan: "Decision made — update the plan",
      dev: "Consensus reached — implement the solution",
    },
    cleanup: {
      dev: "Cleanup complete — continue development",
      review: "Cleanup complete — verify changes",
    },
    security: {
      dev: "Vulnerabilities found — fix required",
      review: "Security audit complete — verify fixes",
    },
    retro: {
      plan: "Lessons captured — plan next iteration",
    },
    deploy: {
      retro: "Deployment complete — review the process",
    },
  };

  return reasons[from]?.[to] ?? "User-initiated transition";
}
