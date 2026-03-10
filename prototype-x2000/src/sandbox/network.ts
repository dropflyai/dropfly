/**
 * X2000 Sandbox Network Isolation
 *
 * Handles network allowlisting, DNS filtering, and egress rules
 * for sandbox execution.
 */

import type { NetworkConfig, NetworkMode, NetworkRule, SandboxLevel } from './types.js';

// ============================================================================
// Default Network Allowlist
// ============================================================================

/**
 * Default allowlist for network access
 * Used when mode is 'allowlist' and no custom rules are provided
 */
export const DEFAULT_NETWORK_ALLOWLIST: NetworkRule[] = [
  // Package registries
  { type: 'allow', host: 'registry.npmjs.org', port: 443, protocol: 'tcp', description: 'npm registry' },
  { type: 'allow', host: 'registry.yarnpkg.com', port: 443, protocol: 'tcp', description: 'yarn registry' },
  { type: 'allow', host: 'pypi.org', port: 443, protocol: 'tcp', description: 'PyPI' },
  { type: 'allow', host: 'files.pythonhosted.org', port: 443, protocol: 'tcp', description: 'Python packages' },
  { type: 'allow', host: 'crates.io', port: 443, protocol: 'tcp', description: 'Rust crates' },
  { type: 'allow', host: 'rubygems.org', port: 443, protocol: 'tcp', description: 'Ruby gems' },
  { type: 'allow', host: 'pkg.go.dev', port: 443, protocol: 'tcp', description: 'Go packages' },

  // Git hosting
  { type: 'allow', host: 'github.com', port: 443, protocol: 'tcp', description: 'GitHub HTTPS' },
  { type: 'allow', host: 'github.com', port: 22, protocol: 'tcp', description: 'GitHub SSH' },
  { type: 'allow', host: '*.github.com', port: 443, protocol: 'tcp', description: 'GitHub subdomains' },
  { type: 'allow', host: 'gitlab.com', port: 443, protocol: 'tcp', description: 'GitLab HTTPS' },
  { type: 'allow', host: 'bitbucket.org', port: 443, protocol: 'tcp', description: 'Bitbucket HTTPS' },
  { type: 'allow', host: 'raw.githubusercontent.com', port: 443, protocol: 'tcp', description: 'GitHub raw content' },

  // AI providers
  { type: 'allow', host: 'api.anthropic.com', port: 443, protocol: 'tcp', description: 'Anthropic API' },
  { type: 'allow', host: 'api.openai.com', port: 443, protocol: 'tcp', description: 'OpenAI API' },

  // CDNs (commonly needed for package downloads)
  { type: 'allow', host: '*.cloudflare.com', port: 443, protocol: 'tcp', description: 'Cloudflare CDN' },
  { type: 'allow', host: '*.fastly.net', port: 443, protocol: 'tcp', description: 'Fastly CDN' },
  { type: 'allow', host: '*.akamaized.net', port: 443, protocol: 'tcp', description: 'Akamai CDN' },
  { type: 'allow', host: '*.jsdelivr.net', port: 443, protocol: 'tcp', description: 'jsDelivr CDN' },
  { type: 'allow', host: '*.unpkg.com', port: 443, protocol: 'tcp', description: 'unpkg CDN' },

  // DNS servers
  { type: 'allow', host: '1.1.1.1', port: 53, protocol: 'any', description: 'Cloudflare DNS' },
  { type: 'allow', host: '8.8.8.8', port: 53, protocol: 'any', description: 'Google DNS' },
  { type: 'allow', host: '8.8.4.4', port: 53, protocol: 'any', description: 'Google DNS secondary' },
];

/**
 * Hosts/IPs that are ALWAYS blocked (security critical)
 */
export const BLOCKED_NETWORK: NetworkRule[] = [
  // Cloud metadata services (can leak credentials)
  { type: 'deny', host: '169.254.169.254', port: 'any' as unknown as number, protocol: 'any', description: 'AWS/GCP/Azure metadata' },
  { type: 'deny', host: 'metadata.google.internal', port: 'any' as unknown as number, protocol: 'any', description: 'GCP metadata' },
  { type: 'deny', host: 'metadata.azure.internal', port: 'any' as unknown as number, protocol: 'any', description: 'Azure metadata' },
  { type: 'deny', host: '100.100.100.200', port: 'any' as unknown as number, protocol: 'any', description: 'Alibaba metadata' },

  // Internal/private networks (prevent lateral movement)
  { type: 'deny', host: '10.0.0.0/8', port: 'any' as unknown as number, protocol: 'any', description: 'Private network 10.x' },
  { type: 'deny', host: '172.16.0.0/12', port: 'any' as unknown as number, protocol: 'any', description: 'Private network 172.16.x' },
  { type: 'deny', host: '192.168.0.0/16', port: 'any' as unknown as number, protocol: 'any', description: 'Private network 192.168.x' },
  { type: 'deny', host: '127.0.0.0/8', port: 'any' as unknown as number, protocol: 'any', description: 'Localhost' },

  // Link-local
  { type: 'deny', host: '169.254.0.0/16', port: 'any' as unknown as number, protocol: 'any', description: 'Link-local' },

  // IPv6 local addresses
  { type: 'deny', host: 'fe80::/10', port: 'any' as unknown as number, protocol: 'any', description: 'IPv6 link-local' },
  { type: 'deny', host: 'fc00::/7', port: 'any' as unknown as number, protocol: 'any', description: 'IPv6 private' },
  { type: 'deny', host: '::1', port: 'any' as unknown as number, protocol: 'any', description: 'IPv6 localhost' },
];

/**
 * Default DNS servers
 */
export const DEFAULT_DNS_SERVERS = ['1.1.1.1', '8.8.8.8'];

// ============================================================================
// Network Configuration Builder
// ============================================================================

/**
 * Options for building network configuration
 */
export interface NetworkOptions {
  /** Network mode */
  mode?: NetworkMode;

  /** Additional allowlist rules */
  additionalAllowlist?: NetworkRule[];

  /** Additional denylist rules */
  additionalDenylist?: NetworkRule[];

  /** Custom DNS servers */
  dnsServers?: string[];

  /** Bandwidth limit in bytes per second */
  bandwidthLimit?: number;
}

/**
 * Create network configuration for a sandbox level
 */
export function createNetworkConfig(
  level: SandboxLevel,
  options: NetworkOptions = {}
): NetworkConfig {
  // Determine default mode based on level
  let defaultMode: NetworkMode;
  switch (level) {
    case 'none':
      defaultMode = 'full';
      break;
    case 'light':
      defaultMode = 'allowlist';
      break;
    case 'medium':
      defaultMode = 'allowlist';
      break;
    case 'full':
      defaultMode = 'none';
      break;
    default:
      defaultMode = 'allowlist';
  }

  const mode = options.mode || defaultMode;

  // Build allowlist
  const allowlist: NetworkRule[] =
    mode === 'allowlist' || mode === 'egress-only'
      ? [...DEFAULT_NETWORK_ALLOWLIST, ...(options.additionalAllowlist || [])]
      : [];

  // Build denylist (always includes security-critical blocks)
  const denylist: NetworkRule[] = [
    ...BLOCKED_NETWORK,
    ...(options.additionalDenylist || []),
  ];

  // DNS configuration
  const dnsServers = options.dnsServers || DEFAULT_DNS_SERVERS;

  return {
    mode,
    allowlist,
    denylist,
    dnsServers,
    filterDns: mode !== 'full',
    bandwidthLimit: options.bandwidthLimit || 0, // 0 = unlimited
  };
}

// ============================================================================
// Network Rule Matching
// ============================================================================

/**
 * Check if a host matches a rule pattern
 * Supports wildcards (e.g., *.github.com) and CIDR notation
 */
export function matchHost(host: string, pattern: string): boolean {
  // Direct match
  if (host === pattern) {
    return true;
  }

  // Wildcard match (e.g., *.github.com)
  if (pattern.startsWith('*.')) {
    const suffix = pattern.slice(1); // Remove *
    return host.endsWith(suffix) || host === pattern.slice(2);
  }

  // CIDR match (basic implementation)
  if (pattern.includes('/')) {
    return matchCIDR(host, pattern);
  }

  return false;
}

/**
 * Basic CIDR matching
 */
function matchCIDR(ip: string, cidr: string): boolean {
  // Simple implementation - only handles common cases
  const [network, bits] = cidr.split('/');
  const prefixBits = parseInt(bits, 10);

  if (isNaN(prefixBits)) {
    return false;
  }

  // IPv4 only for now
  const ipParts = ip.split('.').map(Number);
  const networkParts = network.split('.').map(Number);

  if (ipParts.length !== 4 || networkParts.length !== 4) {
    return false;
  }

  // Convert to 32-bit integers
  const ipInt =
    (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
  const networkInt =
    (networkParts[0] << 24) |
    (networkParts[1] << 16) |
    (networkParts[2] << 8) |
    networkParts[3];

  // Create mask
  const mask = ~((1 << (32 - prefixBits)) - 1);

  return (ipInt & mask) === (networkInt & mask);
}

/**
 * Check if a port matches a rule (supports ranges like '80-443')
 */
export function matchPort(port: number, rulePort: number | string): boolean {
  if (rulePort === 'any') {
    return true;
  }

  if (typeof rulePort === 'number') {
    return port === rulePort;
  }

  // Range match (e.g., '80-443')
  if (typeof rulePort === 'string' && rulePort.includes('-')) {
    const [start, end] = rulePort.split('-').map(Number);
    return port >= start && port <= end;
  }

  return port === Number(rulePort);
}

/**
 * Check if network access is allowed
 */
export function isNetworkAllowed(
  host: string,
  port: number,
  protocol: 'tcp' | 'udp',
  config: NetworkConfig
): { allowed: boolean; reason?: string; matchedRule?: NetworkRule } {
  // Mode: none - all network blocked
  if (config.mode === 'none') {
    return { allowed: false, reason: 'Network access disabled' };
  }

  // Check denylist first (always enforced)
  for (const rule of config.denylist) {
    if (
      matchHost(host, rule.host) &&
      matchPort(port, rule.port) &&
      (rule.protocol === 'any' || rule.protocol === protocol)
    ) {
      return {
        allowed: false,
        reason: rule.description || `Blocked by denylist: ${rule.host}`,
        matchedRule: rule,
      };
    }
  }

  // Mode: full - allow everything not in denylist
  if (config.mode === 'full') {
    return { allowed: true };
  }

  // Mode: allowlist or egress-only - must match allowlist
  for (const rule of config.allowlist) {
    if (
      rule.type === 'allow' &&
      matchHost(host, rule.host) &&
      matchPort(port, rule.port) &&
      (rule.protocol === 'any' || rule.protocol === protocol)
    ) {
      return { allowed: true, matchedRule: rule };
    }
  }

  return {
    allowed: false,
    reason: `Host/port not in allowlist: ${host}:${port}`,
  };
}

// ============================================================================
// Platform-Specific Network Configuration
// ============================================================================

/**
 * Generate iptables rules for Linux
 */
export function generateIptablesRules(config: NetworkConfig): string[] {
  const rules: string[] = [];

  // Flush existing rules
  rules.push('iptables -F OUTPUT');

  if (config.mode === 'none') {
    // Block all outgoing
    rules.push('iptables -A OUTPUT -j DROP');
    return rules;
  }

  // Allow loopback (needed for some operations)
  rules.push('iptables -A OUTPUT -o lo -j ACCEPT');

  // Allow DNS to specified servers
  for (const dns of config.dnsServers) {
    rules.push(`iptables -A OUTPUT -p udp -d ${dns} --dport 53 -j ACCEPT`);
    rules.push(`iptables -A OUTPUT -p tcp -d ${dns} --dport 53 -j ACCEPT`);
  }

  // Apply denylist
  for (const rule of config.denylist) {
    if (rule.host.includes('/')) {
      // CIDR
      rules.push(`iptables -A OUTPUT -d ${rule.host} -j DROP`);
    } else if (!rule.host.includes('*')) {
      // Exact host
      const portArg = rule.port === 'any' ? '' : `--dport ${rule.port}`;
      const protoArg = rule.protocol === 'any' ? '' : `-p ${rule.protocol}`;
      rules.push(`iptables -A OUTPUT ${protoArg} -d ${rule.host} ${portArg} -j DROP`);
    }
  }

  if (config.mode === 'allowlist' || config.mode === 'egress-only') {
    // Allow specified hosts
    for (const rule of config.allowlist) {
      if (rule.type === 'allow' && !rule.host.includes('*')) {
        const portArg = typeof rule.port === 'number' ? `--dport ${rule.port}` : '';
        const protoArg = rule.protocol === 'any' ? '-p tcp' : `-p ${rule.protocol}`;
        rules.push(`iptables -A OUTPUT ${protoArg} -d ${rule.host} ${portArg} -j ACCEPT`);
      }
    }

    // Default drop
    rules.push('iptables -A OUTPUT -j DROP');
  }

  return rules;
}

/**
 * Generate Seatbelt network rules for macOS
 */
export function generateSeatbeltNetworkRules(config: NetworkConfig): string {
  const rules: string[] = [];

  if (config.mode === 'none') {
    rules.push('(deny network*)');
    return rules.join('\n');
  }

  // Default deny network
  rules.push('(deny network*)');

  // Allow DNS
  for (const dns of config.dnsServers) {
    rules.push(`(allow network-outbound (remote udp "${dns}:53"))`);
    rules.push(`(allow network-outbound (remote tcp "${dns}:53"))`);
  }

  if (config.mode === 'full') {
    rules.push('(allow network-outbound)');
  } else {
    // Allow specific hosts
    for (const rule of config.allowlist) {
      if (rule.type === 'allow') {
        const host = rule.host.replace('*.', '');
        const port = typeof rule.port === 'number' ? rule.port : '*';
        const proto = rule.protocol === 'any' ? 'tcp' : rule.protocol;
        rules.push(`(allow network-outbound (remote ${proto} "*${host}:${port}"))`);
      }
    }
  }

  return rules.join('\n');
}

/**
 * Generate nsjail network arguments
 */
export function generateNsjailNetworkArgs(config: NetworkConfig): string[] {
  const args: string[] = [];

  if (config.mode === 'none') {
    args.push('--disable_clone_newnet');
    // Network namespace with no connectivity
    return args;
  }

  // Create network namespace
  args.push('--clone_newnet');

  // Note: actual network filtering would need iptables setup in the namespace
  // which requires additional configuration

  return args;
}
