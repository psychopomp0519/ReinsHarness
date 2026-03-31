/**
 * Reins Bridge Adapter — Unified interface for external AI integration
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

export interface BridgeConfig {
  api_key: string;
  model: string;
  base_url?: string;
}

export interface BridgeRequest {
  prompt: string;
  context?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface BridgeResponse {
  content: string;
  model: string;
  provider: string;
  tokens_used?: number;
  latency_ms?: number;
}

export interface BridgeAdapter {
  name: string;
  isConfigured(): boolean;
  send(request: BridgeRequest): Promise<BridgeResponse>;
}

/**
 * Load bridge configurations from .reins/bridges.json
 */
export function loadBridgeConfigs(
  projectRoot: string,
): Record<string, BridgeConfig> {
  const configPath = join(projectRoot, ".reins", "bridges.json");

  if (!existsSync(configPath)) {
    return {};
  }

  try {
    const raw = readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as Record<string, BridgeConfig>;
  } catch {
    return {};
  }
}

/**
 * Check which bridges are available
 */
export function getAvailableBridges(projectRoot: string): string[] {
  const configs = loadBridgeConfigs(projectRoot);
  return Object.entries(configs)
    .filter(([_, config]) => config.api_key && config.api_key.length > 0)
    .map(([name]) => name);
}
