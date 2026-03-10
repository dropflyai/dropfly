/**
 * X2000 Documentation System - Version Management
 * Multi-version doc support, version switching, archive management
 */

import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join, relative, dirname, basename } from 'path';
import { v4 as uuidv4 } from 'uuid';
import type {
  DocVersion,
  VersionConfig,
  VersionDiff,
  DiffItem,
  APIReference,
  TypeDefinition,
  TypeKind,
} from './types.js';

// ============================================================================
// Constants
// ============================================================================

const VERSION_MANIFEST_FILE = 'versions.json';
const ARCHIVED_DOCS_DIR = 'versioned_docs';

// ============================================================================
// Version Manager
// ============================================================================

export class VersionManager {
  private config: VersionConfig;
  private rootDir: string;

  constructor(rootDir: string, config?: Partial<VersionConfig>) {
    this.rootDir = rootDir;
    this.config = {
      current: config?.current || this.createDefaultVersion('current', true, false),
      stable: config?.stable || this.createDefaultVersion('stable', false, true),
      versions: config?.versions || [],
      maxVersions: config?.maxVersions || 5,
      archiveOld: config?.archiveOld ?? true,
    };

    this.loadVersionManifest();
  }

  /**
   * Create a default version object
   */
  private createDefaultVersion(
    version: string,
    isLatest: boolean,
    isStable: boolean
  ): DocVersion {
    return {
      version,
      label: version,
      path: isLatest ? '/docs' : `/docs/${version}`,
      isLatest,
      isStable,
      isPrerelease: false,
      isDeprecated: false,
    };
  }

  /**
   * Load the version manifest from disk
   */
  private loadVersionManifest(): void {
    const manifestPath = join(this.rootDir, VERSION_MANIFEST_FILE);

    if (existsSync(manifestPath)) {
      try {
        const content = readFileSync(manifestPath, 'utf-8');
        const manifest = JSON.parse(content) as VersionConfig;

        this.config.current = manifest.current || this.config.current;
        this.config.stable = manifest.stable || this.config.stable;
        this.config.versions = manifest.versions || [];
        this.config.maxVersions = manifest.maxVersions || this.config.maxVersions;
        this.config.archiveOld = manifest.archiveOld ?? this.config.archiveOld;

        // Parse dates
        for (const version of this.config.versions) {
          if (version.releasedAt) {
            version.releasedAt = new Date(version.releasedAt);
          }
          if (version.supportedUntil) {
            version.supportedUntil = new Date(version.supportedUntil);
          }
        }
      } catch (error) {
        console.warn('[VersionManager] Failed to load version manifest:', error);
      }
    }
  }

  /**
   * Save the version manifest to disk
   */
  private saveVersionManifest(): void {
    const manifestPath = join(this.rootDir, VERSION_MANIFEST_FILE);

    const manifest = {
      current: this.config.current,
      stable: this.config.stable,
      versions: this.config.versions,
      maxVersions: this.config.maxVersions,
      archiveOld: this.config.archiveOld,
    };

    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  }

  /**
   * Get the current version
   */
  getCurrentVersion(): DocVersion {
    return this.config.current;
  }

  /**
   * Get the stable version
   */
  getStableVersion(): DocVersion {
    return this.config.stable;
  }

  /**
   * Get all versions
   */
  getAllVersions(): DocVersion[] {
    return [
      this.config.current,
      ...this.config.versions.filter(v => v.version !== this.config.current.version),
    ];
  }

  /**
   * Get a version by version string
   */
  getVersion(version: string): DocVersion | undefined {
    if (version === this.config.current.version) {
      return this.config.current;
    }
    return this.config.versions.find(v => v.version === version);
  }

  /**
   * Create a new version from current docs
   */
  async createVersion(
    version: string,
    options?: {
      label?: string;
      isStable?: boolean;
      isPrerelease?: boolean;
      changelog?: string;
      migrationGuide?: string;
      supportedUntil?: Date;
    }
  ): Promise<DocVersion> {
    // Check if version already exists
    if (this.getVersion(version)) {
      throw new Error(`Version ${version} already exists`);
    }

    const newVersion: DocVersion = {
      version,
      label: options?.label || `v${version}`,
      path: `/docs/v${version}`,
      isLatest: false,
      isStable: options?.isStable ?? false,
      isPrerelease: options?.isPrerelease ?? false,
      isDeprecated: false,
      releasedAt: new Date(),
      supportedUntil: options?.supportedUntil,
      changelog: options?.changelog,
      migrationGuide: options?.migrationGuide,
    };

    // Create versioned docs directory
    const versionedDocsDir = join(this.rootDir, ARCHIVED_DOCS_DIR, `v${version}`);

    if (!existsSync(versionedDocsDir)) {
      mkdirSync(versionedDocsDir, { recursive: true });
    }

    // Copy current docs to versioned directory
    const currentDocsDir = join(this.rootDir, 'docs');
    if (existsSync(currentDocsDir)) {
      this.copyDirectory(currentDocsDir, versionedDocsDir);
    }

    // Update versions list
    this.config.versions.unshift(newVersion);

    // If marked as stable, update stable version
    if (options?.isStable) {
      // Demote previous stable
      if (this.config.stable.version !== 'stable') {
        const prevStable = this.config.versions.find(
          v => v.version === this.config.stable.version
        );
        if (prevStable) {
          prevStable.isStable = false;
        }
      }
      this.config.stable = newVersion;
    }

    // Archive old versions if needed
    if (this.config.archiveOld) {
      await this.archiveOldVersions();
    }

    // Save manifest
    this.saveVersionManifest();

    return newVersion;
  }

  /**
   * Update a version's metadata
   */
  updateVersion(
    version: string,
    updates: Partial<Omit<DocVersion, 'version' | 'path'>>
  ): DocVersion | undefined {
    const docVersion = this.getVersion(version);

    if (!docVersion) {
      return undefined;
    }

    // Apply updates
    Object.assign(docVersion, updates);

    // Save manifest
    this.saveVersionManifest();

    return docVersion;
  }

  /**
   * Deprecate a version
   */
  deprecateVersion(version: string, message?: string): boolean {
    const docVersion = this.getVersion(version);

    if (!docVersion) {
      return false;
    }

    docVersion.isDeprecated = true;
    docVersion.deprecationMessage = message || `Version ${version} is deprecated. Please upgrade to ${this.config.stable.version}.`;

    this.saveVersionManifest();
    return true;
  }

  /**
   * Archive old versions beyond maxVersions
   */
  private async archiveOldVersions(): Promise<void> {
    const activeVersions = this.config.versions.filter(v => !v.isDeprecated);

    if (activeVersions.length <= this.config.maxVersions) {
      return;
    }

    // Sort by release date, oldest first
    const sortedVersions = [...activeVersions].sort((a, b) => {
      const dateA = a.releasedAt?.getTime() || 0;
      const dateB = b.releasedAt?.getTime() || 0;
      return dateA - dateB;
    });

    // Deprecate oldest versions
    const toDeprecate = sortedVersions.slice(0, sortedVersions.length - this.config.maxVersions);

    for (const version of toDeprecate) {
      if (!version.isStable) {
        this.deprecateVersion(version.version);
      }
    }
  }

  /**
   * Copy a directory recursively
   */
  private copyDirectory(src: string, dest: string): void {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }

    const entries = readdirSync(src);

    for (const entry of entries) {
      const srcPath = join(src, entry);
      const destPath = join(dest, entry);
      const stat = statSync(srcPath);

      if (stat.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Get the path for a versioned document
   */
  getVersionedPath(docPath: string, version: string): string {
    const docVersion = this.getVersion(version);

    if (!docVersion) {
      return docPath;
    }

    // Current version uses the base path
    if (docVersion.isLatest) {
      return docPath;
    }

    // Archived versions use versioned_docs directory
    return docPath.replace('/docs', docVersion.path);
  }

  /**
   * Get version-specific banner message
   */
  getVersionBanner(version: string): { type: string; message: string; link?: string } | null {
    const docVersion = this.getVersion(version);

    if (!docVersion) {
      return null;
    }

    if (docVersion.isDeprecated) {
      return {
        type: 'warning',
        message: docVersion.deprecationMessage || 'This version is deprecated.',
        link: docVersion.migrationGuide,
      };
    }

    if (docVersion.isPrerelease) {
      return {
        type: 'info',
        message: 'This is a prerelease version. APIs may change.',
      };
    }

    if (!docVersion.isLatest && !docVersion.isStable) {
      return {
        type: 'info',
        message: `You're viewing docs for v${version}. View the latest version.`,
        link: '/docs',
      };
    }

    return null;
  }

  /**
   * Parse a semantic version string
   */
  parseVersion(version: string): { major: number; minor: number; patch: number; prerelease?: string } {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);

    if (!match) {
      return { major: 0, minor: 0, patch: 0 };
    }

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4],
    };
  }

  /**
   * Compare two versions
   * Returns: -1 if a < b, 0 if a == b, 1 if a > b
   */
  compareVersions(a: string, b: string): number {
    const vA = this.parseVersion(a);
    const vB = this.parseVersion(b);

    if (vA.major !== vB.major) return vA.major - vB.major;
    if (vA.minor !== vB.minor) return vA.minor - vB.minor;
    if (vA.patch !== vB.patch) return vA.patch - vB.patch;

    // Prerelease versions are lower than release
    if (vA.prerelease && !vB.prerelease) return -1;
    if (!vA.prerelease && vB.prerelease) return 1;
    if (vA.prerelease && vB.prerelease) {
      return vA.prerelease.localeCompare(vB.prerelease);
    }

    return 0;
  }

  /**
   * Get version configuration
   */
  getConfig(): VersionConfig {
    return { ...this.config };
  }
}

// ============================================================================
// Version Diff Generator
// ============================================================================

export class VersionDiffGenerator {
  /**
   * Generate a diff between two API versions
   */
  generateDiff(
    fromRefs: APIReference[],
    toRefs: APIReference[],
    fromVersion: string,
    toVersion: string
  ): VersionDiff {
    const fromTypes = this.flattenTypes(fromRefs);
    const toTypes = this.flattenTypes(toRefs);

    const added: DiffItem[] = [];
    const removed: DiffItem[] = [];
    const modified: DiffItem[] = [];
    const deprecated: DiffItem[] = [];

    // Find added types
    for (const [name, type] of toTypes) {
      if (!fromTypes.has(name)) {
        added.push(this.createDiffItem(type, false));
      }
    }

    // Find removed and modified types
    for (const [name, fromType] of fromTypes) {
      const toType = toTypes.get(name);

      if (!toType) {
        removed.push(this.createDiffItem(fromType, true));
      } else if (this.hasBreakingChanges(fromType, toType)) {
        modified.push(this.createDiffItem(toType, true));
      } else if (this.hasChanges(fromType, toType)) {
        modified.push(this.createDiffItem(toType, false));
      }

      // Check for newly deprecated
      if (toType && !fromType.deprecated && toType.deprecated) {
        deprecated.push(this.createDiffItem(toType, false));
      }
    }

    return {
      fromVersion,
      toVersion,
      added,
      removed,
      modified,
      deprecated,
    };
  }

  /**
   * Flatten all types from API references into a map
   */
  private flattenTypes(refs: APIReference[]): Map<string, TypeDefinition> {
    const types = new Map<string, TypeDefinition>();

    for (const ref of refs) {
      for (const type of ref.types) {
        types.set(`${ref.module}:${type.name}`, type);
      }
    }

    return types;
  }

  /**
   * Create a diff item from a type definition
   */
  private createDiffItem(type: TypeDefinition, breaking: boolean): DiffItem {
    return {
      type: type.kind,
      name: type.name,
      path: `/api/${type.sourceFile.replace('.ts', '')}/${type.name}`.toLowerCase(),
      description: type.description,
      breaking,
    };
  }

  /**
   * Check if a type has breaking changes
   */
  private hasBreakingChanges(from: TypeDefinition, to: TypeDefinition): boolean {
    // Check for signature changes in classes/interfaces
    if (from.signature !== to.signature) {
      // More detailed analysis would be needed here
      // For now, consider any signature change as potentially breaking
      return this.isSignatureBreaking(from.signature, to.signature);
    }

    // Check for removed methods
    if (from.methods && to.methods) {
      const toMethodNames = new Set(to.methods.map(m => m.name));
      for (const method of from.methods) {
        if (!toMethodNames.has(method.name)) {
          return true; // Removed method is breaking
        }
      }
    }

    // Check for removed properties
    if (from.properties && to.properties) {
      const toPropNames = new Set(to.properties.map(p => p.name));
      for (const prop of from.properties) {
        if (!prop.optional && !toPropNames.has(prop.name)) {
          return true; // Removed required property is breaking
        }
      }
    }

    return false;
  }

  /**
   * Check if a signature change is breaking
   */
  private isSignatureBreaking(from: string, to: string): boolean {
    // Simple heuristic: if the 'to' signature is longer, it might have new required params
    // This is a simplified check - real implementation would parse the signatures
    return from !== to;
  }

  /**
   * Check if a type has any changes
   */
  private hasChanges(from: TypeDefinition, to: TypeDefinition): boolean {
    return from.signature !== to.signature ||
           from.description !== to.description ||
           JSON.stringify(from.methods) !== JSON.stringify(to.methods) ||
           JSON.stringify(from.properties) !== JSON.stringify(to.properties);
  }

  /**
   * Generate a changelog from a version diff
   */
  generateChangelog(diff: VersionDiff): string {
    const lines: string[] = [];

    lines.push(`# Changelog: ${diff.fromVersion} -> ${diff.toVersion}`);
    lines.push('');

    if (diff.added.length > 0) {
      lines.push('## Added');
      lines.push('');
      for (const item of diff.added) {
        lines.push(`- **${item.name}** (${item.type})${item.description ? ` - ${item.description}` : ''}`);
      }
      lines.push('');
    }

    if (diff.removed.length > 0) {
      lines.push('## Removed');
      lines.push('');
      for (const item of diff.removed) {
        lines.push(`- ~~${item.name}~~ (${item.type})${item.breaking ? ' **BREAKING**' : ''}`);
      }
      lines.push('');
    }

    if (diff.modified.length > 0) {
      lines.push('## Changed');
      lines.push('');
      for (const item of diff.modified) {
        lines.push(`- **${item.name}** (${item.type})${item.breaking ? ' **BREAKING**' : ''}`);
      }
      lines.push('');
    }

    if (diff.deprecated.length > 0) {
      lines.push('## Deprecated');
      lines.push('');
      for (const item of diff.deprecated) {
        lines.push(`- **${item.name}** (${item.type})${item.description ? ` - ${item.description}` : ''}`);
      }
      lines.push('');
    }

    // Summary
    const breakingCount = [...diff.removed, ...diff.modified].filter(i => i.breaking).length;
    lines.push('## Summary');
    lines.push('');
    lines.push(`- ${diff.added.length} additions`);
    lines.push(`- ${diff.removed.length} removals`);
    lines.push(`- ${diff.modified.length} modifications`);
    lines.push(`- ${diff.deprecated.length} deprecations`);
    if (breakingCount > 0) {
      lines.push(`- **${breakingCount} breaking changes**`);
    }

    return lines.join('\n');
  }

  /**
   * Generate a migration guide from a version diff
   */
  generateMigrationGuide(diff: VersionDiff): string {
    const lines: string[] = [];
    const breakingChanges = [
      ...diff.removed.filter(i => i.breaking),
      ...diff.modified.filter(i => i.breaking),
    ];

    lines.push(`# Migration Guide: ${diff.fromVersion} to ${diff.toVersion}`);
    lines.push('');

    if (breakingChanges.length === 0) {
      lines.push('This release contains no breaking changes. You can upgrade without modifications.');
      return lines.join('\n');
    }

    lines.push('## Breaking Changes');
    lines.push('');
    lines.push('The following changes require updates to your code:');
    lines.push('');

    for (const item of breakingChanges) {
      lines.push(`### ${item.name}`);
      lines.push('');
      lines.push(`**Type:** ${item.type}`);
      if (item.description) {
        lines.push(`**Description:** ${item.description}`);
      }
      lines.push('');
      lines.push('**Migration steps:**');
      lines.push('');

      if (diff.removed.includes(item)) {
        lines.push(`1. Remove usage of \`${item.name}\``);
        lines.push('2. Check for alternative APIs in the documentation');
      } else {
        lines.push(`1. Review the new signature for \`${item.name}\``);
        lines.push('2. Update your code to match the new API');
        lines.push('3. Run your tests to verify the changes');
      }
      lines.push('');
    }

    lines.push('## Deprecated APIs');
    lines.push('');
    if (diff.deprecated.length === 0) {
      lines.push('No APIs were deprecated in this release.');
    } else {
      lines.push('The following APIs are deprecated and will be removed in a future release:');
      lines.push('');
      for (const item of diff.deprecated) {
        lines.push(`- \`${item.name}\`${item.description ? `: ${item.description}` : ''}`);
      }
    }

    return lines.join('\n');
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let versionManagerInstance: VersionManager | null = null;

/**
 * Get or create the version manager
 */
export function getVersionManager(rootDir?: string): VersionManager {
  if (!versionManagerInstance && rootDir) {
    versionManagerInstance = new VersionManager(rootDir);
  } else if (!versionManagerInstance) {
    versionManagerInstance = new VersionManager(process.cwd());
  }
  return versionManagerInstance;
}

export const versionDiffGenerator = new VersionDiffGenerator();

/**
 * Create a new documentation version
 */
export async function createDocVersion(
  version: string,
  rootDir: string,
  options?: {
    label?: string;
    isStable?: boolean;
    isPrerelease?: boolean;
    changelog?: string;
  }
): Promise<DocVersion> {
  const manager = new VersionManager(rootDir);
  return manager.createVersion(version, options);
}

/**
 * Generate a version diff
 */
export function generateVersionDiff(
  fromRefs: APIReference[],
  toRefs: APIReference[],
  fromVersion: string,
  toVersion: string
): VersionDiff {
  return versionDiffGenerator.generateDiff(fromRefs, toRefs, fromVersion, toVersion);
}
