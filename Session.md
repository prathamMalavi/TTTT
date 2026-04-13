# MCPs for OneCX — Session Script

> **Schedule:** 3:30 – 4:30  
> **Presenter:** [Your Name]

---

## Opening — Greeting & Housekeeping (2 min)

- **Welcome everyone** — glad to have you all here
- Quick housekeeping:
  - Session runs until 4:30 — feel free to ask questions anytime, or hold them for the Q&A at the end
  - We'll be doing a live setup together, so keep VS Code open
  - If something doesn't work for you during the setup, don't worry — we'll troubleshoot together
- **Today's agenda at a glance:**
  1. What are MCPs and why they matter for us
  2. Walk through each MCP — what it does, when to use it
  3. Live setup together (OneCX, PrimeNG, npm Sentinel, Chrome DevTools)
  4. How we've been using AI agents for Angular app migrations
  5. How you can create your own agents and customizations in VS Code
  6. Q&A

> Feel free to interrupt — this is meant to be interactive, not a lecture.

---

## Part 1: MCP Servers — Setup, Use Cases & Hands-On

---

### 1. Intro — What Are MCPs? (5 min)

- **MCP = Model Context Protocol** — an open standard that lets AI assistants (like GitHub Copilot) access external tools, APIs, and documentation sources
- Think of it as **plugins for your AI** — the same way VS Code extensions add features to your editor, MCP servers add capabilities to your AI agent
- **How it works:**
  1. You configure an MCP server (a small process or remote URL)
  2. The AI agent discovers the tools that server exposes
  3. When you ask a question, the agent can automatically call those tools to get better, more relevant answers
- **Why it matters for us:**
  - **Accelerates development** — AI can pull live OneCX docs, PrimeNG component specs, npm package info directly instead of hallucinating
  - **Helpful for debugging** — Chrome DevTools MCP lets the AI inspect your running app, check DOM, network requests, console errors
  - **Always up-to-date** — MCP tools fetch current documentation/data, not stale training data

---

### 2. Overview of MCP Servers We'll Set Up (3 min)

| MCP Server | What It Does | When To Use |
|------------|--------------|-------------|
| **OneCX MCP** | Access OneCX documentation knowledge base | Architecture questions, widget implementation, workspace routing, shell integration, platform APIs |
| **PrimeNG MCP** | PrimeNG component docs, examples, migration guides | Building/fixing UI components, configuring tables/forms, component migration |
| **npm Sentinel MCP** | npm package metadata, vulnerabilities, maintenance scores | Evaluating dependencies, detecting vulnerable packages, comparing packages |
| **Chrome DevTools MCP** | Control a Chrome browser — DOM inspection, network, console | Debugging frontend apps, inspecting rendered pages, analyzing network issues |

> **Pro tip:** Don't enable all MCPs at once. Too many tools = slower, less relevant responses. Enable only what you need for the current task.

**Effective groupings:**
- **OneCX development:** OneCX MCP + PrimeNG MCP + npm Sentinel MCP
- **Frontend debugging:** Chrome DevTools MCP + PrimeNG MCP
- **Dependency validation:** npm Sentinel MCP alone

---

### 3. MCP Use Cases & Scenarios — When To Use Each (10 min)

#### OneCX MCP — Developer Scenarios

| Scenario | Example Prompt |
|----------|----------------|
| Understanding architecture | `ask onecx: how does workspace routing work in OneCX?` |
| Implementing a new widget | `ask onecx: what is the lifecycle of a microfrontend widget?` |
| Shell integration questions | `ask onecx: how do I register a remote module in the shell?` |
| Permission/capability handling | `ask onecx: how does the permission system work?` |
| Development guidelines | `ask onecx: what are the coding conventions for OneCX apps?` |

#### PrimeNG MCP — Developer Scenarios

| Scenario | Example Prompt |
|----------|----------------|
| Building a data table | `Using primeng, show me how to create a lazy-loading p-table with sorting and filtering` |
| Form validation | `What PrimeNG form components support reactive forms with built-in validation?` |
| Component migration | `What changed in p-dropdown between PrimeNG v17 and v18?` |
| Theming | `How do I customize the primary color tokens in PrimeNG's Aura theme?` |
| Accessibility | `What accessibility features does p-dialog provide and how do I configure aria labels?` |

#### npm Sentinel MCP — Developer Scenarios

| Scenario | Example Prompt |
|----------|----------------|
| Checking a package before adding | `Check the npm package 'lodash-es' — is it maintained? Any vulnerabilities?` |
| Comparing alternatives | `Compare 'date-fns' vs 'dayjs' vs 'luxon' — maintenance, size, vulnerabilities` |
| Auditing current dependencies | `Check if any of our dependencies have known vulnerabilities` |
| Version research | `What are the latest versions and changelogs for '@angular/core'?` |

#### Chrome DevTools MCP — Developer Scenarios

| Scenario | Example Prompt |
|----------|----------------|
| Page inspection | `Use chrome devtools to open http://localhost:4200 and list the page title` |
| DOM debugging | `Use chrome-devtools-mcp to inspect the DOM of http://localhost:4200/home and find all p-table elements` |
| Network analysis | `Open http://localhost:4200 and list all failed network requests` |
| Console errors | `Navigate to http://localhost:4200/admin and show me any console errors` |
| Performance | `Run a Lighthouse audit on http://localhost:4200` |

---

### 4. Interactive Check-In (2 min)

> **Ask the audience:**  
> "Should we go ahead and do the setup together in this session so any issues can be resolved live? Or are you comfortable setting it up on your own afterwards?"

---

### 5. Hands-On: OneCX MCP Setup (5 min)

**Reference:** [MCP Server Setup Guide](https://onecx.github.io/docs/documentation/current/onecx-docs-dev/ai/mcp_server_setup.html)

**Steps:**

1. Open VS Code Command Palette: `Ctrl + Shift + P`
2. Run: `MCP: Add server...`
3. Enter the OneCX MCP Server URL:
   ```
   https://onecx-docs-ai-dev.dev.one-cx.org/mcp
   ```
4. Restart VS Code
5. Verify: open Copilot Chat in Agent mode and ask:
   ```
   ask onecx: how does workspace routing work in OneCX?
   ```

**Troubleshooting — Certificate Issues (WSL):**
- If you get `TypeError: fetch failed`, it's likely a certificate issue
- Export the certificate chain from the MCP URL in browser (click lock icon → Certificate → Export each cert)
- Install in WSL:
  ```bash
  sudo cp <certificate>.crt /usr/local/share/ca-certificates/
  sudo update-ca-certificates
  ```
- If still failing in WSL: Add MCP Server in **Remote Workspace** instead

---

### 6. Hands-On: PrimeNG MCP Setup (5 min)

**Current Issue:** The latest PrimeNG MCP (`@primeng/mcp`) has a known bug — [GitHub Issue #19504](https://github.com/primefaces/primeng/issues/19504)

- **Root cause:** `@primeuix/mcp` declares `"@modelcontextprotocol/sdk": "^1.24.3"`, which resolves to `1.29.0` where `McpServer.tool()` added stricter Zod schema validation. The `get_migration_guide` tool passes an object that doesn't satisfy the new type guard.
- **Fix PR is open:** [primeuix#229](https://github.com/primefaces/primeuix/pull/229) — but not yet released

**Workaround — Pin the SDK version in an isolated install:**

```bash
# Create isolated directory
mkdir -p ~/.local/mcp-servers/primeng
cd ~/.local/mcp-servers/primeng
```

Create `package.json`:
```json
{
  "name": "primeng-mcp-isolated",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@primeng/mcp": "21.1.5",
    "@modelcontextprotocol/sdk": "1.24.3"
  },
  "overrides": {
    "@modelcontextprotocol/sdk": "1.24.3"
  }
}
```

Create `start.mjs`:
```js
#!/usr/bin/env node
import "@primeng/mcp";
```

Install:
```bash
npm install
```

**MCP Configuration** (in VS Code `mcp.json` or settings):
```json
{
  "primeng": {
    "type": "stdio",
    "command": "node",
    "args": ["~/.local/mcp-servers/primeng/start.mjs"]
  }
}
```

> **Once the fix is released**, the simple config will work again:
> ```json
> "primeng": {
>   "command": "npx",
>   "args": ["-y", "@primeng/mcp"]
> }
> ```

---

### 7. Hands-On: npm Sentinel MCP Setup (3 min)

**Configuration:**
```json
"npm-sentinel": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@nekzus/mcp-server@latest"]
}
```

Add via `MCP: Add server...` or directly in your `.vscode/mcp.json`.

---

### 8. Hands-On: Chrome DevTools MCP Setup (8 min)

**Reference:** [MCP Server Setup Guide — Chrome DevTools](https://onecx.github.io/docs/documentation/current/onecx-docs-dev/ai/mcp_server_setup.html)

#### Step 1: Install Google Chrome in WSL (if not installed)

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install ./google-chrome-stable_current_amd64.deb
google-chrome --version
```

#### Step 2: Create the startup script

```bash
sudo nano /usr/local/bin/start-chrome-mcp.sh
```

Paste the following:

```bash
#!/usr/bin/env bash
set -euo pipefail

MCP_LOG_FILE="/tmp/chrome-devtools-mcp.log"
CHROME_BIN=""

LATEST_PUPPETEER_CHROME="$(ls -1d ~/.cache/puppeteer/chrome/linux-*/chrome-linux64/chrome 2>/dev/null | tail -n 1 || true)"

if [[ -n "$LATEST_PUPPETEER_CHROME" ]]; then
  CHROME_BIN="$LATEST_PUPPETEER_CHROME"
elif command -v google-chrome >/dev/null 2>&1; then
  CHROME_BIN="$(command -v google-chrome)"
else
  echo "Google Chrome not found. Please install it in WSL." >&2
  exit 1
fi

echo "Using Chrome binary: $CHROME_BIN" >&2

exec npx -y chrome-devtools-mcp@latest \
  --headless \
  --isolated \
  --executablePath "$CHROME_BIN" \
  --chrome-arg=--no-sandbox \
  --chrome-arg=--disable-dev-shm-usage \
  --chrome-arg=--disable-gpu \
  --experimental-include-all-pages \
  --logFile "$MCP_LOG_FILE"
```

#### Step 3: Make executable

```bash
chmod +x /usr/local/bin/start-chrome-mcp.sh
```

#### Step 4: Configure MCP

1. `Ctrl + Shift + P` → `MCP: Open Remote User Configuration`
2. Add:

```json
{
  "io.github.ChromeDevTools/chrome-devtools-mcp": {
    "type": "stdio",
    "command": "/usr/local/bin/start-chrome-mcp.sh",
    "args": []
  }
}
```

#### Step 5: Restart VS Code and test

```
Use chrome devtools to open https://example.com and list the page title.
```

---

## Part 2: AI-Assisted Development — Agents, Customization & VS Code Features

---

### 9. Context — AI Push in Daily Development (3 min)

- There's been a push from upper management to integrate AI into daily development workflows
- We also had the **Angular App AI Migration Workshop** where we were migrating OneCX apps using GitHub Copilot
- In that workshop, we **orchestrated AI agents** — multiple specialized agents working together to perform complex multi-step migrations automatically

**What does "orchestrated AI agents" mean?**
- Instead of one generic AI chat, we created **specialized agents** with specific roles:
  - **Orchestrator** — coordinates the workflow, routes tasks
  - **Planner** — analyzes the codebase, creates a migration plan from official docs
  - **Executor** — picks up one task at a time, makes changes, validates (build → lint → test)
  - **Validator** — independently verifies each task's correctness with evidence
- Each agent has its own tools, instructions, and constraints
- They hand off work to each other automatically
- This is all configured through files in the `.github/` folder

---

### 10. The `.github/` Folder — Your AI Customization Hub (8 min)

The `.github/` directory is where all VS Code AI customization lives. Here's the structure:

```
.github/
├── AGENTS.md                          # Always-on instructions (loaded every request)
├── copilot-instructions.md            # Alternative always-on instructions
├── agents/                            # Custom agent definitions
│   ├── migration-orchestrator.agent.md
│   ├── migration-executor.agent.md
│   ├── migration-planner.agent.md
│   └── migration-validator.agent.md
├── instructions/                      # File-scoped or always-on coding rules
│   ├── migration-rules.instructions.md
│   ├── migration-18-19.instructions.md
│   └── migration-custom-user.instructions.md
├── prompts/                           # Reusable slash commands
│   └── migrate.prompt.md
├── hooks/                             # Lifecycle automation (format on save, etc.)
│   └── format.json
├── skills/                            # Portable capabilities with resources
│   └── webapp-testing/
│       └── SKILL.md
└── templates/                         # Templates for generated files
```

#### What each piece does:

| File/Folder | Purpose | Example |
|-------------|---------|---------|
| **AGENTS.md** | Project-wide rules loaded into every AI request | "Always validate with build → lint → test" |
| **agents/*.agent.md** | Define specialized AI personas with specific tools, models, and handoffs | A "reviewer" agent that can only read files, not edit them |
| **instructions/*.instructions.md** | Coding standards auto-applied to matching files | "For `**/*.ts` files, always use strict TypeScript" |
| **prompts/*.prompt.md** | Custom `/slash` commands you type in chat | `/migrate` to start migration, `/create-component` to scaffold |
| **hooks/*.json** | Shell commands triggered at lifecycle events | Auto-run Prettier after every file edit |
| **skills/*/SKILL.md** | Portable bundles of instructions + scripts + examples | A testing skill with templates and helpers |

---

### 11. How Developers Can Create Their Own Agents & Customizations (10 min)

#### Scenario 1: Create a Code Review Agent

You want an agent that only reviews code without making changes:

```markdown
---
name: reviewer
description: Reviews code for quality, security, and best practices
tools: ['read', 'search']
model:
  - Claude Sonnet 4.6 (copilot)
---

You are a senior code reviewer. Analyze code for:
- Security vulnerabilities (OWASP Top 10)
- Performance issues
- Code style violations
- Missing error handling

Never modify files. Only report findings with severity levels.
```

Save as `.github/agents/reviewer.agent.md` → select `@reviewer` from the agents dropdown.

#### Scenario 2: File-Specific Instructions for Angular Components

You want all `.component.ts` files to follow specific patterns:

```markdown
---
name: Angular Component Standards
description: Conventions for Angular components
applyTo: '**/*.component.ts'
---

- Use OnPush change detection strategy
- Inject services via `inject()` function, not constructor
- Use signals for reactive state
- Implement OnDestroy and clean up subscriptions
- Use `trackBy` for all *ngFor directives
```

Save as `.github/instructions/angular-components.instructions.md` → auto-applied whenever AI touches a `.component.ts` file.

#### Scenario 3: Create a Reusable Prompt for Scaffolding

```markdown
---
name: create-feature
description: Scaffold a new OneCX feature module
argument-hint: "[feature-name]"
tools: ['read', 'search', 'edit', 'execute']
---

Generate a new OneCX feature module with:
1. A lazy-loaded routing module
2. A search page with p-table
3. A detail/edit dialog
4. Translation files (en.json, de.json)
5. Unit test stubs

Follow the patterns in the existing feature modules.
```

Save as `.github/prompts/create-feature.prompt.md` → use via `/create-feature user-management` in chat.

#### Scenario 4: Auto-Format Hook After Every Edit

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

Now every time the AI edits a file, Prettier runs automatically.

#### Scenario 5: TDD Workflow with Agent Handoffs

Create three agents that form a cycle:

- **TDD Red** — writes failing tests → hands off to Green
- **TDD Green** — writes minimal code to pass → hands off to Refactor
- **TDD Refactor** — cleans up → hands off back to Red

Each agent automatically runs the test suite before handing off.

#### Scenario 6: A Debugging Agent with Chrome DevTools

```markdown
---
name: debugger
description: Debug frontend issues using Chrome DevTools
tools: ['read', 'search', 'io.github.ChromeDevTools/chrome-devtools-mcp/*', 'web']
---

You are a frontend debugging specialist. When the user reports a UI issue:
1. Open the page in Chrome DevTools
2. Inspect the DOM for the relevant components
3. Check the console for errors
4. Analyze network requests
5. Report findings with screenshots
```

#### Quick Create Commands

Instead of writing files manually, use these slash commands:

| Command | What It Does |
|---------|--------------|
| `/create-agent a security review agent` | AI generates the `.agent.md` for you |
| `/create-instruction always use OnPush change detection` | AI generates the `.instructions.md` |
| `/create-prompt scaffold a new OneCX feature module` | AI generates the `.prompt.md` |
| `/create-skill a skill for debugging integration tests` | AI generates the skill folder |
| `/create-hook run ESLint after every file edit` | AI generates the hook JSON |
| `/init` | AI analyzes your project and generates `copilot-instructions.md` |

---

### 12. Other VS Code AI Features (8 min)

**Reference:** [VSCODE-AI-FEATURES.md](VSCODE-AI-FEATURES.md) in this workspace

#### Memory — AI That Remembers

| Scope | Persists | Use For |
|-------|----------|---------|
| **User memory** (`/memories/`) | Across all sessions & workspaces | Your preferences, patterns, general insights |
| **Repository memory** (`/memories/repo/`) | Across sessions, this workspace only | Codebase conventions, build commands, project structure |
| **Session memory** (`/memories/session/`) | This conversation only | Task-specific context, in-progress plans |

**Developer example:** "Remember that our team uses conventional commits and our branch prefix is `feature/JIRA-`" → AI remembers this in every future conversation.

#### Subagents — Divide and Conquer

- The main agent can spawn isolated **subagents** for focused work
- Each subagent gets fresh context, works independently, returns a summary
- **Developer example:** "Review this PR for security, performance, and code style" → AI spawns three parallel reviewers, each specialized

#### Planning — Think Before Coding

- Select **Plan** agent or type `/plan` before a complex task
- AI asks clarifying questions, creates a step-by-step plan, then hands off to implementation
- **Developer example:** `/plan migrate our user-management module to signals and standalone components`

#### Model Selection — Right Model for the Job

| Model | Cost | Best For |
|-------|------|----------|
| GPT-4.1 | Free (0x) | Quick questions, validation, simple edits |
| Claude Haiku 4.5 | 0.33x | Capable but cheap execution tasks |
| Claude Sonnet 4.6 | 1x (baseline) | Complex reasoning, planning, multi-file changes |
| Claude Opus 4.6 | 3x | Most complex architectural tasks |
| **Auto** | Variable | Let VS Code pick the best model per request |

**Developer tip:** Use `Ctrl + Alt + .` to quickly switch models. Use Auto for most work.

#### Inline Chat — Edit in Place

- `Ctrl + I` in the editor → ask AI to modify selected code right there
- **Developer example:** Select a function → `Ctrl + I` → "convert this to use signals instead of BehaviorSubject"

#### Useful Slash Commands

| Command | What It Does |
|---------|--------------|
| `/fix` | Fix code issues |
| `/tests` | Generate unit tests |
| `/doc` | Generate documentation comments |
| `/explain` | Explain selected code |
| `/compact` | Summarize and compress long conversations |
| `/startDebugging` | Generate launch.json and start debugging |

#### Agent Plugins — Install Community Tools

- Extensions view → search `@agentPlugins`
- Browse [awesome-copilot](https://github.com/github/awesome-copilot/) for community agents, skills, and plugins
- Install from Git: `Chat: Install Plugin From Source` → paste Git URL

#### Keyboard Shortcuts Cheat Sheet

| Shortcut | Action |
|----------|--------|
| `Ctrl + Alt + I` | Open Chat view |
| `Ctrl + Shift + I` | Switch to Agent mode |
| `Ctrl + I` | Inline chat (editor or terminal) |
| `Ctrl + N` | New chat session |
| `Ctrl + Alt + .` | Open model picker |
| `F2` | AI-powered rename |

#### Diagnostics & Debug

- Right-click Chat → **Diagnostics** to see which instructions, agents, tools are loaded
- `/troubleshoot` to analyze agent debug logs
- Enable `github.copilot.chat.agentDebugLog.enabled` for detailed logs

---

### 13. Wrap-Up & Q&A (3 min)

- **MCPs** = give your AI access to live tools and docs (OneCX, PrimeNG, npm, Chrome)
- **`.github/` folder** = your AI customization hub (agents, instructions, prompts, hooks, skills)
- **Start small:** `/init` → add one instruction file → create one prompt → build from there
- **Questions?**

---

## Quick Reference Links

| Resource | URL |
|----------|-----|
| MCP Server Setup Guide | https://onecx.github.io/docs/documentation/current/onecx-docs-dev/ai/mcp_server_setup.html |
| PrimeNG MCP Issue & Workaround | https://github.com/primefaces/primeng/issues/19504 |
| VS Code Copilot Docs | https://code.visualstudio.com/docs/copilot |
| Awesome Copilot Plugins | https://github.com/github/awesome-copilot |
| Agent Skills Standard | https://agentskills.io |
