/**
 * Deployment Verification Tool
 *
 * Verifies that deployments actually work by checking:
 * - HTTP status codes
 * - Page content loads
 * - No critical errors
 */

import { createTool, type ToolInput, type ToolOutput, type ToolContext } from './base.js';

interface VerifyInput extends ToolInput {
  url: string;
  expectedStatus?: number;
  checkContent?: string;
  timeout?: number;
}

async function verifyDeployment(
  input: ToolInput,
  _context: ToolContext
): Promise<ToolOutput> {
  const { url, expectedStatus = 200, checkContent, timeout = 30000 } = input as VerifyInput;

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'X2000-Verification/1.0',
      },
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    const status = response.status;

    // Check status code
    if (status !== expectedStatus) {
      const recommendation = status === 500
        ? 'Check server logs, environment variables, and middleware configuration'
        : status === 404
        ? 'Verify the deployment URL and routing configuration'
        : status === 401 || status === 403
        ? 'Check authentication configuration and API keys'
        : `Investigate HTTP ${status} error`;

      return {
        success: false,
        error: `Expected status ${expectedStatus}, got ${status}`,
        data: {
          verified: false,
          status,
          responseTime,
          recommendation,
        },
      };
    }

    // Check content if specified
    let contentFound = true;
    if (checkContent) {
      const text = await response.text();
      contentFound = text.includes(checkContent);

      if (!contentFound) {
        return {
          success: false,
          error: `Expected content "${checkContent}" not found in response`,
          data: {
            verified: false,
            status,
            responseTime,
            contentFound: false,
            recommendation: 'Verify the page renders correctly and expected content is present',
          },
        };
      }
    }

    return {
      success: true,
      data: {
        verified: true,
        status,
        responseTime,
        contentFound,
      },
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: `Request timed out after ${timeout}ms`,
          data: {
            verified: false,
            responseTime,
            recommendation: 'Check if the server is responding. May need to investigate performance issues.',
          },
        };
      }

      return {
        success: false,
        error: error.message,
        data: {
          verified: false,
          responseTime,
          recommendation: 'Check network connectivity and DNS configuration',
        },
      };
    }

    return {
      success: false,
      error: String(error),
      data: {
        verified: false,
        responseTime,
      },
    };
  }
}

export default createTool({
  name: 'verify_deployment',
  description: 'Verify that a deployed URL is working correctly. MUST be used after any deployment to confirm success.',
  category: 'read',
  minTrustLevel: 1,
  parameters: [
    {
      name: 'url',
      type: 'string',
      description: 'The URL to verify',
      required: true,
    },
    {
      name: 'expectedStatus',
      type: 'number',
      description: 'Expected HTTP status code (default: 200)',
      required: false,
    },
    {
      name: 'checkContent',
      type: 'string',
      description: 'String that should appear in the response',
      required: false,
    },
    {
      name: 'timeout',
      type: 'number',
      description: 'Request timeout in milliseconds (default: 30000)',
      required: false,
    },
  ],
  execute: verifyDeployment,
});
