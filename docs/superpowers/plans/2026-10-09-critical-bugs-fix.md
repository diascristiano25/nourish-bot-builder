# NutriFlow Critical Bugs Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all critical bugs preventing core features from working: age calculation, water logs monitoring, and meal plan generation.

**Architecture:** Bug fixes across frontend components and Edge Function. All changes are surgical corrections to existing code without architectural changes.

**Tech Stack:** React + TypeScript (frontend), Deno + Supabase (Edge Function)

**Spec:** Based on bug reports showing:
- Age displays "2025 anos" due to future birth_date
- water_logs queries using wrong column name (user_id vs patient_id)
- Edge Function returning non-2xx errors

## Global Constraints

- Maintain existing component interfaces
- Follow existing code patterns
- Keep all existing functionality working
- Validate all date calculations
- Use patient_id consistently across all water_logs queries

## Review Focus

1. **Future dates:** When birth_date is in the future, age calculation should return null or 0, not negative/large numbers
2. **Column mismatch:** All water_logs queries must use patient_id (not user_id)
3. **Edge Function errors:** Must return detailed error messages for debugging
4. **Data validation:** Invalid dates should be handled gracefully without crashing
5. **Query consistency:** All monitoring components must use the same water_logs schema

---

### Task 1: Fix Age Calculation Validation

**Files:**
- Modify: `src/pages/PatientDetail.tsx:521-523`
- Modify: `src/pages/GenerateMealPlan.tsx:115,150,228`

**Interfaces:**
- Consumes: patient.birth_date (string | null)
- Produces: age (number | null) - validated, never negative

- [ ] **Step 1: Add age validation helper in PatientDetail.tsx**

Replace lines 521-523 with:
```typescript
const calculateAge = (birthDate: string | null): number | null => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  
  // Validate birth date is not in the future
  if (birth > today) {
    console.warn('Birth date is in the future:', birthDate);
    return null;
  }
  
  const age = differenceInYears(today, birth);
  
  // Validate age is reasonable
  if (age < 0 || age > 150) {
    console.warn('Invalid age calculated:', age);
    return null;
  }
  
  return age;
};

const age = calculateAge(patient?.birth_date);
```

- [ ] **Step 2: Verify age displays correctly in UI**

Check line 573 renders "Idade não informada" when age is null

- [ ] **Step 3: Add same validation to GenerateMealPlan.tsx calculateBMR()**

Replace line 115 with:
```typescript
const birth = new Date(patient.birth_date);
const today = new Date();
if (birth > today) return null;
const age = differenceInYears(today, birth);
```

- [ ] **Step 4: Add validation to age calculation at lines 150 and 228**

Replace both with:
```typescript
const age = patient.birth_date ? (() => {
  const birth = new Date(patient.birth_date);
  const today = new Date();
  if (birth > today) return null;
  const calculated = differenceInYears(today, birth);
  return calculated >= 0 && calculated <= 150 ? calculated : null;
})() : null;
```

- [ ] **Step 5: Commit age validation fixes**

```bash
git add src/pages/PatientDetail.tsx src/pages/GenerateMealPlan.tsx
git commit -m "fix: validate birth_date and handle future dates in age calculation"
```

---

### Task 2: Fix Water Logs Column Names

**Files:**
- Modify: `src/components/monitoring/PatientMonitoringTab.tsx:84`
- Modify: `src/components/monitoring/PatientProgressTab.tsx:73`

**Interfaces:**
- Consumes: patientId (string)
- Produces: water_logs queries using correct patient_id column

- [ ] **Step 1: Fix PatientMonitoringTab.tsx line 84**

Replace:
```typescript
.eq('user_id', patientId)
```
With:
```typescript
.eq('patient_id', patientId)
```

- [ ] **Step 2: Fix PatientProgressTab.tsx line 73**

Replace:
```typescript
.eq('user_id', patientId)
```
With:
```typescript
.eq('patient_id', patientId)
```

- [ ] **Step 3: Verify PatientPreviewModal.tsx already uses patient_id**

Check line 67 already has `.eq('patient_id', patientId)` - no change needed

- [ ] **Step 4: Verify PatientMobileApp.tsx already fixed**

Check lines 148 and 178 already use `patient_id` - no change needed

- [ ] **Step 5: Commit water logs column fixes**

```bash
git add src/components/monitoring/PatientMonitoringTab.tsx src/components/monitoring/PatientProgressTab.tsx
git commit -m "fix: use patient_id instead of user_id in water_logs queries"
```

---

### Task 3: Add Edge Function Debugging

**Files:**
- Modify: `supabase/functions/generate-meal-plan/index.ts:200-260`

**Interfaces:**
- Consumes: HTTP request with patientData JSON
- Produces: Detailed error logs and proper HTTP status codes

- [ ] **Step 1: Add request body logging after line 88**

Add after line 88:
```typescript
console.log('Raw request body keys:', Object.keys(rawBody));
console.log('Request body sample:', JSON.stringify(rawBody).substring(0, 200));
```

- [ ] **Step 2: Add validation result logging after line 89**

Add after line 103:
```typescript
console.log('Validation passed. Patient data:', {
  name: patientData.name,
  age: patientData.age,
  weight: patientData.weight,
  height: patientData.height,
  goal: patientData.goal
});
```

- [ ] **Step 3: Enhance OpenAI error handling at line 210-222**

Replace lines 210-222 with:
```typescript
if (!response.ok) {
  const errorText = await response.text();
  console.error('OpenAI API error:', {
    status: response.status,
    statusText: response.statusText,
    body: errorText,
    headers: Object.fromEntries(response.headers.entries())
  });

  if (response.status === 429) {
    return new Response(
      JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again in a few moments.',
        details: 'Too many AI requests'
      }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (response.status === 401) {
    return new Response(
      JSON.stringify({ 
        error: 'OpenAI API key is invalid or expired',
        details: 'Please check OPENAI_API_KEY secret'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  throw new Error(`AI request failed: ${response.status} - ${errorText}`);
}
```

- [ ] **Step 4: Add response parsing logging after line 224**

Add after line 233:
```typescript
console.log('OpenAI response structure:', {
  hasChoices: !!aiResponse.choices,
  choicesLength: aiResponse.choices?.length,
  hasContent: !!aiResponse.choices?.[0]?.message?.content
});
```

- [ ] **Step 5: Enhance final error logging at line 260-267**

Replace lines 260-267 with:
```typescript
} catch (error) {
  console.error('Error in generate-meal-plan:', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    name: error instanceof Error ? error.name : undefined
  });
  
  const errorMessage = error instanceof Error ? error.message : 'Failed to generate meal plan';
  const statusCode = errorMessage.includes('Unauthorized') ? 401 : 500;
  
  return new Response(
    JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }),
    { 
      status: statusCode, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
```

- [ ] **Step 6: Commit Edge Function debugging enhancements**

```bash
git add supabase/functions/generate-meal-plan/index.ts
git commit -m "feat: add detailed logging to generate-meal-plan Edge Function"
```

---

### Task 4: Frontend Validation and Testing

**Files:**
- Test all modified components in browser
- Verify console errors are resolved

**Interfaces:**
- Consumes: All previous task fixes
- Produces: Verified working application

- [ ] **Step 1: Start dev server and preview**

Run: `npm run dev`
Wait for server to start on localhost:5173

- [ ] **Step 2: Test patient detail page**

Navigate to `/pacientes/<patient-id>`
Verify:
- Age displays correctly (not "2025 anos")
- No console errors about water_logs
- Monitoring tab loads without errors

- [ ] **Step 3: Test meal plan generation**

Navigate to `/gerar-cardapio/<patient-id>`
Click "Gerar Cardápio"
Verify:
- Check browser console for Edge Function logs
- Error message is descriptive if it fails
- Success case generates meal plan

- [ ] **Step 4: Test patient mobile app**

Navigate to `/paciente/<patient-id>`
Verify:
- Water tracking works
- No console errors about user_id column

- [ ] **Step 5: Verify all console errors are resolved**

Open browser DevTools Console
Navigate through all critical pages
Confirm no red errors appear

- [ ] **Step 6: Document testing results**

Create: `docs/superpowers/testing/2026-10-09-bug-fixes-validation.md`
Document:
- Which pages were tested
- What errors were fixed
- Any remaining issues

- [ ] **Step 7: Final commit**

```bash
git add docs/superpowers/testing/2026-10-09-bug-fixes-validation.md
git commit -m "docs: add validation report for critical bug fixes"
```

---

## Dependencies Between Tasks

- Task 1 (Age) is independent
- Task 2 (Water logs) is independent  
- Task 3 (Edge Function) is independent
- Task 4 (Testing) depends on Tasks 1, 2, and 3

Tasks 1-3 can run in parallel, Task 4 runs last.
