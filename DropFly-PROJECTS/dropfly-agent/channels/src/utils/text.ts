/**
 * Text utilities for channel adapters.
 *
 * Different platforms have different message length limits.
 * These helpers handle chunking and formatting.
 */

/** Platform message length limits */
const LIMITS: Record<string, number> = {
  whatsapp: 4096,
  telegram: 4096,
  slack: 3000, // Slack blocks have different limits, but text is ~3000
  discord: 2000,
  sms: 1600, // 10 segments max
};

/**
 * Split a long message into chunks that fit within the platform's limit.
 * Tries to split at paragraph boundaries, then sentence boundaries.
 */
export function chunkMessage(text: string, channel: string): string[] {
  const limit = LIMITS[channel] ?? 4096;

  if (text.length <= limit) {
    return [text];
  }

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= limit) {
      chunks.push(remaining);
      break;
    }

    // Try to split at paragraph boundary
    let splitAt = remaining.lastIndexOf("\n\n", limit);

    // Fall back to newline
    if (splitAt <= 0) {
      splitAt = remaining.lastIndexOf("\n", limit);
    }

    // Fall back to sentence boundary
    if (splitAt <= 0) {
      splitAt = remaining.lastIndexOf(". ", limit);
      if (splitAt > 0) splitAt += 1; // Include the period
    }

    // Last resort: hard cut at limit
    if (splitAt <= 0) {
      splitAt = limit;
    }

    chunks.push(remaining.slice(0, splitAt).trimEnd());
    remaining = remaining.slice(splitAt).trimStart();
  }

  return chunks;
}

/**
 * Strip markdown formatting for platforms that don't support it.
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")       // Bold
    .replace(/\*(.*?)\*/g, "$1")            // Italic
    .replace(/`{3}[\s\S]*?`{3}/g, "")       // Code blocks
    .replace(/`(.*?)`/g, "$1")              // Inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
    .replace(/^#{1,6}\s+/gm, "");           // Headings
}
