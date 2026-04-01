# Hard Rules: Non-Negotiable Constraints

**These rules are MANDATORY. No exceptions, no workarounds.**

When a hard rule is violated, the agent:
1. STOPS immediately
2. Reports the violation
3. Does NOT proceed until the rule is satisfied

---

## Initialization Hard Rules

### H1: Feature Branch Required
- ❌ Do NOT start migration on `main`, `master`, or `develop` branch
- ✅ Require user to create a feature branch first
- 🛑 Stop if branch check fails

**Why**: Protects main branch from incomplete changes.

---

### H2: Dependencies Must Install Successfully
- ❌ Do NOT proceed if `npm install` fails
- ✅ Capture full output + root cause before stopping
- ✅ Suggest fixes (run `npm cache clean`, check network, check package.json syntax)
- 🛑 Stop until install succeeds

**Why**: Prevents cascade failures in build/test/lint.

---

### H3: Pre-Migration Tests Must Run
- ❌ Do NOT skip test baseline capture
- ✅ Run tests ONCE at Phase 1 start (disable watch mode)
- ✅ Record coverage % baseline (if tool supports it)
- ✅ If tests fail: Report failures, ask user to fix, then retry
- 🛑 Stop until baseline tests pass

**Why**: Establishes a known-good state; detects pre-existing issues.

---

### H4: Target Version Must Be Specified
- ❌ Do NOT assume target version from repo
- ✅ Require user to specify target (e.g., "Angular 19", "Angular 20")
- ✅ Validate target against documented migration paths
- 🛑 Stop if target is missing or invalid

**Why**: Prevents migrating to wrong version; catches typos early.

---

## Documentation Hard Rules

### H5: Every Task Must Have Source Pages
- ❌ Do NOT create a task without listing source page URLs
- ✅ Record: Full URL from which task was derived
- ✅ For linked pages, record the chain (index → link → subpage)
- 🛑 Enforce during task creation in Phase 1

**Why**: Ensures agent can revisit docs; prevents task drift.

---

### H6: EVERY Link Must Be Visited
- ❌ Do NOT assume you understand a page from its title
- ✅ Fetch FULL content of every link on the index page
- ✅ Check for sub-links and fetch those too
- ✅ Report: "Visited N links: [list]"
- 🛑 Stop if any link on the index appears unvisited

**Why**: Prevents missed steps; catches hidden requirements.

---

### H7: No Assumptions About Applicability
- ❌ Do NOT mark `[-] not applicable` without checking repo
- ✅ Grep for related packages, imports, or config files
- ✅ Check actual codebase before deciding if task applies
- ✅ When in doubt: default to must-have (safer)
- 🛑 Enforce during task creation

**Why**: Prevents accidentally skipping required work.

---

### H8: Documentation Conflicts Are Blockers
- ❌ Do NOT guess when docs contradict each other
- ✅ Stop and ask the user which path to follow
- ✅ Use "Good prompts" format (from Ambiguity Rule)
- 🛑 Never guess or pick a direction unilaterally

**Why**: Real migrations have conflicting docs; must defer to domain expert.

---

## Execution Hard Rules

### H9: One Task Per Agent Invocation
- ❌ Do NOT execute multiple tasks in one invocation
- ✅ Execute EXACTLY ONE `[ ]` task per invocation
- ✅ Mark it `[x]` or `[ ]` depending on validation
- ✅ Stop before proceeding to next task
- 🛑 Enforce always

**Why**: Prevents half-done work; makes progress visible; enables checkpoints.

---

### H10: Validation is a Gate (Not Optional)
- ❌ Do NOT mark task complete (`[x]`) without validation
- ✅ Run: `npm run build` (must pass, 0 errors after changes)
- ✅ Run: `npm run lint` (must be 0 errors, 0 warnings)  
- ✅ Run: `npm run test` (must pass, compare coverage % to baseline)
- ❌ If ANY validation fails: mark `[ ]` (not started) and STOP
- 🛑 Enforce always

**Why**: Prevents broken changes from slipping through; catches real bugs immediately.

---

### H11: Build/Lint/Test Output Must Be Captured
- ❌ Do NOT run validation and discard output
- ✅ Capture FULL output from build/lint/test
- ✅ If fails: Capture last 20 lines + root cause analysis
- ✅ Record in MIGRATION_PROGRESS.md (errors section for that task)
- 🛑 Never proceed without capture

**Why**: Enables debugging; creates audit trail.

---

### H12: Parent Tasks Stay Unresolved While Children Unresolved
- ❌ Do NOT mark parent `[x]` while any child `[ ]`
- ✅ Mark parent `[x]` only when ALL children are complete
- ✅ Parent stays `[ ]` if ANY child task remains
- 🛑 Enforce in MIGRATION_PROGRESS.md at end of each invocation

**Why**: Prevents claiming progress when work remains.

---

### H13: No Batching, No Streaming Ahead
- ❌ Do NOT run multiple commands in succession and report success
- ❌ Do NOT start work on next task after current task completes
- ✅ Execute ONE task, update MIGRATION_PROGRESS.md, respond to orchestrator
- ✅ Orchestrator routes to next task
- 🛑 Enforce always

**Why**: Makes partial failures visible; prevents cascading breakage.

---

## Phase Boundary Hard Rules

### H14: Phase 1 Never Executes Phase A Tasks
- ❌ Planner do NOT touch code, run build, or modify files
- ✅ Planner ONLY discovers, audits, and creates task tree
- ✅ Phase 1 ends when MIGRATION_PROGRESS.md is complete
- 🛑 Stop if planner starts executing Phase A tasks

**Why**: Separates discovery from execution; phase boundary must be crisp.

---

### H15: Phase A Validation is Inspection-Only (No Build)
- ❌ Do NOT require `npm run build` to validate Phase A tasks
- ✅ Phase A tasks use INSPECTION validation: grep, file comparison, pattern matching
- ✅ Phase B tasks use BUILD validation: npm build/lint/test required
- ✅ No intermediate npm build between Phase A tasks
- 🛑 Enforce: Phase A never triggers npm build

**Why**: Phase A creates many changes; intermediate builds would be noisy; real validation happens at Phase B.

---

### H16: Phase Transitions Require Proof
- ❌ Do NOT transition to Phase B without Phase A completion
- ❌ Do NOT transition to Phase C without Phase B completion
- ✅ Phase 1 → Phase A: Automatic (planner done)
- ✅ Phase A → Phase B: Manual dev confirmation in MIGRATION_PROGRESS.md
- ✅ Phase B → Phase C: Manual dev confirmation required
- 🛑 Enforce: Check MIGRATION_PROGRESS.md before routing to next phase

**Why**: Prevents skipped phases; ensures human sign-off on risky transitions.

---

## Real-World Issues Hard Rules

### H17: Prohibited Replacements Blocking
- ❌ Do NOT replace components on the PROHIBITED list
- ✅ Reference [executor agent PROHIBITED_REPLACEMENTS](../agents/migration-executor-v6.agent.md#prohibited-replacements)
- ✅ If docs say to replace prohibited component: Stop, ask user
- 🛑 Never bypass prohibited list

**Why**: Some components have no replacement; forces user awareness.

---

### H18: Search Local Workspace Before MCP
- ❌ Do NOT use MCP as primary source for code patterns
- ✅ Search workspace first for working examples
- ✅ Use MCP only for documentation reference
- ✅ Prefer "see working example in repo" over "MCP suggests you do X"
- 🛑 Enforce MCP-only as fallback

**Why**: MCP can return misleading or unrelated code; workspace is ground truth.

---

### H19: No Halfway Completion
- ❌ Do NOT mark task complete if any step failed
- ✅ All 8 evidence fields required before `[x]` mark
- ✅ Verification checklist must pass before mark
- ❌ If ANY part of task is incomplete: stay `[ ]`
- 🛑 Enforce strict

**Why**: Prevents hidden bugs; forces complete execution.

---

### H20: Repo State Conflicts Are Blockers
- ❌ Do NOT attempt migration if repo state conflicts with target
- ✅ Example: "Target is Angular 19 but package.json says Angular 17"
- ✅ Stop and ask which state is correct
- 🛑 Never guess or proceed with conflict

**Why**: Indicates pre-existing issues; prevents compound problems.

---

## Summary

**Violation Detection**: 
- If any hard rule is violated, agent immediately stops and reports which rule was broken.

**Recovery**:
- Agent reports the rule violation
- User must acknowledge and fix the issue
- Agent retries from the same point

**Monitoring**:
- Orchestrator can spot-check hard rules at phase boundaries
- MIGRATION_PROGRESS.md records all violations for audit trail

---

## Cross-Reference

- See [AGENT-RULES.md](AGENT-RULES.md) for universal rules (When to Ask, Ambiguity Rule)
- See [Executor Agent](../agents/migration-executor-v6.agent.md) for PROHIBITED_REPLACEMENTS list
- See [Planner Agent](../agents/migration-planner-v6.agent.md) for Phase 1 audit checklist
- See [USAGE.md](../USAGE.md) for Phase gates and checkpoint summary
