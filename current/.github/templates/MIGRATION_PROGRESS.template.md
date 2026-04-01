# Migration Progress: OneCX Angular 18 → 19

Date Started: **[YYYY-MM-DD]**
Repository: **[path/to/repo]**

---

## Phase 1: Preparation & Planning

| Task | Status | Notes |
|------|--------|-------|
| npm install fresh baseline | [ ] | Run once, capture baseline test coverage %. |
| npm test baseline | [ ] | Establish coverage baseline before changes. |
| Check .vscode/tasks.json | [ ] | Verify npm:build, npm:lint, npm:test exist. |
| Check copilot-instructions.md | [ ] | Tag all Angular 18 specific lines with # [REMOVE-AFTER-A19]. |
| Discover OneCX docs | [ ] | Fetch migration index page + all linked pages. Visit EVERY link. |
| Discover PrimeNG v19 docs | [ ] | If repo uses primeng: fetch migration guide. |
| Discover Nx migration docs | [ ] | If workspace is Nx: fetch migration guide. |
| Build complete task tree | [ ] | Count H2 subsections per page. Create one task per subsection. |
| Create MIGRATION_PROGRESS.md | [ ] | Populate task list below. |

**Phase 1 Summary:**
- [ ] All audits complete
- [ ] Documentation fully expanded (no assumptions from headlines)
- [ ] Task tree created and reviewed
- [ ] Ready to start Phase A

---

## Phase A: Pre-Migration

> Execute one task per invocation. DO NOT combine multiple subsections.
> Each row = ONE H2 or linked page.

### Task Template (COPY for each new task)

```
**[Task Number]. [Task Name]**
- [ ] Status: [ ] not started | [x] completed | [-] not applicable
- Source pages: [URL list]
- Applicability: must-have | nice-to-have | not applicable
- Repository evidence: [grep results or inspection findings]
- Planned action: [what you will actually do]
- Files changed: [list exactly which files]
- Validation:
  * npm run build: [✓ or capture error]
  * npm run lint: [✓ or capture error]
  * npm run test: [✓ coverage %, or error]
- Skipped by: [developer name] on [date] (if [-] marked by skip~N)
- Final outcome: success | blocked | error
- Edge cases: [any gotchas found]
```

### Phase A Tasks (discovered by planner)

**1. Update @angular/core package to 19.x**
- [ ] not started
- Source pages: [TBD by planner]
- Applicability: must-have
- Repository evidence: [TBD by executor]
- Planned action: [TBD by executor]
- Files changed: [TBD]
- Validation: [TBD]
- Final outcome: [TBD]

**2. Update @angular/common package to 19.x**
- [ ] not started
- Source pages: [TBD by planner]
- Applicability: must-have
- Repository evidence: [TBD by executor]
- Planned action: [TBD by executor]
- Files changed: [TBD]
- Validation: [TBD]
- Final outcome: [TBD]

**[Continue per documented tasks]**
- [ ] not started
- Source pages: [TBD]
- Applicability: [TBD]
- Repository evidence: [TBD]
- Planned action: [TBD]
- Files changed: [TBD]
- Validation: [TBD]
- Final outcome: [TBD]

---

## Phase B: Manual Hand-Off (Developer Confirmation)

> After Phase A completes:
> Developer runs build/lint/test in local environment
> Confirms all tests pass
> Signs off on Phase B entry

Developer sign-off:
- [ ] I have run `npm run build` and captured output
- [ ] I have run `npm run lint` locally (0 errors expected)
- [ ] I have run `npm run test` and reviewed coverage changes
- [ ] All tests PASS (not skipped, not pending)
- [ ] I am ready to proceed to Phase C
- [ ] Signature: `[Developer Name] [Date]`

---

## Phase C: Post-Migration

> Execute after Phase B sign-off.
> Same format as Phase A (one task per invocation).

### Phase C Tasks

**1. Clean copilot-instructions.md**
- [ ] not started
- Planned action: Remove all lines tagged [REMOVE-AFTER-A19]
- Files changed: copilot-instructions.md
- Validation: npm run build, npm run lint, npm run test
- Final outcome: [TBD]

**2. Verify package.json consistency**
- [ ] not started
- Planned action: Confirm all @angular packages match version
- Files changed: package.json (if fixes applied)
- Validation: npm run build, npm run lint, npm run test
- Final outcome: [TBD]

**[Continue per documented tasks]**

---

## Summary

**Start date:** [YYYY-MM-DD]
**End date:** [YYYY-MM-DD when complete]
**Total tasks:** [N]
**Completed:** [N]
**Skipped:** [N] (via skip~X by developer)
**Blocked:** [N]

**Test coverage baseline:** [%] → **Final coverage:** [%]

**Critical blockers:** [if any]

**Sign-off:** [Developer Name, Date]
