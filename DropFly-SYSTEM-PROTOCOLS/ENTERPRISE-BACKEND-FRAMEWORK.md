# 🏗️ Enterprise Backend Framework
**The Complete System for Production-Ready Backend Architecture**

## 🎯 Framework Philosophy

**Rule #1**: Every project starts with enterprise-grade backend infrastructure  
**Rule #2**: Security, scalability, and monitoring are non-negotiable from day one  
**Rule #3**: No shortcuts - build it right the first time  

## 📋 Project Initialization Checklist

### Phase 1: Architecture Planning (30 minutes)
- [ ] **Business Requirements Analysis**
  - Define core entities and relationships
  - Identify user roles and permissions
  - Map out feature requirements and priorities
  - Determine scalability needs and growth projections

- [ ] **Technology Stack Decision Matrix**
  - Database: PostgreSQL (Supabase) for most projects
  - Authentication: Supabase Auth with RLS
  - Real-time: Supabase Realtime subscriptions
  - File Storage: Supabase Storage
  - Edge Functions: Deno runtime for business logic

### Phase 2: Database Design (60 minutes)
- [ ] **Entity Relationship Design**
  - Create comprehensive ERD with all relationships
  - Define primary keys, foreign keys, and constraints
  - Plan for multi-tenancy from the beginning
  - Design for performance with proper normalization

- [ ] **Security Architecture**
  - Enable RLS on all tables from creation
  - Write comprehensive security policies
  - Plan role-based access control
  - Design audit logging strategy

### Phase 3: Infrastructure Setup (90 minutes)
- [ ] **Core Database Schema**
  - All tables with proper constraints and relationships
  - Performance indexes for all expected queries
  - Triggers for automation and data integrity
  - Views for complex queries and reporting

- [ ] **Security Implementation**
  - Multi-tenant RLS policies
  - JWT claim mapping
  - Input validation and sanitization
  - Rate limiting and abuse prevention

### Phase 4: Business Logic & Automation (60 minutes)
- [ ] **Edge Functions**
  - Core business logic functions
  - Data validation and transformation
  - External API integrations
  - Background job processing

- [ ] **Database Triggers**
  - Automatic counters and aggregations
  - Activity feed population
  - Notification generation
  - Data cleanup and maintenance

### Phase 5: Monitoring & Operations (45 minutes)
- [ ] **Observability**
  - Health check functions and views
  - Performance monitoring queries
  - Error tracking and alerting
  - Usage analytics and reporting

- [ ] **Production Readiness**
  - Backup and recovery procedures
  - Deployment automation
  - Environment configuration
  - Documentation and runbooks

## 🎨 Standard Templates

### 1. Database Schema Template
```sql
-- =====================================================
-- PROJECT_NAME Database Schema
-- Enterprise-Grade Multi-Tenant Architecture
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- CORE MULTI-TENANT TABLES
-- =====================================================

-- Organizations/Tenants (adapt naming to project context)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'member',
    permissions JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs (always include)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES profiles(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Feed (standard for user engagement)
CREATE TABLE activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES profiles(id),
    activity_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications (essential for user engagement)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. RLS Policies Template
```sql
-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- Multi-Tenant Security Framework
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper Functions
CREATE OR REPLACE FUNCTION get_user_organization_id(user_id UUID)
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT COALESCE(role IN ('admin', 'owner'), FALSE) FROM profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Standard Policies
CREATE POLICY "Users can read their organization" ON organizations
  FOR SELECT USING (id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can read organization profiles" ON profiles
  FOR SELECT USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Audit logs - admin only
CREATE POLICY "Admins can read audit logs" ON audit_logs
  FOR SELECT USING (is_user_admin(auth.uid()));
```

### 3. Edge Function Template
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  // Define your request structure
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get and validate user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Get user's organization
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, organization_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response('User profile not found', { status: 404, headers: corsHeaders })
    }

    // Parse and validate request body
    const body: RequestBody = await req.json()
    
    // TODO: Add your business logic here
    
    // Create audit log
    await supabaseClient
      .from('audit_logs')
      .insert({
        organization_id: profile.organization_id,
        user_id: user.id,
        action: 'FUNCTION_EXECUTED',
        table_name: 'edge_function',
        new_data: { function_name: 'your-function-name', input: body }
      })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})
```

### 4. Monitoring Setup Template
```sql
-- =====================================================
-- MONITORING & HEALTH CHECKS
-- Standard Observability Framework
-- =====================================================

-- Health check function
CREATE OR REPLACE FUNCTION system_health_check()
RETURNS TABLE(
  component TEXT,
  status TEXT,
  details TEXT,
  checked_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Database connections
  RETURN QUERY
  SELECT 
    'database_connections'::TEXT,
    CASE WHEN active_conn_pct < 80 THEN 'healthy'::TEXT 
         WHEN active_conn_pct < 90 THEN 'warning'::TEXT 
         ELSE 'critical'::TEXT END,
    'Active: ' || active_connections || '/' || max_connections || ' (' || active_conn_pct || '%)',
    NOW()
  FROM (
    SELECT 
      COUNT(*) as active_connections,
      current_setting('max_connections')::INT as max_connections,
      (COUNT(*) * 100.0 / current_setting('max_connections')::INT) as active_conn_pct
    FROM pg_stat_activity WHERE state = 'active'
  ) conn_stats;

  -- Query performance
  RETURN QUERY
  SELECT 
    'query_performance'::TEXT,
    CASE WHEN slow_queries < 5 THEN 'healthy'::TEXT 
         WHEN slow_queries < 20 THEN 'warning'::TEXT 
         ELSE 'critical'::TEXT END,
    'Slow queries (>1s): ' || slow_queries,
    NOW()
  FROM (
    SELECT COUNT(*) as slow_queries
    FROM pg_stat_statements 
    WHERE mean_time > 1000 AND calls > 10
  ) perf_stats;

  -- Recent errors
  RETURN QUERY
  SELECT 
    'error_rate'::TEXT,
    CASE WHEN recent_errors = 0 THEN 'healthy'::TEXT 
         WHEN recent_errors < 10 THEN 'warning'::TEXT 
         ELSE 'critical'::TEXT END,
    'Errors in last hour: ' || recent_errors,
    NOW()
  FROM (
    SELECT COUNT(*) as recent_errors
    FROM audit_logs 
    WHERE created_at > NOW() - INTERVAL '1 hour' AND action LIKE '%ERROR%'
  ) error_stats;
END;
$$ LANGUAGE plpgsql;

-- Usage analytics view
CREATE OR REPLACE VIEW analytics_dashboard AS
SELECT 
  -- User metrics
  (SELECT COUNT(*) FROM profiles WHERE last_seen_at > NOW() - INTERVAL '24 hours') as daily_active_users,
  (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '24 hours') as new_users_today,
  
  -- System health
  (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
  (SELECT COUNT(*) FROM audit_logs WHERE created_at > NOW() - INTERVAL '1 hour') as recent_activity,
  
  -- Performance
  (SELECT ROUND(AVG(mean_time), 2) FROM pg_stat_statements WHERE calls > 10) as avg_query_time_ms,
  
  NOW() as snapshot_time;
```

## 🚀 Implementation Prompts

### Project Kickoff Prompt
```
I'm starting a new project called [PROJECT_NAME]. 

Apply the Enterprise Backend Framework with:
1. Multi-tenant architecture supporting [TENANT_TYPE]
2. Core entities: [LIST_MAIN_ENTITIES]
3. User roles: [LIST_USER_ROLES]
4. Key features: [LIST_KEY_FEATURES]

Create:
- Complete database schema with 15+ tables
- RLS policies for multi-tenant security
- Performance indexes for all critical queries
- Edge functions for business logic
- Monitoring and health check systems
- Audit logging and activity feeds
- Comprehensive documentation

Target: Production-ready backend in 3-4 hours with enterprise-grade security, performance, and scalability.
```

### Quality Assurance Prompt
```
Review this backend implementation against the Enterprise Backend Framework standards:

Verify:
- ✅ Multi-tenant RLS on all tables
- ✅ Performance indexes on frequently queried columns
- ✅ Audit logging for all sensitive operations
- ✅ Health monitoring and alerting systems
- ✅ Edge functions with proper error handling
- ✅ Database triggers for automation
- ✅ Comprehensive documentation
- ✅ Security validation and input sanitization

If anything is missing, implement it immediately to meet enterprise standards.
```

## 📊 Quality Gates

### Before Moving to Frontend Development
- [ ] All tables have RLS policies
- [ ] Performance indexes on all foreign keys
- [ ] Health check function returns "healthy" status
- [ ] Edge functions handle all error cases
- [ ] Audit logging captures all operations
- [ ] Documentation is complete and accurate
- [ ] Security review passed
- [ ] Load testing completed

### Production Deployment Requirements
- [ ] Monitoring dashboard functional
- [ ] Alert systems configured
- [ ] Backup procedures tested
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation review completed

## 💾 Framework Storage Structure

```
/Enterprise-Backend-Framework/
├── templates/
│   ├── database-schema.sql
│   ├── rls-policies.sql
│   ├── indexes.sql
│   ├── triggers.sql
│   ├── edge-function.ts
│   ├── monitoring.sql
│   └── seed-data.sql
├── checklists/
│   ├── project-kickoff.md
│   ├── security-review.md
│   ├── performance-audit.md
│   └── production-readiness.md
├── prompts/
│   ├── project-initialization.md
│   ├── backend-review.md
│   └── quality-assurance.md
└── examples/
    ├── hoa-community-app/
    ├── e-commerce-platform/
    └── saas-application/
```

This framework ensures every project starts with the same level of sophistication and enterprise-grade infrastructure that we built for the HOA platform.