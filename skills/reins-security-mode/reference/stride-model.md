# STRIDE Threat Model — Quick Reference

## Overview

STRIDE is a threat modeling framework. Apply each category to every
component, data flow, and trust boundary in the system.

## Categories

### S — Spoofing (Identity)

**Question**: Can an attacker pretend to be someone/something else?

Check:
- Authentication mechanisms present and strong
- Session tokens properly validated
- API keys rotated and scoped
- Certificate validation enforced

### T — Tampering (Integrity)

**Question**: Can data be modified without detection?

Check:
- Input validation at trust boundaries
- Data integrity checks (checksums, signatures)
- Database constraints enforced
- Audit logging for mutations

### R — Repudiation (Non-repudiation)

**Question**: Can a user deny performing an action?

Check:
- Audit logs for critical operations
- Logs tamper-proof (append-only, signed)
- Timestamps from trusted source
- User actions attributable

### I — Information Disclosure (Confidentiality)

**Question**: Can sensitive data be exposed?

Check:
- Encryption in transit (TLS)
- Encryption at rest (sensitive fields)
- Error messages don't leak internals
- Logs don't contain secrets
- Access controls on data queries

### D — Denial of Service (Availability)

**Question**: Can the service be disrupted?

Check:
- Rate limiting on public endpoints
- Input size limits
- Timeout configurations
- Resource pool limits (connections, threads)
- Graceful degradation

### E — Elevation of Privilege (Authorization)

**Question**: Can a user gain unauthorized access?

Check:
- Principle of least privilege
- Role-based access control
- No privilege escalation paths
- Admin functions properly gated
- API permissions scoped correctly
