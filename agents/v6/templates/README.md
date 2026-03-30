# Migration-V6 Quick Start

**Goal**: Minimal-setup OneCX Angular 19 migration system with skip functionality.

---

## 1️⃣ Setup (Choose One)

### Option A: Copy to your repo
```bash
# Copy agents, templates, docs to your repo
cp -r migration-v6/* /path/to/your/repo/.copilot/

# Verify
ls -la /path/to/your/repo/.copilot/
# Should show: agents/, templates/, docs/
```

### Option B: Use from docs-onecx directly
```bash
# In your VS Code, create .copilot symlink
ln -s /path/to/docs-onecx/migration-v6 /path/to/your/repo/.copilot
```

### Option C: Reference from copilot-instructions.md
```markdown
See migration guidance at: file:///path/to/docs-onecx/migration-v6/

Agents available:
- @migration-orchestrator-v6
- @migration-planner-v6
- @migration-executor-v6
```

---

## 2️⃣ Start Migration

### Command 1: Initialize Phase 1
```
@migration-orchestrator-v6

"Start Phase 1"
```

**What happens**:
- @migration-planner-v6 starts
- Audits repo: npm install, npm test baseline, configuration
- Fetches ✅ ALL OneCX migration doc pages (visits every link, reads full content)
- Fetches PrimeNG v19 migration (if applicable)
- Creates MIGRATION_PROGRESS.md with complete task tree
- Shows: "X tasks discovered in Phases A & C"

**Time**: ~5 minutes

---

## 3️⃣ Execute Phase A

### Command 2: Run next task
```
@migration-orchestrator-v6

"Continue execution"
```

**What happens**:
- @migration-executor-v6 runs
- Executes ONE task (exactly as documented)
- Collects evidence: source pages, repo check, action, files changed
- Validates: npm build, npm lint, npm test
- Updates MIGRATION_PROGRESS.md with results [ ] → [x]
- Stops (does NOT auto-continue)

**Repeat**:
```
"Continue execution"  # Task 1 done, starts task 2
"Continue execution"  # Task 2 done, starts task 3
# ... repeat until Phase A complete
```

**Time per task**: 2-10 minutes (depends on complexity)

---

## 4️⃣ Skip Tasks (Optional)

### Command 3: Skip N tasks
```
@migration-orchestrator-v6

"Skip~3"
```

**What happens**:
- Marks next 3 tasks as `[-] not applicable`
- Records: "Skipped by [you] on [date]"
- Jumps to task 4
- Updates MIGRATION_PROGRESS.md

**When to use**:
- Task is conditional and doesn't apply to your repo
- You already did the task manually before starting
- Task is optional (nice-to-have) per docs

**When NOT to use**:
- Task is required (must-have) - talk to dev lead instead
- You're not sure if applicable - run the task and let executor decide
- Executor fails - retry with fix, don't skip

**Example**:
```
Our repo uses Standalone components (not NgModule).
Tasks 2-4 ("Update NgModule declarations") don't apply.

Skip~3  →  Mark tasks 2,3,4 as [-]  →  Jump to task 5
```

---

## 5️⃣ Phase A Complete → Phase B Confirmation

When MIGRATION_PROGRESS.md shows all Phase A tasks [x]:

### Command 4: Manual validation
```bash
# YOU run locally in repo:
npm run build      # Full output, must pass
npm run lint       # Must be 0 errors, 0 warnings
npm run test       # Check coverage vs baseline

# Also:
git diff package-lock.json | head -50
# Confirm only version changes, no structural changes
```

### Command 5: Update progress file
```markdown
# In MIGRATION_PROGRESS.md, Phase B section:
- [x] I have run npm run build locally
- [x] I have run npm run lint (0 errors)
- [x] I have run npm run test (coverage OK)
- [x] All tests PASS
- [x] Signature: Jane Doe, 2025-01-15
```

---

## 6️⃣ Execute Phase C

### Command 6: Continue with Phase C
```
@migration-orchestrator-v6

"Continue execution"
```

**What happens**:
- Execution resumes at first [ ] task in Phase C
- Executor handles cleanup tasks (remove [REMOVE-AFTER-A19] markers, etc.)
- Same validation: npm build, npm lint, npm test
- Updates MIGRATION_PROGRESS.md

**Repeat**:
```
"Continue execution"  # Phase C task 1
"Continue execution"  # Phase C task 2
# ... until Phase C complete
```

---

## 7️⃣ Migration Complete

### Final Status
```
@migration-orchestrator-v6

"Status"
```

**Output**:
```
Phase 1: ✓ Complete
Phase A: ✓ 24 tasks completed
Phase B: ✓ Signed off by Jane Doe
Phase C: ✓ 6 tasks completed
Total: 30 tasks, 0 errors, 0 skipped

Coverage: 82% → 84%
Next: Merge to main and deploy.
```

---

## 📋 Common Commands

| Command | What It Does |
|---------|--------------|
| `"Start Phase 1"` | Initialize planning, create task tree |
| `"Continue execution"` | Execute next task (Phase A or C) |
| `"Skip~N"` | Mark next N tasks not applicable, jump to N+1 |
| `"Status"` | Show current progress |
| `"Validate"` | Re-run npm build/lint/test on latest task |
| `"Help"` | Show available commands |

---

## ⚠️ Troubleshooting

### "npm install fails"
→ Executor stops at Phase 1.
→ Fix dependency issue locally.
→ Run Phase 1 again.

### "npm build warns but doesn't fail"
→ **Important**: Executor stays [ ] (not started).
→ Fix lint warnings first.
→ Run executor again.

### "A task seems inapplicable but I'm not sure"
→ Run task anyway. Executor checks repo evidence.
→ If truly not applicable after check: mark [-].
→ Do NOT skip without evidence.

### "I already did task 5 manually"
→ Use: `Skip~1` to mark it complete and move to task 6.
→ Record: "Already done manually" in MIGRATION_PROGRESS.md.

### "Build passes but test is pending"
→ Executor waits. Does NOT mark [x].
→ Fix flaky tests.
→ Run executor again.

---

## 🎯 Best Practices

1. **One command = One task**
   - Do not ask for 2+ tasks in one command
   - Agent will execute exactly one and stop

2. **Check MIGRATION_PROGRESS.md between runs**
   - Confirms state before next command
   - Helps debug if something unexpected

3. **Use Skip~N sparingly**
   - Only for known non-applicable tasks
   - Do NOT skip to save time on hard tasks

4. **Keep local npm builds passing**
   - Each task requires npm build/lint/test
   - Failing local build = clear blocker sign

5. **Phase B is required**
   - Manual sign-off confirms tests green
   - Cannot skip to Phase C without it

---

## 📖 Need Help?

- **Questions about migration steps?** → See `../docs/`
- **Agents behaving oddly?** → Check `../docs/AGENT-BEHAVIOR.md`
- **Task applicability unclear?** → Ask in task execution; executor checks repo
- **Want to customize?** → Edit agent `.md` files, update rules as needed

---

**Total time estimate**: 30-60 minutes (Phase A + B + C)  
**Manual effort**: 5-10 minutes (Phase B sign-off)  
**Agent autonomy**: Maximum (only escalate on errors)
