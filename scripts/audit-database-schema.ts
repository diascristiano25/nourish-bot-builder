#!/usr/bin/env tsx
/**
 * Database Schema Audit Script
 *
 * Scans all TypeScript files in src/ to find Supabase queries and compares
 * them against the types in src/integrations/supabase/types.ts to identify
 * schema mismatches.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

// Types for audit results
interface SchemaIssue {
  type: 'missing_column' | 'missing_table' | 'type_mismatch' | 'unknown_reference';
  severity: 'critical' | 'warning' | 'info';
  file: string;
  line: number;
  table: string;
  column?: string;
  message: string;
}

interface DatabaseAuditReport {
  tables: string[];
  columnsUsed: Map<string, Set<string>>;
  issuesFound: SchemaIssue[];
  filesScanned: number;
  queriesFound: number;
}

// Recursively find all .ts and .tsx files
function findTypeScriptFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git')) {
        findTypeScriptFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

// Parse types.ts to extract schema information
function parseSchema(typesPath: string): Map<string, Set<string>> {
  let content: string;

  try {
    content = readFileSync(typesPath, 'utf-8');
  } catch (error) {
    console.error(`⚠️ Failed to read types file: ${typesPath}`);
    console.error(error);
    return new Map();
  }

  const schema = new Map<string, Set<string>>();

  // Find the second public schema (first one is empty with [_ in never]: never)
  // Look for public schema that contains actual table definitions
  const publicSchemasRegex = /public:\s*\{\s*Tables:\s*\{/g;
  const matches = [...content.matchAll(publicSchemasRegex)];

  if (matches.length < 2) {
    console.error('⚠️ Could not find second public.Tables section in types.ts');
    return schema;
  }

  // Get content starting from the second public.Tables
  const secondPublicStart = matches[1].index! + matches[1][0].length;
  const contentFromSecondPublic = content.substring(secondPublicStart);

  // Extract everything until the closing brace for Tables
  const tablesEndMatch = contentFromSecondPublic.match(/^\s{6}\}/m);
  if (!tablesEndMatch) {
    console.error('⚠️ Could not find end of Tables section');
    return schema;
  }

  const tablesContent = contentFromSecondPublic.substring(0, tablesEndMatch.index);

  // Match each table definition with proper brace counting
  // Pattern: tablename: { Row: { ... } Insert: { ... } Update: { ... } Relationships: [...] }
  const tableNameRegex = /(\w+):\s*\{\s*Row:\s*\{/g;
  let match;

  while ((match = tableNameRegex.exec(tablesContent)) !== null) {
    const tableName = match[1];
    const startPos = match.index + match[0].length;

    // Count braces to find the end of the Row object (handles nested objects)
    let braceCount = 1;
    let endPos = startPos;

    while (endPos < tablesContent.length && braceCount > 0) {
      if (tablesContent[endPos] === '{') braceCount++;
      if (tablesContent[endPos] === '}') braceCount--;
      endPos++;
    }

    const rowContent = tablesContent.substring(startPos, endPos - 1);

    // Extract column names from Row type
    // Pattern: column_name: type
    const columnRegex = /^\s*(\w+):\s*/gm;
    const columns = new Set<string>();
    let colMatch;

    while ((colMatch = columnRegex.exec(rowContent)) !== null) {
      columns.add(colMatch[1]);
    }

    if (columns.size > 0) {
      schema.set(tableName, columns);
    }
  }

  return schema;
}

// Helper function to parse select string with proper nesting support
function parseSelectColumns(selectStr: string): string[] {
  const columns: string[] = [];
  let current = '';
  let depth = 0;

  for (let i = 0; i < selectStr.length; i++) {
    const char = selectStr[i];

    if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      // Only split on commas at depth 0 (not inside nested relations)
      if (current.trim()) {
        columns.push(current.trim());
      }
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last column
  if (current.trim()) {
    columns.push(current.trim());
  }

  return columns;
}

// Extract Supabase queries from a file
function extractQueries(filePath: string, content: string): Array<{
  line: number;
  table: string;
  columns: string[];
  operation: string;
}> {
  const queries: Array<{ line: number; table: string; columns: string[]; operation: string }> = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match .from('table') or .from("table")
    const fromMatch = line.match(/\.from\s*\(\s*['"](\w+)['"]\s*\)/);
    if (fromMatch) {
      const table = fromMatch[1];
      const columns: string[] = [];

      // Look for .select() in the same or following lines (increased lookahead to 20 lines)
      let searchLine = i;
      let foundSelect = false;

      while (searchLine < Math.min(i + 20, lines.length) && !foundSelect) {
        const selectMatch = lines[searchLine].match(/\.select\s*\(\s*['"]([^'"]+)['"]/);
        if (selectMatch) {
          foundSelect = true;
          const selectStr = selectMatch[1];

          // Parse select string with proper nesting support
          const parts = parseSelectColumns(selectStr);
          for (const part of parts) {
            // Handle nested selects like 'table(col1, col2)'
            const nestedMatch = part.match(/(\w+)\s*\(/);
            if (nestedMatch) {
              // This is a relation, skip for now
              continue;
            }

            // Handle column aliases like 'col as alias'
            const colMatch = part.match(/^(\w+)(?:\s+as\s+\w+)?$/);
            if (colMatch) {
              columns.push(colMatch[1]);
            } else if (part.trim() === '*') {
              columns.push('*');
            }
          }
        }
        searchLine++;
      }

      queries.push({
        line: i + 1,
        table,
        columns,
        operation: 'select'
      });
    }

    // Note: We intentionally skip parsing .insert() and .update() data objects
    // because they are too complex and error-prone to parse reliably.
    // Type checking at compile time via TypeScript catches these mismatches.
  }

  return queries;
}

// Main audit function
function auditDatabase(srcDir: string, typesPath: string): DatabaseAuditReport {
  console.error(`📋 Starting database schema audit...`);
  console.error(`📁 Source directory: ${srcDir}`);
  console.error(`📄 Types file: ${typesPath}`);
  console.error('');

  const schema = parseSchema(typesPath);
  console.error(`✅ Parsed schema: ${schema.size} tables found`);

  const files = findTypeScriptFiles(srcDir);
  console.error(`📂 Found ${files.length} TypeScript files`);
  console.error('');

  const report: DatabaseAuditReport = {
    tables: [],
    columnsUsed: new Map(),
    issuesFound: [],
    filesScanned: files.length,
    queriesFound: 0
  };

  const tablesUsed = new Set<string>();

  for (const file of files) {
    let content: string;

    try {
      content = readFileSync(file, 'utf-8');
    } catch (error) {
      console.error(`⚠️ Failed to read file: ${relative(process.cwd(), file)}`);
      console.error(error);
      continue; // Skip this file and continue with the rest
    }

    const queries = extractQueries(file, content);

    report.queriesFound += queries.length;

    for (const query of queries) {
      tablesUsed.add(query.table);

      // Initialize column set for this table if not exists
      if (!report.columnsUsed.has(query.table)) {
        report.columnsUsed.set(query.table, new Set());
      }

      // Check if table exists in schema
      if (!schema.has(query.table)) {
        report.issuesFound.push({
          type: 'missing_table',
          severity: 'critical',
          file: relative(process.cwd(), file),
          line: query.line,
          table: query.table,
          message: `Table "${query.table}" not found in types.ts`
        });
        continue;
      }

      const tableColumns = schema.get(query.table)!;

      // Check columns
      for (const col of query.columns) {
        if (col === '*') continue; // Wildcard is always valid

        report.columnsUsed.get(query.table)!.add(col);

        if (!tableColumns.has(col)) {
          report.issuesFound.push({
            type: 'missing_column',
            severity: 'critical',
            file: relative(process.cwd(), file),
            line: query.line,
            table: query.table,
            column: col,
            message: `Column "${query.table}.${col}" not found in types.ts`
          });
        }
      }
    }
  }

  report.tables = Array.from(tablesUsed).sort();

  console.error(`✅ Audit complete!`);
  console.error(`   - Tables referenced: ${report.tables.length}`);
  console.error(`   - Queries found: ${report.queriesFound}`);
  console.error(`   - Issues found: ${report.issuesFound.length}`);
  console.error('');

  return report;
}

// Generate markdown report
function generateReport(report: DatabaseAuditReport): string {
  const lines: string[] = [];

  lines.push('# Database Schema Audit Report');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Files Scanned:** ${report.filesScanned}`);
  lines.push(`**Queries Found:** ${report.queriesFound}`);
  lines.push('');

  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Tables Referenced:** ${report.tables.length}`);
  lines.push(`- **Issues Found:** ${report.issuesFound.length}`);
  lines.push('');

  if (report.issuesFound.length > 0) {
    const critical = report.issuesFound.filter(i => i.severity === 'critical');
    const warnings = report.issuesFound.filter(i => i.severity === 'warning');

    lines.push(`### Issue Breakdown`);
    lines.push('');
    lines.push(`- 🔴 **Critical:** ${critical.length}`);
    lines.push(`- 🟡 **Warnings:** ${warnings.length}`);
    lines.push('');
  }

  lines.push('## Tables Referenced in Code');
  lines.push('');

  for (const table of report.tables) {
    const columns = report.columnsUsed.get(table);
    lines.push(`### \`${table}\``);
    lines.push('');

    if (columns && columns.size > 0) {
      lines.push('**Columns used:**');
      lines.push('');
      const sortedCols = Array.from(columns).sort();
      for (const col of sortedCols) {
        lines.push(`- \`${col}\``);
      }
    } else {
      lines.push('_No specific columns found (may use wildcard or relations)_');
    }

    lines.push('');
  }

  if (report.issuesFound.length > 0) {
    lines.push('## Critical Issues');
    lines.push('');

    const critical = report.issuesFound.filter(i => i.severity === 'critical');

    if (critical.length > 0) {
      lines.push('These issues are blocking or will cause runtime errors:');
      lines.push('');

      for (const issue of critical) {
        lines.push(`### 🔴 ${issue.type.replace(/_/g, ' ').toUpperCase()}`);
        lines.push('');
        lines.push(`**File:** \`${issue.file}:${issue.line}\``);
        lines.push(`**Table:** \`${issue.table}\``);
        if (issue.column) {
          lines.push(`**Column:** \`${issue.column}\``);
        }
        lines.push(`**Message:** ${issue.message}`);
        lines.push('');
      }
    }

    const warnings = report.issuesFound.filter(i => i.severity === 'warning');

    if (warnings.length > 0) {
      lines.push('## Warnings');
      lines.push('');
      lines.push('These issues should be reviewed but may not block functionality:');
      lines.push('');

      for (const issue of warnings) {
        lines.push(`### 🟡 ${issue.type.replace(/_/g, ' ').toUpperCase()}`);
        lines.push('');
        lines.push(`**File:** \`${issue.file}:${issue.line}\``);
        lines.push(`**Table:** \`${issue.table}\``);
        if (issue.column) {
          lines.push(`**Column:** \`${issue.column}\``);
        }
        lines.push(`**Message:** ${issue.message}`);
        lines.push('');
      }
    }
  } else {
    lines.push('## ✅ No Issues Found');
    lines.push('');
    lines.push('All tables and columns referenced in the code match the schema in types.ts.');
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('_This report was automatically generated by `scripts/audit-database-schema.ts`_');
  lines.push('');

  return lines.join('\n');
}

// Main execution
const srcDir = join(process.cwd(), 'src');
const typesPath = join(process.cwd(), 'src', 'integrations', 'supabase', 'types.ts');

const report = auditDatabase(srcDir, typesPath);
const markdown = generateReport(report);

console.log(markdown);
