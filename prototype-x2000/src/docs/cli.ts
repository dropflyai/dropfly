/**
 * X2000 Documentation System - CLI
 * Command-line interface for documentation generation, serving, and management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { DocGenerator, createDocGenerator, generateDocs } from './generator.js';
import { DocSearchEngine, buildSearchIndex } from './search.js';
import { DocServer, startDocServer, stopDocServer } from './server.js';
import { VersionManager, createDocVersion } from './versioning.js';
import { TypeDocExtractor, extractTypes } from './extractor.js';
import type {
  DocConfig,
  GenerationResult,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  CoverageReport,
} from './types.js';

// ============================================================================
// CLI Setup
// ============================================================================

const program = new Command();

program
  .name('x2000-docs')
  .description('X2000 Documentation System CLI')
  .version('0.1.0');

// ============================================================================
// Build Command
// ============================================================================

program
  .command('build')
  .description('Build documentation from source')
  .option('-s, --source <dir>', 'Source directory for TypeScript files', './src')
  .option('-d, --docs <dir>', 'Documentation content directory', './docs')
  .option('-o, --output <dir>', 'Output directory for generated docs', './docs-output')
  .option('--no-api', 'Skip API reference generation')
  .option('--no-index', 'Skip search index generation')
  .option('--version <version>', 'Documentation version', '0.1.0')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    const spinner = ora('Building documentation...').start();

    try {
      const sourceDir = resolve(options.source);
      const docsDir = resolve(options.docs);
      const outputDir = resolve(options.output);

      // Validate directories
      if (!existsSync(sourceDir)) {
        spinner.fail(chalk.red(`Source directory not found: ${sourceDir}`));
        process.exit(1);
      }

      // Create output directory
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      // Generate documentation
      spinner.text = 'Extracting types from source...';
      const result = await generateDocs({
        sourceDir,
        docsDir: existsSync(docsDir) ? docsDir : sourceDir,
        outDir: outputDir,
      });

      if (!result.success) {
        spinner.fail(chalk.red('Documentation build failed'));
        console.log('\nErrors:');
        for (const error of result.errors) {
          console.log(chalk.red(`  - [${error.code}] ${error.message}`));
          if (error.file) {
            console.log(chalk.gray(`    at ${error.file}${error.line ? `:${error.line}` : ''}`));
          }
        }
        process.exit(1);
      }

      // Build search index
      if (options.index !== false) {
        spinner.text = 'Building search index...';
        const searchIndex = buildSearchIndex(result.pages, options.version);
        const indexPath = join(outputDir, 'search-index.json');
        writeFileSync(indexPath, JSON.stringify(searchIndex, null, 2));
      }

      spinner.succeed(chalk.green('Documentation built successfully'));

      // Print summary
      console.log('\n' + chalk.bold('Build Summary:'));
      console.log(`  Pages generated: ${chalk.cyan(result.stats.totalPages)}`);
      console.log(`  Sections: ${chalk.cyan(result.stats.totalSections)}`);
      console.log(`  Code blocks: ${chalk.cyan(result.stats.totalCodeBlocks)}`);
      console.log(`  API types: ${chalk.cyan(result.stats.totalApiTypes)}`);
      console.log(`  API methods: ${chalk.cyan(result.stats.totalApiMethods)}`);
      console.log(`  Documentation coverage: ${chalk.cyan(result.stats.coverage.percentage + '%')}`);
      console.log(`  Build time: ${chalk.cyan(result.timing.total + 'ms')}`);
      console.log(`\n  Output: ${chalk.cyan(outputDir)}`);

      // Print warnings
      if (result.warnings.length > 0) {
        console.log('\n' + chalk.yellow('Warnings:'));
        for (const warning of result.warnings.slice(0, 10)) {
          console.log(chalk.yellow(`  - [${warning.code}] ${warning.message}`));
        }
        if (result.warnings.length > 10) {
          console.log(chalk.yellow(`  ... and ${result.warnings.length - 10} more`));
        }
      }

    } catch (error) {
      spinner.fail(chalk.red(`Build failed: ${error}`));
      process.exit(1);
    }
  });

// ============================================================================
// Serve Command
// ============================================================================

program
  .command('serve')
  .description('Start local documentation server')
  .option('-p, --port <port>', 'Server port', '4000')
  .option('-h, --host <host>', 'Server host', 'localhost')
  .option('-d, --docs <dir>', 'Documentation output directory', './docs-output')
  .option('--no-hot-reload', 'Disable hot reload')
  .option('--semantic', 'Enable semantic search (requires OPENAI_API_KEY)')
  .action(async (options) => {
    const spinner = ora('Starting documentation server...').start();

    try {
      const docsDir = resolve(options.docs);

      if (!existsSync(docsDir)) {
        spinner.fail(chalk.red(`Documentation directory not found: ${docsDir}`));
        console.log(chalk.yellow('\nRun `x2000-docs build` first to generate documentation.'));
        process.exit(1);
      }

      const server = await startDocServer({
        port: parseInt(options.port, 10),
        host: options.host,
        hotReload: options.hotReload !== false,
        docsDir,
        staticDir: docsDir,
      });

      // Load search index if exists
      const indexPath = join(docsDir, 'search-index.json');
      if (existsSync(indexPath)) {
        const indexContent = readFileSync(indexPath, 'utf-8');
        const searchIndex = JSON.parse(indexContent);
        server.loadSearchIndex(searchIndex);
      }

      // Enable semantic search if requested
      if (options.semantic) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (apiKey) {
          await server.enableSemanticSearch(apiKey);
        } else {
          console.log(chalk.yellow('\nOPENAI_API_KEY not set, semantic search disabled.'));
        }
      }

      const info = server.getInfo();
      spinner.succeed(chalk.green(`Documentation server running`));
      console.log(`\n  ${chalk.bold('Local:')}  ${chalk.cyan(info.url)}`);
      console.log(`  ${chalk.bold('API:')}    ${chalk.cyan(info.url + '/api')}`);
      console.log(`  ${chalk.bold('Search:')} ${chalk.cyan(info.url + '/api/search?q=<query>')}`);

      if (options.hotReload !== false) {
        console.log(`\n  ${chalk.gray('Hot reload enabled - changes will auto-refresh.')}`);
      }

      console.log(`\n  Press ${chalk.cyan('Ctrl+C')} to stop.\n`);

      // Handle shutdown
      process.on('SIGINT', async () => {
        console.log('\n');
        const stopSpinner = ora('Stopping server...').start();
        await stopDocServer();
        stopSpinner.succeed(chalk.green('Server stopped'));
        process.exit(0);
      });

    } catch (error) {
      spinner.fail(chalk.red(`Failed to start server: ${error}`));
      process.exit(1);
    }
  });

// ============================================================================
// Search Command
// ============================================================================

program
  .command('search <query>')
  .description('Test documentation search')
  .option('-d, --docs <dir>', 'Documentation output directory', './docs-output')
  .option('-l, --limit <limit>', 'Number of results', '5')
  .option('--semantic', 'Use semantic search (requires OPENAI_API_KEY)')
  .action(async (query, options) => {
    const spinner = ora('Searching...').start();

    try {
      const docsDir = resolve(options.docs);
      const indexPath = join(docsDir, 'search-index.json');

      if (!existsSync(indexPath)) {
        spinner.fail(chalk.red('Search index not found'));
        console.log(chalk.yellow('\nRun `x2000-docs build` first to generate the search index.'));
        process.exit(1);
      }

      // Load search index
      const indexContent = readFileSync(indexPath, 'utf-8');
      const searchIndex = JSON.parse(indexContent);

      const searchEngine = new DocSearchEngine();
      searchEngine.loadIndex(searchIndex);

      // Enable semantic search if requested
      if (options.semantic && process.env.OPENAI_API_KEY) {
        await searchEngine.enableSemanticSearch('openai', {
          apiKey: process.env.OPENAI_API_KEY,
        });
      }

      // Perform search
      const results = await searchEngine.search({
        query,
        limit: parseInt(options.limit, 10),
        semanticSearch: options.semantic,
      });

      spinner.stop();

      console.log(chalk.bold(`\nSearch results for: "${query}"\n`));
      console.log(chalk.gray(`Found ${results.totalResults} results in ${results.timing.total}ms\n`));

      if (results.results.length === 0) {
        console.log(chalk.yellow('No results found.'));

        if (results.suggestions && results.suggestions.length > 0) {
          console.log('\nSuggestions:');
          for (const suggestion of results.suggestions) {
            console.log(`  - ${suggestion}`);
          }
        }
      } else {
        for (let i = 0; i < results.results.length; i++) {
          const result = results.results[i];
          console.log(chalk.cyan(`${i + 1}. ${result.title}`));
          if (result.section) {
            console.log(chalk.gray(`   ${result.section}`));
          }
          console.log(`   ${chalk.white(result.highlight)}`);
          console.log(chalk.gray(`   ${result.path} (score: ${result.score.toFixed(3)})`));
          console.log();
        }
      }

    } catch (error) {
      spinner.fail(chalk.red(`Search failed: ${error}`));
      process.exit(1);
    }
  });

// ============================================================================
// Validate Command
// ============================================================================

program
  .command('validate')
  .description('Validate documentation coverage and links')
  .option('-s, --source <dir>', 'Source directory for TypeScript files', './src')
  .option('-d, --docs <dir>', 'Documentation content directory', './docs')
  .option('--strict', 'Fail on warnings')
  .action(async (options) => {
    const spinner = ora('Validating documentation...').start();

    try {
      const sourceDir = resolve(options.source);
      const docsDir = resolve(options.docs);

      if (!existsSync(sourceDir)) {
        spinner.fail(chalk.red(`Source directory not found: ${sourceDir}`));
        process.exit(1);
      }

      // Extract types
      spinner.text = 'Extracting types...';
      const extractor = new TypeDocExtractor({
        sourceDir,
        excludePrivate: true,
        excludeInternal: true,
      });
      const apiRefs = await extractor.extractAll();

      // Validate documentation
      spinner.text = 'Checking documentation coverage...';
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];
      const missing: Array<{ file: string; name: string; kind: string }> = [];

      let totalExports = 0;
      let documentedExports = 0;

      for (const ref of apiRefs) {
        for (const type of ref.types) {
          totalExports++;

          if (!type.description) {
            missing.push({
              file: type.sourceFile,
              name: type.name,
              kind: type.kind,
            });
            warnings.push({
              code: 'MISSING_DOC',
              message: `Missing documentation for ${type.kind} "${type.name}"`,
              file: type.sourceFile,
              line: type.sourceLine,
              symbol: type.name,
              suggestion: `Add a JSDoc comment above the ${type.kind} declaration`,
            });
          } else {
            documentedExports++;
          }

          // Check methods
          if (type.methods) {
            for (const method of type.methods) {
              totalExports++;
              if (!method.description) {
                warnings.push({
                  code: 'MISSING_METHOD_DOC',
                  message: `Missing documentation for method "${type.name}.${method.name}"`,
                  file: type.sourceFile,
                  symbol: `${type.name}.${method.name}`,
                  suggestion: 'Add a JSDoc comment above the method',
                });
              } else {
                documentedExports++;
              }
            }
          }
        }
      }

      const coverage: CoverageReport = {
        total: totalExports,
        documented: documentedExports,
        undocumented: totalExports - documentedExports,
        percentage: totalExports > 0 ? Math.round((documentedExports / totalExports) * 100) : 100,
        byFile: [],
        byType: [],
        missing: missing.map(m => ({
          file: m.file,
          line: 0,
          name: m.name,
          kind: m.kind as any,
          visibility: 'public',
        })),
      };

      spinner.stop();

      // Print results
      console.log(chalk.bold('\nDocumentation Validation Report\n'));

      // Coverage
      const coverageColor = coverage.percentage >= 90 ? chalk.green :
                           coverage.percentage >= 70 ? chalk.yellow :
                           chalk.red;

      console.log(chalk.bold('Coverage:'));
      console.log(`  Total exports: ${coverage.total}`);
      console.log(`  Documented: ${coverage.documented}`);
      console.log(`  Undocumented: ${coverage.undocumented}`);
      console.log(`  Coverage: ${coverageColor(coverage.percentage + '%')}`);

      // Errors
      if (errors.length > 0) {
        console.log(chalk.bold('\nErrors:'));
        for (const error of errors) {
          console.log(chalk.red(`  - [${error.code}] ${error.message}`));
          if (error.file) {
            console.log(chalk.gray(`    at ${error.file}${error.line ? `:${error.line}` : ''}`));
          }
        }
      }

      // Warnings
      if (warnings.length > 0) {
        console.log(chalk.bold('\nWarnings:'));
        const displayWarnings = warnings.slice(0, 20);
        for (const warning of displayWarnings) {
          console.log(chalk.yellow(`  - [${warning.code}] ${warning.message}`));
          if (warning.suggestion) {
            console.log(chalk.gray(`    Suggestion: ${warning.suggestion}`));
          }
        }
        if (warnings.length > 20) {
          console.log(chalk.yellow(`\n  ... and ${warnings.length - 20} more warnings`));
        }
      }

      // Missing docs
      if (missing.length > 0) {
        console.log(chalk.bold('\nMissing Documentation:'));
        const displayMissing = missing.slice(0, 15);
        for (const m of displayMissing) {
          console.log(`  - ${chalk.cyan(m.kind)} ${m.name} (${chalk.gray(m.file)})`);
        }
        if (missing.length > 15) {
          console.log(chalk.gray(`\n  ... and ${missing.length - 15} more`));
        }
      }

      // Final verdict
      console.log();
      if (errors.length > 0) {
        console.log(chalk.red.bold('Validation FAILED with errors.'));
        process.exit(1);
      } else if (options.strict && warnings.length > 0) {
        console.log(chalk.yellow.bold('Validation FAILED (strict mode) with warnings.'));
        process.exit(1);
      } else if (warnings.length > 0) {
        console.log(chalk.yellow.bold('Validation PASSED with warnings.'));
      } else {
        console.log(chalk.green.bold('Validation PASSED.'));
      }

    } catch (error) {
      spinner.fail(chalk.red(`Validation failed: ${error}`));
      process.exit(1);
    }
  });

// ============================================================================
// Version Command
// ============================================================================

program
  .command('version <action> [version]')
  .description('Manage documentation versions (create, list, deprecate)')
  .option('-d, --docs <dir>', 'Documentation directory', './docs-output')
  .option('--stable', 'Mark as stable version')
  .option('--prerelease', 'Mark as prerelease')
  .option('--message <message>', 'Deprecation message')
  .action(async (action, version, options) => {
    const spinner = ora('Managing versions...').start();

    try {
      const docsDir = resolve(options.docs);
      const versionManager = new VersionManager(docsDir);

      switch (action) {
        case 'list': {
          spinner.stop();
          const versions = versionManager.getAllVersions();
          console.log(chalk.bold('\nDocumentation Versions:\n'));

          for (const v of versions) {
            let label = v.version;
            if (v.isLatest) label += chalk.cyan(' (latest)');
            if (v.isStable) label += chalk.green(' (stable)');
            if (v.isPrerelease) label += chalk.yellow(' (prerelease)');
            if (v.isDeprecated) label += chalk.red(' (deprecated)');

            console.log(`  ${label}`);
            if (v.releasedAt) {
              console.log(chalk.gray(`    Released: ${v.releasedAt.toDateString()}`));
            }
          }
          break;
        }

        case 'create': {
          if (!version) {
            spinner.fail(chalk.red('Version number required'));
            process.exit(1);
          }

          spinner.text = `Creating version ${version}...`;
          const newVersion = await createDocVersion(version, docsDir, {
            isStable: options.stable,
            isPrerelease: options.prerelease,
          });

          spinner.succeed(chalk.green(`Version ${version} created`));
          console.log(`  Path: ${newVersion.path}`);
          break;
        }

        case 'deprecate': {
          if (!version) {
            spinner.fail(chalk.red('Version number required'));
            process.exit(1);
          }

          const success = versionManager.deprecateVersion(version, options.message);
          if (success) {
            spinner.succeed(chalk.green(`Version ${version} deprecated`));
          } else {
            spinner.fail(chalk.red(`Version ${version} not found`));
            process.exit(1);
          }
          break;
        }

        default:
          spinner.fail(chalk.red(`Unknown action: ${action}`));
          console.log('\nAvailable actions: list, create, deprecate');
          process.exit(1);
      }

    } catch (error) {
      spinner.fail(chalk.red(`Version management failed: ${error}`));
      process.exit(1);
    }
  });

// ============================================================================
// Init Command
// ============================================================================

program
  .command('init')
  .description('Initialize documentation configuration')
  .option('-d, --dir <dir>', 'Project directory', '.')
  .action(async (options) => {
    const spinner = ora('Initializing documentation configuration...').start();

    try {
      const projectDir = resolve(options.dir);
      const configPath = join(projectDir, 'docs.config.json');

      if (existsSync(configPath)) {
        spinner.fail(chalk.yellow('docs.config.json already exists'));
        process.exit(1);
      }

      const defaultConfig: Partial<DocConfig> = {
        name: 'My Project',
        description: 'Project documentation',
        baseUrl: 'https://docs.example.com',
        sourceDirectories: ['./src'],
        docsDirectory: './docs',
        outputDirectory: './docs-output',
        api: {
          enabled: true,
          entryPoints: ['./src'],
          exclude: ['node_modules', 'dist', '.test.', '.spec.'],
          excludePrivate: true,
          excludeProtected: false,
          excludeInternal: true,
          categorize: true,
          categoryOrder: [],
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
        versioning: {
          enabled: true,
          current: '0.1.0',
          stable: '0.1.0',
          maxVersions: 5,
          archiveOld: true,
          showBanner: true,
        },
      };

      writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));

      // Create docs directory
      const docsDir = join(projectDir, 'docs');
      if (!existsSync(docsDir)) {
        mkdirSync(docsDir, { recursive: true });

        // Create example index.mdx
        const indexContent = `---
title: "Welcome"
description: "Project documentation"
---

# Welcome to the Documentation

This is your project's documentation home page.

## Getting Started

Add your getting started content here.

## API Reference

API documentation is auto-generated from your TypeScript source code.
`;
        writeFileSync(join(docsDir, 'index.mdx'), indexContent);
      }

      spinner.succeed(chalk.green('Documentation initialized'));
      console.log(`\n  Configuration: ${chalk.cyan(configPath)}`);
      console.log(`  Docs directory: ${chalk.cyan(docsDir)}`);
      console.log(`\n  Next steps:`);
      console.log(`    1. Edit ${chalk.cyan('docs.config.json')} to customize settings`);
      console.log(`    2. Add MDX files to ${chalk.cyan('./docs')}`);
      console.log(`    3. Run ${chalk.cyan('x2000-docs build')} to generate documentation`);
      console.log(`    4. Run ${chalk.cyan('x2000-docs serve')} to preview locally`);

    } catch (error) {
      spinner.fail(chalk.red(`Initialization failed: ${error}`));
      process.exit(1);
    }
  });

// ============================================================================
// Export
// ============================================================================

export { program };

/**
 * Run the CLI
 */
export function runCli(): void {
  program.parse();
}

// Run if executed directly
if (process.argv[1]?.includes('cli')) {
  runCli();
}
