# Skip Functionality: Skip~N Command

**Purpose**: Mark N tasks as "not applicable" and jump to N+1, saving time on tasks that don't apply to your repo.

---

## What Skip~N Does

```
Command: Skip~3

Result:
  Task 1: [ ] → [-] not applicable
  Task 2: [ ] → [-] not applicable  
  Task 3: [ ] → [-] not applicable
  Task 4: [ ] (next to execute)
```

In MIGRATION_PROGRESS.md:
```markdown
- [-] Task 1 name (Skipped by [developer] on [date])
- [-] Task 2 name (Skipped by [developer] on [date])
- [-] Task 3 name (Skipped by [developer] on [date])
```

Then executor auto-jumps to:
```markdown
- [ ] Task 4 name (executes next)
```

---

## When to Use Skip~N

### ✅ Good reasons to skip:

1. **Conditional tasks that don't apply**
   ```
   Task: "Update NgModule declarations"
   Your repo: Uses standalone components (no NgModule)
   
   → Skip~1
   ```

2. **Already completed manually**
   ```
   Task: "Update @angular/core from 18 to 19"
   You: Already did this before starting migration
   
   → Skip~1
   ```

3. **Optional tasks (nice-to-have)**
   ```
   Task: "Install PrimeNG icons package (optional)"
   Your repo: Uses FontAwesome instead
   
   → Skip~1
   ```

4. **Batch of similar conditionals**
   ```
   Tasks 5-7: "Update NgModule in [specific file]"
   Your repo: Has 0 NgModule files
   
   → Skip~3
   ```

---

## When NOT to Use Skip~N

### ❌ Never skip when:

1. **Task is required (must-have)**
   ```
   Task: "Update @angular/routing to 19.x"
   Your repo: Uses routing
   
   ✗ DO NOT SKIP
   → Run task normally, let executor collect evidence
   ```

2. **You're not sure about applicability**
   ```
   Task: "Apply new treeshaking configuration"
   You: Not sure if your build needs this
   
   ✗ DO NOT SKIP
   → Run task, executor checks repo evidence and decides
   ```

3. **Task is complex or time-consuming**
   ```
   Task: "Migrate 50 component templates to v19 syntax"
   You: This will take 30 minutes
   
   ✗ DO NOT SKIP (save time, but you'll regret it)
   → Execute task normally, spread over multiple invocations
   ```

4. **Building docs/pages that aren't fully clear**
   ```
   Task: "Run nx migrate for Nx v20"
   You: Docs aren't super clear about your version
   
   ✗ DO NOT SKIP
   → Execute, ask executor for clarification if confused
   ```

---

## Example: Skip Real Scenario

**Your repo**:
- Uses standalone components (Angular 14+ style)
- No NgModule declarations
- Uses Nx monorepo

**Phase A task list (excerpt)**:
```
1. [ ] Update @angular/core to 19
2. [ ] Update @angular/common to 19
3. [ ] Update @angular/forms to 19
4. [ ] Migrate NgModule declarations (if using modules)
5. [ ] Migrate component decorators (if using class decorators)
6. [ ] Update PrimeNG to v19 (if using PrimeNG)
7. [ ] Run nx migrate to v20
```

**Your decision**:
```
Tasks 4-5 don't apply (you use standalone components).
Task 6 doesn't apply (you use custom UI library).

Commands:
@orchestrator
"Continue execution"  # Task 1 done

@orchestrator
"Continue execution"  # Task 2 done

@orchestrator  
"Continue execution"  # Task 3 done

@orchestrator
"Skip~2"  # Skip tasks 4 & 5 (NgModule + class decorator)
         # Jump to task 6

@orchestrator
"Continue execution"  # Execute task 6 (PrimeNG, run anyway for evidence)

@orchestrator
"Skip~1"  # After task 6 runs and you see "not applicable"
         # Skip to task 7

@orchestrator
"Continue execution"  # Execute task 7 (nx migrate)
```

**Result** in MIGRATION_PROGRESS.md:
```markdown
- [x] Task 1: Update @angular/core to 19
- [x] Task 2: Update @angular/common to 19
- [x] Task 3: Update @angular/forms to 19
- [-] Task 4: Migrate NgModule declarations (Skipped by dev on 2025-01-15)
- [-] Task 5: Migrate component decorators (Skipped by dev on 2025-01-15)
- [x] Task 6: Update PrimeNG (Checked, not applicable)
- [-] Task 7: Run nx migrate (Skipped by dev on 2025-01-15)
```

Wait, that last one got marked [-] manually. Better approach:

```
After task 6 runs and outputs "not applicable":
Executor marks it [x] with evidence showing "not applicable"

@orchestrator
"Continue execution"  # Task 7 next

Execute task 7 (nx migrate): [x]
```

---

## Skip~N Syntax

### Valid commands:

```
Skip~1    # Mark next 1 task as not applicable
Skip~2    # Mark next 2 tasks as not applicable
Skip~5    # Mark next 5 tasks as not applicable
Skip~N    # Mark next N tasks, where N = number
```

### From orchestrator:

```
@migration-orchestrator-v6

"Skip~3"
```

### Orchestrator response:

```
Marked 3 tasks not applicable:
- [-] Task N name
- [-] Task N+1 name
- [-] Task N+2 name

Jumping to: Task N+3

Ready to execute? Run: "Continue execution"
```

---

## What Gets Recorded

When you skip, orchestrator records in MIGRATION_PROGRESS.md:

```markdown
- [-] Task name
  - Source pages: [original source]
  - Applicability: not applicable
  - Repository evidence: [skipped without repo check]
  - Planned action: Skipped by user
  - Skipped by: [Your Name] on [2025-01-15]
  - Final outcome: not applicable (skipped)
```

---

## Important Note on Evidence

⚠️ **Skip without evidence**:
- When you skip~N, executor does NOT check repo evidence
- You're asserting the task is not applicable
- If you're wrong: You may have missed something later

**Better approach** (if unsure):
1. DON'T skip
2. Run task normally
3. Let executor check repo evidence
4. If executor confirms "not applicable": Task marked [x] with evidence
5. You skipped without evidence, which is risky

↑ This is why skip~N is fast but not always safe.

---

## Undo a Skip

**Scenario**: You skipped task 5, but actually it's needed.

**Fix**:
1. Open MIGRATION_PROGRESS.md
2. Change task 5 from `[-]` back to `[ ]`
3. Run: `@orchestrator "Continue execution"`
4. Executor will pick up task 5 (first uncompleted)

---

## Summary

| Scenario | Action | Time saved |
|----------|--------|------------|
| Task is optional and you know it | `Skip~1` | 5-10 min |
| Task is required | Execute normally | Full validation |
| You're unsure if task applies | Execute normally | Risk assessment by executor |
| Batch of 5 conditional tasks don't apply | `Skip~5` | 30-50 min |
| You already did the task | `Skip~1` | 5 min |
| Already done → ask permission first | Skip~1 (after confirmation) | 5 min |

**Rule of thumb**: Skip only if you have repo evidence that task is not applicable. Otherwise, let executor check.
