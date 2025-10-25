import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId;

    const statusResponse = await fetch(`https://api.higgsfield.ai/v1/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.HIGGS_API_KEY}`,
      },
    });

    if (!statusResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch job status' },
        { status: 500 }
      );
    }

    const statusData = await statusResponse.json();

    return NextResponse.json({
      jobId,
      status: statusData.status,
      output_url: statusData.output_url || null,
      error: statusData.error || null,
      progress: statusData.progress || 0,
    });

  } catch (error) {
    console.error('Job status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Status check failed' },
      { status: 500 }
    );
  }
}
