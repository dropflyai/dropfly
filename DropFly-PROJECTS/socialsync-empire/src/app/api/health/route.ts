import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  checks: {
    database: {
      status: 'up' | 'down'
      latency?: number
      error?: string
    }
    storage: {
      status: 'up' | 'down'
      error?: string
    }
  }
  version: string
}

export async function GET() {
  const startTime = Date.now()
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'up' },
      storage: { status: 'up' }
    },
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
  }

  try {
    // Check database connection
    const supabase = await createClient()
    const dbStart = Date.now()

    const { error: dbError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })

    result.checks.database.latency = Date.now() - dbStart

    if (dbError) {
      result.checks.database.status = 'down'
      result.checks.database.error = dbError.message
      result.status = 'unhealthy'
    }

    // Check storage connection (requires service role)
    try {
      const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data: buckets, error: storageError } = await serviceClient.storage.listBuckets()

      if (storageError) {
        result.checks.storage.status = 'down'
        result.checks.storage.error = storageError.message
        result.status = 'degraded'
      } else if (!buckets?.length) {
        result.checks.storage.status = 'down'
        result.checks.storage.error = 'No storage buckets found'
        result.status = 'degraded'
      }
    } catch (storageErr) {
      result.checks.storage.status = 'down'
      result.checks.storage.error = storageErr instanceof Error ? storageErr.message : 'Unknown storage error'
      result.status = 'degraded'
    }

  } catch (error) {
    result.status = 'unhealthy'
    result.checks.database.status = 'down'
    result.checks.database.error = error instanceof Error ? error.message : 'Unknown error'
  }

  const statusCode = result.status === 'healthy' ? 200 :
                     result.status === 'degraded' ? 200 : 500

  return NextResponse.json(result, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}
