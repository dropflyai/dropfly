# 🚀 Optimized Troubleshooting Protocol

## Core Philosophy
**Smart, Fast, Effective** - Solve problems efficiently without unnecessary steps

## 🎯 Instant Error Recognition

### Pattern Matching (Check FIRST - 80% of issues)
```yaml
MODULE_NOT_FOUND:
  solution: npm install

Cannot find module 'X':
  solution: npm install X

ENOENT/File not found:
  solution: Check file path, create if missing

Port already in use:
  solution: lsof -i :PORT && kill -9 PID

CORS error:
  solution: Check API headers, add cors middleware

Hydration mismatch:
  solution: Check server/client rendering consistency

Undefined/null reference:
  solution: Add null checks, initialize variables

Build failed:
  solution: rm -rf node_modules .next && npm install && npm run build
```

## ⚡ Rapid Resolution Flow

### 1. Instant Check (30 seconds)
```bash
# Error appears
↓
# Match against common patterns above
↓
# Apply standard fix
↓
# Verify resolution
```

### 2. Quick Diagnosis (2 minutes)
If pattern doesn't match:
- **Read FULL error** (not just first line)
- **Check recent changes**: `git diff`
- **Verify environment**: `.env` variables exist?
- **Test isolation**: Comment out recent code

### 3. Systematic Debug (5 minutes)
```javascript
// Add strategic console.logs
console.log('🔍 Before problematic code:', data);
// problematic code here
console.log('✅ After problematic code:', result);

// Or use debugger
debugger; // Execution stops here
```

### 4. Research Phase (10 minutes)
```markdown
Search priority:
1. Error message + framework name
2. Check GitHub issues for the library
3. Stack Overflow recent posts
4. Official docs troubleshooting section
```

## 🧠 Smart Debugging by Category

### Build/Compile Errors
```bash
# Nuclear option (usually works)
rm -rf node_modules package-lock.json .next .turbo
npm cache clean --force
npm install
npm run build

# If persists, check:
- Node version compatibility
- TypeScript config
- Import paths
```

### Runtime Errors
```javascript
// Quick checks:
- Is API endpoint correct?
- Are env variables loaded?
- Is data structure as expected?
- Are async operations awaited?

// Debug pattern:
try {
  const result = await riskyOperation();
  console.log('Success:', result);
} catch (error) {
  console.error('Failed at:', error.message);
  console.log('Stack:', error.stack);
}
```

### Database Errors
```sql
-- Quick checks:
SELECT 1; -- Connection working?
\dt; -- Tables exist?
\d table_name; -- Schema correct?

-- Common fixes:
- Run migrations: npx prisma migrate dev
- Reset database: npx prisma migrate reset
- Check connection string in .env
```

### Deployment Errors
```bash
# Vercel/Netlify check:
- Build command correct?
- Environment variables set?
- Node version specified?
- Build output directory correct?

# Quick fix:
npm run build locally first
Check build logs for specific error
```

## 📋 Efficient Solution Documentation

### Only Document If:
- Solution took >15 minutes to find
- Problem will likely recur
- Solution is non-obvious
- Multiple steps required

### Documentation Template (30 seconds)
```markdown
## [ERROR_TYPE]: Brief description
**Error**: `Exact error message`
**Cause**: Root cause in one line
**Fix**: 
```bash
command or code that fixes it
```
**Prevention**: How to avoid in future
```

## 🔥 Performance Shortcuts

### Developer Tools
```javascript
// Performance check
console.time('operation');
// ... code ...
console.timeEnd('operation');

// Memory check
console.log(performance.memory);

// Network check (Browser DevTools)
Network tab → Slow 3G → Find bottlenecks
```

### Common Performance Fixes
```bash
# React re-renders
- Add React.memo()
- Use useMemo/useCallback
- Check key props in lists

# Bundle size
- Dynamic imports: import().then()
- Tree shaking: check imports
- Analyze: npm run build && npm run analyze

# Database slow
- Add indexes
- Optimize queries
- Add caching layer
```

## 🎯 Decision Tree

```
ERROR OCCURS
    ↓
Is it in our pattern list? 
    YES → Apply fix (30 sec)
    NO ↓
    
Did recent code cause it?
    YES → Revert/fix change (2 min)
    NO ↓
    
Is it environment-specific?
    YES → Check env/config (2 min)
    NO ↓
    
Can you isolate it?
    YES → Fix specific component (5 min)
    NO ↓
    
Research solution (10 min)
    ↓
Still stuck?
    ↓
Try alternative approach/workaround
```

## ⚠️ Anti-Patterns to Avoid

### Don't:
- Spend >15 min on same approach
- Make random changes hoping it works
- Clear cache repeatedly without reason
- Ignore error messages details
- Skip checking previous solutions

### Do:
- Read entire error message
- Check what changed recently
- Test hypothesis systematically
- Document unique solutions
- Learn from each issue

## 🚄 Speed Optimizations

### Terminal Aliases
```bash
# Add to .bashrc/.zshrc
alias nr='npm run'
alias nrd='npm run dev'
alias nrb='npm run build'
alias rmrf='rm -rf node_modules package-lock.json'
alias ports='lsof -i -P -n | grep LISTEN'
alias gd='git diff'
alias gl='git log --oneline -10'
```

### VS Code Shortcuts
- `Cmd+Shift+P` → Restart TS Server
- `Cmd+P` → Quick file open
- `Cmd+Shift+F` → Global search
- `F12` → Go to definition
- `Shift+F12` → Find all references

## 📊 Success Metrics

### Efficiency Targets
- Common errors: <1 minute to fix
- Build errors: <5 minutes to resolve
- Runtime errors: <10 minutes to debug
- Complex issues: <30 minutes to solution

### Resolution Rate
- 60% → Instant pattern match
- 30% → Quick diagnosis
- 9% → Systematic debug
- 1% → Research required

## 🎯 The Golden Rule

**If something takes >5 minutes, you're probably overthinking it.**

Most errors have simple solutions:
1. Missing dependency
2. Typo in code
3. Environment variable missing
4. Cache needs clearing
5. Version mismatch

## 💡 Pro Tips

### Prevent Issues
```javascript
// Add error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>

// Validate early
if (!data) return <Loading />;
if (error) return <Error />;

// Type everything
interface Props {
  data: DataType;
  onError: (error: Error) => void;
}
```

### Quick Wins
- Install `npm-check-updates` for dependency management
- Use `npx` instead of global installs
- Keep Node/npm updated
- Use `.nvmrc` for Node version consistency
- Add `.env.example` with all required vars

---

**Remember**: Most problems have been solved before. Check patterns first, debug systematically, document only unique solutions.