# Anti-Patterns Reference Index

This directory catalogs engineering anti-patterns across four domains: architecture,
code quality, process, and tooling. Each document provides PhD-level analysis grounded
in peer-reviewed research and canonical practitioner literature.

## Purpose

Anti-pattern literacy is a prerequisite for engineering excellence. These documents serve
three functions:

1. **Detection** -- providing concrete signals that an anti-pattern is present.
2. **Recovery** -- providing incremental remediation paths, not rewrites.
3. **Prevention** -- providing guardrails that stop anti-patterns from forming.

## File Index

| Category | File | Anti-Patterns Covered | Key References |
|----------|------|-----------------------|----------------|
| Architecture | `Architecture.md` | Big Ball of Mud, Distributed Monolith, God Object, Shared Database, Premature Abstraction, Anemic Domain Model | Foote & Yoder (1997), Evans (2003), Fowler (2003), Hohpe & Woolf (2003), Metz (2014) |
| Code Quality | `CodeQuality.md` | Premature Optimization, Copy-Paste Programming, Magic Numbers/Strings, Null Reference, Callback Hell, Dead Code Accumulation, Shotgun Surgery | Knuth (1974), Hoare (2009), Hunt & Thomas (1999), Fowler (1999), Juergens et al. (2009) |
| Process | `Process.md` | Cowboy Coding, Cargo Cult Agile, Death March, Hero Culture, Bus Factor 1, Documentation Debt | Brooks (1975), DeMarco & Lister (1987), Forsgren et al. (2018), Yourdon (2003) |
| Tooling | `Tooling.md` | Tool Sprawl, NIH Syndrome, Vendor Lock-In, YAML Engineering, Secret Sprawl, Alert Fatigue, Environment Drift | Beyer et al. (2016), Humble & Farley (2010), Morris (2016), Kim et al. (2016) |

## Relationship to Evaluation Scoring

The engineering evaluation rubric (`../eval/`) scores each domain on a 1-10 scale.
Anti-pattern presence directly impacts scores:

- **Score 8-10**: No active anti-patterns; prevention guardrails enforced in CI.
- **Score 5-7**: Anti-patterns identified with active remediation plans and timelines.
- **Score 3-4**: Anti-patterns present without remediation; team is aware but not acting.
- **Score 1-2**: Multiple anti-patterns present; team is unaware or in denial.

Each anti-pattern document's "Practical Implications" section maps its contents to
specific evaluation criteria.

## Cross-References

Anti-patterns interact across domains. Key relationships:

- **Hero Culture** (Process) amplifies **Bus Factor 1** (Process) and **God Object** (Architecture).
- **Cowboy Coding** (Process) prevents detection of **Code Quality** anti-patterns entirely.
- **Tool Sprawl** (Tooling) enables **Environment Drift** (Tooling) and **Secret Sprawl** (Tooling).
- **Death March** (Process) accelerates **Big Ball of Mud** (Architecture) and **Dead Code Accumulation** (Code Quality).

Detection and remediation must be systemic. Addressing one domain while ignoring others
shifts entropy rather than reducing it.
