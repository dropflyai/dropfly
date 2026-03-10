# Product Brain — Patterns

## What This Directory Contains

Reusable product management patterns — proven, repeatable playbooks for common product situations. Each pattern captures the distilled wisdom of experienced product leaders applied to a specific, recurring scenario. Patterns are not theoretical frameworks; they are operational playbooks that a PM can follow when facing a specific situation.

---

## Pattern Philosophy

A pattern is a proven solution to a recurring problem in a specific context. The concept originates from Christopher Alexander's architectural patterns (A Pattern Language, 1977) and was adapted for software engineering by the Gang of Four (Design Patterns, 1994). Product management patterns follow the same logic: certain situations arise repeatedly across products, industries, and companies, and there are proven approaches that consistently produce better outcomes than ad-hoc improvisation.

---

## Pattern Structure

Each pattern follows a consistent structure:

```
PATTERN: [Name]

Context:      When does this pattern apply?
Problem:      What challenge does it address?
Forces:       What tensions make this problem difficult?
Solution:     What is the proven approach?
Execution:    Step-by-step implementation guide
Metrics:      How do you measure success?
Anti-Patterns: What common mistakes should you avoid?
Examples:     Real-world applications
```

---

## Available Patterns

### Core Product Patterns

| Pattern | File | When to Use |
|---------|------|-------------|
| Feature Launch Pattern | `feature_launch_pattern.md` | Launching any new feature from planning through post-launch review |
| Product Discovery Pattern | `product_discovery_pattern.md` | Exploring a new opportunity area to decide what to build |
| Pivot Pattern | `pivot_pattern.md` | When current strategy is not working and direction change is needed |

---

## How to Use Patterns

### Pattern Selection

1. **Identify the situation** — what product challenge are you facing?
2. **Match the pattern** — which pattern addresses this type of situation?
3. **Adapt the pattern** — patterns are templates, not rigid prescriptions; adjust for your context
4. **Execute the steps** — follow the execution guide, modifying as your situation demands
5. **Measure the outcome** — use the pattern's metrics to evaluate success
6. **Contribute back** — if you discover improvements, update the pattern

### Pattern Composition

Patterns can be composed. A major product initiative might use:

```
Product Discovery Pattern (to identify the opportunity)
    -> Feature Launch Pattern (to bring it to market)
        -> Lifecycle Management (to manage post-launch)
            -> Pivot Pattern (if the initial approach fails)
```

---

## Pattern vs Framework vs Template

| Artifact | Purpose | Level of Abstraction | Example |
|----------|---------|---------------------|---------|
| **Framework** | Mental model for thinking about a class of problems | High — conceptual | RICE scoring, AARRR funnel |
| **Pattern** | Proven approach to a specific recurring situation | Medium — strategic + tactical | Feature Launch Pattern |
| **Template** | Fill-in-the-blank document for a specific deliverable | Low — operational | PRD Template, Launch Checklist |

Patterns sit between frameworks (conceptual) and templates (operational). They tell you WHAT to do and in what order, while templates give you the specific documents to produce along the way.

---

## Pattern Development

### How New Patterns Are Created

```
1. A PM encounters a situation and handles it (well or poorly)
2. The same situation recurs across multiple products or teams
3. The common elements are extracted and generalized
4. The approach is validated across multiple instances
5. The pattern is documented with context, solution, and anti-patterns
6. The pattern is reviewed and refined based on team feedback
```

### Pattern Quality Criteria

| Criterion | Definition |
|-----------|-----------|
| **Recurring** | The situation arises frequently enough to warrant a pattern |
| **Proven** | The solution has been validated in multiple real-world contexts |
| **Actionable** | A PM can follow the steps without extensive interpretation |
| **Adaptable** | The pattern works across different product types and team sizes |
| **Measurable** | Success can be evaluated with defined metrics |

---

## Cross-References

Patterns reference modules in the Product Brain curriculum:

| Pattern Element | Reference Module |
|----------------|-----------------|
| Customer research methods | `03_user_research/` |
| Prioritization | `04_roadmapping/prioritization_frameworks.md` |
| PRD creation | `05_specifications/prd_writing.md` |
| Metrics definition | `06_metrics/product_metrics.md` |
| Experimentation | `06_metrics/experimentation.md` |
| Growth strategy | `07_growth_product/` |
| Launch execution | `08_launch/` |
| Technical decisions | `09_technical_pm/` |

---

## Pattern Maintenance

Patterns are living documents. They should be reviewed and updated:

- **After every major launch** — did the Feature Launch Pattern work? What should change?
- **After every pivot** — did the Pivot Pattern help? What was missing?
- **Quarterly** — are patterns still relevant? Are new patterns needed?

---

## Summary

Product patterns are the playbook layer of the Product Brain — proven, repeatable approaches to common product management situations that sit between abstract frameworks (RICE, AARRR) and concrete templates (PRD, checklist). Each pattern captures context, problem, solution, execution steps, metrics, and anti-patterns. Patterns are not rigid prescriptions; they are adaptable guides that improve with each use. The patterns in this directory address the three most common product scenarios: launching a feature, discovering what to build, and pivoting when the current direction fails.
