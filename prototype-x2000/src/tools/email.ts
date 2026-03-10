/**
 * Email Tool (Stub)
 */

import { createTool, type ToolInput, type ToolContext, type ToolOutput } from './base.js';

const emailTool = createTool({
  name: 'email',
  description: 'Send and receive emails',
  category: 'external',
  minTrustLevel: 4,
  parameters: [
    { name: 'action', type: 'string', description: 'Action: send, read, search', required: true },
    { name: 'to', type: 'string', description: 'Recipient email', required: false },
    { name: 'subject', type: 'string', description: 'Email subject', required: false },
    { name: 'body', type: 'string', description: 'Email body', required: false },
  ],
  async execute(input: ToolInput, context: ToolContext): Promise<ToolOutput> {
    return {
      success: false,
      error: 'Email tool not configured - requires SMTP/IMAP credentials',
    };
  },
});

export default emailTool;
