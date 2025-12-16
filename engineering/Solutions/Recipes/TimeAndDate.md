# TIME AND DATE
**Authoritative Retrieval Recipe**

---

## Problem

Incorrect or assumed time/date causes:
- invalid logs
- broken migrations
- incorrect comparisons
- misleading debugging output
- inconsistent automation behavior

Assumed time is not reliable and must never be used.

---

## Golden Rule

> **Time and date must always be retrieved from an authoritative source.**

Guessing is forbidden.

---

## Approved Authorities

One of the following MUST be used:

### Local System
- `date` (Unix/macOS/Linux)
- `Get-Date` (PowerShell)

### Node.js
```js
new Date().toISOString()
```

### Python
```python
from datetime import datetime, timezone
datetime.now(timezone.utc).isoformat()
```

### Cloud / CI Environments
- Provider runtime clock
- CI environment timestamp

---

## Canonical Output Format

All retrieved time/date must include:
- ISO 8601 format
- timezone context

Example:
```
2025-03-08T21:34:12Z (UTC)
```

---

## Forbidden Behavior

The following is explicitly disallowed:
- assuming today's date
- inferring time from conversation context
- reusing previously mentioned timestamps
- saying "today" or "now" without retrieval

Any instance of this is a correctness failure.

---

## Verification

When time/date is used in a decision or output:
- show the retrieval method
- show the exact value retrieved

If this cannot be done, stop and report failure.

---

## Regression Handling

If an incorrect or assumed time/date is detected:
- log a regression in Engineering/Solutions/Regressions.md
- reference this recipe as the enforced fix

---

## References

- Engineering/Solutions/ToolAuthority.md
- Engineering/Solutions/GoldenPaths.md
- Engineering/Solutions/SolutionIndex.md

---

**This recipe is mandatory and enforced.**
