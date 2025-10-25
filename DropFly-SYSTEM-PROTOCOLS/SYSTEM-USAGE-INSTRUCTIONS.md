# 🤖 CLAUDE'S COMPLETE SYSTEM USAGE INSTRUCTIONS
> **HARD RULE**: ALWAYS READ AND FOLLOW THESE INSTRUCTIONS

## 🚨 MANDATORY OPENING PROTOCOL - DO THIS FIRST EVERY TIME

### STEP 1: SYSTEM CHECK (30 seconds)
```bash
# ALWAYS run these commands first:
1. Read this file: /Users/rioallen/Documents/OS-App-Builder/SYSTEM-USAGE-INSTRUCTIONS.md
2. Check user preferences: Read /Users/rioallen/Documents/OS-App-Builder/LEARNING-GROWTH/user-preferences.md
3. Review failed approaches: Read /Users/rioallen/Documents/OS-App-Builder/LEARNING-GROWTH/failed-approaches.md
4. Check active issues: Read /Users/rioallen/Documents/OS-App-Builder/TROUBLESHOOTING-LOG/active-issues.md
```

### STEP 2: SEARCH PROTOCOL (MANDATORY)
```bash
# Before doing ANYTHING:
Glob: **/*[keyword]*          # Search for existing files
Grep: "[term]" --type md      # Search content
Read: [existing files found]  # Read before modifying
```

### STEP 3: SAVE IMMEDIATELY
If user provides ANY of these, save to CRITICAL-RESOURCES/ IMMEDIATELY:
- API keys → `CRITICAL-RESOURCES/api-keys.md`
- URLs → `CRITICAL-RESOURCES/urls-endpoints.md`
- CLI commands → `CRITICAL-RESOURCES/cli-commands.md`
- Source code → `CRITICAL-RESOURCES/source-code/`

---

## 📋 PROJECT WORKFLOW INSTRUCTIONS

### 🆕 STARTING A NEW PROJECT

#### 1. PROJECT DISCOVERY (5 minutes)
```bash
# Search for existing project structure:
Glob: **/*PROJECT*
Glob: **/*README*
Glob: **/*CLAUDE*
Glob: **/package.json
Glob: **/*.md

# Read key files:
Read: [project-root]/CLAUDE.md (if exists)
Read: [project-root]/README.md (if exists)
Read: [project-root]/package.json (if exists)
```

#### 2. ENVIRONMENT SETUP CHECK
```bash
# Check development environment:
ls -la [project-root]
cat [project-root]/.env.example (if exists)
npm list (if Node.js project)
git status (if Git repo)
```

#### 3. CREATE PROJECT DOCUMENTATION
If no CLAUDE.md exists, create with this template:
```markdown
# [Project Name]

## Project Overview
**Project Name**: [Name]
**Type**: [Description]
**Stack**: [Technologies]

## Development Commands
- Install: npm install
- Start: npm run dev
- Build: npm run build

## Current Status
[Current state]

## Recent Changes
[What was last worked on]
```

### 🔄 CONTINUING EXISTING PROJECT

#### 1. SESSION RESTORE (MANDATORY)
```bash
# Always check these files first:
Read: [project]/SESSION-MEMORY.md
Read: [project]/CLAUDE.md
Read: CRASH-RECOVERY/last-known-good-state.md
Read: TROUBLESHOOTING-LOG/active-issues.md
```

#### 2. VERIFY PROJECT STATE
```bash
# Check if project is working:
cd [project-directory]
npm run dev (or equivalent)
lsof -i :[port] # Check if running
curl -I http://localhost:[port] # Test if accessible
```

#### 3. UPDATE CHECKPOINT
```bash
# Save current state to crash recovery:
echo "## Checkpoint $(date)
Working on: [current task]
Project status: [status]
Last working command: [command]" >> CRASH-RECOVERY/last-known-good-state.md
```

### 🐛 WHEN STUCK OR TROUBLESHOOTING

#### 1. CHECK LEARNING SYSTEM (FIRST!)
```bash
Read: LEARNING-GROWTH/failed-approaches.md
# DO NOT repeat anything in this file!

Read: LEARNING-GROWTH/successful-patterns.md  
# Look for similar solutions that worked

Read: TROUBLESHOOTING-LOG/active-issues.md
# Check if this issue is already being tracked
```

#### 2. LOG THE ISSUE
```bash
# Add to active issues immediately:
echo "## 🔴 HIGH Issue: [problem description]
**Started**: $(date)
**Error**: [exact error message]
**Attempts So Far**: None yet
**Next Steps**: 
- [ ] [first approach to try]" >> TROUBLESHOOTING-LOG/active-issues.md
```

#### 3. SYSTEMATIC TROUBLESHOOTING
```bash
# Level 1: Basic checks
npm run build
npm run lint
npm run type-check

# Level 2: Clean and restart
rm -rf .next node_modules
npm install
npm run dev

# Level 3: Environment check
printenv | grep NODE
cat .env.local
git status

# Document each attempt in active-issues.md
```

### 💾 WHEN MAKING CHANGES

#### 1. BEFORE CHANGING CODE
```bash
# Always read existing code first:
Read: [file-to-modify]

# Check patterns in similar files:
Glob: **/*[similar-pattern]*
Read: [similar files for patterns]
```

#### 2. DURING CHANGES
```bash
# Use TodoWrite for multi-step tasks:
TodoWrite: [list of steps]

# Update SESSION-MEMORY.md with changes:
echo "## Changes $(date)
Modified: [file]:[line-numbers]
Purpose: [what and why]" >> [project]/SESSION-MEMORY.md
```

#### 3. AFTER CHANGES
```bash
# ALWAYS verify changes work:
npm run build
npm run lint  
npm run type-check
curl -I http://localhost:[port] # Test if working

# Only mark TodoWrite complete AFTER verification
```

---

## 🔧 DEPLOYMENT WORKFLOW

### BEFORE DEPLOYMENT
```bash
# Run comprehensive checks:
./scripts/backup-deployment.sh

# This will:
# 1. Create version backup
# 2. Tag in Git  
# 3. Deploy to Vercel
# 4. Save all URLs
# 5. Create rollback instructions
```

### AFTER DEPLOYMENT
```bash
# Update tracking:
echo "## Deployed $(date)
Version: [version-tag]  
URL: [production-url]
Status: ✅ Live" >> DEPLOYED-VERSIONS/deployment-log.md

# Test live deployment:
curl -I [production-url]
```

---

## 📊 COMMUNICATION PROTOCOLS

### USER INTERACTION RULES
1. **BE CONCISE**: Max 4 lines unless asked for detail
2. **RESULTS FIRST**: Show command output, not explanation
3. **NO PATRONIZING**: Never say "you're absolutely right" after errors
4. **VERIFY EVERYTHING**: Test before claiming completion

### WHEN USER PROVIDES RESOURCES
```bash
# SAVE IMMEDIATELY without asking:
echo "[resource]" >> CRITICAL-RESOURCES/[appropriate-file].md
echo "✅ Saved to CRITICAL-RESOURCES"
```

### WHEN REPORTING COMPLETION
```bash
# NEVER say "done" without verification:
# 1. Run actual test
# 2. Show output  
# 3. Provide file:line references
# 4. Only then report success
```

---

## 🔄 DAILY WORKFLOW CHECKLIST

### EVERY SESSION START:
- [ ] Read SYSTEM-USAGE-INSTRUCTIONS.md (this file)
- [ ] Check LEARNING-GROWTH/user-preferences.md  
- [ ] Review TROUBLESHOOTING-LOG/active-issues.md
- [ ] Read project SESSION-MEMORY.md or CLAUDE.md
- [ ] Search before creating anything new

### DURING WORK:
- [ ] Use TodoWrite for multi-step tasks
- [ ] Document attempts in TROUBLESHOOTING-LOG/
- [ ] Save critical resources immediately
- [ ] Update session memory with changes
- [ ] Create crash recovery checkpoints

### SESSION END:
- [ ] Mark all todos complete (only if verified)
- [ ] Move resolved issues to resolved-issues.md
- [ ] Update last-known-good-state.md
- [ ] Save any new successful patterns

---

## 🚫 HARD RULES - NEVER VIOLATE

### ABSOLUTELY FORBIDDEN:
1. **NEVER** create files without searching first
2. **NEVER** repeat solutions from failed-approaches.md
3. **NEVER** claim completion without verification
4. **NEVER** lose API keys, tokens, or credentials
5. **NEVER** skip reading existing project documentation
6. **NEVER** be patronizing after making mistakes

### ALWAYS REQUIRED:
1. **ALWAYS** search with Glob/Grep before creating
2. **ALWAYS** read existing files before modifying
3. **ALWAYS** save critical resources immediately
4. **ALWAYS** verify solutions actually work
5. **ALWAYS** document what was tried
6. **ALWAYS** follow user communication preferences

---

## 📁 QUICK FILE REFERENCE

```
Essential Files to Check:
├── SYSTEM-USAGE-INSTRUCTIONS.md (this file)
├── LEARNING-GROWTH/user-preferences.md
├── LEARNING-GROWTH/failed-approaches.md  
├── TROUBLESHOOTING-LOG/active-issues.md
├── [project]/SESSION-MEMORY.md
├── [project]/CLAUDE.md
└── CRASH-RECOVERY/last-known-good-state.md

Save Resources To:
├── CRITICAL-RESOURCES/api-keys.md
├── CRITICAL-RESOURCES/urls-endpoints.md
├── CRITICAL-RESOURCES/cli-commands.md
└── CRITICAL-RESOURCES/source-code/

Scripts Available:
├── scripts/backup-deployment.sh
└── scripts/git-version-tag.sh
```

---

## 🎯 SUCCESS METRICS

Track these for continuous improvement:
- **First-Time Success Rate**: Solutions that work immediately
- **Search-First Rate**: % of times existing files found
- **Verification Rate**: % of solutions actually tested
- **User Satisfaction**: Concise, verified responses

---

## 🚨 EMERGENCY PROCEDURES

### IF COMPLETELY LOST:
1. Read this file again
2. Check CRASH-RECOVERY/last-known-good-state.md
3. Check project CLAUDE.md or SESSION-MEMORY.md
4. Ask user for clarification rather than guessing

### IF USER IS FRUSTRATED:
1. Check LEARNING-GROWTH/user-preferences.md
2. Be more concise
3. Show results, not process
4. Verify everything before responding

---

**REMEMBER: These instructions exist because the user demanded better results. Follow them religiously to avoid repeating past mistakes.**

---

Last Updated: $(date)
Status: MANDATORY SYSTEM INSTRUCTIONS - FOLLOW ALWAYS