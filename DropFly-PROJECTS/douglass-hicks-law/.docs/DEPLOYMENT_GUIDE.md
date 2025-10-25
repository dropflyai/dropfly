# LegalFlow Pro - Production Deployment Guide

## Enterprise-Grade Deployment for Law Firm Case Management

This guide provides comprehensive instructions for deploying LegalFlow Pro in a production environment with enterprise-level security, performance, and compliance requirements.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Database Configuration](#database-configuration)
4. [Application Deployment](#application-deployment)
5. [Security Configuration](#security-configuration)
6. [Monitoring & Alerting](#monitoring--alerting)
7. [Backup & Recovery](#backup--recovery)
8. [Performance Optimization](#performance-optimization)
9. [Compliance Configuration](#compliance-configuration)
10. [Testing & Validation](#testing--validation)
11. [Go-Live Checklist](#go-live-checklist)
12. [Post-Deployment](#post-deployment)

---

## Prerequisites

### System Requirements

**Database (Supabase/PostgreSQL)**
- PostgreSQL 15+ with required extensions
- Minimum 4 vCPU, 16GB RAM
- SSD storage with encryption at rest
- Automated backups enabled

**Application Server**
- Node.js 18+ environment
- Minimum 2 vCPU, 8GB RAM
- SSL/TLS certificate
- Load balancer configuration

**Storage**
- Encrypted object storage (Supabase Storage/AWS S3)
- CDN configuration for global access
- Backup storage for document archives

### Required Accounts & Services

- **Supabase Pro/Enterprise Account**
- **Domain name with SSL certificate**
- **Email service (SendGrid, AWS SES, or similar)**
- **Monitoring service (optional but recommended)**
- **Backup storage solution**

---

## Infrastructure Setup

### 1. Supabase Project Configuration

```bash
# Create new Supabase project
npx supabase projects create legal-flow-pro --plan pro

# Link to local development
npx supabase link --project-ref your-project-ref

# Set up custom domain (if using Supabase)
npx supabase ssl-certificates create --custom-hostname your-domain.com
```

### 2. Environment Configuration

Create production environment file:

```bash
# .env.production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key-32-chars
SESSION_SECRET=your-session-secret

# Email Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=noreply@yourlawfirm.com

# File Storage
STORAGE_BUCKET=legal-documents
MAX_FILE_SIZE=104857600  # 100MB

# API Configuration
API_RATE_LIMIT=1000
API_TIMEOUT=30000

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Compliance
DATA_RETENTION_YEARS=7
AUDIT_LOG_RETENTION_YEARS=10
BACKUP_ENCRYPTION_KEY=your-backup-key
```

### 3. Network Security

Configure firewall rules:

```bash
# Database access (Supabase handles this automatically)
# Allow only application servers: 10.0.1.0/24

# Application server
# Allow HTTPS (443) from load balancer
# Allow SSH (22) from admin IPs only

# Load balancer
# Allow HTTP (80) and HTTPS (443) from internet
# Redirect HTTP to HTTPS
```

---

## Database Configuration

### 1. Run Database Migrations

```bash
# Ensure you're connected to production database
npx supabase db remote set --project-ref your-project-ref

# Run migrations in order
npx supabase db push

# Alternatively, run SQL files directly
psql $DATABASE_URL -f supabase/migrations/001_initial_schema.sql
psql $DATABASE_URL -f supabase/migrations/002_rls_policies.sql
psql $DATABASE_URL -f supabase/migrations/003_performance_indexes.sql
psql $DATABASE_URL -f supabase/migrations/004_audit_compliance.sql
psql $DATABASE_URL -f supabase/migrations/005_monitoring_functions.sql
```

### 2. Configure Database Settings

```sql
-- Set production configuration
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements,pg_cron';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '6GB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '64MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Reload configuration
SELECT pg_reload_conf();
```

### 3. Set Up Connection Pooling

```sql
-- Configure connection pooling in Supabase
-- This is handled automatically, but verify settings:
-- Pool size: 15
-- Max client connections: 3
-- Default pool mode: transaction
```

### 4. Create Initial Data

```sql
-- Create system admin user
INSERT INTO law_firms (id, name, slug, email, subscription_tier) 
VALUES (
  gen_random_uuid(),
  'System Administration',
  'system-admin',
  'admin@yoursystem.com',
  'enterprise'
);

-- Create default document categories
INSERT INTO document_categories (law_firm_id, name, description, is_privileged) 
VALUES
  ('00000000-0000-0000-0000-000000000000', 'Pleadings', 'Court filings and pleadings', true),
  ('00000000-0000-0000-0000-000000000000', 'Discovery', 'Discovery documents and responses', true),
  ('00000000-0000-0000-0000-000000000000', 'Correspondence', 'Client and opposing counsel correspondence', true),
  ('00000000-0000-0000-0000-000000000000', 'Contracts', 'Agreements and contracts', true),
  ('00000000-0000-0000-0000-000000000000', 'Research', 'Legal research and memoranda', true),
  ('00000000-0000-0000-0000-000000000000', 'Evidence', 'Evidence and exhibits', true);

-- Create default compliance requirements
INSERT INTO compliance_requirements (law_firm_id, regulation_type, requirement_name, description, risk_level)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'Bar Rules', 'Client Trust Account Reconciliation', 'Monthly reconciliation required', 'high'),
  ('00000000-0000-0000-0000-000000000000', 'GDPR', 'Data Subject Rights Response', 'Respond to data requests within 30 days', 'high'),
  ('00000000-0000-0000-0000-000000000000', 'Data Protection', 'Document Retention Policy', 'Maintain documents per retention schedule', 'medium');
```

---

## Application Deployment

### 1. Deploy Edge Functions

```bash
# Deploy all Edge Functions
npx supabase functions deploy document-processor
npx supabase functions deploy signature-validator
npx supabase functions deploy case-law-research
npx supabase functions deploy health-monitor

# Verify deployments
npx supabase functions list
```

### 2. Configure Edge Function Secrets

```bash
# Set environment variables for Edge Functions
npx supabase secrets set OPENAI_API_KEY=your-openai-key
npx supabase secrets set DOCUSIGN_CLIENT_ID=your-docusign-client-id
npx supabase secrets set WESTLAW_API_KEY=your-westlaw-key
npx supabase secrets set ENCRYPTION_KEY=your-encryption-key
```

### 3. Storage Configuration

```bash
# Configure storage buckets
npx supabase storage create-bucket legal-documents --public=false
npx supabase storage create-bucket document-previews --public=false
npx supabase storage create-bucket legal-research --public=false

# Set up RLS policies for storage
cat > storage_policies.sql << 'EOF'
-- Legal documents bucket policy
CREATE POLICY "Law firm users can access their documents" ON storage.objects
FOR ALL USING (
  bucket_id = 'legal-documents' AND
  (storage.foldername(name))[1] = (
    SELECT law_firm_id::text 
    FROM users 
    WHERE id = auth.uid()
  )
);
EOF

psql $DATABASE_URL -f storage_policies.sql
```

### 4. Real-time Configuration

```sql
-- Enable real-time for collaborative features
ALTER PUBLICATION supabase_realtime ADD TABLE cases;
ALTER PUBLICATION supabase_realtime ADD TABLE documents;
ALTER PUBLICATION supabase_realtime ADD TABLE communications;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE time_entries;

-- Configure real-time filters
INSERT INTO realtime.subscription_filters (table_name, filter) VALUES
('cases', 'law_firm_id=auth.get_user_law_firm_id()'),
('documents', 'law_firm_id=auth.get_user_law_firm_id()'),
('communications', 'law_firm_id=auth.get_user_law_firm_id()');
```

---

## Security Configuration

### 1. Authentication Settings

```sql
-- Configure auth settings in Supabase dashboard or via API
-- Site URL: https://yourdomain.com
-- Redirect URLs: https://yourdomain.com/auth/callback
-- JWT expiry: 3600 seconds (1 hour)
-- Refresh token expiry: 604800 seconds (7 days)
-- Enable email confirmations: true
-- Enable secure password requirements: true
```

### 2. Row Level Security Validation

```sql
-- Verify RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false;

-- Should return no rows - all tables must have RLS enabled
```

### 3. API Security

```bash
# Configure API gateway settings (if using custom gateway)
# Rate limiting: 1000 requests/hour per user
# Request size limit: 10MB
# Timeout: 30 seconds
# CORS: Restrict to your domain only
```

### 4. Encryption Configuration

```sql
-- Verify encryption functions are available
SELECT encrypt('test', 'test-key', 'aes') IS NOT NULL as encryption_available;

-- Create encryption key management
CREATE TABLE IF NOT EXISTS encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT UNIQUE NOT NULL,
  key_value TEXT NOT NULL, -- Store encrypted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Insert master encryption key (encrypted)
INSERT INTO encryption_keys (key_name, key_value, is_active)
VALUES ('master_key', encrypt($ENCRYPTION_KEY, 'system_key', 'aes'), true);
```

---

## Monitoring & Alerting

### 1. Health Monitoring Setup

```sql
-- Schedule health monitoring jobs
SELECT cron.schedule(
  'health-check-every-5-minutes',
  '*/5 * * * *',
  $$
  INSERT INTO system_health_checks (check_name, status, message, response_time_ms)
  SELECT 
    'Database Connectivity',
    CASE WHEN NOW() IS NOT NULL THEN 'healthy' ELSE 'critical' END,
    'Database connection test',
    EXTRACT(milliseconds FROM NOW() - NOW())::int;
  $$
);
```

### 2. Performance Monitoring

```sql
-- Enable pg_stat_statements for query monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Schedule performance metrics collection
SELECT cron.schedule(
  'collect-performance-metrics',
  '*/15 * * * *',
  'SELECT collect_database_metrics();'
);
```

### 3. Alert Configuration

```bash
# Configure webhook for alerts (optional)
curl -X POST "https://your-project.supabase.co/rest/v1/webhooks" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "security_alerts",
    "url": "https://your-alert-endpoint.com/webhook",
    "events": ["security_violation", "compliance_issue"],
    "active": true
  }'
```

### 4. Logging Configuration

```sql
-- Configure audit logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log slow queries
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;

SELECT pg_reload_conf();
```

---

## Backup & Recovery

### 1. Automated Backups

```bash
# Supabase Pro includes automated backups
# Verify backup schedule in dashboard:
# - Full backup: Daily
# - Point-in-time recovery: 7 days
# - Backup retention: 30 days

# For additional backups, set up custom job
#!/bin/bash
# backup_script.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL | gzip > "backup_$DATE.sql.gz"
aws s3 cp "backup_$DATE.sql.gz" s3://your-backup-bucket/database/
```

### 2. Document Backup

```bash
# Set up document backup sync
#!/bin/bash
# document_backup.sh
npx supabase storage download --bucket legal-documents --recursive ./backup/documents/
tar -czf "documents_$(date +%Y%m%d).tar.gz" ./backup/documents/
aws s3 cp "documents_$(date +%Y%m%d).tar.gz" s3://your-backup-bucket/documents/
```

### 3. Recovery Testing

```sql
-- Test recovery procedures monthly
-- Document recovery time objectives (RTO):
-- - Database: < 4 hours
-- - Documents: < 8 hours
-- - Full system: < 24 hours

-- Recovery point objectives (RPO):
-- - Database: < 1 hour
-- - Documents: < 4 hours
```

---

## Performance Optimization

### 1. Database Optimization

```sql
-- Analyze table statistics
ANALYZE;

-- Check for missing indexes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats 
WHERE schemaname = 'public' 
ORDER BY tablename, attname;

-- Optimize frequently used queries
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM cases WHERE law_firm_id = $1 AND status = 'open';
```

### 2. Connection Pool Optimization

```bash
# Configure connection pooling in production
# Pool size: 25 connections
# Max client connections: 100
# Pool mode: transaction
# Server lifetime: 3600 seconds
```

### 3. Caching Strategy

```bash
# Set up CDN for static assets
# Cache documents previews: 24 hours
# Cache API responses: 5 minutes
# Cache user sessions: 1 hour

# Configure browser caching
# Static assets: 1 year
# API responses: No cache
# User data: No cache
```

---

## Compliance Configuration

### 1. Data Retention Policies

```sql
-- Set up automated data retention
INSERT INTO data_retention_policies (
  law_firm_id,
  policy_name,
  entity_type,
  retention_period_years,
  destruction_method
) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Client Files', 'documents', 7, 'secure_deletion'),
  ('00000000-0000-0000-0000-000000000000', 'Case Records', 'cases', 10, 'secure_deletion'),
  ('00000000-0000-0000-0000-000000000000', 'Communications', 'communications', 7, 'secure_deletion'),
  ('00000000-0000-0000-0000-000000000000', 'Audit Logs', 'audit_log', 10, 'archive');

-- Schedule retention enforcement
SELECT cron.schedule(
  'enforce-data-retention',
  '0 2 * * 0', -- Weekly on Sunday at 2 AM
  'SELECT schedule_data_destruction();'
);
```

### 2. Privacy Controls

```sql
-- GDPR compliance setup
CREATE OR REPLACE FUNCTION process_data_subject_request(
  request_id UUID
) RETURNS JSONB AS $$
DECLARE
  request_record RECORD;
  subject_data JSONB := '{}';
BEGIN
  SELECT * INTO request_record 
  FROM data_subject_requests 
  WHERE id = request_id;
  
  -- Extract all personal data for subject
  -- Implementation depends on specific request type
  
  RETURN subject_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Audit Trail Integrity

```sql
-- Enable audit trail tamper protection
CREATE OR REPLACE FUNCTION verify_audit_integrity()
RETURNS BOOLEAN AS $$
DECLARE
  integrity_check BOOLEAN := true;
BEGIN
  -- Check for gaps in audit trail
  -- Check for unauthorized modifications
  -- Verify cryptographic hashes if implemented
  
  RETURN integrity_check;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule integrity checks
SELECT cron.schedule(
  'audit-integrity-check',
  '0 3 * * *', -- Daily at 3 AM
  'SELECT verify_audit_integrity();'
);
```

---

## Testing & Validation

### 1. Security Testing

```bash
# Run security tests
npm run test:security

# Test authentication
curl -X POST https://yourdomain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'

# Test authorization
curl -X GET https://yourdomain.com/api/cases \
  -H "Authorization: Bearer invalid_token"

# Test input validation
curl -X POST https://yourdomain.com/api/cases \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"malicious":"<script>alert(1)</script>"}'
```

### 2. Performance Testing

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 -H "Authorization: Bearer $JWT_TOKEN" \
  https://yourdomain.com/api/cases

# Database performance testing
psql $DATABASE_URL -c "
  EXPLAIN (ANALYZE, BUFFERS) 
  SELECT * FROM cases c 
  JOIN clients cl ON cl.id = c.client_id 
  WHERE c.law_firm_id = 'test-uuid' 
  ORDER BY c.created_at DESC 
  LIMIT 50;
"
```

### 3. Compliance Testing

```sql
-- Test data isolation between tenants
DO $$
DECLARE
  firm1_id UUID := gen_random_uuid();
  firm2_id UUID := gen_random_uuid();
  test_result BOOLEAN;
BEGIN
  -- Create test data for two firms
  INSERT INTO law_firms (id, name, slug) VALUES 
    (firm1_id, 'Test Firm 1', 'test-firm-1'),
    (firm2_id, 'Test Firm 2', 'test-firm-2');
  
  -- Test that firm1 cannot see firm2 data
  SET app.current_user_firm = firm1_id;
  
  SELECT COUNT(*) = 0 INTO test_result
  FROM law_firms 
  WHERE id = firm2_id;
  
  IF NOT test_result THEN
    RAISE EXCEPTION 'Tenant isolation test failed!';
  END IF;
  
  RAISE NOTICE 'Tenant isolation test passed';
END $$;
```

---

## Go-Live Checklist

### Pre-Deployment
- [ ] All database migrations tested and applied
- [ ] RLS policies verified on all tables
- [ ] Edge Functions deployed and tested
- [ ] SSL certificates installed and validated
- [ ] DNS records configured correctly
- [ ] Backup systems operational
- [ ] Monitoring and alerting configured
- [ ] Security scan completed
- [ ] Performance testing passed
- [ ] User acceptance testing completed

### Deployment Day
- [ ] Final database backup taken
- [ ] Production environment variables set
- [ ] Application deployed to production
- [ ] DNS switched to production
- [ ] Health checks passing
- [ ] Monitoring dashboards functional
- [ ] User authentication working
- [ ] Document upload/download tested
- [ ] Email notifications working
- [ ] Compliance reports generating

### Post-Deployment
- [ ] System monitoring for 24 hours
- [ ] User training completed
- [ ] Support documentation updated
- [ ] Incident response procedures tested
- [ ] Regular backup verification scheduled
- [ ] Performance metrics baseline established

---

## Post-Deployment

### 1. Monitoring Dashboard Setup

Create custom monitoring dashboard:

```sql
-- Create monitoring views for dashboard
CREATE VIEW production_health_dashboard AS
SELECT 
  'System Health' as metric_category,
  check_name,
  status,
  checked_at,
  response_time_ms
FROM system_health_checks 
WHERE checked_at >= NOW() - interval '1 hour'
ORDER BY checked_at DESC;

CREATE VIEW performance_dashboard AS
SELECT 
  metric_name,
  metric_value,
  metric_unit,
  recorded_at
FROM performance_metrics 
WHERE recorded_at >= NOW() - interval '24 hours'
ORDER BY recorded_at DESC;
```

### 2. User Onboarding

```sql
-- Create law firm onboarding checklist
CREATE TABLE onboarding_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  law_firm_id UUID NOT NULL REFERENCES law_firms(id),
  step_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id)
);

-- Insert standard onboarding steps
INSERT INTO onboarding_checklist (law_firm_id, step_name) VALUES
  ('new-firm-id', 'Configure firm settings'),
  ('new-firm-id', 'Add team members'),
  ('new-firm-id', 'Set up document categories'),
  ('new-firm-id', 'Configure billing rates'),
  ('new-firm-id', 'Import existing clients'),
  ('new-firm-id', 'Set up compliance requirements'),
  ('new-firm-id', 'Test document upload'),
  ('new-firm-id', 'Create first case'),
  ('new-firm-id', 'Configure calendar integration');
```

### 3. Maintenance Schedule

```bash
# Schedule regular maintenance tasks

# Weekly maintenance (Sundays at 2 AM)
0 2 * * 0 /usr/local/bin/weekly_maintenance.sh

# Monthly maintenance (First Sunday at 3 AM)  
0 3 1-7 * 0 /usr/local/bin/monthly_maintenance.sh

# Quarterly maintenance (Manual)
# - Security audit
# - Performance review
# - Compliance assessment
# - Disaster recovery test
```

### 4. Support Procedures

Document support procedures:

```markdown
## Incident Response

### Severity Levels
- **Critical**: System down, data loss, security breach
- **High**: Major functionality affected
- **Medium**: Minor functionality affected
- **Low**: Enhancement requests

### Response Times
- Critical: 15 minutes
- High: 2 hours
- Medium: 24 hours
- Low: 5 business days

### Escalation Path
1. Technical Support Team
2. DevOps Team Lead
3. CTO
4. External Support (if needed)
```

---

## Troubleshooting Common Issues

### Database Connection Issues
```bash
# Check connection pool status
psql $DATABASE_URL -c "
  SELECT 
    pid,
    usename,
    application_name,
    state,
    query_start 
  FROM pg_stat_activity 
  WHERE state = 'active';
"

# Reset connections if needed
psql $DATABASE_URL -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';"
```

### Performance Issues
```sql
-- Check for blocking queries
SELECT 
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
AND blocking_locks.DATABASE IS NOT DISTINCT FROM blocked_locks.DATABASE
AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.GRANTED;
```

### Storage Issues
```bash
# Check storage usage
npx supabase storage usage legal-documents

# Clean up old document previews
npx supabase storage delete legal-documents --pattern "previews/*" --older-than 30d
```

---

*Last Updated: 2025-08-17*

**Next Steps**: After successful deployment, refer to the [User Guides](USER_GUIDES/) for training materials and the [API Documentation](API_DOCUMENTATION.md) for integration requirements.