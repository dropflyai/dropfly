# 🚨 UNSTOPPABLE TROUBLESHOOTING PROTOCOL

## 🔥 WHEN USER SAYS "RUN TROUBLESHOOTING PROTOCOL"

**This triggers an UNSTOPPABLE debugging sequence that continues until solution found**

### 🚨 CRITICAL RULES - NO EXCEPTIONS
- **NEVER give up** - troubleshooting continues until solved
- **NEVER repeat failed attempts** - if something didn't work, try different approach
- **ALWAYS log every step** - document what was tried and results
- **ALWAYS verify solution** - test thoroughly before declaring solved
- **ALWAYS prevent recurrence** - update code/docs to prevent future issues

## Phase 1: Immediate Assessment & Action Plan (MANDATORY)
1. **STOP all other work** - troubleshooting is now priority #1
2. **CREATE troubleshooting session log** → `.logs/YYYY-MM-DD-troubleshooting.md`
3. **DOCUMENT exact problem** with error messages, context, environment
4. **CREATE action plan** with systematic investigation steps
5. **SET "no-stop" commitment** - we don't quit until solved

## Phase 2: Systematic Investigation (Never Stop Until Solved)

**Follow this decision tree in EXACT order - log every step:**

### 1. CHECK EXISTING SOLUTIONS (MANDATORY FIRST STEP)
- **CHECK `.troubleshoot/`** → Has this exact problem been solved before?
- **CHECK `.logs/`** → What was tried in previous sessions?
- **CHECK `.progress/`** → Has this task already been completed?
- **CHECK `.research/`** → Has this information already been gathered?
- If found → Apply previous solution, verify, document outcome

### 2. IDENTIFY ERROR TYPE & PATTERN
```
ERROR OCCURS
    ↓
IDENTIFY CATEGORY:
   ├─ Build/Compile Error → Check Dependencies
   ├─ Runtime Error → Check Logs & Console
   ├─ Network Error → Check API/Endpoints
   ├─ Database Error → Check Schema/Migrations
   ├─ Deployment Error → Check Environment
   └─ UI/UX Issue → Check Browser Console
```

### 3. SYSTEMATIC DIAGNOSIS
- **READ FULL error message** (don't skip details)
- **NOTE error code/line number** exactly
- **CHECK recent changes** in git diff
- **ISOLATE the problem** to specific component/function

### 4. FRAMEWORK/DEPENDENCY ANALYSIS
- **CHECK `IMPLEMENTATION-PATTERNS.md`** → Is there a known pattern?
- **CHECK `TROUBLESHOOTING-PROCESS.md`** → Standard solutions?
- **CHECK package.json versions** → Dependency conflicts?
- **CHECK framework documentation** → Breaking changes?
- **CHECK environment variables** → Missing configs?

### 5. CODE LOGIC INVESTIGATION
- **ANALYZE recent changes** → What was modified?
- **REVIEW git diff** → Suspicious modifications?
- **TEST individual components** → Isolate failure point?
- **TRACE execution flow** → Where does it break?

### 6. ENVIRONMENT INVESTIGATION  
- **CHECK .env files** → Missing variables?
- **CHECK deployment configuration** → Production vs local?
- **CHECK browser/system compatibility** → Version issues?
- **CHECK network connectivity** → API reachable?

## Phase 3: Advanced Debugging (When Standard Steps Fail)

**If problem persists after Phase 2 - escalate investigation:**

### 7. DEEP CODE ANALYSIS
- **TRACE execution flow** step by step
- **ADD debugging logs** to identify failure point
- **ISOLATE problem** to specific function/component
- **TEST edge cases** and boundary conditions

### 8. EXTERNAL RESEARCH
- **SEARCH Stack Overflow** for exact error message
- **CHECK official documentation** for framework/library
- **RESEARCH GitHub issues** for similar problems
- **ANALYZE community solutions** and adaptations

### 9. EXPERIMENTAL SOLUTIONS
- **TRY alternative approaches** with different methods
- **TEST edge cases** and boundary conditions
- **EXPERIMENT with configurations** and settings
- **IMPLEMENT workarounds** if direct fix unavailable

## Phase 4: Solution Implementation & Prevention

**Once solution found:**

### 10. IMPLEMENT & VERIFY
- **IMPLEMENT fix** with thorough testing
- **VERIFY solution works** in all scenarios
- **TEST edge cases** to ensure robustness
- **CONFIRM no side effects** introduced

### 11. DOCUMENT & PREVENT
- **DOCUMENT complete solution** in `.troubleshoot/issue-XXX.md`
- **UPDATE prevention measures** to avoid recurrence
- **COMMIT working solution** with detailed explanation
- **UPDATE troubleshooting knowledge base**

## 🚨 TROUBLESHOOTING SESSION LOG TEMPLATE

**Create this file: `.logs/YYYY-MM-DD-troubleshooting.md`**

```markdown
# 🚨 TROUBLESHOOTING SESSION: YYYY-MM-DD

## PROBLEM STATEMENT
- Error: [exact error message]
- Context: [what was happening when error occurred]
- Environment: [local/staging/production]
- Severity: [blocker/critical/major/minor]

## 🔥 COMMITMENT: This session will not end until problem is SOLVED

## INVESTIGATION LOG

### Step 1: [timestamp] - Check Existing Solutions
- **Action taken:** [what was checked in .troubleshoot/, .logs/]
- **Result:** [what was found or not found]
- **Next step:** [what to try next based on findings]

### Step 2: [timestamp] - Error Type Identification
- **Action taken:** [how error was categorized]
- **Result:** [category identified and reasoning]
- **Next step:** [specific investigation approach]

### Step 3: [timestamp] - Framework Analysis
- **Action taken:** [what was analyzed - patterns, docs, etc.]
- **Result:** [findings and relevance]
- **Next step:** [next investigation step]

### Step 4: [timestamp] - Code Logic Investigation
- **Action taken:** [code analysis performed]
- **Result:** [what was discovered]
- **Next step:** [further investigation needed]

### Step 5: [timestamp] - Environment Investigation
- **Action taken:** [environment checks performed]
- **Result:** [configuration issues found/ruled out]
- **Next step:** [escalation to advanced debugging]

[Continue logging EVERY step until solution found]

## 🎯 SOLUTION FOUND
- **Root cause:** [what actually caused the issue]
- **Fix applied:** [exact solution implemented]
- **Verification:** [how solution was tested and confirmed]
- **Prevention:** [measures added to prevent recurrence]

## 📚 KNOWLEDGE BASE UPDATE
- **Updated file:** [which .troubleshoot/ file was created/updated]
- **Pattern identified:** [reusable pattern for future issues]
- **Prevention measures:** [what was added to prevent this type of issue]

## ✅ SESSION OUTCOME: PROBLEM SOLVED
- **Time spent:** [total debugging time]
- **Key learnings:** [what was learned for future]
- **Documentation complete:** [yes/no]
```

## DECISION TREE FOR COMMON ERRORS

### Build/Compile Errors
**Check First:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version compatibility
node --version

# Check for type errors
npm run typecheck

# Check for missing dependencies
npm ls
```

**Common Solutions:**
- Missing dependency → `npm install [package]`
- Version conflict → Check package.json versions
- TypeScript error → Check tsconfig.json
- Module not found → Check import paths

### Runtime Errors
**Check First:**
```bash
# Check environment variables
cat .env.local

# Check API endpoints
curl -X GET [endpoint]

# Check browser console (DevTools → Console)
# Check network tab for failed requests
```

**Common Solutions:**
- Undefined variable → Check initialization
- Null reference → Add null checks
- Async error → Add await/then/catch
- CORS error → Check API headers

### Database Errors
**Check First:**
```sql
-- Check migrations status
SELECT * FROM schema_migrations;

-- Check table structure
\d table_name

-- Check connections
SELECT count(*) FROM pg_stat_activity;
```

**Common Solutions:**
- Migration failed → Rollback and retry
- Connection timeout → Check pool settings
- Permission denied → Check RLS policies
- Constraint violation → Check data types

## EMERGENCY ESCALATION PROTOCOL

**If problem cannot be solved after extensive Phase 3 investigation:**

1. **DOCUMENT ALL ATTEMPTS** in troubleshooting log
2. **CREATE detailed reproduction steps** 
3. **ESCALATE to senior developer** with complete log
4. **CONTINUE working on alternative solutions** while awaiting help
5. **NEVER abandon the problem** - always return to solve it

## EFFICIENCY METRICS & TIME LIMITS

**Phase Time Limits:**
- Phase 1 (Assessment): 5 minutes max
- Phase 2 (Systematic): 30 minutes max
- Phase 3 (Advanced): 60 minutes max
- Phase 4 (Implementation): 15 minutes max

**If time limits exceeded:**
- Document all attempts
- Move to emergency escalation
- Try completely different approach
- Never repeat failed attempts

## PREVENTION CHECKLIST

After EVERY solved issue, complete this checklist:

- [ ] Solution documented in `.troubleshoot/issue-XXX.md`
- [ ] Root cause analysis completed
- [ ] Prevention measures implemented
- [ ] Code/configuration updated to prevent recurrence  
- [ ] Team knowledge base updated
- [ ] Similar issues identified and cross-referenced
- [ ] Future debugging aids added (logs, tests, etc.)

## THE GOLDEN RULES

1. **NEVER give up** - Every problem has a solution
2. **NEVER repeat failed attempts** - Try different approaches
3. **ALWAYS check existing solutions first** - 50% chance it's solved
4. **ALWAYS log every step** - Future you will thank you
5. **ALWAYS verify the fix thoroughly** - Don't create new problems
6. **ALWAYS prevent recurrence** - Fix the root cause, not symptoms
7. **ALWAYS update documentation** - Help future developers

## REMEMBER: THIS IS AN UNSTOPPABLE PROCESS

**When "run troubleshooting protocol" is triggered:**
- All other work stops
- Problem becomes priority #1  
- Process continues until solution found
- No giving up or "good enough" solutions
- Complete documentation required
- Prevention measures mandatory

**The goal is not just to fix the immediate problem, but to ensure it never happens again.**