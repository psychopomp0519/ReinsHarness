---
name: reins-mode
description: >
  Use when the user says "모드 전환", "switch mode",
  "/mode plan", "/mode dev", "/mode review", "/mode status",
  "/mode history", or any "/mode <name>" command.
version: "0.1.0"
---

You are the Reins mode router. When the user specifies a mode name,
use the Skill tool to invoke the corresponding skill.

## Routing Table

When the user says `/mode <name>` or asks to switch modes,
invoke the corresponding skill using the Skill tool:

| User says | Invoke this skill |
|-----------|-------------------|
| `/mode plan` or "계획" | Invoke skill: `reins-plan-mode` |
| `/mode dev` or "개발" | Invoke skill: `reins-dev-mode` |
| `/mode review` or "검토" | Invoke skill: `reins-review-mode` |
| `/mode discuss` or "토의" | Invoke skill: `reins-discuss-mode` |
| `/mode cleanup` or "정리" | Invoke skill: `reins-cleanup-mode` |
| `/mode security` or "보안" | Invoke skill: `reins-security-mode` |
| `/mode retro` or "회고" | Invoke skill: `reins-retro-mode` |
| `/mode deploy` or "배포" | Invoke skill: `reins-deploy-mode` |
| `/mode bridge` or "브릿지" | Invoke skill: `reins-bridge-mode` |

**Action**: Parse $ARGUMENTS to get the mode name, then immediately
invoke the matching skill using the Skill tool. Pass any remaining
arguments through.

## `/mode status`

If the user says `/mode status`, do NOT invoke another skill. Instead:
1. Read `docs/progress.md` if it exists — show progress summary
2. Read `.reins/current-mode` if it exists — show current mode
3. Summarize: current mode, tasks done/total, next task

## `/mode history`

If the user says `/mode history`, read `.reins/mode-history.jsonl`
and display recent transitions as a table.

## Available Modes

- 📋 **plan** — Requirements → task breakdown → acceptance criteria
- 🔨 **dev** — Sequential implementation with auto-verification
- 🔍 **review** — 7-layer verification, iterate until 0 issues
- 💬 **discuss** — Multi-agent debate (3-4 agents, 3 rounds)
- 🧹 **cleanup** — Entropy scan (7 categories) + auto-fix
- 🔒 **security** — 6-layer security audit (manual only)
- 📊 **retro** — Performance analysis across 5 categories
- 🚀 **deploy** — Release pipeline (manual only)
- 🌐 **bridge** — External AI integration (manual only)
