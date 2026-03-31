---
name: reins-bridge-mode
description: >
  Use when the user invokes /mode bridge or says "브릿지",
  "bridge", "다른 AI", "크로스 리뷰", "세컨드 오피니언".
  This mode requires explicit invocation.
allowed-tools: "Read, Bash"
disable-model-invocation: true
---

Leverage external AI models for enhanced analysis and verification.

<HARD-GATE>
NEVER send .env files, API keys, credentials, or secrets to external AI models.
Always inform the user before sending any data externally.
</HARD-GATE>

## Prerequisites

External AI API keys must be configured in `.reins/bridges.json`:

```json
{
  "gemini": { "api_key": "...", "model": "gemini-2.0-flash" },
  "openai": { "api_key": "...", "model": "gpt-4o" },
  "codex": { "transport": "direct" }
}
```

## Use Cases

### 1. Cross Review
Send code to another AI for independent review.
Compare findings with Claude's review.

### 2. Second Opinion
Get an alternative perspective on architecture decisions,
implementation choices, or trade-offs.

### 3. Strength Leveraging
Use each AI's strengths:
- Gemini: multimodal analysis, large context
- GPT: creative generation, specific domain knowledge
- Codex: autonomous coding, task delegation, adversarial testing
- Claude: code analysis, structured reasoning

### 4. Rate Limit Bypass
When one AI is rate-limited, delegate to another.

### 5. Comparative Generation
Generate solutions from multiple AIs and compare.

## Commands

- `/bridge gemini review <file>` — Gemini code review
- `/bridge gpt opinion <topic>` — GPT opinion
- `/bridge codex review <file>` — Codex code review
- `/bridge codex rescue <task>` — Delegate task to Codex
- `/bridge codex adversarial <file>` — Adversarial review via Codex
- `/bridge compare <prompt>` — Multi-AI comparison
- `/bridge handoff <ai> <context>` — Handoff task
- `/bridge status` — Show configured bridges

## Workflow

1. Check `.reins/bridges.json` for available bridges
2. Prepare context (code, question, or task)
3. Use Bash to run: `node $REINS_HOME/scripts/codex/codex-companion.mjs <command>` for Codex, or use the bridge configuration in `.reins/bridges.json` for API-based bridges.
4. Format and present response
5. If cross-review: compare with Claude's analysis

## Safety Rules

- Respect API rate limits
- Cache responses to avoid redundant calls

## Handoff

After receiving external AI input, suggest `/dev` or `/review` based on the input type.
