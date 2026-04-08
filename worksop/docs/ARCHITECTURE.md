# Architecture Guide: OneCX Angular Migration Agent v5

> **For maintainers and developers** — understand every file, how agents interact,
> why design decisions were made, and how to modify the system.

## Table of Contents

1. [System Overview](#1-system-overview)
2. [File-by-File Reference](#2-file-by-file-reference)
3. [How VS Code Auto-Injection Works](#3-how-vs-code-auto-injection-works)
4. [Agent Architecture](#4-agent-architecture)
5. [Execution Flow (Behind the Scenes)](#5-execution-flow-behind-the-scenes)
6. [Rule System Design](#6-rule-system-design)
7. [Phase System & Validation Strategy](#7-phase-system--validation-strategy)
8. [Context Budget Analysis](#8-context-budget-analysis)
9. [Model Compatibility](#9-model-compatibility)
10. [Hooks & Skills: Why Not Used](#10-hooks--skills-why-not-used)
11. [tasks.json: Why It Exists](#11-tasksjson-why-it-exists)
12. [MIGRATION_PROGRESS.md: Why Not a Skill](#12-migration_progressmd-why-not-a-skill)
13. [v4 → v5 Changes & Rule Mapping](#13-v4--v5-changes--rule-mapping)
14. [How to Modify the System](#14-how-to-modify-the-system)

---

## 1. System Overview

```
.github/
├── AGENTS.md                                          [always-on project identity]
├── agents/
│   ├── migration-orchestrator.agent.md                [coordinator — user-facing]
│   ├── migration-planner.agent.md                     [discovery — subagent]
│   ├── migration-executor.agent.md                    [execution — subagent]
│   └── migration-validator.agent.md                   [verification — subagent]
├── instructions/
│   ├── migration-rules.instructions.md                [core rules — auto-injected to ALL]
│   ├── migration-progress-format.instructions.md      [evidence format — auto-injected on progress file]
│   ├── migration-custom-user.instructions.md          [user project rules — auto-injected to ALL]
│   └── migration-18-19.instructions.md                [version-specific data — NOT auto-injected]
├── prompts/
│   └── migrate.prompt.md                              [/migrate slash command]
└── templates/
    ├── MIGRATION_PROGRESS.template.md                 [progress file template]
    ├── README.md                                      [quick-start readme]
    └── tasks.json                                     [VS Code tasks for build/lint/test]
```

**Design philosophy**: Minimal, auto-injected rules. Platform-enforced behavior. Model-agnostic.

---

## 2. File-by-File Reference

### `.github/AGENTS.md`

| Property | Value |
|----------|-------|
| **Purpose** | Always-on project identity — injected into every chat request |
| **Why AGENTS.md not copilot-instructions.md** | Users may already have their own `copilot-instructions.md` with project coding standards. AGENTS.md is recognized by VS Code (and other AI tools) as always-on instructions without overwriting developer rules. |
| **Content** | ~10 lines: what this workspace is, core principles (single source of truth, doc-driven tasks, one task per invocation, validation order, ask when unclear) |
| **When injected** | Every chat request in the workspace, automatically |

### `.github/agents/migration-orchestrator.agent.md`

| Property | Value |
|----------|-------|
| **Purpose** | Coordinator agent — the only user-facing agent |
| **YAML properties** | `tools: ['agent', 'read', 'search', 'execute', 'web', 'edit', 'vscode', 'todo', 'browser', 'onecx-docs-mcp/*', 'primeng/*', 'npm-sentinel/*', ...]`, `agents: [planner, executor, validator]`, `handoffs: [Continue, Skip, Status, Validate]` |
| **Key behavior** | Reads MIGRATION_PROGRESS.md on every invocation, routes commands to subagents, enforces phase gates, handles Skip~N directly |
| **Phase gates** | Gate 1 (feature branch), Gate 2 (A→B approval with default-to-Yes), Gate 3 (B→C confirmation) |
| **Why it has `agent` tool** | Needs to spawn subagents via `runSubagent` |
| **Why it has `edit` tool** | Needs to edit MIGRATION_PROGRESS.md for Skip~N |

### `.github/agents/migration-planner.agent.md`

| Property | Value |
|----------|-------|
| **Purpose** | Discovery and planning — runs ONCE at Phase 1 |
| **YAML properties** | `user-invocable: false`, `tools: ['agent', 'read', 'search', 'execute', 'web', 'edit', 'vscode', 'todo', 'browser', 'onecx-docs-mcp/*', 'primeng/*', 'npm-sentinel/*', ...]` |
| **Key behavior** | Audits repo baseline (npm install/build/lint/test), detects versions, fetches all docs, creates task tree, writes MIGRATION_PROGRESS.md |
| **Why `user-invocable: false`** | Prevents users from bypassing the orchestrator |
| **Why `execute` tool** | Needs to run npm install/build/lint/test for baseline audit |
| **Critical behavior** | Per-page H2 verification table: after each page, must verify tasks_created == h2_count |

### `.github/agents/migration-executor.agent.md`

| Property | Value |
|----------|-------|
| **Purpose** | Task execution — handles one task per invocation across all phases |
| **YAML properties** | `user-invocable: false`, `tools: ['agent', 'read', 'search', 'execute', 'web', 'edit', 'vscode', 'todo', 'browser', 'onecx-docs-mcp/*', 'primeng/*', 'npm-sentinel/*', ...]` |
| **Key behavior** | 8-step execution loop: find task → fetch docs → check repo → execute → fix errors → validate → update progress → stop |
| **Why full tool access** | Needs to edit code, run terminal commands, fetch docs, search codebase |
| **Phase-specific validation** | ALL phases: npm build→lint→test. Not-applicable tasks with 0 file changes skip validation. |
| **Error handling** | Fixes errors in same invocation — never defers to next run |

### `.github/agents/migration-validator.agent.md`

| Property | Value |
|----------|-------|
| **Purpose** | Independent verification — cannot edit source code |
| **YAML properties** | `user-invocable: false`, `tools: ['agent', 'read', 'search', 'execute', 'web', 'edit', 'vscode', 'todo', 'browser', 'onecx-docs-mcp/*', 'primeng/*', 'npm-sentinel/*', ...]` |
| **3 validation modes** | Task validation (check 8 evidence fields), Phase gate validation (readiness checks), Final validation (end-of-migration) |
| **Why Haiku first in model list** | Validator work is simpler (checking fields, running commands) — cheaper model is fine. Note: `model` property is not currently set in agent YAML; model selection is left to the user/VS Code defaults. |

### `.github/instructions/migration-rules.instructions.md`

| Property | Value |
|----------|-------|
| **Purpose** | Core migration rules — ALL rules from v4's H1-H30 condensed here |
| **YAML properties** | `applyTo: '**'` — auto-injected into EVERY agent including subagents |
| **Why this is the most important file** | This replaces the broken "MANDATORY STARTUP PROTOCOL" from v4. In v4, agents had to manually read HARD-RULES.md and AGENT-RULES.md with file tools — smaller models skipped this. With `applyTo: '**'`, VS Code injects these rules into every agent's context automatically. The model cannot skip them. |
| **Content sections** | State Management, Initialization Gates, Task Execution, Documentation Discovery, Task Classification, Validation Rules, Phase Boundaries, No-Defer Rule, Package Compatibility, Error Handling, Verification Checklist, MCP Tool Usage, Build Failure Discipline, CSS and File Scope, Test Strategy, Decision Protocol |
| **What's NOT here** | Examples, anti-patterns, "why" explanations, emoji formatting — these help humans but waste model tokens |

### `.github/instructions/migration-progress-format.instructions.md`

| Property | Value |
|----------|-------|
| **Purpose** | Evidence format for MIGRATION_PROGRESS.md entries |
| **YAML properties** | `applyTo: '**/MIGRATION_PROGRESS.md'` — only injected when the model reads/writes the progress file |
| **Why conditional injection** | No point loading evidence format rules when the agent isn't touching the progress file |
| **Content** | 8 required evidence fields, mark rules, error journey documentation format |

### `.github/instructions/migration-custom-user.instructions.md`

| Property | Value |
|----------|-------|
| **Purpose** | User's project-specific rules — structure only, user fills in content |
| **YAML properties** | `applyTo: '**'` — auto-injected to all agents |
| **Why empty** | Each project has different patterns, naming conventions, and component examples. The user fills this in with their project-specific knowledge. |
| **Suggested content** | Working examples in repo, import conventions, CSS patterns, permission mappings |

### `.github/instructions/migration-18-19.instructions.md`

| Property | Value |
|----------|-------|
| **Purpose** | Version-specific migration data — structure only, user fills in content |
| **YAML properties** | NO `applyTo` — NOT auto-injected |
| **Why not auto-injected** | Version-specific data (URLs, target versions) changes per migration. This file is either manually attached to a chat session or users add `applyTo: '**'` if they want it always active. |
| **Suggested content** | Documentation source URLs, target version numbers, known breaking changes, workarounds |

### `.github/prompts/migrate.prompt.md`

| Property | Value |
|----------|-------|
| **Purpose** | Slash command entry point — type `/migrate` in chat |
| **YAML properties** | `agent: migration-orchestrator` — routes to orchestrator |
| **Behavior** | Checks if MIGRATION_PROGRESS.md exists. If not → "Start Phase 1". If yes → show status and ask what to do. |

### `.github/templates/MIGRATION_PROGRESS.template.md`

| Property | Value |
|----------|-------|
| **Purpose** | Template for the progress tracking file |
| **Used by** | Planner (creates MIGRATION_PROGRESS.md from this template) |
| **Content** | Phase 1 audit table, Phase A/B/C task templates with evidence fields, error recovery loop, summary section |

### `.github/templates/tasks.json`

| Property | Value |
|----------|-------|
| **Purpose** | VS Code tasks for running build/lint/test with consistent configuration |
| **Tasks defined** | `npm:build`, `npm:lint`, `npm:test` (with `--watch=false --code-coverage`) |
| **CI=true env** | Forces non-interactive mode for all tasks |
| **Used by** | Planner creates `.vscode/tasks.json` from this if it doesn't exist |

---

## 3. How VS Code Auto-Injection Works

This is the KEY architectural innovation in v5 vs v4.

### The Problem in v4

v4 had 6 instruction files as plain `.md` files. VS Code does NOT auto-inject plain `.md` files. The agents had a "MANDATORY STARTUP PROTOCOL" that required them to manually read each file with file tools:

```
Step 0: Read HARD-RULES.md → Read AGENT-RULES.md → Read PIPELINE.md → ...
```

**This broke constantly.** Smaller/faster models (GPT-4.1, Haiku) would skip the startup protocol and jump straight to work, missing all the rules. This was the root cause of rules being silently ignored.

### The Solution in v5

VS Code auto-detects files ending in `.instructions.md` if they have YAML frontmatter with `applyTo`:

```yaml
---
applyTo: '**'     # matches all files → always injected
---
```

When any agent (including subagents) is invoked, VS Code automatically includes these instructions in the context. The model receives them as part of its system prompt — **it cannot skip them**.

### What gets injected per invocation

```
Agent invocation context:
├── AGENTS.md                                    (~10 lines) — always
├── migration-rules.instructions.md              (~80 lines) — always (applyTo: **)
├── migration-custom-user.instructions.md        (~varies)  — always (applyTo: **)
├── migration-progress-format.instructions.md    (~25 lines) — only when touching MIGRATION_PROGRESS.md
├── Agent body                                   (80-110 lines) — the specific agent
└── User prompt / orchestrator delegation prompt
```

**Total per-invocation context: ~200-300 lines** (vs v4's ~2,000-2,500 lines loaded manually)

### Why this matters for model compatibility

| Model | Behavior with v4 | Behavior with v5 |
|-------|------------------|------------------|
| Claude Sonnet | Usually reads files correctly | Rules auto-injected, guaranteed |
| Claude Haiku | Sometimes skips file reads | Rules auto-injected, guaranteed |
| GPT-4.1 | Often skips multi-file reads | Rules auto-injected, guaranteed |
| Grok | Optimizes for speed, skips reads | Rules auto-injected, guaranteed |

---

## 4. Agent Architecture

### Pattern: Coordinator and Worker

From VS Code's official subagents documentation — the "Coordinator and Worker" pattern:

```
┌──────────────────────────────┐
│   Orchestrator (Coordinator) │  ← user-facing, has `agent` tool
│   tools: read,search,edit,   │
│          agent,web           │
│   agents: [planner,executor, │
│            validator]        │
└──────┬───────┬───────┬───────┘
       │       │       │
       ▼       ▼       ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Planner  │ │ Executor │ │ Validator│
│ (Worker) │ │ (Worker) │ │ (Worker) │
│ full-edit│ │ full-edit│ │ full-edit│
│ + web    │ │ + web    │ │ + execute│
└──────────┘ └──────────┘ └──────────┘
```

### Why 4 agents (not 3)

v4 had 3 agents (orchestrator + planner + executor). v5 adds a **validator** because:

1. **Separation of concerns**: The executor should not verify its own work. Having a separate validator provides independent confirmation.
2. **Tool restriction**: The validator has `tools: [read, search, execute]` — no `edit`. It can run build/lint/test but cannot modify files, ensuring it cannot "fix" its own verification.
3. **Phase gate validation**: Phase transitions need independent verification (are all tasks complete? does build pass?) that shouldn't be mixed with execution logic.

### Subagent isolation

Each subagent invocation:
- Gets a **fresh context** (no memory from previous invocations)
- Gets the auto-injected instructions (AGENTS.md + .instructions.md files)
- Gets only the prompt the orchestrator sends it
- Returns a result to the orchestrator

This means:
- No context overflow from accumulated state
- Each task execution is independent
- Rules are always fresh (auto-injected each time)

### Agent routing (enforced by `agents` property)

The orchestrator's frontmatter contains:
```yaml
agents: ['migration-planner', 'migration-executor', 'migration-validator']
```

This means:
- ONLY the orchestrator can invoke these 3 agents as subagents
- The orchestrator CANNOT invoke any other agent
- The subagents themselves CANNOT invoke other subagents (no recursive calls)
- Users cannot invoke planner/executor/validator directly (`user-invocable: false`)

---

## 5. Execution Flow (Behind the Scenes)

### Flow: "Start Phase 1"

```
User → @migration-orchestrator "Start Phase 1"
  │
  ├─ 1. VS Code auto-injects: AGENTS.md + migration-rules.instructions.md + custom-user.instructions.md
  ├─ 2. Orchestrator loads its own agent body
  ├─ 3. Orchestrator checks: current git branch = feature branch?
  │     └─ If main/master/develop → STOP, ask user to create feature branch
  ├─ 4. Orchestrator spawns @migration-planner as subagent
  │     │
  │     ├─ Planner gets auto-injected: AGENTS.md + migration-rules.instructions.md + custom-user.instructions.md
  │     ├─ Planner loads its own agent body
  │     ├─ Planner checks: MIGRATION_PROGRESS.md exists? → if yes, STOP
  │     ├─ Planner runs: npm install → npm build → npm lint → npm test (baseline)
  │     │   └─ Any failure → STOP, report to developer
  │     ├─ Planner reads package.json → detects current versions
  │     ├─ Planner fetches migration index page → follows every link
  │     │   └─ For each page: count H2s, create tasks, verify count
  │     ├─ Planner checks .vscode/tasks.json → creates from template if missing
  │     ├─ Planner writes MIGRATION_PROGRESS.md from template
  │     └─ Planner returns: task tree summary to orchestrator
  │
  └─ 5. Orchestrator shows handoff buttons
```

### Flow: "Continue execution"

```
User → @migration-orchestrator "Continue execution"
  │
  ├─ 1. Auto-injection happens
  ├─ 2. Orchestrator reads MIGRATION_PROGRESS.md → identifies current phase
  ├─ 3. Orchestrator spawns @migration-executor as subagent
  │     │
  │     ├─ Executor gets auto-injected rules
  │     ├─ Step 1: Read MIGRATION_PROGRESS.md → find first [ ] task
  │     ├─ Step 2: Fetch source documentation URL for that task
  │     ├─ Step 3: Grep/search repo for every item in the task
  │     ├─ Step 4: Execute changes as documented (all H2 sub-steps)
  │     ├─ Step 5: Fix any errors encountered (in same invocation)
  │     ├─ Step 6: Validate
  │     │   └─ ALL phases: npm build → lint → test (skip if [-] with 0 file changes)
  │     ├─ Step 7: Update MIGRATION_PROGRESS.md with 8 evidence fields
  │     ├─ Step 8: STOP (do NOT execute next task)
  │     └─ Return: task completion report to orchestrator
  │
  └─ 4. Orchestrator shows handoff buttons
```

### Flow: Phase A → B Gate

```
All Phase A tasks [x] or [-]
  │
  ├─ Orchestrator spawns @migration-validator
  │   └─ Validator: checks all tasks complete, numbering contiguous, runs build/lint/test
  │
  ├─ Orchestrator shows: changes summary, build state, target versions  ├─ Orchestrator checkpoint: asks developer to verify and commit Phase A changes  ├─ Orchestrator asks: "Ready to approve core upgrade?"
  │
  ├─ User says "Yes" (or anything non-No) → orchestrator routes executor for Phase B
  └─ User says "No" → executor creates manual cheatsheet from docs
```

### Why one task per invocation (not batching)

The "one task per invocation, then stop" pattern exists because:

1. **Context isolation**: Each subagent gets fresh context. No risk of accumulated state corruption.
2. **Error containment**: If task A.3 fails, you know immediately. With batching, you'd discover A.3 failed after A.4 and A.5 were already done on top of broken state.
3. **Progress visibility**: MIGRATION_PROGRESS.md is updated after each task. You can see exactly where you are.
4. **Credit efficiency**: If you need to stop, you stop cleanly. No wasted work.
5. **Phase safety**: The system automatically detects phase transitions (A→B, B→C) and enforces gates. Batching would require complex mid-batch gate detection.

**But why can't the orchestrator auto-continue?**

It could. In v4, the behavior you observed (orchestrator spawning executor repeatedly without waiting for "Continue") happens when the orchestrator decides to loop. This is valid behavior — the rules say "one task per executor invocation" (the executor stops), but the orchestrator CAN re-invoke the executor for the next task in the same chat session.

The handoff buttons exist as a convenience — you CAN click "Continue Execution" immediately. Some models will auto-loop. Both behaviors are valid:
- **Auto-loop**: Orchestrator spawns executor, gets result, spawns again for next task. This is faster but uses more credits per session.
- **Manual continue**: User clicks "Continue Execution" each time. This gives you a checkpoint between tasks.

**The important thing**: Each EXECUTOR invocation does exactly one task. Whether the ORCHESTRATOR loops automatically or waits for user input is a model-dependent behavior, not a rule violation.

---

## 6. Rule System Design

### How rules are organized

```
AGENTS.md (10 lines)
  └─ "What is this workspace" — high-level identity

migration-rules.instructions.md (80 lines)
  └─ ALL hard rules condensed — the complete rulebook

migration-progress-format.instructions.md (25 lines)
  └─ Evidence format for writing to MIGRATION_PROGRESS.md

Agent bodies (80-110 lines each)
  └─ Role-specific behavior, steps, protocols
```

### Where each v4 rule lives in v5

| v4 Source | v5 Location | Why there |
|-----------|-------------|-----------|
| H1-H30 (HARD-RULES.md) | migration-rules.instructions.md | Auto-injected, always active |
| Universal agent rules (AGENT-RULES.md) | migration-rules.instructions.md Decision Protocol | Auto-injected |
| Orchestrator rules (AGENT-RULES.md) | orchestrator agent body | Role-specific |
| Planner rules (AGENT-RULES.md) | planner agent body | Role-specific |
| Executor rules (AGENT-RULES.md) | executor agent body | Role-specific |
| Evidence format (scattered) | migration-progress-format.instructions.md | Conditionally injected |
| Runtime Discovery Pipeline (363 lines) | planner agent Steps 1-7 (~30 lines) | Condensed into agent body |
| Strict Doc Expansion (277 lines) | migration-rules.instructions.md Documentation Discovery (5 lines) + planner verification step | Condensed |
| Skip Functionality (277 lines) | orchestrator Skip~N section (8 lines) | Condensed |
| Version-Aware Upgrade Protocol (438 lines) | executor Version Upgrade Tasks section (12 lines) | Condensed |

### What was removed and why

| Removed | Why |
|---------|-----|
| "Why" explanations per rule | Models don't need justification — they need the rule |
| Anti-pattern lists (❌ "Don't do X") | Telling a model "Do Y" is sufficient; "Don't do not-Y" wastes tokens |
| Emoji formatting (🛑 ✅ ❌) | Tokens wasted on non-semantic characters |
| Worked examples / scenarios | Good for humans learning the system, but AI models don't learn from examples in instructions — they follow rules |
| Cross-reference sections | No longer needed — auto-injection replaces manual file loading |
| MANDATORY STARTUP PROTOCOL | Replaced by auto-injection — the whole point of v5's architecture |
| Duplicate rules (same rule in 3-5 files) | Stated once in migration-rules.instructions.md, injected everywhere |

---

## 7. Phase System & Validation Strategy

### Phase Overview

| Phase | Purpose | Who runs it | Validation style |
|-------|---------|-------------|------------------|
| **Phase 1** | Discover docs, audit repo, create task tree | Planner | Baseline: npm install/build/lint/test MUST all pass |
| **Phase A** | Pre-upgrade code changes (imports, templates, configs) | Executor | Full: npm build→lint→test. Must pass with CURRENT Angular version. Not-applicable tasks (0 file changes) skip validation. |
| **Phase B** | Core package upgrades (Angular, Nx, PrimeNG versions) | Executor | Full: npm build→lint→test. Transitional failures allowed if mapped to Phase C |
| **Phase C** | Post-upgrade cleanup and fixes | Executor | Full: npm build→lint→test. Transitional failures recorded, recovered at end |

### Why Phase A runs full validation

Phase A changes (import renames, template updates, config adjustments) are made against the CURRENT Angular version. Unlike what earlier design documents suggested (inspection-only), the actual rule is:

> ALL phases (A, B, C): run `npm run build` → `npm run lint` → `npm run test` after every task.

This ensures Phase A changes don't break the current build. If a Phase A change breaks the build, the executor must fix it in the same invocation.

**Exception for not-applicable tasks**: When a task is marked `[-]` with zero files changed, build/lint/test is skipped entirely — no code was modified, so validation adds no value.

The last Phase A task is the "End-of-Phase-A Build State Record" — it runs build/lint/test as a final confirmation that all Phase A changes are clean.

### Why validation order is always build → lint → test

1. **Build first**: No point running lint or tests on code that doesn't compile
2. **Lint second**: Validates style/correctness on code that compiles
3. **Test last**: Verifies behavior of correct, linted code

This order surfaces issues in order of severity and avoids wasting time on tests when the build is broken.

---

## 8. Context Budget Analysis

### Per-invocation context (v4 vs v5)

| Content | v4 (lines) | v5 (lines) | How loaded |
|---------|-----------|-----------|------------|
| Agent body | 221-825 | 80-110 | Agent activation |
| Core rules | ~725 (2 files, manual read) | ~80 | Auto-injected |
| Discovery rules | ~640 (2 files, manual read) | 0 (in agent body) | — |
| Skip rules | 277 (1 file, manual read) | 0 (in orchestrator body) | — |
| Version protocol | 438 (1 file, manual read) | 0 (in executor body) | — |
| Project context | 0 | ~10 | Auto-injected |
| Progress format | 0 | ~25 | Conditionally auto-injected |
| **Total per invocation** | **~2,000-2,500** | **~200-300** | |

**~90% reduction in rules context per invocation.**

### What this means for different models

| Model | Context Size | Rules overhead (v5) | Remaining for work |
|-------|-------------|---------------------|-------------------|
| Claude Haiku 4.5 | 200K tokens | ~1.5K tokens (~0.75%) | 99.25% |
| GPT-4.1 | 128K tokens | ~1.5K tokens (~1.2%) | 98.8% |
| Grok Code Fast 1 | 256K tokens | ~1.5K tokens (~0.6%) | 99.4% |

---

## 9. Model Compatibility

### Why v5 is model-agnostic

| Critical behavior | v4: model cooperation | v5: platform enforcement |
|------------------|----------------------|------------------------|
| Rules in context | Model must read files (or doesn't) | VS Code auto-injects |
| Tool restriction | Model follows text instructions | `tools` property enforces |
| Subagent routing | Model follows text instructions | `agents` property enforces |
| User can't bypass | Nothing prevents direct agent access | `user-invocable: false` |
| Workflow guidance | User types commands from memory | Handoff buttons appear automatically |

### Model selection

Currently, no agent specifies a `model` property in its YAML frontmatter — model selection is left to VS Code defaults or user preference. This is intentional: the auto-injected rules ensure correct behavior regardless of which model is used.

If needed, a `model` fallback list can be added to any agent:
```yaml
model:
  - Claude Sonnet 4.6 (copilot)    # First choice
  - Claude Haiku 4.5 (copilot)     # Fallback
  - GPT-4.1 (copilot)              # Fallback
```

VS Code tries each in order until one is available.

---

## 10. Hooks & Skills: Why Not Used

### Hooks

**What hooks do**: Run shell commands at VS Code lifecycle events (e.g., `onSave`, `onFileEdit`, `onSessionStart`).

**Why not used**: We have `tasks.json` which defines build/lint/test commands. The key difference:
- **Hooks** fire automatically at lifecycle events — we don't want validation running on every file save
- **tasks.json** is run explicitly by the executor at specific points in the workflow (after each task, in the correct order)

Our validation is **intentional and ordered** (build → lint → test, at specific phase-appropriate moments). Hooks would fire validation at wrong times (e.g., after every edit, before the task is complete).

**Possible future use**: A `sessionStart` hook could display the migration status automatically when a developer opens the workspace. But this adds complexity without clear benefit — the `/migrate` slash command already does this.

### Skills

**What skills do**: Package reusable multi-file capabilities with a `SKILL.md` descriptor. Skills are invoked by agents when their description matches the current task.

**Why not used**: 
- Skills are meant to be **portable** — used across different agents and workflows
- Our migration system IS the entire agent workflow, not a capability within a larger context
- Making the migration a "skill" would add a layer of indirection: an agent would need to recognize "this is a migration task" and invoke the skill, which then loads its own instructions — this is exactly what the orchestrator already does
- The auto-injected `.instructions.md` files achieve the same "always available" behavior without the skill packaging overhead

---

## 11. tasks.json: Why It Exists

`tasks.json` defines VS Code tasks for build/lint/test with consistent configuration:
- `CI=true` environment variable forces non-interactive mode
- Test task includes `--watch=false --code-coverage` arguments
- Dedicated panel presentation ensures output is captured

**Why not just run `npm run build` in terminal?**

The executor CAN fall back to direct terminal commands. But tasks.json provides:
1. **Consistency**: Same arguments and environment every time
2. **Reproducibility**: Developer can run the same tasks manually
3. **VS Code integration**: Task output is captured by VS Code's problem matcher

The executor tries VS Code tasks first, falls back to terminal if needed, and logs which method was used.

---

## 12. MIGRATION_PROGRESS.md: Why Not a Skill

**Your question**: Isn't MIGRATION_PROGRESS.md the same as a skill?

**No, and here's why**:

| Aspect | Skill (SKILL.md) | MIGRATION_PROGRESS.md |
|--------|-------------------|----------------------|
| **Purpose** | Package reusable capabilities | Track state of one migration |
| **Invocation** | Agent decides to invoke skill based on task description | Agent reads file every invocation |
| **Content** | Instructions for HOW to do something | Data about WHAT has been done |
| **Lifetime** | Permanent — exists across all migrations | Temporary — created per migration, deleted after |
| **Portability** | Designed to work in any project | Specific to one repo at one point in time |

MIGRATION_PROGRESS.md is a **state file**, not a capability. It contains data (task statuses, evidence, baselines), not instructions. A skill would contain instructions for "how to run a migration" — which is what the agent files and instruction files already do.

---

## 13. v4 → v5 Changes & Rule Mapping

### What changed structurally

| v4 | v5 | Change type |
|----|-----|-------------|
| 6 plain `.md` instruction files (not auto-injected) | 4 `.instructions.md` files (auto-injected) | Platform enforcement |
| 3 agents (no tool/agent restrictions) | 4 agents (with tools, agents, user-invocable) | Structured |
| No AGENTS.md | AGENTS.md for always-on context | Added |
| No prompt file | migrate.prompt.md for /migrate command | Added |
| No validator | migration-validator.agent.md | Added |
| MANDATORY STARTUP PROTOCOL (broken) | Auto-injection via applyTo: '**' | Replaced |
| ~3,957 total lines | ~1,000 total lines | 75% reduction |

### What was preserved (every rule)

All 30 hard rules (H1-H30) are present in v5:
- H1-H4: In migration-rules.instructions.md Initialization Gates
- H5-H8: In migration-rules.instructions.md Documentation Discovery + Task Execution
- H9-H13: In migration-rules.instructions.md Task Execution + State Management
- H14-H16: In migration-rules.instructions.md Phase Boundaries
- H17-H20: In migration-rules.instructions.md Task Execution (component replacement, workspace-first, no halfway, repo conflicts)
- H21: In migration-rules.instructions.md Validation Rules (Phase B transitional failures)
- H22-H24: In migration-rules.instructions.md State Management + Validation Rules
- H25: Replaced by auto-injection (no longer needed as explicit rule)
- H26-H28: In migration-rules.instructions.md Task Execution + Error Handling
- H29-H30: In migration-rules.instructions.md Task Execution + Validation Rules

---

## 14. How to Modify the System

### Add a new rule

Add it to `.github/instructions/migration-rules.instructions.md` in the appropriate section. It will be auto-injected into all agents automatically.

### Add a project-specific rule

Edit `.github/instructions/migration-custom-user.instructions.md`. This is auto-injected too.

### Change which tools an agent can use

Edit the `tools` array in the agent's YAML frontmatter:
```yaml
tools: ['read', 'search', 'edit', 'execute', 'web']
```

### Add a new agent

1. Create `.github/agents/my-agent.agent.md` with YAML frontmatter
2. Add `user-invocable: false` if it's a subagent
3. Add the agent name to the orchestrator's `agents` array
4. Add routing logic to the orchestrator's command table

### Change the model priority

Edit the `model` array in any agent's YAML frontmatter:
```yaml
model:
  - Claude Haiku 4.5 (copilot)     # cheapest first
  - Claude Sonnet 4.6 (copilot)
```

### Add a new phase

1. Add the phase section to `templates/MIGRATION_PROGRESS.template.md`
2. Add a phase gate to the orchestrator
3. Add phase-specific validation rules to the executor

### Support a different migration target (e.g., Angular 20)

1. Edit `.github/instructions/migration-18-19.instructions.md` (rename to `migration-19-20.instructions.md`)
2. Update version-specific URLs and data
3. The system discovers tasks at runtime from whatever docs you point it to — no other changes needed

### Enable recursive subagents

If you need agents to spawn sub-subagents, enable the VS Code setting:
```json
"chat.subagents.allowInvocationsFromSubagents": true
```

Not needed for the current architecture.

### Add hooks (if needed in future)

Create `.github/hooks.json`:
```json
{
  "hooks": {
    "sessionStart": [
      {
        "command": "cat MIGRATION_PROGRESS.md | head -20",
        "description": "Show migration status at session start"
      }
    ]
  }
}
```

### Add MCP servers

If OneCX provides an MCP server for docs, add to `.vscode/mcp.json`:
```json
{
  "servers": {
    "onecx-docs": {
      "type": "stdio",
      "command": "onecx-mcp-server"
    }
  }
}
```

Then reference in agent frontmatter if needed.
