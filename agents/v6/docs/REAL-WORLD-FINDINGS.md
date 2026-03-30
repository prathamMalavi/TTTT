# Real-World Migration Findings

**Issues discovered from actual OneCX Angular 18→19 migrations**

Date: March 25, 2026

---

## Critical Issues Found

### 1. Agents Perform Steps Halfway, Then Claim Done

**Problem**: Agent executes 50% of a task, marks it [x] completed, never returns to finish.

**Root Cause**: 
- Agent doesn't verify subtasks actually worked
- No validation between sub-steps
- Orchestrator doesn't force full completion per task

**Fix Applied** (v6):
- Executor must collect 8-field evidence (forces verification)
- One task per invocation (can't batch)
- Build/lint/test required (no "probably works")
- Task stays [ ] if ANY validation fails

**New Rule**: Agent must show:
```
✓ Subtask 1 complete (with proof)
✓ Subtask 2 complete (with proof)
✓ Subtask 3 complete (with proof)
[x] Task marked complete ONLY if all 3 verified
```

---

### 2. MCP Tool Returns Unrelated Results

**Problem**: Agent queries `"DataViewControlTranslations replacement"` → gets unrelated code → implements it → breaks everything

**Root Cause**: MCP about_onecx tool has low confidence threshold

**Fix Needed**: 
- MCP server should return "Nothing found (confidence < 80%)" instead of unrelated results
- Agent should ask: "Can you search for X in OneCX docs?" 
- If nothing found: Agent uses explicit search in workspace-ui example, not guessed code

**Action**: Flag this with MCP maintainers (out of scope for v6, but documented).

---

### 3. Documentation Incomplete/Wrong

**Missing from docs**:
- DataTableColumn import source
- ObjectDetailItem import source
- BreadcrumbService source
- Action component source
- RowListGridData source
- provideTranslateServiceForRoot actually from `@onecx/angular-remote-components` (NOT angular-utils)
- MultiLanguageMissingTranslationHandler replacement (not documented)
- CUSTOM_ELEMENTS_SCHEMA requirement (not documented)

**Links Too Deep**: 
- "Replace PageContentComponent" mentioned as link, not expanded
- Agent can't find it without direct search

**PrimeNG Missing**:
- No mention of PrimeNG migration guide
- InputTextareaModule → TextareaModule
- CheckboxModule, ButtonModule, MessageModule need to be added to shared module
- p-checkbox [label] → separate <label> element

---

### 4. Prohibited Replacements (CRITICAL)

**Agent must NEVER replace**:
```
❌ <ocx-portal-viewport></ocx-portal-viewport>
   (This component does not have a replacement, keep it!)
```

**Why**: Agent sees "replace" in docs, assumes ALL old components need replacement

**Fix**: Add explicit rule:
```
PROHIBITED_REPLACEMENTS = [
  "ocx-portal-viewport",  // No replacement exists
  // ... others
]

IF component in PROHIBITED_REPLACEMENTS:
  Skip replacement, leave as-is
```

---

### 5. Validation Without Building

**Problem**: Projects fail to compile even after following guide. Agents get confused and undo valid changes.

**Real Issue**: 
- Pre-migration steps correct
- But project won't build until ALL changes done
- Can't validate intermediate steps via build
- Need validation by inspection, not compilation

**Solution**:
- Validate via file inspection (check imports exist, syntax correct)
- Validate via comparison (show before/after code)
- Validate via coverage (every ComponentWas at least visited)
- Build only at END (Phase B manual validation)

**New Rule**: Don't build during Phase A. Validate by code inspection only.

---

### 6. Agents Need Step-By-Step, Not Batches

**Problem**: "Do all pre-migration steps" → Agent tries to do 5 at once → Does 2.5 → Marks all done

**Solution** (already in v6):
- One task per invocation
- One subsection = one task
- No batching allowed

**Verification**: MIGRATION_PROGRESS.md shows 1 task [x] per agent run, not 5.

---

### 7. CSS Context Lost

**Problem**: Agent modified shell-ui CSS to fix issues, instead of component CSS

**Root Cause**: Agent didn't have example of correct CSS pattern

**Fix**: Provide working examples:
```
Bad (from workspace-ui v5):
  @import '~@onecx/...';
  
Good (from onecx-shell-ui working):
  @import '@onecx/.../styles.scss';
```

Agent should search workspace for working patterns first.

---

### 8. Component Migration Needs Multiple Iterations

**Finding**: ocx-interactive-data-view, ocx-data-view-controls need multiple fixes.

**Real Issue**: 
- Documentation example doesn't match actual usage patterns
- Agent needs context from deprecated v5 components
- Multiple refinement cycles required

**Fix**: 
- Include working examples in docs
- Link to actual migrated repos (workspace-ui, shell-ui)
- Create "common patterns" guide with real code

---

## Updates Needed to Migration-V6

### Prompt Updates

Add to agent execution rules:
```
BEFORE executing replacement task:
1. Check PROHIBITED_REPLACEMENTS list
2. If component in list: SKIP, don't replace
3. If component NOT in list: Replace per docs

AFTER replacement:
1. Search workspace for working examples of same component
2. Compare YOUR changes to working example
3. If pattern different: Use working pattern instead
4. Verify imports match real code (not docs)
```

### Documentation Updates

1. **Add PrimeNG Migration Section**
   ```
   Also follow: https://primeng.org/migration/v19
   Key changes:
   - InputTextareaModule → TextareaModule
   - Add: CheckboxModule, ButtonModule, MessageModule
   - p-checkbox [label] → <label> element
   ```

2. **Expand Missing Imports**
   ```
   Update Translations:
   - provideTranslateServiceForRoot from @onecx/angular-remote-components (NOT angular-utils)
   - MultiLanguageMissingTranslationHandler from @onecx/angular-utils
   - provideAnimations from @angular/platform-browser/animations
   ```

3. **Add Prohibited Replacements**
   ```
   NEVER REPLACE:
   - <ocx-portal-viewport>: No replacement exists, keep as-is
   ```

4. **Add Working Examples**
   ```
   For component X, see real migration:
   - workspace-ui (commit ABC...): Shows correct pattern
   - shell-ui (commit DEF...): Shows CSS handling
   ```

5. **Add Deduplication Rule**
   ```
   If you add to component.bootstrap.ts:
   { provide: REMOTE_COMPONENT_CONFIG, ... }
   
   THEN remove it from component.ts (don't duplicate)
   ```

---

## Agent Behavior Fixes

### Fix 1: No Halfway Completion

```
❌ WRONG:
  - Update imports (50% done)
  [x] Mark task complete

✅ RIGHT:
  - Update imports (verify ALL updated)
  - Run import check (grep for old imports)
  - If old imports still exist: Mark [ ] not started
  [x] Only mark when verification passes
```

### Fix 2: Verify via Inspection Not Build

```
Task: "Migrate component X to new API"

Validation:
  ✓ Old component import removed (search file)
  ✓ New component import added (check import statement)
  ✓ Template uses new component (open file, verify)
  ✓ No syntax errors in file (check brackets, semicolons)
  
Do NOT:
  ✗ Run npm build (won't work until all tasks done)
  ✗ Run npm test (same issue)
```

### Fix 3: Search for Working Examples

```
BEFORE implementing change:
1. Query: "Show me component X migration in workspace-ui"
   (If available)
2. If found: Use as reference pattern
3. Compare your output to reference
4. If different: Ask why, or use reference pattern
```

### Fix 4: Prevent Prohibited Replacements

```
PROHIBITED = ["ocx-portal-viewport"]

FOR EACH replacement task:
  IF component IN PROHIBITED:
    Skip task, document why
  ELSE:
    Replace per docs
```

---

## New Documentation Sections Needed

### 1. Common Patterns Guide
```
Component: ocx-data-view-controls
Pattern (from workspace-ui):
  - Mix with p-table: [code example]
  - Handle events: [code example]
  - CSS cleanup: [code example]
```

### 2. Prohibited Replacements
```
Never replace:
- ocx-portal-viewport (no replacement)
- Others as discovered...
```

### 3. Verification Checklist
```
Component Migration Verification:
- [ ] Old import removed (show grep output)
- [ ] New import added (show import line)
- [ ] All usages updated (show before/after)
- [ ] No syntax errors (show file excerpt)
```

### 4. Real-World Working Examples
```
Migrated successfully:
- workspace-ui: Commit HASH, file paths, CSS patterns
- shell-ui: Commit HASH, CSS handling example
- announcement-ui: Commit HASH, ocx-interactive-data-view usage
```

---

## Priority Fixes for V6

**Immediate (blocks migration)**:
- [ ] Add PROHIBITED_REPLACEMENTS rule to executor
- [ ] Add inspection-based validation (no build)
- [ ] Add step-by-step verification
- [ ] Add working example search

**High (causes confusion)**:
- [ ] Update docs with PrimeNG migration
- [ ] Fix provideTranslateServiceForRoot import
- [ ] Add CUSTOM_ELEMENTS_SCHEMA requirement
- [ ] Document deduplication rule

**Medium (improves quality)**:
- [ ] Add working examples to docs
- [ ] Create common patterns guide
- [ ] Link to actual migrated repos
- [ ] Add prohibited replacements list

**Low (nice-to-have)**:
- [ ] MCP confidence threshold (out of scope)
- [ ] CSS best practices guide
- [ ] Permission mapping guide

---

## Summary: Why Real-World Failed

1. **Agents tried batch processing** → Marked halfway done → Migration incomplete
2. **Documentation incomplete** → Agents guessed → Wrong implementations
3. **MCP tool misled** → Agent followed bad examples → Broken code
4. **No examples** → Agent invented patterns → Non-standard code
5. **Build validation failed** → Agent undid valid changes → Confusion

## How V6 Fixes These

1. **One-task-per-invocation** → Can't batch
2. **8-field evidence** → Forces verification
3. **Prohibited replacements list** → Can't replace wrong things
4. **Inspection validation** → No reliance on build
5. **Working example search** → Use real patterns
6. **MIGRATION_PROGRESS.md** → Ground truth, no guessing

---

## Next Steps

1. Update executor to check PROHIBITED_REPLACEMENTS
2. Add inspection validation examples
3. Update docs with PrimeNG section
4. Fix import path errors
5. Add working examples (links to actual repos)
6. Create common patterns guide
