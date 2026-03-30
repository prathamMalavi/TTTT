# Context Preservation Mandate

**MIGRATION_PROGRESS.md is the ONLY source of truth. Agents that don't read it first are BROKEN.**

---

## The Problem: Lazy Context Loss

### How Agents Lose Context

```
Invocation 1:
Agent: "I found 3 tasks"
Updates: MIGRATION_PROGRESS.md ✓

Invocation 2:
Agent: "Remember, there were 3 tasks"
BUT: File was updated to add 2 more (5 total)
Agent: Acting on stale memory (WRONG)
```

### Result
- Agent misses tasks
- Agent executes wrong task
- Agent thinks task is already done when it's not
- Migration breaks midway

---

## The Solution: Mandatory Read-First Pattern

### Rule 1: ALWAYS Read State File First

```
EVERY invocation, agents MUST:

1. CHECK: Does MIGRATION_PROGRESS.md exist?
   - If NO: Stop, ask orchestrator
   - If YES: Proceed

2. READ: Full file content
   - Parse: Phase (1/A/B/C)
   - Count: [ ] not started, [x] completed, [-] not applicable
   - Find: First [ ] task
   - Extract: Task context (source page, applicability, evidence metadata)

3. VERIFY: State is consistent
   - Check: No orphaned [ ] tasks without source pages
   - Check: All [x] tasks have 8 evidence fields
   - Check: No [x] tasks followed by [ ] tasks (should be sequential)

4. ACT: Based on verified state, NOT memory
5. UPDATE: File IMMEDIATELY after action
6. RETURN: Updated file content to caller
```

### Rule 2: Never Trust Memory

```
❌ WRONG:
  Agent: "I remember the task count was 15"
  Action: Skip finding first [ ] task
  Result: Executes wrong task

✅ RIGHT:
  Agent: "Let me read MIGRATION_PROGRESS.md"
  Action: Count [ ] [ ] [ ] ... verify count
  Result: Executes correct task
```

### Rule 3: Verify State Before Delegating

```
Orchestrator MUST verify before delegating to Planner/Executor:

❌ WRONG:
  Orchestrator: "Run Phase 1"
  Planner: *starts planning without checking if already done*
  Result: Overwrites MIGRATION_PROGRESS.md with duplicate data

✅ RIGHT:
  Orchestrator: "Check if MIGRATION_PROGRESS.md exists"
  If exists: Report (don't re-plan)
  If not: Delegate to Planner
  Planner: Creates it once, returns
  Result: No duplicate work
```

---

## Anti-Patterns That Cause Context Loss

### Pattern 1: Memory Instead of File

```
❌ WRONG (Agent loses context between invocations):
  Run 1: Agent executes Task 1, updates file
  Run 2: Agent: "I remember Task 1 was done, moving to Task 2"
         [But file might have Task 1 marked [ ] if update failed]
  Result: Agent doesn't verify file, executes wrong task

✅ RIGHT:
  Run 1: Agent executes Task 1, updates file, returns
  Run 2: Agent reads file, sees Task 1 [x], finds Task 2 [ ]
  Result: Always correct
```

### Pattern 2: Assuming File State Persists in Agent

```
❌ WRONG (Multi-step agent assumes state across steps):
  Step 1: Agent reads MIGRATION_PROGRESS.md (says 5 tasks total)
  Step 2: Agent thinks "I know there are 5 tasks"
  Step 3: File was updated by parallel agent (now 7 tasks)
  Step 4: Agent still thinks 5 tasks, operates on stale info
  Result: Context divergence

✅ RIGHT:
  Each agent step re-reads file before acting on task list
  OR: Agent passes file content between steps
```

### Pattern 3: Lazy Validation

```
❌ WRONG (Agent doesn't verify execution before updating):
  Agent: "Build succeeded, I think"
  Updates: file with [x] completed
  But: Build actually failed (error output hidden)
  Result: Task marked done, but not really

✅ RIGHT:
  Agent: Captures full build output
  Agent: Checks: build passed? (0 exit code & specific success markers)
  Agent: If failed: Captures error, marks [ ] not started
  Agent: Updates file AFTER verification
```

### Pattern 4: Skipping on Assumption

```
❌ WRONG (Agent assumes task doesn't apply without evidence):
  Agent: "This looks like a module-related task"
  Agent: "We don't use modules, skip it"
  Updates: file with [-] not applicable
  But: Repo DOES use modules in one package
  Result: Missed required task

✅ RIGHT:
  Agent: Checks repo (grep for module usage)
  Agent: If unclear: Doesn't skip, executes task, collects evidence
  Agent: Marks [-] only after verification
```

### Pattern 5: Batch Processing Loss

```
❌ WRONG (Agent tries to do 3 tasks in 1 invocation):
  Agent: "I'll do tasks 1, 2, 3 to save time"
  Task 1: ✓ done
  Task 2: ✓ done
  Task 3: ✗ fails
  Updates: file for tasks 1&2 but marks 3 [x] anyway
  Result: Task 3 appears completed but isn't

✅ RIGHT:
  Agent: Executes only 1 task per invocation
  Task: Updates file after each
  Task: Stops after completion
  Result: Clean 1:1 state updates
```

### Pattern 6: Delegation Without State

```
❌ WRONG (Orchestrator delegates without passing context):
  Orchestrator: "Execute Phase A"
  Executor: "What's the state?" (has to read from scratch)
  Result: Extra file reads, no context continuity

✅ RIGHT:
  Orchestrator: Reads MIGRATION_PROGRESS.md first
  Orchestrator: "Execute: Task 3 of 20, source page is [...], applicability is [...]"
  Executor: Confirms state, executes, updates
  Result: Context preserved through delegation
```

---

## Enforcement: How to Detect Lazy Context

### Red Flag 1: Agent Doesn't Mention File Read

```
Bad output:
  "Starting migration..."
  "Executing task..."
  NO mention of reading MIGRATION_PROGRESS.md

Good output:
  "Reading MIGRATION_PROGRESS.md..."
  "Found 5 [ ] tasks pending"
  "Executing Task 2..."
```

### Red Flag 2: Agent Claims Memory

```
Bad output:
  "You previously ran Phase 1, so..."
  "I remember there were 15 tasks"

Good output:
  "Checking MIGRATION_PROGRESS.md..."
  "File shows: Phase A, 10 completed, 5 pending"
```

### Red Flag 3: Agent Skips State Verification

```
Bad output:
  "Running Phase A execution"
  [executes without checking if Phase 1 is complete]

Good output:
  "Verifying Phase 1 completed..."
  "Checking MIGRATION_PROGRESS.md for Phase A start marker..."
  "All prerequisites met. Starting Task N..."
```

### Red Flag 4: No Evidence in Updates

```
Bad output:
  [x] Task 1
  (no source pages, no validation output)

Good output:
  [x] Task 1
  - Source pages: [URL]
  - Applicability: [decision]
  - Files changed: [list]
  - Validation: npm build ✓, npm lint ✓, npm test ✓
```

---

## Testing Context Preservation

### Test 1: Read-After-Update

```
1. Ask agent to "Continue execution"
2. Agent executes Task 1
3. Check: Did agent update MIGRATION_PROGRESS.md?
4. Ask agent to "Status"
5. Verify: Agent reports same state as file shows
   (If agent says "Task 1 done" but file shows [ ], agent lost context)
```

### Test 2: Idempotent Execution

```
1. Ask agent to "Continue execution" → Task 1 [x]
2. Ask same thing again
3. Verify: Agent reads file, sees Task 1 [x], skips to Task 2 [ ]
   Result: Correct (not re-executing Task 1)
```

### Test 3: Delegation Integrity

```
1. Orchestrator delegates to Planner: "Start Phase 1"
2. Planner creates MIGRATION_PROGRESS.md
3. Orchestrator asks Executor: "Continue execution"
4. Executor reads file, finds first [ ] task
5. Verify: Executor has full context from Planner's output
   (Not asking "What tasks are there?", just reading file)
```

### Test 4: Parallel Agent Consistency

```
1. Orchestrator reads MIGRATION_PROGRESS.md
2. Orchestrator passes state to Executor
3. Executor updates file: Task 1 [x]
4. Orchestrator asks for Status
5. Verify: Orchestrator re-reads file (not using old state)
   Reports: "Task 1 [x], Task 2 [ ]"
```

---

## Recovery: If Context is Lost

### Detect Loss

```
Signs of context loss:
- Agent repeats a completed task
- Agent skips a pending task
- Agent reports wrong phase
- File and agent output disagree
```

### Recovery Steps

```
1. Trust the file (it's source of truth)
2. Read MIGRATION_PROGRESS.md yourself
3. Ask agent: "Read MIGRATION_PROGRESS.md and confirm current state"
4. If agent still disagrees: File is correct, agent is broken
5. Reset: Ask orchestrator to start over
```

### Fallback

```bash
# If all else fails
git diff MIGRATION_PROGRESS.md
# See what changed
git checkout MIGRATION_PROGRESS.md
# Reset to last good state
@orchestrator Status
# Agent re-reads from source
```

---

## Summary

| Principle             | Why                            | How to Verify                                  |
| --------------------- | ------------------------------ | ---------------------------------------------- |
| Read first            | Agents operate on stale memory | Agent mentions file read in output             |
| One source of truth   | Prevent inconsistency          | File state matches agent claims                |
| Verify before acting  | Prevent assumptions            | Agent checks repo/file before executing        |
| Update immediately    | Prevent lost updates           | File updated before agent stops                |
| Never batch           | Prevent partial failures       | Agent executes exactly 1 task per invocation   |
| Delegate with context | Prevent knowledge loss         | Orchestrator passes file state to other agents |

**If any principle is violated → Context is lost → Migration may fail.**
