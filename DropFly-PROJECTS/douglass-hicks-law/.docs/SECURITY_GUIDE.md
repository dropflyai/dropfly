# LegalFlow Pro - Security Implementation Guide

## Enterprise Security for Legal Case Management

This guide details the comprehensive security architecture and implementation for LegalFlow Pro, designed specifically for law firms handling sensitive client data and privileged communications.

## 📋 Table of Contents

1. [Security Architecture Overview](#security-architecture-overview)
2. [Multi-Tenant Isolation](#multi-tenant-isolation)
3. [Attorney-Client Privilege Protection](#attorney-client-privilege-protection)
4. [Authentication & Authorization](#authentication--authorization)
5. [Data Encryption](#data-encryption)
6. [Network Security](#network-security)
7. [Audit Trails & Monitoring](#audit-trails--monitoring)
8. [Compliance & Privacy](#compliance--privacy)
9. [Incident Response](#incident-response)
10. [Security Best Practices](#security-best-practices)

---

## Security Architecture Overview

### Security Principles

**Defense in Depth**
- Multiple layers of security controls
- No single point of failure
- Assume breach mentality

**Zero Trust Architecture**
- Never trust, always verify
- Least privilege access
- Continuous verification

**Data Classification**
- Privileged (Attorney-Client)
- Confidential (Client Business)
- Internal (Firm Operations)
- Public (Marketing Materials)

### Threat Model

**External Threats**
- Unauthorized access attempts
- Data breaches and exfiltration
- Ransomware and malware
- DDoS attacks

**Internal Threats**
- Privilege escalation
- Data mishandling
- Insider threats
- Accidental exposure

**Legal-Specific Threats**
- Privilege waiver
- Conflict of interest violations
- Regulatory compliance failures
- Ethics violations

---

## Multi-Tenant Isolation

### Database-Level Isolation

**Row Level Security (RLS)**
```sql
-- Example: Complete tenant isolation for cases table
CREATE POLICY "cases_tenant_isolation" ON cases
    FOR ALL USING (
        law_firm_id = auth.get_user_law_firm_id()
    );

-- Verification query - should return empty set
SELECT c1.* 
FROM cases c1, cases c2 
WHERE c1.law_firm_id != c2.law_firm_id 
AND c1.law_firm_id = auth.get_user_law_firm_id();
```

**Schema Isolation Validation**
```sql
-- Check all tables have RLS enabled
SELECT 
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false;

-- Should return 0 rows
```

### Application-Level Isolation

**Context Enforcement**
```typescript
// Middleware to enforce law firm context
export async function enforceTenantContext(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const requestedLawFirmId = req.params.lawFirmId || req.body.law_firm_id;
  
  if (requestedLawFirmId && requestedLawFirmId !== user.law_firm_id) {
    return res.status(403).json({ error: 'Access denied: tenant mismatch' });
  }
  
  // Set database session context
  await supabase.rpc('set_session_context', {
    law_firm_id: user.law_firm_id,
    user_id: user.id,
    client_ip: req.ip
  });
  
  next();
}
```

**API Endpoint Protection**
```typescript
// Example protected endpoint
app.get('/api/cases', enforceTenantContext, async (req, res) => {
  // Query automatically filtered by RLS
  const { data, error } = await supabase
    .from('cases')
    .select('*');
    
  res.json(data);
});
```

### Storage Isolation

**File System Organization**
```
legal-documents/
├── {law_firm_id}/
│   ├── cases/
│   │   ├── {case_id}/
│   │   │   ├── pleadings/
│   │   │   ├── discovery/
│   │   │   └── correspondence/
│   ├── clients/
│   └── research/
```

**Storage Policy Enforcement**
```sql
-- Storage bucket RLS policy
CREATE POLICY "law_firm_document_access" ON storage.objects
    FOR ALL USING (
        bucket_id = 'legal-documents' AND
        (storage.foldername(name))[1] = (
            SELECT law_firm_id::text 
            FROM users 
            WHERE id = auth.uid()
        )
    );
```

---

## Attorney-Client Privilege Protection

### Privilege Classification System

**Automatic Privilege Detection**
```typescript
// Edge Function: Privilege detection algorithm
async function detectPrivilegedContent(text: string): Promise<PrivilegeAnalysis> {
    const privilegeIndicators = [
        'attorney-client privilege',
        'confidential communication',
        'legal advice',
        'privileged and confidential',
        'work product'
    ];
    
    const workProductIndicators = [
        'trial strategy',
        'litigation plan',
        'witness preparation',
        'expert analysis'
    ];
    
    let privilegeScore = 0;
    let detectedTypes: string[] = [];
    
    // Pattern matching for privilege indicators
    privilegeIndicators.forEach(indicator => {
        if (text.toLowerCase().includes(indicator)) {
            privilegeScore += 0.3;
            detectedTypes.push('attorney-client');
        }
    });
    
    workProductIndicators.forEach(indicator => {
        if (text.toLowerCase().includes(indicator)) {
            privilegeScore += 0.25;
            detectedTypes.push('work-product');
        }
    });
    
    return {
        isPrivileged: privilegeScore > 0.3,
        confidenceScore: Math.min(privilegeScore, 1.0),
        detectedTypes: [...new Set(detectedTypes)]
    };
}
```

**Privilege Assertion Logging**
```sql
-- Automatic privilege logging trigger
CREATE OR REPLACE FUNCTION log_privilege_assertion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_privileged = true THEN
        INSERT INTO privilege_log (
            law_firm_id,
            entity_type,
            entity_id,
            privilege_type,
            privilege_holder,
            asserted_by,
            privilege_date
        ) VALUES (
            NEW.law_firm_id,
            'documents',
            NEW.id,
            CASE WHEN NEW.is_work_product THEN 'work-product' ELSE 'attorney-client' END,
            COALESCE(NEW.privilege_holder, 'Client'),
            auth.uid(),
            CURRENT_DATE
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_privilege_assertion 
    AFTER INSERT OR UPDATE ON documents 
    FOR EACH ROW EXECUTE FUNCTION log_privilege_assertion();
```

### Access Control for Privileged Content

**Role-Based Privilege Access**
```sql
-- Function to check privileged document access
CREATE OR REPLACE FUNCTION can_access_privileged_document(doc_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    doc_record RECORD;
    user_record RECORD;
BEGIN
    -- Get document and user information
    SELECT d.*, c.client_id INTO doc_record
    FROM documents d
    LEFT JOIN cases c ON c.id = d.case_id
    WHERE d.id = doc_id;
    
    SELECT * INTO user_record
    FROM users
    WHERE id = auth.uid();
    
    -- Clients can only access their own privileged documents
    IF user_record.role = 'client' THEN
        RETURN EXISTS (
            SELECT 1 FROM clients cl
            WHERE cl.id = doc_record.client_id
            AND cl.id = user_record.client_id -- Assuming client users are linked
        );
    END IF;
    
    -- Attorneys and legal staff with case access
    IF user_record.role IN ('firm_admin', 'partner', 'senior_associate', 'associate', 'paralegal') THEN
        IF doc_record.case_id IS NOT NULL THEN
            RETURN auth.user_can_access_case(doc_record.case_id);
        ELSIF doc_record.client_id IS NOT NULL THEN
            RETURN auth.user_can_access_client(doc_record.client_id);
        ELSE
            -- Firm-level privileged document
            RETURN user_record.role IN ('firm_admin', 'partner', 'senior_associate', 'associate');
        END IF;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Privilege Waiver Tracking**
```sql
-- Track privilege waivers
CREATE OR REPLACE FUNCTION waive_privilege(
    entity_type TEXT,
    entity_id UUID,
    waiver_reason TEXT,
    authorized_by UUID
) RETURNS VOID AS $$
BEGIN
    -- Update privilege log
    UPDATE privilege_log 
    SET 
        waived_date = CURRENT_DATE,
        waived_by = authorized_by,
        waiver_reason = waiver_reason
    WHERE entity_type = entity_type 
    AND entity_id = entity_id
    AND waived_date IS NULL;
    
    -- Audit the waiver
    INSERT INTO audit_log (
        law_firm_id,
        user_id,
        entity_type,
        entity_id,
        action,
        notes
    ) VALUES (
        (SELECT law_firm_id FROM users WHERE id = authorized_by),
        authorized_by,
        'privilege_waiver',
        entity_id,
        'privilege_waived',
        'Privilege waived: ' || waiver_reason
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Authentication & Authorization

### Multi-Factor Authentication

**MFA Implementation**
```typescript
// MFA verification middleware
export async function verifyMFA(req: Request, res: Response, next: NextFunction) {
    const { mfa_token } = req.body;
    const user = req.user;
    
    if (!user.mfa_enabled) {
        return res.status(400).json({ error: 'MFA not enabled' });
    }
    
    const isValid = await verifyTOTP(user.mfa_secret, mfa_token);
    
    if (!isValid) {
        // Log failed MFA attempt
        await logSecurityEvent({
            event_type: 'mfa_failure',
            user_id: user.id,
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });
        
        return res.status(401).json({ error: 'Invalid MFA token' });
    }
    
    next();
}
```

**Session Management**
```typescript
// Secure session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 60 * 1000, // 1 hour
        sameSite: 'strict'
    },
    store: new PostgreSQLStore({
        conString: process.env.DATABASE_URL,
        tableName: 'user_sessions'
    })
};
```

### Role-Based Access Control

**Legal Role Hierarchy**
```sql
-- Role hierarchy and permissions
CREATE TYPE user_role AS ENUM (
    'firm_admin',     -- Full system access
    'partner',        -- Full case access, billing
    'senior_associate', -- Full case access
    'associate',      -- Assigned case access
    'paralegal',      -- Support access
    'case_manager',   -- Administrative access
    'hr_staff',       -- HR data access
    'client'          -- Client portal access
);

-- Permission matrix
CREATE TABLE role_permissions (
    role user_role,
    resource TEXT,
    action TEXT,
    granted BOOLEAN DEFAULT true,
    PRIMARY KEY (role, resource, action)
);

-- Standard permissions
INSERT INTO role_permissions (role, resource, action) VALUES
    -- Firm Admin - all permissions
    ('firm_admin', '*', '*'),
    
    -- Partner permissions
    ('partner', 'cases', 'create'),
    ('partner', 'cases', 'read'),
    ('partner', 'cases', 'update'),
    ('partner', 'cases', 'delete'),
    ('partner', 'clients', '*'),
    ('partner', 'documents', '*'),
    ('partner', 'billing', '*'),
    
    -- Associate permissions
    ('associate', 'cases', 'read'),
    ('associate', 'cases', 'update'),
    ('associate', 'documents', 'create'),
    ('associate', 'documents', 'read'),
    ('associate', 'time_entries', '*'),
    
    -- Client permissions
    ('client', 'cases', 'read'),
    ('client', 'documents', 'read'),
    ('client', 'communications', 'read');
```

**Dynamic Permission Checking**
```sql
-- Function to check user permissions
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID,
    p_resource TEXT,
    p_action TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    user_role_val user_role;
BEGIN
    SELECT role INTO user_role_val
    FROM users
    WHERE id = p_user_id;
    
    RETURN EXISTS (
        SELECT 1 FROM role_permissions
        WHERE role = user_role_val
        AND (resource = p_resource OR resource = '*')
        AND (action = p_action OR action = '*')
        AND granted = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Data Encryption

### Encryption at Rest

**Database Column Encryption**
```sql
-- Create encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive fields
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(encrypt(data::bytea, current_setting('app.encryption_key'), 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN convert_from(decrypt(decode(encrypted_data, 'base64'), current_setting('app.encryption_key'), 'aes'), 'UTF8');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Encrypt client SSN/Tax ID
ALTER TABLE clients ADD COLUMN tax_id_encrypted TEXT;
UPDATE clients SET tax_id_encrypted = encrypt_sensitive_data(tax_id) WHERE tax_id IS NOT NULL;
ALTER TABLE clients DROP COLUMN tax_id;
ALTER TABLE clients RENAME COLUMN tax_id_encrypted TO tax_id;
```

**Document Encryption**
```typescript
// Document encryption service
export class DocumentEncryptionService {
    private static readonly ALGORITHM = 'aes-256-gcm';
    
    static async encryptDocument(content: Buffer, documentId: string): Promise<EncryptedDocument> {
        const key = await this.generateDocumentKey(documentId);
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipher(this.ALGORITHM, key, iv);
        const encrypted = Buffer.concat([cipher.update(content), cipher.final()]);
        const authTag = cipher.getAuthTag();
        
        return {
            encryptedContent: encrypted,
            iv: iv.toString('base64'),
            authTag: authTag.toString('base64'),
            keyId: await this.storeKey(key, documentId)
        };
    }
    
    static async decryptDocument(encryptedDoc: EncryptedDocument): Promise<Buffer> {
        const key = await this.retrieveKey(encryptedDoc.keyId);
        const iv = Buffer.from(encryptedDoc.iv, 'base64');
        const authTag = Buffer.from(encryptedDoc.authTag, 'base64');
        
        const decipher = crypto.createDecipher(this.ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        
        return Buffer.concat([
            decipher.update(encryptedDoc.encryptedContent),
            decipher.final()
        ]);
    }
}
```

### Encryption in Transit

**TLS Configuration**
```nginx
# Nginx SSL configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.3 TLSv1.2;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
}
```

**Database Connection Encryption**
```bash
# Connection string with SSL
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require&sslcert=client-cert.pem&sslkey=client-key.pem&sslrootcert=ca-cert.pem"
```

---

## Network Security

### Firewall Configuration

**Database Firewall Rules**
```bash
# Allow only application servers
iptables -A INPUT -p tcp --dport 5432 -s 10.0.1.0/24 -j ACCEPT
iptables -A INPUT -p tcp --dport 5432 -j DROP

# Log rejected connections
iptables -A INPUT -p tcp --dport 5432 -j LOG --log-prefix "REJECTED DB CONNECTION: "
```

**Application Firewall**
```bash
# Web application firewall rules
# Allow HTTPS from internet
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow SSH from admin networks only
iptables -A INPUT -p tcp --dport 22 -s 192.168.1.0/24 -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j DROP

# Rate limiting
iptables -A INPUT -p tcp --dport 443 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT
```

### DDoS Protection

**Rate Limiting**
```typescript
// Application-level rate limiting
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // requests per window
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logSecurityEvent({
            event_type: 'rate_limit_exceeded',
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });
        
        res.status(429).json({
            error: 'Rate limit exceeded',
            retryAfter: Math.round(15 * 60)
        });
    }
});

// Apply to API routes
app.use('/api/', apiLimiter);
```

**IP Whitelisting**
```sql
-- IP restriction table
CREATE TABLE ip_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id),
    ip_address CIDR NOT NULL,
    description TEXT,
    is_allowed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to check IP access
CREATE OR REPLACE FUNCTION is_ip_allowed(client_ip INET, firm_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- If no restrictions exist, allow all
    IF NOT EXISTS (SELECT 1 FROM ip_restrictions WHERE law_firm_id = firm_id) THEN
        RETURN true;
    END IF;
    
    -- Check if IP is explicitly allowed
    RETURN EXISTS (
        SELECT 1 FROM ip_restrictions
        WHERE law_firm_id = firm_id
        AND ip_address >> client_ip
        AND is_allowed = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Audit Trails & Monitoring

### Comprehensive Audit Logging

**Enhanced Audit Function**
```sql
-- Enhanced audit trigger with risk assessment
CREATE OR REPLACE FUNCTION enhanced_audit_function()
RETURNS TRIGGER AS $$
DECLARE
    risk_level TEXT := 'low';
    suspicious_activity BOOLEAN := false;
BEGIN
    -- Assess risk level based on action and data
    IF TG_OP = 'DELETE' THEN
        risk_level := 'high';
    ELSIF TG_TABLE_NAME IN ('documents', 'communications') AND TG_OP = 'UPDATE' THEN
        risk_level := 'medium';
    ELSIF NEW.is_privileged = true THEN
        risk_level := 'medium';
    END IF;
    
    -- Check for suspicious activity patterns
    IF EXISTS (
        SELECT 1 FROM audit_log
        WHERE user_id = auth.uid()
        AND created_at >= NOW() - interval '5 minutes'
        GROUP BY user_id
        HAVING COUNT(*) > 50
    ) THEN
        suspicious_activity := true;
        risk_level := 'critical';
    END IF;
    
    -- Insert audit record
    INSERT INTO audit_log (
        law_firm_id,
        user_id,
        entity_type,
        entity_id,
        action,
        old_values,
        new_values,
        risk_level,
        is_suspicious,
        ip_address,
        user_agent,
        session_id
    ) VALUES (
        COALESCE(NEW.law_firm_id, OLD.law_firm_id),
        auth.uid(),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE TG_OP
            WHEN 'INSERT' THEN 'create'
            WHEN 'UPDATE' THEN 'update'
            WHEN 'DELETE' THEN 'delete'
        END,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) END,
        risk_level,
        suspicious_activity,
        current_setting('app.client_ip', true)::INET,
        current_setting('app.user_agent', true),
        current_setting('app.session_id', true)
    );
    
    -- Alert on suspicious activity
    IF suspicious_activity THEN
        PERFORM pg_notify('security_alert', json_build_object(
            'event', 'suspicious_activity',
            'user_id', auth.uid(),
            'table', TG_TABLE_NAME,
            'timestamp', NOW()
        )::text);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Real-Time Security Monitoring

**Security Event Detection**
```typescript
// Real-time security monitoring
export class SecurityMonitor {
    private static suspiciousPatterns = [
        {
            name: 'rapid_access',
            condition: (events: AuditEvent[]) => events.length > 50,
            timeWindow: 5 * 60 * 1000, // 5 minutes
            severity: 'high'
        },
        {
            name: 'privilege_escalation',
            condition: (events: AuditEvent[]) => 
                events.some(e => e.action === 'update' && e.entity_type === 'users' && 
                             e.new_values?.role !== e.old_values?.role),
            timeWindow: 60 * 60 * 1000, // 1 hour
            severity: 'critical'
        },
        {
            name: 'bulk_download',
            condition: (events: AuditEvent[]) => 
                events.filter(e => e.action === 'download').length > 10,
            timeWindow: 10 * 60 * 1000, // 10 minutes
            severity: 'medium'
        }
    ];
    
    static async analyzeUserActivity(userId: string): Promise<SecurityAlert[]> {
        const alerts: SecurityAlert[] = [];
        const recentEvents = await this.getRecentEvents(userId);
        
        for (const pattern of this.suspiciousPatterns) {
            const windowEvents = recentEvents.filter(
                e => Date.now() - new Date(e.created_at).getTime() < pattern.timeWindow
            );
            
            if (pattern.condition(windowEvents)) {
                alerts.push({
                    id: crypto.randomUUID(),
                    type: pattern.name,
                    severity: pattern.severity,
                    userId,
                    events: windowEvents,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        return alerts;
    }
}
```

### Compliance Reporting

**Automated Compliance Reports**
```sql
-- Generate compliance report
CREATE OR REPLACE FUNCTION generate_compliance_report(
    p_law_firm_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - interval '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
    report JSONB;
BEGIN
    SELECT jsonb_build_object(
        'report_period', jsonb_build_object(
            'start_date', p_start_date,
            'end_date', p_end_date
        ),
        'audit_summary', (
            SELECT jsonb_build_object(
                'total_events', COUNT(*),
                'high_risk_events', COUNT(*) FILTER (WHERE risk_level = 'high'),
                'suspicious_events', COUNT(*) FILTER (WHERE is_suspicious = true),
                'document_access', COUNT(*) FILTER (WHERE entity_type = 'documents'),
                'privilege_assertions', (
                    SELECT COUNT(*) FROM privilege_log
                    WHERE law_firm_id = p_law_firm_id
                    AND privilege_date BETWEEN p_start_date AND p_end_date
                )
            )
            FROM audit_log
            WHERE law_firm_id = p_law_firm_id
            AND created_at::date BETWEEN p_start_date AND p_end_date
        ),
        'security_events', (
            SELECT jsonb_agg(jsonb_build_object(
                'event_type', entity_type,
                'severity', risk_level,
                'timestamp', created_at,
                'user_id', user_id
            ))
            FROM audit_log
            WHERE law_firm_id = p_law_firm_id
            AND created_at::date BETWEEN p_start_date AND p_end_date
            AND (risk_level IN ('high', 'critical') OR is_suspicious = true)
        ),
        'compliance_status', 'compliant' -- Add logic to determine status
    ) INTO report;
    
    RETURN report;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Incident Response

### Automated Response Procedures

**Security Incident Handler**
```typescript
export class IncidentResponseHandler {
    static async handleSecurityIncident(incident: SecurityIncident): Promise<void> {
        const response = await this.categorizeIncident(incident);
        
        switch (response.severity) {
            case 'critical':
                await this.executeCriticalResponse(incident);
                break;
            case 'high':
                await this.executeHighSeverityResponse(incident);
                break;
            case 'medium':
                await this.executeMediumSeverityResponse(incident);
                break;
            default:
                await this.executeStandardResponse(incident);
        }
    }
    
    private static async executeCriticalResponse(incident: SecurityIncident): Promise<void> {
        // Immediate containment
        await this.suspendUserAccount(incident.userId);
        await this.invalidateUserSessions(incident.userId);
        await this.alertSecurityTeam(incident);
        
        // Forensic preservation
        await this.preserveAuditLogs(incident);
        await this.captureSystemState(incident);
        
        // Notification
        await this.notifyStakeholders(incident);
    }
    
    private static async suspendUserAccount(userId: string): Promise<void> {
        await supabase
            .from('users')
            .update({ 
                is_active: false,
                suspended_at: new Date().toISOString(),
                suspension_reason: 'Security incident - automatic suspension'
            })
            .eq('id', userId);
    }
}
```

**Breach Detection and Response**
```sql
-- Breach detection function
CREATE OR REPLACE FUNCTION detect_potential_breach()
RETURNS TABLE (
    incident_id UUID,
    incident_type TEXT,
    severity TEXT,
    description TEXT,
    affected_users INT,
    affected_records INT
) AS $$
BEGIN
    -- Data exfiltration detection
    RETURN QUERY
    WITH bulk_downloads AS (
        SELECT 
            dal.user_id,
            COUNT(*) as download_count,
            COUNT(DISTINCT d.case_id) as case_count
        FROM document_access_log dal
        JOIN documents d ON d.id = dal.document_id
        WHERE dal.action = 'download'
        AND dal.created_at >= NOW() - interval '1 hour'
        GROUP BY dal.user_id
        HAVING COUNT(*) > 100 OR COUNT(DISTINCT d.case_id) > 20
    )
    SELECT 
        gen_random_uuid(),
        'bulk_download'::TEXT,
        'high'::TEXT,
        format('User downloaded %s documents from %s cases in 1 hour', download_count, case_count),
        1,
        download_count::INT
    FROM bulk_downloads;
    
    -- Privilege escalation detection
    RETURN QUERY
    SELECT 
        gen_random_uuid(),
        'privilege_escalation'::TEXT,
        'critical'::TEXT,
        'Unauthorized role modification detected',
        1,
        1
    FROM audit_log
    WHERE entity_type = 'users'
    AND action = 'update'
    AND created_at >= NOW() - interval '1 hour'
    AND (new_values->>'role') != (old_values->>'role')
    AND user_id != (old_values->>'id')::UUID; -- Self-modification allowed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Forensic Capabilities

**Audit Log Analysis**
```sql
-- Forensic analysis functions
CREATE OR REPLACE FUNCTION trace_user_activity(
    p_user_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    timestamp TIMESTAMPTZ,
    action TEXT,
    entity_type TEXT,
    entity_id UUID,
    ip_address INET,
    risk_level TEXT,
    details JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.created_at,
        al.action,
        al.entity_type,
        al.entity_id,
        al.ip_address,
        al.risk_level,
        jsonb_build_object(
            'old_values', al.old_values,
            'new_values', al.new_values,
            'user_agent', al.user_agent,
            'session_id', al.session_id
        )
    FROM audit_log al
    WHERE al.user_id = p_user_id
    AND al.created_at BETWEEN p_start_time AND p_end_time
    ORDER BY al.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Document access timeline
CREATE OR REPLACE FUNCTION document_access_timeline(p_document_id UUID)
RETURNS TABLE (
    timestamp TIMESTAMPTZ,
    user_email TEXT,
    action TEXT,
    ip_address INET,
    success BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dal.created_at,
        u.email,
        dal.action,
        dal.ip_address,
        true -- Add failure tracking if needed
    FROM document_access_log dal
    JOIN users u ON u.id = dal.user_id
    WHERE dal.document_id = p_document_id
    ORDER BY dal.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Security Best Practices

### Secure Development Practices

**Input Validation**
```typescript
// Comprehensive input validation
import Joi from 'joi';

const caseValidationSchema = Joi.object({
    title: Joi.string().max(255).pattern(/^[a-zA-Z0-9\s\-.,()]+$/).required(),
    description: Joi.string().max(5000).optional(),
    case_number: Joi.string().pattern(/^[A-Z0-9\-]+$/).required(),
    practice_area: Joi.string().valid('Litigation', 'Corporate', 'Real Estate', 'Family', 'Criminal').required(),
    lead_attorney_id: Joi.string().uuid().required(),
    client_id: Joi.string().uuid().required()
});

export function validateCaseInput(data: any): ValidationResult {
    const { error, value } = caseValidationSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
    
    if (error) {
        logSecurityEvent({
            event_type: 'validation_error',
            details: error.details,
            input_data: data
        });
    }
    
    return { error, value };
}
```

**SQL Injection Prevention**
```typescript
// Always use parameterized queries
export async function getCasesByAttorney(attorneyId: string, filters: CaseFilters) {
    const { data, error } = await supabase
        .from('cases')
        .select(`
            *,
            clients!inner(*),
            users!lead_attorney_id(*)
        `)
        .eq('lead_attorney_id', attorneyId) // Parameterized
        .eq('status', filters.status)       // Parameterized
        .order('created_at', { ascending: false });
        
    return { data, error };
}

// NEVER do this:
// const query = `SELECT * FROM cases WHERE attorney_id = '${attorneyId}'`;
```

### Regular Security Assessments

**Automated Security Scans**
```bash
#!/bin/bash
# security_scan.sh

echo "Running automated security assessment..."

# Check for missing RLS policies
psql $DATABASE_URL -c "
    SELECT 'SECURITY ISSUE: Table missing RLS' as issue, tablename
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND rowsecurity = false
    AND tablename NOT IN ('system_health_checks', 'performance_metrics');
"

# Check for weak passwords (if storing locally)
psql $DATABASE_URL -c "
    SELECT 'SECURITY ISSUE: Weak password detected' as issue, email
    FROM auth.users 
    WHERE length(encrypted_password) < 60;
"

# Check for suspicious audit patterns
psql $DATABASE_URL -c "
    SELECT 'SECURITY WARNING: High activity user' as issue, 
           u.email, 
           COUNT(*) as event_count
    FROM audit_log al
    JOIN users u ON u.id = al.user_id
    WHERE al.created_at >= NOW() - interval '24 hours'
    GROUP BY u.email
    HAVING COUNT(*) > 1000;
"

echo "Security scan complete."
```

**Penetration Testing Checklist**
```markdown
## Monthly Security Testing

### Authentication Testing
- [ ] Test for SQL injection in login forms
- [ ] Verify MFA bypass attempts fail
- [ ] Test session fixation attacks
- [ ] Verify password reset security
- [ ] Test for privilege escalation

### Authorization Testing  
- [ ] Verify tenant isolation (no cross-firm access)
- [ ] Test privileged document access controls
- [ ] Verify role-based restrictions
- [ ] Test API endpoint authorization
- [ ] Check file upload restrictions

### Data Protection Testing
- [ ] Verify encryption at rest
- [ ] Test encryption in transit
- [ ] Check for data leakage in logs
- [ ] Verify secure data deletion
- [ ] Test backup security

### Network Security Testing
- [ ] Port scan for open services
- [ ] Test firewall rules
- [ ] Verify SSL/TLS configuration
- [ ] Test for DDoS protection
- [ ] Check for information disclosure
```

### User Security Training

**Security Awareness Program**
```markdown
## Legal Professional Security Training

### Module 1: Attorney-Client Privilege in Digital Systems
- Understanding digital privilege protection
- Recognizing privilege indicators
- Proper document classification
- Waiver prevention strategies

### Module 2: Secure Communication Practices
- Email security best practices
- Secure file sharing protocols
- Client portal usage
- Mobile device security

### Module 3: Incident Recognition and Response
- Identifying security incidents
- Reporting procedures
- Immediate response actions
- Evidence preservation

### Module 4: Compliance Requirements
- Data protection regulations
- Professional responsibility rules
- Client confidentiality obligations
- Record retention requirements
```

---

## Security Metrics and KPIs

### Key Security Indicators

```sql
-- Security dashboard metrics
CREATE VIEW security_metrics_dashboard AS
SELECT 
    'failed_logins_24h' as metric,
    COUNT(*) as value
FROM audit_log 
WHERE action = 'login_failed' 
AND created_at >= NOW() - interval '24 hours'

UNION ALL

SELECT 
    'privilege_violations_7d' as metric,
    COUNT(*) as value
FROM audit_log 
WHERE entity_type = 'privilege_violation'
AND created_at >= NOW() - interval '7 days'

UNION ALL

SELECT 
    'high_risk_events_24h' as metric,
    COUNT(*) as value
FROM audit_log 
WHERE risk_level = 'high'
AND created_at >= NOW() - interval '24 hours'

UNION ALL

SELECT 
    'active_user_sessions' as metric,
    COUNT(DISTINCT user_id) as value
FROM audit_log 
WHERE action = 'login'
AND created_at >= NOW() - interval '1 hour';
```

---

*Last Updated: 2025-08-17*

**Next Steps**: After implementing these security measures, regularly review and update the security configuration based on threat landscape changes and compliance requirements. Schedule quarterly security assessments and annual penetration testing.