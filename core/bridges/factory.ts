/**
 * Reins Bridge Factory
 *
 * Creates and manages bridge instances from configuration.
 */

import { loadBridgeConfigs, type BridgeAdapter, type BridgeRequest, type BridgeResponse } from "./adapter.js";
import { GeminiBridge } from "./gemini.js";
import { OpenAIBridge } from "./openai.js";
import { CodexBridge, type CodexConfig } from "./codex.js";

/**
 * Create all configured bridge adapters.
 */
export function createBridges(projectRoot: string): Map<string, BridgeAdapter> {
  const configs = loadBridgeConfigs(projectRoot);
  const bridges = new Map<string, BridgeAdapter>();

  for (const [name, config] of Object.entries(configs)) {
    switch (name) {
      case "gemini":
        bridges.set(name, new GeminiBridge(config));
        break;
      case "openai":
      case "gpt":
        bridges.set(name, new OpenAIBridge(config));
        break;
      case "codex":
        bridges.set(name, new CodexBridge(config as CodexConfig));
        break;
      default:
        // Unknown bridge type — skip
        break;
    }
  }

  return bridges;
}

/**
 * Send a request to a specific bridge.
 */
export async function sendToBridge(
  bridges: Map<string, BridgeAdapter>,
  bridgeName: string,
  request: BridgeRequest,
): Promise<BridgeResponse> {
  const bridge = bridges.get(bridgeName);
  if (!bridge) {
    throw new Error(
      `Bridge "${bridgeName}" not found. Available: ${[...bridges.keys()].join(", ") || "none"}`,
    );
  }

  if (!bridge.isConfigured()) {
    throw new Error(
      `Bridge "${bridgeName}" is not configured. Add API key to .reins/bridges.json`,
    );
  }

  return bridge.send(request);
}

/**
 * Send the same request to all configured bridges and compare results.
 */
export async function compareAcrossBridges(
  bridges: Map<string, BridgeAdapter>,
  request: BridgeRequest,
): Promise<BridgeResponse[]> {
  const activeBridges = [...bridges.entries()].filter(
    ([_, b]) => b.isConfigured(),
  );

  if (activeBridges.length === 0) {
    throw new Error("No configured bridges available. Add API keys to .reins/bridges.json");
  }

  const results = await Promise.allSettled(
    activeBridges.map(([_, bridge]) => bridge.send(request)),
  );

  return results
    .filter((r): r is PromiseFulfilledResult<BridgeResponse> => r.status === "fulfilled")
    .map((r) => r.value);
}
