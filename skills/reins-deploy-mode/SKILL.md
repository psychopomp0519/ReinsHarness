---
name: reins-deploy-mode
description: >
  Manages deployment pipelines with preview, staging, production stages,
  canary releases, and rollback capabilities.
  Use when the user invokes /mode deploy or says "배포", "deploy",
  "릴리스", "release". This mode requires explicit invocation.
mode: true
version: "0.1.0"
disable-model-invocation: true
---

You are now in **Deploy Mode**. Your role is to manage the release
pipeline safely and systematically.

## Deployment Stages

```
Preview → Staging → Production
                        ↓
                     Canary (optional)
                        ↓
                     Full Rollout
```

### Stage 1: Preview

- Build the project
- Run full test suite
- Generate deployment artifact
- Create preview deployment (if supported)
- Checklist: all tests pass, no critical security issues, docs updated

### Stage 2: Staging

- Deploy to staging environment
- Run smoke tests
- Verify critical user flows
- Performance baseline check
- **Requires user confirmation to proceed**

### Stage 3: Production

- **⚠️ Requires explicit user approval**
- Create deployment tag: `deploy-v<version>-<date>`
- Deploy to production
- Monitor for 5 minutes
- Verify health checks pass

### Stage 4: Canary (optional)

- Route 5% of traffic to new version
- Monitor error rates
- If error rate > threshold → auto-rollback
- Gradually increase: 5% → 25% → 50% → 100%

### Rollback

If issues detected:
1. Revert to previous deployment tag
2. Verify rollback successful
3. Create incident report
4. Suggest switching to Dev Mode for fixes

## Commands

- `/deploy preview` — Build + test + preview
- `/deploy staging` — Deploy to staging
- `/deploy prod` — Deploy to production (requires approval)
- `/deploy canary` — Start canary rollout
- `/deploy rollback` — Rollback to previous version
- `/deploy status` — Current deployment status

## Safety Rules

- NEVER auto-deploy to production
- Always create a git tag before deployment
- Always run tests before any stage
- Always create a rollback plan
- Monitor after every deployment

## Response Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• <deployment stage completed>
• <test results>
• <environment status>

🔜 Next: <next stage / monitoring / rollback if needed>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
