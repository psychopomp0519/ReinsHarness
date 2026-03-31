/**
 * Codex App Server Client
 *
 * JSON-RPC client for communicating with Codex CLI's app-server.
 * Supports direct (child process) and broker (Unix socket) transports.
 *
 * Ref: openai/codex-plugin-cc/plugins/codex/scripts/lib/app-server.mjs
 */

import { spawn } from "child_process";
import { createConnection } from "net";
import { existsSync } from "fs";

export class CodexAppServerClient {
  #transport = null;
  #requestId = 0;
  #pendingRequests = new Map();

  /**
   * Connect to Codex app-server.
   * @param {object} options
   * @param {"direct"|"broker"} options.transport
   * @param {string} [options.codexPath] - Path to codex binary
   * @param {string} [options.socketPath] - Unix socket path for broker
   */
  static async connect(options = {}) {
    const client = new CodexAppServerClient();

    if (options.transport === "broker" && options.socketPath) {
      await client.#connectBroker(options.socketPath);
    } else {
      await client.#connectDirect(options.codexPath);
    }

    return client;
  }

  async #connectDirect(codexPath) {
    const binary = codexPath || this.#findCodex();
    if (!binary) {
      throw new Error("Codex CLI not found. Install: npm install -g @openai/codex");
    }

    const proc = spawn(binary, ["app-server"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.#transport = {
      type: "direct",
      process: proc,
      write: (data) => proc.stdin.write(data),
    };

    proc.stdout.on("data", (chunk) => this.#handleData(chunk.toString()));
    proc.on("error", (err) => this.#handleError(err));
    proc.on("close", () => this.#handleClose());
  }

  async #connectBroker(socketPath) {
    return new Promise((resolve, reject) => {
      const socket = createConnection(socketPath);

      socket.on("connect", () => {
        this.#transport = {
          type: "broker",
          socket,
          write: (data) => socket.write(data),
        };
        resolve();
      });

      socket.on("data", (chunk) => this.#handleData(chunk.toString()));
      socket.on("error", (err) => reject(err));
    });
  }

  #findCodex() {
    const candidates = [
      "/usr/local/bin/codex",
      `${process.env.HOME}/.local/bin/codex`,
      `${process.env.HOME}/.npm-global/bin/codex`,
    ];
    return candidates.find((p) => existsSync(p)) || null;
  }

  #handleData(data) {
    for (const line of data.split("\n")) {
      if (!line.trim()) continue;
      try {
        const response = JSON.parse(line);
        if (response.id !== undefined) {
          const pending = this.#pendingRequests.get(response.id);
          if (pending) {
            this.#pendingRequests.delete(response.id);
            if (response.error) {
              pending.reject(new Error(response.error.message));
            } else {
              pending.resolve(response.result);
            }
          }
        }
      } catch {
        // incomplete JSON
      }
    }
  }

  #handleError(err) {
    for (const [id, pending] of this.#pendingRequests) {
      pending.reject(err);
      this.#pendingRequests.delete(id);
    }
  }

  #handleClose() {
    this.#transport = null;
  }

  /**
   * Send a JSON-RPC request and wait for response.
   */
  async request(method, params = {}, timeoutMs = 60000) {
    if (!this.#transport) {
      throw new Error("Not connected to Codex app-server");
    }

    const id = ++this.#requestId;
    const request = { jsonrpc: "2.0", id, method, params };

    return new Promise((resolve, reject) => {
      this.#pendingRequests.set(id, { resolve, reject });

      this.#transport.write(JSON.stringify(request) + "\n");

      setTimeout(() => {
        if (this.#pendingRequests.has(id)) {
          this.#pendingRequests.delete(id);
          reject(new Error(`Request ${method} timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);
    });
  }

  /**
   * Create a new turn (send a prompt to Codex).
   */
  async createTurn(prompt, options = {}) {
    return this.request("create_turn", { prompt, ...options });
  }

  /**
   * Close the connection.
   */
  close() {
    if (this.#transport?.type === "direct") {
      this.#transport.process.kill();
    } else if (this.#transport?.type === "broker") {
      this.#transport.socket.destroy();
    }
    this.#transport = null;
  }
}
