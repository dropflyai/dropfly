/**
 * X2000 Documentation System - Doc Generator
 * Generates MDX files from extracted types
 * Creates API reference pages and navigation structure
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative, dirname, basename, extname } from 'path';
import { TypeDocExtractor, extractTypes } from './extractor.js';
import type {
  DocPage,
  DocSection,
  DocFrontmatter,
  TableOfContentsItem,
  NavLink,
  CodeBlock,
  Example,
  APIReference,
  TypeDefinition,
  MethodDef,
  PropertyDef,
  GenerationResult,
  GeneratedPage,
  GenerationError,
  GenerationWarning,
  GenerationStats,
  DocConfig,
  SidebarItem,
} from './types.js';

// ============================================================================
// Constants
// ============================================================================

const MDX_FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---/;
const HEADING_PATTERN = /^(#{1,6})\s+(.+)$/gm;
const CODE_BLOCK_PATTERN = /```(\w+)?(?:\s+title="([^"]+)")?(?:\s+filename="([^"]+)")?\n([\s\S]*?)```/g;

// ============================================================================
// Doc Generator Class
// ============================================================================

export class DocGenerator {
  private config: DocConfig;
  private extractedTypes: APIReference[] = [];
  private pages: Map<string, DocPage> = new Map();
  private errors: GenerationError[] = [];
  private warnings: GenerationWarning[] = [];

  constructor(config: DocConfig) {
    this.config = config;
  }

  /**
   * Generate all documentation
   */
  async generate(): Promise<GenerationResult> {
    const startTime = Date.now();
    const timing = {
      extraction: 0,
      generation: 0,
      indexing: 0,
      total: 0,
    };

    // Stage 1: Extract types from source
    const extractionStart = Date.now();
    if (this.config.api.enabled) {
      await this.extractTypes();
    }
    timing.extraction = Date.now() - extractionStart;

    // Stage 2: Generate documentation
    const generationStart = Date.now();
    const generatedPages = await this.generateAll();
    timing.generation = Date.now() - generationStart;

    // Stage 3: Build navigation
    await this.buildNavigation();

    timing.total = Date.now() - startTime;

    return {
      success: this.errors.filter(e => e.severity === 'fatal').length === 0,
      pages: generatedPages,
      apiReference: this.extractedTypes,
      searchIndex: {
        id: `index-${Date.now()}`,
        version: this.config.versioning.current,
        createdAt: new Date(),
        updatedAt: new Date(),
        chunks: [],
        totalChunks: 0,
        totalPages: generatedPages.length,
        categories: [],
        tags: [],
      },
      errors: this.errors,
      warnings: this.warnings,
      timing,
      stats: this.calculateStats(generatedPages),
    };
  }

  /**
   * Extract types from source directories
   */
  private async extractTypes(): Promise<void> {
    for (const sourceDir of this.config.sourceDirectories) {
      if (existsSync(sourceDir)) {
        const extractor = new TypeDocExtractor({
          sourceDir,
          excludePatterns: this.config.api.exclude,
          excludePrivate: this.config.api.excludePrivate,
          excludeProtected: this.config.api.excludeProtected,
          excludeInternal: this.config.api.excludeInternal,
        });

        const references = await extractor.extractAll();
        this.extractedTypes.push(...references);
      } else {
        this.warnings.push({
          code: 'SOURCE_NOT_FOUND',
          message: `Source directory not found: ${sourceDir}`,
          file: sourceDir,
        });
      }
    }
  }

  /**
   * Generate all documentation pages
   */
  private async generateAll(): Promise<GeneratedPage[]> {
    const pages: GeneratedPage[] = [];

    // Generate from MDX files
    if (existsSync(this.config.docsDirectory)) {
      const mdxPages = await this.generateFromMdx(this.config.docsDirectory);
      pages.push(...mdxPages);
    }

    // Generate API reference pages
    if (this.config.api.enabled && this.extractedTypes.length > 0) {
      const apiPages = await this.generateApiReference();
      pages.push(...apiPages);
    }

    // Write pages to output directory
    await this.writePages(pages);

    return pages;
  }

  /**
   * Generate documentation from MDX files
   */
  private async generateFromMdx(docsDir: string, prefix = ''): Promise<GeneratedPage[]> {
    const pages: GeneratedPage[] = [];
    const entries = readdirSync(docsDir);

    for (const entry of entries) {
      const fullPath = join(docsDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        const subPages = await this.generateFromMdx(fullPath, join(prefix, entry));
        pages.push(...subPages);
      } else if (entry.endsWith('.mdx') || entry.endsWith('.md')) {
        try {
          const page = await this.parseMdxFile(fullPath, prefix);
          pages.push(page);
        } catch (error) {
          this.errors.push({
            code: 'MDX_PARSE_ERROR',
            message: `Failed to parse MDX file: ${error}`,
            file: fullPath,
            severity: 'error',
          });
        }
      }
    }

    return pages;
  }

  /**
   * Parse an MDX file into a generated page
   */
  private async parseMdxFile(filePath: string, prefix: string): Promise<GeneratedPage> {
    const content = readFileSync(filePath, 'utf-8');
    const fileName = basename(filePath, extname(filePath));
    const slug = fileName === 'index' ? prefix || '/' : join(prefix, fileName);

    // Extract frontmatter
    const frontmatter = this.extractFrontmatter(content);

    // Remove frontmatter from content
    const bodyContent = content.replace(MDX_FRONTMATTER_PATTERN, '').trim();

    return {
      path: `/${slug}`.replace(/\/+/g, '/'),
      slug,
      content: bodyContent,
      frontmatter,
      sourceFile: filePath,
    };
  }

  /**
   * Extract frontmatter from MDX content
   */
  private extractFrontmatter(content: string): DocFrontmatter {
    const match = content.match(MDX_FRONTMATTER_PATTERN);
    if (!match) {
      return { title: 'Untitled', description: '' };
    }

    const frontmatter: DocFrontmatter = { title: 'Untitled', description: '' };
    const yaml = match[1];
    const lines = yaml.split('\n');

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        switch (key) {
          case 'title':
            frontmatter.title = value;
            break;
          case 'description':
            frontmatter.description = value;
            break;
          case 'version':
            frontmatter.version = value;
            break;
          case 'lastUpdated':
            frontmatter.lastUpdated = value;
            break;
          case 'author':
            frontmatter.author = value;
            break;
          case 'category':
            frontmatter.category = value;
            break;
          case 'order':
            frontmatter.order = parseInt(value, 10);
            break;
          case 'draft':
            frontmatter.draft = value === 'true';
            break;
          case 'deprecated':
            frontmatter.deprecated = value === 'true';
            break;
          case 'deprecationMessage':
            frontmatter.deprecationMessage = value;
            break;
          case 'tags':
            // Parse array
            if (value.startsWith('[')) {
              frontmatter.tags = value
                .slice(1, -1)
                .split(',')
                .map(s => s.trim().replace(/['"]/g, ''));
            }
            break;
        }
      }
    }

    return frontmatter;
  }

  /**
   * Generate API reference documentation
   */
  private async generateApiReference(): Promise<GeneratedPage[]> {
    const pages: GeneratedPage[] = [];

    // Generate index page
    pages.push(this.generateApiIndexPage());

    // Generate page for each module
    for (const ref of this.extractedTypes) {
      pages.push(this.generateModulePage(ref));

      // Generate pages for classes
      for (const typeDef of ref.classes) {
        pages.push(this.generateTypePage(typeDef, ref.module, 'class'));
      }

      // Generate pages for interfaces
      for (const typeDef of ref.interfaces) {
        pages.push(this.generateTypePage(typeDef, ref.module, 'interface'));
      }
    }

    return pages;
  }

  /**
   * Generate API index page
   */
  private generateApiIndexPage(): GeneratedPage {
    const categories = this.categorizeTypes();

    let content = '# API Reference\n\n';
    content += 'Complete API documentation for X2000, auto-generated from TypeScript source.\n\n';

    for (const [category, types] of Object.entries(categories)) {
      content += `## ${category}\n\n`;

      for (const type of types) {
        const path = `/api/${type.module}/${type.name}`.toLowerCase();
        content += `- [${type.name}](${path}) - ${type.description || type.kind}\n`;
      }

      content += '\n';
    }

    return {
      path: '/api',
      slug: 'api',
      content,
      frontmatter: {
        title: 'API Reference',
        description: 'Complete API documentation for X2000',
        category: 'API',
      },
    };
  }

  /**
   * Generate a module page
   */
  private generateModulePage(ref: APIReference): GeneratedPage {
    let content = `# ${ref.name}\n\n`;

    if (ref.description) {
      content += `${ref.description}\n\n`;
    }

    content += `**Source:** \`${ref.sourceFile}\`\n\n`;

    // Exports
    if (ref.exports.length > 0) {
      content += '## Exports\n\n';
      for (const exp of ref.exports) {
        content += `- \`${exp}\`\n`;
      }
      content += '\n';
    }

    // Classes
    if (ref.classes.length > 0) {
      content += '## Classes\n\n';
      for (const cls of ref.classes) {
        const path = `/api/${ref.module}/${cls.name}`.toLowerCase();
        content += `### [${cls.name}](${path})\n\n`;
        if (cls.description) {
          content += `${cls.description}\n\n`;
        }
        content += `\`\`\`typescript\n${cls.signature}\n\`\`\`\n\n`;
      }
    }

    // Interfaces
    if (ref.interfaces.length > 0) {
      content += '## Interfaces\n\n';
      for (const iface of ref.interfaces) {
        const path = `/api/${ref.module}/${iface.name}`.toLowerCase();
        content += `### [${iface.name}](${path})\n\n`;
        if (iface.description) {
          content += `${iface.description}\n\n`;
        }
        content += `\`\`\`typescript\n${iface.signature}\n\`\`\`\n\n`;
      }
    }

    // Types
    const types = ref.types.filter(t => t.kind === 'type');
    if (types.length > 0) {
      content += '## Types\n\n';
      for (const type of types) {
        content += `### ${type.name}\n\n`;
        if (type.description) {
          content += `${type.description}\n\n`;
        }
        content += `\`\`\`typescript\n${type.signature}\n\`\`\`\n\n`;
      }
    }

    // Enums
    if (ref.enums.length > 0) {
      content += '## Enums\n\n';
      for (const enumDef of ref.enums) {
        content += `### ${enumDef.name}\n\n`;
        if (enumDef.description) {
          content += `${enumDef.description}\n\n`;
        }
        content += `\`\`\`typescript\n${enumDef.signature}\n\`\`\`\n\n`;
        if (enumDef.members) {
          content += '| Member | Value |\n|--------|-------|\n';
          for (const member of enumDef.members) {
            content += `| \`${member.name}\` | \`${member.value}\` |\n`;
          }
          content += '\n';
        }
      }
    }

    // Functions
    if (ref.functions.length > 0) {
      content += '## Functions\n\n';
      for (const fn of ref.functions) {
        content += `### ${fn.name}\n\n`;
        if (fn.description) {
          content += `${fn.description}\n\n`;
        }
        content += `\`\`\`typescript\n${fn.signature}\n\`\`\`\n\n`;

        if (fn.methods && fn.methods[0]) {
          const method = fn.methods[0];
          if (method.parameters.length > 0) {
            content += '**Parameters:**\n\n';
            for (const param of method.parameters) {
              content += `- \`${param.name}\` (${param.type})${param.optional ? ' - optional' : ''}`;
              if (param.description) {
                content += ` - ${param.description}`;
              }
              content += '\n';
            }
            content += '\n';
          }

          content += `**Returns:** \`${method.returnType}\`\n\n`;

          if (method.throws && method.throws.length > 0) {
            content += '**Throws:**\n\n';
            for (const thrown of method.throws) {
              content += `- \`${thrown.type}\` - ${thrown.description}\n`;
            }
            content += '\n';
          }
        }

        if (fn.examples && fn.examples.length > 0) {
          content += '**Example:**\n\n';
          content += `\`\`\`typescript\n${fn.examples[0]}\n\`\`\`\n\n`;
        }
      }
    }

    // Constants
    if (ref.constants.length > 0) {
      content += '## Constants\n\n';
      for (const constant of ref.constants) {
        content += `### ${constant.name}\n\n`;
        if (constant.description) {
          content += `${constant.description}\n\n`;
        }
        content += `\`\`\`typescript\n${constant.signature}\n\`\`\`\n\n`;
      }
    }

    return {
      path: `/api/${ref.module}`.toLowerCase(),
      slug: `api/${ref.module}`.toLowerCase(),
      content,
      frontmatter: {
        title: ref.name,
        description: ref.description || `API documentation for ${ref.name}`,
        category: 'API',
      },
      sourceFile: ref.sourceFile,
    };
  }

  /**
   * Generate a page for a type (class or interface)
   */
  private generateTypePage(typeDef: TypeDefinition, module: string, kind: string): GeneratedPage {
    let content = `# ${typeDef.name}\n\n`;

    if (typeDef.deprecated) {
      content += `> **Deprecated:** ${typeDef.deprecationMessage || 'This type is deprecated.'}\n\n`;
    }

    if (typeDef.description) {
      content += `${typeDef.description}\n\n`;
    }

    content += `**Source:** \`${typeDef.sourceFile}:${typeDef.sourceLine}\`\n\n`;

    if (typeDef.since) {
      content += `**Since:** ${typeDef.since}\n\n`;
    }

    // Signature
    content += '## Signature\n\n';
    content += `\`\`\`typescript\n${typeDef.signature}\n\`\`\`\n\n`;

    // Type parameters
    if (typeDef.typeParameters && typeDef.typeParameters.length > 0) {
      content += '## Type Parameters\n\n';
      content += '| Name | Constraint | Default | Description |\n';
      content += '|------|------------|---------|-------------|\n';
      for (const param of typeDef.typeParameters) {
        content += `| \`${param.name}\` | ${param.constraint || '-'} | ${param.default || '-'} | ${param.description || '-'} |\n`;
      }
      content += '\n';
    }

    // Inheritance
    if (typeDef.extends && typeDef.extends.length > 0) {
      content += `**Extends:** ${typeDef.extends.map(e => `\`${e}\``).join(', ')}\n\n`;
    }

    if (typeDef.implements && typeDef.implements.length > 0) {
      content += `**Implements:** ${typeDef.implements.map(i => `\`${i}\``).join(', ')}\n\n`;
    }

    // Constructors
    if (typeDef.constructors && typeDef.constructors.length > 0) {
      content += '## Constructor\n\n';
      for (const ctor of typeDef.constructors) {
        content += `\`\`\`typescript\n${ctor.signature}\n\`\`\`\n\n`;
        if (ctor.parameters.length > 0) {
          content += '**Parameters:**\n\n';
          for (const param of ctor.parameters) {
            content += `- \`${param.name}\` (${param.type})${param.optional ? ' - optional' : ''}`;
            if (param.description) {
              content += ` - ${param.description}`;
            }
            content += '\n';
          }
          content += '\n';
        }
      }
    }

    // Properties
    if (typeDef.properties && typeDef.properties.length > 0) {
      content += '## Properties\n\n';
      content += '| Property | Type | Modifiers | Description |\n';
      content += '|----------|------|-----------|-------------|\n';
      for (const prop of typeDef.properties) {
        const modifiers: string[] = [];
        if (prop.static) modifiers.push('static');
        if (prop.readonly) modifiers.push('readonly');
        if (prop.optional) modifiers.push('optional');
        content += `| \`${prop.name}\` | \`${prop.type}\` | ${modifiers.join(', ') || '-'} | ${prop.description || '-'} |\n`;
      }
      content += '\n';
    }

    // Methods
    if (typeDef.methods && typeDef.methods.length > 0) {
      content += '## Methods\n\n';
      for (const method of typeDef.methods) {
        content += `### ${method.name}\n\n`;

        if (method.deprecated) {
          content += `> **Deprecated:** ${method.deprecationMessage || 'This method is deprecated.'}\n\n`;
        }

        if (method.description) {
          content += `${method.description}\n\n`;
        }

        content += `\`\`\`typescript\n${method.signature}\n\`\`\`\n\n`;

        // Modifiers
        const modifiers: string[] = [];
        if (method.static) modifiers.push('static');
        if (method.async) modifiers.push('async');
        if (method.abstract) modifiers.push('abstract');
        if (modifiers.length > 0) {
          content += `**Modifiers:** ${modifiers.join(', ')}\n\n`;
        }

        // Parameters
        if (method.parameters.length > 0) {
          content += '**Parameters:**\n\n';
          content += '| Name | Type | Optional | Description |\n';
          content += '|------|------|----------|-------------|\n';
          for (const param of method.parameters) {
            content += `| \`${param.name}\` | \`${param.type}\` | ${param.optional ? 'Yes' : 'No'} | ${param.description || '-'} |\n`;
          }
          content += '\n';
        }

        // Return type
        content += `**Returns:** \`${method.returnType}\``;
        if (method.returnDescription) {
          content += ` - ${method.returnDescription}`;
        }
        content += '\n\n';

        // Throws
        if (method.throws && method.throws.length > 0) {
          content += '**Throws:**\n\n';
          for (const thrown of method.throws) {
            content += `- \`${thrown.type}\` - ${thrown.description}\n`;
          }
          content += '\n';
        }

        // Examples
        if (method.examples && method.examples.length > 0) {
          content += '**Example:**\n\n';
          for (const example of method.examples) {
            content += `\`\`\`typescript\n${example}\n\`\`\`\n\n`;
          }
        }
      }
    }

    // Examples
    if (typeDef.examples && typeDef.examples.length > 0) {
      content += '## Examples\n\n';
      for (const example of typeDef.examples) {
        content += `\`\`\`typescript\n${example}\n\`\`\`\n\n`;
      }
    }

    // See also
    if (typeDef.see && typeDef.see.length > 0) {
      content += '## See Also\n\n';
      for (const see of typeDef.see) {
        content += `- ${see}\n`;
      }
      content += '\n';
    }

    return {
      path: `/api/${module}/${typeDef.name}`.toLowerCase(),
      slug: `api/${module}/${typeDef.name}`.toLowerCase(),
      content,
      frontmatter: {
        title: typeDef.name,
        description: typeDef.description || `${kind} ${typeDef.name}`,
        category: 'API',
        tags: typeDef.tags,
      },
      sourceFile: typeDef.sourceFile,
    };
  }

  /**
   * Categorize types by category
   */
  private categorizeTypes(): Record<string, Array<TypeDefinition & { module: string }>> {
    const categories: Record<string, Array<TypeDefinition & { module: string }>> = {};
    const categoryOrder = this.config.api.categoryOrder || [];

    // Initialize categories from order
    for (const cat of categoryOrder) {
      categories[cat] = [];
    }
    categories['Other'] = [];

    for (const ref of this.extractedTypes) {
      for (const type of [...ref.classes, ...ref.interfaces]) {
        const category = type.tags?.find(t => categoryOrder.includes(t)) || 'Other';
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push({ ...type, module: ref.module });
      }
    }

    // Remove empty categories
    for (const key of Object.keys(categories)) {
      if (categories[key].length === 0) {
        delete categories[key];
      }
    }

    return categories;
  }

  /**
   * Build navigation structure
   */
  private async buildNavigation(): Promise<void> {
    const sidebar: SidebarItem[] = [];

    // Build from docs directory structure
    if (existsSync(this.config.docsDirectory)) {
      const docsItems = this.buildSidebarFromDirectory(this.config.docsDirectory, '');
      sidebar.push(...docsItems);
    }

    // Add API reference section
    if (this.config.api.enabled && this.extractedTypes.length > 0) {
      const apiItems: SidebarItem[] = [];

      // Group by module
      for (const ref of this.extractedTypes) {
        const moduleItem: SidebarItem = {
          label: ref.name,
          path: `/api/${ref.module}`.toLowerCase(),
          items: [],
        };

        for (const cls of ref.classes) {
          moduleItem.items!.push({
            label: cls.name,
            path: `/api/${ref.module}/${cls.name}`.toLowerCase(),
          });
        }

        for (const iface of ref.interfaces) {
          moduleItem.items!.push({
            label: iface.name,
            path: `/api/${ref.module}/${iface.name}`.toLowerCase(),
          });
        }

        if (moduleItem.items!.length > 0 || ref.types.length > 0) {
          apiItems.push(moduleItem);
        }
      }

      sidebar.push({
        label: 'API Reference',
        path: '/api',
        items: apiItems,
      });
    }

    // Update config with built sidebar
    this.config.navigation.sidebar.items = sidebar;
  }

  /**
   * Build sidebar items from directory structure
   */
  private buildSidebarFromDirectory(dir: string, prefix: string): SidebarItem[] {
    const items: SidebarItem[] = [];
    const entries = readdirSync(dir);

    // Sort entries: directories first, then files
    entries.sort((a, b) => {
      const aPath = join(dir, a);
      const bPath = join(dir, b);
      const aIsDir = statSync(aPath).isDirectory();
      const bIsDir = statSync(bPath).isDirectory();

      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        const subItems = this.buildSidebarFromDirectory(fullPath, join(prefix, entry));
        if (subItems.length > 0) {
          items.push({
            label: this.formatLabel(entry),
            path: `/${join(prefix, entry)}`.replace(/\\/g, '/'),
            items: subItems,
          });
        }
      } else if (entry.endsWith('.mdx') || entry.endsWith('.md')) {
        const name = basename(entry, extname(entry));
        if (name !== 'index') {
          const content = readFileSync(fullPath, 'utf-8');
          const frontmatter = this.extractFrontmatter(content);
          items.push({
            label: frontmatter.title || this.formatLabel(name),
            path: `/${join(prefix, name)}`.replace(/\\/g, '/'),
          });
        }
      }
    }

    return items;
  }

  /**
   * Format a directory/file name as a label
   */
  private formatLabel(name: string): string {
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  /**
   * Write generated pages to output directory
   */
  private async writePages(pages: GeneratedPage[]): Promise<void> {
    const outDir = this.config.outputDirectory;

    // Create output directory if it doesn't exist
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true });
    }

    for (const page of pages) {
      const filePath = join(outDir, page.slug + '.mdx');
      const fileDir = dirname(filePath);

      // Create directory if needed
      if (!existsSync(fileDir)) {
        mkdirSync(fileDir, { recursive: true });
      }

      // Build file content with frontmatter
      let fileContent = '---\n';
      fileContent += `title: "${page.frontmatter.title}"\n`;
      fileContent += `description: "${page.frontmatter.description}"\n`;
      if (page.frontmatter.version) {
        fileContent += `version: "${page.frontmatter.version}"\n`;
      }
      if (page.frontmatter.lastUpdated) {
        fileContent += `lastUpdated: "${page.frontmatter.lastUpdated}"\n`;
      }
      if (page.frontmatter.category) {
        fileContent += `category: "${page.frontmatter.category}"\n`;
      }
      if (page.frontmatter.tags && page.frontmatter.tags.length > 0) {
        fileContent += `tags: [${page.frontmatter.tags.map(t => `"${t}"`).join(', ')}]\n`;
      }
      if (page.frontmatter.draft) {
        fileContent += 'draft: true\n';
      }
      if (page.frontmatter.deprecated) {
        fileContent += 'deprecated: true\n';
        if (page.frontmatter.deprecationMessage) {
          fileContent += `deprecationMessage: "${page.frontmatter.deprecationMessage}"\n`;
        }
      }
      fileContent += '---\n\n';
      fileContent += page.content;

      writeFileSync(filePath, fileContent, 'utf-8');
    }
  }

  /**
   * Calculate generation statistics
   */
  private calculateStats(pages: GeneratedPage[]): GenerationStats {
    let totalWords = 0;
    let totalCodeBlocks = 0;
    let totalExamples = 0;
    let totalSections = 0;

    for (const page of pages) {
      // Count words
      totalWords += page.content.split(/\s+/).length;

      // Count code blocks
      const codeBlocks = page.content.match(/```/g);
      totalCodeBlocks += codeBlocks ? Math.floor(codeBlocks.length / 2) : 0;

      // Count sections (headings)
      const headings = page.content.match(/^#{1,6}\s/gm);
      totalSections += headings ? headings.length : 0;
    }

    // Calculate API coverage
    let documented = 0;
    let undocumented = 0;

    for (const ref of this.extractedTypes) {
      for (const type of ref.types) {
        if (type.description) {
          documented++;
        } else {
          undocumented++;
        }
      }
    }

    const total = documented + undocumented;

    return {
      totalPages: pages.length,
      totalSections,
      totalCodeBlocks,
      totalExamples,
      totalApiTypes: this.extractedTypes.reduce((sum, ref) => sum + ref.types.length, 0),
      totalApiMethods: this.extractedTypes.reduce((sum, ref) =>
        sum + ref.classes.reduce((s, c) => s + (c.methods?.length || 0), 0), 0),
      totalWords,
      coverage: {
        documented,
        undocumented,
        percentage: total > 0 ? Math.round((documented / total) * 100) : 100,
      },
    };
  }

  /**
   * Get the generated pages
   */
  getPages(): Map<string, DocPage> {
    return this.pages;
  }

  /**
   * Get the extracted API references
   */
  getApiReferences(): APIReference[] {
    return this.extractedTypes;
  }

  /**
   * Get errors from generation
   */
  getErrors(): GenerationError[] {
    return this.errors;
  }

  /**
   * Get warnings from generation
   */
  getWarnings(): GenerationWarning[] {
    return this.warnings;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new doc generator with the given config
 */
export function createDocGenerator(config: DocConfig): DocGenerator {
  return new DocGenerator(config);
}

/**
 * Generate documentation with default config
 */
export async function generateDocs(options: {
  sourceDir: string;
  docsDir: string;
  outDir: string;
}): Promise<GenerationResult> {
  const config: DocConfig = {
    name: 'X2000',
    description: 'Autonomous Business-Building AI Fleet',
    baseUrl: 'https://docs.x2000.dev',
    sourceDirectories: [options.sourceDir],
    docsDirectory: options.docsDir,
    outputDirectory: options.outDir,
    api: {
      enabled: true,
      entryPoints: [options.sourceDir],
      exclude: ['node_modules', 'dist', '.test.', '.spec.'],
      excludePrivate: true,
      excludeProtected: false,
      excludeInternal: true,
      categorize: true,
      categoryOrder: ['Brains', 'Memory', 'Tools', 'Guardrails', 'Agents'],
      validation: {
        notExported: true,
        invalidLink: true,
        notDocumented: true,
      },
    },
    search: {
      enabled: true,
      provider: 'local',
      semanticSearch: false,
      chunkSize: 1000,
      chunkOverlap: 200,
    },
    playground: {
      enabled: true,
      provider: 'sandpack',
      defaultTemplate: 'node',
      timeout: 30000,
      memoryLimit: 256 * 1024 * 1024,
      allowNetworkAccess: false,
      allowFileSystemAccess: false,
    },
    versioning: {
      enabled: true,
      current: '0.1.0',
      stable: '0.1.0',
      maxVersions: 5,
      archiveOld: true,
      showBanner: true,
    },
    navigation: {
      sidebar: {
        items: [],
        collapsible: true,
        defaultCollapsed: false,
      },
      header: {
        logo: '/logo.svg',
        title: 'X2000',
        links: [],
        search: true,
        versionSelector: true,
        languageSelector: false,
        darkModeToggle: true,
      },
      footer: {
        copyright: '2026 X2000',
        links: [],
      },
    },
    build: {
      outDir: options.outDir,
      clean: true,
      minify: true,
      sourceMaps: false,
      sitemap: true,
      robots: true,
      parallelism: 4,
    },
    server: {
      port: 4000,
      host: 'localhost',
      cors: true,
      hotReload: true,
    },
    theme: {
      primaryColor: '#3b82f6',
      accentColor: '#10b981',
      darkMode: true,
      codeTheme: 'one-dark-pro',
      fontFamily: 'Inter, system-ui, sans-serif',
      codeFontFamily: 'JetBrains Mono, monospace',
    },
    i18n: {
      enabled: false,
      defaultLocale: 'en',
      locales: [{ code: 'en', name: 'English', path: '/', direction: 'ltr' }],
    },
  };

  const generator = new DocGenerator(config);
  return generator.generate();
}
