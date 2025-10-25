# 📋 WORKFLOW CHECKLISTS
> Step-by-step checklists for every scenario

## 🆕 NEW PROJECT CHECKLIST

### Phase 1: System Preparation (MANDATORY)
- [ ] Read `/SYSTEM-USAGE-INSTRUCTIONS.md`
- [ ] Check `/LEARNING-GROWTH/user-preferences.md`
- [ ] Review `/LEARNING-GROWTH/failed-approaches.md`
- [ ] Check `/TROUBLESHOOTING-LOG/active-issues.md`

### Phase 2: Project Discovery
- [ ] Run `Glob: **/*PROJECT*`
- [ ] Run `Glob: **/*README*`
- [ ] Run `Glob: **/*CLAUDE*`
- [ ] Run `Glob: **/package.json`
- [ ] Read any existing documentation found

### Phase 3: Environment Assessment
- [ ] Run `ls -la [project-root]`
- [ ] Check for `.env.example` or `.env.local`
- [ ] Run `git status` (if Git repo)
- [ ] Check `package.json` dependencies

### Phase 4: Create Documentation
- [ ] Create `CLAUDE.md` if missing
- [ ] Create `SESSION-MEMORY.md` if missing
- [ ] Update `/CRITICAL-RESOURCES/urls-endpoints.md` with local URLs
- [ ] Save any provided API keys/tokens immediately

### Phase 5: Verify Setup
- [ ] Run `npm install` (if Node.js)
- [ ] Run `npm run dev` (or equivalent)
- [ ] Test `curl -I http://localhost:[port]`
- [ ] Create checkpoint in `/CRASH-RECOVERY/`

---

## 🔄 EXISTING PROJECT CHECKLIST

### Phase 1: System Check (MANDATORY)
- [ ] Read `/SYSTEM-USAGE-INSTRUCTIONS.md`
- [ ] Check `/LEARNING-GROWTH/user-preferences.md`
- [ ] Review active issues in `/TROUBLESHOOTING-LOG/active-issues.md`

### Phase 2: Session Restore
- [ ] Read `[project]/SESSION-MEMORY.md`
- [ ] Read `[project]/CLAUDE.md`
- [ ] Check `/CRASH-RECOVERY/last-known-good-state.md`
- [ ] Review last deployment in `/DEPLOYED-VERSIONS/deployment-log.md`

### Phase 3: State Verification
- [ ] Navigate to project directory
- [ ] Run `git status`
- [ ] Check if dev server running: `lsof -i :[port]`
- [ ] Test accessibility: `curl -I http://localhost:[port]`

### Phase 4: Update Checkpoint
- [ ] Update `/CRASH-RECOVERY/last-known-good-state.md`
- [ ] Note current task in `SESSION-MEMORY.md`
- [ ] Create TodoWrite list if multi-step task

---

## 🐛 TROUBLESHOOTING CHECKLIST

### Phase 1: Learning System Check (CRITICAL)
- [ ] Read `/LEARNING-GROWTH/failed-approaches.md` - DO NOT REPEAT
- [ ] Read `/LEARNING-GROWTH/successful-patterns.md` for similar issues
- [ ] Check if issue exists in `/TROUBLESHOOTING-LOG/active-issues.md`

### Phase 2: Issue Documentation
- [ ] Add issue to `/TROUBLESHOOTING-LOG/active-issues.md`
- [ ] Include exact error message
- [ ] Note affected files/components
- [ ] Set priority level (🔴 HIGH, 🟡 MEDIUM, 🟢 LOW)

### Phase 3: Systematic Resolution
- [ ] **Level 1**: Basic checks (build, lint, type-check)
- [ ] **Level 2**: Clean rebuild (rm -rf .next node_modules, npm install)
- [ ] **Level 3**: Environment check (env vars, Git status)
- [ ] **Level 4**: Alternative approaches (different packages/methods)
- [ ] **Level 5**: Restore from backup

### Phase 4: Verification & Learning
- [ ] Test solution actually works
- [ ] Update `/TROUBLESHOOTING-LOG/verification-results.md`
- [ ] Move to `/TROUBLESHOOTING-LOG/resolved-issues.md`
- [ ] Add successful pattern to `/LEARNING-GROWTH/successful-patterns.md`
- [ ] Remove from active issues

---

## 💻 CODE MODIFICATION CHECKLIST

### Phase 1: Preparation
- [ ] Read existing file: `Read: [target-file]`
- [ ] Search for similar patterns: `Glob: **/*[pattern]*`
- [ ] Understand existing code structure and imports
- [ ] Check project conventions in other files

### Phase 2: Change Planning
- [ ] Create TodoWrite list if multiple changes needed
- [ ] Mark current todo as "in_progress"
- [ ] Note planned changes in `SESSION-MEMORY.md`

### Phase 3: Implementation
- [ ] Make minimal, focused changes
- [ ] Follow existing code patterns and style
- [ ] Use existing imports and utilities
- [ ] Maintain consistent naming conventions

### Phase 4: Verification (MANDATORY)
- [ ] Run `npm run build`
- [ ] Run `npm run type-check`
- [ ] Run `npm run lint`
- [ ] Test functionality in browser/app
- [ ] Only mark TodoWrite complete AFTER verification

---

## 🚀 DEPLOYMENT CHECKLIST

### Phase 1: Pre-Deployment
- [ ] All changes committed to Git
- [ ] All tests passing locally
- [ ] Build successful: `npm run build`
- [ ] Types check: `npm run type-check`
- [ ] Lint check: `npm run lint`

### Phase 2: Version & Backup
- [ ] Run `./scripts/backup-deployment.sh`
- [ ] Verify Git tag created
- [ ] Confirm source archived in `/DEPLOYED-VERSIONS/`
- [ ] Check deployment metadata saved

### Phase 3: Deploy & Verify
- [ ] Deployment to Vercel successful
- [ ] Production URL accessible
- [ ] Critical features tested
- [ ] URLs saved in `/CRITICAL-RESOURCES/urls-endpoints.md`

### Phase 4: Documentation
- [ ] Update `/DEPLOYED-VERSIONS/deployment-log.md`
- [ ] Update `SESSION-MEMORY.md` with deployment info
- [ ] Create checkpoint in `/CRASH-RECOVERY/`

---

## 💬 USER COMMUNICATION CHECKLIST

### Every Response Must:
- [ ] Be concise (max 4 lines unless asked for detail)
- [ ] Lead with results/answers, not process
- [ ] Include file:line references for code locations
- [ ] Skip explanations unless requested

### When User Provides Resources:
- [ ] Save to appropriate `/CRITICAL-RESOURCES/` file immediately
- [ ] No questions asked, just save
- [ ] Confirm saved with brief "✅ Saved to CRITICAL-RESOURCES"

### When Reporting Completion:
- [ ] Actually verify solution works first
- [ ] Show command output as proof
- [ ] Provide specific file/line references
- [ ] NEVER say "done" without verification

---

## 🔧 SESSION MANAGEMENT CHECKLIST

### Session Start:
- [ ] Read all mandatory system files
- [ ] Review current project state
- [ ] Check for active issues
- [ ] Create session timestamp in `SESSION-MEMORY.md`

### During Session:
- [ ] Update TodoWrite status in real-time
- [ ] Document all attempts in troubleshooting log
- [ ] Save critical resources immediately
- [ ] Create checkpoints every 5 minutes

### Session End:
- [ ] Mark all todos complete (only if verified)
- [ ] Move resolved issues to resolved log
- [ ] Update last-known-good-state
- [ ] Save session summary

---

## 🎯 QUALITY ASSURANCE CHECKLIST

### Before Any Response:
- [ ] Searched for existing solutions first
- [ ] Read relevant documentation
- [ ] Checked failed approaches list
- [ ] Planned response to be concise

### After Any Change:
- [ ] Tested change actually works
- [ ] No regressions introduced
- [ ] Documentation updated if needed
- [ ] User can verify independently

---

## 🚨 EMERGENCY CHECKLIST

### When Completely Stuck:
- [ ] Re-read `/SYSTEM-USAGE-INSTRUCTIONS.md`
- [ ] Check `/CRASH-RECOVERY/last-known-good-state.md`
- [ ] Review project `SESSION-MEMORY.md`
- [ ] Ask user for clarification rather than guessing

### When User Shows Frustration:
- [ ] Check `/LEARNING-GROWTH/user-preferences.md`
- [ ] Be more concise in responses
- [ ] Focus on results, not process
- [ ] Verify everything before claiming completion

---

**Use these checklists religiously. They exist to prevent repeating past mistakes and ensure consistent quality.**