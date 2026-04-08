# User Guide: OneCX Angular Migration Agent v5

## Table of Contents

1. [What This Is](#1-what-this-is)
2. [Prerequisites](#2-prerequisites)
3. [Setup](#3-setup)
4. [Starting a Migration](#4-starting-a-migration)
5. [Phase-by-Phase Walkthrough](#5-phase-by-phase-walkthrough)
6. [Commands Reference](#6-commands-reference)
7. [Skip~N: When and How](#7-skipn-when-and-how)
8. [Understanding Validation](#8-understanding-validation)
9. [Troubleshooting](#9-troubleshooting)
10. [FAQ](#10-faq)

---

## 1. What This Is

This is an AI-assisted migration system for upgrading OneCX Angular microfrontend applications (e.g., Angular 18 → 19). It uses VS Code's custom agent system to automate the migration through 4 specialized AI agents:

- **Orchestrator**: The coordinator you interact with. Routes work to other agents.
- **Planner**: Discovers all migration tasks from official documentation (runs once).
- **Executor**: Executes one task at a time with full evidence collection.
- **Validator**: Independently verifies task completeness and phase readiness.

The system tracks all progress in `MIGRATION_PROGRESS.md` — a single file that serves as the complete audit trail of your migration.

---

## 2. Prerequisites

- **VS Code** with GitHub Copilot Chat enabled (agent mode)
- **Node.js** 20+ and **npm** installed
- A working OneCX Angular project with passing build/lint/test
- A **feature branch** (not main/master/develop)

### Supported Models

The setup works with any model available in VS Code Copilot:

| Model | How It Works |
|-------|--------------|
| Claude Haiku 4.5 (200K) | Budget-friendly, works well due to auto-injected rules |
| Claude Sonnet 4.6 | Best overall balance of quality and speed |
| Claude Opus 4.6 | Use for complex tasks when other models struggle |
| GPT-4.1 | Free tier compatible |
| Grok Code Fast 1 | Fast iterations |

You don't need to select a model — VS Code uses your configured default. You can optionally add a `model` property to any agent's YAML for prioritized fallback.

---

## 3. Setup

### Step 1: Copy files to your repo

```bash
cp -r .github/* /path/to/your/repo/.github/
```

Your repo should now have:
```
your-repo/
├── .github/
│   ├── AGENTS.md
│   ├── agents/
│   │   ├── migration-orchestrator.agent.md
│   │   ├── migration-planner.agent.md
│   │   ├── migration-executor.agent.md
│   │   └── migration-validator.agent.md
│   ├── instructions/
│   │   ├── migration-rules.instructions.md
│   │   ├── migration-progress-format.instructions.md
│   │   ├── migration-custom-user.instructions.md
│   │   └── migration-18-19.instructions.md
│   ├── prompts/
│   │   └── migrate.prompt.md
│   └── templates/
│       ├── MIGRATION_PROGRESS.template.md
│       └── tasks.json
```

### Step 2: Create a feature branch

```bash
git checkout -b feature/angular-19-upgrade
```

The system will refuse to start on main/master/develop.

### Step 3: Customize (recommended)

Edit `.github/instructions/migration-custom-user.instructions.md` to add your project-specific rules. For example:
- Component patterns used in your project
- Known working reference files in your repo
- CSS/SCSS import conventions
- Permission mapping conventions

Optionally, edit `.github/instructions/migration-18-19.instructions.md` to pre-fill documentation URLs and target versions for your specific migration path.

### Step 4: Verify your project builds

```bash
npm install
npm run build
npm run lint
npm run test
```

All 4 must pass. The planner will check these at startup and refuse to proceed if any fail.

---

## 4. Starting a Migration

### Option A: Slash command

Type in VS Code Chat:
```
/migrate
```

### Option B: Direct agent invocation

```
@migration-orchestrator "Start Phase 1"
```

### What happens next

1. The orchestrator checks your branch (must be a feature branch)
2. It routes to the **planner** agent
3. The planner:
   - Runs npm install/build/lint/test to establish baselines
   - Reads your package.json for current versions
   - Fetches all migration documentation pages
   - Creates `MIGRATION_PROGRESS.md` with the complete task tree
4. The planner reports back with task counts and structure

---

## 5. Phase-by-Phase Walkthrough

### Phase 1: Planning (Automatic)

The planner discovers all tasks from documentation. You don't need to do anything except review the output.

**Output**: `MIGRATION_PROGRESS.md` with all Phase A and Phase C tasks listed.

### Phase A: Pre-Migration Code Changes

These are code changes made BEFORE the core version upgrade. Examples: import renames, template updates, config adjustments.

To execute tasks:
```
@migration-orchestrator "Continue execution"
```

Each invocation:
1. The executor picks up the next `[ ]` task
2. Fetches the source documentation
3. Checks your repo for applicability
4. Executes the changes
5. Validates (build → lint → test; skipped for not-applicable tasks with 0 file changes)
6. Updates MIGRATION_PROGRESS.md with evidence
7. Stops — returns control to you

**Repeat** "Continue execution" until all Phase A tasks are complete.

After each task, the orchestrator shows clickable handoff buttons:
- **▶ Continue Execution** — do the next task
- **⏭ Skip Tasks** — mark tasks not applicable
- **📊 Show Status** — see progress
- **✓ Validate** — run independent verification

### Phase A → B Transition (Manual Approval Gate)

When all Phase A tasks are done, the orchestrator:
1. Routes to the **validator** for a phase gate check
2. Shows you a summary of all changes
3. **Asks you to verify and commit**: Review all changes, run build/lint/test locally, then commit:
   ```bash
   git add . && git commit -m "Phase A: pre-migration code changes"
   ```
4. Asks: **"Ready to approve core Angular upgrade?"**

Your response:
- **Yes** → The executor fetches the OneCX upgrade guide and executes the upgrade
- **No** → The executor creates a manual cheatsheet from docs for you to run yourself
- **Anything else** → Defaults to Yes

### Phase B: Core Upgrade

The executor:
1. Detects your repo type (Nx vs standard Angular)
2. Fetches the upgrade documentation
3. Resolves exact stable versions (never beta/RC)
4. Executes the upgrade commands from docs
5. Validates with build/lint/test

### Phase B → C Transition (Manual Confirmation)

After Phase B:
1. Validator checks stability (build/lint/test)
2. **Verify and commit**: Review the upgrade changes, then commit:
   ```bash
   git add . && git commit -m "Phase B: core Angular upgrade"
   ```
3. You confirm before proceeding to cleanup

### Phase C: Post-Migration Cleanup

Same workflow as Phase A ("Continue execution" per task), but:
- Transitional build/test failures are expected and recorded
- Lint MUST still pass
- After ALL Phase C tasks: an error recovery loop reruns build/lint/test to verify everything is resolved

### Migration Complete

After all Phase C tasks and the error recovery loop:
1. **Verify and commit**: Review all post-migration changes, then commit:
   ```bash
   git add . && git commit -m "Phase C: post-migration cleanup"
   ```
2. Run final validation:
```
@migration-orchestrator "Validate"
```

The validator performs a final check: build/lint/test pass, coverage comparison, all tasks resolved.

---

## 6. Commands Reference

| Command | What It Does |
|---------|-------------|
| `"Start Phase 1"` | Initialize: audit repo, discover docs, create task tree |
| `"Continue execution"` | Execute next uncompleted task |
| `"Skip~N"` | Mark next N tasks as not applicable |
| `"Status"` | Show current phase and task progress |
| `"Validate"` | Independent verification of latest work or phase gate |
| `"Help"` | Show available commands |

All commands go to `@migration-orchestrator`.

---

## 7. Skip~N: When and How

### When to use Skip~N

- Task is conditional and confirmed not applicable to your repo
  - Example: "Update NgModule declarations" but your repo uses standalone components
- Task was already completed manually before starting migration
- Batch of similar tasks clearly don't apply
  - Example: `Skip~3` to skip tasks 4, 5, 6 if all are NgModule-related

### When NOT to use Skip~N

- You're not sure if the task applies → run it, let executor check evidence
- Task is complex but required → don't skip to save time
- Task might fail → don't skip to avoid the failure

### How to undo a skip

1. Open MIGRATION_PROGRESS.md
2. Change the task from `[-]` back to `[ ]`
3. Run "Continue execution" — executor will pick it up

### What gets recorded

```markdown
- [-] Task name (Skipped by developer on 2025-01-15)
```

### Task Entry Templates (Copy-Paste Ready)

Use these templates to manually add entries to MIGRATION_PROGRESS.md when needed.

#### Not-Applicable Task (executor determined all items absent)

```markdown
**A.N. [Task Name] — [H2 Title from Docs]**
- [-] not applicable
- Source page: [URL]
- Applicability: not applicable
- Repository evidence:
  - `grep -rn "Pattern1|Pattern2" --include="*.ts" --include="*.html" --exclude-dir=node_modules --exclude-dir=coverage .` → 0 hits ✓ NOT PRESENT
  - [Add one grep per sub-step showing 0 hits]
- Sub-steps executed:
  - [Sub-step 1]: not-applicable (0 hits in codebase)
  - [Sub-step 2]: not-applicable (0 hits in codebase)
- Files changed: none
- Validation: skipped (no file changes — task not applicable)
- Final outcome: not applicable (all patterns absent from application source)
```

#### Developer-Skipped Task (Skip~N)

```markdown
**A.N. [Task Name] — [H2 Title from Docs]**
- [-] Skipped by developer on [YYYY-MM-DD]
- Source page: [URL]
- Applicability: skipped by developer
- Repository evidence: [optional — developer confirmed not applicable]
- Sub-steps executed: none (skipped)
- Files changed: none
- Validation: skipped (developer skip)
- Final outcome: skipped
```

#### Reclassified Task (moved from Phase A to Phase C)

```markdown
**A.N. [Task Name] — [H2 Title from Docs]**
- [ ] reclassified to Phase C (see C.M)
- Source page: [URL]
- Applicability: must-have — but requires package incompatible with current Angular version
- Repository evidence:
  - `grep -rn "pattern" --include="*.html" --exclude-dir=node_modules .` → N hits ✓ FOUND — task applies
  - `npm view @package@version peerDependencies` → requires @angular/core: '^19.0.0' — INCOMPATIBLE with current Angular 18
- Reclassification reason: [package] requires Angular [N]+ as peer dependency; cannot be installed in Phase A
- Files changed: none (reclassified, not executed)
- Validation: skipped (reclassified — no changes made)
- Final outcome: reclassified to C.M

---
[In Phase C section:]

**C.M. [Task Name] — [H2 Title from Docs] (reclassified from A.N)**
- [ ] not started
- Source page: [URL]
- Reclassified from: A.N (package requires Angular [N]+)
- [... standard evidence fields filled by executor when executed ...]
```

---

## 8. Understanding Validation

### Phase A: Full Validation (with skip for not-applicable tasks)
- npm run build → npm run lint → npm run test after each task
- Phase A changes are made against the CURRENT Angular version — the build must pass
- If a task is marked `[-]` (not applicable) with zero files changed, validation is skipped
- The last Phase A task records build state as a final confirmation

### Phase B: Full Validation
- npm run build → npm run lint → npm run test (always this order)
- Transitional build/test failures allowed IF every error maps to a Phase C task
- Lint MUST pass even in Phase B

### Phase C: Full Validation + Recovery
- Same order: build → lint → test after each task
- Transitional failures recorded but don't block task completion
- After ALL Phase C tasks: error recovery loop reruns everything
- Remaining failures are documented for manual fix

---

## 9. Troubleshooting

### "npm install fails at Phase 1"
Fix dependency issues in your project first. The migration system requires a clean baseline.

### "Agent doesn't follow the rules"
Verify `.github/instructions/migration-rules.instructions.md` has `applyTo: '**'` in its YAML header. This ensures auto-injection into every agent.

### "Tasks seem incomplete"
Run `@migration-orchestrator "Validate"` — the validator checks all 8 evidence fields.

### "Build fails during Phase A"
Phase A changes are made against the CURRENT Angular version — the build should pass. If it fails, the executor must fix the error in the same invocation without reverting the migration change.

### "Build fails during Phase C"
Expected. The executor records errors and continues. After all Phase C tasks, the error recovery loop checks which errors are now resolved.

### "Model picks wrong subagent"
Only the orchestrator can invoke subagents (enforced by `agents` property). If issues persist, check that the orchestrator's `agents` array lists the correct agent names.

### "Too many credits used"
- Use Claude Haiku 4.5 for routine tasks (cheapest)
- Use Skip~N for tasks confirmed not applicable
- Review MIGRATION_PROGRESS.md between runs to avoid redundant execution

---

## 10. FAQ

**Q: Can I run this on main branch?**
A: No. The system requires a feature branch for safety.

**Q: Can I invoke the executor directly?**
A: No. The planner, executor, and validator have `user-invocable: false`. Only the orchestrator is visible in the agent dropdown.

**Q: What if I already have copilot-instructions.md?**
A: The system uses `AGENTS.md` instead, so your existing instructions are not overwritten.

**Q: Can I modify a task in MIGRATION_PROGRESS.md manually?**
A: Yes. Change `[-]` back to `[ ]` to re-enable a skipped task, or add notes to any task entry.

**Q: What if the migration docs change mid-migration?**
A: The executor fetches documentation fresh for each task. If docs change, subsequent tasks will use the updated docs.

**Q: Does the system support Angular 19 → 20 or other versions?**
A: Yes. The system discovers tasks at runtime from whatever documentation you point it to. Change the target version and the planner will fetch the appropriate docs.
