# New Project Setup Template

Comprehensive checklist for initializing a new project from zero to production-ready. Every project setup MUST follow this template to ensure consistency, security, and operational readiness.

---

## Project Metadata

| Field | Value |
|-------|-------|
| **Project Name** | [name] |
| **Repository** | [URL] |
| **Tech Stack** | [e.g., Next.js 15 + Supabase + Vercel] |
| **Created By** | [Name] |
| **Date** | YYYY-MM-DD |
| **Target Launch** | YYYY-MM-DD |

---

## Phase 1: Repository and Version Control

### 1.1 Repository Initialization
- [ ] Create repository (GitHub) with appropriate visibility (public/private)
- [ ] Initialize with `.gitignore` appropriate for the tech stack
- [ ] Set default branch to `main`
- [ ] Enable branch protection rules on `main`:
  - [ ] Require pull request reviews (minimum 1)
  - [ ] Require status checks to pass before merging
  - [ ] Require branches to be up to date before merging
  - [ ] Disable force pushes to `main`
- [ ] Create branch naming convention document (e.g., `feat/`, `fix/`, `chore/`)

### 1.2 Repository Structure
- [ ] Create standard directory layout:
  ```
  /src          -- Source code
  /tests        -- Test files
  /docs         -- Documentation
  /scripts      -- Build and utility scripts
  /.github      -- GitHub Actions, templates, CODEOWNERS
  /public       -- Static assets (if web project)
  ```
- [ ] Add `README.md` with project overview, setup instructions, and architecture notes
- [ ] Add `CONTRIBUTING.md` with development workflow
- [ ] Add `CHANGELOG.md` (or configure auto-generation)
- [ ] Add `LICENSE` file

### 1.3 Git Configuration
- [ ] Configure `.gitignore` for all relevant patterns:
  - [ ] OS files (`.DS_Store`, `Thumbs.db`)
  - [ ] IDE files (`.idea/`, `.vscode/` -- except shared settings)
  - [ ] Dependencies (`node_modules/`, `venv/`, `.pip/`)
  - [ ] Build artifacts (`dist/`, `.next/`, `build/`)
  - [ ] Environment files (`.env`, `.env.local`, `.env.*.local`)
  - [ ] Secrets and credentials (`*.pem`, `*.key`, `credentials.json`)
- [ ] Set up commit message convention (Conventional Commits recommended)
- [ ] Configure pre-commit hooks (lint, format, type-check)

---

## Phase 2: Environment and Dependencies

### 2.1 Runtime Environment
- [ ] Specify runtime version (e.g., Node.js 20 LTS, Python 3.12)
- [ ] Add version file (`.nvmrc`, `.python-version`, `.tool-versions`)
- [ ] Document system prerequisites in README

### 2.2 Package Management
- [ ] Initialize package manager (`npm init`, `pip init`, `cargo init`, etc.)
- [ ] Install core dependencies
- [ ] Install development dependencies (linting, testing, formatting)
- [ ] Lock dependency versions (`package-lock.json`, `Pipfile.lock`, `Cargo.lock`)
- [ ] Configure dependency update strategy (Dependabot / Renovate)

### 2.3 Environment Variables
- [ ] Create `.env.example` with all required variables (no real values)
- [ ] Document each variable's purpose, format, and where to obtain it
- [ ] Set up environment validation on application startup
- [ ] Configure environment-specific overrides (development, staging, production)

| Variable | Purpose | Required | Default | Source |
|----------|---------|----------|---------|--------|
| `DATABASE_URL` | [Purpose] | Yes/No | [Default] | [Where to get it] |
| `API_KEY` | [Purpose] | Yes/No | [Default] | [Where to get it] |

---

## Phase 3: Code Quality and Linting

### 3.1 Linting
- [ ] Install and configure linter (ESLint, Ruff, Clippy, etc.)
- [ ] Set up configuration file with project rules
- [ ] Enable strict mode / recommended presets
- [ ] Configure import ordering rules
- [ ] Add lint script to package.json / Makefile

### 3.2 Formatting
- [ ] Install and configure formatter (Prettier, Black, rustfmt, etc.)
- [ ] Set up configuration file (`.prettierrc`, `pyproject.toml`, etc.)
- [ ] Ensure formatter and linter do not conflict
- [ ] Add format script to package.json / Makefile

### 3.3 Type Checking
- [ ] Configure TypeScript (`tsconfig.json`) or type checker for language
- [ ] Enable strict mode
- [ ] Set up path aliases if needed
- [ ] Add type-check script to package.json / Makefile

### 3.4 Pre-commit Hooks
- [ ] Install hook manager (husky, pre-commit, lefthook)
- [ ] Configure hooks to run on commit:
  - [ ] Lint staged files
  - [ ] Format staged files
  - [ ] Run type checker
- [ ] Configure hooks to run on push:
  - [ ] Run full test suite

---

## Phase 4: Testing Infrastructure

### 4.1 Unit Testing
- [ ] Install test framework (Jest, Vitest, pytest, cargo test)
- [ ] Configure test runner and coverage reporting
- [ ] Create first test to verify setup works
- [ ] Set minimum coverage threshold (aim for 80%+)
- [ ] Add test script to package.json / Makefile

### 4.2 Integration Testing
- [ ] Set up integration test environment
- [ ] Configure test database (separate from development)
- [ ] Set up test data seeding / fixtures
- [ ] Add integration test script

### 4.3 End-to-End Testing (if applicable)
- [ ] Install E2E framework (Playwright recommended, Cypress alternative)
- [ ] Configure browser targets (Chromium default)
- [ ] Create smoke test for critical user flows
- [ ] Add E2E test script

---

## Phase 5: CI/CD Pipeline

### 5.1 Continuous Integration
- [ ] Create CI workflow (`.github/workflows/ci.yml`):
  ```yaml
  # Minimum CI pipeline
  - Install dependencies
  - Run linter
  - Run type checker
  - Run unit tests
  - Run integration tests
  - Build project
  - Report coverage
  ```
- [ ] Configure CI to run on pull requests to `main`
- [ ] Configure CI to run on pushes to `main`
- [ ] Set up build caching for faster CI runs
- [ ] Configure parallel test execution if test suite is large

### 5.2 Continuous Deployment
- [ ] Choose deployment platform (Vercel, AWS, GCP, Fly.io, Railway)
- [ ] Configure staging environment with automatic deploys from `main`
- [ ] Configure production environment with manual promotion or tagged releases
- [ ] Set up preview deployments for pull requests (if supported)
- [ ] Configure deployment environment variables (separate from local)

### 5.3 Release Management
- [ ] Define versioning strategy (SemVer recommended)
- [ ] Configure changelog generation
- [ ] Set up release workflow (GitHub Releases, tags)

---

## Phase 6: Database and Data Layer

### 6.1 Database Setup
- [ ] Provision database (Supabase, PlanetScale, RDS, etc.)
- [ ] Configure connection pooling (if applicable)
- [ ] Set up database migrations framework
- [ ] Create initial migration with base schema
- [ ] Configure Row Level Security (if using Supabase)
- [ ] Set up database backups schedule

### 6.2 ORM / Query Layer
- [ ] Install and configure ORM or query builder (Prisma, Drizzle, SQLAlchemy)
- [ ] Generate initial types / models from schema
- [ ] Set up seed script for development data

---

## Phase 7: Security

### 7.1 Authentication
- [ ] Implement authentication (Supabase Auth, NextAuth, Clerk, etc.)
- [ ] Configure session management
- [ ] Set up RBAC or authorization layer if needed
- [ ] Test auth flows (signup, login, logout, password reset)

### 7.2 Security Hardening
- [ ] Configure CORS policies
- [ ] Set up CSP headers
- [ ] Enable HTTPS everywhere
- [ ] Configure rate limiting on API endpoints
- [ ] Set up input validation and sanitization
- [ ] Run `npm audit` / `pip audit` and resolve vulnerabilities
- [ ] Add security scanning to CI pipeline (Snyk, CodeQL, etc.)

### 7.3 Secrets Management
- [ ] Store all secrets in environment variables (never in code)
- [ ] Use platform secrets management (Vercel env, GitHub Secrets, AWS SSM)
- [ ] Rotate default passwords and keys
- [ ] Document secrets rotation procedure

---

## Phase 8: Monitoring and Observability

### 8.1 Error Tracking
- [ ] Set up error tracking (Sentry recommended)
- [ ] Configure source maps upload for production
- [ ] Set up alert rules for critical errors
- [ ] Test error reporting with intentional error

### 8.2 Logging
- [ ] Configure structured logging (JSON format for production)
- [ ] Set log levels (debug, info, warn, error)
- [ ] Ensure no sensitive data is logged (PII, tokens, passwords)
- [ ] Set up log aggregation if needed (Datadog, CloudWatch, Axiom)

### 8.3 Performance Monitoring
- [ ] Set up APM or performance monitoring
- [ ] Configure Web Vitals tracking (if web project)
- [ ] Set up uptime monitoring (Betteruptime, Pingdom, UptimeRobot)
- [ ] Define SLOs (Service Level Objectives) for key metrics

### 8.4 Alerting
- [ ] Configure alert channels (Slack, email, PagerDuty)
- [ ] Set up alerts for: error rate spikes, latency increases, downtime
- [ ] Define on-call rotation (if team > 1)

---

## Phase 9: Documentation

- [ ] README.md covers: what, why, how to run, how to deploy
- [ ] API documentation (OpenAPI/Swagger if applicable)
- [ ] Architecture diagram (even a simple ASCII one)
- [ ] Runbook for common operations (deploy, rollback, debug)
- [ ] ADR for all significant architecture decisions

---

## Phase 10: Final Verification

- [ ] Fresh clone and setup works (`git clone` + follow README)
- [ ] All CI checks pass
- [ ] Staging deployment works
- [ ] Core user flow works end-to-end
- [ ] Error tracking captures test errors
- [ ] Monitoring dashboards show data
- [ ] Security scan passes with no critical/high findings

---

## Sign-Off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Tech Lead | [Name] | YYYY-MM-DD | [ ] |
| Product Owner | [Name] | YYYY-MM-DD | [ ] |

---

## Usage Notes

- Not every project needs every phase. Skip phases that do not apply but document why.
- Complete phases in order -- later phases depend on earlier ones.
- This template should be copied into the project's `/docs/` directory and tracked as a living document.
- Review and update this template quarterly to incorporate new best practices.
