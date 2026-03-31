/**
 * Reins Bridge — Gemini API Adapter
 */

import type {
  BridgeAdapter,
  BridgeConfig,
  BridgeRequest,
  BridgeResponse,
} from "./adapter.js";

export class GeminiBridge implements BridgeAdapter {
  name = "gemini";
  private config: BridgeConfig;

  constructor(config: BridgeConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!this.config.api_key;
  }

  async send(request: BridgeRequest): Promise<BridgeResponse> {
    const model = this.config.model || "gemini-2.0-flash";
    const baseUrl =
      this.config.base_url ||
      "https://generativelanguage.googleapis.com/v1beta";
    const url = `${baseUrl}/models/${model}:generateContent?key=${this.config.api_key}`;

    const start = Date.now();

    const body = {
      contents: [
        {
          parts: [
            {
              text: request.context
                ? `${request.context}\n\n${request.prompt}`
                : request.prompt,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: request.max_tokens || 4096,
        temperature: request.temperature || 0.7,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      usageMetadata?: { totalTokenCount?: number };
    };

    const content =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "(no response)";
    const latency = Date.now() - start;

    return {
      content,
      model,
      provider: "gemini",
      tokens_used: data.usageMetadata?.totalTokenCount,
      latency_ms: latency,
    };
  }
}
