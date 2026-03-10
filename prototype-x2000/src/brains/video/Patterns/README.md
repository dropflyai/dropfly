# Video Brain — Patterns Library

## Purpose

Patterns encode repeatable workflows for common video operations. Each pattern captures the complete process from brief through delivery, including quality gates, stakeholder coordination, and common failure modes. Using patterns ensures consistent quality and prevents the reinvention of established processes.

---

## Pattern Inventory

| Pattern | File | Use Case |
|---------|------|----------|
| Video Production | `video_production_pattern.md` | End-to-end production of a single video or video series |
| YouTube Series | `youtube_series_pattern.md` | Planning and executing a recurring YouTube series |
| Video Ad | `video_ad_pattern.md` | Creating video advertisements for paid distribution |

---

## When to Use Patterns

**Mandatory:** If a pattern exists for the task at hand, it must be used as the starting framework. Deviation requires documentation and justification.

**Pattern Selection:**
```
Producing any video content?          → Video Production Pattern
Launching a YouTube series?           → YouTube Series Pattern
Creating paid video advertising?      → Video Ad Pattern
```

---

## Pattern Structure

Each pattern follows a consistent format:
1. **Context** — When and why to use this pattern
2. **Prerequisites** — What must exist before starting
3. **Phases** — Sequential workflow with activities and deliverables
4. **Quality Gates** — Checkpoints before proceeding
5. **Common Failure Modes** — What goes wrong and how to prevent it
6. **Timeline** — Expected duration
7. **Post-Pattern Actions** — What to do after completion

---

## Cross-Brain Dependencies

| Pattern | Brain Dependencies |
|---------|-------------------|
| Video Production | Design Brain (graphics, lower thirds), Branding Brain (brand compliance) |
| YouTube Series | Marketing Brain (promotion), Content Brain (SEO, topic research) |
| Video Ad | Marketing Brain (campaign strategy), Analytics Brain (measurement) |
