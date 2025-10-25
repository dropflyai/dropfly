import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const N8N_API_URL = process.env.N8N_API_URL;
  const N8N_API_KEY = process.env.N8N_API_KEY;
  const RSS_WORKFLOW_ID = process.env.RSS_WORKFLOW_ID;

  const body = await request.json();
  const { workflowId = RSS_WORKFLOW_ID, revisionData } = body;

  try {
    // Prepare workflow input data
    const workflowInput = revisionData ? {
      revision: revisionData
    } : {};

    // Trigger the workflow
    const response = await fetch(
      `${N8N_API_URL}/api/v1/workflows/${workflowId}/execute`,
      {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowInput),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`n8n API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Get execution status
    const executionId = data.data?.executionId;

    return NextResponse.json({
      success: true,
      executionId,
      message: 'Workflow triggered successfully',
    });
  } catch (error) {
    console.error('Error triggering workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to trigger workflow'
      },
      { status: 500 }
    );
  }
}
