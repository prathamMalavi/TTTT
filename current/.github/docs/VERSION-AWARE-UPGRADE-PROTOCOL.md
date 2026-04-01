# Version-Aware Upgrade Protocol: Runtime Doc Fetching & Stable Releases

**Purpose**: Execute version upgrades EXACTLY as documented, respecting semantic versioning (^5 = latest 5.x stable, ^6 = latest 6.x stable).

---

## Problem Statement

Traditional approach: "Upgrade to latest" → Might get beta, RC, or wrong version

Solution: Parse docs carefully → Determine version constraint → Resolve to latest STABLE in that range

---

## Complete Workflow

### Phase 1: Detect Repository Context

**At task start, determine repo type**:

```bash
# Check 1: Nx or Angular standard?
[ -f "nx.json" ] && CONTEXT="nx" || CONTEXT="angular"

# Check 2: Current versions
grep "@angular/core" package.json  → e.g., ^18.5.0
grep "@nrwl/nx" package.json       → e.g., ^19.2.1 (if Nx)

# Check 3: Node version (might be relevant)
node --version                      → e.g., v20.11.0
```

**Record context**:
```
MIGRATION_PROGRESS.md:
- Repo context: Nx monorepo | Standard Angular
- Current @angular/core: ^18.5.0
- Current nx (if applicable): ^19.2.1
- Current Node: v20.11.0
```

### Phase 2: Runtime Doc Fetching (MCP-First)

**Fetch Angular 19 migration docs at runtime**:

#### For Nx Repositories:

```
Priority 1: OneCX MCP
  → Query: "Angular 19 migration for Nx projects"
  → Response: OneCX-specific Nx migration guide + version requirements
  
Priority 2: Nx MCP
  → Query: "Nx migrate Angular 18 to 19"
  → Response: Nx official migration guide
  
Priority 3: Fallback URLs
  → https://nx.dev/docs/nx-api/angular (official)
  → https://docs.nrwl.io/nx/latest/nn/nx-core (official)
```

#### For Standard Angular (Non-Nx):

```
Priority 1: OneCX MCP
  → Query: "Angular 19 migration"
  → Response: OneCX-specific migration guide + version requirements
  
Priority 2: Angular official
  → Query to online docs: Angular 19 update guide
  → Response: Official Angular migration guide
  
Priority 3: Fallback URLs
  → https://angular.io/guide/upgrade (official)
  → https://angular.io/guide/migration-overview (official)
```

#### For PrimeNG Components:

```
Always fetch during Phase C:
Priority 1: OneCX MCP
  → Query: "PrimeNG v19 migration"
  
Priority 2: PrimeNG official
  → https://primeng.org/migration/v19
  
Priority 3: Component migration guide (local)
```

### Phase 3: Careful Page Reading & Version Extraction

**Read docs page by page. Extract**:

```
SECTION 1: Prerequisites & Requirements
  ✓ Read: What versions are required?
  ✓ Example quotes to extract:
    - "Requires Node 20.x or later"
    - "Requires Nx 20.0.0 or higher"
    - "Upgrade @angular/core to ^19"
    - "@angular/core must be >=18.5.0"

SECTION 2: Step-by-Step Guide
  ✓ Read: What are the actual upgrade steps?
  ✓ Example quotes:
    - "First, run: nx migrate 20.0.1"
    - "Then: npm install followed by nx migrate --run-migrations"
    - "Update package.json manually to @angular/core@^19"

SECTION 3: Version-Specific Notes
  ✓ Look for subsections like:
    - "For Nx >= 20.0"
    - "For Angular >= 19"
    - "Breaking changes"
  ✓ Extract version constraints

SECTION 4: Migration Paths
  ✓ Read: Are there different paths for different versions?
  ✓ Example: "If on Nx 19: do A, B, C"
  ✓ Example: "If on Nx 20: do D, E, F"
```

**Record in MIGRATION_PROGRESS.md**:
```
[x] Read Angular 19 Nx migration docs

Documentation Journey:
1. Fetched OneCX MCP → Success
2. Read section 1: Prerequisites & Version Requirements
   - Found: "Nx 20.0.0 or higher required"
   - Found: "@angular/core must be ^19"
3. Read section 2: Step-by-step
   - Found: "Run: nx migrate 20.0.1"
4. Read section 3: Version-specific notes
   - Found subsection: "For Nx 19.x → 20.x upgrade path"

Documented Version Requirements:
  - Nx target: 20.0.x (docs say "nx 20.0.0 or higher")
  - @angular/core target: ^19 (docs say "upgrade to ^19")
  - Node requirement: 20.x or later
```

---

### Phase 4: Resolve Caret & Tilde Versions (^5 vs ^6)

**When docs say "^19" or "~19.2", resolve correctly**:

#### Understanding Semver:

```
^19.2.1 means: >= 19.2.1 and < 20.0.0   (caret: breaking changes allowed in minor)
~19.2.1 means: >= 19.2.1 and < 19.3.0   (tilde: only patch updates)
19.2.1  means: EXACT version 19.2.1      (pinned: no flexibility)
^19     means: >= 19.0.0 and < 20.0.0    (latest in 19.x)
```

#### Resolution Process:

```
Step 1: Parse the docs requirement
  Docs say: "Upgrade to ^19"
  Meaning: Use latest in 19.x range

Step 2: Query npm registry
  Command: npm view @angular/core dist-tags
  Response: 
    latest: 19.2.1
    next: 20.0.0-rc.1
    lts: 18.3.5

Step 3: Resolve "latest in 19.x"
  From dist-tags: latest = 19.2.1 ✓
  Check: Is this in 19.x range? YES ✓
  Result: Use 19.2.1 (latest stable 19.x)

Step 4: Handle special cases
  If docs say "^19.2+": Use latest in 19.2.x → 19.2.1
  If docs say "^19.0+": Use latest in 19.0.x → 19.0.12
  If docs say "18.5.0+": Use 18.5.0 or later (likely 19.x available)
```

#### Decision Matrix:

| Docs Says | Meaning         | Resolution | Command                            |
| --------- | --------------- | ---------- | ---------------------------------- |
| `^19`     | Latest 19.x     | 19.2.1     | `npm install @angular/core@19.2.1` |
| `^19.2`   | Latest 19.2.x   | 19.2.1     | `npm install @angular/core@19.2.1` |
| `~19.2.1` | Latest 19.2.x   | 19.2.1     | `npm install @angular/core@19.2.1` |
| `19.2.1`  | Exact version   | 19.2.1     | `npm install @angular/core@19.2.1` |
| `>=19`    | At least 19.0.0 | 19.2.1     | `npm install @angular/core@19.2.1` |
| (silent)  | Unknown, ask    | ASK USER   | "Docs don't specify version"       |

#### Pinning Strategy:

```
✓ GOOD: Use explicit resolved version
  npm install @angular/core@19.2.1   (pinned to stable)

❌ BAD: Use caret in package.json that might pull beta
  npm install @angular/core@^19      (might get 20.0.0-rc later)

❌ BAD: Use "latest" tag
  npm install @angular/core@latest   (might be beta/rc)
```

---

### Phase 5: Execute Version-Specific Upgrade

#### For Nx Repositories:

```
STEP 1: Detect current Nx version
  grep "\"nx\":" package.json
  → Current: ^19.2.1

STEP 2: Determine target Nx version
  From docs: "Nx 20.0.0 or higher"
  Resolve: Latest in 20.x = 20.1.2
  
STEP 3: Execute nx migrate (explicit version)
  Command: nx migrate 20.1.2  (NOT "latest" or "^20")
  
STEP 4: Install dependencies
  Command: npm install
  
STEP 5: Run migrations
  Command: nx migrate --run-migrations
  
STEP 6: Update remaining packages
  For each @angular/ package:
    npm install @angular/core@19.2.1
    npm install @angular/common@19.2.1
    ... (all @angular packages to same version)
```

#### For Standard Angular (Non-Nx):

```
STEP 1: Detect current versions
  grep "@angular/core" package.json
  → Current: ^18.5.0
  
STEP 2: Determine target @angular/core
  From docs: "Upgrade to ^19"
  Resolve: Latest in 19.x = 19.2.1
  
STEP 3: Execute upgrade (explicit versions)
  Command: npm install \
    @angular/core@19.2.1 \
    @angular/common@19.2.1 \
    @angular/platform-browser@19.2.1 \
    @angular/platform-browser-dynamic@19.2.1 \
    @angular/compiler@19.2.1 \
    @angular/forms@19.2.1 \
    @angular/router@19.2.1
  (All @angular packages to same version)
  
STEP 4: Update zone.js (might be required)
  npm install zone.js@latest-in-supported-range
  
STEP 5: Verify
  npm run build
  npm run test
```

#### For PrimeNG Upgrade (Phase C):

```
STEP 1: Check PrimeNG migration docs
  From OneCX MCP: "PrimeNG v19 migration"
  
STEP 2: Determine version target
  Docs say: "PrimeNG v19"
  Check npm: Latest 19.x = 19.3.2
  
STEP 3: Update related modules
  npm install primeng@19.3.2
  npm install @primeng/icons@latest  (if separate)
  
STEP 4: Migrate imports & components
  Follow docs: Component mapping (p-table → p-dataview, etc)
  
STEP 5: Verify
  npm run build
```

---

## Real-World Examples

### Example 1: Nx Repository (with OneCX)

```
CONTEXT: Nx monorepo, Angular 18 → 19

STEP 1: Detect
  Current: nx: ^19.2.1, @angular/core: ^18.5.0

STEP 2: Fetch docs at runtime
  Try: OneCX MCP query "Angular 19 Nx migration"
  Success: Get OneCX-specific guide + version requirements

STEP 3: Read docs carefully
  Section 1: "Requires Nx 20.0.0 or higher"
  Section 2: "Run: nx migrate 20.1.2"
  Section 2: "Update all @angular packages to ^19"
  
STEP 4: Resolve versions
  ^20 in docs → Latest 20.x = 20.1.2
  ^19 in docs → Latest 19.x = 19.2.1

STEP 5: Execute
  Command: nx migrate 20.1.2
  Command: npm install
  Command: nx migrate --run-migrations
  Command: npm install @angular/core@19.2.1 @angular/common@19.2.1
  
STEP 6: Verify
  npm run build ✓
  npm run test ✓

RECORD:
  "Updated Nx from 19.2.1 to 20.1.2 (per OneCX docs requirement)"
  "Updated @angular/core from 18.5.0 to 19.2.1"
```

### Example 2: Non-Nx Repository

```
CONTEXT: Standard Angular app, 18 → 19

STEP 1: Detect
  Current: @angular/core: ^18.4.2 (no nx.json)

STEP 2: Fetch docs at runtime
  Try: OneCX MCP query "Angular 19 migration"
  Success: Get migration guide
  
STEP 3: Read docs carefully
  "Upgrade @angular/core to ^19"
  "Node 20+ required"
  
STEP 4: Resolve versions
  ^19 in docs → Latest 19.x = 19.2.1

STEP 5: Execute
  Command: npm install \
    @angular/core@19.2.1 \
    @angular/common@19.2.1 \
    @angular/platform-browser@19.2.1 \
    @angular/forms@19.2.1 \
    @angular/router@19.2.1
  
STEP 6: Verify
  npm run build ✓
  npm run test ✓

RECORD:
  "Updated @angular/core from 18.4.2 to 19.2.1"
  "All @angular packages updated to 19.2.1"
```

---

## Handling Ambiguity

**If docs are unclear about version**:

```
DOCS SAY: "Upgrade to Angular 19"
PROBLEM: No version constraint (^19 or >=19.0.0?)

YOUR ACTION:
✓ Record: "Docs ambiguous on version constraint"
✓ Ask permission: "Docs say 'upgrade to Angular 19' but don't specify 
  version range. Should I use ^19 (19.x) or ==19.0.0 (exactly 19.0.0)?"
✓ Await: User decides
✓ Execute: User's preferred version
✓ Record: Decision in progress file
```

---

## Anti-Patterns (DO NOT DO)

❌ Use `npm upgrade` without specifying version  
❌ Use `npm install @angular/core@latest` (might be beta)  
❌ Guess version from docs headline  
❌ Skip reading version requirements  
❌ Assume page subsections match your repo (read carefully)  
❌ Use caret `^20` for Nx upgrade (use explicit version)  
❌ Mix Nx migrate with manual Angular upgrades (follow docs order)  

---

## Checklist: Before Any Version Upgrade

- [ ] Read docs page-by-page (not summary)
- [ ] Extracted version requirements (all of them)
- [ ] Determined repo context (Nx vs Angular)
- [ ] Resolved semantic versions (^X to latest-in-X)
- [ ] Verified versions from npm registry (not guessed)
- [ ] Recorded all version requirements in MIGRATION_PROGRESS.md
- [ ] Selected correct commands for repo type
- [ ] Used explicit versions (not ^, ~, or latest)
- [ ] Execute and verify (npm run build/test)

---

## See Also

- [migration-executor-v6.agent.md](../agents/migration-executor-v6.agent.md) - Version-Aware Upgrade Protocol section
- [HARD-RULES.md](HARD-RULES.md) - Rule H5 (source pages for each task)
- [MULTI-PHASE-ERROR-TRACKING.md](MULTI-PHASE-ERROR-TRACKING.md) - Error handling during upgrades
- [USAGE.md](../USAGE.md) - Phase B manual upgrade workflow
