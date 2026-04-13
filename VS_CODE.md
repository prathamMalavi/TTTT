# VS Code AI Agent Features — Complete Reference

> Everything you can do with GitHub Copilot's agent system in VS Code.
> Extracted from official docs: https://code.visualstudio.com/docs/copilot

---

## Table of Contents

1. [Customization Overview](#1-customization-overview)
2. [Custom Agents](#2-custom-agents)
3. [Custom Instructions](#3-custom-instructions)
4. [Prompt Files](#4-prompt-files)
5. [Agent Skills](#5-agent-skills)
6. [Tools & Tool Sets](#6-tools--tool-sets)
7. [Subagents](#7-subagents)
8. [Hooks](#8-hooks)
9. [Agent Plugins](#9-agent-plugins)
10. [MCP Servers](#10-mcp-servers)
11. [Language Models](#11-language-models)
12. [Memory](#12-memory)
13. [Planning](#13-planning)
14. [Handoffs](#14-handoffs)
15. [Agent Types & Permission Levels](#15-agent-types--permission-levels)
16. [Slash Commands](#16-slash-commands)
17. [Keyboard Shortcuts](#17-keyboard-shortcuts)
18. [All Settings Reference](#18-all-settings-reference)
19. [File Locations Summary](#19-file-locations-summary)
20. [YAML Frontmatter Reference](#20-yaml-frontmatter-reference)
21. [Guides & Workflows](#21-guides--workflows)
22. [Quick Tips](#22-quick-tips)

---

## 1. Customization Overview

VS Code offers 7 ways to customize AI behavior:

| Feature | What It Does | When to Use |
|---------|--------------|-------------|
| **Custom Agents** | Persistent personas with tool restrictions, models, handoffs | Role-based workflows (planner, reviewer, executor) |
| **Instructions** | Always-on or file-scoped coding guidelines | Project standards, language conventions |
| **Prompt Files** | Reusable slash-command tasks | One-off actions (scaffold component, run tests) |
| **Skills** | Portable folders with instructions + scripts + resources | Multi-agent portable capabilities |
| **Hooks** | Shell commands at lifecycle events | Enforce policies, auto-format, audit logging |
| **Plugins** | Pre-packaged bundles from marketplaces | Install community skills/agents/hooks/MCP |
| **MCP Servers** | External tools via Model Context Protocol | Connect to APIs, databases, external services |

**Chat Customizations Editor**: `Ctrl+Shift+P` → `Chat: Open Chat Customizations` — discover, create, manage everything in one place.

**Get Started Incrementally**:
1. `/init` — generate `copilot-instructions.md` tailored to your codebase
2. Add targeted `*.instructions.md` files for specific file types
3. Create prompt files for common workflows + add MCP servers
4. Build custom agents for specialized roles
5. Package reusable capabilities as agent skills

---

## 2. Custom Agents

Custom agents define **how chat operates** — which tools, model, instructions, and handoffs are active.

### File Format

```markdown
---
name: my-agent
description: What this agent does
argument-hint: "Hint text shown in chat input"
user-invocable: true              # Show in agents dropdown (default: true)
disable-model-invocation: false   # Allow as subagent (default: false)
tools: ['read', 'search', 'edit', 'execute', 'web']
agents: ['sub-agent-1', 'sub-agent-2']  # Allowed subagents (* = all, [] = none)
model:
  - Claude Sonnet 4.6 (copilot)
  - GPT-4.1 (copilot)
handoffs:
  - label: "Next Step"
    agent: other-agent
    prompt: "Continue with..."
    send: false                   # false = pre-fill, true = auto-submit
    model: GPT-4.1 (copilot)     # Optional model override
hooks:                            # Agent-scoped hooks (Preview)
  PostToolUse:
    - type: command
      command: "npx prettier --write $TOOL_INPUT_FILE_PATH"
target: vscode                    # or github-copilot
---

# Agent Instructions

Your instructions go here in Markdown.
Reference files with [my rules](./path/to/file.md).
Reference tools with #tool:web/fetch syntax.
```

### File Locations

| Scope | Location |
|-------|----------|
| Workspace | `.github/agents/*.agent.md` or `.github/agents/*.md` |
| Claude format | `.claude/agents/*.md` |
| User profile | `~/.copilot/agents/` |

**Custom location**: configure with `chat.agentFilesLocations` setting.

### All Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | No | filename | Agent identifier for `@mentions` and `agents:` lists |
| `description` | string | No | — | Shown in agent picker and as placeholder text |
| `argument-hint` | string | No | — | Placeholder in chat input |
| `user-invocable` | boolean | No | `true` | Show in dropdown. `false` = subagent only |
| `disable-model-invocation` | boolean | No | `false` | Prevent auto-invocation as subagent |
| `tools` | string[] | No | all | Available tools/tool sets. Can include built-in, MCP (`server/*`), extension tools |
| `agents` | string[] | No | `*` | Allowed subagents. `*` = all, `[]` = none. Overrides `disable-model-invocation` |
| `model` | string/string[] | No | current | Model preference list (tried in order, first available used) |
| `handoffs` | object[] | No | — | Follow-up workflow buttons |
| `hooks` | object | No | — | Agent-scoped hooks (Preview, requires `chat.useCustomAgentHooks`) |
| `target` | string | No | `vscode` | `vscode` or `github-copilot` |
| `mcp-servers` | object[] | No | — | MCP server config (for `target: github-copilot`) |

> **Deprecated**: `infer` — use `user-invocable` and `disable-model-invocation` instead.

### Claude Agent Format

Files in `.claude/agents/` use plain `.md` and support Claude-specific frontmatter:

| Property | Description |
|----------|-------------|
| `name` | Agent name (required) |
| `description` | What the agent does |
| `tools` | Comma-separated string (e.g., `"Read, Grep, Glob, Bash"`) |
| `disallowedTools` | Comma-separated string of tools to block |

VS Code maps Claude tool names to VS Code tools automatically.

### Create / Use

| Action | How |
|--------|-----|
| Create with AI | `/create-agent a security review agent` |
| Create manually | `Chat: New Custom Agent` command |
| Use | Select from agents dropdown or `@agent-name` in chat |
| Configure | `Ctrl+Shift+P` → `Chat: Open Chat Customizations` → Agents tab |
| Show/hide in dropdown | Configure Custom Agents → eye icon |

### Related Settings

| Setting | Description |
|---------|-------------|
| `chat.agentFilesLocations` | Additional file locations for agent files |
| `chat.useCustomAgentHooks` | Enable agent-scoped hooks in YAML |
| `github.copilot.chat.organizationCustomAgents.enabled` | Discover org-level agents |

---

## 3. Custom Instructions

Define **coding standards and guidelines** that are automatically applied.

### Types Overview

| Type | File | When Applied | Scope |
|------|------|-------------|-------|
| Always-on | `.github/copilot-instructions.md` | Every request | Workspace |
| Always-on | `AGENTS.md` | Every request | Root or subfolders |
| Always-on | `CLAUDE.md` | Every request | Claude compatibility |
| File-scoped | `*.instructions.md` | When `applyTo` glob matches or description matches task | Workspace or user |
| Organization | GitHub org | Every request | Cross-repo |

### File-Scoped Instructions Format

```markdown
---
name: 'Python Standards'
description: 'Coding conventions for Python files'
applyTo: '**/*.py'
---

- Follow PEP 8 style guide
- Use type hints for all function signatures
- Write docstrings for public functions
```

### All Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | No | Display name (defaults to file name) |
| `description` | string | No | Short description on hover. Also used for semantic matching to current task |
| `applyTo` | string | No | Glob pattern relative to workspace root. `**` = all files. If not set, not auto-applied |

### File Locations

| Scope | Location |
|-------|----------|
| Workspace | `.github/instructions/` (recursive) |
| Claude format | `.claude/rules/` |
| User profile | `~/.copilot/instructions/`, `~/.claude/rules/` |

**Custom location**: configure with `chat.instructionsFilesLocations` setting.

### AGENTS.md

- Auto-detected in workspace root
- Enable/disable: `chat.useAgentsMdFile` setting
- Nested subfolders (experimental): `chat.useNestedAgentsMdFiles` setting
- For folder-specific instructions, also consider `*.instructions.md` with `applyTo` glob patterns

### CLAUDE.md

- Auto-detected in workspace root, `.claude/`, or `~/.claude/`
- Also supports `CLAUDE.local.md` (not committed to version control)
- Enable/disable: `chat.useClaudeMdFile` setting
- `.claude/rules` files use `paths` property instead of `applyTo`

### Priority Order

1. Personal instructions (user-level, **highest**)
2. Repository instructions (`.github/copilot-instructions.md` or `AGENTS.md`)
3. Organization instructions (**lowest**)

### Create / Use

| Action | How |
|--------|-----|
| Create with AI | `/create-instruction always use tabs and single quotes` |
| Generate workspace-wide | `/init` |
| Create manually | `Chat: Create Instructions File` command |
| Configure | `/instructions` in chat or Chat Customizations → Instructions tab |
| Verify loaded | Check References section in chat response |
| Diagnose | Right-click Chat → Diagnostics |

### Related Settings

| Setting | Description |
|---------|-------------|
| `chat.instructionsFilesLocations` | Customize instruction file search locations |
| `chat.includeApplyingInstructions` | Enable pattern-based auto-apply |
| `chat.includeReferencedInstructions` | Enable markdown-link referenced instructions |
| `chat.useAgentsMdFile` | Enable `AGENTS.md` discovery |
| `chat.useNestedAgentsMdFiles` | Enable subfolder `AGENTS.md` files (experimental) |
| `chat.useClaudeMdFile` | Enable `CLAUDE.md` discovery |
| `chat.useCustomizationsInParentRepositories` | Discover instructions in parent repo (monorepo) |
| `github.copilot.chat.organizationInstructions.enabled` | Discover org-level instructions |

---

## 4. Prompt Files

**Reusable slash commands** — standalone prompts you invoke manually in chat.

### File Format

```markdown
---
name: create-react-form
description: Scaffold a React form component
argument-hint: "[component name] [options]"
agent: agent                # ask, agent, plan, or custom agent name
tools: ['read', 'search', 'edit', 'execute']
model: Claude Sonnet 4.6 (copilot)
---

Create a React form component with the following requirements:
- Use TypeScript
- Include form validation
- Follow the patterns in [our form utils](../src/utils/forms.ts)
```

### All Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | No | filename | Slash command name (after `/`) |
| `description` | string | No | — | Description shown in command list |
| `argument-hint` | string | No | — | Input hint for users |
| `agent` | string | No | current | `ask`, `agent`, `plan`, or custom agent name |
| `model` | string | No | current | Language model to use |
| `tools` | string[] | No | — | Available tools (if set, these take precedence) |

### File Locations

| Scope | Location |
|-------|----------|
| Workspace | `.github/prompts/*.prompt.md` |
| User profile | User data (specific to your VS Code profile) |

**Custom location**: configure with `chat.promptFilesLocations` setting.

### Tool List Priority

1. Tools in **prompt file** (if any)
2. Tools from **referenced custom agent** in prompt file
3. **Default tools** for selected agent

### Create / Use

| Action | How |
|--------|-----|
| Create with AI | `/create-prompt a prompt for generating unit tests` |
| Use | `/<prompt-name> extra context` in chat |
| Run from palette | `Chat: Run Prompt` command |
| Test in editor | Open prompt file → click play button |

### Related Settings

| Setting | Description |
|---------|-------------|
| `chat.promptFilesLocations` | Customize prompt file search locations |
| `chat.promptFilesRecommendations` | Show prompts as recommended actions when starting new chat |

---

## 5. Agent Skills

**Portable folders** with instructions, scripts, examples, and resources.
Open standard: [agentskills.io](https://agentskills.io/) — works across VS Code, Copilot CLI, Copilot coding agent.

### Structure

```
.github/skills/
  webapp-testing/
    SKILL.md              # Required — instructions + YAML frontmatter
    test-template.js      # Optional referenced resources
    examples/             # Optional examples directory
```

### SKILL.md Format

```markdown
---
name: webapp-testing
description: Run and debug web application tests using Playwright
argument-hint: "[test file] [options]"
user-invocable: true               # Show as /slash command (default: true)
disable-model-invocation: false    # Allow auto-loading (default: false)
---

# Web Application Testing

Step-by-step instructions...
Reference: [test template](./test-template.js)
```

### All Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | **Yes** | — | Unique ID (must match parent directory name, max 64 chars) |
| `description` | string | **Yes** | — | When to use this skill (max 1024 chars). Be specific for auto-loading |
| `argument-hint` | string | No | — | Hint for slash command invocation |
| `user-invocable` | boolean | No | `true` | Show as `/command` (default: true) |
| `disable-model-invocation` | boolean | No | `false` | Require manual invocation only (default: false) |

### File Locations

| Scope | Location |
|-------|----------|
| Project | `.github/skills/`, `.claude/skills/`, `.agents/skills/` |
| Personal | `~/.copilot/skills/`, `~/.claude/skills/`, `~/.agents/skills/` |

**Custom location**: configure with `chat.skillsLocations` setting.

### How Loading Works (3 levels)

1. **Discovery** — reads `name` + `description` from YAML frontmatter only
2. **Instructions** — loads SKILL.md body when relevant (or when `/skill-name` invoked)
3. **Resources** — loads referenced files only when needed (via markdown links)

Many skills installed = minimal context cost. Only relevant content loads.

### Invocation Control

| `user-invocable` | `disable-model-invocation` | In `/` menu | Auto-loaded |
|---|---|---|---|
| Default (both omitted) | — | Yes | Yes |
| `false` | — | No | Yes |
| — | `true` | Yes | No |
| `false` | `true` | No | No |

### Create / Use

| Action | How |
|--------|-----|
| Create with AI | `/create-skill a skill for debugging integration tests` |
| Use | `/<skill-name> extra context` in chat |
| Configure | `/skills` in chat or Chat Customizations → Skills tab |
| Community skills | https://github.com/github/awesome-copilot, https://github.com/anthropics/skills |

### Skills vs Instructions vs Prompts

| Aspect | Skills | Instructions | Prompts |
|--------|--------|--------------|---------|
| Contains | Instructions + scripts + resources | Instructions only | Instructions only |
| Portability | Cross-agent (VS Code, CLI, coding agent) | VS Code only | VS Code only |
| Loading | On-demand | Always or glob-based | Manual invoke |
| Standard | Open (agentskills.io) | VS Code-specific | VS Code-specific |

### Related Settings

| Setting | Description |
|---------|-------------|
| `chat.skillsLocations` | Custom skill directory locations |

---

## 6. Tools & Tool Sets

Tools give agents the ability to perform actions.

### Built-in Tool Sets

| Tool Set | Individual Tools | Description |
|----------|-----------------|-------------|
| `read` | `readFile`, `problems`, `terminalLastCommand`, `terminalSelection`, `getNotebookSummary`, `readNotebookCellOutput` | Read files and workspace state |
| `search` | `codebase`, `fileSearch`, `listDirectory`, `textSearch`, `changes`, `usages`, `searchResults` | Search workspace |
| `edit` | `createFile`, `createDirectory`, `editFiles`, `editNotebook` | Modify files |
| `execute` | `runInTerminal`, `getTerminalOutput`, `createAndRunTask`, `runNotebookCell`, `testFailure` | Run commands and code |
| `web` | `fetch` | Fetch web content |
| `agent` | `runSubagent` | Delegate to subagents |
| `browser` | Navigate, screenshot, click, type, hover, fill, evaluate, etc. | Browser interaction (Experimental) |

### Notable Individual Tools

| Tool | Set | Description |
|------|-----|-------------|
| `#read/readFile` | read | Read file contents |
| `#read/problems` | read | Get workspace errors/warnings |
| `#read/terminalLastCommand` | read | Get last terminal command + output |
| `#read/terminalSelection` | read | Get current terminal selection |
| `#search/codebase` | search | Semantic code search |
| `#search/textSearch` | search | Grep-style text search |
| `#search/fileSearch` | search | Search files by glob pattern |
| `#search/listDirectory` | search | List directory contents |
| `#search/usages` | search | Find references + implementations + definitions |
| `#search/changes` | search | List source control changes |
| `#search/searchResults` | search | Get results from VS Code Search view |
| `#edit/editFiles` | edit | Apply edits to files |
| `#edit/createFile` | edit | Create new files |
| `#edit/createDirectory` | edit | Create new directories |
| `#execute/runInTerminal` | execute | Run shell commands |
| `#execute/getTerminalOutput` | execute | Get terminal output |
| `#execute/createAndRunTask` | execute | Run VS Code tasks |
| `#execute/testFailure` | execute | Get test failure info |
| `#web/fetch` | web | Fetch web page content |
| `#agent/runSubagent` | agent | Run subagent task |

### Standalone Tools (Not in a Set)

| Tool | Description |
|------|-------------|
| `#selection` | Current editor selection |
| `#todos` | Track task progress with todo list widget |
| `#vscode/askQuestions` | Ask user clarifying questions via carousel |
| `#vscode/runCommand` | Run VS Code commands (e.g., "enable zen mode") |
| `#vscode/extensions` | Search/ask about extensions |
| `#vscode/installExtension` | Install VS Code extension |
| `#vscode/VSCodeAPI` | Ask about VS Code API |
| `#vscode/getProjectSetupInfo` | Scaffolding configuration |
| `#newWorkspace` | Create new workspace |

### Custom Tool Sets

Create `.vscode/tool-sets.jsonc`:

```jsonc
{
  "reader": {
    "tools": ["search/changes", "search/codebase", "read/problems", "search/usages"],
    "description": "Tools for reading and gathering context",
    "icon": "book"
  }
}
```

### Use in YAML

```yaml
tools: ['read', 'search', 'edit', 'execute', 'web']      # Tool sets
tools: ['read/readFile', 'search/codebase']                # Individual tools
tools: ['my-mcp-server/*']                                 # All MCP server tools
tools: ['my-mcp-server/specific-tool']                     # Specific MCP tool
```

### Reference in Markdown Body

```markdown
Use `#tool:web/fetch` to get the latest API docs.
```

### Related Settings

| Setting | Description |
|---------|-------------|
| `chat.tools.autoApprove` | Auto-approve all tools |
| `chat.tools.global.autoApprove` | Global auto-approve (⚠️ dangerous) |
| `chat.tools.terminal.autoApprove` | Terminal command auto-approve patterns (object) |
| `chat.tools.terminal.enableAutoApprove` | Enable/disable terminal auto-approve |
| `chat.tools.terminal.enforceTimeoutFromModel` | Enforce model-specified timeout |
| `chat.tools.terminal.outputLocation` | Terminal output: inline in chat or integrated terminal |
| `chat.tools.terminal.blockDetectedFileWrites` | Detect file writes in terminal (experimental) |
| `chat.tools.terminal.ignoreDefaultAutoApproveRules` | Disable all default rules |
| `chat.tools.terminal.terminalProfile.linux` | Override terminal shell on Linux |
| `chat.tools.terminal.terminalProfile.osx` | Override terminal shell on macOS |
| `chat.tools.terminal.terminalProfile.windows` | Override terminal shell on Windows |
| `chat.tools.edits.autoApprove` | Auto-approve file edits |
| `chat.tools.urls.autoApprove` | Auto-approve URL patterns (object with `approveRequest`/`approveResponse`) |
| `chat.tools.eligibleForAutoApproval` | Prevent auto-approval for specific tools |
| `chat.agent.thinking.collapsedTools` | Collapse tool call details (experimental) |
| `github.copilot.chat.virtualTools.threshold` | Auto-manage large tool sets |

---

## 7. Subagents

**Isolated AI agents** that perform focused work and return results to the main agent.

### How It Works

1. Main agent recognizes subtask that benefits from isolation
2. Spawns subagent with only the relevant prompt
3. Subagent gets **fresh context** (no memory from previous invocations)
4. Subagent works autonomously using its own tools/model
5. Returns a summary to the main agent

### What Users See

Collapsible tool call in chat. Expand to see full details, all tool calls, prompt, and result.

### Custom Agent as Subagent

```yaml
# Coordinator agent:
agents: ['planner', 'executor', 'reviewer']  # Restrict allowed subagents
tools: ['agent', 'read', 'search', 'edit']   # Must include 'agent'

# Subagent:
user-invocable: false            # Hidden from dropdown
disable-model-invocation: false  # Allow invocation
```

> **Note**: Explicitly listing an agent in `agents` array overrides `disable-model-invocation: true`.

### Orchestration Patterns

**Coordinator-Worker Pattern:**
```
Coordinator → Planner (read-only) → Architect (validate) → Implementer (full edit) → Reviewer (read-only)
```

**Multi-Perspective Review:**
```
Reviewer → [Correctness, Security, Quality, Architecture] (parallel subagents)
```

**Recursive Agent:**
```yaml
---
name: RecursiveProcessor
tools: ['agent', 'read', 'search']
agents: [RecursiveProcessor]
---
Divide list into halves, delegate each to a new RecursiveProcessor.
```

### Nested Subagents

Disabled by default. Max depth: 5.

### Related Settings

| Setting | Description |
|---------|-------------|
| `chat.subagents.allowInvocationsFromSubagents` | Enable nested subagents (default: false) |

---

## 8. Hooks

**Shell commands** at specific lifecycle points during agent sessions.

### Lifecycle Events

| Event | When | Use Case |
|-------|------|----------|
| `SessionStart` | New agent session begins | Initialize resources, inject project context |
| `UserPromptSubmit` | User submits a prompt | Audit requests, inject context |
| `PreToolUse` | Before agent invokes any tool | Block dangerous ops, require approval, modify input |
| `PostToolUse` | After tool completes successfully | Run formatters, log results, trigger follow-up |
| `PreCompact` | Before context is compacted | Export important context |
| `SubagentStart` | Subagent spawns | Track subagent usage |
| `SubagentStop` | Subagent completes | Aggregate results |
| `Stop` | Agent session ends | Generate reports, cleanup, block stopping |

### Quick Start

Create `.github/hooks/format.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "type": "command",
        "command": "npx prettier --write \"$TOOL_INPUT_FILE_PATH\""
      }
    ]
  }
}
```

### Hook Command Properties

| Property | Type | Description |
|----------|------|-------------|
| `type` | string | Must be `"command"` |
| `command` | string | Default shell command (cross-platform) |
| `windows` | string | Windows-specific override |
| `linux` | string | Linux-specific override |
| `osx` | string | macOS-specific override |
| `cwd` | string | Working directory (relative to repo root) |
| `env` | object | Additional environment variables |
| `timeout` | number | Timeout in seconds (default: 30) |

### Input/Output

- **Input**: JSON via stdin (includes `timestamp`, `cwd`, `sessionId`, `hookEventName`, `transcript_path` + event-specific fields)
- **Output**: JSON via stdout

**Common output fields:**

| Field | Type | Description |
|-------|------|-------------|
| `continue` | boolean | `false` to stop processing |
| `stopReason` | string | Reason for stopping |
| `systemMessage` | string | Warning message shown to user |

**Exit codes:** `0` = success (parse JSON), `2` = blocking error, other = warning

### PreToolUse Output (Permission Control)

```json
{
  "hookSpecificOutput": {
    "permissionDecision": "deny",
    "permissionDecisionReason": "Destructive command blocked",
    "updatedInput": {},
    "additionalContext": "Extra context for the model"
  }
}
```

Permission decisions: `"allow"` < `"ask"` < `"deny"` (most restrictive wins across hooks).

### Stop Hook Output (Prevent Stopping)

```json
{
  "hookSpecificOutput": {
    "hookEventName": "Stop",
    "decision": "block",
    "reason": "Run the test suite before finishing"
  }
}
```

> ⚠️ Always check `stop_hook_active` field to prevent infinite loops. Blocked stops consume premium requests.

### Agent-Scoped Hooks (Preview)

```yaml
---
name: "Strict Formatter"
hooks:
  PostToolUse:
    - type: command
      command: "./scripts/format-changed-files.sh"
---
```

Only run when this agent is active. Enable: `chat.useCustomAgentHooks: true`.

### File Locations

| Scope | Location |
|-------|----------|
| Workspace | `.github/hooks/*.json` |
| Claude format | `.claude/settings.json`, `.claude/settings.local.json` |
| User | `~/.copilot/hooks/`, `~/.claude/settings.json` |
| Agent | `hooks` field in `.agent.md` YAML |
| Plugin | `hooks.json` or `hooks/hooks.json` |

### Claude Code Compatibility

- VS Code reads `.claude/settings.json` hook configs
- Matchers are parsed but **ignored** — hooks run on every matching event
- Tool input property names differ: Claude uses `snake_case`, VS Code uses `camelCase`
- Tool names differ: Claude `Write`/`Edit` vs VS Code `create_file`/`replace_string_in_file`

### Create / Use

```
/create-hook run ESLint after every file edit
/hooks                    # Configure hooks
```

### Related Settings

| Setting | Description |
|---------|-------------|
| `chat.hookFilesLocations` | Customize hook file search locations |
| `chat.useCustomAgentHooks` | Enable agent-scoped hooks in YAML |

---

## 9. Agent Plugins

**Pre-packaged bundles** of customizations from plugin marketplaces.

### What Plugins Provide

A single plugin can include any combination of:
- Slash commands (prompt files)
- Agent skills (with scripts + resources)
- Custom agents
- Hooks
- MCP servers

### plugin.json Format

```json
{
  "name": "my-plugin",
  "displayName": "My Plugin",
  "description": "What this plugin does",
  "version": "1.0.0",
  "publisher": "my-org",
  "icon": "icon.png"
}
```

### Discover and Install

| Action | How |
|--------|-----|
| Browse | Extensions view → search `@agentPlugins` |
| Install from source | `Chat: Install Plugin From Source` → Git URL |
| Manage | Extensions view → Agent Plugins — Installed |
| Enable/disable | Context menu on plugin (per workspace or global) |

### Plugin Marketplaces

Default: [copilot-plugins](https://github.com/github/copilot-plugins), [awesome-copilot](https://github.com/github/awesome-copilot/)

Add more via `chat.plugins.marketplaces` setting:

```jsonc
"chat.plugins.marketplaces": [
    "anthropics/claude-code",           // shorthand
    "https://github.com/org/repo.git"   // full URL
]
```

### Local Plugins

```jsonc
"chat.pluginLocations": {
    "/path/to/my-plugin": true,      // enabled
    "/path/to/another-plugin": false  // registered but disabled
}
```

### Workspace Recommendations

In `.vscode/settings.json`:

```jsonc
{
  "extraKnownMarketplaces": {
    "company-tools": {
      "source": { "source": "github", "repo": "your-org/plugin-marketplace" }
    }
  },
  "enabledPlugins": {
    "code-formatter@company-tools": true
  }
}
```

### Hooks & MCP in Plugins

- Hooks: Include `hooks.json` (or `hooks/hooks.json`) in the plugin
- MCP: Include `.vscode/mcp.json` in the plugin root, executes when plugin enabled

### Related Settings

| Setting | Description |
|---------|-------------|
| `chat.plugins.enabled` | Enable/disable plugin support |
| `chat.plugins.marketplaces` | Additional marketplace Git repos |
| `chat.pluginLocations` | Local plugin paths |

---

## 10. MCP Servers

**Model Context Protocol** — connect external tools and data sources.

### Configuration

In `.vscode/mcp.json`:

```jsonc
{
  "mcp": {
    "servers": {
      "my-server": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "my-mcp-server"],
        "env": {
          "API_KEY": "${input:apiKey}"
        }
      }
    },
    "inputs": [
      {
        "id": "apiKey",
        "type": "promptString",
        "description": "Enter your API key",
        "password": true
      }
    ]
  }
}
```

### Transport Types

| Type | Description |
|------|-------------|
| `stdio` | Standard I/O (local process — most common) |
| `sse` | Server-Sent Events (remote HTTP) |
| `streamable-http` | Streamable HTTP (newer remote protocol) |

### MCP in settings.json

```jsonc
"mcp": {
  "servers": {
    "my-server": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "my-mcp-server"]
    }
  }
}
```

### Use in Agent YAML

```yaml
tools: ['my-server/*']                # All tools from server
tools: ['my-server/specific-tool']    # Specific tool
```

### What MCP Servers Provide

- Custom tools (appear alongside built-in tools in picker)
- Access to external APIs, databases, documentation
- Domain-specific capabilities
- Can be bundled in agent plugins

### MCP Server Management

- `MCP: List Servers` command to see all configured servers
- Status indicator in chat (green = connected, red = error)
- Click status to restart/reconnect

---

## 11. Language Models

### Model Selection

Models can be set in (priority order):
1. Agent YAML `model:` property (prioritized fallback list)
2. Prompt file `model:` property
3. Handoff `model:` property
4. Model picker in UI (`Ctrl+Alt+.`)

### Format

```yaml
model:
  - Claude Sonnet 4.6 (copilot)    # Tried first
  - Claude Haiku 4.5 (copilot)     # Fallback
  - GPT-4.1 (copilot)              # Last resort
```

Format: `Model Name (vendor)` — e.g., `Claude Sonnet 4.6 (copilot)`, `GPT-4.1 (copilot)`

### Available Models (Copilot)

| Model | Multiplier | Context Window | Best For |
|-------|-----------|----------------|----------|
| GPT-4.1 | 0× (free) | 128K | Routing, simple tasks, validation |
| GPT-5 Mini | 0× (free) | — | Quick edits, simple questions |
| Grok Code Fast 1 | 0.25× | 256K | Budget coding |
| Claude Haiku 4.5 | 0.33× | 200K | Capable but cheap execution |
| Claude Sonnet 4.6 | 1× (baseline) | — | Complex reasoning, planning |
| Claude Opus 4.6 | 3× | — | Most complex tasks |

### Auto Model Selection

Select `Auto` from model picker — VS Code automatically picks optimal model per request.
- Detects degraded performance and switches
- Variable multiplier with request discount
- Falls back to 0x model if quota exhausted

### Thinking Effort

Some models support configurable thinking effort:
1. Open model picker → select reasoning model → `>` arrow
2. Choose: **None**, **Low**, **Medium**, **High**

Label updates to show: "Claude Sonnet 4.6 · High"

> Non-reasoning models (GPT-4.1, GPT-4o) don't show thinking effort.

### BYOK (Bring Your Own Key)

Add models from built-in providers or extensions:
1. `Manage Models` from model picker → `Add Models`
2. Select provider (Azure OpenAI, OpenAI, Anthropic, Google, Ollama, etc.)
3. Enter API key / endpoint

> BYOK not available for Business/Enterprise plans. Requires Copilot plan + internet.

### Manage Language Models Editor

`Chat: Manage Language Models` command:
- View all models, capabilities, context size, billing
- Filter: `@provider:"OpenAI"`, `@capability:tools`, `@visible:true`
- Show/hide models in picker

### Related Settings

| Setting | Description |
|---------|-------------|
| `inlineChat.defaultModel` | Default model for inline chat |
| `chat.planAgent.defaultModel` | Default model for Plan agent |
| `github.copilot.chat.implementAgent.model` | Model for implementation step |
| `github.copilot.chat.planAgent.additionalTools` | Extra tools for Plan agent research |
| `github.copilot.chat.customOAIModels` | Manual OpenAI-compatible model config |

---

## 12. Memory

Agents retain context across conversations using the memory tool.

### Memory Scopes

| Scope | Path | Persists Across Sessions | Across Workspaces | Use For |
|-------|------|--------------------------|-------------------|---------|
| **User** | `/memories/` | Yes | Yes | Preferences, patterns, general insights |
| **Repository** | `/memories/repo/` | Yes | No (workspace-scoped) | Codebase conventions, project structure |
| **Session** | `/memories/session/` | No (cleared on chat end) | No | Task-specific context, in-progress plans |

- First 200 lines of user memory auto-loaded into context
- Session memory listed but not auto-loaded — must be read explicitly

### Store and Retrieve

```
Remember that our team uses conventional commits
```
```
What are our commit message conventions?
```

### Copilot Memory (GitHub-hosted, separate system)

| Aspect | Local Memory Tool | Copilot Memory |
|--------|------------------|----------------|
| Storage | Local (on your machine) | GitHub-hosted (remote) |
| Scopes | User, repo, session | Repository only |
| Shared | VS Code only | Coding agent, code review, CLI |
| Created by | You or agent in chat | Agents automatically |
| Enabled | Yes (default) | No (opt-in) |
| Expiration | Manual | Automatic (28 days) |

### Manage Memory

| Command | Description |
|---------|-------------|
| `Chat: Show Memory Files` | View all memory files |
| `Chat: Clear All Memory Files` | Remove all memories |
| Copilot Memory | GitHub.com → Copilot → Memory → manage entries |

### Related Settings

| Setting | Description |
|---------|-------------|
| `github.copilot.chat.tools.memory.enabled` | Enable/disable local memory tool |
| `github.copilot.chat.copilotMemory.enabled` | Enable Copilot Memory integration |

---

## 13. Planning

The Plan agent creates detailed implementation plans before coding.

### Usage

1. Select **Plan** from agents dropdown, or type `/plan`
2. Describe your task
3. Answer clarifying questions
4. Review and iterate on plan
5. Hand off to implementation agent or Copilot CLI

Plan is auto-saved to `/memories/session/plan.md`.

### Customize Planning

| Setting | Description |
|---------|-------------|
| `chat.planAgent.defaultModel` | Default model for Plan agent |
| `github.copilot.chat.implementAgent.model` | Model for implementation step |
| `github.copilot.chat.planAgent.additionalTools` | Extra tools for research/planning |

### Todo Lists

- Agent uses `#todos` tool to track multi-step tasks
- Todo widget shows in chat sidebar
- Setting: `chat.tools.todos.showWidget`

---

## 14. Handoffs

**Guided sequential workflows** — buttons after a response to transition between agents.

### Definition

```yaml
handoffs:
  - label: "Start Implementation"
    agent: implementer
    prompt: "Implement the plan above"
    send: false                      # false = pre-fill, true = auto-submit
    model: GPT-4.1 (copilot)        # Optional model override
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `label` | string | Yes | Button text |
| `agent` | string | Yes | Target agent identifier |
| `prompt` | string | No | Prompt to send to target agent |
| `send` | boolean | No | Auto-submit (default: false) |
| `model` | string | No | Model override for handoff |

### Common Patterns

| Flow | Description |
|------|-------------|
| Plan → Implement | Generate plan, hand off to coding agent |
| Implement → Review | Complete code, hand off to reviewer |
| Write Failing Tests → Make Pass | TDD red→green workflow |
| Validate → Fix → Re-validate | Error recovery loop |
| Red → Green → Refactor → Red | Full TDD cycle |

---

## 15. Agent Types & Permission Levels

### Agent Types (Where It Runs)

| Type | Runs | Interaction | Use Case |
|------|------|-------------|----------|
| **Local** | Your machine, in VS Code | Interactive chat | Brainstorm, iterate, use editor context |
| **Copilot CLI** | Your machine, terminal | Background autonomous | Well-defined tasks while you work |
| **Cloud** | GitHub remote environment | PR-based | Team collaboration, issue assignment |
| **Third-party** | Anthropic/OpenAI SDK | Varies | Alternative providers |

### Built-in Agents (How It Operates)

| Agent | Description |
|-------|-------------|
| **Agent** | Autonomous: plans, edits files, runs commands, invokes tools, iterates |
| **Plan** | Creates structured implementation plan before coding |
| **Ask** | Answers questions without making file changes |

> **Edit mode** is deprecated. Use Agent mode with instructions instead. Restore with `chat.editMode.hidden: false`.

### Permission Levels

| Level | Behavior |
|-------|----------|
| **Default Approvals** | Uses configured settings. Safe/read-only tools auto-approved |
| **Bypass Approvals** | Auto-approves all tools. Agent may ask clarifying questions |
| **Autopilot** (Preview) | Auto-approves all, auto-responds to questions, works until task complete |

### Handoff Between Agent Types

Select different agent type from session type dropdown → VS Code creates new session with full history.
Copilot CLI: `/delegate` command to delegate to cloud agent.

### Related Settings

| Setting | Description |
|---------|-------------|
| `chat.agent.enabled` | Enable agents |
| `chat.autopilot.enabled` | Enable Autopilot permission level |
| `chat.agent.sandbox` | Enable agent sandboxing (restrict file/network access) |
| `chat.agent.sandboxFileSystem.linux` | Configure sandbox file system access (Linux) |
| `chat.agent.sandboxFileSystem.mac` | Configure sandbox file system access (macOS) |
| `chat.agent.sandboxNetwork.allowedDomains` | Allowed domains when sandboxed |
| `chat.agent.sandboxNetwork.deniedDomains` | Denied domains when sandboxed |
| `chat.editMode.hidden` | Restore deprecated Edit mode |

---

## 16. Slash Commands

### Built-in Commands

| Command | Description |
|---------|-------------|
| `/doc` | Generate documentation comments |
| `/explain` | Explain code or concept |
| `/fix` | Fix code issues |
| `/tests` | Generate tests |
| `/setupTests` | Set up testing framework |
| `/fixTestFailure` | Fix failing tests |
| `/new` | Scaffold new project/file |
| `/newNotebook` | Create Jupyter notebook |
| `/plan` | Create implementation plan |
| `/search` | Generate search query |
| `/startDebugging` | Generate launch.json and start debug |
| `/clear` | New chat session |
| `/compact` | Compact conversation context |
| `/fork` | Fork chat session (inherit full history) |
| `/init` | Generate workspace instructions from project analysis |
| `/yolo` / `/autoApprove` | Enable global auto-approval |
| `/disableYolo` / `/disableAutoApprove` | Disable global auto-approval |
| `/debug` | Show Chat Debug view |
| `/troubleshoot` | Analyze agent debug logs |

### Customization Commands

| Command | Description |
|---------|-------------|
| `/create-agent` | Generate custom agent with AI |
| `/create-instruction` | Generate instructions file with AI |
| `/create-prompt` | Generate prompt file with AI |
| `/create-skill` | Generate skill with AI |
| `/create-hook` | Generate hook with AI |
| `/agents` | Configure custom agents |
| `/hooks` | Configure hooks |
| `/instructions` | Configure instructions |
| `/prompts` | Configure prompts |
| `/skills` | Configure skills |
| `/<skill-name>` | Run a skill |
| `/<prompt-name>` | Run a prompt file |

---

## 17. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Alt+I` | Open Chat view |
| `Ctrl+Shift+I` | Switch to agents in Chat view |
| `Ctrl+I` | Start inline chat (editor or terminal) |
| `Ctrl+Shift+Alt+L` | Quick Chat |
| `Ctrl+N` | New chat session |
| `Ctrl+Alt+.` | Open model picker |
| `Tab` | Accept inline suggestion |
| `Escape` | Dismiss inline suggestion |
| `F2` | AI-powered rename |

---

## 18. All Settings Reference

### Core Agent Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `chat.agent.enabled` | `true` | Enable agents |
| `chat.autopilot.enabled` | `false` | Enable Autopilot permission level |
| `chat.agent.sandbox` | `false` | Enable agent sandboxing |

### Customization File Locations

| Setting | Default | Description |
|---------|---------|-------------|
| `chat.agentFilesLocations` | `[]` | Where to find agent files |
| `chat.instructionsFilesLocations` | `[]` | Where to find instruction files |
| `chat.promptFilesLocations` | `[]` | Where to find prompt files |
| `chat.skillsLocations` | `[]` | Where to find skill directories |
| `chat.hookFilesLocations` | `[]` | Where to find hook files |

### Feature Toggles

| Setting | Default | Description |
|---------|---------|-------------|
| `chat.useAgentsMdFile` | `true` | Enable `AGENTS.md` discovery |
| `chat.useNestedAgentsMdFiles` | `false` | Enable subfolder `AGENTS.md` (experimental) |
| `chat.useClaudeMdFile` | `true` | Enable `CLAUDE.md` discovery |
| `chat.useCustomAgentHooks` | `false` | Enable agent-scoped hooks |
| `chat.useCustomizationsInParentRepositories` | `false` | Monorepo: discover parent repo customizations |
| `chat.includeApplyingInstructions` | `true` | Apply pattern-based instructions |
| `chat.includeReferencedInstructions` | `true` | Apply markdown-link referenced instructions |
| `chat.plugins.enabled` | `true` | Enable agent plugins |
| `chat.subagents.allowInvocationsFromSubagents` | `false` | Enable nested subagents |
| `github.copilot.chat.tools.memory.enabled` | `true` | Enable local memory tool |
| `github.copilot.chat.copilotMemory.enabled` | `false` | Enable Copilot Memory |
| `github.copilot.chat.organizationInstructions.enabled` | `true` | Org-level instructions |
| `github.copilot.chat.organizationCustomAgents.enabled` | `true` | Org-level agents |
| `github.copilot.chat.agentDebugLog.enabled` | `false` | Enable agent debug logs |

### Tool Approval Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `chat.tools.autoApprove` | `false` | Auto-approve all tools |
| `chat.tools.global.autoApprove` | `false` | Global auto-approve (⚠️ dangerous) |
| `chat.tools.terminal.autoApprove` | `{}` | Terminal auto-approve patterns (object with command regex patterns) |
| `chat.tools.terminal.enableAutoApprove` | `true` | Enable/disable terminal auto-approve |
| `chat.tools.edits.autoApprove` | `false` | Auto-approve file edits |
| `chat.tools.urls.autoApprove` | `{}` | URL request/response auto-approve |
| `chat.tools.eligibleForAutoApproval` | `{}` | Per-tool auto-approval control |

### Terminal Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `chat.tools.terminal.enforceTimeoutFromModel` | `true` | Enforce model-specified timeout |
| `chat.tools.terminal.outputLocation` | `"inlineChat"` | Terminal output location |
| `chat.tools.terminal.blockDetectedFileWrites` | `false` | Block file writes from terminal |
| `chat.tools.terminal.ignoreDefaultAutoApproveRules` | `false` | Disable all default rules |
| `chat.tools.terminal.terminalProfile.linux` | `null` | Override shell (Linux) |
| `chat.tools.terminal.terminalProfile.osx` | `null` | Override shell (macOS) |
| `chat.tools.terminal.terminalProfile.windows` | `null` | Override shell (Windows) |

### Sandbox Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `chat.agent.sandbox` | `false` | Enable sandboxing |
| `chat.agent.sandboxFileSystem.linux` | `null` | Sandbox file access (Linux) |
| `chat.agent.sandboxFileSystem.mac` | `null` | Sandbox file access (macOS) |
| `chat.agent.sandboxNetwork.allowedDomains` | `[]` | Allowed network domains |
| `chat.agent.sandboxNetwork.deniedDomains` | `[]` | Denied network domains |

### Model Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `inlineChat.defaultModel` | `null` | Default model for inline chat |
| `chat.planAgent.defaultModel` | `null` | Default model for Plan agent |
| `github.copilot.chat.implementAgent.model` | `null` | Model for implementation step |
| `github.copilot.chat.planAgent.additionalTools` | `[]` | Extra tools for Plan agent |
| `github.copilot.chat.customOAIModels` | `{}` | Custom OpenAI-compatible models |

### Other Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `chat.tools.todos.showWidget` | `true` | Show todo list widget |
| `chat.agent.thinking.collapsedTools` | `false` | Collapse tool details (experimental) |
| `chat.math.enabled` | `true` | Enable KaTeX math rendering |
| `mermaid-chat.enabled` | `true` | Enable Mermaid diagrams |
| `chat.plugins.marketplaces` | `[]` | Plugin marketplace repos |
| `chat.pluginLocations` | `{}` | Local plugin paths |
| `chat.promptFilesRecommendations` | `true` | Show prompt recommendations |
| `github.copilot.chat.virtualTools.threshold` | `null` | Virtual tools for large tool sets |
| `search.searchView.semanticSearchBehavior` | `"auto"` | Semantic search in Search view |
| `workbench.settings.showAISearchToggle` | `true` | AI search in Settings editor |
| `workbench.browser.enableChatTools` | `false` | Enable browser tools (experimental) |
| `chat.editMode.hidden` | `true` | Hide deprecated Edit mode |

---

## 19. File Locations Summary

### Workspace Structure

```
.github/
├── copilot-instructions.md          # Always-on instructions
├── agents/
│   ├── my-agent.agent.md            # Custom agents
│   └── ...
├── instructions/
│   ├── python.instructions.md       # File-scoped instructions
│   ├── frontend/                    # Organized by subdirectory
│   │   └── react.instructions.md
│   └── ...
├── prompts/
│   ├── create-form.prompt.md        # Reusable prompts
│   └── ...
├── hooks/
│   ├── format.json                  # Hook configurations
│   └── ...
├── skills/
│   └── webapp-testing/
│       ├── SKILL.md                 # Skill definition
│       └── resources...
└── templates/
    └── ...

AGENTS.md                            # Always-on instructions (root)
CLAUDE.md                            # Claude compatibility
.vscode/
├── mcp.json                         # MCP server configuration
└── tool-sets.jsonc                  # Custom tool sets
```

### User-Level Locations

```
~/.copilot/
├── agents/          # Personal agents
├── instructions/    # Personal instructions
├── hooks/           # Personal hooks
└── skills/          # Personal skills
~/.claude/
├── CLAUDE.md        # Personal Claude instructions
├── settings.json    # Personal hooks (Claude format)
├── rules/           # Personal instructions (Claude format)
├── skills/          # Personal skills (Claude format)
└── agents/          # Personal agents (Claude format)
```

---

## 20. YAML Frontmatter Reference

### Agent Files (`.agent.md`)

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | No | filename | Agent identifier |
| `description` | string | No | — | Shown in picker |
| `argument-hint` | string | No | — | Placeholder in input |
| `user-invocable` | boolean | No | `true` | Show in dropdown |
| `disable-model-invocation` | boolean | No | `false` | Prevent subagent use |
| `tools` | string[] | No | all | Available tools |
| `agents` | string[] | No | `*` | Allowed subagents |
| `model` | string/string[] | No | current | Model preference list |
| `handoffs` | object[] | No | — | Workflow buttons |
| `hooks` | object | No | — | Agent-scoped hooks |
| `target` | string | No | `vscode` | Target environment |
| `mcp-servers` | object[] | No | — | MCP config (github-copilot target) |

### Instruction Files (`.instructions.md`)

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | No | filename | Display name |
| `description` | string | No | — | Hover description + semantic matching |
| `applyTo` | string | No | — | Glob pattern (`**` = all files) |

### Prompt Files (`.prompt.md`)

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | No | filename | Slash command name |
| `description` | string | No | — | Description |
| `argument-hint` | string | No | — | Input hint |
| `agent` | string | No | current | Agent to use |
| `model` | string | No | current | Model to use |
| `tools` | string[] | No | — | Available tools |

### Skill Files (`SKILL.md`)

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | **Yes** | — | Must match directory name (max 64 chars) |
| `description` | string | **Yes** | — | When to use (max 1024 chars) |
| `argument-hint` | string | No | — | Slash command hint |
| `user-invocable` | boolean | No | `true` | Show in `/` menu |
| `disable-model-invocation` | boolean | No | `false` | Require manual invocation |

---

## 21. Guides & Workflows

### Context Engineering Guide

**Goal**: Systematic project context → better AI output.

1. **Curate context**: `copilot-instructions.md` → reference `ARCHITECTURE.md`, `PRODUCT.md`, `CONTRIBUTING.md`
2. **Create plan**: Custom planning agent (read-only tools), plan template, handoffs
3. **Generate code**: Agent implements from plan file

**Best practices**: Start small, keep context fresh, maintain isolation between tasks, separate concerns, use progressive context disclosure.

**Anti-patterns**: Avoid overly broad instructions, conflicting rules, stale context, monolithic agent definitions.

### Customize Copilot Guide

**Goal**: Step-by-step layered customization.

1. `/init` → generate `copilot-instructions.md`
2. `/create-instruction` → file-specific rules (e.g., `applyTo: '**/*.py'`)
3. `/create-prompt` → reusable tasks (e.g., scaffold component)
4. `/create-agent` → specialized personas (e.g., reviewer, planner)
5. `/create-skill` → portable capabilities (e.g., testing framework)

### TDD Guide

**Goal**: AI-assisted Test-Driven Development with custom agents.

| Agent | Phase | Tools | Handoff To |
|-------|-------|-------|------------|
| TDD Red | Write failing tests | read, edit, search | TDD Green |
| TDD Green | Minimal implementation | search, edit, execute | TDD Refactor |
| TDD Refactor | Clean up code | search, edit, read, execute | TDD Red |

Each agent automatically runs tests. Handoffs create the continuous TDD cycle.

Requires `testing.instructions.md` with `applyTo: '**/*.test.*'` for testing conventions.

### Debug Guide

**Goal**: AI-assisted debugging.

| Feature | How |
|---------|-----|
| Auto-debug | `copilot-debug <your-run-command>` in terminal |
| Generate launch config | `/startDebugging` in chat |
| Fix code | `/fix` or right-click → Copilot → Fix |
| Explain error | Select error → Copilot → Explain |
| Debug breakpoint | Hit breakpoint → Copilot explains state |

---

## 22. Quick Tips

- **Reference tools in markdown**: Use `#tool:web/fetch` syntax in agent/prompt bodies
- **Reference files**: Use `[my rules](./path/to/file.md)` markdown links in instructions/prompts/skills
- **Diagnostics**: Right-click Chat view → "Diagnostics" to see loaded customizations + errors
- **Debug logs**: Enable `github.copilot.chat.agentDebugLog.enabled`, use `/troubleshoot` or `/debug`
- **Permission levels**: Default Approvals → Bypass Approvals → Autopilot (Preview)
- **Sandbox**: `chat.agent.sandbox: true` to restrict file/network access for terminal commands
- **Terminal auto-approve**: Configure `chat.tools.terminal.autoApprove` with command patterns (regex in `/pattern/`)
- **Monorepo discovery**: Enable `chat.useCustomizationsInParentRepositories` for parent repo
- **Organization sharing**: Share agents/instructions across repos via GitHub org settings
- **Model cost**: Use GPT-4.1 (0x free) for routing/validation, Haiku (0.33x) for execution, Sonnet (1x) for planning
- **Background commands**: "Continue in Background" button for long-running terminal commands
- **Queue/steer**: Send follow-up messages while agent is working — choose queue, steer, or stop+send
- **Chat sessions**: `/fork` to branch a session, `/compact` to summarize long conversations
- **Generate with AI**: `/create-agent`, `/create-instruction`, `/create-prompt`, `/create-skill`, `/create-hook`
- **Extract from conversation**: "save this workflow as a prompt", "create a skill from what we just did"
- **Virtual tools**: For large MCP servers, set `github.copilot.chat.virtualTools.threshold` to auto-manage tool visibility
- **Claude compatibility**: VS Code reads `.claude/` folder structure, maps Claude tool names, supports `CLAUDE.md`

---

## Source Pages

### Customization
- [Overview](https://code.visualstudio.com/docs/copilot/customization/overview)
- [Custom Agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
- [Custom Instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [Prompt Files](https://code.visualstudio.com/docs/copilot/customization/prompt-files)
- [Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [Hooks](https://code.visualstudio.com/docs/copilot/customization/hooks)
- [Agent Plugins](https://code.visualstudio.com/docs/copilot/customization/agent-plugins)
- [Language Models](https://code.visualstudio.com/docs/copilot/customization/language-models)
- [MCP Servers](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)

### Agents
- [Overview](https://code.visualstudio.com/docs/copilot/agents/overview)
- [Local Agents](https://code.visualstudio.com/docs/copilot/agents/local-agents)
- [Planning](https://code.visualstudio.com/docs/copilot/agents/planning)
- [Memory](https://code.visualstudio.com/docs/copilot/agents/memory)
- [Subagents](https://code.visualstudio.com/docs/copilot/agents/subagents)
- [Tools](https://code.visualstudio.com/docs/copilot/agents/agent-tools)

### Guides
- [Context Engineering](https://code.visualstudio.com/docs/copilot/guides/context-engineering-guide)
- [Customize Copilot](https://code.visualstudio.com/docs/copilot/guides/customize-copilot-guide)
- [Test-Driven Development](https://code.visualstudio.com/docs/copilot/guides/test-driven-development-guide)
- [Debug with Copilot](https://code.visualstudio.com/docs/copilot/guides/debug-with-copilot)

### Reference
- [Cheat Sheet](https://code.visualstudio.com/docs/copilot/reference/copilot-vscode-features)

---

*Source: VS Code Copilot Documentation — https://code.visualstudio.com/docs/copilot*
*Last updated: July 2025*
