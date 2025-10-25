-- LegalFlow Pro - Monitoring and Alerting Database Functions
-- Supporting functions for health monitoring and performance tracking
-- Created: 2025-08-17

-- =============================================================================
-- PERFORMANCE MONITORING FUNCTIONS
-- =============================================================================

-- Function to get slow queries count
CREATE OR REPLACE FUNCTION get_slow_queries_count()
RETURNS INTEGER AS $$
BEGIN
    -- In production, integrate with pg_stat_statements
    -- For demo purposes, return simulated count
    RETURN (SELECT COUNT(*)::INTEGER FROM pg_stat_activity WHERE state = 'active' AND query_start < NOW() - interval '5 seconds');
EXCEPTION WHEN OTHERS THEN
    RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for long-running queries
CREATE OR REPLACE FUNCTION check_long_running_queries()
RETURNS TABLE (
    pid INTEGER,
    duration INTERVAL,
    query TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg_stat_activity.pid,
        NOW() - pg_stat_activity.query_start as duration,
        pg_stat_activity.query
    FROM pg_stat_activity
    WHERE pg_stat_activity.state = 'active'
    AND pg_stat_activity.query_start < NOW() - interval '30 seconds'
    AND pg_stat_activity.query NOT LIKE '%pg_stat_activity%'
    ORDER BY duration DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unused indexes count
CREATE OR REPLACE FUNCTION get_unused_indexes_count()
RETURNS INTEGER AS $$
BEGIN
    -- Check for indexes with low usage
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM pg_stat_user_indexes
        WHERE idx_scan < 10
        AND schemaname = 'public'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check tables without RLS
CREATE OR REPLACE FUNCTION check_tables_without_rls()
RETURNS TABLE (
    table_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.tablename::TEXT
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    AND NOT EXISTS (
        SELECT 1 
        FROM pg_policies p 
        WHERE p.schemaname = t.schemaname 
        AND p.tablename = t.tablename
    )
    AND t.tablename NOT IN ('system_health_checks', 'performance_metrics');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for orphaned records
CREATE OR REPLACE FUNCTION check_orphaned_records()
RETURNS INTEGER AS $$
DECLARE
    orphan_count INTEGER := 0;
BEGIN
    -- Check for orphaned documents (case_id not in cases)
    SELECT COUNT(*) INTO orphan_count
    FROM documents d
    WHERE d.case_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM cases c WHERE c.id = d.case_id);
    
    -- Add other orphan checks as needed
    
    RETURN orphan_count;
EXCEPTION WHEN OTHERS THEN
    RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check audit trail gaps
CREATE OR REPLACE FUNCTION check_audit_trail_gaps()
RETURNS INTEGER AS $$
DECLARE
    gap_count INTEGER := 0;
BEGIN
    -- Check for tables with triggers but missing recent audit entries
    WITH table_changes AS (
        SELECT 
            'documents' as table_name,
            COUNT(*) as recent_changes
        FROM documents 
        WHERE updated_at >= CURRENT_DATE - interval '7 days'
        
        UNION ALL
        
        SELECT 
            'cases' as table_name,
            COUNT(*) as recent_changes
        FROM cases 
        WHERE updated_at >= CURRENT_DATE - interval '7 days'
    ),
    audit_entries AS (
        SELECT 
            entity_type,
            COUNT(*) as audit_count
        FROM audit_log 
        WHERE created_at >= CURRENT_DATE - interval '7 days'
        AND action IN ('create', 'update', 'delete')
        GROUP BY entity_type
    )
    SELECT COUNT(*) INTO gap_count
    FROM table_changes tc
    LEFT JOIN audit_entries ae ON tc.table_name = ae.entity_type
    WHERE tc.recent_changes > 0 
    AND (ae.audit_count IS NULL OR ae.audit_count < tc.recent_changes * 0.8);
    
    RETURN gap_count;
EXCEPTION WHEN OTHERS THEN
    RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check privilege violations
CREATE OR REPLACE FUNCTION check_privilege_violations()
RETURNS INTEGER AS $$
DECLARE
    violation_count INTEGER := 0;
BEGIN
    -- Check for documents marked as privileged but accessible by wrong users
    SELECT COUNT(*) INTO violation_count
    FROM documents d
    WHERE d.is_privileged = true
    AND EXISTS (
        SELECT 1 FROM document_access_log dal
        WHERE dal.document_id = d.id
        AND dal.created_at >= CURRENT_DATE - interval '24 hours'
        AND dal.user_id NOT IN (
            -- Should only be accessible by attorneys, paralegals, and case team
            SELECT u.id FROM users u
            WHERE u.law_firm_id = d.law_firm_id
            AND u.role IN ('firm_admin', 'partner', 'senior_associate', 'associate', 'paralegal')
        )
    );
    
    RETURN violation_count;
EXCEPTION WHEN OTHERS THEN
    RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- AUTOMATED MONITORING TRIGGERS
-- =============================================================================

-- Function to track document access patterns
CREATE OR REPLACE FUNCTION track_document_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Log unusual access patterns
    IF TG_OP = 'INSERT' THEN
        -- Check for rapid access attempts
        IF EXISTS (
            SELECT 1 FROM document_access_log
            WHERE user_id = NEW.user_id
            AND created_at >= NOW() - interval '1 minute'
            GROUP BY user_id
            HAVING COUNT(*) > 10
        ) THEN
            INSERT INTO audit_log (
                law_firm_id,
                user_id,
                entity_type,
                entity_id,
                action,
                notes
            ) VALUES (
                NEW.law_firm_id,
                NEW.user_id,
                'security_alert',
                NEW.document_id,
                'rapid_access',
                'User accessed more than 10 documents in 1 minute'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_track_document_access 
    AFTER INSERT ON document_access_log 
    FOR EACH ROW EXECUTE FUNCTION track_document_access();

-- Function to monitor failed login attempts
CREATE OR REPLACE FUNCTION monitor_failed_logins()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for brute force attempts
    IF NEW.action = 'login_failed' THEN
        IF EXISTS (
            SELECT 1 FROM audit_log
            WHERE entity_type = 'auth'
            AND action = 'login_failed'
            AND ip_address = NEW.ip_address
            AND created_at >= NOW() - interval '15 minutes'
            GROUP BY ip_address
            HAVING COUNT(*) >= 5
        ) THEN
            INSERT INTO audit_log (
                law_firm_id,
                entity_type,
                entity_id,
                action,
                notes,
                ip_address
            ) VALUES (
                NEW.law_firm_id,
                'security_alert',
                gen_random_uuid(),
                'brute_force_detected',
                'Multiple failed login attempts from same IP',
                NEW.ip_address
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_monitor_failed_logins 
    AFTER INSERT ON audit_log 
    FOR EACH ROW EXECUTE FUNCTION monitor_failed_logins();

-- =============================================================================
-- PERFORMANCE METRICS COLLECTION
-- =============================================================================

-- Function to collect database metrics
CREATE OR REPLACE FUNCTION collect_database_metrics()
RETURNS VOID AS $$
DECLARE
    law_firm_record RECORD;
    metric_timestamp TIMESTAMPTZ := NOW();
BEGIN
    -- Collect metrics for each law firm
    FOR law_firm_record IN SELECT id FROM law_firms WHERE is_active = true LOOP
        
        -- Document count metric
        INSERT INTO performance_metrics (
            law_firm_id,
            metric_name,
            metric_value,
            metric_unit,
            recorded_at
        )
        SELECT 
            law_firm_record.id,
            'document_count',
            COUNT(*),
            'count',
            metric_timestamp
        FROM documents 
        WHERE law_firm_id = law_firm_record.id;
        
        -- Case count metric
        INSERT INTO performance_metrics (
            law_firm_id,
            metric_name,
            metric_value,
            metric_unit,
            recorded_at
        )
        SELECT 
            law_firm_record.id,
            'active_case_count',
            COUNT(*),
            'count',
            metric_timestamp
        FROM cases 
        WHERE law_firm_id = law_firm_record.id 
        AND status IN ('open', 'pending');
        
        -- Storage usage metric
        INSERT INTO performance_metrics (
            law_firm_id,
            metric_name,
            metric_value,
            metric_unit,
            recorded_at
        )
        SELECT 
            law_firm_record.id,
            'storage_usage_mb',
            COALESCE(SUM(file_size), 0) / (1024 * 1024),
            'megabytes',
            metric_timestamp
        FROM documents 
        WHERE law_firm_id = law_firm_record.id;
        
        -- Billable hours this month
        INSERT INTO performance_metrics (
            law_firm_id,
            metric_name,
            metric_value,
            metric_unit,
            recorded_at
        )
        SELECT 
            law_firm_record.id,
            'billable_hours_month',
            COALESCE(SUM(duration_minutes), 0) / 60.0,
            'hours',
            metric_timestamp
        FROM time_entries 
        WHERE law_firm_id = law_firm_record.id 
        AND is_billable = true
        AND date >= date_trunc('month', CURRENT_DATE);
        
    END LOOP;
    
    -- System-wide metrics
    INSERT INTO performance_metrics (
        metric_name,
        metric_value,
        metric_unit,
        recorded_at
    ) VALUES 
    (
        'total_database_size_mb',
        (SELECT pg_database_size(current_database()) / (1024 * 1024)),
        'megabytes',
        metric_timestamp
    ),
    (
        'active_connections',
        (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active'),
        'count',
        metric_timestamp
    ),
    (
        'slow_query_count',
        get_slow_queries_count(),
        'count',
        metric_timestamp
    );
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate performance trends
CREATE OR REPLACE FUNCTION calculate_performance_trends(
    p_law_firm_id UUID DEFAULT NULL,
    p_metric_name TEXT DEFAULT NULL,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    metric_name TEXT,
    current_value DECIMAL,
    previous_value DECIMAL,
    trend_percentage DECIMAL,
    trend_direction TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH current_metrics AS (
        SELECT 
            pm.metric_name,
            AVG(pm.metric_value) as avg_value
        FROM performance_metrics pm
        WHERE (p_law_firm_id IS NULL OR pm.law_firm_id = p_law_firm_id)
        AND (p_metric_name IS NULL OR pm.metric_name = p_metric_name)
        AND pm.recorded_at >= CURRENT_DATE - interval '7 days'
        GROUP BY pm.metric_name
    ),
    previous_metrics AS (
        SELECT 
            pm.metric_name,
            AVG(pm.metric_value) as avg_value
        FROM performance_metrics pm
        WHERE (p_law_firm_id IS NULL OR pm.law_firm_id = p_law_firm_id)
        AND (p_metric_name IS NULL OR pm.metric_name = p_metric_name)
        AND pm.recorded_at >= CURRENT_DATE - interval '14 days'
        AND pm.recorded_at < CURRENT_DATE - interval '7 days'
        GROUP BY pm.metric_name
    )
    SELECT 
        cm.metric_name,
        cm.avg_value as current_value,
        COALESCE(pm.avg_value, 0) as previous_value,
        CASE 
            WHEN COALESCE(pm.avg_value, 0) = 0 THEN 0
            ELSE ((cm.avg_value - pm.avg_value) / pm.avg_value * 100)
        END as trend_percentage,
        CASE 
            WHEN cm.avg_value > COALESCE(pm.avg_value, 0) THEN 'increasing'
            WHEN cm.avg_value < COALESCE(pm.avg_value, 0) THEN 'decreasing'
            ELSE 'stable'
        END as trend_direction
    FROM current_metrics cm
    LEFT JOIN previous_metrics pm ON cm.metric_name = pm.metric_name
    ORDER BY cm.metric_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ALERTING FUNCTIONS
-- =============================================================================

-- Function to check and generate alerts
CREATE OR REPLACE FUNCTION check_and_generate_alerts()
RETURNS VOID AS $$
DECLARE
    alert_record RECORD;
BEGIN
    -- Check for critical storage usage
    FOR alert_record IN 
        SELECT 
            law_firm_id,
            metric_value
        FROM performance_metrics 
        WHERE metric_name = 'storage_usage_mb'
        AND recorded_at >= CURRENT_DATE - interval '1 hour'
        AND metric_value > 10000 -- 10GB threshold
    LOOP
        INSERT INTO audit_log (
            law_firm_id,
            entity_type,
            entity_id,
            action,
            notes
        ) VALUES (
            alert_record.law_firm_id,
            'storage_alert',
            gen_random_uuid(),
            'storage_warning',
            format('Storage usage exceeded threshold: %.2f MB', alert_record.metric_value)
        );
    END LOOP;
    
    -- Check for compliance violations
    FOR alert_record IN 
        SELECT 
            law_firm_id,
            COUNT(*) as violation_count
        FROM compliance_checks
        WHERE status = 'non_compliant'
        AND check_date >= CURRENT_DATE - interval '24 hours'
        GROUP BY law_firm_id
        HAVING COUNT(*) > 0
    LOOP
        INSERT INTO audit_log (
            law_firm_id,
            entity_type,
            entity_id,
            action,
            notes
        ) VALUES (
            alert_record.law_firm_id,
            'compliance_alert',
            gen_random_uuid(),
            'compliance_violation',
            format('%s compliance violations detected in last 24 hours', alert_record.violation_count)
        );
    END LOOP;
    
    -- Check for overdue data destructions
    FOR alert_record IN 
        SELECT 
            law_firm_id,
            COUNT(*) as overdue_count
        FROM data_destruction_schedule
        WHERE scheduled_destruction_date < CURRENT_DATE
        AND NOT destruction_executed
        AND NOT legal_hold_active
        GROUP BY law_firm_id
        HAVING COUNT(*) > 10
    LOOP
        INSERT INTO audit_log (
            law_firm_id,
            entity_type,
            entity_id,
            action,
            notes
        ) VALUES (
            alert_record.law_firm_id,
            'retention_alert',
            gen_random_uuid(),
            'overdue_destruction',
            format('%s records overdue for destruction', alert_record.overdue_count)
        );
    END LOOP;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- SCHEDULED MONITORING JOBS
-- =============================================================================

-- Schedule metrics collection every 15 minutes
SELECT cron.schedule(
    'collect-metrics',
    '*/15 * * * *',
    'SELECT collect_database_metrics();'
);

-- Schedule alert checking every hour
SELECT cron.schedule(
    'check-alerts',
    '0 * * * *',
    'SELECT check_and_generate_alerts();'
);

-- Schedule daily health checks
SELECT cron.schedule(
    'daily-health-check',
    '0 3 * * *', -- 3 AM daily
    $$
    INSERT INTO system_health_checks (check_name, status, message, response_time_ms)
    SELECT 
        'Daily System Health',
        CASE 
            WHEN violation_count > 0 THEN 'warning'
            WHEN error_count > 0 THEN 'critical'
            ELSE 'healthy'
        END,
        format('Daily check: %s violations, %s errors', violation_count, error_count),
        1000
    FROM (
        SELECT 
            (SELECT COUNT(*) FROM compliance_checks WHERE status = 'non_compliant' AND check_date >= CURRENT_DATE - interval '24 hours') as violation_count,
            (SELECT COUNT(*) FROM audit_log WHERE action LIKE '%error%' AND created_at >= CURRENT_DATE - interval '24 hours') as error_count
    ) daily_stats;
    $$
);

-- =============================================================================
-- MONITORING VIEWS FOR DASHBOARDS
-- =============================================================================

-- Real-time system health view
CREATE VIEW system_health_realtime AS
SELECT 
    'Database' as component,
    CASE 
        WHEN last_check < NOW() - interval '10 minutes' THEN 'unknown'
        WHEN MAX(CASE WHEN status = 'critical' THEN 1 ELSE 0 END) > 0 THEN 'critical'
        WHEN MAX(CASE WHEN status = 'warning' THEN 1 ELSE 0 END) > 0 THEN 'warning'
        ELSE 'healthy'
    END as status,
    MAX(checked_at) as last_check,
    COUNT(*) as total_checks,
    AVG(response_time_ms) as avg_response_time
FROM system_health_checks
WHERE checked_at >= NOW() - interval '1 hour'
GROUP BY component;

-- Performance trends view
CREATE VIEW performance_trends_daily AS
SELECT 
    law_firm_id,
    metric_name,
    DATE(recorded_at) as metric_date,
    AVG(metric_value) as avg_value,
    MIN(metric_value) as min_value,
    MAX(metric_value) as max_value,
    COUNT(*) as measurement_count
FROM performance_metrics
WHERE recorded_at >= CURRENT_DATE - interval '30 days'
GROUP BY law_firm_id, metric_name, DATE(recorded_at)
ORDER BY law_firm_id, metric_name, metric_date;

-- Alert summary view
CREATE VIEW alert_summary AS
SELECT 
    law_firm_id,
    entity_type,
    COUNT(*) as alert_count,
    MAX(created_at) as last_alert,
    COUNT(*) FILTER (WHERE created_at >= NOW() - interval '24 hours') as recent_alerts
FROM audit_log
WHERE action LIKE '%alert%' OR action LIKE '%warning%' OR action LIKE '%violation%'
GROUP BY law_firm_id, entity_type
ORDER BY recent_alerts DESC, alert_count DESC;

COMMIT;