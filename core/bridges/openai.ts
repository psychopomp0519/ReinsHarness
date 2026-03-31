/**
 * Reins Bridge — OpenAI API Adapter
 */

import type {
  BridgeAdapter,
  BridgeConfig,
  BridgeRequest,
  BridgeResponse,
} from "./adapter.js";

export class OpenAIBridge implements BridgeAdapter {
  name = "openai";
  private config: BridgeConfig;

  constructor(config: BridgeConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!this.config.api_key;
  }

  async send(request: BridgeRequest): Promise<BridgeResponse> {
    const model = this.config.model || "gpt-4o";
    const baseUrl = this.config.base_url || "https://api.openai.com/v1";
    const url = `${baseUrl}/chat/completions`;

    const start = Date.now();

    const messages = [];
    if (request.context) {
      messages.push({ role: "system", content: request.context });
    }
    messages.push({ role: "user", content: request.prompt });

    const body = {
      model,
      messages,
      max_tokens: request.max_tokens || 4096,
      temperature: request.temperature || 0.7,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.api_key}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { total_tokens?: number };
    };

    const content =
      data.choices?.[0]?.message?.content || "(no response)";
    const latency = Date.now() - start;

    return {
      content,
      model,
      provider: "openai",
      tokens_used: data.usage?.total_tokens,
      latency_ms: latency,
    };
  }
}
