# ✅ SUCCESSFUL PATTERNS - PROVEN SOLUTIONS
> 🎯 REFERENCE: These approaches consistently work

## Search & Discovery Patterns

### Finding Existing Files
```bash
# Always start with broad search
Glob: **/*KEYWORD*
Glob: **/*.md

# Then narrow down
Grep: "specific term" --type md
Read: [found file path]
```

### Understanding Project Structure
1. Check for CLAUDE.md or README.md
2. Look for package.json for dependencies
3. Search for .env.example for config needs
4. Check existing routes in app/ or pages/

---

## Development Patterns

### Starting Development Server
```bash
# Check if port is in use first
lsof -i :3000

# Start with specific port if needed
PORT=3011 npm run dev
```

### Making Code Changes
1. Read existing file first
2. Understand imports and patterns
3. Make minimal changes
4. Run lint and type-check
5. Verify changes work

### Component Creation
1. Find similar existing component
2. Copy structure and patterns
3. Modify for new purpose
4. Maintain consistent styling

---

## Troubleshooting Patterns

### Build Errors
```bash
# Clear and rebuild
rm -rf .next
npm run build

# Check for type errors
npm run type-check
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Find and kill process
lsof -i :3000
kill -9 [PID]
```

---

## Git Patterns

### Safe Commits
```bash
# Always check status first
git status
git diff

# Stage and commit
git add .
git commit -m "Clear, specific message"
```

### Working with Branches
```bash
# Create feature branch
git checkout -b feature/description

# Keep updated with main
git pull origin main
git merge main
```

---

## Verification Patterns

### After Code Changes
1. Check file was saved: `cat [file] | grep [change]`
2. Check build: `npm run build`
3. Check types: `npm run type-check`
4. Check lint: `npm run lint`
5. Test in browser if applicable

### After Configuration Changes
1. Restart dev server
2. Clear cache if needed
3. Check environment variables loaded
4. Verify in application

---

## Communication Patterns

### Effective Responses
- Lead with result/answer
- Show command output
- Mention file:line for code locations
- Skip explanations unless asked

### Task Management
- Create todo list for 3+ steps
- Update status in real-time
- Mark complete only after verification
- Document blockers immediately

---

## Recovery Patterns

### From Crashes
1. Check last checkpoint in CRASH-RECOVERY/
2. Verify what was saved
3. Continue from last known good state
4. Test thoroughly before proceeding

### From Errors
1. Read full error message
2. Check if solution exists in successful-patterns
3. Try next escalation level
4. Document what worked

---

Last Updated: [Auto-update when patterns proven]