# Strict Doc Expansion: The No-Assumption Rule

**Core principle**: NEVER assume page content from headline. ALWAYS fetch full page, read full content, count ALL subsections.

---

## The Problem This Solves

### Before (Lazy Approach)
```
Headline: "Update Angular packages to v19"
↓ (assumption)
"This probably means run npm install with updated package.json"
↓ (result)
Missed: "Also run npm dedupe", "Test old packages still work", "Check compatibility"
❌ Incomplete task execution
```

### After (Strict Expansion Approach)
```
Headline: "Update Angular packages to v19"
↓ (fetch full page)
Read actual content:
  H2: "1. Update package.json"
  H2: "2. Run npm dedupe"
  H2: "3. Test peer dependencies"
  H2: "4. Validate with build"
↓ (result)
Create 4 separate tasks (one per H2)
✅ Complete, granular execution
```

**Result**: Each subsection becomes a separate task, executed independently, validated separately.

---

## The Rule: Visit Every Link

### Step 1: Start at Index Page
```
Fetch: /docs/angular-19-migration/

Content shows:
├─ Overview (H2: "What's new in Angular 19")
├─ "Getting Started" (link to /getting-started/)
├─ "Breaking Changes" (link to /breaking-changes/)
├─ "Step-by-Step Upgrade" (link to /step-by-step/)
├─ "Common Issues" (link to /common-issues/)
└─ "FAQs" (link to /faqs/)
```

**Action**: Fetch all 5 linked pages (don't skip any).

### Step 2: Fetch Each Linked Page
```
Fetch: /docs/angular-19-migration/getting-started/

Content shows H2 subsections:
├─ "Check Node version"
├─ "Install Angular CLI"
├─ "Backup your repo"
├─ "Start upgrade"

Record: 4 subsections on this page
```

**Action**: Check if this page HAS sub-links. If yes, fetch those too.

### Step 3: Check for Nested Links
```
Text in "Backup your repo" section mentions:
"See our backup guide at /guides/backup/"

Action: Fetch /guides/backup/ too if significant

Example: "See backup-commands.txt" 
         → Ignore (too shallow, text reference only)
         
Example: "Detailed guide at /guides/backup-commands/"
         → Fetch it (it's a full page reference)
```

**Rule**: If H2 section links to another doc with its own H2 structure, fetch it.

### Step 4: Count All Subsections
```
Per-page subsection count:

Getting Started page:
├─ H2: "Check Node version" → 1 task
├─ H2: "Install Angular CLI" → 1 task
├─ H2: "Backup your repo" → 1 task (if sub-link, might become N tasks)
└─ H2: "Start upgrade" → 1 task
Total: 4-N tasks from this page

Breaking Changes page:
├─ H2: "Router changes" → 1 task
├─ H2: "Signal-based state" → 1 task
├─ H2: "Dependency injection" → 1 task
Total: 3 tasks

... (similar for other pages)

Grand total: 30-50 tasks across all pages
```

**Action**: Build complete task tree, label each with source page URL.

---

## Example: Real Doc Expansion

### Scenario: OneCX Angular 19 Migration Index

**Fetch**: https://onecx.io/docs/angular-19-migration/

**Content** (imagine):
```
# Angular 18 → 19 Migration Guide

Welcome to the comprehensive migration guide.

## Prerequisites
- Node 20+
- Angular CLI latest
- Package: npm install -g @angular/cli@19

## Sections
- [Getting Started](./getting-started.md)
- [Breaking Changes](./breaking-changes.md)
- [Step by Step](./step-by-step.md)
- [PrimeNG Integration](./primeng.md)
```

### Action 1: Fetch Getting Started Page
```
https://onecx.io/docs/angular-19-migration/getting-started.md

Content:

## Prerequisites Check
- [ ] Node 18+ installed
- [ ] npm 10+ installed

## 1. Verify Node Version
Run: node --version
Expected: v20.x or higher

## 2. Back Up Your Repository
Run: git checkout -b a19-migration
Safety: Don't skip this

## 3. Install Angular CLI
Run: npm install -g @angular/cli@19

## 4. Create Migration Plan
Step: List all @angular/\* packages
Command: npm ls | grep @angular

Tasks created:
├─ Task 1: Verify Node version
├─ Task 2: Create backup branch
├─ Task 3: Install Angular CLI v19
└─ Task 4: Create migration plan
```

### Action 2: Fetch Breaking Changes Page
```
https://onecx.io/docs/angular-19-migration/breaking-changes.md

Content:

## Route Component Changes
In v19, route components must be...
[Detailed explanation, examples]

## Standalone Component Requirement
Angular 19 requires standalone...
[Detailed explanation, code samples]

## Dependency Injection Changes
New signal-based DI pattern...
[Tutorial, migration examples]

Tasks created:
├─ Task 5: Update route components (new syntax)
├─ Task 6: Make components standalone (if applicable)
└─ Task 7: Update DI to signal-based (if applicable)
```

### Action 3: Check for Sub-links in Breaking Changes
```
Text mentions: "See PrimeNG-specific changes at [primeng-migration.md](./primeng.md)"

This is a full page reference → Fetch it
(Don't fetch "Github issue link" or "Stack Overflow post link")

Fetch: https://onecx.io/docs/angular-19-migration/primeng.md

Content:

## PrimeNG v19 Upgrade
Install: npm install primeicons@latest

## Component Breaking Changes
- Button: [x] attribute removed → use [severity]
- Dialog: onHide() → onHiddenChange()
- DataTable: paginator position moved

## Style Changes
Old: @import "~primeicons/primeicons.css"
New: import "primeicons/primeicons.css"

Tasks created:
├─ Task N: Update PrimeNG packages
├─ Task N+1: Update Button components
├─ Task N+2: Update Dialog callbacks
├─ Task N+3: Update DataTable config
└─ Task N+4: Update style imports
```

### Result: Complete Task Tree
```
Phase A: Pre-Migration
├─ Verify Node version (getting-started)
├─ Create backup branch (getting-started)
├─ Install Angular CLI v19 (getting-started)
├─ Create migration plan (getting-started)
├─ Update route components (breaking-changes)
├─ Make components standalone (breaking-changes)
├─ Update DI to signal-based (breaking-changes)
├─ Update PrimeNG packages (primeng)
├─ Update Button components (primeng)
├─ Update Dialog callbacks (primeng)
├─ Update DataTable config (primeng)
└─ ... (continue for all pages)

Total: 40+ tasks, each with source page URL
```

---

## The "No Assumption" Checklist

✅ **Before starting Phase 1 planning, you verify**:
- [ ] Start at main index page (not a sub-page)
- [ ] For EACH link on index:
  - [ ] Fetch full linked page (not just title)
  - [ ] Read entire content (not summary)
  - [ ] Mark: How many H2 subsections?
  - [ ] Check: Any sub-links? Fetch those too
- [ ] Count total subsections across all pages
- [ ] Create one task per subsection
- [ ] Record source page URL for each task
- [ ] Report: "Visited X pages, found Y subsections, created Z tasks"

❌ **Never skip these steps**:
- ❌ "The title suggests this is about X, so I'll assume..."
- ❌ "This page probably has 3 sections, I'll move on"
- ❌ "That link looks minor, I'll skip it"
- ❌ "I'll combine multiple subsections into one task"
- ❌ "This page seems similar to the last one, probably same content"

---

## Why This Matters

### Risk of Lazy Expansion
```
You skip a link → Miss a full page of tasks
→ Executor starts Phase A → Halfway through: "Wait, I also need to update styles?"
→ Task tree was incomplete
→ Migration gets disrupted
```

### Benefit of Strict Expansion
```
You visit every link → Discover all 50 tasks upfront
→ Executor systematically works through 50 tasks
→ No surprises
→ Validator sees complete evidence
→ Migration finishes smoothly
```

---

## Practical Rules

**Rule 1**: If it's a link on the index page, fetch it. Period.

**Rule 2**: If a page's content links to another page, and that link looks significant (tutorials, guides, related sections), fetch it.

**Rule 3**: Each H2 heading = one task. Count them accurately.

**Rule 4**: When in doubt, fetch the link. Extra links = extra safety.

**Rule 5**: Always report: "Visited X pages, fetched content, created Y tasks from Z subsections."

---

## Summary

**Strict Doc Expansion** means:
1. Start at main index
2. Fetch EVERY link (no assumptions from titles)
3. Read FULL page content (not summaries)
4. Count ALL H2 subsections accurately
5. Create one task per subsection
6. Record source URL for each task
7. Report what was discovered

**Result**: Complete, granular task tree with no surprises during execution.

**Benefit**: Executor can work autonomously without gaps in the plan.
