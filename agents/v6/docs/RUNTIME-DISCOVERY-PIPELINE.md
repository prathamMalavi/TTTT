# Runtime Discovery Pipeline: V6 Methodology

**Used by**: Migration Planner (Phase 1)

**Purpose**: Discover all migration tasks at runtime from documentation, not hardcoded lists.

**Result**: Complete task tree in MIGRATION_PROGRESS.md ready for execution.

---

## Why Runtime Discovery?

- ✅ Docs change between versions → Tasks automatically stay current
- ✅ Multiple migration paths support different starting versions
- ✅ Repository evidence determines applicability → No false positives
- ✅ No maintenance of hardcoded task lists → Scales automatically

---

## 7-Stage Pipeline

### Stage 1: Infer Current Migration Context

**Goal**: Understand what version the repo is currently at.

**How**:
- Read `package.json` → Extract `@angular/core` version
- Read `nx.json` (if Nx repo) → Check nx version
- Check for `.angular-cli.json` vs `angular.json` (pre/post v6)
- Record: Current Angular version, Current Nx version (if applicable)

**Stop if**:
- Cannot determine current version → Ask user for clarification

**Output**:
```
✓ Current version: Angular 18
✓ Nx version: 17.3.2
✓ CLI type: angular.json (post-v6 tooling)
```

---

### Stage 2: Identify Documentation Sources (MCP-First)

**Goal**: Find the authoritative migration docs for this target.

**How**:
- Try OneCX MCP first (get OneCX migration index → Get OneCX MCP context)
- If MCP unavailable → Try OneCX public docs URL
- If target mentions PrimeNG → Fetch PrimeNG MCP (component migration)
- If target mentions Nx → Fetch Nx migration guide
- Check for local `/docs/MIGRATION.md` in repo

**Recorded Sources**:
```
✓ OneCX MCP: [available/unavailable]
✓ PrimeNG MCP: [available/unavailable]  
✓ Nx migration: [path/URL]
✓ Local docs: [found/not found]
```

**Stop if**:
- No documentation sources available for target version → Ask user for docs URL

---

### Stage 3: Fetch & Read Migration Index

**Goal**: Get the main migration documentation page.

**How**:
- Use fetched MCP source to get index page content
- Read FULL index page (not summary)
- Look for: Overview section, Prerequisites section, Links section
- Identify H2 subsections (these become parent tasks)
- Identify links to other pages (these become linked pages)

**Extracted**:
```
Index page URL: [...]
H2 sections found:  [ "Prerequisites", "Phase A: Templates", "Phase B: Imports", ... ]
Links found:        [ "PrimeNG Migration", "Nx Migration", "CSS Updates", ... ]
```

**Stop if**:
- Cannot fetch index page → Report error, ask for fallback URL

---

### Stage 4: Expand All Linked Pages (Strict Expansion)

**Goal**: Follow every link from the index; extract all tasks.

**How** (for each link):
- Fetch full page content
- Count H2 subsections (each = task)
- Check if page has sub-links → Fetch those too
- Record: Page URL, all H2 subsections, any sub-pages

**Expansion Tree Example**:
```
Index
├─ PrimeNG Migration (page)
│  ├─ Section: Component Updates → Task
│  ├─ Section: Theme Updates → Task
│  └─ Link: "See component matrix" → Sub-page
│     ├─ Section: Button → Task
│     ├─ Section: Card → Task
├─ Nx Migration (page)
│  ├─ Section: Dependency Update → Task
│  └─ Section: Build Config → Task
└─ CSS Updates (page)
   ├─ Section: SCSS Variables → Task
   └─ Section: Tailwind Integration → Task
```

**Output**:
```
✓ Visited 8 pages
✓ Extracted 24 H2 sections
✓ Extracted 3 sub-pages
✓ Total linked content: [size]
✓ All links visited: YES
```

**Stop if**:
- Any page fails to fetch → Report error, ask for manual URL
- Any H2 section unclear → Apply Ambiguity Rule, ask user

---

### Stage 5: Classify & Build Task Hierarchy

**Goal**: Organize tasks into parent/child/leaf structure matching Phase A/B/C.

**How**:
- Group tasks by phase (Phase A imports, Phase B build, Phase C cleanup)
- Within each phase, identify dependencies:
  - Can task B run before task A? → Task A is parent, B is child
  - Is this task a standalone unit? → It's a leaf task
- Create hierarchy (parent → child → child → leaf)

**Classification**:
```
Phase 1 (Planning) - 7 audit tasks
├─ npm install
├─ npm test baseline
├─ Branch check
└─ [... 4 more audit tasks]

Phase A (Code Changes) - 15 tasks
├─ Template Updates (parent)
│  ├─ Update ocx-modal (leaf)
│  ├─ Update ocx-button (leaf)
│  └─ Update ocx-card (leaf)
├─ Import Fixes (parent)
│  ├─ Update component imports (leaf)
│  └─ Update style imports (leaf)
└─ Standalone tasks...

Phase B (Validation) - 0 tasks (all validation is npm build/lint/test)

Phase C (Cleanup) - 4 tasks
├─ Remove old styles (leaf)
├─ Clean build artifacts (leaf)
└─ [... 2 more cleanup tasks]
```

**Output**:
```
✓ Total tasks: 26
✓ Phase A tasks: 15
✓ Phase B tasks: 0 (automatic npm validation)
✓ Phase C tasks: 4
✓ Leaf tasks: 22
✓ Parent tasks: 4
```

---

### Stage 6: Check Applicability with Repository Evidence

**Goal**: Determine which tasks apply to THIS repo (not all repos).

**How** (for each task):
- Task mentions component X → Run `grep -r "X" src/` (present? yes/no)
- Task mentions package Y → Check `package.json` (present? yes/no)
- Task mentions config Z → Check `angular.json` or file (present? yes/no)
- Mark: `must-have` (repo needs this) or `[-] not applicable` (doesn't apply)

**Applicability Check**:
```
Task: "Update ocx-modal component"
├─ Current codebase imports ocx-modal? YES (grep found 8 imports)
├─ Applicability: MUST-HAVE
└─ Evidence: [import list]

Task: "Migrate Tailwind CSS"
├─ Current codebase uses Tailwind? NO (not in package.json, no tailwind.config.js)
├─ Applicability: NOT APPLICABLE [-]
└─ Evidence: [checked package.json, no tailwind import found]
```

**Default When Uncertain**:
- If task might apply (e.g., "update styles") → Default to must-have (safer)
- Better to execute unnecessary task than miss required one

**Output**:
```
✓ Applicability checks complete
✓ Must-have tasks: 18
✓ Not-applicable tasks: 8
✓ Executable task count: 18
```

---

### Stage 7: Persist State & Create MIGRATION_PROGRESS.md

**Goal**: Write task tree to MIGRATION_PROGRESS.md for executor to consume.

**How**:
- Use template from `templates/MIGRATION_PROGRESS.template.md`
- Populate with all discovered tasks
- Mark all tasks `[ ]` (not started)
- Record source page for each task
- Add audit section with Phase 1 results (npm install, tests, coverage %, branch, etc.)

**Format**:
```markdown
# Migration Progress: Angular 18 → Angular 19

## Phase 1: Discovery (COMPLETED)

### Audit Results
- npm install: ✓ success
- npm test baseline: ✓ passed (coverage: 87.3%)
- Branch: ✓ feature/angular-19-upgrade
- Copilot instructions: ✓ tagged 3 Angular-18 lines

### Discovery Results
- Documentation sources: OneCX MCP, PrimeNG MCP, Nx docs
- Pages visited: 8/8 (100%)
- Total tasks discovered: 18
- Must-have: 16 | Not applicable: 2

---

## Phase A: Code Changes (16 tasks)

### Templates (Parent)
- [ ] Update ocx-modal component  
  *Source: [OneCX migration guide](link)*
  
- [ ] Update ocx-button component
  *Source: [OneCX migration guide](link)*

### Imports (Parent)
- [ ] Fix component imports
  *Source: [OneCX migration guide](link)*

...

## Phase B: Validation (Automatic)
- Build: `npm run build` (automatic after Phase A)
- Lint: `npm run lint` (automatic after Phase A)
- Test: `npm run test` (automatic after Phase A)

## Phase C: Cleanup (2 tasks)
- [ ] Remove deprecated styles
  *Source: [OneCX cleanup guide](link)*

- [ ] Archive pre-migration branch backup
  *Source: [Handover checklist](link)*
```

**Output**:
```
✓ MIGRATION_PROGRESS.md created
✓ File size: [N lines]
✓ All 18 tasks recorded
✓ Ready for Phase A execution
```

---

## Pipeline Completeness Check

At end of Stage 7, verify:

- ✅ All links from index visited? (Y/N)
- ✅ All H2 sections extracted? (Total count: N)
- ✅ All pages readable? (Failures: N)
- ✅ All tasks have source pages? (Missing: N)
- ✅ All tasks classified Phase A/B/C? (Unclassified: N)
- ✅ All tasks checked for applicability? (Unchecked: N)
- ✅ MIGRATION_PROGRESS.md written? (Y/N)
- ✅ Phase 1 audit complete? (All 7 Phase 1 tasks done: Y/N)

**Stop if**:
- Any verification check fails → Report which checks failed, retry

---

## Handling Discovery Issues

### Problem: Link returns 404 or empty
**Solution**:
- Record the error
- Try alternate source (local URL or fallback public URL)
- Ask user if no source available

### Problem: Page is contradictory or ambiguous
**Solution**:
- Stop
- Use Ambiguity Rule (ask user one specific question)
- Await clarification before continuing

### Problem: Cannot determine if task applies
**Solution**:
- Default to must-have (safer than skipping)
- Executor will validate during execution
- If not applicable, executor will discover and mark `[ ]` (not executed)

### Problem: Task tree is massive (100+ tasks)
**Solution**:
- Verify all sections were extracted (not overcount)
- Verify sub-pages weren't accidentally flattened
- Verify applicability checks aren't marking unrelated tasks
- Pro tip: Ask user if some sections can be marked `[-] not applicable` upfront

---

## V6 Specifics

### Phase A Validation Strategy
- Phase 1 creates task tree
- Phase A executor handles tasks one-by-one
- Phase A validation = inspection only (grep, file checks, pattern matching)
- NO npm build during Phase A (too many changes, intermediate builds noisy)

### Phase A Early Exit
- If any Phase A task fails validation (applicability issue)
- Executor records the failure, stays `[ ]`, stops
- Orchestrator awaits manual fix or skip
- Restart Phase A from failed task

### MCP Preference Order
1. OneCX MCP (if available)
2. PrimeNG MCP (if target includes PrimeNG migration)
3. Nx MCP (if Nx involved)
4. Local docs (`/docs/MIGRATION.md`)
5. Public fallback URLs

---

## Cross-Reference

- [AGENT-RULES.md](AGENT-RULES.md) - Universal rules (When to Ask, Ambiguity)
- [HARD-RULES.md](HARD-RULES.md) - Non-negotiable constraints (H6: All links visited, H7: Applicability checks)
- [STRICT-DOC-EXPANSION.md](STRICT-DOC-EXPANSION.md) - How to expand docs without assumptions
- [migration-planner-v6.agent.md](../agents/migration-planner-v6.agent.md) - Planner agent implementation
