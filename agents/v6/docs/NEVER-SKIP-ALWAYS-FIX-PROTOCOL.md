# Executor Agent: Never-Skip and Always-Fix Protocol

**Updated**: Migration-Executor-V6 now enforces maximum task completion and error-fixing.

---

## Core Rules (BINDING)

### Rule 1: NEVER Skip If Complex

**Old Behavior**: "If a task is complex, break into sub-steps, execute all" (could skip parts)

**New Behavior**: 
```
✅ YOU MUST COMPLETE ALL PARTS of the task
✅ Break into sub-steps if needed, but execute EVERY subsection
❌ NEVER skip a complex part
❌ NEVER mark [x] if complex part incomplete
❌ If you don't finish, mark [ ] and explain what remains
```

**Example**:
```
Task: "Update component X to use new API"

Sub-steps:
1. Update imports ✓
2. Update template ✓
3. Update component.ts ✓
4. Update CSS ✓
5. Check with working example ✓

❌ BAD: Do steps 1-3, skip 4-5, mark [x]
✅ GOOD: Do all 5, verify all 5, mark [x]
```

---

### Rule 2: ALWAYS Fix Errors (Same Invocation)

**Old Behavior**: "Capture error, mark task [ ], defer to next run"

**New Behavior**:
```
✅ YOU MUST FIX ALL ERRORS IN THIS INVOCATION
✅ Capture error → Understand root cause → Fix code/config → Revalidate
❌ NEVER leave error unfixed and move on
❌ NEVER defer error-fixing to next run
❌ NEVER mark [x] with known failing error
```

**Error Categories**:
- **Import Error** → Fix path, add package, install, rerun
- **Build Error** → Fix code type/structure, rerun until ✓
- **Lint Error** → Fix code to pass linting, rerun until 0 errors 0 warnings
- **Test Error** → Fix code logic, rerun until passing
- **Ambiguity Error** → Stop, ask question, await response

---

### Rule 3: Document Full Error Journey

**Show the work**, not just the result:

```markdown
[x] completed | Update Component X

EXECUTION JOURNEY:
1. ✓ Import updated
2. ✗ Build failed: "Cannot find 'newComponent'"
   - Fixed: Added property declaration
3. ✗ Lint failed: "use const not var"
   - Fixed: Changed to const
4. ✗ Test failed: "Expected 5 got 3"
   - Fixed: Updated test assertion logic
5. ✓ Build passed
6. ✓ Lint passed (0 errors, 0 warnings)
7. ✓ Tests passed

- Final outcome: success (after 3 fix rounds)
```

This shows **real work**, not hidden struggle.

---

## Decision Points (UPDATED)

### If Task Seems Complex

```
❌ OLD: "Don't skip. Break into sub-steps. Execute all."
✅ NEW: "YOU MUST COMPLETE IT. Execute every subsection without exception."
```

**Examples of "complex"**:
- Multiple files to change
- Multiple subsections in docs
- Conditional logic ("if A then do X, if B then do Y")
- Multiple steps ("Update template AND fix imports AND verify")

**Your response**: Do ALL of them. No escaping.

---

### If You Find an Error

```
❌ OLD: "Don't hide it. Capture output. Leave task [ ]. Next run: retry with fix."
✅ NEW: "YOU MUST FIX IT NOW. This is NOT optional."
```

**Error-fixing steps** (in same invocation):
1. Capture full error output (50+ lines if needed)
2. Map root cause (where is the real problem?)
3. Fix the code/config issue
4. Rerun validation
5. If still broken: repeat steps 2-4 until fixed

**Don't proceed to next task until current task is fully green.**

---

### If Build/Lint/Test Fails

```
❌ OLD: "Capture 20 lines. Mark [ ]."
✅ NEW: "FIX IT IN THIS INVOCATION. Capture 50 lines. Fix. Rerun until ✓."
```

**Process**:
1. Capture full error (not summary)
2. Read error carefully (understand what's wrong)
3. Fix the code (don't guess, use error as guide)
4. Rerun: `npm run build` / `npm run lint` / `npm run test`
5. Repeat 2-4 until fully passing

**Don't mark [x] until fully passing** (0 errors, 0 warnings, all tests green)

---

## Anti-Patterns (NOW FORBIDDEN)

| Anti-Pattern                                       | Why Forbidden            | What to Do Instead                 |
| -------------------------------------------------- | ------------------------ | ---------------------------------- |
| "Task is complex, skip the hard part"              | Tasks must be complete   | Complete all subsections           |
| "Error looks hard, I'll mark incomplete & move on" | Errors are YOUR job      | Fix error in same invocation       |
| "Build has 5 errors, I'll fix 1 & mark done"       | All errors must be fixed | Fix all 5 before marking [x]       |
| "Lint warns but doesn't fail, mark [x]"            | 0 warnings required      | Fix all lint warnings              |
| "Test is pending, mark [x]"                        | Tests must pass          | Wait for test, fix if failing      |
| "Component broke build, delete it"                 | Fix the component code   | Repair the component, rerun        |
| "Part of task looks unrelated, skip it"            | Complete whole task      | Execute full task per docs         |
| "I don't understand this error, I'll guess"        | Never guess              | Ask for clarity, wait for response |

---

## Error-Fixing Guarantee

**You have permission to**:
- ✅ Modify files to fix errors (it's your job)
- ✅ Add imports, change paths, update config
- ✅ Rerun validation multiple times (as many as needed)
- ✅ Spend extra effort on complex errors
- ✅ Ask for clarification if genuinely ambiguous
- ✅ Document the full error journey (show struggle & fix)

**You do NOT have permission to**:
- ❌ Mark [x] with known failing error
- ❌ Defer error-fixing to next run
- ❌ Skip parts of task to "save time"
- ❌ Guess when ambiguous (ask instead)
- ❌ Hide errors from progress file
- ❌ Move to next task with broken current task

---

## Real-World Impact

### Before (Allow Escaping Complex Tasks)
- Tasks marked [x] with only 50% completion
- Mid-phase build failures (only discovered later)
- Incomplete migrations requiring rework
- Slow overall progress (many reruns)

### After (Never-Skip, Always-Fix)
- Tasks marked [x] only when fully complete
- Early error detection and fixing (same invocation)
- Fewer broken states, faster progress
- Clear evidence of full error journey

---

## Quick Checklist Before Marking [x]

**Ask yourself**:
- [ ] Did I complete ALL subsections of this task?
- [ ] Did I run npm build and have it pass?
- [ ] Did I run npm lint (0 errors, 0 warnings)?
- [ ] Did I run npm test (all passing, no pending)?
- [ ] Did I fix every error that appeared?
- [ ] Did I document the full error journey?
- [ ] Am I confident this task is complete?

**If ANY are "no"**: Mark [ ] (not started) and continue fixing, or document what remains.

**Only mark [x] when ALL are "yes"**.

---

## Implementation in Executor Agent

**Updated sections**:
1. **Decision Points** - "Task complex?" now says YOU MUST COMPLETE
2. **New Error-Fixing Protocol** - Explicit error categories & responses
3. **Error Handling** - Emphasizes fixing now, not deferring
4. **Anti-Patterns** - Added 10 new "never do this" patterns about escaping

**Golden Rule**: 
> "Errors are NOT blockers. They are YOUR job to fix IN THIS INVOCATION. Do not defer, do not skip, do not give up."

---

## See Also

- [migration-executor-v6.agent.md](../../agents/migration-executor-v6.agent.md) - Full executor implementation
- [HARD-RULES.md](../../docs/HARD-RULES.md) - Constraint H9-H13 (execution rules)
- [MIGRATION_PROGRESS.template.md](../../templates/MIGRATION_PROGRESS.template.md) - How to document errors
