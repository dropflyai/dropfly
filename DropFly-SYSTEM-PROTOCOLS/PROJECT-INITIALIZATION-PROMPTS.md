# 🎯 Project Initialization Prompt Templates

## 🚨 CRITICAL: NEW PROJECT STARTUP SEQUENCE

**When user says "let's start a new project" - follow this EXACT sequence:**

### Phase 1: Requirements Gathering (MANDATORY: ONE AT A TIME)
```
🔴 STOP - Ask these questions ONE AT A TIME until complete:

1. What is the business/client name?
2. What type of business is it? (restaurant, retail, service, etc.)
3. What is the main goal of this project? (demo site, full website, specific features?)
4. Do they have an existing website or online presence to research?
5. What are the key features they need? (AI chat, voice agent, e-commerce, etc.)
6. What is their brand colors/aesthetic preference?
7. Who is their target audience?
8. What is the timeline/priority level?

✅ ONLY proceed to Phase 2 when ALL requirements are documented
```

### Phase 2: Project Setup & Logging Infrastructure
```
🔥 CRITICAL: Set up complete logging system BEFORE any development

1. Create project folder with standard structure:
   mkdir project-name
   cd project-name
   mkdir .logs .docs .research .assets .credentials .troubleshoot .progress

2. Initialize comprehensive logging system:
   touch .logs/$(date +%Y-%m-%d)-project-initialization.md
   touch SESSION-MEMORY.md
   touch CLAUDE.md

3. Start logging IMMEDIATELY:
   - Log EVERY decision in .logs/YYYY-MM-DD-session.md
   - Check ALL existing logs before starting ANY work
   - Update SESSION-MEMORY.md after EVERY major task

4. Initialize Git repository:
   git init
   echo ".credentials/" >> .gitignore
   echo ".env*" >> .gitignore
```

### Phase 3: Enterprise Backend Framework
## 🚀 Primary Project Kickoff Prompt

**Use this prompt to start ANY new project with enterprise-grade backend:**

```
I'm starting a new project. Apply the Enterprise Backend Framework methodology:

PROJECT DETAILS:
- Name: [PROJECT_NAME]
- Type: [e.g., HOA management, e-commerce, SaaS platform]
- Primary users: [e.g., residents, customers, team members]
- Scale: [e.g., 100-500 users per tenant, 1000+ organizations]

REQUIREMENTS:
1. **Multi-tenant Architecture**: Each [TENANT_TYPE] completely isolated
2. **Core Entities**: [List 5-8 main database entities]
3. **User Roles**: [List user permission levels]
4. **Key Features**: [List 3-5 primary features]

IMPLEMENTATION STANDARD:
- Database: 15+ tables with comprehensive relationships
- Security: RLS policies on ALL tables with multi-tenant isolation
- Performance: Strategic indexes for all expected queries
- Automation: Triggers for counters, audit logs, and notifications
- Business Logic: Edge Functions with proper validation
- Monitoring: Health checks, performance tracking, and alerting
- Documentation: Complete setup guides and operational procedures

TARGET: Enterprise-grade, production-ready backend infrastructure in 3-4 hours.

Start with database schema design and work through each phase systematically.
```

## 🔍 Quality Review Prompt

**Use this to audit any backend implementation:**

```
Perform a comprehensive Enterprise Backend Framework audit on this implementation:

SECURITY AUDIT:
- ✅ Row Level Security enabled on ALL tables?
- ✅ Multi-tenant policies prevent cross-tenant data access?
- ✅ All user inputs properly validated and sanitized?
- ✅ JWT authentication properly implemented?
- ✅ Audit logging captures all sensitive operations?

PERFORMANCE AUDIT:
- ✅ Indexes on all foreign keys and frequently queried columns?
- ✅ Query performance optimized (target <200ms average)?
- ✅ Slow query monitoring implemented?
- ✅ Connection pooling and resource management configured?

SCALABILITY AUDIT:
- ✅ Multi-tenant architecture supports unlimited growth?
- ✅ Database design normalized and efficient?
- ✅ Real-time features implemented without blocking?
- ✅ Background jobs and automation properly configured?

OPERATIONAL AUDIT:
- ✅ Health monitoring and alerting systems functional?
- ✅ Backup and recovery procedures documented?
- ✅ Error tracking and debugging tools configured?
- ✅ Documentation complete and accurate?

If ANY item fails, implement immediately to meet enterprise standards.
```

## ⚡ Quick Stack Decision Prompt

**Use this for rapid technology decisions:**

```
Based on these project requirements, recommend the optimal backend stack:

PROJECT: [Brief description]
SCALE: [Expected users/data volume]
FEATURES: [Key functionality needed]
TIMELINE: [Development timeline]
BUDGET: [Infrastructure budget considerations]

EVALUATE:
- Database: PostgreSQL (Supabase) vs alternatives
- Authentication: Supabase Auth vs custom
- Real-time: Supabase Realtime vs WebSockets
- Functions: Edge Functions vs traditional API
- Storage: Supabase Storage vs cloud providers
- Monitoring: Built-in vs third-party tools

Provide specific recommendations with justification and implementation approach.
```

## 🏗️ Architecture Design Prompt

**Use this for complex system design:**

```
Design a comprehensive backend architecture for:

BUSINESS CONTEXT:
- Industry: [e.g., Real Estate, Healthcare, FinTech]
- Business Model: [e.g., B2B SaaS, Marketplace, Community Platform]
- Revenue Model: [e.g., Subscriptions, Transactions, Advertising]

TECHNICAL REQUIREMENTS:
- Data Types: [e.g., user profiles, transactions, content, analytics]
- Integrations: [e.g., payment processing, email, SMS, external APIs]
- Compliance: [e.g., GDPR, HIPAA, SOC2, PCI-DSS]
- Performance: [response time and throughput requirements]

DESIGN SPECIFICATIONS:
1. **Entity Relationship Diagram**: Complete data model with relationships
2. **Security Architecture**: Multi-tenant isolation and access control
3. **API Design**: RESTful endpoints and real-time subscriptions
4. **Integration Strategy**: External service connections and webhooks
5. **Monitoring Strategy**: Observability and operational excellence
6. **Scaling Plan**: Growth strategy and performance optimization

Deliver enterprise-grade architecture that can scale from startup to unicorn.
```

## 🔧 Technical Deep-Dive Prompts

### Database Design Prompt
```
Create a comprehensive database schema for [PROJECT_TYPE]:

ENTITY ANALYSIS:
- Core Business Objects: [Primary entities]
- Relationships: [How entities connect]
- Data Patterns: [Access patterns and query needs]
- Growth Projections: [Scaling requirements]

TECHNICAL SPECIFICATIONS:
- Tables: 15+ with proper normalization
- Constraints: Foreign keys, unique constraints, check constraints
- Indexes: Performance optimization for all queries
- Triggers: Automation and data integrity
- Views: Complex query simplification
- Functions: Business logic and validation

SECURITY REQUIREMENTS:
- Multi-tenant Row Level Security
- Role-based access control
- Audit logging for compliance
- Data privacy and encryption

OUTPUT: Complete SQL schema ready for production deployment.
```

### API Architecture Prompt
```
Design a complete API architecture for [PROJECT_NAME]:

API STRUCTURE:
- RESTful Endpoints: CRUD operations for all entities
- Real-time Subscriptions: Live data updates
- Webhook System: External integrations
- Background Jobs: Async processing

SECURITY FRAMEWORK:
- Authentication: JWT token validation
- Authorization: Role-based permissions
- Rate Limiting: Abuse prevention
- Input Validation: Data sanitization

PERFORMANCE OPTIMIZATION:
- Caching Strategy: Query and response caching
- Connection Pooling: Database optimization
- Load Balancing: Horizontal scaling
- Monitoring: Performance tracking

INTEGRATION POINTS:
- Payment Processing: Stripe/similar
- Email/SMS: Notification services
- File Storage: Media handling
- External APIs: Third-party services

Deliver production-ready API with enterprise-grade reliability.
```

## 📋 Project Phase Checklists

### Phase 1: Planning (30 min)
```
BUSINESS REQUIREMENTS ✅
- [ ] Core user personas identified
- [ ] Key user journeys mapped
- [ ] MVP feature set defined
- [ ] Success metrics established

TECHNICAL ARCHITECTURE ✅
- [ ] Technology stack decided
- [ ] Scalability requirements planned
- [ ] Integration needs identified
- [ ] Security requirements defined
```

### Phase 2: Database (60 min)
```
SCHEMA DESIGN ✅
- [ ] 15+ tables with relationships
- [ ] All constraints and validations
- [ ] Multi-tenant isolation design
- [ ] Performance index strategy

SECURITY IMPLEMENTATION ✅
- [ ] RLS enabled on all tables
- [ ] Comprehensive access policies
- [ ] Audit logging framework
- [ ] Data privacy compliance
```

### Phase 3: Infrastructure (90 min)
```
BACKEND SERVICES ✅
- [ ] Authentication system
- [ ] API endpoints and functions
- [ ] Real-time subscriptions
- [ ] Background job processing

AUTOMATION & MONITORING ✅
- [ ] Database triggers
- [ ] Health monitoring
- [ ] Error tracking
- [ ] Performance analytics
```

### Phase 4: Production (45 min)
```
DEPLOYMENT READINESS ✅
- [ ] Environment configuration
- [ ] Security audit passed
- [ ] Performance testing completed
- [ ] Documentation finalized

OPERATIONAL EXCELLENCE ✅
- [ ] Monitoring dashboards
- [ ] Alert systems configured
- [ ] Backup procedures tested
- [ ] Incident response plan
```

## 🎨 Template Repository

Store these files in every new project:

```
/project-root/
├── .prompts/
│   ├── initialization.md
│   ├── quality-review.md
│   ├── architecture-design.md
│   └── technical-deep-dive.md
├── .templates/
│   ├── database-schema.sql
│   ├── rls-policies.sql
│   ├── edge-functions/
│   └── monitoring.sql
└── .checklists/
    ├── planning-phase.md
    ├── database-phase.md
    ├── infrastructure-phase.md
    └── production-phase.md
```

**Usage**: Copy these prompts into Claude Code at project start to ensure enterprise-grade backend from day one.