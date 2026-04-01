# Agent Rules: Core Behavior Contract

**These rules are binding for all agents. No exceptions.**

---

## Universal Agent Rules (All Agents)

### When to Ask the User (ALWAYS ASK IMMEDIATELY)

✅ **Ask the user immediately for these major decisions:**
- Current branch is `main`, `master`, or `develop` (must create feature branch first)
- The documentation is contradictory or unclear
- The target version is missing or conflicts with repo state
- An external dependency, access issue, or platform step blocks progress
- A major risky adaptation is needed AND the docs don't settle it
- A phase gate is reached (feature branch gate, core-upgrade approval gate, post-upgrade resume)

❌ **Do NOT ask the user for routine decisions the repo can answer:**
- Whether a grep/search should be run
- Whether a package is used (check package.json)
- Whether a step applies (check the repo first)
- Whether docs should be read (always yes)
- Whether the next task should execute (yes, unless it's `[x]` or `[-]`)
- Whether a file needs modification (check file first)
- Whether a build/lint/test step should run (use tasks)

### Good Prompts vs Bad Prompts

✅ **Good prompts are:**
- Concise (1–2 sentences)
- Specific (about a real ambiguity or blocker)
- About decisions the user must actually make

**Example**: "The docs require either the Nx styles array pattern OR Sass @import pattern. The repo doesn't clarify which. Should I use pattern A or B?"

❌ **Bad prompts:**
- Vague ("What should I do next?")
- Routine ("Should I read this page?")
- Deferring responsibility ("I don't know how to proceed")

### Ambiguity Rule (CRITICAL)

**If you do not understand the documentation well enough to act safely:**
- 🛑 **STOP immediately**
- ❌ Do NOT guess or improvise
- ✅ Record the ambiguity in MIGRATION_PROGRESS.md (add note section)
- ✅ Ask one concise question following the "Good prompts" format above

**Example ambiguity**:
- Docs say "Update component X or Y"
- Repo has BOTH X and Y
- Docs don't clarify which one

**Your action**:
```
❌ DON'T guess: Update both components
✅ DO ask: "Docs mention updating component X or Y. 
            Repo has both. Should I update A, B, or both?"
```

---

## Orchestrator Rules

### Command Routing
- ✅ Route "Start Phase 1" to @migration-planner-v6
- ✅ Route "Continue execution" to @migration-executor-v6
- ✅ Handle "Skip~N" directly (don't delegate)
- ✅ Route "Validate" to @migration-executor-v6
- ✅ Route "Status" to read MIGRATION_PROGRESS.md

### NO Agent-to-Agent Calls
- ❌ Planner never calls executor
- ❌ Executor never calls planner
- ❌ Executor never calls validator
- ✅ ONLY orchestrator delegatesto other agents

### Skip Validation
- ✅ Skip~N marks N tasks as `[-] not applicable`
- ✅ Records: "Skipped by [user] on [date]"
- ✅ Jumps to task N+1
- ❌ Do NOT check repo evidence (user's responsibility)
- ❌ Do NOT execute tasks when skipping

### State File Consistency
- ✅ Always update MIGRATION_PROGRESS.md before responding
- ✅ Write changes immediately (don't batch updates)
- ✅ Use only 3 markers: `[ ]` `[x]` `[-]`
- ❌ Do NOT invent new markers like `[?]` or `[~]`

---

## Planner Rules

### Execution: Phase 1 Only
- ✅ Run EXACTLY once (when orchestrator says "Start Phase 1")
- ✅ Perform all 7 Phase 1 audits (see tasks list in agent file)
- ✅ If any audit fails: STOP and explain blocker
- ✅ Create MIGRATION_PROGRESS.md from template
- ❌ Do NOT execute Phase A tasks
- ❌ Do NOT skip Phase 1 steps

### Documentation Discovery (Strict Rules)
- ✅ Fetch OneCX migration index page (full content)
- ✅ For EACH link on index: Fetch full linked page
- ✅ Read ENTIRE page (not summaries or headlines)
- ✅ Count ALL H2 subsections (each = one task)
- ✅ Check: Are there sub-links? Fetch those too.
- ✅ Also fetch: PrimeNG v19 migration, Nx migration guide
- ❌ Do NOT assume page meaning from headline
- ❌ Do NOT skip any link (visited every link? = yes/no in output)

### Task Creation
- ✅ One task per H2 subsection
- ✅ One task per linked page
- ✅ One task per conditional action step
- ✅ Record source page URL for each task
- ✅ Check applicability with repo (grep for dependencies)
- ❌ Do NOT combine multiple subsections into one task
- ❌ Do NOT skip tasks based on headline alone

### Audit Results
- ✅ npm install: [pass/fail], capture output
- ✅ npm test baseline: [pass/fail], record coverage %
- ✅ .vscode/tasks.json: npm:build, npm:lint, npm:test present? [yes/no]
- ✅ copilot-instructions.md: Tag all Angular 18 lines with `# [REMOVE-AFTER-A19]`
- ✅ Task tree: Show total task count discovered

### Output Format
- ✅ Show: Total tasks discovered
- ✅ Show: Task tree with categories (Phase A, Phase C)
- ✅ Show: Links visited (how many, all covered?)
- ✅ Show: Applicability checks (what repo evidence was checked)
- ❌ Do NOT execute any tasks
- ❌ Do NOT mark tasks complete

### Documentation Links
- ✅ Discover from MCP if available
- ✅ Fall back to documented URLs if MCP not available
- ✅ Record: Source URL for each page visited
- ✅ Record: If sub-links found, those fetched too
- ❌ Do NOT guess page content from filename

---

## Executor Rules

### Execution Context
- ✅ Read MIGRATION_PROGRESS.md
- ✅ Find first `[ ]` task (not started)
- ✅ Skip any `[-]` or `[x]` tasks
- ✅ Execute EXACTLY ONE task per invocation
- ❌ Do NOT auto-continue to next task
- ❌ Do NOT execute multiple tasks at once

### Task Execution
- ✅ Fetch documentation (visit source page listed in task)
- ✅ Read FULL page content (not summary)
- ✅ Check repo for applicability (grep, file inspection)
- ✅ Perform EXACTLY what docs say
- ✅ Use VS Code tasks when possible (npm:build, npm:lint, npm:test)
- ✅ Handle errors: Capture output, map root cause, stay `[ ]`
- ❌ Do NOT guess or improvise implementation
- ❌ Do NOT skip error handling
- ❌ Do NOT assume file changes (check repo first)

### Evidence Collection (8 Fields Required)
- ✅ Source pages: List all URLs visited during task
- ✅ Applicability: must-have | nice-to-have | not applicable
- ✅ Repository evidence: Grep results or file inspection findings
- ✅ Planned action: Exactly what you did (step-by-step)
- ✅ Files changed: Exact list of files modified
- ✅ Validation: 
  * `npm run build` result (✓ or error output)
  * `npm run lint` result (must be 0 errors, 0 warnings)
  * `npm run test` result (✓ or error, compare coverage % to baseline)
- ✅ Final outcome: success | blocked | error
- ✅ Edge cases: Any gotchas found during execution
- ❌ Do NOT mark [x] without all 8 fields completed
- ❌ Do NOT skip validation (build/lint/test required)

### Error Handling
```
IF npm install fails:
  → Capture output
  → Map root cause (dependency conflict? network? version mismatch?)
  → Explain blocker
  → STOP (stay [ ] not started)
```

```
IF npm build fails:
  → Capture last 20 lines of output
  → Map root cause
  → Record in MIGRATION_PROGRESS.md
  → Mark task [ ] (needs rework)
  → STOP (don't continue)
```

```
IF npm lint fails:
  → Capture lint errors
  → Must be 0 errors, 0 warnings
  → Mark task [ ] (needs rework)
  → STOP
```

```
IF npm test fails or pending:
  → Don't mark [x]
  → Mark task [ ] (needs rework)
  → STOP
```

### Decision Points

**Task is complex?**
→ Don't skip. Break into sub-steps. Execute all.

**Not sure if applicable?**
→ Check repo evidence (grep, file inspection)
→ If still unclear: default to "must-have" (safer)
→ Execute task, let validation reveal if applicable

**Task completed in previous run?**
→ Already marked [x] in MIGRATION_PROGRESS.md
→ Executor skips it, moves to next [ ] task

**Build/test warn but don't fail?**
→ Some tools are strict
→ Lint warnings = stay [ ] (needs rework)
→ Test "pending" = stay [ ] (flaky test, needs rework)

**Cannot complete task (genuine blocker)?**
→ Capture error output
→ Map root cause
→ Document in MIGRATION_PROGRESS.md
→ Mark task [ ] (blocked, needs manual fix)
→ STOP and report to orchestrator

### NO Agent-to-Agent Calls
- ❌ Executor NEVER calls planner
- ❌ Executor NEVER calls validator
- ✅ Only orchestrator can delegate to executor
- ✅ Executor updates MIGRATION_PROGRESS.md directly

### Output Per Task
```
[x] completed | Task Name
  - Source pages: [list]
  - Applicability: [decision]
  - Repository evidence: [findings]
  - Planned action: [executed steps]
  - Files changed: [list]
  - Validation: build ✓, lint ✓, test ✓ [coverage %]
  - Final outcome: success
```

---

## Phase Transitions (Explicit Gating)

### Phase 1 → Phase A
- Automatic when planner completes
- Pattern: "Planning complete. Ready for Phase A. Command: "Continue execution""

### Phase A → Phase B
- Manual approval gate when all Phase A tasks marked [x]
- Pattern: Orchestrator asks explicit Yes/No for core upgrade
- If **Yes**: fetch relevant Angular/Nx docs, execute upgrade task
- If **No**: fetch relevant Angular/Nx docs, provide manual cheatsheet, wait for developer to run upgrade
- If response is **neither Yes nor No**: default to **Yes** and proceed with doc fetch + upgrade task

### Phase B → Phase C
- Manual transition (user must confirm)
- Pattern: Orchestrator waits for signal, then routes to executor for Phase C tasks

---

## State Markers (Use These Only)

| Marker | Meaning        | When to use                                                    |
| ------ | -------------- | -------------------------------------------------------------- |
| `[ ]`  | Not started    | Task discovered but not executed                               |
| `[x]`  | Completed      | Task executed, all 8 evidence fields filled, validation passed |
| `[-]`  | Not applicable | Repository doesn't need this task (evidence-based or skipped)  |

## Anti-Patterns (Strictly Forbidden)

❌ "This task might fail, I'll skip it" → Execute instead
❌ "Build warns but doesn't error, mark complete" → 0 warnings required
❌ "Test is pending, mark complete anyway" → Wait for test result
❌ "Assume this file doesn't need change" → Check repo first
❌ "This page's title suggests..." → Read full page, count subsections
❌ "I'll combine multiple subsections into one invocation" → One per invocation
❌ "If blocked, just skip the task" → Report blocker, don't hide
❌ "One agent can call another for efficiency" → Only orchestrator delegates

---

## Performance vs Correctness

- **Minimize agent count**: ✓ 3 agents (orchestrator, planner, executor)
- **Maximize validation**: ✓ 8-field evidence required per task
- **Zero hand-offs**: ✓ Executor autonomously handles Phase A & C
- **Full context**: ✓ MIGRATION_PROGRESS.md maintained as single source of truth
- **No shortcuts**: ✓ Every task validated against npm build/lint/test

---

## Summary: Agent Responsibilities

| Agent            | Responsibility                               | Invocation                                                   | Output                                  |
| ---------------- | -------------------------------------------- | ------------------------------------------------------------ | --------------------------------------- |
| **Orchestrator** | Route commands, manage skip~N, track state   | "Start Phase 1" / "Continue execution" / "Skip~N" / "Status" | 1 delegated action or status report     |
| **Planner**      | Discover tasks, create plan, perform Phase 1 | Called by orchestrator on "Start Phase 1"                    | MIGRATION_PROGRESS.md + task tree       |
| **Executor**     | Execute ONE task, collect evidence, validate | Called by orchestrator on "Continue execution" / "Validate"  | 1 completed task [x] with full evidence |

**Golden Rule**: 
- Orchestrator orchestrates (routes, no execution)
- Planner plans once (discovers all tasks)
- Executor executes (one task per call, full autonomy)
