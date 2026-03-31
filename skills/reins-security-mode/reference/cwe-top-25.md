# CWE Top 25 — Quick Reference

## Injection

| CWE | Name | Check |
|-----|------|-------|
| CWE-79 | XSS | User input rendered without escaping |
| CWE-89 | SQL Injection | String concatenation in SQL queries |
| CWE-78 | OS Command Injection | User input in shell commands |
| CWE-94 | Code Injection | eval(), exec() with user input |

## Memory Safety

| CWE | Name | Check |
|-----|------|-------|
| CWE-787 | Out-of-bounds Write | Buffer operations without bounds check |
| CWE-125 | Out-of-bounds Read | Array access without length check |
| CWE-416 | Use After Free | Pointer/reference after deallocation |
| CWE-476 | NULL Pointer Deref | Missing null checks |

## Authentication & Authorization

| CWE | Name | Check |
|-----|------|-------|
| CWE-287 | Improper Authentication | Missing or weak auth checks |
| CWE-863 | Incorrect Authorization | Missing permission checks |
| CWE-862 | Missing Authorization | Endpoints without auth |
| CWE-306 | Missing Critical Auth | Admin functions unprotected |

## Cryptography

| CWE | Name | Check |
|-----|------|-------|
| CWE-798 | Hardcoded Credentials | Passwords/keys in source |
| CWE-327 | Broken Crypto | MD5, SHA1, DES usage |
| CWE-330 | Insufficient Randomness | Math.random() for security |

## Data Handling

| CWE | Name | Check |
|-----|------|-------|
| CWE-22 | Path Traversal | User input in file paths |
| CWE-434 | Unrestricted Upload | File upload without validation |
| CWE-502 | Insecure Deserialization | Untrusted data deserialization |
| CWE-918 | SSRF | User-controlled URLs in requests |

## Other

| CWE | Name | Check |
|-----|------|-------|
| CWE-362 | Race Condition | Shared state without synchronization |
| CWE-269 | Improper Privilege Management | Running as root unnecessarily |
| CWE-400 | Uncontrolled Resource Consumption | No rate limiting |
| CWE-611 | XXE | XML parsing with external entities |
