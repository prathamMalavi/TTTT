# Developer Guide — OneCX Migration Agent v5

How to modify, extend, and maintain the agent architecture.

---

## File Map & Responsibilities

```
.github/
├── AGENTS.md                                    ← Project identity (always loaded)
├── agents/
│   ├── migration-orchestrator.agent.md          ← Routing, state, phase gates
│   ├── migration-planner.agent.md               ← Doc discovery, task tree creation
│   ├── migration-executor.agent.md              ← Task execution, code changes
│   └── migration-validator.agent.md             ← Independent verification
├── instructions/
│   ├── migration-rules.instructions.md          ← Hard rules (auto-injected)
│   ├── migration-progress-format.instructions.md ← Evidence format (auto-injected on MIGRATION_PROGRESS.md)
│   ├── migration-custom-user.instructions.md    ← User project rules (auto-injected)
│   └── migration-18-19.instructions.md          ← Version-specific data (NOT auto-injected)
├── prompts/
│   └── migrate.prompt.md                        ← /migrate slash command
└── templates/
    ├── MIGRATION_PROGRESS.template.md           ← Progress file blueprint
    ├── README.md                                ← User-facing quick-start
    └── tasks.json                               ← VS Code tasks template
```

> **Note**: All 4 agents currently have identical comprehensive tool lists including MCP tools (`onecx-docs-mcp/*`, `primeng/*`, `npm-sentinel/*`), VS Code integration (`vscode`, `browser`), and task management (`todo`). While the original design intended restricted tool sets per role, the current implementation gives all agents full access for maximum flexibility.

---

## How Auto-Injection Works

VS Code loads `.instructions.md` files based on the `applyTo` YAML frontmatter property:

| File | `applyTo` | When Injected |
|------|-----------|---------------|
| `migration-rules.instructions.md` | `'**'` | Every agent invocation (ALL files) |
| `migration-progress-format.instructions.md` | `'**/MIGRATION_PROGRESS.md'` | Only when MIGRATION_PROGRESS.md is in context |
| `migration-custom-user.instructions.md` | `'**'` | Every agent invocation |
| `migration-18-19.instructions.md` | *(none)* | Never auto-injected — attached manually or referenced by agents |

**Key**: Only files ending in `.instructions.md` are eligible for auto-injection. Plain `.md` files in the instructions folder are ignored by VS Code's injection system.

---

## How to Add a New Rule

### Step 1: Decide where the rule belongs

| Rule Type | File | Reason |
|-----------|------|--------|
| Hard rule (applies to ALL tasks, ALL phases) | `migration-rules.instructions.md` | Auto-injected everywhere via `applyTo: '**'` |
| Version-specific data (URLs, versions) | `migration-18-19.instructions.md` | Referenced by agents when needed |
| Project-specific convention | `migration-custom-user.instructions.md` | Auto-injected everywhere |
| Agent-specific behavior | The relevant `.agent.md` file | Only loaded for that agent |
| Evidence/format requirement | `migration-progress-format.instructions.md` | Loaded when editing MIGRATION_PROGRESS.md |

### Step 2: Add the rule text

Add to the appropriate section. For `migration-rules.instructions.md`, the sections are:
- **State Management** — MIGRATION_PROGRESS.md handling
- **Initialization Gates** — pre-conditions before migration starts
- **Task Execution** — how tasks are discovered and executed
- **Documentation Discovery** — how docs are fetched and parsed
- **Task Classification** — Phase A vs Phase C assignment rules
- **Validation Rules** — build/lint/test requirements per phase
- **Phase Boundaries** — transition rules between phases
- **No-Defer Rule** — no partial execution, no deferring sub-steps
- **Package Compatibility** — verify peer deps before installing packages
- **Error Handling** — failure recovery and escalation
- **Verification Checklist** — pre-completion checks
- **Build Failure Discipline** — never revert correct changes
- **CSS and File Scope** — stay in your repo
- **Test Strategy** — fix tests after migration
- **Decision Protocol** — when to ask vs when to proceed

### Step 3: Update all references

If the rule is referenced by agents, update these files:
1. The agent(s) that need to act on it
2. `MIGRATION_PROGRESS.template.md` if the rule creates a new tracking requirement
3. `docs/ARCHITECTURE.md` Rule System section if it's a new category

### Step 4: Verify context budget

After adding rules, count total auto-injected lines:
```
wc -l .github/AGENTS.md \
     .github/instructions/migration-rules.instructions.md \
     .github/instructions/migration-custom-user.instructions.md
```
Target: **<200 lines** total auto-injected content. Larger budgets reduce model performance.

---

## How to Remove a Rule

1. Delete the rule text from the relevant file
2. Search all `.agent.md` files for references to the rule concept
3. Update `MIGRATION_PROGRESS.template.md` if the rule had a tracking requirement
4. Update `docs/ARCHITECTURE.md` if the rule was documented there

---

## How to Add a New Instruction File

### Step 1: Create the file

```
.github/instructions/my-new-rules.instructions.md
```

### Step 2: Add YAML frontmatter

```yaml
---
name: My New Rules
description: What these rules do
applyTo: '**'          # or a specific glob pattern
---
```

**`applyTo` options:**
- `'**'` — injected on every invocation (use sparingly — counts against context budget)
- `'**/some-file.md'` — injected only when that file is in context
- `'src/**/*.ts'` — injected only when TypeScript source files are in context
- *(omit entirely)* — never auto-injected; agents must read it explicitly with file tools

### Step 3: Add content

Write rules as concise bullet points. Avoid prose — models respond better to structured lists.

### Step 4: Reference from agents (if not auto-injected)

If you omitted `applyTo`, agents need to read the file explicitly. Add a step to the relevant agent:
```markdown
## Step N: Read [My Rules]
Read `.github/instructions/my-new-rules.instructions.md` for [context].
```

### Step 5: Update documentation

Add the file to:
- `templates/README.md` architecture diagram
- `docs/ARCHITECTURE.md` file reference table
- This DEV-GUIDE file map

---

## How to Add a New Agent

### Step 1: Create the agent file

```
.github/agents/my-agent.agent.md
```

### Step 2: Add YAML frontmatter

Required properties:
```yaml
---
name: my-agent
description: What this agent does
argument-hint: "Example invocation"
user-invocable: false          # true = user can call directly; false = subagent only
tools: ['read', 'search']     # minimal tool set for the role
model:
  - Claude Sonnet 4.6 (copilot)
  - Claude Haiku 4.5 (copilot)
  - GPT-4.1 (copilot)
---
```

**Tool options:** `read`, `search`, `edit`, `execute`, `web`, `agent`, `vscode`, `todo`, `browser`, plus MCP tool globs like `onecx-docs-mcp/*`, `primeng/*`, `npm-sentinel/*`
- Currently all agents have identical comprehensive tool lists
- `agent` tool = can call other agents (only orchestrator should use this)
- Restrict tools per agent by editing the `tools` array in YAML if desired

### Step 3: Register in orchestrator

Add to `migration-orchestrator.agent.md` frontmatter:
```yaml
agents: ['migration-planner', 'migration-executor', 'migration-validator', 'my-agent']
```

Add a routing entry to the Command Routing table.

### Step 4: Add handoff button (optional)

In orchestrator frontmatter:
```yaml
handoffs:
  - label: "🔧 My Action"
    agent: migration-orchestrator
    prompt: "Route to my-agent"
    send: true
```

### Step 5: Update documentation

Add to `templates/README.md`, `docs/ARCHITECTURE.md`, and this DEV-GUIDE.

---

## How to Modify the MIGRATION_PROGRESS.md Template

File: `.github/templates/MIGRATION_PROGRESS.template.md`

### Structure

The template has these sections in order:
1. **Header** — project metadata (date, repo, branch, status)
2. **Custom Rules & Constraints** — user-specific rules
3. **Documentation Discovery** — pages visited, H2 verification table
4. **Dependency Analysis** — @onecx package matrix, TS compatibility
5. **Phase 1 table** — initialization/planning tasks
6. **Phase 1 Baseline Records** — npm install/build/lint/test results
7. **Phase A tasks** — pre-migration code changes (task template + placeholder)
8. **Phase B gate** — core upgrade approval section
9. **Phase C tasks** — post-migration cleanup (task template + placeholder)
10. **Phase C Error Recovery Loop** — final validation
11. **Current Session Context** — resumption state
12. **Error Log Repository** — captured failures
13. **Decision Log** — non-trivial choices
14. **Summary** — final statistics

### Adding a new section

Insert in logical order. Update the planner agent to populate it during Phase 1.

### Changing the task evidence format

The 8 required evidence fields are defined in `migration-progress-format.instructions.md`:
1. Source pages
2. Applicability
3. Repository evidence
4. Sub-steps executed
5. Files changed
6. Validation
7. Final outcome
8. Edge cases

To add a field: update both `migration-progress-format.instructions.md` AND the task template in `MIGRATION_PROGRESS.template.md`.

---

## How to Support a New Migration Version

Example: migrating from Angular 19 → 20.

### Step 1: Copy and rename the version-specific file

```bash
cp .github/instructions/migration-18-19.instructions.md \
   .github/instructions/migration-19-20.instructions.md
```

### Step 2: Update content

Fill in:
- New OneCX migration index URL
- New PrimeNG migration guide URL(s)
- New Nx migration guide URL
- Target version numbers
- Known breaking changes
- PrimeNG intermediate guide URLs

### Step 3: Update template header

In `MIGRATION_PROGRESS.template.md`, change:
```markdown
# Migration Progress: OneCX Angular 19 → 20
```

### Step 4: Update AGENTS.md (optional)

If the project identity reference mentions a specific version.

### Step 5: No changes needed to agents or rules

The agents and rules are version-agnostic — they reference "target version" dynamically.
The version-specific data file is where ALL version details live.

---

## YAML Frontmatter Reference

### Agent files (`.agent.md`)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Agent identifier (used in `agents:` lists and `@mentions`) |
| `description` | string | Yes | Shown in agent picker UI |
| `argument-hint` | string | No | Placeholder text in chat input |
| `user-invocable` | boolean | No | `true` = user-facing, `false` = subagent only (default: true) |
| `tools` | string[] | No | Allowed tools: read, search, edit, execute, web, agent |
| `agents` | string[] | No | Subagents this agent can call (only orchestrator needs this) |
| `model` | string or string[] | No | Model preference list (tried in order) |
| `handoffs` | object[] | No | Clickable follow-up buttons shown after response |

### Instruction files (`.instructions.md`)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Display name |
| `description` | string | Yes | What the instructions do |
| `applyTo` | glob string | No | Auto-injection pattern. Omit to disable auto-injection. |

### Prompt files (`.prompt.md`)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Slash command name (e.g., `migrate` → `/migrate`) |
| `description` | string | Yes | Shown in command picker |
| `agent` | string | No | Route to specific agent |
| `tools` | string[] | No | Tools available during this prompt |

---

## Context Budget

Every invocation loads:
1. `AGENTS.md` (~10 lines)
2. All `applyTo: '**'` instructions (~110 lines combined)
3. Agent body (~80-110 lines)
4. MIGRATION_PROGRESS.md content (passed by orchestrator)

**Total framework overhead: ~200-230 lines per invocation.**

Models have token limits. Keep auto-injected content concise:
- Rules file: aim for <100 lines
- Custom user rules: aim for <30 lines
- Agent bodies: aim for <120 lines each

If you need more content, use `applyTo` with specific globs (not `'**'`) or have agents read files on-demand.

---

## Testing Changes

After modifying any agent or instruction file:

1. **Syntax check**: Ensure YAML frontmatter has `---` delimiters, correct indentation, quoted glob patterns
2. **Context test**: Start a new chat, invoke `@migration-orchestrator "Help"` — verify it responds correctly
3. **Injection test**: Check that rules are being followed by asking the agent to describe its constraints
4. **Subagent test**: Have orchestrator route to a subagent — verify the subagent has access to auto-injected rules
5. **Model fallback test**: If available, test with a smaller model (Haiku) to verify instructions are clear enough

---

## Common Pitfalls

| Pitfall | Cause | Fix |
|---------|-------|-----|
| Agent ignores rules | Missing `applyTo: '**'` in instruction file | Add the property |
| Rules loaded but ignored | Too much content, model overwhelmed | Reduce auto-injected lines |
| Subagent can't be called | Not listed in orchestrator's `agents:` | Add to YAML array |
| File not auto-injected | Doesn't end in `.instructions.md` | Rename file |
| Handoff button missing | Wrong YAML syntax | Check handoffs array format |
| Agent has wrong tools | Tool not in `tools:` list | Add to YAML array |
| Model not available | Subscription doesn't include it | Model fallback list handles this |
| `applyTo` not working | Glob pattern not quoted | Use `applyTo: '**'` (single-quoted) |
