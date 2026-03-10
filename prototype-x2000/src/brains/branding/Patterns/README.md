# Branding Brain — Patterns Library

## Purpose

Patterns are reusable, proven workflows for common brand operations. Each pattern encapsulates institutional knowledge about sequencing, stakeholder management, quality gates, and common failure modes. Patterns reduce execution risk by codifying what has worked before.

---

## Pattern Inventory

| Pattern | File | Use Case |
|---------|------|----------|
| Brand Launch | `brand_launch_pattern.md` | Launching a new brand from scratch |
| Rebrand | `rebrand_pattern.md` | Full rebrand including name change or fundamental repositioning |
| Brand Extension | `brand_extension_pattern.md` | Extending an existing brand into new products, markets, or categories |

---

## When to Use Patterns

**Mandatory:** If a pattern exists for the task at hand, you MUST use it as the starting framework. Deviation from patterns must be documented and justified.

**Pattern Selection Logic:**
```
New brand for new entity?           → Brand Launch Pattern
Existing brand no longer viable?    → Rebrand Pattern
Existing brand entering new space?  → Brand Extension Pattern
```

---

## Pattern Structure

Each pattern follows a consistent structure:

1. **Context:** When this pattern applies
2. **Prerequisites:** What must be true before starting
3. **Phases:** Sequential steps with deliverables
4. **Quality Gates:** Checkpoints that must be passed before proceeding
5. **Common Failure Modes:** What typically goes wrong and how to prevent it
6. **Stakeholder Map:** Who must be involved at each phase
7. **Timeline:** Expected duration for each phase
8. **Outputs:** Final deliverables produced by the pattern

---

## Pattern Governance

- Patterns are living documents updated based on execution experience
- After each pattern execution, conduct a retrospective and update the pattern
- Log pattern usage and outcomes in `Memory/README.md`
- Proposed pattern changes require review by the Brand Brain authority hierarchy

---

## Cross-Brain Pattern Dependencies

Some brand patterns require coordination with other specialist brains:

| Pattern | Brain Dependencies |
|---------|-------------------|
| Brand Launch | Design Brain (visual identity), Engineering Brain (digital implementation), Marketing Brain (launch campaign) |
| Rebrand | Legal Brain (trademark), Engineering Brain (migration), All customer-facing brains |
| Brand Extension | Product Brain (product strategy), MBA Brain (business case), Marketing Brain (go-to-market) |

---

## Adding New Patterns

To add a new pattern:
1. Identify a recurring brand workflow that would benefit from codification
2. Document the workflow following the standard pattern structure
3. Validate against at least two historical executions
4. Submit for review through the brand governance process
5. Add to this README inventory
