import { createClient } from '@/lib/supabase/server'

interface ErrorLog {
  message: string
  stack?: string
  context?: Record<string, unknown>
  userId?: string
  path?: string
  method?: string
  statusCode?: number
}

interface ErrorStats {
  errorType: string
  count: number
  lastOccurrence: string
}

/**
 * Log errors to console and database
 * Tracks error frequency and provides analytics
 */
export async function logError(error: Error | string, context?: ErrorLog): Promise<void> {
  const errorMessage = typeof error === 'string' ? error : error.message
  const stack = typeof error === 'string' ? undefined : error.stack

  // Always log to console for immediate visibility
  console.error('ERROR:', errorMessage, {
    stack,
    ...context,
    timestamp: new Date().toISOString()
  })

  try {
    const supabase = await createClient()

    // Prepare error log entry
    const logEntry = {
      error_message: errorMessage,
      stack_trace: stack,
      context: context || {},
      user_id: context?.userId,
      path: context?.path,
      method: context?.method,
      status_code: context?.statusCode,
      created_at: new Date().toISOString()
    }

    // Insert error log (table should exist or be created in migration)
    const { error: insertError } = await supabase
      .from('error_logs')
      .insert(logEntry)

    if (insertError) {
      // If database logging fails, at least we have console log
      console.warn('Failed to log error to database:', insertError.message)
    }

  } catch (dbError) {
    // Don't throw - logging should not break the application
    console.warn('Error logger failed:', dbError)
  }
}

/**
 * Get error statistics for monitoring
 */
export async function getErrorStats(
  hoursBack: number = 24
): Promise<ErrorStats[]> {
  try {
    const supabase = await createClient()
    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - hoursBack)

    const { data, error } = await supabase
      .from('error_logs')
      .select('error_message, created_at')
      .gte('created_at', cutoffTime.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch error stats:', error)
      return []
    }

    // Group errors by type and count occurrences
    const statsMap = new Map<string, { count: number; lastOccurrence: string }>()

    data?.forEach((log) => {
      const existing = statsMap.get(log.error_message)
      if (existing) {
        existing.count++
        if (log.created_at > existing.lastOccurrence) {
          existing.lastOccurrence = log.created_at
        }
      } else {
        statsMap.set(log.error_message, {
          count: 1,
          lastOccurrence: log.created_at
        })
      }
    })

    // Convert to array and sort by count
    return Array.from(statsMap.entries())
      .map(([errorType, stats]) => ({
        errorType,
        count: stats.count,
        lastOccurrence: stats.lastOccurrence
      }))
      .sort((a, b) => b.count - a.count)

  } catch (error) {
    console.error('Failed to get error stats:', error)
    return []
  }
}

/**
 * Clear old error logs (cleanup job)
 */
export async function cleanupOldErrors(daysBack: number = 30): Promise<number> {
  try {
    const supabase = await createClient()
    const cutoffTime = new Date()
    cutoffTime.setDate(cutoffTime.getDate() - daysBack)

    const { data, error } = await supabase
      .from('error_logs')
      .delete()
      .lt('created_at', cutoffTime.toISOString())
      .select()

    if (error) {
      console.error('Failed to cleanup old errors:', error)
      return 0
    }

    return data?.length || 0
  } catch (error) {
    console.error('Failed to cleanup old errors:', error)
    return 0
  }
}

/**
 * Middleware helper to log API errors
 */
export function createErrorContext(
  request: Request,
  additionalContext?: Record<string, unknown>
): Partial<ErrorLog> {
  return {
    path: new URL(request.url).pathname,
    method: request.method,
    context: additionalContext
  }
}
