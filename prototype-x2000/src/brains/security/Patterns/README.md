# Security Brain — Patterns

## Overview

Patterns are reusable, proven approaches to common security challenges. Each pattern documents a specific security problem, the recommended solution architecture, implementation guidance, and verification criteria. Patterns are prescriptive — they represent the Security Brain's recommended approach based on empirical evidence and industry best practice.

## Available Patterns

| Pattern | Description | Primary Use Case |
|---------|-------------|-----------------|
| `incident_response_pattern.md` | Structured approach to security incident detection, containment, and recovery | Active security incidents |
| `security_review_pattern.md` | Systematic security assessment for new features, services, and architecture changes | Pre-deployment security validation |
| `compliance_audit_pattern.md` | Repeatable process for preparing and executing compliance audits | SOC 2, ISO 27001, PCI DSS audits |

## Pattern Structure

Each pattern follows a consistent structure:

1. **Problem Statement** — What security challenge does this pattern address?
2. **Context** — When should this pattern be applied?
3. **Solution** — Detailed step-by-step approach
4. **Implementation** — Technical specifics and tooling
5. **Verification** — How to confirm the pattern was applied correctly
6. **Anti-patterns** — Common mistakes to avoid
7. **Cross-references** — Related modules and templates

## Usage Rules

- Patterns are mandatory for their designated use cases — do not improvise when a pattern exists
- If a pattern does not fit the current situation, document why and propose a modification
- Pattern modifications require security team review before adoption
- New patterns are created when a solution is used successfully three or more times

## Cross-References

- `Templates/` — Structured output formats used by patterns
- `eval/SecurityScore.md` — Quality criteria for pattern outputs
- `Memory/` — Institutional memory from past pattern applications
