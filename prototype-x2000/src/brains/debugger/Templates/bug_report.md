# Bug Report Template

Copy this template when logging a new bug.

---

# Bug Log: [Brief Description]

**Date:** YYYY-MM-DD
**Project:** [Project Name]
**Severity:** CRITICAL | HIGH | MEDIUM | LOW
**Status:** OPEN | IN PROGRESS | FIXED | WONT FIX

## Error

```
[Paste exact error message here]
```

## Stack Trace

```
[Paste stack trace if available]
```

## Location
- **File:**
- **Line:**
- **Function:**

## Environment
- **Platform:** iOS | Android | Web | Server
- **Version:**
- **Device/Browser:**
- **OS:**

## Context
[What was the user/system doing when this occurred?]

## Reproduction Steps
1.
2.
3.

## Expected Behavior
[What should have happened]

## Actual Behavior
[What actually happened]

## Root Cause Analysis
[Why did this bug occur?]

## Fix Applied
```
[Code diff or description of changes]
```

## Verification
- [ ] Original reproduction no longer triggers bug
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual verification complete

## Regression Risk
[What else could this fix break?]

## Prevention
[How can we prevent this in future?]
- [ ] Added test case
- [ ] Added type check
- [ ] Added validation
- [ ] Updated documentation
- [ ] Other:

## Time Spent
- Diagnosis:
- Fix:
- Verification:
- Total:

## Tags
`[tag1]` `[tag2]` `[tag3]`

## Related
- Related bugs:
- Related PRs:
- Related docs:

---

## Logged To
- [ ] Project `.claude/` directory
- [ ] Supabase `shared_experiences`
- [ ] Pattern library (if recurring)
