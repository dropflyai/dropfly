# Senior Developer Onboarding Guide
## OS App Builder System Architecture & Project Management

This document provides complete system documentation for senior developers joining our enterprise-grade project management framework.

## 🏗️ ENTERPRISE BACKEND FRAMEWORK (MANDATORY)

**CRITICAL**: Every project MUST start with enterprise-grade backend infrastructure.

### Framework Standards
- **Security First**: Multi-tenant RLS on ALL tables from day one
- **Performance Optimized**: Strategic indexes and query optimization  
- **Production Ready**: Monitoring, alerts, and operational excellence
- **Scalable Architecture**: Designed for growth from startup to enterprise

### Implementation Requirements

**Before ANY frontend development:**
1. Apply Enterprise Backend Framework using `PROJECT-INITIALIZATION-PROMPTS.md`
2. Database Schema: 15+ tables with comprehensive relationships
3. Security Policies: RLS protection on every table
4. Performance Optimization: Indexes on all critical queries
5. Business Logic: Edge Functions with proper validation
6. Monitoring Systems: Health checks and alerting
7. Quality Gate: Complete audit using `QUICK-START-REFERENCE.md`

### Success Criteria
- **Security**: 100% RLS coverage, zero data leakage between tenants
- **Performance**: <200ms average query time, 99.9% uptime
- **Scalability**: Multi-tenant architecture supporting unlimited growth
- **Operations**: Full monitoring with automated alerts and recovery

## 📁 STANDARDIZED PROJECT FILE STRUCTURE

### Root Project Structure
```
project-name/
├── .logs/                    # Session logs (YYYY-MM-DD-session.md)
├── .docs/                    # All documentation
├── .research/                # Web scraping, API responses
├── .assets/                  # Downloaded images, logos, media
├── .credentials/             # API keys, deployment tokens (NEVER commit)
├── .troubleshoot/            # Problem solutions and fixes
├── .progress/                # Completed tasks log
├── components/ui/            # Reusable UI components
├── pages/                    # Next.js pages
├── styles/                   # Global CSS
├── public/images/            # Static assets
├── CLAUDE.md                 # Project-specific instructions
├── SESSION-MEMORY.md         # Current project state
└── .gitignore               # Include .credentials/
```

### Credentials Management Structure
```
.credentials/
├── api-keys.md              # API keys and tokens
├── deployment.md            # Vercel tokens, GitHub keys
├── accounts.md              # Login information
└── README.md                # Security guidelines
```

### Documentation Structure
```
.docs/
├── business-requirements.md # Client needs and goals
├── technical-specs.md       # Architecture decisions
├── deployment-guide.md      # Production deployment steps
├── testing-procedures.md    # QA and verification steps
└── maintenance-log.md       # Ongoing updates and fixes
```

### Logging Structure
```
.logs/
├── 2024-01-15-session.md   # Daily session logs
├── 2024-01-16-session.md   # Each session timestamped
└── project-timeline.md     # Overall project milestones
```

## 🚀 PROJECT INITIALIZATION WORKFLOW

### ⚠️ CRITICAL: How to Start a New Project

**When user says "let's start a new project" or "create a new app", follow this EXACT sequence:**

### Phase 1: Requirements Gathering
**MANDATORY: Ask questions ONE AT A TIME until complete information gathered:**

**🔴 STOP - Do NOT proceed until ALL questions answered**

1. **Business Information** (Ask one by one)
   - What is the business/client name?
   - What type of business is it? (restaurant, retail, service, etc.)
   - What is the main goal of this project? (demo site, full website, specific features?)

2. **Technical Requirements** (Ask one by one)
   - Do they have an existing website or online presence to research?
   - What are the key features they need? (AI chat, voice agent, e-commerce, etc.)
   - What is their brand colors/aesthetic preference?

3. **Project Scope** (Ask one by one)
   - Who is their target audience?
   - What is the timeline/priority level?
   - What is the budget/complexity level?

**✅ ONLY proceed to Phase 2 when ALL requirements are documented**

### Phase 2: Backend Framework Implementation
**MANDATORY - Use `PROJECT-INITIALIZATION-PROMPTS.md`:**

1. Database schema with 15+ tables
2. Row Level Security on every table
3. Performance indexes
4. Edge Functions for business logic
5. Monitoring and alerting
6. Complete documentation

### Phase 3: Project Setup & Logging Infrastructure
**🔴 MANDATORY: Set up complete logging system BEFORE any development**

1. **Create project folder with standard structure**
   ```bash
   mkdir project-name
   cd project-name
   mkdir .logs .docs .research .assets .credentials .troubleshoot .progress
   ```

2. **Initialize comprehensive logging system**
   ```bash
   # Create initial session log
   touch .logs/$(date +%Y-%m-%d)-project-initialization.md
   
   # Create SESSION-MEMORY.md
   touch SESSION-MEMORY.md
   
   # Create project-specific CLAUDE.md
   touch CLAUDE.md
   ```

3. **🔥 CRITICAL: Start logging IMMEDIATELY**
   - Log EVERY decision in `.logs/YYYY-MM-DD-session.md`
   - Log EVERY major update in `.progress/YYYY-MM-DD.md`
   - Log EVERY issue in `.troubleshoot/issue-XXX.md`
   - Update SESSION-MEMORY.md after EVERY major task

4. **Initialize Git repository and credentials**
   ```bash
   git init
   echo ".credentials/" >> .gitignore
   echo ".env*" >> .gitignore
   ```

5. **Set up credentials management structure**

### Phase 4: Development & Documentation 
**🔥 CONTINUOUS LOGGING REQUIRED - Log before, during, and after every action**

1. **Create comprehensive action plan** → Log in `.docs/action-plan.md`
2. **Create detailed todo list** → Track in SESSION-MEMORY.md
3. **Build project knowledge base** → Save all research in `.research/`
4. **Implement with continuous logging** → Every change logged
5. **Test and verify all functionality** → Results logged in `.progress/`

**⚠️ NEVER work without logging - if it's not logged, it didn't happen**

## 📋 SYSTEM PROMPTS & INITIALIZATION

### Critical Framework Files (Check These FIRST)
1. **STARTUP-REQUIREMENTS-FRAMEWORK.md** - Project planning and requirements
2. **ENTERPRISE-ENGINEERING-STANDARDS.md** - Technical architecture decisions
3. **IMPLEMENTATION-PATTERNS.md** - Code patterns and examples
4. **PROJECT-DECISION-MATRIX.md** - Stack selection and quick starts
5. **PROMPT-ENGINEERING-TEMPLATES.md** - Phase-specific approaches
6. **TROUBLESHOOTING-PROCESS.md** - Systematic problem solving
7. **SESSION-MEMORY.md** - Current project state and progress

### Initialization Prompt Template
```markdown
# NEW PROJECT INITIALIZATION

## Business Context
- Client: [business-name]
- Industry: [type]
- Goals: [main-objectives]
- Timeline: [deadline]

## Technical Stack Selection
- Frontend: [Next.js/React/Vue]
- Backend: [Supabase/Firebase/Custom]
- Deployment: [Vercel/Netlify/AWS]
- Integrations: [AI/Voice/Payment]

## Enterprise Backend Requirements
- Multi-tenant database schema
- Row Level Security policies
- Performance optimization
- Monitoring and alerting
- Business logic validation

## Success Criteria
- Security: 100% RLS coverage
- Performance: <200ms queries
- Scalability: Multi-tenant ready
- Operations: Full monitoring
```

## 🔧 TROUBLESHOOTING PROTOCOL

### 🚨 WHEN USER SAYS "RUN TROUBLESHOOTING PROTOCOL"

**This triggers an UNSTOPPABLE debugging sequence that continues until solution found**

### Phase 1: Immediate Assessment & Action Plan
1. **STOP all other work** - troubleshooting is now priority #1
2. **CREATE troubleshooting session log** → `.logs/YYYY-MM-DD-troubleshooting.md`
3. **DOCUMENT exact problem** with error messages, context, environment
4. **CREATE action plan** with systematic investigation steps
5. **SET "no-stop" commitment** - we don't quit until solved

### Phase 2: Systematic Investigation (Never Stop Until Solved)
**Follow this decision tree in EXACT order - log every step:**

1. **Has this error occurred before?** 
   - CHECK `.troubleshoot/` for identical issues
   - CHECK `.logs/` for similar problems in past sessions
   - If found → Apply previous solution, verify, document outcome

2. **Is this a known pattern?** 
   - CHECK `IMPLEMENTATION-PATTERNS.md`
   - CHECK `TROUBLESHOOTING-PROCESS.md`
   - If pattern found → Apply pattern, test, document

3. **Is this a framework/dependency issue?**
   - CHECK package.json versions
   - CHECK framework documentation
   - CHECK environment variables and configuration
   - If issue found → Fix, test, document

4. **Is this a code logic issue?**
   - ANALYZE recent changes
   - REVIEW git diff for suspicious modifications
   - TEST individual components
   - If logic error found → Fix, test, document

5. **Is this an environment issue?**
   - CHECK .env files
   - CHECK deployment configuration
   - CHECK browser/system compatibility
   - If environment issue → Fix, test, document

### Phase 3: Advanced Debugging (When Standard Steps Fail)
**If problem persists after Phase 2 - escalate investigation:**

6. **Deep code analysis**
   - TRACE execution flow step by step
   - ADD debugging logs to identify failure point
   - ISOLATE problem to specific function/component

7. **External research**
   - SEARCH Stack Overflow for exact error
   - CHECK official documentation
   - RESEARCH GitHub issues for similar problems

8. **Experimental solutions**
   - TRY alternative approaches
   - TEST edge cases and boundary conditions
   - EXPERIMENT with different configurations

### Phase 4: Solution Implementation & Prevention
**Once solution found:**

9. **IMPLEMENT fix** with thorough testing
10. **DOCUMENT complete solution** in `.troubleshoot/issue-XXX.md`
11. **UPDATE prevention measures** to avoid recurrence
12. **COMMIT working solution** with detailed explanation
13. **UPDATE troubleshooting knowledge base**

### 🚨 CRITICAL RULES - NO EXCEPTIONS

- **NEVER give up** - troubleshooting continues until solved
- **NEVER repeat failed attempts** - if something didn't work, try different approach
- **ALWAYS log every step** - document what was tried and results
- **ALWAYS verify solution** - test thoroughly before declaring solved
- **ALWAYS prevent recurrence** - update code/docs to prevent future issues

### Troubleshooting Session Log Template
```markdown
# Troubleshooting Session: YYYY-MM-DD

## PROBLEM STATEMENT
- Error: [exact error message]
- Context: [what was happening when error occurred]
- Environment: [local/staging/production]
- Severity: [blocker/critical/major/minor]

## COMMITMENT: This session will not end until problem is SOLVED

## INVESTIGATION LOG
### Step 1: [timestamp] - Check Previous Issues
- Action taken: [what was checked]
- Result: [what was found]
- Next step: [what to try next]

### Step 2: [timestamp] - Framework Analysis
- Action taken: [what was analyzed]
- Result: [findings]
- Next step: [next action]

[Continue for every step taken]

## SOLUTION FOUND
- Root cause: [what caused the issue]
- Fix applied: [exact solution implemented]
- Verification: [how solution was tested]
- Prevention: [measures to prevent recurrence]

## KNOWLEDGE BASE UPDATE
- Updated file: [which troubleshoot file updated]
- Pattern identified: [reusable pattern for future]
- Prevention measures: [what was added to prevent this]

## SESSION OUTCOME: ✅ PROBLEM SOLVED
```

### Emergency Escalation
**If problem cannot be solved after extensive investigation:**
- Document ALL attempts made
- Create detailed reproduction steps
- Escalate to senior developer with complete troubleshooting log
- Continue working on alternative solutions while awaiting help

### Common Issues & Solutions
Store in `.troubleshoot/issue-XXX.md`:
- Deployment failures
- Authentication errors
- Database connection issues
- Build process problems
- Environment variable conflicts

## 💾 BACKUP PROCEDURES & LOGGING REQUIREMENTS

### 🔥 MANDATORY LOGGING - Every Session, Every Update, Every Decision

**CRITICAL RULE: If it's not logged, it didn't happen**

### Real-Time Logging Requirements
1. **Before ANY work**: Create session log `.logs/YYYY-MM-DD-session.md`
2. **During work**: Log every major decision, error, and solution
3. **After work**: Update SESSION-MEMORY.md with current state
4. **Daily**: Save progress summary to `.progress/YYYY-MM-DD.md`

### Session Logging Template
```markdown
# Session Log: YYYY-MM-DD

## Session Goals
- [ ] Goal 1
- [ ] Goal 2

## Major Decisions Made
- Decision 1: [why made, what considered]
- Decision 2: [context and reasoning]

## Issues Encountered
- Issue 1: [problem] → Solution: [fix applied] → Reference: .troubleshoot/issue-001.md

## Code Changes
- File modified: [what changed and why]
- New features: [functionality added]

## Next Session Priorities
1. [priority 1]
2. [priority 2]

## Session End State
- Working: [what's currently functional]
- Broken: [what needs fixing]
- Blocked: [what's preventing progress]
```

### Daily Backup Protocol
1. **Code Backup**: Git commits with descriptive messages **+ session reference**
2. **Documentation Backup**: Every decision, research, and solution logged
3. **Database Backup**: Supabase automatic backups + manual exports
4. **Asset Backup**: Download all images/media to `.assets/`
5. **Credentials Backup**: Secure storage (never in Git)

### 🚨 MANDATORY Session Backup Checklist
**Complete this checklist EVERY session before stopping work:**

```markdown
- [ ] All code committed to Git with session reference
- [ ] Session logged in `.logs/YYYY-MM-DD-session.md` (MANDATORY)
- [ ] Major updates logged in `.progress/YYYY-MM-DD.md` (MANDATORY)
- [ ] SESSION-MEMORY.md updated with current state (MANDATORY)
- [ ] Any new assets saved to `.assets/`
- [ ] All research saved to `.research/`
- [ ] Any issues documented in `.troubleshoot/`
- [ ] Next session priorities documented
- [ ] Working/broken/blocked status documented
```

**🔴 DO NOT end session without completing this checklist**

### Recovery Procedures
1. **Code Recovery**: Git history and branch management
2. **Database Recovery**: Supabase point-in-time recovery
3. **Asset Recovery**: Cloud storage and local backups
4. **Documentation Recovery**: Session logs and progress files
5. **Environment Recovery**: Documented configuration steps

## 🔒 SECURITY & CREDENTIALS MANAGEMENT

### Security Standards
- **Project Isolation**: Each client gets separate folder/repo/deployment
- **Credential Isolation**: Never mix client credentials
- **Data Protection**: No cross-contamination between projects
- **Access Control**: Role-based permissions in all systems

### Credential Management
```markdown
# .credentials/api-keys.md Template

## Supabase
- Project URL: [url]
- Anon Key: [key]
- Service Role: [key]

## Vercel
- Token: [token]
- Team ID: [id]

## Third Party APIs
- OpenAI: [key]
- Stripe: [key]
- Other: [keys]

## Security Notes
- Last updated: [date]
- Access level: [permissions]
- Expiration: [if-applicable]
```

### .gitignore Requirements
```
.credentials/
.env
.env.local
.env.production
*.log
.vercel
node_modules/
.next/
```

## 📊 QUALITY ASSURANCE & VERIFICATION

### Pre-Completion Checklist
```markdown
- [ ] All functionality tested and working
- [ ] Responsive design verified (mobile/desktop)
- [ ] All links and navigation functional
- [ ] Authentic branding implemented
- [ ] Performance optimized (<3s load time)
- [ ] SEO and meta tags implemented
- [ ] Error handling implemented
- [ ] Security measures in place
- [ ] Documentation complete
- [ ] Deployment successful and verified
```

### Testing Procedures
1. **Functionality Testing**: Every feature manually tested
2. **Responsive Testing**: Mobile and desktop verification
3. **Performance Testing**: Load time and optimization
4. **Security Testing**: Authentication and data protection
5. **User Experience Testing**: Navigation and usability

### Deployment Verification
```bash
# Pre-deployment checks
npm run build          # Verify build success
npm run lint          # Check code quality
npm run test          # Run test suite

# Post-deployment checks
curl -I [production-url]  # Verify site is live
lighthouse [url]          # Performance audit
```

## 🔄 WORKFLOW AUTOMATION

### Automatic Workflow Enforcement

#### On Project Start
1. READ `PROJECT-DECISION-MATRIX.md` to select stack
2. CREATE project folder with standard structure
3. LOG every decision in `.logs/YYYY-MM-DD-session.md`
4. UPDATE `SESSION-MEMORY.md` after each major task

#### Before Writing Code
**🔴 MANDATORY: Check ALL logs to prevent redundancy and wasted effort**

1. **CHECK `.troubleshoot/`** → Has this exact problem been solved before?
2. **CHECK `.progress/`** → Has this task already been completed?
3. **CHECK `.logs/`** → What was tried in previous sessions?
4. **CHECK `.research/`** → Has this information already been gathered?
5. **CHECK `IMPLEMENTATION-PATTERNS.md`** → Is there an existing pattern?
6. **CHECK `SESSION-MEMORY.md`** → What's the current state and blockers?

**⚠️ NEVER repeat work that's already been done - always check logs first**

7. **USE appropriate prompt** from `PROMPT-ENGINEERING-TEMPLATES.md`

#### When Stuck/Debugging
1. STOP - Don't repeat failed attempts
2. READ `TROUBLESHOOTING-PROCESS.md`
3. CHECK `.troubleshoot/` for previous solutions
4. LOG the issue and solution in `.troubleshoot/issue-XXX.md`
5. UPDATE `SESSION-MEMORY.md` with blocker status

#### After Each Work Session
1. SAVE progress to `.progress/YYYY-MM-DD.md`
2. UPDATE `SESSION-MEMORY.md` with current state
3. COMMIT working code with descriptive message
4. LOG session summary in `.logs/`

## 📝 SESSION MEMORY TEMPLATE

Every project must maintain `SESSION-MEMORY.md`:
```markdown
# Current Project State

## Last Updated: [timestamp]

## Completed
- [x] Task 1 (reference: .logs/2024-01-15-session.md#task1)
- [x] Task 2 (reference: .progress/2024-01-15.md)

## In Progress
- [ ] Current task: [description]
- Blocker: [if any]
- Next step: [specific action]

## Environment
- Stack: [Next.js + Supabase]
- Deployed URL: [vercel-url]
- Last deployment: [timestamp]

## Known Issues
- Issue 1: [description] (solution: .troubleshoot/issue-001.md)

## Credentials Location
- API Keys: .credentials/api-keys.md
- Deployment: .credentials/deployment.md

## Next Session Priorities
1. [priority-1]
2. [priority-2]
3. [priority-3]
```

## 🎯 SPECIALIZED AGENTS & TOOLS

### Available Specialized Agents
- **statusline-setup**: Configure Claude Code status line
- **output-style-setup**: Create custom output modes  
- **general-purpose**: Complex multi-step research and implementation

### MCP Tools Configuration
```bash
# Essential for this project
claude mcp add filesystem -- npx @modelcontextprotocol/server-filesystem [project-path]
claude mcp add git -- npx @modelcontextprotocol/server-git
claude mcp add nodejs -- npx @tymek/mcp-nodejs
```

### Multi-Agent Workflow
- Use specialized agents for complex research tasks
- Delegate image processing and media management
- Use separate agents for deployment and testing
- Coordinate multiple agents for large projects
- Always document which agent did what work

## ⚠️ CRITICAL REMINDERS

### Project Management
- **ASK QUESTIONS ONE AT A TIME** when starting new projects
- **SAVE EVERYTHING CONSTANTLY** - logs, docs, research, decisions
- **NEVER MERGE CLIENT PROJECTS** - maintain strict separation
- **VERIFY EVERYTHING WORKS** before reporting completion

### Development Standards
- **CREATE PROJECT-SPECIFIC CLAUDE.md** for each client
- **USE AUTHENTIC BRANDING** - real logos, colors, content
- **DOCUMENT ALL TROUBLESHOOTING** for future reference
- **DEPLOY MULTIPLE AGENTS** for complex tasks

### Security & Operations
- **MAINTAIN SECURITY** - protect client data and credentials
- **ALWAYS CHECK FRAMEWORKS FIRST** - Don't reinvent patterns
- **LOG BEFORE ATTEMPTING** - Document what you're trying
- **UPDATE SESSION MEMORY** - Keep state current

### Enterprise Requirements
- **NO EXCEPTIONS**: All backends must meet enterprise standards before frontend development
- **Security**: 100% RLS coverage, zero data leakage between tenants
- **Performance**: <200ms average query time, 99.9% uptime
- **Scalability**: Multi-tenant architecture supporting unlimited growth

## 📞 SUPPORT & ESCALATION

### When to Escalate
- Security vulnerabilities discovered
- Performance below enterprise standards
- Client data integrity concerns
- Framework violations
- Unresolvable technical blockers

### Documentation Requirements
- All escalations must include complete troubleshooting log
- Session memory state at time of issue
- Attempted solutions and their outcomes
- Impact assessment and timeline

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-18  
**Maintained By**: OS App Builder Enterprise Team