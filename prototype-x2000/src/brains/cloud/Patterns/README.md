# Cloud Brain — Patterns

## Overview

Patterns are reusable, proven approaches to common cloud architecture and operations challenges. Each pattern documents a specific problem, the recommended solution architecture, implementation guidance, and verification criteria. Patterns are prescriptive — they represent the Cloud Brain's recommended approach based on empirical evidence, AWS Well-Architected Framework principles, and industry best practices.

## Available Patterns

| Pattern | Description | Primary Use Case |
|---------|-------------|-----------------|
| `microservices_deployment_pattern.md` | Structured approach to deploying microservices safely with rolling updates, canary, and blue-green strategies | Production deployments |
| `disaster_recovery_pattern.md` | Systematic DR planning, implementation, and testing for multi-AZ and multi-region architectures | Business continuity |
| `cost_optimization_pattern.md` | Repeatable process for identifying and implementing cloud cost savings | Quarterly cost reviews |

## Pattern Structure

Each pattern follows a consistent structure:

1. **Problem Statement** — What challenge does this pattern address?
2. **Context** — When should this pattern be applied?
3. **Solution** — Detailed step-by-step approach
4. **Implementation** — Technical specifics and tooling
5. **Verification** — How to confirm the pattern was applied correctly
6. **Anti-patterns** — Common mistakes to avoid
7. **Cross-references** — Related modules and templates

## Usage Rules

- Patterns are mandatory for their designated use cases
- If a pattern does not fit, document why and propose a modification
- Pattern modifications require architecture review
- New patterns are created when a solution is used successfully three or more times

## Cross-References

- `Templates/` — Structured output formats used by patterns
- `eval/` — Quality criteria for pattern outputs
- `Memory/` — Institutional memory from past pattern applications
