/**
 * X2000 Sandbox Execution System
 *
 * A multi-tier sandbox architecture for secure code execution.
 * Implements 4 isolation levels:
 *
 * - Level 0 (NONE): Direct execution with basic security checks
 * - Level 1 (LIGHT): seccomp-bpf (Linux) / sandbox-exec (macOS)
 * - Level 2 (MEDIUM): gVisor / namespace isolation
 * - Level 3 (FULL): Firecracker microVM / hardware isolation
 *
 * @module sandbox
 */

// ============================================================================
// Types
// ============================================================================

export {
  // Types
  type SandboxLevel,
  SandboxErrorType,

  // Core types
  type SandboxLevelConfig,
  type ResourceLimits,
  type FilesystemMount,
  type FilesystemConfig,
  type NetworkMode,
  type NetworkRule,
  type NetworkConfig,
  type SecurityPolicy,
  type SandboxConfig,
  type SandboxExecOptions,
  type ResourceUsage,
  type SandboxResult,
  type SandboxStatus,
  type SandboxInstance,
  type Platform,
  type TechnologyAvailability,
  type PlatformCapabilities,
  type ActionContext,
  type SandboxAuditEntry,
  type SecurityEvent,

  // Classes
  SandboxError,

  // Constants
  SandboxLevelEnum,
  SANDBOX_LEVELS,
  DEFAULT_RESOURCE_LIMITS,
  TRUST_TO_SANDBOX_LEVEL,
} from './types.js';

// ============================================================================
// Manager
// ============================================================================

export {
  SandboxManager,
  sandboxManager,
  sandboxExec,
  type SandboxManagerOptions,
  type CreateSandboxOptions,
} from './manager.js';

// ============================================================================
// Filesystem
// ============================================================================

export {
  // Configuration
  createFilesystemConfig,
  type FilesystemOptions,

  // Path utilities
  expandPath,
  isBlockedPath,
  validatePath,

  // Workspace management
  createTempWorkspace,
  cleanupTempWorkspace,

  // Platform-specific generation
  generateNsjailMounts,
  generateSeatbeltFilesystemRules,
  generateGVisorFilesystemConfig,

  // Constants
  BLOCKED_PATHS,
  BLOCKED_PATH_PATTERNS,
  DEFAULT_READONLY_PATHS,
} from './filesystem.js';

// ============================================================================
// Network
// ============================================================================

export {
  // Configuration
  createNetworkConfig,
  type NetworkOptions,

  // Network matching
  matchHost,
  matchPort,
  isNetworkAllowed,

  // Platform-specific generation
  generateIptablesRules,
  generateSeatbeltNetworkRules,
  generateNsjailNetworkArgs,

  // Constants
  DEFAULT_NETWORK_ALLOWLIST,
  BLOCKED_NETWORK,
  DEFAULT_DNS_SERVERS,
} from './network.js';

// ============================================================================
// Resources
// ============================================================================

export {
  // Configuration
  createResourceLimits,
  type ResourceLimitOptions,

  // Utilities
  parseSize,
  formatSize,
  parseBandwidth,
  validateResourceLimits,

  // Resource usage
  createEmptyResourceUsage,
  parseProcessResourceUsage,
  checkResourceLimits,
  formatResourceUsage,

  // Platform-specific generation
  generateCgroupsConfig,
  generateNsjailResourceArgs,
  generateMacOSLimits,
  generateGVisorResourceConfig,
} from './resources.js';

// ============================================================================
// Level Implementations
// ============================================================================

// Level 0: None
export {
  createNoneSandbox,
  execNone,
  validateCommand,
  validateEnv,
  validateCwd,
} from './levels/none.js';

// Level 1: Light
export {
  createLightSandbox,
  execLight,
  getPlatform,
  isSeatbeltAvailable,
  isNsjailAvailable,
  isBubblewrapAvailable,
  isLightSandboxAvailable,
  generateSeatbeltProfile,
  generateNsjailArgs,
  generateBwrapArgs,
} from './levels/light.js';

// Level 2: Medium
export {
  createMediumSandbox,
  execMedium,
  isGVisorAvailable,
  isDockerAvailable,
  isLimaAvailable,
  isMediumSandboxAvailable,
  generateGVisorOCIConfig,
  generateDockerArgs,
} from './levels/medium.js';

// Level 3: Full
export {
  createFullSandbox,
  execFull,
  isFirecrackerAvailable,
  isTartAvailable,
  isWasmAvailable,
  isFullSandboxAvailable,
  generateFirecrackerConfig,
  generateSecureDockerArgs,
  generateWasmArgs,
} from './levels/full.js';

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default sandbox manager for convenient access
 */
export { sandboxManager as default } from './manager.js';
