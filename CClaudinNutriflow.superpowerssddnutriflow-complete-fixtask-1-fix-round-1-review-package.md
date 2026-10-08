diff --git a/docs/database-audit-report.md b/docs/database-audit-report.md
index 3cf6c0a..6c6833b 100644
--- a/docs/database-audit-report.md
+++ b/docs/database-audit-report.md
@@ -5,21 +5,21 @@
 ✅ Parsed schema: 15 tables found
 📂 Found 156 TypeScript files
 
 ✅ Audit complete!
    - Tables referenced: 16
    - Queries found: 150
    - Issues found: 5
 
 # Database Schema Audit Report
 
-**Generated:** 2026-10-08T10:20:29.941Z
+**Generated:** 2026-10-08T10:32:18.120Z
 **Files Scanned:** 156
 **Queries Found:** 150
 
 ## Summary
 
 - **Tables Referenced:** 16
 - **Issues Found:** 5
 
 ### Issue Breakdown
 
@@ -159,48 +159,20 @@ _No specific columns found (may use wildcard or relations)_
 
 ### `weight_logs`
 
 **Columns used:**
 
 - `created_at`
 - `id`
 - `recorded_at`
 - `weight`
 
-## Prioritized Fix List
-
-Based on the audit, these schema mismatches need to be resolved:
-
-### High Priority (Blocking Features)
-
-1. **Missing `profiles` columns for trial management**
-   - `trial_start_date` - Used in trial.ts service
-   - `trial_ended` - Used in trial.ts service
-   - **Impact:** Trial period management is broken
-   - **Action:** Add these columns to profiles table and regenerate types
-
-2. **Missing `payment_events` table**
-   - Used in stripe-webhooks.ts (lines 83, 100)
-   - **Impact:** Payment event tracking not working
-   - **Action:** Create payment_events table or update webhook code
-
-3. **Missing `purchase_events` table**
-   - Used in stripe-webhooks.ts (line 36)
-   - **Impact:** Purchase event tracking not working
-   - **Action:** Create purchase_events table or update webhook code
-
-### Observations
-
-- **`meal_plans.total_calories`** - This column DOES exist in types.ts and is being queried correctly (no issue found)
-- Most core functionality (patients, appointments, meal_plans) has correct schema alignment
-- Payment/billing infrastructure appears to be incomplete or outdated
-
 ## Critical Issues
 
 These issues are blocking or will cause runtime errors:
 
 ### 🔴 MISSING TABLE
 
 **File:** `src\server\stripe-webhooks.ts:36`
 **Table:** `purchase_events`
 **Message:** Table "purchase_events" not found in types.ts
 
diff --git a/scripts/audit-database-schema.ts b/scripts/audit-database-schema.ts
index 4876bef..5399e2c 100644
--- a/scripts/audit-database-schema.ts
+++ b/scripts/audit-database-schema.ts
@@ -44,90 +44,145 @@ function findTypeScriptFiles(dir: string, fileList: string[] = []): string[] {
     } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
       fileList.push(filePath);
     }
   }
 
   return fileList;
 }
 
 // Parse types.ts to extract schema information
 function parseSchema(typesPath: string): Map<string, Set<string>> {
-  const content = readFileSync(typesPath, 'utf-8');
+  let content: string;
+
+  try {
+    content = readFileSync(typesPath, 'utf-8');
+  } catch (error) {
+    console.error(`⚠️ Failed to read types file: ${typesPath}`);
+    console.error(error);
+    return new Map();
+  }
+
   const schema = new Map<string, Set<string>>();
 
   // Find the Tables section
   const tablesMatch = content.match(/Tables:\s*\{([\s\S]+?)^\s{4}\}/m);
   if (!tablesMatch) {
     console.error('⚠️ Could not find Tables section in types.ts');
     return schema;
   }
 
   const tablesContent = tablesMatch[1];
 
-  // Match each table definition
+  // Match each table definition with proper brace counting
   // Pattern: tablename: { Row: { ... } Insert: { ... } Update: { ... } Relationships: [...] }
-  const tablePattern = /(\w+):\s*\{\s*Row:\s*\{([^}]+)\}/g;
+  const tableNameRegex = /(\w+):\s*\{\s*Row:\s*\{/g;
   let match;
 
-  while ((match = tablePattern.exec(tablesContent)) !== null) {
+  while ((match = tableNameRegex.exec(tablesContent)) !== null) {
     const tableName = match[1];
-    const rowContent = match[2];
+    const startPos = match.index + match[0].length;
+
+    // Count braces to find the end of the Row object (handles nested objects)
+    let braceCount = 1;
+    let endPos = startPos;
+
+    while (endPos < tablesContent.length && braceCount > 0) {
+      if (tablesContent[endPos] === '{') braceCount++;
+      if (tablesContent[endPos] === '}') braceCount--;
+      endPos++;
+    }
+
+    const rowContent = tablesContent.substring(startPos, endPos - 1);
 
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
 
+// Helper function to parse select string with proper nesting support
+function parseSelectColumns(selectStr: string): string[] {
+  const columns: string[] = [];
+  let current = '';
+  let depth = 0;
+
+  for (let i = 0; i < selectStr.length; i++) {
+    const char = selectStr[i];
+
+    if (char === '(') {
+      depth++;
+      current += char;
+    } else if (char === ')') {
+      depth--;
+      current += char;
+    } else if (char === ',' && depth === 0) {
+      // Only split on commas at depth 0 (not inside nested relations)
+      if (current.trim()) {
+        columns.push(current.trim());
+      }
+      current = '';
+    } else {
+      current += char;
+    }
+  }
+
+  // Add the last column
+  if (current.trim()) {
+    columns.push(current.trim());
+  }
+
+  return columns;
+}
+
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
 
-      // Look for .select() in the same or following lines
+      // Look for .select() in the same or following lines (increased lookahead to 20 lines)
       let searchLine = i;
       let foundSelect = false;
 
-      while (searchLine < Math.min(i + 10, lines.length) && !foundSelect) {
+      while (searchLine < Math.min(i + 20, lines.length) && !foundSelect) {
         const selectMatch = lines[searchLine].match(/\.select\s*\(\s*['"]([^'"]+)['"]/);
         if (selectMatch) {
           foundSelect = true;
           const selectStr = selectMatch[1];
 
-          // Parse select string: 'col1, col2, table(col3, col4)'
-          const parts = selectStr.split(/,\s*/);
+          // Parse select string with proper nesting support
+          const parts = parseSelectColumns(selectStr);
           for (const part of parts) {
             // Handle nested selects like 'table(col1, col2)'
             const nestedMatch = part.match(/(\w+)\s*\(/);
             if (nestedMatch) {
               // This is a relation, skip for now
               continue;
             }
 
             // Handle column aliases like 'col as alias'
             const colMatch = part.match(/^(\w+)(?:\s+as\s+\w+)?$/);
@@ -175,21 +230,30 @@ function auditDatabase(srcDir: string, typesPath: string): DatabaseAuditReport {
     tables: [],
     columnsUsed: new Map(),
     issuesFound: [],
     filesScanned: files.length,
     queriesFound: 0
   };
 
   const tablesUsed = new Set<string>();
 
   for (const file of files) {
-    const content = readFileSync(file, 'utf-8');
+    let content: string;
+
+    try {
+      content = readFileSync(file, 'utf-8');
+    } catch (error) {
+      console.error(`⚠️ Failed to read file: ${relative(process.cwd(), file)}`);
+      console.error(error);
+      continue; // Skip this file and continue with the rest
+    }
+
     const queries = extractQueries(file, content);
 
     report.queriesFound += queries.length;
 
     for (const query of queries) {
       tablesUsed.add(query.table);
 
       // Initialize column set for this table if not exists
       if (!report.columnsUsed.has(query.table)) {
         report.columnsUsed.set(query.table, new Set());
