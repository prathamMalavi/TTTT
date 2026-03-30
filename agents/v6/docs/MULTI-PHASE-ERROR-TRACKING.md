# Multi-Phase Error Tracking: Pre-Migration vs Post-Migration

**Updated**: Executor now understands error tracking differs by migration phase.

---

## The Problem

Traditional approach treats all errors the same:
- Error during task → Fix immediately → Mark complete

But migration has phases with different error patterns:
- **Phase A** (Pre-upgrade): Project compiles, errors mean incomplete work
- **Phase C** (Post-upgrade): Multiple interdependent cleanup tasks, errors cascade

---

## The Solution: Phase-Aware Error Handling

### Phase A (Pre-Migration): Immediate Error Fixing

**Context**:
- Pre-upgrade changes, project still compiles
- Each task is largely independent
- Build/lint/test should validate immediately

**Your behavior**:
```
Task: "Update component imports A→B"
1. ✓ Make change
2. Run npm build
3. ✗ Build fails: "Import B not found"

✓ FIX IT IMMEDIATELY:
  - Add missing package
  - Rerun npm build until ✓
4. Only THEN mark [x]
```

**Why**:
- Error = task incomplete
- No later tasks will fix this
- Fix now, validate now, complete now

---

### Phase C (Post-Migration): Deferred Error Revisiting

**Context**:
- Post-upgrade cleanup tasks interact
- Early tasks set up for later tasks to complete
- Build failures expected until ALL cleanup done
- Example: Import removal cascades → Must complete all removals first

**Your behavior**:
```
Task 1: "Remove deprecated API usage from component A"
1. ✓ Remove usage
2. Run npm build
3. ✗ Build fails: "API still called from component B"

✓ RECORD & CONTINUE (NOT Phase A behavior):
  - Record: Build error + full output in progress file
  - Note: "Likely fixed by component B cleanup"
  - Mark [x] COMPLETE (don't try to fix yet)
  - Move to NEXT Phase C task

Task 2: "Remove deprecated API usage from component B"
1. ✓ Remove usage  
2. Run npm build
3. ✓ BUILD PASSES! (Error from Task 1 is now fixed)
4. Mark [x]

AFTER ALL Phase C TASKS:
5. Rerun validation
6. Update progress: "Build error from Task 1 → FIXED by Task 2"
```

**Why Different**:
- Tasks are interdependent
- Errors expected until all related cleanup complete
- Stopping at first error blocks downstream tasks
- Later tasks fix earlier error cascades

---

## Migration Phase Breakdown

### Phase 1: Planning
- No execution, no errors
- Build MIGRATION_PROGRESS.md task tree

### Phase A: Pre-Migration Tasks
- Dependency updates, config changes, import fixes
- Project should still compile
- **Error handling**: Fix immediately IN THIS INVOCATION
- **Validation**: Each task validates build/lint/test before marking [x]
- **Examples** (Phase A typically short):
  - Update package.json versions
  - Fix circular imports
  - Update outdated config

### Phase B: Core Upgrade (Manual or Automated)
- Developer performs: `npm upgrade @angular/core` (or nx migrate)
- NOT executor's job
- Build/test likely fail (expected)
- Orchestrator waits for developer confirmation

### Phase C: Post-Migration Cleanup
- Remove old Angular-18 rules
- Migrate PrimeNG components
- Remove deprecated configs
- Update permission mappings
- **Error handling**: Track errors, continue, revisit after Phase C done
- **Validation**: Deferred to post-Phase-C loop (see below)
- **Important**: Multiple tasks interact, early errors cascade

---

## Error Tracking Patterns

### Pattern 1: Phase A Error (Fix Immediately)

```
Phase: A (Pre-migration)
Task: "Update imports @angular/core → @angular/core/v19"

Execution:
1. Run: npm build
2. Error: "Module '@angular/core/v19' not found"

YOUR ACTION:
✓ Root cause: Typo in import (should be just @angular/core)
✓ Fix code: Correct the import path
✓ Rerun build: ✓ PASSES
✓ Mark [x]: Complete

Don't move to next task until THIS task fully passes.
```

### Pattern 2: Phase C Error (Record & Continue)

```
Phase: C (Post-migration)
Task 1: "Remove @angular/18 rules from copilot-instructions.md"

Execution:
1. Edit file, remove rules
2. Run: npm build
3. Error: "Component X still uses removed API"

YOUR ACTION:
✓ This is Phase C, not Phase A
✓ Record error: "Build error - Component X references removed API"
✓ Note cause: "Likely fixed by later component migration task"
✓ Mark [x]: Task complete
✓ Move to NEXT Phase C task (don't wait)

Later task will fix this. Continue cleanup.
```

### Pattern 3: Post-Phase-C Validation (Revisit)

```
Phase: Post-C Validation Loop
All Phase C tasks complete

Review MIGRATION_PROGRESS.md:
- Phase C Task 1: [x] (but recorded: "Build error")
- Phase C Task 2: [x] (no errors)
- Phase C Task 3: [x] (but recorded: "Lint error")

YOUR ACTION:
For Task 1 error:
  Run npm build again
  Error gone? ✓ Yes! → Document "FIXED by Task 2"
  
For Task 3 error:
  Run npm lint again
  Still failing? ✗ Yes → Document "Needs manual fix"

Final report:
- Phase C Task 1 error: ✓ FIXED (by later task)
- Phase C Task 2 error: N/A
- Phase C Task 3 error: ✗ STILL FAILING (manual fix needed)
```

---

## MIGRATION_PROGRESS.md: Error Tracking Examples

### Phase A Task (Immediate Fix)

```markdown
[x] completed | Update Angular core imports

- Source pages: Angular migration guide
- Files changed: src/main.ts, src/app.module.ts

Execution:
1. ✓ Updated main.ts import
2. ✗ Build failed: "Module ./app.module not in tree" (typo)
   - Fixed: Corrected import path from './app.modules' to './app.module'
3. ✓ Build PASSED

- Final outcome: success (1 error caught and fixed)
```

### Phase C Task (Record & Continue, Then Revisit)

```markdown
[x] completed | Remove @angular/18 rules

- Source pages: Angular 18 deprecation guide  
- Files changed: .vscode/copilot-instructions.md

Execution:
1. ✓ Edited file, removed 3 Angular-18-specific rules
2. Run npm build
3. ✗ Build failed: "Property 'ngPreserveWhitespace' not found"
   Error context: Component X still has old property
   Error status: RECORDED FOR POST-C REVISIT
   Likely cause: Component migration task will fix
4. Mark [x] (task done, error expected in Phase C)

Later Phase C task (Component Migration):
[x] completed | Migrate component X to Angular 19
  - ✓ Updated component to use new property name  
  - ✓ Build now PASSES

POST-MIGRATION VALIDATION:
- Task 1 previous error: "ngPreserveWhitespace" → ✓ FIXED by Task 3
- Updated status: ✓ VALIDATED
```

---

## Error Recovery Workflow

### Step 1: Identify Phase C Errors

```bash
# During Phase C execution:
# When build/lint/test fails, record it:

MIGRATION_PROGRESS.md:
[x] Phase C Task N
  - Error recorded: [full output]
  - Status: Deferred to post-Phase-C validation
```

### Step 2: Continue Phase C

```bash
# Don't stop, move forward:
@migration-orchestrator-v6 "Continue execution"
# Executor finds next [ ] Phase C task and continues
```

### Step 3: All Phase C Complete

```bash
# Orchestrator: "Phase C complete"
# Run post-migration validation:
@migration-orchestrator-v6 "Validate post-migration"
# or similar command
```

### Step 4: Revisit Errors

```bash
For each recorded Phase C error:

1. Rerun npm build/lint/test
2. Check: Is error gone?
   
   YES:
   - Update MIGRATION_PROGRESS.md
   - Note which later task fixed it
   - Mark ✓ VALIDATED
   
   NO:
   - Document: "Persists after Phase C complete"
   - Likely needs manual developer fix
   - Report to orchestrator
```

### Step 5: Final Validation

```bash
npm run build    # Full output
npm run lint     # 0 errors, 0 warnings?
npm run test     # All passing?
npm run coverage # Compare to baseline

Update MIGRATION_PROGRESS.md with final validation results
```

---

## Quick Reference: Phase A vs Phase C Error Handling

| Aspect                    | Phase A (Pre-Upgrade)           | Phase C (Post-Upgrade)                       |
| ------------------------- | ------------------------------- | -------------------------------------------- |
| **Error occurs**          | Build fails during task         | Build fails during task                      |
| **Your immediate action** | Fix in this invocation          | Record error, continue                       |
| **Mark task**             | [x] only when passing           | [x] after completing planned changes         |
| **Move to next task**     | After this task fully passes    | Immediately, data continue                   |
| **Revisit error**         | N/A (already fixed)             | After ALL Phase C done                       |
| **Final validation**      | Per-task validation             | After ALL Phase C complete                   |
| **Example error**         | "Import not found" → Fix import | "Old API still used" → Later task removes it |

---

## Key Rules

### Rule 1: Know Your Phase

✅ Phase A: Fix errors immediately (project compiles preupgrade)  
✅ Phase C: Record errors, continue (multiple tasks interact)

### Rule 2: Document Error Journey

✅ Show full error output in MIGRATION_PROGRESS.md  
✅ Note when error was recorded (Phase C Task N)  
✅ Update when revisited (Post-C validation: FIXED by Task M)

### Rule 3: Revisit After Phase C

✅ Scan all Phase C tasks for recorded errors  
✅ Rerun build/lint/test for each  
✅ Update progress with results  
✅ Report any still-failing errors

### Rule 4: Never Hide Errors

❌ Don't skip Phase C tasks to avoid errors  
❌ Don't ignore error recording  
❌ Don't forget to revisit in post-migration loop

---

## Example: Full Error Journey

```
Phase A:
  Task 1 (Pre-upgrade): ✓ Pass (no errors)
  Task 2 (Pre-upgrade): ✓ Pass (no errors)

Phase B:
  Developer: npm upgrade @angular/core (manual)
  Build: ✗ FAILS (expected, lots of component errors)

Phase C:
  Task 1: Edit file, remove Angular-18 config
    Run build → ✗ Error: "Component X old property"  
    Record: "Deferred to post-C validation"
    Mark: [x] TASK COMPLETE
  
  Task 2: Migrate Component X to Angular 19
    ✓ Update component new API
    Run build → ✓ PASS! (Error from Task 1 is fixed!)
    Mark: [x]
  
  Task 3: Update permissions
    ✓ Fix permission mappings
    Run build → ✓ PASS
    Mark: [x]
  
  Phase C: All tasks [x]

Post-Migration Validation Loop:
  Scan Phase C in MIGRATION_PROGRESS.md
  Task 1 error: "Component X old property"
    Rerun: npm build → ✓ PASSES!
    Update: "✓ FIXED by Phase C Task 2"
  
  Final validation:
    npm build: ✓ PASS
    npm lint: ✓ 0 errors
    npm test: ✓ ALL PASS
    Coverage: 87% → 89% (baseline vs final)

Result: Migration complete and validated!
```

---

## See Also

- [migration-executor-v6.agent.md](../agents/migration-executor-v6.agent.md) - Phase C error handling section
- [HARD-RULES.md](HARD-RULES.md) - Rule H15 (Phase A inspection-only)
- [MIGRATION_PROGRESS.template.md](../templates/MIGRATION_PROGRESS.template.md) - How to record errors
