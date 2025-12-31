# SYSTEM PROTOCOLS & CRASH RECOVERY FRAMEWORK

## 🚨 MANDATORY FIRST ACTION - READ SYSTEM INSTRUCTIONS

### RULE #0: READ INSTRUCTIONS FIRST (ALWAYS!)
**BEFORE DOING ANYTHING:**
1. **ALWAYS** read `/SYSTEM-USAGE-INSTRUCTIONS.md` first
2. **ALWAYS** check `/LEARNING-GROWTH/user-preferences.md`
3. **ALWAYS** review `/LEARNING-GROWTH/failed-approaches.md` - DO NOT REPEAT
4. **ALWAYS** search before creating anything

### RULE #1: SAVE IMMEDIATELY, ASK QUESTIONS LATER
When the user provides ANY of the following, save IMMEDIATELY to appropriate location:
- API Keys/Tokens → `/CRITICAL-RESOURCES/api-keys.md`
- URLs/Endpoints → `/CRITICAL-RESOURCES/urls-endpoints.md`
- CLI Commands → `/CRITICAL-RESOURCES/cli-commands.md`
- Source Code → `/CRITICAL-RESOURCES/source-code/`
- Credentials → `/CRITICAL-RESOURCES/credentials.md` (encrypted reference only)
- Configuration → `/CRITICAL-RESOURCES/configurations/`

### RULE #2: SEARCH BEFORE CREATE
**MANDATORY STEPS:**
1. **ALWAYS** use Glob/Grep to search for existing files/structures
2. **ALWAYS** read existing files before modifying
3. **NEVER** recreate from scratch without explicit user permission
4. **DOCUMENT** what was found in search results

### RULE #3: CRASH RECOVERY PROTOCOL
**Every 5 minutes or after major changes:**
1. Save current state to `/CRASH-RECOVERY/checkpoint-[timestamp].md`
2. Include:
   - Current task being worked on
   - Files modified with line numbers
   - Commands executed
   - Errors encountered
   - Next steps planned

---

## 📁 MANDATORY FOLDER STRUCTURE

```
/Users/rioallen/Documents/OS-App-Builder/
├── SYSTEM-PROTOCOLS.md (this file)
├── CRITICAL-RESOURCES/
│   ├── api-keys.md
│   ├── urls-endpoints.md
│   ├── cli-commands.md
│   ├── credentials.md (encrypted references only)
│   ├── source-code/
│   │   └── [saved code snippets by date]
│   └── configurations/
│       └── [config files by project]
├── CRASH-RECOVERY/
│   ├── checkpoint-[timestamp].md
│   ├── last-known-good-state.md
│   └── recovery-log.md
├── LEARNING-GROWTH/
│   ├── attempted-solutions.md
│   ├── failed-approaches.md (NEVER REPEAT THESE)
│   ├── successful-patterns.md
│   └── user-preferences.md
├── TROUBLESHOOTING-LOG/
│   ├── active-issues.md
│   ├── resolved-issues.md
│   └── verification-results.md
├── DEPLOYED-VERSIONS/
│   ├── current-production/
│   ├── v1.0.0-[timestamp]/
│   └── deployment-log.md
└── scripts/
    ├── backup-deployment.sh
    └── git-version-tag.sh
```

---

## 🔧 COMPREHENSIVE TROUBLESHOOTING PROTOCOL v2.0

### PHASE 1: INITIAL ASSESSMENT (2 minutes max)
1. **Identify the EXACT error message/issue**
2. **Check LEARNING-GROWTH/failed-approaches.md** - DO NOT repeat
3. **Search codebase for similar issues already solved**
4. **Document initial state in TROUBLESHOOTING-LOG/active-issues.md**

### PHASE 2: SYSTEMATIC APPROACH (Track each attempt)
```markdown
## Issue: [Description]
### Attempt #1: [timestamp]
- **Approach**: [What you're trying]
- **Command/Change**: [Exact command or code change]
- **Result**: [What happened]
- **Status**: ❌ Failed / ✅ Success / ⚠️ Partial

### Attempt #2: [timestamp]
[Continue with NEW approach - NEVER repeat #1]
```

### PHASE 3: ESCALATING SOLUTIONS
If basic approach fails, escalate through these levels:
1. **Level 1**: Check logs, restart services
2. **Level 2**: Clear caches, reinstall dependencies
3. **Level 3**: Check environment variables, permissions
4. **Level 4**: Try alternative packages/approaches
5. **Level 5**: Rebuild from last known good state

### PHASE 4: VERIFICATION (MANDATORY)
**DO NOT mark as resolved until:**
1. Run the actual command/test
2. Visually verify the output
3. Test edge cases
4. Document verification in `/TROUBLESHOOTING-LOG/verification-results.md`
5. Get user confirmation

### PHASE 5: LEARNING CAPTURE
After resolution:
1. Add to `/LEARNING-GROWTH/successful-patterns.md`
2. Update `/TROUBLESHOOTING-LOG/resolved-issues.md`
3. Remove from `/TROUBLESHOOTING-LOG/active-issues.md`
4. Create checkpoint in `/CRASH-RECOVERY/`

---

## ⚡ QUICK REFERENCE COMMANDS

### Always Run After Changes:
```bash
# For Next.js projects
npm run lint
npm run type-check
npm run build

# For Python projects
ruff check .
mypy .
pytest

# Git status check
git status
git diff
```

### Verification Commands:
```bash
# Check if server is running
lsof -i :3000  # or relevant port
ps aux | grep node

# Check file was saved
ls -la [filename]
cat [filename] | head -20

# Verify deployment
curl -I [deployed-url]
```

---

## 🎯 USER PREFERENCE TRACKING

### Communication Style:
- **Concise**: Direct answers, no fluff
- **Results-focused**: Show output, not explanations
- **No patronizing**: Don't say "you're absolutely right" after mistakes

### Workflow Preferences:
- Save everything immediately
- Search before creating
- Verify before claiming completion
- Learn from every interaction

---

## 🚫 NEVER DO THESE (BLACKLIST)

1. **NEVER** say "it's done" without verification
2. **NEVER** recreate existing files from scratch
3. **NEVER** repeat failed solutions
4. **NEVER** lose API keys or credentials
5. **NEVER** skip the search step
6. **NEVER** mark tasks complete without testing
7. **NEVER** patronize after making mistakes

---

## 📊 SUCCESS METRICS

Track these for every session:
- **First-Time Success Rate**: Solutions that work on first try
- **Search-Before-Create Rate**: % of times existing files were found
- **Verification Rate**: % of solutions actually tested
- **Recovery Speed**: Time to recover from crashes
- **Learning Application**: Using past solutions for new problems

---

## 🔄 CONTINUOUS IMPROVEMENT

After each session:
1. Review what worked/failed
2. Update protocols based on learnings
3. Refine folder structure as needed
4. Capture new patterns discovered
5. Document user feedback

---

## 🆘 EMERGENCY RECOVERY

If everything fails:
1. Check `/CRASH-RECOVERY/last-known-good-state.md`
2. Restore from Git history if available
3. Use `/CRITICAL-RESOURCES/` to rebuild configuration
4. Follow `/LEARNING-GROWTH/successful-patterns.md`
5. Contact user for clarification rather than guessing

---

Last Updated: [Auto-update on save]
Version: 2.0.0
Status: ACTIVE PROTOCOL - FOLLOW STRICTLY