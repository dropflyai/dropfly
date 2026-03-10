# QA Brain -- Patterns

## Purpose

This directory contains reusable test architecture patterns that encode proven solutions to recurring quality engineering challenges. Each pattern is a self-contained document describing a problem, context, solution, implementation guidance, and known trade-offs.

---

## Pattern Index

| Pattern | File | Problem It Solves |
|---------|------|-------------------|
| Test Pyramid Pattern | `test_pyramid_pattern.md` | How to structure test automation investment across unit, integration, and E2E layers for maximum ROI |
| Regression Prevention Pattern | `regression_prevention_pattern.md` | How to prevent previously-fixed defects from recurring while keeping the regression suite maintainable |
| Quality Gate Pattern | `quality_gate_pattern.md` | How to enforce objective, quantitative release criteria at every stage of the deployment pipeline |

---

## How to Use Patterns

1. **Identify the problem**: What quality challenge are you facing?
2. **Find the matching pattern**: Check this index for a pattern that addresses your problem
3. **Adapt to context**: Patterns are guidelines, not prescriptions. Adapt thresholds, tooling, and process to your team's context
4. **Validate effectiveness**: After implementing a pattern, measure whether it actually solves the problem
5. **Contribute back**: If you discover a new pattern or improve an existing one, update this directory

---

## Pattern Format

Each pattern follows this structure:

- **Problem**: The specific quality challenge this pattern addresses
- **Context**: When this pattern applies (and when it does not)
- **Solution**: The pattern's approach with implementation details
- **Consequences**: Trade-offs, maintenance burden, and known limitations
- **Related Patterns**: Other patterns that complement or conflict with this one
