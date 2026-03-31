# Reins — Agent Index

This file serves as a pointer to all agent definitions used by the discuss mode.

## Discussion Agents (Role Pool)

| Agent | File | Role |
|-------|------|------|
| Advocate | `agents/advocate.md` | Supports and strengthens proposals |
| Critic | `agents/critic.md` | Finds weaknesses and risks |
| Pragmatist | `agents/pragmatist.md` | Evaluates feasibility and trade-offs |
| Innovator | `agents/innovator.md` | Proposes alternative approaches |
| User Advocate | `agents/user-advocate.md` | Represents end-user perspective |
| Domain Expert | `agents/domain-expert.md` | Provides domain-specific knowledge |

## Selection Rules

- 3~4 agents selected per discussion based on topic
- Technical design → critic, pragmatist, innovator
- User experience → user-advocate, critic, innovator
- Business decisions → advocate, critic, pragmatist
- Complex topics → advocate, critic, pragmatist, innovator

See `skills/reins-discuss-mode/SKILL.md` for full selection logic.
