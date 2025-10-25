# DropFly Developer Onboarding

Welcome to DropFly! This guide will get you up and running quickly.

## Day 1: Setup & Environment

### Required Tools
- **Node.js** (Latest LTS)
- **Git** with SSH keys configured
- **VS Code** with recommended extensions
- **Docker Desktop**
- **Claude Code CLI** for AI assistance

### Development Environment
```bash
# Clone company repository
git clone git@github.com:dropfly/main-repo.git
cd main-repo

# Install global tools
npm install -g @dropfly/cli

# Setup local environment
npm run setup:dev
```

### VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- GitLens
- Thunder Client
- Prettier
- ESLint

## Day 2-3: Codebase Exploration

### Key Repositories
1. **UI Components** (`/packages/ui-components`)
2. **Design System** (`/packages/themes`)
3. **Shared Utils** (`/packages/utils`)
4. **Project Templates** (`/templates`)

### First Task
Build a simple component using our design system:
1. Create a new Card component variant
2. Add it to Storybook
3. Write tests
4. Submit PR for review

## Week 1: Standards & Processes

### Required Reading
- [Coding Standards](/docs/standards/coding.md)
- [Design Guidelines](/docs/standards/design.md)
- [Security Policies](/docs/standards/security.md)
- [Testing Strategy](/docs/standards/testing.md)

### Team Rituals
- **Monday**: Sprint planning
- **Wednesday**: Architecture review
- **Friday**: Demo day & retrospective
- **Daily**: Standups at 9 AM

### Communication
- **Slack**: Day-to-day communication
- **GitHub**: Code reviews and discussions
- **Notion**: Documentation and project planning
- **Figma**: Design collaboration

## Resources

### Internal Tools
- **DropFly CLI**: Project scaffolding and utilities
- **Component Library**: Reusable UI components
- **Design Tokens**: Consistent styling system
- **Testing Suite**: Automated testing framework

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://framer.com/motion)

## Getting Help

- **Buddy System**: You'll be paired with a senior developer
- **Office Hours**: CTO available Tuesdays 2-4 PM
- **Documentation**: Everything is documented in `/docs`
- **Team Chat**: #help channel for quick questions

## Your First Week Goals

- [ ] Complete environment setup
- [ ] Submit first PR
- [ ] Attend all team meetings
- [ ] Read core documentation
- [ ] Complete sample project
- [ ] Get familiar with deployment process

Welcome to the team! 🚀