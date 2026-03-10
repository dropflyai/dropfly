# X2000 Documentation System Design

## A Superior Documentation System for X2000

**Version:** 1.0
**Date:** 2026-03-09
**Status:** Design Document

---

## Executive Summary

This document outlines the design for X2000's documentation system, built to be **categorically superior** to OpenClaw's documentation. Drawing from best-in-class systems (Stripe, Vercel, Tailwind CSS, Cloudflare) while addressing documented failures in OpenClaw's approach, this system delivers:

- **Auto-generated API reference** from TypeScript source
- **Interactive/runnable code examples** in the browser
- **AI-powered semantic search** with vector embeddings
- **Multi-version support** tied to releases
- **Contributor-friendly** docs-as-code workflow
- **Exceptional navigation** and discoverability

---

## Architecture Overview

```
                              X2000 DOCUMENTATION SYSTEM
 +============================================================================+
 |                                                                            |
 |   +-------------------+     +-------------------+     +-----------------+  |
 |   |   CONTENT LAYER   |     |   BUILD PIPELINE  |     |  RUNTIME LAYER  |  |
 |   |                   |     |                   |     |                 |  |
 |   |  /docs (MDX)      |---->|  TypeDoc Extract  |---->| Fumadocs/Astro  |  |
 |   |  /src (TypeScript)|---->|  OpenAPI Generate |---->| Search Index    |  |
 |   |  /examples (Code) |---->|  Example Bundle   |---->| Playground VM   |  |
 |   +-------------------+     +-------------------+     +-----------------+  |
 |            |                         |                        |            |
 |            v                         v                        v            |
 |   +------------------------------------------------------------------------+
 |   |                          VERSION CONTROL                               |
 |   |   main (current) | v0.x (archived) | v1.x (stable) | next (preview)   |
 |   +------------------------------------------------------------------------+
 |            |                         |                        |            |
 |            v                         v                        v            |
 |   +------------------------------------------------------------------------+
 |   |                         AI INTELLIGENCE LAYER                          |
 |   |                                                                        |
 |   |  +----------------+  +-----------------+  +------------------+         |
 |   |  | Embedding Gen  |  | Semantic Search |  | Doc Suggestions  |         |
 |   |  | (OpenAI)       |  | (Typesense)     |  | (Mintlify-style) |         |
 |   |  +----------------+  +-----------------+  +------------------+         |
 |   +------------------------------------------------------------------------+
 |            |                         |                        |            |
 |            v                         v                        v            |
 |   +------------------------------------------------------------------------+
 |   |                           DELIVERY LAYER                               |
 |   |                                                                        |
 |   |   docs.x2000.dev (Primary)                                            |
 |   |   docs.x2000.dev/api (API Reference)                                  |
 |   |   docs.x2000.dev/play (Interactive Playground)                        |
 |   |   docs.x2000.dev/{locale} (i18n Support)                              |
 |   +------------------------------------------------------------------------+
 |                                                                            |
 +============================================================================+
```

---

## 1. Best-in-Class Documentation Analysis

### What We Learned From Industry Leaders

| Source | Key Innovation | X2000 Adoption |
|--------|----------------|----------------|
| **Stripe** | Three-column layout, language selector, code that runs | Stripe-style layout with X2000 enhancements |
| **Vercel** | MDX + React components, preview deployments | Full MDX support with custom components |
| **Tailwind CSS** | Searchable, utility-focused, copy-to-clipboard | Instant search, smart code copying |
| **Cloudflare** | Docs-as-code, OpenAPI auto-generation, Astro migration | OpenAPI-first API docs, Astro-based build |
| **Mintlify** | AI-powered doc agent, beautiful defaults | AI doc suggestions, polished design system |

### What Makes Stripe's Docs The Benchmark

1. **Three-Column Layout**: Navigation (left), Content (center), Code (right)
2. **Language Customization**: Users see code in their preferred language
3. **Interactive Code**: Runnable examples with real API responses
4. **Docs Are Part of "Done"**: Features don't ship without docs
5. **Career Incentives**: Documentation counts toward promotions

**X2000 Adopts All Five Principles.**

---

## 2. Why This Is Better Than OpenClaw

### OpenClaw's Documented Failures

Based on extensive production feedback, OpenClaw's documentation suffers from:

| OpenClaw Problem | Impact | X2000 Solution |
|------------------|--------|----------------|
| "Reads like a travel brochure - shows the beach, forgets the sharks" | Setup works, production breaks | Battle-tested guides with production warnings |
| "Required but undocumented" files | Silent failures | 100% coverage requirement + missing file detection |
| Critical setup requirements not mentioned | Hours wasted debugging | Pre-flight checklists, dependency graphs |
| No documentation for what breaks after deploy | Production outages | Dedicated "Production Gotchas" section per feature |
| Stale docs that don't match current behavior | Trust erosion | Auto-sync from source code |

### X2000's Documentation Guarantees

```
+--------------------------------------------------+
|           X2000 DOCUMENTATION PROMISES           |
+--------------------------------------------------+
| 1. NEVER claim "working" without a runnable test |
| 2. EVERY feature documents failure modes         |
| 3. AUTO-GENERATED sections stay in sync          |
| 4. PRODUCTION warnings are mandatory             |
| 5. VERSIONED docs match exact releases           |
+--------------------------------------------------+
```

---

## 3. Documentation Structure

### Information Architecture

```
docs/
+-- getting-started/
|   +-- quickstart.mdx            # 5-minute hello world
|   +-- installation.mdx          # All installation methods
|   +-- first-project.mdx         # Build your first X2000 project
|   +-- concepts.mdx              # Core mental model
|
+-- guides/
|   +-- brains/
|   |   +-- overview.mdx          # How brains work
|   |   +-- ceo-brain.mdx         # CEO Brain deep dive
|   |   +-- engineering-brain.mdx # Engineering Brain guide
|   |   +-- [brain-name].mdx      # One per brain
|   |
|   +-- memory/
|   |   +-- overview.mdx          # Memory system concepts
|   |   +-- patterns.mdx          # Working with patterns
|   |   +-- skills.mdx            # Skill pooling
|   |   +-- querying.mdx          # Memory queries
|   |
|   +-- guardrails/
|   |   +-- overview.mdx          # 5-layer guardrail system
|   |   +-- trust-levels.mdx      # Earned autonomy
|   |   +-- escalation.mdx        # Human-in-the-loop
|   |
|   +-- tools/
|   |   +-- overview.mdx          # Tool system intro
|   |   +-- file-operations.mdx   # Read/write/edit
|   |   +-- shell-execution.mdx   # Command execution
|   |   +-- custom-tools.mdx      # Building your own
|   |
|   +-- production/               # CRITICAL: OpenClaw lacks this
|       +-- deployment.mdx        # Production deployment
|       +-- monitoring.mdx        # Observability
|       +-- troubleshooting.mdx   # Common issues
|       +-- gotchas.mdx           # Silent failures & fixes
|
+-- api/                          # AUTO-GENERATED from TypeScript
|   +-- reference/
|   |   +-- [auto-generated].mdx  # From TypeDoc
|   +-- openapi/
|       +-- spec.yaml             # OpenAPI specification
|       +-- endpoints.mdx         # Interactive API explorer
|
+-- examples/
|   +-- basic/
|   |   +-- hello-world/          # Simplest possible example
|   |   +-- single-brain/         # One brain workflow
|   +-- intermediate/
|   |   +-- multi-brain/          # Brain collaboration
|   |   +-- memory-usage/         # Pattern extraction
|   +-- advanced/
|   |   +-- full-autonomous/      # Full autonomy workflow
|   |   +-- custom-brain/         # Building custom brains
|   +-- real-world/
|       +-- saas-builder/         # Build a SaaS end-to-end
|       +-- agent-team/           # Multi-agent orchestration
|
+-- changelog/
|   +-- [version].mdx             # Per-version changelogs
|
+-- contributing/
    +-- overview.mdx              # How to contribute
    +-- docs-guide.mdx            # Writing documentation
    +-- style-guide.mdx           # Writing standards
```

### Page Template Standard

Every documentation page follows this structure:

```mdx
---
title: "Page Title"
description: "SEO-friendly description under 160 chars"
version: "1.0.0"
lastUpdated: "2026-03-09"
---

# {title}

<Callout type="info">
  One-line summary of what this page covers.
</Callout>

## Overview

Brief introduction (2-3 paragraphs max).

## Prerequisites

<Prerequisites>
  - Node.js 20+
  - X2000 CLI installed
  - Supabase account (for memory persistence)
</Prerequisites>

## Quick Start

<CodeGroup>
```typescript title="example.ts"
// Minimal working example
```
</CodeGroup>

## Detailed Guide

Main content sections...

## Production Considerations

<Callout type="warning">
  Critical production-specific information.
</Callout>

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| ... | ... | ... |

## Related

- [Link to related doc 1](/path)
- [Link to related doc 2](/path)
```

---

## 4. Auto-Generation Pipeline

### TypeScript to Documentation Flow

```
+------------------+     +-----------------+     +------------------+
|                  |     |                 |     |                  |
|  TypeScript Src  |---->|    TypeDoc      |---->|   JSON Model     |
|  (with TSDoc)    |     |    (Extract)    |     |   (API Data)     |
|                  |     |                 |     |                  |
+------------------+     +-----------------+     +------------------+
                                                         |
                                                         v
+------------------+     +-----------------+     +------------------+
|                  |     |                 |     |                  |
|   MDX Pages      |<----|   Generator     |<----|   Transformer    |
|  (Rendered Docs) |     |   (Template)    |     |   (Enhance)      |
|                  |     |                 |     |                  |
+------------------+     +-----------------+     +------------------+
```

### TypeDoc Configuration

```json
// typedoc.json
{
  "entryPoints": ["./src"],
  "entryPointStrategy": "expand",
  "out": "./docs/api/reference",
  "json": "./docs/api/api.json",
  "plugin": [
    "typedoc-plugin-markdown",
    "typedoc-plugin-frontmatter"
  ],
  "readme": "none",
  "excludePrivate": true,
  "excludeProtected": false,
  "excludeInternal": true,
  "includeVersion": true,
  "categorizeByGroup": true,
  "categoryOrder": [
    "Brains",
    "Memory",
    "Tools",
    "Guardrails",
    "Agents",
    "*"
  ],
  "validation": {
    "notExported": true,
    "invalidLink": true,
    "notDocumented": true  // CRITICAL: Enforce documentation
  }
}
```

### TSDoc Comment Standards

```typescript
/**
 * The CEO Brain orchestrates all specialist brains to accomplish complex tasks.
 *
 * @remarks
 * The CEO Brain is the only brain that can delegate to other brains.
 * It maintains overall context and resolves conflicts between specialists.
 *
 * @example
 * ```typescript
 * import { ceoBrain } from 'x2000';
 *
 * const result = await ceoBrain.orchestrate({
 *   task: "Build a landing page for my SaaS",
 *   context: { industry: "fintech" }
 * });
 * ```
 *
 * @see {@link EngineeringBrain} for code implementation
 * @see {@link DesignBrain} for UI/UX work
 *
 * @public
 */
export class CEOBrain extends BaseBrain {
  /**
   * Orchestrates a task across multiple specialist brains.
   *
   * @param task - The task to accomplish
   * @param options - Configuration options
   * @returns The orchestration result with all brain outputs
   *
   * @throws {@link InsufficientTrustError} if trust level is too low
   * @throws {@link GuardrailViolationError} if action is blocked
   *
   * @example
   * ```typescript
   * const result = await ceoBrain.orchestrate({
   *   task: "Analyze competitor pricing",
   *   options: {
   *     brains: ['research', 'finance', 'product'],
   *     debate: true
   *   }
   * });
   * ```
   */
  async orchestrate(task: string, options?: OrchestrationOptions): Promise<OrchestrationResult> {
    // ...
  }
}
```

### Build Pipeline (GitHub Actions)

```yaml
# .github/workflows/docs.yml
name: Documentation Build

on:
  push:
    branches: [main]
    paths:
      - 'src/**/*.ts'
      - 'docs/**/*.mdx'
  pull_request:
    branches: [main]
    paths:
      - 'src/**/*.ts'
      - 'docs/**/*.mdx'

jobs:
  generate-api-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Generate TypeDoc API reference
        run: pnpm run docs:generate

      - name: Validate all public APIs are documented
        run: pnpm run docs:validate
        # Fails if any public export lacks documentation

      - name: Build documentation site
        run: pnpm run docs:build

      - name: Index content for search
        run: pnpm run docs:index
        env:
          TYPESENSE_API_KEY: ${{ secrets.TYPESENSE_API_KEY }}

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: x2000-docs
          directory: docs/.output
```

---

## 5. Interactive Example System

### Architecture

```
+--------------------------------------------------------------------+
|                    INTERACTIVE PLAYGROUND                           |
+--------------------------------------------------------------------+
|                                                                     |
|  +---------------------------+  +-------------------------------+   |
|  |      CODE EDITOR          |  |        LIVE PREVIEW           |   |
|  |  (Monaco Editor)          |  |  (Sandpack/Codapi Runtime)    |   |
|  |                           |  |                               |   |
|  |  - Syntax highlighting    |  |  - Real execution             |   |
|  |  - TypeScript support     |  |  - Console output             |   |
|  |  - Auto-completion        |  |  - Error display              |   |
|  |  - Error indicators       |  |  - Result visualization       |   |
|  +---------------------------+  +-------------------------------+   |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |                     EXAMPLE CONTROLS                          |  |
|  |  [Reset] [Run] [Copy] [Open in Playground] [View on GitHub]   |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
+--------------------------------------------------------------------+
```

### Sandpack Integration

```typescript
// components/Playground.tsx
import { Sandpack } from "@codesandbox/sandpack-react";

interface PlaygroundProps {
  files: Record<string, string>;
  template?: "node" | "react" | "vanilla";
  showConsole?: boolean;
  autorun?: boolean;
}

export function Playground({
  files,
  template = "node",
  showConsole = true,
  autorun = false
}: PlaygroundProps) {
  return (
    <Sandpack
      template={template}
      files={{
        ...files,
        // Inject X2000 mock for browser execution
        "/x2000-mock.ts": X2000_BROWSER_MOCK,
      }}
      customSetup={{
        dependencies: {
          "x2000": "latest",
          "@types/node": "^20",
        },
      }}
      options={{
        showConsole,
        autorun,
        editorHeight: 400,
        showLineNumbers: true,
        showInlineErrors: true,
        wrapContent: true,
        resizablePanels: true,
      }}
      theme="dark"
    />
  );
}
```

### Example Types

| Type | Description | Runtime |
|------|-------------|---------|
| **Static** | Code display only, copy-to-clipboard | None |
| **Interactive** | Editable, runs in browser sandbox | Sandpack |
| **Live API** | Connects to real X2000 API (authenticated) | Server-side |
| **Terminal** | CLI command examples | Simulated |

### MDX Usage

```mdx
## Basic Brain Usage

This example shows how to use the Engineering Brain to generate code:

<Playground
  files={{
    "/index.ts": `
import { engineeringBrain } from 'x2000';

async function main() {
  const result = await engineeringBrain.execute({
    task: "Create a TypeScript function that validates email addresses",
    context: { style: "functional" }
  });

  console.log(result.output);
}

main();
`
  }}
  autorun={false}
  showConsole={true}
/>

<Callout type="tip">
  Click "Run" to execute this code. Edit it to experiment!
</Callout>
```

---

## 6. AI-Powered Semantic Search

### Search Architecture

```
+--------------------------------------------------------------------------+
|                         SEARCH SYSTEM                                     |
+--------------------------------------------------------------------------+
|                                                                           |
|   USER QUERY: "how do brains communicate"                                 |
|        |                                                                  |
|        v                                                                  |
|   +------------------------+                                              |
|   |   QUERY PROCESSOR      |                                              |
|   |   - Tokenize           |                                              |
|   |   - Expand synonyms    |                                              |
|   |   - Generate embedding |                                              |
|   +------------------------+                                              |
|        |                                                                  |
|        v                                                                  |
|   +------------------------+     +------------------------+               |
|   |   KEYWORD SEARCH       |     |   SEMANTIC SEARCH      |               |
|   |   (Typesense BM25)     |     |   (Vector similarity)  |               |
|   +------------------------+     +------------------------+               |
|        |                              |                                   |
|        +------------+  +--------------+                                   |
|                     |  |                                                  |
|                     v  v                                                  |
|              +------------------+                                         |
|              |  HYBRID RANKING  |                                         |
|              |  (RRF Fusion)    |                                         |
|              +------------------+                                         |
|                     |                                                     |
|                     v                                                     |
|   RESULTS:                                                                |
|   1. Brain Tension Protocol (semantic match: "communicate" = "debate")    |
|   2. Agent Collaboration (keyword match: "brains")                        |
|   3. CEO Brain Orchestration (contextual relevance)                       |
|                                                                           |
+--------------------------------------------------------------------------+
```

### Embedding Pipeline

```typescript
// scripts/generate-embeddings.ts
import { OpenAI } from 'openai';
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import matter from 'gray-matter';

const openai = new OpenAI();

interface DocChunk {
  id: string;
  path: string;
  title: string;
  section: string;
  content: string;
  embedding?: number[];
}

async function generateEmbeddings() {
  const mdxFiles = await glob('docs/**/*.mdx');
  const chunks: DocChunk[] = [];

  for (const file of mdxFiles) {
    const content = readFileSync(file, 'utf-8');
    const { data, content: body } = matter(content);

    // Split into sections by ## headers
    const sections = splitIntoSections(body);

    for (const section of sections) {
      chunks.push({
        id: `${file}#${section.slug}`,
        path: file.replace('docs/', '/').replace('.mdx', ''),
        title: data.title,
        section: section.title,
        content: section.content,
      });
    }
  }

  // Generate embeddings in batches
  const batchSize = 100;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const texts = batch.map(c => `${c.title} - ${c.section}\n\n${c.content}`);

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // 1536 dimensions, cost-effective
      input: texts,
    });

    response.data.forEach((embedding, idx) => {
      batch[idx].embedding = embedding.embedding;
    });
  }

  writeFileSync('docs/.search/embeddings.json', JSON.stringify(chunks));
  console.log(`Generated embeddings for ${chunks.length} chunks`);
}
```

### Typesense Configuration

```typescript
// typesense/schema.ts
const searchSchema = {
  name: 'x2000_docs',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'path', type: 'string', facet: true },
    { name: 'title', type: 'string' },
    { name: 'section', type: 'string' },
    { name: 'content', type: 'string' },
    { name: 'category', type: 'string', facet: true },
    { name: 'version', type: 'string', facet: true },
    { name: 'embedding', type: 'float[]', num_dim: 1536 }, // For semantic search
  ],
  default_sorting_field: 'relevance_score',
};

// Hybrid search query
const searchQuery = {
  q: userQuery,
  query_by: 'title,section,content',
  vector_query: 'embedding:([], k: 10)', // Will be filled with query embedding
  prefix: false,
  highlight_full_fields: 'content',
  highlight_affix_num_tokens: 20,
  filter_by: `version:=${selectedVersion}`,
};
```

### Search UI Component

```typescript
// components/Search.tsx
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

export function SearchDialog() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 200);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    // Hybrid search: keyword + semantic
    fetch('/api/search', {
      method: 'POST',
      body: JSON.stringify({ query: debouncedQuery }),
    })
      .then(res => res.json())
      .then(data => {
        setResults(data.results);
        setIsLoading(false);
      });
  }, [debouncedQuery]);

  return (
    <CommandDialog>
      <CommandInput
        placeholder="Search documentation..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading && <CommandLoading>Searching...</CommandLoading>}
        {results.map(result => (
          <CommandItem key={result.id}>
            <SearchResultItem result={result} />
          </CommandItem>
        ))}
      </CommandList>
      <CommandFooter>
        <kbd>Enter</kbd> to select <kbd>Esc</kbd> to close
      </CommandFooter>
    </CommandDialog>
  );
}
```

---

## 7. Version Support System

### Versioning Strategy

```
+------------------------------------------------------------------+
|                    VERSION MANAGEMENT                             |
+------------------------------------------------------------------+
|                                                                   |
|   /docs (current)  <-- Active development (main branch)           |
|        |                                                          |
|        +-- Becomes v1.1.0 when released                          |
|                                                                   |
|   /versioned_docs/                                                |
|        +-- v1.0.0/  <-- First stable release                     |
|        +-- v0.9.0/  <-- Last pre-release (archived)              |
|                                                                   |
|   VERSION SELECTOR:                                               |
|   [ v1.1.0 (next) v ] [ v1.0.0 (stable) ] [ v0.9.0 (legacy) ]   |
|                                                                   |
+------------------------------------------------------------------+
```

### Versioning Rules

1. **Maximum 5 active versions** - Older versions become archived snapshots
2. **Semantic versioning** - v1.0.0, v1.1.0, v2.0.0 (no "stable" or "beta" labels)
3. **Deprecation warnings** - Old version docs show migration banner
4. **API diff tool** - Show changes between versions

### Version Configuration

```typescript
// docs.config.ts
export const versions = {
  current: {
    label: 'v1.1.0 (next)',
    path: '/docs',
    banner: null,
  },
  stable: {
    label: 'v1.0.0',
    path: '/docs/v1.0.0',
    banner: null,
  },
  legacy: [
    {
      label: 'v0.9.0',
      path: '/docs/v0.9.0',
      banner: {
        type: 'warning',
        message: 'This version is no longer maintained. Please upgrade to v1.0.0.',
        link: '/docs/guides/migration/v0-to-v1',
      },
    },
  ],
};

// Version dropdown shows:
// - Current (next) at top
// - Stable (recommended) highlighted
// - Legacy versions with warnings
```

### Automated Version Workflow

```yaml
# .github/workflows/version-docs.yml
name: Version Documentation

on:
  release:
    types: [published]

jobs:
  version-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Extract version from tag
        id: version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT

      - name: Create versioned docs snapshot
        run: |
          mkdir -p versioned_docs/v${{ steps.version.outputs.VERSION }}
          cp -r docs/* versioned_docs/v${{ steps.version.outputs.VERSION }}/

      - name: Update version manifest
        run: node scripts/update-versions.js ${{ steps.version.outputs.VERSION }}

      - name: Commit versioned docs
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add versioned_docs/
          git commit -m "docs: snapshot v${{ steps.version.outputs.VERSION }}"
          git push
```

---

## 8. Internationalization (i18n)

### Locale Support

```
+------------------------------------------------------------------+
|                    INTERNATIONALIZATION                           |
+------------------------------------------------------------------+
|                                                                   |
|   SUPPORTED LOCALES:                                              |
|   - en (English) - Primary                                        |
|   - es (Spanish) - Phase 2                                        |
|   - zh (Chinese) - Phase 2                                        |
|   - ja (Japanese) - Phase 3                                       |
|   - de (German) - Phase 3                                         |
|                                                                   |
|   URL STRUCTURE:                                                  |
|   docs.x2000.dev/         --> English (default)                   |
|   docs.x2000.dev/es/      --> Spanish                             |
|   docs.x2000.dev/zh/      --> Chinese                             |
|                                                                   |
+------------------------------------------------------------------+
```

### Translation Workflow

```
+-----------+     +-------------+     +------------+     +----------+
|           |     |             |     |            |     |          |
| Source EN |---->| Crowdin     |---->| Translators|---->| PR Review|
| (docs/)   |     | (Extract)   |     | (Human+AI) |     | (Merge)  |
|           |     |             |     |            |     |          |
+-----------+     +-------------+     +------------+     +----------+
```

### i18n Configuration (Astro/Fumadocs)

```typescript
// astro.config.mjs
export default defineConfig({
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'zh', 'ja', 'de'],
    routing: {
      prefixDefaultLocale: false, // docs.x2000.dev/ = English
    },
  },
});
```

### Content Structure

```
docs/
+-- en/                    # English (source of truth)
|   +-- getting-started/
|   +-- guides/
|   +-- api/
|
+-- es/                    # Spanish translations
|   +-- getting-started/
|   +-- guides/
|
+-- zh/                    # Chinese translations
    +-- getting-started/
    +-- guides/
```

---

## 9. Docs-as-Code Workflow

### Contribution Flow

```
+------------------------------------------------------------------+
|                    CONTRIBUTION WORKFLOW                          |
+------------------------------------------------------------------+
|                                                                   |
|   1. FORK & CLONE                                                 |
|      git clone https://github.com/user/x2000                      |
|                                                                   |
|   2. CREATE BRANCH                                                |
|      git checkout -b docs/improve-brain-guide                     |
|                                                                   |
|   3. EDIT DOCS (MDX)                                              |
|      - Edit in /docs folder                                       |
|      - Follow style guide                                         |
|      - Add examples                                               |
|                                                                   |
|   4. LOCAL PREVIEW                                                |
|      pnpm docs:dev    # Live reload at localhost:4000             |
|                                                                   |
|   5. SUBMIT PR                                                    |
|      - Auto-deploys preview URL                                   |
|      - Runs linting & link checking                               |
|      - Generates preview comment                                  |
|                                                                   |
|   6. REVIEW & MERGE                                               |
|      - Technical review                                           |
|      - Auto-deploys to production                                 |
|                                                                   |
+------------------------------------------------------------------+
```

### PR Documentation Check

```yaml
# .github/workflows/docs-check.yml
name: Documentation PR Check

on:
  pull_request:
    paths:
      - 'docs/**'
      - 'src/**/*.ts'

jobs:
  docs-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check for broken links
        uses: lycheeverse/lychee-action@v1
        with:
          args: --verbose --no-progress './docs/**/*.mdx'
          fail: true

      - name: Lint documentation
        run: pnpm docs:lint

      - name: Check style guide compliance
        uses: errata-ai/vale-action@v2
        with:
          files: docs/
          config: .vale.ini

      - name: Verify API docs are current
        run: |
          pnpm run docs:generate
          git diff --exit-code docs/api/

      - name: Build documentation
        run: pnpm docs:build

      - name: Deploy preview
        uses: cloudflare/pages-action@v1
        id: deploy
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: x2000-docs
          directory: docs/.output
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}

      - name: Comment preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `## Documentation Preview\n\nPreview: ${{ steps.deploy.outputs.url }}\n\nThis preview will be available until this PR is closed.`
            })
```

### Documentation Linting (Vale)

```ini
# .vale.ini
StylesPath = .vale/styles

MinAlertLevel = suggestion

Packages = Google, write-good, proselint

[*.mdx]
BasedOnStyles = Vale, Google, write-good
Google.Passive = suggestion
Google.Will = warning
Google.FirstPerson = NO  # "We" is okay in docs
write-good.E-Prime = NO

# X2000-specific rules
[formats]
mdx = md

# Custom vocabulary
Vocab = X2000

# Accept technical terms
X2000.Terms = YES
```

### Style Guide Enforcement

```
.vale/styles/X2000/
+-- Terms.yml           # Accepted terminology
+-- Branding.yml        # Brand name usage
+-- CodeStyle.yml       # Code example standards
+-- Headings.yml        # Heading conventions
```

---

## 10. Technology Stack

### Core Technologies

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Astro + Fumadocs | Fast, modern, excellent DX |
| **Content** | MDX | React components in Markdown |
| **Styling** | Tailwind CSS | Consistent, utility-first |
| **Search** | Typesense | Fast, typo-tolerant, vector support |
| **Embeddings** | OpenAI text-embedding-3-small | Cost-effective, high quality |
| **Playground** | Sandpack | In-browser code execution |
| **Hosting** | Cloudflare Pages | Edge-deployed, fast globally |
| **CI/CD** | GitHub Actions | Native integration |
| **i18n** | Crowdin | Translation management |
| **API Docs** | TypeDoc + custom | Auto-generated from source |

### Package.json Scripts

```json
{
  "scripts": {
    "docs:dev": "astro dev --config docs/astro.config.mjs",
    "docs:build": "astro build --config docs/astro.config.mjs",
    "docs:preview": "astro preview --config docs/astro.config.mjs",
    "docs:generate": "typedoc --options typedoc.json",
    "docs:lint": "vale docs/ && markdownlint docs/**/*.mdx",
    "docs:link-check": "lychee --verbose './docs/**/*.mdx'",
    "docs:index": "tsx scripts/index-search.ts",
    "docs:validate": "tsx scripts/validate-coverage.ts"
  }
}
```

---

## 11. Navigation and Discoverability

### Three-Column Layout (Stripe-Inspired)

```
+------------------------------------------------------------------+
|  X2000 Documentation                     [Search...] [v1.0]  [EN] |
+------------------------------------------------------------------+
|          |                                    |                   |
|  NAV     |         CONTENT                    |     ON THIS PAGE  |
|          |                                    |                   |
| Getting  | # Brain Tension Protocol           | - Overview        |
| Started  |                                    | - How It Works    |
|   > ...  | When multiple brains collaborate,  | - Configuration   |
|          | they debate to reach better        | - Examples        |
| Guides   | decisions.                         | - Best Practices  |
|   Brains |                                    |                   |
|   Memory | ## How It Works                    |                   |
|   Tools  |                                    |                   |
|   > ...  | ```typescript                      |                   |
|          | const debate = await ceo.debate({  |                   |
| API      |   topic: "Database choice",        |                   |
|   > ...  |   brains: ['engineering', 'data']  |                   |
|          | });                                |                   |
| Examples | ```                                |                   |
|   > ...  |                                    |                   |
|          |                                    |                   |
+------------------------------------------------------------------+
|  [Previous: Memory System]        [Next: Guardrails Overview]     |
+------------------------------------------------------------------+
```

### Navigation Features

1. **Persistent sidebar** - Always visible, collapsible on mobile
2. **Breadcrumbs** - Show current location in hierarchy
3. **On-this-page TOC** - Right column, highlights current section
4. **Prev/Next navigation** - Bottom of each page
5. **Quick links** - Frequently accessed pages in header
6. **Version switcher** - Dropdown in header
7. **Language switcher** - Dropdown in header

### Search Features

1. **Keyboard shortcut** - `Cmd+K` / `Ctrl+K` to open
2. **Instant results** - As-you-type with debouncing
3. **Semantic understanding** - "how do agents talk" finds "Brain Tension Protocol"
4. **Filters** - By category, version, type
5. **Recent searches** - Stored locally
6. **Popular searches** - Based on analytics

---

## 12. Metrics and Success Criteria

### Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Time to First Working Example** | < 5 minutes | User testing |
| **Search Success Rate** | > 90% | Click-through on first 3 results |
| **Documentation Coverage** | 100% public APIs | TypeDoc validation |
| **Page Load Time** | < 1.5s (LCP) | Lighthouse |
| **Broken Links** | 0 | CI/CD check |
| **Freshness** | < 24h from code change | Auto-generation pipeline |

### Analytics Implementation

```typescript
// Track key documentation events
trackEvent('doc_search', { query, results_count, clicked_result });
trackEvent('doc_example_run', { example_id, success });
trackEvent('doc_feedback', { page, helpful: boolean, comment });
trackEvent('doc_copy_code', { page, code_block_id });
```

---

## 13. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

- [ ] Set up Astro + Fumadocs project structure
- [ ] Configure TypeDoc for API generation
- [ ] Create base MDX components (Callout, CodeGroup, Playground)
- [ ] Implement three-column layout
- [ ] Set up Cloudflare Pages deployment

### Phase 2: Content Migration (Week 3-4)

- [ ] Write Getting Started guide
- [ ] Document all 6 MVP brains
- [ ] Create Memory System guide
- [ ] Create Guardrails guide
- [ ] Add 5+ interactive examples

### Phase 3: Search & AI (Week 5-6)

- [ ] Deploy Typesense cluster
- [ ] Implement embedding generation pipeline
- [ ] Build hybrid search API
- [ ] Create search UI component
- [ ] Add search analytics

### Phase 4: Polish (Week 7-8)

- [ ] Implement version support
- [ ] Add i18n infrastructure
- [ ] Set up contribution workflow
- [ ] Performance optimization
- [ ] User testing and iteration

---

## 14. Comparison: X2000 vs. OpenClaw Documentation

| Aspect | OpenClaw | X2000 |
|--------|----------|-------|
| **Production coverage** | "Shows the beach, forgets the sharks" | Dedicated production gotchas per feature |
| **API documentation** | Incomplete, manual | 100% auto-generated from TypeScript |
| **Interactive examples** | Static code blocks | Runnable Sandpack playgrounds |
| **Search** | Basic keyword | Hybrid keyword + semantic AI |
| **Versioning** | Unclear version mapping | Semantic versioning tied to releases |
| **Contributing** | Friction-heavy | PR-based with preview URLs |
| **Freshness** | Lags behind code | Auto-synced within 24h |
| **Error documentation** | "When something silently fails..." | Every error has a troubleshooting entry |
| **Dependency documentation** | "Required but undocumented files" | Complete dependency graphs |
| **Pre-flight checks** | Missing | Automated pre-flight validation |

**Bottom Line:** X2000 documentation is designed with production use in mind from day one, addressing every documented pain point from OpenClaw's approach.

---

## 15. Appendix: Component Library

### Available MDX Components

```mdx
<!-- Callouts -->
<Callout type="info|warning|error|tip">Content</Callout>

<!-- Code with tabs -->
<CodeGroup>
```typescript title="example.ts"
// TypeScript code
```
```python title="example.py"
# Python code
```
</CodeGroup>

<!-- Interactive playground -->
<Playground files={{"/index.ts": "code..."}} autorun={false} />

<!-- API endpoint -->
<Endpoint method="POST" path="/api/orchestrate" />

<!-- Prerequisites list -->
<Prerequisites>
- Requirement 1
- Requirement 2
</Prerequisites>

<!-- Version badge -->
<Version since="1.0.0" />

<!-- Feature comparison -->
<Comparison left="X2000" right="OpenClaw" />

<!-- Terminal simulator -->
<Terminal>
$ x2000 init my-project
Creating project...
Done!
</Terminal>
```

---

**Document Version:** 1.0
**Last Updated:** 2026-03-09
**Author:** X2000 Documentation Team

---

## Research Sources

This design document was informed by research from:

- [Stripe Documentation Best Practices](https://www.mintlify.com/blog/stripe-docs)
- [Vercel Documentation Architecture](https://vercel.com/templates/next.js/documents-simple-next-js-documentation)
- [Tailwind CSS Documentation Design](https://tailwindcss.com/docs)
- [Cloudflare Developer Documentation Rebuild](https://blog.cloudflare.com/new-dev-docs/)
- [TypeDoc Documentation Generator](https://typedoc.org/)
- [Sandpack Interactive Playground](https://sandpack.codesandbox.io/)
- [Typesense Semantic Search](https://typesense.org/docs/guide/semantic-search.html)
- [Docusaurus Versioning Best Practices](https://docusaurus.io/docs/versioning)
- [Mintlify Documentation Platform](https://www.mintlify.com/)
- [Docs-as-Code Workflow Guide](https://konghq.com/blog/learning-center/what-is-docs-as-code)
- [Fumadocs Framework](https://medium.com/frontendweb/nextra-fumadocs-docusaurus-or-content-layer-which-tool-to-choose-for-your-documentation-needs-c25548c794bc)
- [OpenClaw Production Issues Analysis](https://kaxo.io/insights/openclaw-production-gotchas/)
