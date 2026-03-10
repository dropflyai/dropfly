# Debugger Brain

The specialist brain for bug analysis, diagnosis, and resolution.

## Purpose

1. **Diagnose** bugs systematically using proven protocols
2. **Fix** bugs with verified, tested solutions
3. **Log** EVERY bug and fix to memory (mandatory)
4. **Learn** from patterns to prevent future bugs
5. **Consult** on similar past bugs before debugging

## When To Call This Brain

- Error thrown in production or development
- Test failing unexpectedly
- Unexpected behavior that needs root cause analysis
- Before attempting any debugging work

## Quick Start

```
1. Read CLAUDE.md for protocols
2. Query memory for similar bugs FIRST
3. Follow the Diagnostic Protocol
4. Apply fix with verification
5. LOG TO MEMORY (mandatory)
```

## Directory Structure

```
debugger_brain/
├── CLAUDE.md           # Operating system (read first)
├── README.md           # This file
├── 01_foundations/     # Debugging theory
├── 02_diagnosis/       # Diagnostic protocols
├── 03_fixes/           # Fix patterns
├── 04_patterns/        # Error patterns library
├── 05_logging/         # Logging protocols
├── Memory/             # Bug history
├── Patterns/           # Reusable patterns
├── Templates/          # Bug report templates
└── eval/               # Quality evaluation
```

## The Cardinal Rule

**EVERY BUG MUST BE LOGGED TO MEMORY.**

No exceptions. An unlogged fix is lost knowledge.

## Integration

- Logs to: Supabase `shared_experiences` table
- Tags: `debugger`, `error-type`, `framework`, `component`
- Query: Search before debugging to find similar past bugs
