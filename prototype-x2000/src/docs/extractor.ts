/**
 * X2000 Documentation System - TypeDoc Extractor
 * Extracts types, functions, classes from TypeScript source code
 * Generates API reference from JSDoc comments
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative, basename, extname } from 'path';
import type {
  TypeDefinition,
  APIReference,
  TypeKind,
  Visibility,
  ParameterDef,
  PropertyDef,
  MethodDef,
  TypeParameterDef,
  EnumMemberDef,
  ThrownError,
  ImportInfo,
} from './types.js';

// ============================================================================
// Regular Expressions for Parsing
// ============================================================================

const JSDOC_PATTERN = /\/\*\*[\s\S]*?\*\//g;
const JSDOC_TAG_PATTERN = /@(\w+)(?:\s+\{([^}]+)\})?\s*([^\n@]*)/g;
const EXPORT_PATTERN = /^export\s+/m;
const CLASS_PATTERN = /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)(?:<([^>]+)>)?(?:\s+extends\s+([\w.]+)(?:<[^>]+>)?)?(?:\s+implements\s+([\w,\s.]+))?/;
const INTERFACE_PATTERN = /(?:export\s+)?interface\s+(\w+)(?:<([^>]+)>)?(?:\s+extends\s+([\w,\s.<>]+))?/;
const TYPE_PATTERN = /(?:export\s+)?type\s+(\w+)(?:<([^>]+)>)?\s*=\s*/;
const ENUM_PATTERN = /(?:export\s+)?(?:const\s+)?enum\s+(\w+)/;
const FUNCTION_PATTERN = /(?:export\s+)?(?:async\s+)?function\s+(\w+)(?:<([^>]+)>)?\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?/;
const CONST_PATTERN = /(?:export\s+)?const\s+(\w+)(?:\s*:\s*([^=]+))?\s*=/;
const METHOD_PATTERN = /(?:(public|protected|private)\s+)?(?:(static)\s+)?(?:(async)\s+)?(?:(abstract)\s+)?(\w+)(?:<([^>]+)>)?\s*\(([^)]*)\)(?:\s*:\s*([^{;]+))?/;
const PROPERTY_PATTERN = /(?:(public|protected|private)\s+)?(?:(static)\s+)?(?:(readonly)\s+)?(\w+)(\?)?\s*:\s*([^;=]+)/;
const IMPORT_PATTERN = /import\s+(?:type\s+)?(\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;

// ============================================================================
// TypeDoc Extractor Class
// ============================================================================

export class TypeDocExtractor {
  private sourceDir: string;
  private excludePatterns: string[];
  private excludePrivate: boolean;
  private excludeProtected: boolean;
  private excludeInternal: boolean;

  constructor(options: {
    sourceDir: string;
    excludePatterns?: string[];
    excludePrivate?: boolean;
    excludeProtected?: boolean;
    excludeInternal?: boolean;
  }) {
    this.sourceDir = options.sourceDir;
    this.excludePatterns = options.excludePatterns || ['node_modules', 'dist', '.test.', '.spec.'];
    this.excludePrivate = options.excludePrivate ?? true;
    this.excludeProtected = options.excludeProtected ?? false;
    this.excludeInternal = options.excludeInternal ?? true;
  }

  /**
   * Extract all type definitions from the source directory
   */
  async extractAll(): Promise<APIReference[]> {
    const files = this.findTypeScriptFiles(this.sourceDir);
    const references: APIReference[] = [];

    for (const file of files) {
      try {
        const reference = await this.extractFromFile(file);
        if (reference.types.length > 0 ||
            reference.functions.length > 0 ||
            reference.classes.length > 0 ||
            reference.interfaces.length > 0 ||
            reference.enums.length > 0 ||
            reference.constants.length > 0) {
          references.push(reference);
        }
      } catch (error) {
        console.error(`[Extractor] Error processing ${file}:`, error);
      }
    }

    // Build dependency graphs
    this.buildDependencyGraph(references);

    return references;
  }

  /**
   * Extract type definitions from a single file
   */
  async extractFromFile(filePath: string): Promise<APIReference> {
    const content = readFileSync(filePath, 'utf-8');
    const relativePath = relative(this.sourceDir, filePath);
    const moduleName = this.getModuleName(relativePath);

    const reference: APIReference = {
      id: this.generateId(relativePath),
      name: basename(filePath, extname(filePath)),
      sourceFile: relativePath,
      module: moduleName,
      types: [],
      functions: [],
      classes: [],
      interfaces: [],
      enums: [],
      constants: [],
      exports: [],
      imports: this.extractImports(content),
      dependencies: [],
      dependents: [],
    };

    // Extract JSDoc blocks with their associated code
    const blocks = this.extractDocBlocks(content);

    for (const block of blocks) {
      const definition = this.parseDefinition(block, relativePath);
      if (definition && this.shouldInclude(definition)) {
        this.categorizeDefinition(reference, definition);
        if (definition.exported) {
          reference.exports.push(definition.name);
        }
      }
    }

    // Extract description from file-level JSDoc
    reference.description = this.extractFileDescription(content);

    return reference;
  }

  /**
   * Find all TypeScript files in directory
   */
  private findTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];

    if (!existsSync(dir)) {
      return files;
    }

    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        if (!this.excludePatterns.some(p => entry.includes(p))) {
          files.push(...this.findTypeScriptFiles(fullPath));
        }
      } else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
        if (!this.excludePatterns.some(p => entry.includes(p))) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  /**
   * Extract documentation blocks with associated code
   */
  private extractDocBlocks(content: string): Array<{ jsdoc: string; code: string; line: number }> {
    const blocks: Array<{ jsdoc: string; code: string; line: number }> = [];
    const lines = content.split('\n');

    let currentJsdoc = '';
    let jsdocStartLine = 0;
    let inJsdoc = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('/**')) {
        inJsdoc = true;
        currentJsdoc = line;
        jsdocStartLine = i + 1;
      } else if (inJsdoc) {
        currentJsdoc += '\n' + line;
        if (line.includes('*/')) {
          inJsdoc = false;
          // Look for the next code line
          let codeLines = '';
          for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
            const codeLine = lines[j].trim();
            if (codeLine && !codeLine.startsWith('//') && !codeLine.startsWith('/*')) {
              codeLines += lines[j] + '\n';
              // Check if we have a complete definition
              if (this.isDefinitionStart(codeLine)) {
                // Continue reading for multi-line definitions
                let braceCount = (codeLine.match(/{/g) || []).length - (codeLine.match(/}/g) || []).length;
                let parenCount = (codeLine.match(/\(/g) || []).length - (codeLine.match(/\)/g) || []).length;
                let k = j + 1;
                while ((braceCount > 0 || parenCount > 0) && k < lines.length) {
                  codeLines += lines[k] + '\n';
                  braceCount += (lines[k].match(/{/g) || []).length - (lines[k].match(/}/g) || []).length;
                  parenCount += (lines[k].match(/\(/g) || []).length - (lines[k].match(/\)/g) || []).length;
                  k++;
                }
                break;
              }
            }
          }
          if (codeLines) {
            blocks.push({ jsdoc: currentJsdoc, code: codeLines, line: jsdocStartLine });
          }
          currentJsdoc = '';
        }
      }
    }

    // Also extract exported items without JSDoc
    const exportMatches = content.matchAll(/^export\s+((?:abstract\s+)?class|interface|type|(?:const\s+)?enum|(?:async\s+)?function|const)\s+(\w+)/gm);
    for (const match of exportMatches) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      // Check if this already has JSDoc
      const hasJsdoc = blocks.some(b => Math.abs(b.line - lineNum) < 3);
      if (!hasJsdoc) {
        blocks.push({ jsdoc: '', code: match[0], line: lineNum });
      }
    }

    return blocks;
  }

  /**
   * Check if a line starts a definition
   */
  private isDefinitionStart(line: string): boolean {
    return /^(export\s+)?(abstract\s+)?class\s+/.test(line) ||
           /^(export\s+)?interface\s+/.test(line) ||
           /^(export\s+)?type\s+/.test(line) ||
           /^(export\s+)?(const\s+)?enum\s+/.test(line) ||
           /^(export\s+)?(async\s+)?function\s+/.test(line) ||
           /^(export\s+)?const\s+\w+/.test(line);
  }

  /**
   * Parse a definition from JSDoc and code
   */
  private parseDefinition(block: { jsdoc: string; code: string; line: number }, sourceFile: string): TypeDefinition | null {
    const { jsdoc, code, line } = block;
    const tags = this.parseJsdocTags(jsdoc);

    // Determine the kind of definition
    let kind: TypeKind;
    let name: string;
    let match: RegExpMatchArray | null;

    if ((match = code.match(CLASS_PATTERN))) {
      kind = 'class';
      name = match[1];
    } else if ((match = code.match(INTERFACE_PATTERN))) {
      kind = 'interface';
      name = match[1];
    } else if ((match = code.match(TYPE_PATTERN))) {
      kind = 'type';
      name = match[1];
    } else if ((match = code.match(ENUM_PATTERN))) {
      kind = 'enum';
      name = match[1];
    } else if ((match = code.match(FUNCTION_PATTERN))) {
      kind = 'function';
      name = match[1];
    } else if ((match = code.match(CONST_PATTERN))) {
      kind = 'constant';
      name = match[1];
    } else {
      return null;
    }

    const definition: TypeDefinition = {
      id: this.generateId(`${sourceFile}:${name}`),
      name,
      kind,
      description: this.extractDescription(jsdoc),
      sourceFile,
      sourceLine: line,
      signature: this.extractSignature(code, kind),
      exported: EXPORT_PATTERN.test(code),
      deprecated: tags.has('deprecated'),
      deprecationMessage: tags.get('deprecated'),
      since: tags.get('since'),
      examples: this.extractExamples(jsdoc),
      see: tags.has('see') ? [tags.get('see')!] : undefined,
      tags: this.extractTags(tags),
    };

    // Parse kind-specific details
    switch (kind) {
      case 'class':
        this.parseClassDetails(definition, code, jsdoc);
        break;
      case 'interface':
        this.parseInterfaceDetails(definition, code, jsdoc);
        break;
      case 'function':
        this.parseFunctionDetails(definition, code, jsdoc, tags);
        break;
      case 'enum':
        this.parseEnumDetails(definition, code);
        break;
    }

    return definition;
  }

  /**
   * Parse JSDoc tags into a map
   */
  private parseJsdocTags(jsdoc: string): Map<string, string> {
    const tags = new Map<string, string>();
    let match: RegExpExecArray | null;

    const tagPattern = new RegExp(JSDOC_TAG_PATTERN.source, 'g');
    while ((match = tagPattern.exec(jsdoc)) !== null) {
      const tagName = match[1];
      const tagType = match[2] || '';
      const tagValue = match[3]?.trim() || '';
      tags.set(tagName, tagType ? `{${tagType}} ${tagValue}` : tagValue);
    }

    return tags;
  }

  /**
   * Extract main description from JSDoc
   */
  private extractDescription(jsdoc: string): string {
    if (!jsdoc) return '';

    // Remove the /** and */ markers
    let text = jsdoc.replace(/^\/\*\*\s*/, '').replace(/\s*\*\/$/, '');

    // Remove leading * from each line
    text = text.split('\n').map(line => line.replace(/^\s*\*\s?/, '')).join('\n');

    // Extract text before the first @tag
    const atIndex = text.indexOf('@');
    if (atIndex > 0) {
      text = text.substring(0, atIndex);
    }

    return text.trim();
  }

  /**
   * Extract examples from JSDoc
   */
  private extractExamples(jsdoc: string): string[] {
    const examples: string[] = [];
    const examplePattern = /@example\s*([\s\S]*?)(?=@\w|$|\*\/)/g;
    let match: RegExpExecArray | null;

    while ((match = examplePattern.exec(jsdoc)) !== null) {
      let example = match[1].trim();
      // Clean up the example
      example = example.split('\n').map(line => line.replace(/^\s*\*\s?/, '')).join('\n').trim();
      if (example) {
        examples.push(example);
      }
    }

    return examples;
  }

  /**
   * Extract tags from JSDoc tags map
   */
  private extractTags(tagsMap: Map<string, string>): string[] {
    const result: string[] = [];
    if (tagsMap.has('category')) result.push(tagsMap.get('category')!);
    if (tagsMap.has('module')) result.push(tagsMap.get('module')!);
    if (tagsMap.has('public')) result.push('public');
    if (tagsMap.has('internal')) result.push('internal');
    if (tagsMap.has('beta')) result.push('beta');
    if (tagsMap.has('alpha')) result.push('alpha');
    return result;
  }

  /**
   * Extract signature from code
   */
  private extractSignature(code: string, kind: TypeKind): string {
    const lines = code.split('\n');
    let signature = lines[0].trim();

    // For multi-line signatures, continue until we find the opening brace or =
    if (kind === 'class' || kind === 'interface') {
      const braceIndex = signature.indexOf('{');
      if (braceIndex > 0) {
        signature = signature.substring(0, braceIndex).trim();
      }
    } else if (kind === 'type') {
      // Include the full type definition
      signature = code.trim().replace(/;\s*$/, '');
    } else if (kind === 'function') {
      const braceIndex = signature.indexOf('{');
      if (braceIndex > 0) {
        signature = signature.substring(0, braceIndex).trim();
      }
    }

    return signature;
  }

  /**
   * Parse class-specific details
   */
  private parseClassDetails(definition: TypeDefinition, code: string, jsdoc: string): void {
    const match = code.match(CLASS_PATTERN);
    if (!match) return;

    // Type parameters
    if (match[2]) {
      definition.typeParameters = this.parseTypeParameters(match[2]);
    }

    // Extends
    if (match[3]) {
      definition.extends = [match[3]];
    }

    // Implements
    if (match[4]) {
      definition.implements = match[4].split(',').map(s => s.trim());
    }

    // Parse properties and methods from class body
    definition.properties = this.parseClassProperties(code);
    definition.methods = this.parseClassMethods(code);
    definition.constructors = this.parseConstructors(code);
  }

  /**
   * Parse interface-specific details
   */
  private parseInterfaceDetails(definition: TypeDefinition, code: string, jsdoc: string): void {
    const match = code.match(INTERFACE_PATTERN);
    if (!match) return;

    // Type parameters
    if (match[2]) {
      definition.typeParameters = this.parseTypeParameters(match[2]);
    }

    // Extends
    if (match[3]) {
      definition.extends = match[3].split(',').map(s => s.trim());
    }

    // Parse properties from interface body
    definition.properties = this.parseInterfaceProperties(code);
    definition.methods = this.parseInterfaceMethods(code);
  }

  /**
   * Parse function-specific details
   */
  private parseFunctionDetails(definition: TypeDefinition, code: string, jsdoc: string, tags: Map<string, string>): void {
    const match = code.match(FUNCTION_PATTERN);
    if (!match) return;

    // Type parameters
    if (match[2]) {
      definition.typeParameters = this.parseTypeParameters(match[2]);
    }

    // Create a method definition for the function
    const methodDef: MethodDef = {
      name: definition.name,
      signature: definition.signature,
      description: definition.description,
      visibility: 'public',
      static: false,
      async: code.includes('async function'),
      abstract: false,
      parameters: this.parseParameters(match[3] || ''),
      returnType: match[4]?.trim() || 'void',
      examples: definition.examples,
    };

    // Parse @param tags
    this.parseParamTags(jsdoc, methodDef.parameters);

    // Parse @returns tag
    const returnsMatch = jsdoc.match(/@returns?\s+(?:\{([^}]+)\}\s+)?(.+)/);
    if (returnsMatch) {
      methodDef.returnDescription = returnsMatch[2]?.trim();
    }

    // Parse @throws tags
    methodDef.throws = this.parseThrowsTags(jsdoc);

    definition.methods = [methodDef];
  }

  /**
   * Parse enum-specific details
   */
  private parseEnumDetails(definition: TypeDefinition, code: string): void {
    const members: EnumMemberDef[] = [];
    const memberPattern = /(\w+)\s*=\s*(['"]?[^,}\n]+['"]?)/g;
    let match: RegExpExecArray | null;

    while ((match = memberPattern.exec(code)) !== null) {
      let value: string | number = match[2].trim();
      // Try to parse as number
      if (!isNaN(Number(value))) {
        value = Number(value);
      } else {
        // Remove quotes
        value = value.replace(/^['"]|['"]$/g, '');
      }
      members.push({ name: match[1], value });
    }

    definition.members = members;
  }

  /**
   * Parse type parameters
   */
  private parseTypeParameters(params: string): TypeParameterDef[] {
    return params.split(',').map(p => {
      const parts = p.trim().split(/\s+extends\s+/);
      const nameDefault = parts[0].split(/\s*=\s*/);
      return {
        name: nameDefault[0].trim(),
        constraint: parts[1]?.trim(),
        default: nameDefault[1]?.trim(),
      };
    });
  }

  /**
   * Parse function/method parameters
   */
  private parseParameters(params: string): ParameterDef[] {
    if (!params.trim()) return [];

    const result: ParameterDef[] = [];
    let current = '';
    let depth = 0;

    for (const char of params) {
      if (char === '<' || char === '(' || char === '{' || char === '[') depth++;
      else if (char === '>' || char === ')' || char === '}' || char === ']') depth--;
      else if (char === ',' && depth === 0) {
        if (current.trim()) {
          result.push(this.parseParameter(current.trim()));
        }
        current = '';
        continue;
      }
      current += char;
    }

    if (current.trim()) {
      result.push(this.parseParameter(current.trim()));
    }

    return result;
  }

  /**
   * Parse a single parameter
   */
  private parseParameter(param: string): ParameterDef {
    const rest = param.startsWith('...');
    if (rest) param = param.substring(3);

    const optional = param.includes('?');
    param = param.replace('?', '');

    const [nameWithDefault, type] = param.split(':').map(s => s.trim());
    const [name, defaultValue] = nameWithDefault.split('=').map(s => s.trim());

    return {
      name,
      type: type || 'unknown',
      optional: optional || defaultValue !== undefined,
      defaultValue,
      rest,
    };
  }

  /**
   * Parse class properties
   */
  private parseClassProperties(code: string): PropertyDef[] {
    const properties: PropertyDef[] = [];
    const lines = code.split('\n');

    for (const line of lines) {
      const match = line.match(PROPERTY_PATTERN);
      if (match && !line.includes('(')) {
        const prop: PropertyDef = {
          name: match[4],
          type: match[6].trim(),
          visibility: (match[1] as Visibility) || 'public',
          static: !!match[2],
          readonly: !!match[3],
          optional: !!match[5],
        };

        if (this.shouldIncludeProperty(prop)) {
          properties.push(prop);
        }
      }
    }

    return properties;
  }

  /**
   * Parse class methods
   */
  private parseClassMethods(code: string): MethodDef[] {
    const methods: MethodDef[] = [];
    const methodBlocks = this.extractMethodBlocks(code);

    for (const block of methodBlocks) {
      const match = block.code.match(METHOD_PATTERN);
      if (match && match[5] !== 'constructor') {
        const method: MethodDef = {
          name: match[5],
          signature: this.extractMethodSignature(block.code),
          visibility: (match[1] as Visibility) || 'public',
          static: !!match[2],
          async: !!match[3],
          abstract: !!match[4],
          parameters: this.parseParameters(match[7] || ''),
          returnType: match[8]?.trim() || 'void',
        };

        if (block.jsdoc) {
          method.description = this.extractDescription(block.jsdoc);
          method.examples = this.extractExamples(block.jsdoc);
          this.parseParamTags(block.jsdoc, method.parameters);
          method.throws = this.parseThrowsTags(block.jsdoc);

          const returnsMatch = block.jsdoc.match(/@returns?\s+(?:\{([^}]+)\}\s+)?(.+)/);
          if (returnsMatch) {
            method.returnDescription = returnsMatch[2]?.trim();
          }
        }

        if (this.shouldIncludeMethod(method)) {
          methods.push(method);
        }
      }
    }

    return methods;
  }

  /**
   * Parse constructors from class
   */
  private parseConstructors(code: string): MethodDef[] {
    const constructors: MethodDef[] = [];
    const constructorPattern = /constructor\s*\(([^)]*)\)/;
    const match = code.match(constructorPattern);

    if (match) {
      constructors.push({
        name: 'constructor',
        signature: `constructor(${match[1]})`,
        visibility: 'public',
        static: false,
        async: false,
        abstract: false,
        parameters: this.parseParameters(match[1] || ''),
        returnType: 'void',
      });
    }

    return constructors;
  }

  /**
   * Parse interface properties
   */
  private parseInterfaceProperties(code: string): PropertyDef[] {
    const properties: PropertyDef[] = [];
    const braceStart = code.indexOf('{');
    const braceEnd = code.lastIndexOf('}');

    if (braceStart < 0 || braceEnd < 0) return properties;

    const body = code.substring(braceStart + 1, braceEnd);
    const lines = body.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;

      // Skip methods (contain parentheses before colon)
      if (/\w+\s*\([^)]*\)\s*:/.test(trimmed)) continue;

      const match = trimmed.match(/(\w+)(\?)?\s*:\s*([^;]+)/);
      if (match) {
        properties.push({
          name: match[1],
          type: match[3].trim(),
          visibility: 'public',
          static: false,
          readonly: false,
          optional: !!match[2],
        });
      }
    }

    return properties;
  }

  /**
   * Parse interface methods
   */
  private parseInterfaceMethods(code: string): MethodDef[] {
    const methods: MethodDef[] = [];
    const braceStart = code.indexOf('{');
    const braceEnd = code.lastIndexOf('}');

    if (braceStart < 0 || braceEnd < 0) return methods;

    const body = code.substring(braceStart + 1, braceEnd);
    const methodPattern = /(\w+)\s*(?:<([^>]+)>)?\s*\(([^)]*)\)\s*:\s*([^;]+)/g;
    let match: RegExpExecArray | null;

    while ((match = methodPattern.exec(body)) !== null) {
      methods.push({
        name: match[1],
        signature: match[0],
        visibility: 'public',
        static: false,
        async: false,
        abstract: false,
        parameters: this.parseParameters(match[3] || ''),
        returnType: match[4].trim(),
      });
    }

    return methods;
  }

  /**
   * Extract method blocks with JSDoc
   */
  private extractMethodBlocks(code: string): Array<{ jsdoc: string; code: string }> {
    const blocks: Array<{ jsdoc: string; code: string }> = [];
    const lines = code.split('\n');

    let currentJsdoc = '';
    let inJsdoc = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('/**')) {
        inJsdoc = true;
        currentJsdoc = line;
      } else if (inJsdoc) {
        currentJsdoc += '\n' + line;
        if (line.includes('*/')) {
          inJsdoc = false;
        }
      } else if (currentJsdoc && /^\s*(public|protected|private|static|async|abstract|\w+\s*[(<])/.test(line)) {
        blocks.push({ jsdoc: currentJsdoc, code: line });
        currentJsdoc = '';
      } else if (!inJsdoc && !currentJsdoc && /^\s*(public|protected|private|static|async|abstract|\w+\s*[(<])/.test(line)) {
        blocks.push({ jsdoc: '', code: line });
      }
    }

    return blocks;
  }

  /**
   * Extract method signature
   */
  private extractMethodSignature(code: string): string {
    const match = code.match(/^[^{]+/);
    return match ? match[0].trim() : code.trim();
  }

  /**
   * Parse @param tags and add to parameters
   */
  private parseParamTags(jsdoc: string, params: ParameterDef[]): void {
    const paramPattern = /@param\s+(?:\{([^}]+)\}\s+)?(\[?\w+\]?)\s*-?\s*(.+)?/g;
    let match: RegExpExecArray | null;

    while ((match = paramPattern.exec(jsdoc)) !== null) {
      const paramName = match[2].replace(/[\[\]]/g, '');
      const param = params.find(p => p.name === paramName);
      if (param) {
        param.description = match[3]?.trim();
        if (match[1]) {
          param.type = match[1];
        }
      }
    }
  }

  /**
   * Parse @throws tags
   */
  private parseThrowsTags(jsdoc: string): ThrownError[] {
    const errors: ThrownError[] = [];
    const throwsPattern = /@throws\s+(?:\{([^}]+)\}\s+)?(.+)/g;
    let match: RegExpExecArray | null;

    while ((match = throwsPattern.exec(jsdoc)) !== null) {
      errors.push({
        type: match[1] || 'Error',
        description: match[2]?.trim() || '',
      });
    }

    return errors;
  }

  /**
   * Extract imports from file
   */
  private extractImports(content: string): ImportInfo[] {
    const imports: ImportInfo[] = [];
    const importPattern = new RegExp(IMPORT_PATTERN.source, 'g');
    let match: RegExpExecArray | null;

    while ((match = importPattern.exec(content)) !== null) {
      const isTypeOnly = content.substring(Math.max(0, match.index - 10), match.index).includes('type');
      let importNames: string[];

      if (match[1].startsWith('{')) {
        importNames = match[1]
          .replace(/[{}]/g, '')
          .split(',')
          .map(s => s.trim().split(/\s+as\s+/)[0]);
      } else if (match[1].startsWith('*')) {
        importNames = [match[1]];
      } else {
        importNames = [match[1]];
      }

      imports.push({
        module: match[2],
        imports: importNames,
        isTypeOnly,
      });
    }

    return imports;
  }

  /**
   * Extract file-level description
   */
  private extractFileDescription(content: string): string | undefined {
    const firstJsdoc = content.match(/^\/\*\*[\s\S]*?\*\//);
    if (firstJsdoc) {
      const desc = this.extractDescription(firstJsdoc[0]);
      // Only return if it looks like a file description (not a type description)
      if (desc && !/@(class|interface|function|type|enum)/.test(firstJsdoc[0])) {
        return desc;
      }
    }
    return undefined;
  }

  /**
   * Build dependency graph between references
   */
  private buildDependencyGraph(references: APIReference[]): void {
    const moduleMap = new Map<string, APIReference>();

    for (const ref of references) {
      moduleMap.set(ref.sourceFile, ref);
      moduleMap.set(ref.module, ref);
    }

    for (const ref of references) {
      for (const imp of ref.imports) {
        // Resolve relative imports
        let modulePath = imp.module;
        if (modulePath.startsWith('.')) {
          modulePath = join(ref.sourceFile, '..', modulePath).replace(/\\/g, '/');
          if (!modulePath.endsWith('.ts')) {
            modulePath += '.ts';
          }
        }

        const dependency = moduleMap.get(modulePath) || moduleMap.get(imp.module);
        if (dependency && dependency !== ref) {
          if (!ref.dependencies.includes(dependency.id)) {
            ref.dependencies.push(dependency.id);
          }
          if (!dependency.dependents.includes(ref.id)) {
            dependency.dependents.push(ref.id);
          }
        }
      }
    }
  }

  /**
   * Generate a unique ID
   */
  private generateId(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Get module name from file path
   */
  private getModuleName(filePath: string): string {
    return filePath
      .replace(/\.ts$/, '')
      .replace(/\/index$/, '')
      .replace(/\\/g, '/');
  }

  /**
   * Check if a definition should be included
   */
  private shouldInclude(definition: TypeDefinition): boolean {
    if (this.excludeInternal && definition.tags?.includes('internal')) {
      return false;
    }
    return definition.exported;
  }

  /**
   * Check if a property should be included
   */
  private shouldIncludeProperty(prop: PropertyDef): boolean {
    if (this.excludePrivate && prop.visibility === 'private') return false;
    if (this.excludeProtected && prop.visibility === 'protected') return false;
    return true;
  }

  /**
   * Check if a method should be included
   */
  private shouldIncludeMethod(method: MethodDef): boolean {
    if (this.excludePrivate && method.visibility === 'private') return false;
    if (this.excludeProtected && method.visibility === 'protected') return false;
    return true;
  }

  /**
   * Categorize a definition into the appropriate array
   */
  private categorizeDefinition(reference: APIReference, definition: TypeDefinition): void {
    switch (definition.kind) {
      case 'class':
        reference.classes.push(definition);
        reference.types.push(definition);
        break;
      case 'interface':
        reference.interfaces.push(definition);
        reference.types.push(definition);
        break;
      case 'type':
        reference.types.push(definition);
        break;
      case 'enum':
        reference.enums.push(definition);
        reference.types.push(definition);
        break;
      case 'function':
        reference.functions.push(definition);
        break;
      case 'constant':
      case 'variable':
        reference.constants.push(definition);
        break;
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let extractorInstance: TypeDocExtractor | null = null;

/**
 * Get or create the TypeDoc extractor
 */
export function getExtractor(options?: {
  sourceDir: string;
  excludePatterns?: string[];
  excludePrivate?: boolean;
  excludeProtected?: boolean;
  excludeInternal?: boolean;
}): TypeDocExtractor {
  if (!extractorInstance && options) {
    extractorInstance = new TypeDocExtractor(options);
  } else if (!extractorInstance) {
    extractorInstance = new TypeDocExtractor({
      sourceDir: process.cwd() + '/src',
    });
  }
  return extractorInstance;
}

/**
 * Extract all types from a source directory
 */
export async function extractTypes(sourceDir: string): Promise<APIReference[]> {
  const extractor = new TypeDocExtractor({ sourceDir });
  return extractor.extractAll();
}
