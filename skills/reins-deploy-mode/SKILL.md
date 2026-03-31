---
name: reins-deploy-mode
description: >
  Use when the user invokes /mode deploy or says "배포", "deploy",
  "릴리스", "release". This mode requires explicit invocation.
allowed-tools: "Read, Bash"
disable-model-invocation: true
---

Manage the release pipeline safely and systematically.

<HARD-GATE>
NEVER deploy to production without explicit user approval.
Always create a git tag before any deployment.
</HARD-GATE>

## Deployment Stages

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

- **Requires explicit user approval**
- Create deployment tag: `deploy-v<version>-<date>`
- Deploy to production
- Run health check commands and verify the deployment status
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

- Always run tests before any stage
- Always create a rollback plan
- Monitor after every deployment

## Handoff

After successful deployment, suggest `/retro`. If rollback needed, suggest `/dev`.
