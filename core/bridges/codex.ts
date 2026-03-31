/**
 * Reins Bridge — Codex App Server Client
 *
 * Connects to OpenAI Codex CLI via its app-server JSON-RPC protocol.
 * Supports two transport strategies:
 *   1. Direct: spawns `codex app-server` as a child process (stdin/stdout)
 *   2. Broker: connects to a shared Unix socket broker
 *
 * Ref: openai/codex-plugin-cc/plugins/codex/scripts/lib/app-server.mjs
 */

import { spawn, type ChildProcess } from "child_process";
import { existsSync } from "fs";
import { createConnection, type Socket } from "net";
import type { BridgeAdapter, BridgeConfig, BridgeRequest, BridgeResponse } from "./adapter.js";

export interface CodexConfig extends BridgeConfig {
  transport?: "direct" | "broker";
  socket_path?: string;
  codex_path?: string;
}

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export class CodexBridge implements BridgeAdapter {
  name = "codex";
  private config: CodexConfig;
  private requestId = 0;
  private process: ChildProcess | null = null;

  constructor(config: CodexConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    // Codex doesn't need an API key — it runs locally
    return this.findCodexBinary() !== null;
  }

  private findCodexBinary(): string | null {
    if (this.config.codex_path && existsSync(this.config.codex_path)) {
      return this.config.codex_path;
    }
    // Try common paths
    const candidates = [
      "/usr/local/bin/codex",
      `${process.env.HOME}/.local/bin/codex`,
      `${process.env.HOME}/.npm-global/bin/codex`,
    ];
    for (const p of candidates) {
      if (existsSync(p)) return p;
    }
    return null;
  }

  async send(request: BridgeRequest): Promise<BridgeResponse> {
    const transport = this.config.transport || "direct";

    if (transport === "broker" && this.config.socket_path) {
      return this.sendViaBroker(request);
    }
    return this.sendDirect(request);
  }

  /**
   * Direct transport: spawn codex app-server, communicate via stdin/stdout JSON-RPC.
   */
  private async sendDirect(request: BridgeRequest): Promise<BridgeResponse> {
    const codexPath = this.findCodexBinary();
    if (!codexPath) {
      throw new Error("Codex CLI not found. Install with: npm install -g @openai/codex");
    }

    const start = Date.now();

    return new Promise<BridgeResponse>((resolve, reject) => {
      const proc = spawn(codexPath, ["app-server"], {
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env },
      });

      let stdout = "";
      let resolved = false;

      proc.stdout?.on("data", (data: Buffer) => {
        stdout += data.toString();
        // Try to parse complete JSON-RPC responses
        const lines = stdout.split("\n");
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const response = JSON.parse(line) as JsonRpcResponse;
            if (response.id !== undefined && !resolved) {
              resolved = true;
              proc.kill();

              if (response.error) {
                reject(new Error(`Codex error: ${response.error.message}`));
                return;
              }

              const content = typeof response.result === "string"
                ? response.result
                : JSON.stringify(response.result, null, 2);

              resolve({
                content,
                model: this.config.model || "codex",
                provider: "codex",
                latency_ms: Date.now() - start,
              });
            }
          } catch {
            // Incomplete JSON, wait for more data
          }
        }
      });

      proc.on("error", (err) => {
        if (!resolved) {
          resolved = true;
          reject(new Error(`Failed to spawn Codex: ${err.message}`));
        }
      });

      proc.on("close", () => {
        if (!resolved) {
          resolved = true;
          reject(new Error("Codex process exited without response"));
        }
      });

      // Send JSON-RPC request
      const rpcRequest: JsonRpcRequest = {
        jsonrpc: "2.0",
        id: ++this.requestId,
        method: "create_turn",
        params: {
          prompt: request.context
            ? `${request.context}\n\n${request.prompt}`
            : request.prompt,
          ...(request.max_tokens && { max_tokens: request.max_tokens }),
        },
      };

      proc.stdin?.write(JSON.stringify(rpcRequest) + "\n");

      // Timeout
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          proc.kill();
          reject(new Error("Codex request timed out (60s)"));
        }
      }, 60000);
    });
  }

  /**
   * Broker transport: connect to shared Unix socket.
   */
  private async sendViaBroker(request: BridgeRequest): Promise<BridgeResponse> {
    const socketPath = this.config.socket_path!;
    const start = Date.now();

    return new Promise<BridgeResponse>((resolve, reject) => {
      const socket: Socket = createConnection(socketPath);
      let data = "";
      let resolved = false;

      socket.on("connect", () => {
        const rpcRequest: JsonRpcRequest = {
          jsonrpc: "2.0",
          id: ++this.requestId,
          method: "create_turn",
          params: {
            prompt: request.context
              ? `${request.context}\n\n${request.prompt}`
              : request.prompt,
          },
        };
        socket.write(JSON.stringify(rpcRequest) + "\n");
      });

      socket.on("data", (chunk: Buffer) => {
        data += chunk.toString();
        const lines = data.split("\n");
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const response = JSON.parse(line) as JsonRpcResponse;
            if (response.id !== undefined && !resolved) {
              resolved = true;
              socket.destroy();

              if (response.error) {
                reject(new Error(`Codex broker error: ${response.error.message}`));
                return;
              }

              const content = typeof response.result === "string"
                ? response.result
                : JSON.stringify(response.result, null, 2);

              resolve({
                content,
                model: this.config.model || "codex",
                provider: "codex",
                latency_ms: Date.now() - start,
              });
            }
          } catch {
            // wait for more data
          }
        }
      });

      socket.on("error", (err) => {
        if (!resolved) {
          resolved = true;
          reject(new Error(`Broker connection failed: ${err.message}`));
        }
      });

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          socket.destroy();
          reject(new Error("Broker request timed out (60s)"));
        }
      }, 60000);
    });
  }
}
