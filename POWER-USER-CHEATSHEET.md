# 🔥 Power User Cheat Sheet

## Master Commands (Memorize These)

### ⚡ Lightning Fast
```bash
dev s "msg"           # Save version (s = save)
dev g component Name  # Generate component (g = gen)
dev d staging         # Deploy to staging (d = deploy)
dev c                 # Health check (c = check)
dev st                # Status dashboard (st = status)
```

### 🎯 Daily Essentials
```bash
./auto-commit.sh &    # Start auto-save protection
dev status           # See everything at a glance
dev check            # Health score 0-100
dev save "message"   # Save working state
dev rollback         # Emergency recovery
```

### 🚀 Code Generation
```bash
dev gen component Button     # React component
dev gen page dashboard       # Next.js page
dev gen api auth/login      # API route
dev gen hook useUser        # Custom hook
dev gen context UserContext # Context provider
dev gen store userStore     # Zustand store
```

### 🎭 Demo & Deployment
```bash
./create-demo.sh "client-demo"  # Frozen demo branch
dev deploy preview              # Quick preview
dev deploy staging              # Staging deploy
dev deploy production           # Production (with safety)
```

## 🧠 Mental Models

### The Golden Rule
**If it works → save it immediately**
```bash
# Good code working? Save it!
dev save "auth system working"

# About to try something risky? Save first!
dev save "before refactor"
```

### The Recovery Pattern
```bash
# Something broke?
dev rollback         # Pick last working version
# Now debug from known good state
```

### The Health Pattern
```bash
# Before any deployment
dev check           # Must be >90 score
# Fix any red/yellow issues
# Then deploy with confidence
```

## ⏰ Time-Based Workflows

### 🌅 Morning (2 min)
```bash
dev status              # Where am I?
./auto-commit.sh &     # Protection on
dev check              # Any overnight issues?
```

### 🌙 Evening (1 min)
```bash
dev save "end of day"   # Save progress
dev check              # Health for tomorrow
git push               # Sync to remote
```

### 🔥 Feature Sprint
```bash
dev save "before $FEATURE"      # Checkpoint
dev gen component $FEATURE      # Generate parts
dev gen api $FEATURE            
# ... build feature ...
dev save "$FEATURE complete"    # Save working
dev deploy staging              # Test
dev deploy production           # Ship
```

## 🚨 Emergency Protocols

### Code Broke
```bash
dev rollback           # Emergency recovery
# Pick last working state
```

### VS Code Crashed  
```bash
cat SESSION-STATE.md   # See where you were
git log --oneline -5   # See auto-commits
# Auto-save protected you!
```

### Demo Day Disaster
```bash
git branch -a | grep demo/  # Find demo branches  
git checkout demo/client-presentation
# Demos are frozen in time!
```

### Deploy Failed
```bash
dev rollback           # Restore previous
dev check             # Fix issues
dev deploy staging    # Test
dev deploy production # Retry
```

## 💡 Pro Tips

### Speed Hacks
```bash
# Add to ~/.zshrc for max speed
alias s='dev save'
alias c='dev check' 
alias g='dev gen'
alias d='dev deploy'
alias st='dev status'

# Morning ritual
alias morning='dev status && ./auto-commit.sh &'

# Evening ritual  
alias evening='dev save "end of day" && git push'
```

### Health Score Hacks
```bash
# Quick score boosters:
npm audit fix          # Fix vulnerabilities (+10-20 points)
npm run lint -- --fix  # Auto-fix linting (+5-10 points)
git add -A && git commit -m "Cleanup" # Clean repo (+5 points)
```

### Generation Patterns
```bash
# Full feature generation:
FEATURE="Payment"
dev gen component ${FEATURE}Form
dev gen hook use${FEATURE}
dev gen api ${FEATURE,,}/process
dev gen page ${FEATURE,,}
dev save "${FEATURE} feature scaffolded"
```

## 🎯 Power User Indicators

### You're doing it right when:
- ✅ Never lose more than 5 minutes of work
- ✅ Can recover from any disaster in <30 seconds  
- ✅ Generate components faster than you can type
- ✅ Deploy with confidence (health score >90)
- ✅ Context switch between projects in <1 minute
- ✅ Other devs ask how you work so fast

### Red flags to avoid:
- ❌ Writing boilerplate by hand
- ❌ Deploying without health check
- ❌ Losing work to crashes
- ❌ Spending >5 minutes on setup
- ❌ Debugging issues that were already solved

## 🔥 Advanced Combos

### The Feature Factory
```bash
# Generate complete feature in 30 seconds
FEATURE="UserProfile"
dev save "before ${FEATURE}"
dev gen component ${FEATURE}
dev gen hook use${FEATURE}  
dev gen api users/profile
dev gen page users/profile
dev save "${FEATURE} feature generated"
```

### The Demo Machine
```bash
# Create multiple demos for different audiences
dev save "pre-demo prep"
./create-demo.sh "client-basic"      # Simple version for client
./create-demo.sh "investor-metrics"  # Analytics for investors  
./create-demo.sh "team-advanced"     # Full features for team
```

### The Health Monitor
```bash
# Continuous health monitoring
while true; do
  SCORE=$(dev check | grep "Score:" | awk '{print $3}')
  [ "$SCORE" -lt 90 ] && echo "🚨 Health below 90: $SCORE"
  sleep 300  # Check every 5 minutes
done &
```

### The Time Machine
```bash
# Perfect rollback strategy
dev save "golden-$(date +%Y%m%d)"     # Daily golden state
# Work on risky changes...
dev save "checkpoint-$(date +%H%M)"   # Hourly checkpoints  
# If something breaks:
dev rollback  # Choose appropriate restore point
```

## 📊 Mastery Metrics

Track these to measure your progress:

### Speed Metrics
- **Project setup**: Target <60 seconds
- **Component generation**: Target <10 seconds  
- **Deployment**: Target <2 minutes
- **Context switching**: Target <30 seconds
- **Disaster recovery**: Target <30 seconds

### Quality Metrics
- **Health score**: Keep >90
- **Work lost**: Target 0 minutes/week
- **Deploy failures**: Target <5%
- **Bug escape rate**: Target <1%
- **Technical debt**: Decreasing over time

### Productivity Metrics
- **Features shipped**: 3x faster
- **Time spent on setup**: 90% reduction
- **Time spent debugging**: 50% reduction
- **Time spent on deployments**: 80% reduction
- **Team questions answered**: Helping others

---

**Remember: A 10x developer doesn't work 10x harder, they eliminate 90% of the friction.** 🎯