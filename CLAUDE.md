# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm build`
- **Start production server**: `npm start`
- **Install dependencies**: `npm install`

## Architecture Overview

This is a Next.js application built as a luxury app builder with a dark theme and gold accent colors (#f4c900). The project follows a component-based architecture:

**Component System**: Located in `components/ui/`, the project uses a custom UI component library with consistent styling:
- All components use a dark theme with black/gray backgrounds
- Gold gradient accents (#f4c900 to #b68600) for primary elements
- Rounded corners (20px-30px radius) and shadow effects for luxury appearance
- Components are functional React components with props-based configuration

**Styling Approach**: 
- Global styles in `styles/globals.css` set black background and white text
- Inline Tailwind CSS classes for component styling
- Consistent color palette: black (#000, #111, #222), gold (#f4c900), and gradients
- Typography uses serif fonts for luxury aesthetic

**Tech Stack**:
- Next.js framework with React 
- Framer Motion for animations
- React Hot Toast for notifications
- No TypeScript - all files use .js extension

**Project Structure**:
- `components/ui/` - Reusable UI components (Button, Card, Input, Switch, Textarea)
- `pages/` - Next.js pages (currently empty)
- `public/images/` - Static assets
- `styles/` - Global CSS

The components are designed for an "elite developer" experience with luxury branding and premium visual effects.

## 🏗️ ENTERPRISE BACKEND FRAMEWORK

**MANDATORY**: Every project MUST start with enterprise-grade backend infrastructure using our standardized framework.

### Framework Standards
- **Security First**: Multi-tenant RLS on ALL tables from day one
- **Performance Optimized**: Strategic indexes and query optimization
- **Production Ready**: Monitoring, alerts, and operational excellence
- **Scalable Architecture**: Designed for growth from startup to enterprise

### Implementation Requirements

**Before ANY frontend development:**
1. **Apply Enterprise Backend Framework** using `PROJECT-INITIALIZATION-PROMPTS.md`
2. **Database Schema**: 15+ tables with comprehensive relationships
3. **Security Policies**: RLS protection on every table
4. **Performance Optimization**: Indexes on all critical queries  
5. **Business Logic**: Edge Functions with proper validation
6. **Monitoring Systems**: Health checks and alerting
7. **Quality Gate**: Complete audit using `QUICK-START-REFERENCE.md`

### Framework Files
- `ENTERPRISE-BACKEND-FRAMEWORK.md` - Complete methodology and templates
- `PROJECT-INITIALIZATION-PROMPTS.md` - Copy-paste prompts for new projects
- `QUICK-START-REFERENCE.md` - Quality gates and checklists

### Success Criteria
- **Security**: 100% RLS coverage, zero data leakage between tenants
- **Performance**: <200ms average query time, 99.9% uptime
- **Scalability**: Multi-tenant architecture supporting unlimited growth
- **Operations**: Full monitoring with automated alerts and recovery

**NO EXCEPTIONS**: All backends must meet enterprise standards before proceeding to frontend development.

## PROJECT MANAGEMENT WORKFLOW

### New Project Initialization

**CRITICAL**: When user says "let's start a new project", follow this exact sequence:

0. **FIRST: Apply Enterprise Backend Framework** - Use the initialization prompt from `PROJECT-INITIALIZATION-PROMPTS.md` to ensure enterprise-grade backend from day one

1. **Ask Questions (ONE AT A TIME)** until you have complete information:
   - What is the business/client name?
   - What type of business is it? (restaurant, retail, service, etc.)
   - What is the main goal of this project? (demo site, full website, specific features?)
   - Do they have an existing website or online presence to research?
   - What are the key features they need? (AI chat, voice agent, e-commerce, etc.)
   - What is their brand colors/aesthetic preference?
   - Who is their target audience?
   - What is the timeline/priority level?

2. **Complete Backend Framework Implementation** - Database schema, RLS policies, Edge Functions, monitoring, and documentation

3. **Create Project-Specific CLAUDE.md** in the new project folder with:
   - Business information and goals
   - Brand guidelines and color schemes
   - Feature requirements
   - Target audience and messaging
   - Technical specifications
   - Deployment requirements

4. **Create Comprehensive Action Plan** before starting any work
5. **Create Detailed Todo List** with all tasks broken down
6. **Create Project Knowledge Base** with all business information

### Project Isolation & Security

**ABSOLUTE RULE**: Projects are ALWAYS separated and NEVER merged
- Each client gets their own dedicated folder
- Each project gets its own Git repository
- Each project gets its own Vercel deployment
- No cross-contamination of client data, designs, or code
- All client information stays within their project folder

### Documentation & Logging

**Save Everything - Save Constantly**:
- Create `.logs/` folder in each project for session logs
- Create `.docs/` folder for all documentation
- Create `.research/` folder for business research and web scraping results
- Create `.assets/` folder for downloaded images, logos, and media
- Save all API responses, web scraping results, and research in markdown files
- Log every major decision and why it was made
- Save troubleshooting steps and solutions
- Never repeat the same research - always check existing files first

### Credentials & Security Management

**Create `.credentials/` folder structure**:
- `.credentials/api-keys.md` - API keys and tokens
- `.credentials/deployment.md` - Vercel tokens, GitHub keys
- `.credentials/accounts.md` - Login information and accounts
- **NEVER commit credentials to Git** - add to .gitignore
- Always encrypt or obfuscate sensitive information
- Use environment variables for production deployments

### Quality Assurance & Verification

**Before Reporting Completion**:
1. **Thoroughly examine your work** - review every file change
2. **Test functionality** - verify all features work as expected
3. **Check deployment** - ensure live site is actually updated
4. **Verify branding** - confirm authentic colors, logos, and content
5. **Test responsive design** - check mobile and desktop views
6. **Validate links and navigation** - ensure all pages work
7. **If anything is broken** - create new action steps and keep working until solved

**Never report completion until everything is verified working**

### Multi-Agent Workflow

**Deploy Multiple Agents When Needed**:
- Use specialized agents for complex research tasks
- Delegate image processing and media management
- Use separate agents for deployment and testing
- Coordinate multiple agents for large projects
- Always document which agent did what work

## RESTAURANT/BUSINESS DEMO CREATION

### Research & Web Scraping Guidelines
- Always gather authentic business information from official sources
- Scrape menus, hours, locations, and contact information
- Download real logos and branding assets
- Capture authentic photos from Yelp, Google, social media
- Create comprehensive knowledge base with all business details
- Research competitors and industry standards

### Branding & Authentic Design
- Use authentic brand colors and logos
- Match existing visual identity and aesthetic
- Respect brand guidelines and maintain consistency
- Create carousel hero sections with high-quality images
- Use professional food/product photography
- Implement glass-morphism and modern design elements

### AI Integration Templates
- AI chat ordering system for restaurants/retail
- Voice agent integration for phone orders
- Admin dashboard for order management
- Real-time analytics and reporting
- Customer service automation
- Integration-ready APIs and webhooks

### Deployment Standards
- Create dedicated GitHub repository per project
- Deploy to separate Vercel project with proper naming
- Use authentic domain-appropriate URLs
- Implement proper SEO and meta tags
- Ensure mobile responsiveness and performance
- Test all functionality before reporting completion

## Long-term Memory & Context

This CLAUDE.md file serves as persistent memory between Claude Code sessions. Key points:

- **Project Identity**: OS App Builder - luxury app builder for elite developers by Optic Studios
- **Design Language**: Dark theme with gold accents, serif fonts, rounded corners, shadows
- **Component Patterns**: Functional React components with consistent prop interfaces
- **Working Dependencies**: All npm commands verified working (install, dev, build, start)
- **Portfolio**: Multiple client demos (Mike's Deli, StormBurger, etc.) - each isolated and secure

## MCP Tools Setup

For enhanced capabilities, configure these MCP servers:

**Essential for this project:**
```bash
# Filesystem access for component development
claude mcp add filesystem -- npx @modelcontextprotocol/server-filesystem /Users/rioallen/Documents/OS-App-Builder

# Git integration for version control
claude mcp add git -- npx @modelcontextprotocol/server-git

# Node.js development assistance
claude mcp add nodejs -- npx @tymek/mcp-nodejs
```

**Configuration location**: `~/.claude.json` or use CLI commands above

## Specialized Agents Available

- **statusline-setup**: For configuring Claude Code status line
- **output-mode-setup**: For creating custom output modes
- **general-purpose**: For complex multi-step research and implementation tasks

Use the Task tool to delegate complex work to specialized agents for better efficiency.

## CRITICAL FRAMEWORKS TO REFERENCE

**ALWAYS CHECK THESE FILES FIRST:**
1. **STARTUP-REQUIREMENTS-FRAMEWORK.md** - For project planning and requirements
2. **ENTERPRISE-ENGINEERING-STANDARDS.md** - For technical architecture decisions
3. **IMPLEMENTATION-PATTERNS.md** - For code patterns and examples
4. **PROJECT-DECISION-MATRIX.md** - For stack selection and quick starts
5. **PROMPT-ENGINEERING-TEMPLATES.md** - For phase-specific approaches
6. **TROUBLESHOOTING-PROCESS.md** - For systematic problem solving (check before debugging)
7. **SESSION-MEMORY.md** - For current project state and progress

## AUTOMATIC WORKFLOW ENFORCEMENT

### On Project Start
1. **READ** `PROJECT-DECISION-MATRIX.md` to select stack
2. **CREATE** project folder with standard structure:
   ```
   project-name/
   ├── .logs/          # Session logs (YYYY-MM-DD-session.md)
   ├── .docs/          # Documentation
   ├── .research/      # Web scraping, API responses
   ├── .troubleshoot/  # Problem solutions
   ├── .progress/      # Completed tasks log
   ├── CLAUDE.md       # Project-specific instructions
   └── SESSION-MEMORY.md # Current state
   ```
3. **LOG** every decision in `.logs/YYYY-MM-DD-session.md`
4. **UPDATE** `SESSION-MEMORY.md` after each major task

### Before Writing Code
1. **CHECK** `.troubleshoot/` for similar problems already solved
2. **CHECK** `IMPLEMENTATION-PATTERNS.md` for the correct pattern
3. **CHECK** `.progress/` to avoid repeating completed work
4. **USE** appropriate prompt from `PROMPT-ENGINEERING-TEMPLATES.md`

### When Stuck/Debugging
1. **STOP** - Don't repeat attempts
2. **READ** `TROUBLESHOOTING-PROCESS.md`
3. **CHECK** `.troubleshoot/` for previous solutions
4. **LOG** the issue and solution in `.troubleshoot/issue-XXX.md`
5. **UPDATE** `SESSION-MEMORY.md` with blocker status

### After Each Work Session
1. **SAVE** progress to `.progress/YYYY-MM-DD.md`
2. **UPDATE** `SESSION-MEMORY.md` with current state
3. **COMMIT** working code with descriptive message
4. **LOG** session summary in `.logs/`

## SESSION MEMORY TEMPLATE

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
```

## TROUBLESHOOTING DECISION TREE

Before attempting ANY fix:
1. **Has this error occurred before?** → Check `.troubleshoot/`
2. **Is this a known pattern?** → Check `IMPLEMENTATION-PATTERNS.md`
3. **Is this a framework issue?** → Check framework docs
4. **Is this a dependency issue?** → Check package.json versions
5. **Is this an environment issue?** → Check .env variables

If none apply, create new troubleshooting log.

## IMPORTANT REMINDERS

- **ASK QUESTIONS ONE AT A TIME** when starting new projects
- **SAVE EVERYTHING CONSTANTLY** - logs, docs, research, decisions
- **NEVER MERGE CLIENT PROJECTS** - maintain strict separation
- **VERIFY EVERYTHING WORKS** before reporting completion
- **CREATE PROJECT-SPECIFIC CLAUDE.md** for each client
- **USE AUTHENTIC BRANDING** - real logos, colors, content
- **DOCUMENT ALL TROUBLESHOOTING** for future reference
- **DEPLOY MULTIPLE AGENTS** for complex tasks
- **MAINTAIN SECURITY** - protect client data and credentials
- **ALWAYS CHECK FRAMEWORKS FIRST** - Don't reinvent patterns
- **LOG BEFORE ATTEMPTING** - Document what you're trying
- **UPDATE SESSION MEMORY** - Keep state current