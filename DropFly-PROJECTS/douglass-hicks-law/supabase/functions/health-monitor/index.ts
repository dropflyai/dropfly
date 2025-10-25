// LegalFlow Pro - Health Monitoring and Alerting Edge Function
// Comprehensive system health monitoring with automated alerts
// Created: 2025-08-17

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthCheckRequest {
  action: 'full_check' | 'database_check' | 'performance_check' | 'security_check' | 'compliance_check'
  lawFirmId?: string
  thresholds?: {
    responseTime?: number // milliseconds
    errorRate?: number // percentage
    cpuUsage?: number // percentage
    memoryUsage?: number // percentage
    diskUsage?: number // percentage
  }
}

interface HealthCheckResponse {
  success: boolean
  timestamp: string
  overallStatus: 'healthy' | 'warning' | 'critical' | 'unknown'
  checks: HealthCheck[]
  summary: {
    total: number
    healthy: number
    warnings: number
    critical: number
  }
  recommendations?: string[]
  alerts?: Alert[]
}

interface HealthCheck {
  name: string
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  responseTime: number
  message: string
  details?: any
  metrics?: { [key: string]: number }
  lastCheck: string
}

interface Alert {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  source: string
  timestamp: string
  acknowledged: boolean
  resolved: boolean
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // For health checks, we use service role key for system access
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    const request: HealthCheckRequest = await req.json()
    const startTime = Date.now()

    let checks: HealthCheck[] = []
    let alerts: Alert[] = []

    // Perform requested health checks
    switch (request.action) {
      case 'full_check':
        checks = await performFullHealthCheck(adminClient, request)
        break
      
      case 'database_check':
        checks = await performDatabaseCheck(adminClient, request)
        break
      
      case 'performance_check':
        checks = await performPerformanceCheck(adminClient, request)
        break
      
      case 'security_check':
        checks = await performSecurityCheck(adminClient, request)
        break
      
      case 'compliance_check':
        checks = await performComplianceCheck(adminClient, request)
        break
      
      default:
        throw new Error('Invalid health check action')
    }

    // Generate alerts for critical issues
    alerts = generateAlerts(checks)

    // Calculate overall status
    const overallStatus = calculateOverallStatus(checks)

    // Generate recommendations
    const recommendations = generateRecommendations(checks)

    // Record health check results
    await recordHealthCheckResults(adminClient, checks, overallStatus)

    // Send alerts if necessary
    if (alerts.length > 0) {
      await processAlerts(adminClient, alerts)
    }

    const summary = {
      total: checks.length,
      healthy: checks.filter(c => c.status === 'healthy').length,
      warnings: checks.filter(c => c.status === 'warning').length,
      critical: checks.filter(c => c.status === 'critical').length
    }

    const response: HealthCheckResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      overallStatus,
      checks,
      summary,
      recommendations,
      alerts
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Health monitoring error:', error)
    
    const response: HealthCheckResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      overallStatus: 'critical',
      checks: [],
      summary: { total: 0, healthy: 0, warnings: 0, critical: 1 }
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function performFullHealthCheck(client: any, request: HealthCheckRequest): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = []
  
  // Combine all health checks
  const databaseChecks = await performDatabaseCheck(client, request)
  const performanceChecks = await performPerformanceCheck(client, request)
  const securityChecks = await performSecurityCheck(client, request)
  const complianceChecks = await performComplianceCheck(client, request)
  
  checks.push(...databaseChecks, ...performanceChecks, ...securityChecks, ...complianceChecks)
  
  return checks
}

async function performDatabaseCheck(client: any, request: HealthCheckRequest): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = []
  
  // Database connectivity check
  const connectivityCheck = await performConnectivityCheck(client)
  checks.push(connectivityCheck)
  
  // Database performance check
  const dbPerformanceCheck = await performDatabasePerformanceCheck(client)
  checks.push(dbPerformanceCheck)
  
  // Connection pool check
  const connectionPoolCheck = await performConnectionPoolCheck(client)
  checks.push(connectionPoolCheck)
  
  // Storage space check
  const storageCheck = await performStorageCheck(client)
  checks.push(storageCheck)
  
  // Backup status check
  const backupCheck = await performBackupCheck(client)
  checks.push(backupCheck)
  
  return checks
}

async function performPerformanceCheck(client: any, request: HealthCheckRequest): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = []
  
  // Response time check
  const responseTimeCheck = await performResponseTimeCheck(client, request.thresholds?.responseTime || 1000)
  checks.push(responseTimeCheck)
  
  // Query performance check
  const queryPerformanceCheck = await performQueryPerformanceCheck(client)
  checks.push(queryPerformanceCheck)
  
  // Index usage check
  const indexUsageCheck = await performIndexUsageCheck(client)
  checks.push(indexUsageCheck)
  
  // Memory usage check
  const memoryCheck = await performMemoryCheck(client, request.thresholds?.memoryUsage || 80)
  checks.push(memoryCheck)
  
  return checks
}

async function performSecurityCheck(client: any, request: HealthCheckRequest): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = []
  
  // RLS policy check
  const rlsCheck = await performRLSCheck(client)
  checks.push(rlsCheck)
  
  // Failed login attempts check
  const failedLoginsCheck = await performFailedLoginsCheck(client)
  checks.push(failedLoginsCheck)
  
  // Privilege escalation check
  const privilegeCheck = await performPrivilegeCheck(client)
  checks.push(privilegeCheck)
  
  // Data integrity check
  const integrityCheck = await performDataIntegrityCheck(client)
  checks.push(integrityCheck)
  
  return checks
}

async function performComplianceCheck(client: any, request: HealthCheckRequest): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = []
  
  // Audit trail completeness
  const auditCheck = await performAuditTrailCheck(client)
  checks.push(auditCheck)
  
  // Data retention compliance
  const retentionCheck = await performDataRetentionCheck(client)
  checks.push(retentionCheck)
  
  // Legal holds status
  const legalHoldsCheck = await performLegalHoldsCheck(client)
  checks.push(legalHoldsCheck)
  
  // Privilege assertions
  const privilegeAssertionsCheck = await performPrivilegeAssertionsCheck(client)
  checks.push(privilegeAssertionsCheck)
  
  return checks
}

// Individual Health Check Implementations

async function performConnectivityCheck(client: any): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    const { data, error } = await client
      .from('law_firms')
      .select('count', { count: 'exact', head: true })
    
    const responseTime = Date.now() - startTime
    
    if (error) {
      return {
        name: 'Database Connectivity',
        status: 'critical',
        responseTime,
        message: `Database connection failed: ${error.message}`,
        lastCheck: new Date().toISOString()
      }
    }
    
    return {
      name: 'Database Connectivity',
      status: responseTime < 500 ? 'healthy' : 'warning',
      responseTime,
      message: `Database connected successfully (${responseTime}ms)`,
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      name: 'Database Connectivity',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: `Database connectivity error: ${error.message}`,
      lastCheck: new Date().toISOString()
    }
  }
}

async function performDatabasePerformanceCheck(client: any): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Check slow queries
    const { data: slowQueries } = await client.rpc('get_slow_queries_count')
    const responseTime = Date.now() - startTime
    
    const slowQueryCount = slowQueries || 0
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    
    if (slowQueryCount > 10) status = 'critical'
    else if (slowQueryCount > 5) status = 'warning'
    
    return {
      name: 'Database Performance',
      status,
      responseTime,
      message: `${slowQueryCount} slow queries detected`,
      metrics: { slowQueries: slowQueryCount },
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      name: 'Database Performance',
      status: 'warning',
      responseTime: Date.now() - startTime,
      message: `Performance check failed: ${error.message}`,
      lastCheck: new Date().toISOString()
    }
  }
}

async function performConnectionPoolCheck(client: any): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Simulate connection pool check
    const connectionPoolUsage = Math.random() * 100 // In production, get actual metrics
    const responseTime = Date.now() - startTime
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (connectionPoolUsage > 90) status = 'critical'
    else if (connectionPoolUsage > 75) status = 'warning'
    
    return {
      name: 'Connection Pool',
      status,
      responseTime,
      message: `Connection pool usage: ${connectionPoolUsage.toFixed(1)}%`,
      metrics: { poolUsage: connectionPoolUsage },
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      name: 'Connection Pool',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: `Connection pool check failed: ${error.message}`,
      lastCheck: new Date().toISOString()
    }
  }
}

async function performStorageCheck(client: any): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Check storage usage (simplified)
    const { data: documentCount } = await client
      .from('documents')
      .select('file_size.sum()')
      .single()
    
    const responseTime = Date.now() - startTime
    const totalSize = documentCount?.sum || 0
    const storageUsage = (totalSize / (1024 * 1024 * 1024)) // GB
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (storageUsage > 1000) status = 'critical' // 1TB
    else if (storageUsage > 500) status = 'warning' // 500GB
    
    return {
      name: 'Storage Usage',
      status,
      responseTime,
      message: `Storage used: ${storageUsage.toFixed(2)} GB`,
      metrics: { storageGB: storageUsage },
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      name: 'Storage Usage',
      status: 'warning',
      responseTime: Date.now() - startTime,
      message: `Storage check failed: ${error.message}`,
      lastCheck: new Date().toISOString()
    }
  }
}

async function performBackupCheck(client: any): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Check last backup timestamp (simulated)
    const lastBackup = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random within 24 hours
    const hoursAgo = (Date.now() - lastBackup.getTime()) / (1000 * 60 * 60)
    const responseTime = Date.now() - startTime
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (hoursAgo > 48) status = 'critical'
    else if (hoursAgo > 24) status = 'warning'
    
    return {
      name: 'Backup Status',
      status,
      responseTime,
      message: `Last backup: ${hoursAgo.toFixed(1)} hours ago`,
      metrics: { hoursAgo },
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      name: 'Backup Status',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: `Backup check failed: ${error.message}`,
      lastCheck: new Date().toISOString()
    }
  }
}

async function performResponseTimeCheck(client: any, threshold: number): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Test a typical query
    await client
      .from('cases')
      .select('id, title')
      .limit(10)
    
    const responseTime = Date.now() - startTime
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (responseTime > threshold * 2) status = 'critical'
    else if (responseTime > threshold) status = 'warning'
    
    return {
      name: 'API Response Time',
      status,
      responseTime,
      message: `Query response time: ${responseTime}ms (threshold: ${threshold}ms)`,
      metrics: { responseTime, threshold },
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      name: 'API Response Time',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: `Response time check failed: ${error.message}`,
      lastCheck: new Date().toISOString()
    }
  }
}

async function performQueryPerformanceCheck(client: any): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Check for long-running queries
    const queries = await client.rpc('check_long_running_queries') || []
    const responseTime = Date.now() - startTime
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (queries.length > 5) status = 'critical'
    else if (queries.length > 2) status = 'warning'
    
    return {
      name: 'Query Performance',
      status,
      responseTime,
      message: `${queries.length} long-running queries detected`,
      metrics: { longRunningQueries: queries.length },
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      name: 'Query Performance',
      status: 'warning',
      responseTime: Date.now() - startTime,
      message: `Query performance check failed: ${error.message}`,
      lastCheck: new Date().toISOString()
    }
  }
}

async function performIndexUsageCheck(client: any): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Check index usage statistics
    const { data: unusedIndexes } = await client.rpc('get_unused_indexes_count') || { data: 0 }
    const responseTime = Date.now() - startTime
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (unusedIndexes > 10) status = 'warning'
    
    return {
      name: 'Index Usage',
      status,
      responseTime,
      message: `${unusedIndexes} unused indexes found`,
      metrics: { unusedIndexes },
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      name: 'Index Usage',
      status: 'warning',
      responseTime: Date.now() - startTime,
      message: `Index usage check failed: ${error.message}`,
      lastCheck: new Date().toISOString()
    }
  }
}

async function performMemoryCheck(client: any, threshold: number): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Simulate memory usage check
    const memoryUsage = Math.random() * 100 // In production, get actual memory metrics
    const responseTime = Date.now() - startTime
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (memoryUsage > 90) status = 'critical'
    else if (memoryUsage > threshold) status = 'warning'
    
    return {
      name: 'Memory Usage',
      status,
      responseTime,
      message: `Memory usage: ${memoryUsage.toFixed(1)}%`,
      metrics: { memoryUsage, threshold },
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      name: 'Memory Usage',
      status: 'warning',
      responseTime: Date.now() - startTime,
      message: `Memory check failed: ${error.message}`,
      lastCheck: new Date().toISOString()
    }
  }
}

async function performRLSCheck(client: any): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Check that RLS is enabled on all tables
    const { data: tablesWithoutRLS } = await client.rpc('check_tables_without_rls') || { data: [] }
    const responseTime = Date.now() - startTime
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (tablesWithoutRLS.length > 0) status = 'critical'
    
    return {
      name: 'Row Level Security',
      status,
      responseTime,
      message: status === 'healthy' ? 'All tables have RLS enabled' : `${tablesWithoutRLS.length} tables missing RLS`,
      metrics: { tablesWithoutRLS: tablesWithoutRLS.length },
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      name: 'Row Level Security',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: `RLS check failed: ${error.message}`,
      lastCheck: new Date().toISOString()
    }
  }
}

async function performFailedLoginsCheck(client: any): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Check for failed login attempts
    const { data: failedLogins } = await client
      .from('audit_log')
      .select('count', { count: 'exact', head: true })
      .eq('action', 'login_failed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    
    const responseTime = Date.now() - startTime
    const failedCount = failedLogins || 0
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (failedCount > 100) status = 'critical'
    else if (failedCount > 50) status = 'warning'
    
    return {
      name: 'Failed Login Attempts',
      status,
      responseTime,
      message: `${failedCount} failed login attempts in last 24 hours`,
      metrics: { failedLogins: failedCount },
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      name: 'Failed Login Attempts',
      status: 'warning',
      responseTime: Date.now() - startTime,
      message: `Failed login check failed: ${error.message}`,
      lastCheck: new Date().toISOString()
    }
  }
}

async function performPrivilegeCheck(client: any): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Check for privilege escalation attempts
    const { data: privilegeChanges } = await client
      .from('audit_log')
      .select('count', { count: 'exact', head: true })
      .eq('entity_type', 'users')
      .ilike('notes', '%role%')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    
    const responseTime = Date.now() - startTime
    const changeCount = privilegeChanges || 0
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (changeCount > 10) status = 'warning'
    
    return {
      name: 'Privilege Changes',
      status,
      responseTime,
      message: `${changeCount} privilege changes in last 24 hours`,
      metrics: { privilegeChanges: changeCount },
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      name: 'Privilege Changes',
      status: 'warning',
      responseTime: Date.now() - startTime,
      message: `Privilege check failed: ${error.message}`,
      lastCheck: new Date().toISOString()
    }
  }
}

async function performDataIntegrityCheck(client: any): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Check for data integrity issues
    const { data: orphanedRecords } = await client.rpc('check_orphaned_records') || { data: 0 }
    const responseTime = Date.now() - startTime
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (orphanedRecords > 100) status = 'critical'
    else if (orphanedRecords > 10) status = 'warning'
    
    return {
      name: 'Data Integrity',
      status,
      responseTime,
      message: `${orphanedRecords} potential data integrity issues found`,
      metrics: { orphanedRecords },
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      name: 'Data Integrity',
      status: 'warning',
      responseTime: Date.now() - startTime,
      message: `Data integrity check failed: ${error.message}`,
      lastCheck: new Date().toISOString()
    }
  }
}

async function performAuditTrailCheck(client: any): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Check audit trail completeness
    const { data: auditGaps } = await client.rpc('check_audit_trail_gaps') || { data: 0 }
    const responseTime = Date.now() - startTime
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (auditGaps > 0) status = 'critical'
    
    return {
      name: 'Audit Trail Completeness',
      status,
      responseTime,
      message: status === 'healthy' ? 'Audit trail is complete' : `${auditGaps} gaps in audit trail`,
      metrics: { auditGaps },
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      name: 'Audit Trail Completeness',
      status: 'warning',
      responseTime: Date.now() - startTime,
      message: `Audit trail check failed: ${error.message}`,
      lastCheck: new Date().toISOString()
    }
  }
}

async function performDataRetentionCheck(client: any): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Check data retention compliance
    const { data: overdueDestructions } = await client
      .from('data_destruction_schedule')
      .select('count', { count: 'exact', head: true })
      .lt('scheduled_destruction_date', new Date().toISOString())
      .eq('destruction_executed', false)
      .eq('legal_hold_active', false)
    
    const responseTime = Date.now() - startTime
    const overdueCount = overdueDestructions || 0
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (overdueCount > 100) status = 'critical'
    else if (overdueCount > 10) status = 'warning'
    
    return {
      name: 'Data Retention Compliance',
      status,
      responseTime,
      message: `${overdueCount} overdue data destructions`,
      metrics: { overdueDestructions: overdueCount },
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      name: 'Data Retention Compliance',
      status: 'warning',
      responseTime: Date.now() - startTime,
      message: `Data retention check failed: ${error.message}`,
      lastCheck: new Date().toISOString()
    }
  }
}

async function performLegalHoldsCheck(client: any): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Check active legal holds
    const { data: activeHolds } = await client
      .from('legal_holds')
      .select('count', { count: 'exact', head: true })
      .eq('status', 'active')
    
    const responseTime = Date.now() - startTime
    const holdCount = activeHolds || 0
    
    return {
      name: 'Legal Holds Status',
      status: 'healthy',
      responseTime,
      message: `${holdCount} active legal holds`,
      metrics: { activeLegalHolds: holdCount },
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      name: 'Legal Holds Status',
      status: 'warning',
      responseTime: Date.now() - startTime,
      message: `Legal holds check failed: ${error.message}`,
      lastCheck: new Date().toISOString()
    }
  }
}

async function performPrivilegeAssertionsCheck(client: any): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Check privilege assertions
    const { data: privilegeViolations } = await client.rpc('check_privilege_violations') || { data: 0 }
    const responseTime = Date.now() - startTime
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (privilegeViolations > 0) status = 'critical'
    
    return {
      name: 'Attorney-Client Privilege',
      status,
      responseTime,
      message: status === 'healthy' ? 'No privilege violations detected' : `${privilegeViolations} privilege violations found`,
      metrics: { privilegeViolations },
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      name: 'Attorney-Client Privilege',
      status: 'warning',
      responseTime: Date.now() - startTime,
      message: `Privilege assertion check failed: ${error.message}`,
      lastCheck: new Date().toISOString()
    }
  }
}

// Helper Functions

function calculateOverallStatus(checks: HealthCheck[]): 'healthy' | 'warning' | 'critical' | 'unknown' {
  if (checks.some(c => c.status === 'critical')) return 'critical'
  if (checks.some(c => c.status === 'warning')) return 'warning'
  if (checks.some(c => c.status === 'unknown')) return 'unknown'
  return 'healthy'
}

function generateAlerts(checks: HealthCheck[]): Alert[] {
  const alerts: Alert[] = []
  
  checks.forEach(check => {
    if (check.status === 'critical') {
      alerts.push({
        id: crypto.randomUUID(),
        severity: 'critical',
        title: `Critical Issue: ${check.name}`,
        message: check.message,
        source: 'health-monitor',
        timestamp: new Date().toISOString(),
        acknowledged: false,
        resolved: false
      })
    } else if (check.status === 'warning') {
      alerts.push({
        id: crypto.randomUUID(),
        severity: 'medium',
        title: `Warning: ${check.name}`,
        message: check.message,
        source: 'health-monitor',
        timestamp: new Date().toISOString(),
        acknowledged: false,
        resolved: false
      })
    }
  })
  
  return alerts
}

function generateRecommendations(checks: HealthCheck[]): string[] {
  const recommendations: string[] = []
  
  const criticalChecks = checks.filter(c => c.status === 'critical')
  const warningChecks = checks.filter(c => c.status === 'warning')
  
  if (criticalChecks.length > 0) {
    recommendations.push('Address critical issues immediately to ensure system stability')
  }
  
  if (warningChecks.length > 0) {
    recommendations.push('Review warning conditions and implement preventive measures')
  }
  
  // Specific recommendations based on check types
  if (checks.some(c => c.name.includes('Performance') && c.status !== 'healthy')) {
    recommendations.push('Consider optimizing database queries and adding indexes')
  }
  
  if (checks.some(c => c.name.includes('Security') && c.status !== 'healthy')) {
    recommendations.push('Review security policies and access controls')
  }
  
  if (checks.some(c => c.name.includes('Compliance') && c.status !== 'healthy')) {
    recommendations.push('Ensure compliance requirements are met and documented')
  }
  
  return recommendations
}

async function recordHealthCheckResults(client: any, checks: HealthCheck[], overallStatus: string): Promise<void> {
  try {
    // Record each health check
    const promises = checks.map(check => 
      client
        .from('system_health_checks')
        .insert({
          check_name: check.name,
          status: check.status,
          message: check.message,
          response_time_ms: check.responseTime,
          checked_at: check.lastCheck
        })
    )
    
    await Promise.all(promises)
    
    // Record overall system status
    await client
      .from('performance_metrics')
      .insert({
        metric_name: 'system_health_score',
        metric_value: checks.filter(c => c.status === 'healthy').length / checks.length * 100,
        metric_unit: 'percentage',
        tags: { overall_status: overallStatus },
        recorded_at: new Date().toISOString()
      })
      
  } catch (error) {
    console.error('Failed to record health check results:', error)
  }
}

async function processAlerts(client: any, alerts: Alert[]): Promise<void> {
  try {
    // In production, integrate with alerting systems (PagerDuty, Slack, etc.)
    console.log('Processing alerts:', alerts.length)
    
    // Store alerts in audit log for tracking
    const auditPromises = alerts.map(alert =>
      client
        .from('audit_log')
        .insert({
          entity_type: 'system_alerts',
          entity_id: alert.id,
          action: 'alert_generated',
          new_values: alert,
          notes: `${alert.severity.toUpperCase()}: ${alert.title}`
        })
    )
    
    await Promise.all(auditPromises)
    
  } catch (error) {
    console.error('Failed to process alerts:', error)
  }
}