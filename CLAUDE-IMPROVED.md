# CLAUDE.md - Streamlined Instructions for Claude Code

## 🎯 Core Principles
- **Efficiency First**: Minimize redundancy, maximize output
- **Adaptive Workflow**: Match approach to project needs
- **Smart Defaults**: Use proven patterns unless specified otherwise
- **Progressive Enhancement**: Start simple, scale as needed

## 🚀 Project Initialization

### Quick Start (Default Path)
When user says "new project" or similar:
1. **Gather Requirements** (ask concisely, can batch related questions)
2. **Choose Approach**:
   - Demo/Prototype → Start with frontend, mock data
   - Production App → Apply backend framework first
   - Feature Addition → Analyze existing code first
3. **Initialize Structure** (only what's needed)
4. **Begin Implementation** (log decisions, not every action)

### Project Structure (Create as Needed)
```
project-name/
├── .logs/          # Major decisions only
├── .troubleshoot/  # Solutions to complex problems
├── CLAUDE.md       # Project-specific context
└── [project files]
```

## 💻 Development Workflow

### Smart Defaults
- **Stack**: Next.js + Supabase (unless specified)
- **Styling**: Tailwind CSS with dark theme
- **State**: Zustand for global, React Query for server
- **Auth**: Supabase Auth with RLS
- **Deployment**: Vercel

### Quality Standards
- **Security**: Input validation, environment variables, HTTPS
- **Performance**: Lazy loading, optimized images, caching
- **Accessibility**: Semantic HTML, ARIA labels, keyboard nav
- **Testing**: Critical paths only (unless specified)

## 🔧 Troubleshooting

### Efficient Debugging
1. **Check existing solutions** (.troubleshoot/ folder)
2. **Identify pattern** (build/runtime/network/database)
3. **Apply standard fix** (clear cache, check env, verify deps)
4. **Research if needed** (docs, Stack Overflow)
5. **Document solution** (only if complex/unique)

### Common Fixes
```bash
# Dependency issues
rm -rf node_modules package-lock.json && npm install

# Build errors
npm run build 2>&1 | head -20  # See first errors

# Environment issues
cp .env.example .env.local && [edit values]
```

## 📝 Documentation

### When to Document
- **Always**: API endpoints, database schema, deployment steps
- **Complex Logic**: Business rules, algorithms, integrations
- **Never**: Obvious code, standard patterns, temporary work

### Logging Strategy
- **Major Decisions**: Why choosing X over Y
- **Problem Solutions**: Root cause and fix
- **Skip**: Routine tasks, standard implementations

## 🎨 UI/UX Standards

### Design System
- **Theme**: Dark mode with accent color
- **Components**: Consistent, reusable, accessible
- **Responsive**: Mobile-first approach
- **Animations**: Subtle, performant, optional

## 🚢 Deployment

### Standard Process
1. Test locally
2. Push to GitHub
3. Deploy to Vercel
4. Verify production
5. Monitor for issues

## 🏗️ Backend Framework (When Needed)

### Production Apps Only
Apply enterprise framework for:
- Multi-tenant SaaS
- Financial applications  
- Healthcare systems
- Large-scale platforms

### Rapid Prototypes
Skip heavy backend for:
- Demos and MVPs
- Landing pages
- Simple websites
- Proof of concepts

## ⚡ Performance Optimization

### Frontend
- Code splitting
- Image optimization
- Bundle analysis
- Caching strategy

### Backend  
- Database indexing
- Query optimization
- Connection pooling
- Rate limiting

## 🔒 Security Essentials

### Always Required
- Environment variables for secrets
- Input validation and sanitization
- HTTPS in production
- Authentication for sensitive routes

### Additional for Production
- Rate limiting
- CORS configuration
- Security headers
- Audit logging

## 🎯 Success Metrics

### Code Quality
- Works as intended
- No critical bugs
- Reasonable performance
- Basic security

### User Experience
- Intuitive interface
- Fast load times
- Mobile responsive
- Error handling

## 💡 Adaptive Intelligence

### Recognize Context
- **"Quick demo"** → Prioritize speed over perfection
- **"Enterprise app"** → Full framework and testing
- **"Fix this bug"** → Focused troubleshooting
- **"Add feature"** → Integrate with existing patterns

### Adjust Approach
- **Time-sensitive** → Use shortcuts, document debt
- **Learning project** → Explain decisions, teach concepts
- **Production critical** → Full testing, monitoring, docs
- **Experimental** → Try new approaches, fail fast

## 🚫 Avoid These Patterns

### Efficiency Killers
- Asking one question at a time unnecessarily
- Creating files before they're needed
- Logging every minor action
- Over-engineering simple solutions

### Bad Practices
- Hardcoded secrets
- Unhandled errors
- Blocking operations
- Memory leaks

## ✅ Checklist for Completion

Before marking any task complete:
- [ ] Core functionality works
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Environment variables set
- [ ] Deployed successfully (if applicable)

## 🔄 Continuous Improvement

### Learn from Each Project
- What worked well?
- What was challenging?
- What patterns emerged?
- What can be reused?

### Update Templates
- Save successful patterns
- Document unique solutions
- Share knowledge across projects
- Refine best practices

---

**Remember**: The goal is to build working software efficiently. Adapt these guidelines to each situation rather than following them rigidly.