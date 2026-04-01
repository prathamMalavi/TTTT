# Executor Agent: Complete Phase Updates

**Date**: March 30, 2026  
**Focus**: Phase-aware task execution and error tracking

---

## What Changed

The executor agent now understands **three distinct migration phases** with different requirements:

### Phase A (Pre-Migration): Before Core Upgrade
- Task execution focused on pre-upgrade changes
- Project should still compile
- Errors indicate incomplete task work
- **Error behavior**: Fix immediately in same invocation
- **Validation**: Each task must pass build/lint/test before marking [x]

### Phase B (Core Upgrade): Manual Developer Action
- Not executor's responsibility
- Developer runs: `npm upgrade @angular/core` or `nx migrate`
- Build/test expected to fail (transition period)
- Orchestrator waits for developer "tests green" signal

### Phase C (Post-Migration): After Core Upgrade
- Task execution focused on cleanup and configuration
- Multiple tasks interact (remove old API → use new API cascades)
- Build/test failures expected until ALL Phase C tasks complete
- **Error behavior**: Record errors, continue, revisit after all tasks done
- **Validation**: Deferred to post-Phase-C loop

---

## Core Rules Added

### Rule 1: Complex Tasks Must Be Completed

**Before**: "Break into sub-steps, execute all"  
**Now**: "YOU MUST COMPLETE ALL SUBSECTIONS. Never skip complex parts."

- Complex task with 5 sub-steps → Complete all 5 or mark [ ] and explain
- No escaping complexity by marking incomplete

### Rule 2: Errors Must Be Fixed (Phase A) or Tracked (Phase C)

**Phase A**:
- Error during task = incomplete work
- Fix immediately in SAME invocation
- Don't move to next task until current passes

**Phase C**:
- Error during task = expected cascade
- Record error with full output
- Mark [x] task complete (task done, validation deferred)
- Continue to next Phase C task
- After ALL Phase C: Revisit errors to verify they're fixed

### Rule 3: Error Journey Must Be Documented

Show the REAL work:
```
[x] Task Name

Execution Journey:
1. ✓ Change made
2. ✗ Build failed: "Error message"
   - Fixed: [description of fix]
3. ✓ Build passed
4. ✓ Lint passed  
5. ✓ Tests passed

Final outcome: success (after N fix rounds)
```

---

## Files Updated

### 1. Agent Files

**`agents/migration-executor-v6.agent.md`**:
- Decision Points: "Complex task?" now requires completion
- Decision Points: "Found error?" now phase-aware
- New section: Error-Fixing Protocol (detailed by error type)
- Updated: Error Handling section (emphasizes fixing now vs deferring)
- Updated: Phase C rules (explains post-migration error tracking)
- New: Phase C Special Case (error recording workflow)
- Anti-patterns: Added 10 new forbidden patterns from real migrations

### 2. Documentation Files

**NEW: `docs/NEVER-SKIP-ALWAYS-FIX-PROTOCOL.md`** (~350 lines)
- Comprehensive protocol for never escaping and always fixing
- Error-fixing guarantee (what you can/cannot do)
- Decision point clarifications
- Error journey documentation example
- Real-world impact comparison

**NEW: `docs/MULTI-PHASE-ERROR-TRACKING.md`** (~400 lines)
- Explains Phase A vs Phase C error handling differences
- Error tracking patterns for each phase
- Post-migration validation loop workflow
- MIGRATION_PROGRESS.md examples for each phase
- Full error recovery workflow with examples

**UPDATED: `INDEX.md`**
- Links to both new guides
- Updated docs table with phase-aware resources

---

## Key Behaviors

### Phase A Error Example

```
Task: "Update component imports"
1. Make change
2. Build fails: "Import path incorrect"
3. ✓ Fix immediately (correct path)
4. Rerun build ✓
5. Mark [x] ONLY when passing
```

### Phase C Error Example

```
Task 1: "Remove Angular-18 config"
1. Remove config section
2. Build fails: "Component X old API still used"
3. ✓ Record error, mark [x], CONTINUE

Task 2: "Update Component X"
1. Update component
2. Build passes ✓ (error from Task 1 is fixed!)
3. Mark [x]

After Phase C:
✓ Rerun build
✓ Check: "Previous error now fixed? YES!"
✓ Update progress: "✓ FIXED by Task 2"
```

---

## Error Recovery Workflow

```
Phase A: Each task validates independently
  Task 1: [x] ✓
  Task 2: [x] ✓
  
Phase B: Developer upgrades (manual)
  Build: ✗ FAILS (expected)
  
Phase C: Multiple tasks interact
  Task 1: [x] (error recorded)
  Task 2: [x] (fixes Task 1 error)
  Task 3: [x]
  
Post-Phase-C Validation Loop:
  Scan all Phase C tasks for recorded errors
  For each error: Rerun, check if fixed
  Update progress
  Final validation: npm build/lint/test
```

---

## Quick Decision Matrix

| Question           | Phase A            | Phase C                     |
| ------------------ | ------------------ | --------------------------- |
| Error during task? | Fix immediately    | Record & continue           |
| Mark task?         | [x] when passing   | [x] after planned work      |
| Next task?         | After this passes  | Right away                  |
| Revisit error?     | N/A                | After ALL Phase C           |
| Typical errors     | "Import not found" | "Deprecated API still used" |

---

## Implementation Details

### Error Fixing Protocol (Phase A & C)

**4 Error Types Defined**:
1. **Import Error** → Fix path/package, install, rerun
2. **Build Error** → Fix code/config, rerun until ✓
3. **Lint Error** → Fix each issue, rerun until 0 errors/warnings
4. **Test Error** → Fix logic, rerun until passing

**Golden Rules**:
- Phase A: "Errors are YOUR job to fix IN THIS INVOCATION"
- Phase C: "Errors are expected. Record them, continue, then revisit"

### MIGRATION_PROGRESS.md Entries

**Phase A Error (Immediate Fix)**:
```
[x] Task
  - Execution: ✓ change made ✗ error ✓ fixed ✓ validated
  - Final outcome: success
```

**Phase C Error (Record & Continue)**:
```
[x] Task
  - Execution: ✓ change made ✗ error recorded
  - Note: "Deferred to post-Phase-C validation"
  - Final outcome: task complete
```

**Phase C Error (Later Validation)**:
```
[x] Previous Task
  - Error: "Component X old API" → ✓ FIXED by Task N
  - Post-validation: VALIDATED
```

---

## What This Means for Migrations

### Before (Generic Error Handling)
- All errors treated same way → Stop, fix, validate
- Phase C errors → Stop, fail
- Slow progress through cascading errors
- Hidden workflow (error fixing & process unclear)

### After (Phase-Aware Handling)
- Phase A errors → Fix immediately (independent work)
- Phase C errors → Record & continue (interdependent work)
- Faster Phase C progress (don't stop at cascading errors)
- Clear workflow (error journey documented in progress file)

### Example Real Migration

```
Phase A (3 tasks): ~10 minutes
  - All independent, all pass individually
  - 0 deferred errors

Phase B: ~5 minutes
  - Developer does npm upgrade

Phase C (8 tasks): ~20 minutes
  - Task 1-4: Some errors recorded (expected)
  - Task 5-8: Later tasks address early errors
  - All Phase C tasks complete quickly (no stopping)

Post-Phase-C Validation: ~5 minutes
  - Rerun build
  - Errors from Task 1-4: ✓ Fixed by later tasks
  - Final: All passing

Total: ~40 minutes (might be 60+ with old approach that stops at each error)
```

---

## Files Created/Updated

| File                                     | Status  | Lines        |
| ---------------------------------------- | ------- | ------------ |
| `agents/migration-executor-v6.agent.md`  | Updated | +150 lines   |
| `docs/NEVER-SKIP-ALWAYS-FIX-PROTOCOL.md` | New     | ~350 lines   |
| `docs/MULTI-PHASE-ERROR-TRACKING.md`     | New     | ~400 lines   |
| `INDEX.md`                               | Updated | +2 doc links |
| **Total**                                |         | ~+900 lines  |

---

## Next Steps

1. **Test with real repository**:
   - Run Phase A (verify immediate error fixing)
   - Run Phase B (manual upgrade)
   - Run Phase C (verify error tracking & post-C validation loop)

2. **Verify workflows**:
   - Complex Phase A task → Completes fully
   - Phase A error → Fixed in same invocation
   - Phase C error → Recorded and continued
   - Post-Phase-C error → Confirmed fixed

3. **Update orchestrator** (optional):
   - Add command: "Validate post-migration" (trigger error revisit loop)
   - Add state: "Phase C validation pending" (track if errors need revisit)

---

## See Also

- [migration-executor-v6.agent.md](../agents/migration-executor-v6.agent.md) - Full executor implementation
- [NEVER-SKIP-ALWAYS-FIX-PROTOCOL.md](NEVER-SKIP-ALWAYS-FIX-PROTOCOL.md) - Task completion rules
- [MULTI-PHASE-ERROR-TRACKING.md](MULTI-PHASE-ERROR-TRACKING.md) - Error handling by phase
- [HARD-RULES.md](HARD-RULES.md) - All 20 constraints
- [USAGE.md](../USAGE.md) - User-facing commands and workflow
