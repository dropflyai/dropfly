# Mobile Brain — Patterns Index

## Purpose

This directory contains proven architectural patterns for common mobile
development challenges. Each pattern is documented with context, structure,
implementation guidance for all platforms, and known trade-offs.

Patterns are not suggestions — they are proven solutions. When a challenge
matches a pattern's context, the pattern MUST be used unless a documented
exception applies.

---

## Available Patterns

| Pattern | File | Use When |
|---------|------|----------|
| Offline-First | `offline_first_pattern.md` | App must work without network connectivity |
| Authentication Flow | `auth_flow_pattern.md` | App requires user authentication |
| Deep Linking | `deep_linking_pattern.md` | App must handle URLs, notifications, or external navigation |

---

## Pattern Format

Each pattern follows this structure:

1. **Context**: When does this pattern apply?
2. **Problem**: What challenge does it solve?
3. **Solution**: The architectural approach
4. **Implementation**: Platform-specific code and configuration
5. **Trade-offs**: What you gain and what you give up
6. **Known pitfalls**: Common mistakes when implementing
7. **References**: Source material and further reading

---

## Adding New Patterns

When a mobile development challenge is solved and the solution is
generalizable, it MUST be captured as a pattern:

1. Verify the solution has been validated in production
2. Document following the pattern format above
3. Add to this index
4. Log the addition in `Memory/README.md`

---

**Patterns are institutional memory. Document them. Use them. Evolve them.**
