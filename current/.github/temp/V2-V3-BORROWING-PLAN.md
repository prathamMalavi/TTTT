# V6 Features from V2/V3 Migration Analysis

## Executive Summary

**V6 Advantage**: Real-world hardened (10 issues fixed), skip~N, 3-agent minimal, mandatory context preservation.

**V2/V3 Patterns to Borrow**: Explicit user interaction policy, formalized phase gates, ambiguity rule, doc-driven skill.

**Result**: V6 keeps its strengths while gaining v2/v3's explicit behavioral guardrails.

---

## Pattern Analysis Matrix

| Category                    | V2/V3                       | V6 Current           | Recommendation                                        |
| --------------------------- | --------------------------- | -------------------- | ----------------------------------------------------- |
| **User Interaction Policy** | ✅ Explicit                  | ⚠️ Implicit           | **INTEGRATE** - Add to `AGENT-RULES.md`               |
| **Phase Gates**             | ✅ Documented (3 gates)      | ⚠️ Implicit           | **INTEGRATE** - Document in `USAGE.md`                |
| **Ambiguity Rule**          | ✅ "Stop & ask one question" | ❌ Missing            | **INTEGRATE** - Add to all agents                     |
| **Core Upgrade Gate**       | ✅ Separate agent + approval | ⚠️ Orchestrator only  | **CLARIFY** - Make approval explicit in orchestrator  |
| **Validation Gating**       | ✅ Separate validator agent  | ⚠️ Executor validates | **KEEP AS-IS** - Works with real-world checks         |
| **Doc-Driven Methodology**  | ✅ Skill + detailed docs     | ⚠️ Dispersed          | **CONSOLIDATE** - Create skill or comprehensive guide |
| **Hard Rules**              | ✅ Explicit list             | ⚠️ Scattered          | **FORMALIZE** - Create `HARD-RULES.md`                |
| **Runtime Discovery**       | ✅ 7-stage pipeline          | ✅ Strict expansion   | **DOCUMENT** - Formalize the 7 stages in v6           |
| **Real-World Fixes**        | ❌ None                      | ✅ 10 fixes           | **KEEP** - V6 advantage                               |
| **Skip~N Functionality**    | ❌ None                      | ✅ Yes                | **KEEP** - V6 advantage                               |
| **Context Preservation**    | ⚠️ Implicit                  | ✅ Mandatory          | **KEEP** - V6 advantage                               |

---

## HIGH Priority: Borrowing Patterns

### 1. Explicit User Interaction Policy

**From V2**: `docs/user-interaction-policy.md`

**What to Borrow**:
- "Ask immediately" list (branch, docs contradictory, target missing, external blocks, risky adaptation, phase gates)
- "Do not ask" list (routine grep, applicability checks, doc reading, next leaf execution)
- Good vs bad prompts guidance
- Phase gate clarification (approval ≠ execution)

**Why**: Agents need explicit rules about WHEN to interrupt the user.

**Implementation**:
- Add section to `AGENT-RULES.md`: "When to Ask the User"
- Copy "Ask immediately" and "Do not ask" lists
- Add examples of good/bad prompts
- Add to all 3 agents: orchestrator, planner, executor

**Lines**: ~40 lines

---

### 2. Explicit Phase Gates & Approval

**From V2**: Feature branch gate, core-upgrade approval gate, post-upgrade resume gate

**What v6 Currently Has**:
- Orchestrator routes to planner (Phase 1)
- Planner creates task tree
- Orchestrator routes to executor (Phase A/B/C)
- Executor marks tasks done

**What's Missing**:
- No explicit user approval before core upgrade (automatic now)
- No documented phase gate sequence
- No checkpoint summary before approval

**Why**: Makes the "approval" boundary explicit (users know upgrade won't happen without them).

**Implementation**:
- Add section to `USAGE.md`: "Phase Gates & Approval Boundaries"
- Document 3 gates: feature branch (init), core upgrade (pre-Phase B), post-upgrade resume (Phase B→C)
- Add to orchestrator: explicit "Ask for approval" before core upgrade phase
- Add checkpoint summary template before approval

**Lines**: ~60 lines

---

### 3. Ambiguity Rule

**From V2**: "If the agent does not understand the docs well enough to act safely: stop and ask one concise question"

**What to Borrow**:
- Rule: Stop if docs are ambiguous, don't guess
- Question format: "The docs require X or Y, the repo state does not clarify. Should I choose A or B?"
- Apply globally: planner, executor, orchestrator

**Why**: Prevents agents from guessing and breaking things.

**Implementation**:
- Add section to `AGENT-RULES.md`: "Ambiguity Rule"
- Add to all 3 agents: "If you don't understand, stop and ask one question: 'The docs say X or Y, repo state doesn't clarify. Should I X or Y?'"
- Document what counts as "ambiguous"

**Lines**: ~20 lines

---

### 4. Formalized Hard Rules

**From V2 Planner**: Explicit "Hard rules:" section

**What to Borrow**:
- Branch protection (not main/master/develop)
- Install & test requirements before planning
- Target version must be specified
- Must read docs before claiming applicability
- Cannot mark futures complete during planning
- Must include source pages in every task
- Parent stays unresolved while children unresolved
- Target must match documented migration path
- If repo state conflicts with target, ask

**Why**: Creates safety guardrails, prevents common mistakes.

**Implementation**:
- Create new file: `HARD-RULES.md`
- List all hard rules from v2, v3-specific, and v6 real-world learnings
- Reference from all agents
- Add enforcement checks to orchestrator

**Lines**: ~50 lines

---

### 5. Runtime Discovery Formalization

**From V2**: 7-stage runtime discovery pipeline

**V2 Pipeline**:
1. Infer context (current version from repo)
2. Identify source (OneCX MCP, PrimeNG, Nx, local)
3. Read index (main migration doc)
4. Expand pages (follow all links)
5. Build hierarchy (parent/child/leaf structure)
6. Check applicability (repo evidence)
7. Persist state (write MIGRATION_PROGRESS.md)

**V6 Has**: Strict doc expansion (step 4), but not formalized pipeline

**Why**: Makes discovery process explicit, reproducible.

**Implementation**:
- Create new doc: `docs/RUNTIME-DISCOVERY-PIPELINE.md`
- Document 7 stages with v6 specifics
- Reference from planner agent
- Align with "STRICT-DOC-EXPANSION.md" (consolidate if needed)

**Lines**: ~80 lines

---

## MEDIUM Priority: Consolidation

### 6. Doc-Driven Skill

**From V2**: `skills/doc-driven-migration/SKILL.md`

**Current V6 Equivalent**: Scattered across AGENT-RULES.md, STRICT-DOC-EXPANSION.md, CONTEXT-PRESERVATION-MANDATE.md

**Benefit**: Unified methodology document for "how to do doc-driven migration in v6"

**Implementation**:
- Option A: Create v6 skill at `skills/doc-driven-migration-v6/SKILL.md` (comprehensive, centralized)
- Option B: Create guide doc: `docs/DOC-DRIVEN-METHODOLOGY.md` (simpler)
- Include: When to use it, core rules, OneCX enforcement, good behavior, anti-patterns

**Recommendation**: Option B first (guide doc), can evolve to skill if v6 becomes a general template

---

## LOW Priority: Consider But Don't Implement

### What NOT to Borrow from V2

**6-Agent Architecture vs V6's 3-Agent Minimal**:
- V2: orchestrator, core-upgrade (agent), planner, step-executor, validator (agent), handover (agent)
- V6: orchestrator, planner, executor (does validation + core upgrade)

**Result**: V2 approach is more explicit = 6 agents, V6 approach is more minimal = 3 agents + real-world hardening + skip~N.

**Decision**: Keep V6's 3-agent design, make approval explicit via orchestrator instructions (not a separate agent).

**Why**: Each additional agent = more context loss, more handoff points, more potential failure modes. V6's 3 agents + real-world fixes are more robust for teams running actual OneCX migrations.

---

## Integration Sequenc e

### Phase 1: High-Priority Documentation (2–3 hours)

1. **`AGENT-RULES.md` Updates** (~40 lines)
   - Add "When to Ask the User" section (from v2 user-interaction-policy)
   - Add "Ambiguity Rule" section
   - Link to new files below

2. **NEW: `HARD-RULES.md`** (~50 lines)
   - List all hard rules
   - Include v6 real-world learnings
   - Reference from all agents

3. **`USAGE.md` Updates** (~60 lines)
   - Add "Phase Gates & Approval Boundaries" section
   - Document 3 gates with checkpoint summary template
   - Clarify: "Approval means explicit user permission before upgrade, not manual execution"

4. **NEW: `docs/RUNTIME-DISCOVERY-PIPELINE.md`** (~80 lines)
   - Document 7-stage pipeline
   - Map to v6 implementation (strict doc expansion + phase 1 discovery)

### Phase 2: Agent Updates (1 hour)

1. **`migration-orchestrator-v6.agent.md`** (~30 lines added)
   - Add "Ask User" section to When to Ask rules (from HARD-RULES.md)
   - Add explicit core-upgrade approval gate
   - Clarify approval ≠ execution
   - Link to new docs

2. **`migration-planner-v6.agent.md`** (~20 lines added)
   - Add "Ambiguity Rule" enforcement
   - Add hard rules reference
   - Link to RUNTIME-DISCOVERY-PIPELINE.md

3. **`migration-executor-v6.agent.md`** (~20 lines added)
   - Add "Ambiguity Rule" enforcement
   - Add hard rules reference
   - Highlight: Validation gates completion (from v2 validator pattern)

### Phase 3: Optional Consolidation (1 hour)

4. **NEW: `docs/DOC-DRIVEN-METHODOLOGY.md`** (~150 lines)
   - Comprehensive guide to "how v6 implements doc-driven migration"
   - Reference: All 3 agents, phase gates, ambiguity rule, hard rules, context preservation
   - Audience: Users trying to understand v6's philosophy

---

## File Impact Summary

### New Files to Create
- `docs/HARD-RULES.md` (~50 lines)
- `docs/RUNTIME-DISCOVERY-PIPELINE.md` (~80 lines)
- `docs/DOC-DRIVEN-METHODOLOGY.md` (~150 lines, optional Phase 3)
- `INDEX.md` updates (add links)

### Files to Update
- `AGENT-RULES.md` (~40 new lines, "When to Ask", "Ambiguity Rule")
- `USAGE.md` (~60 new lines, "Phase Gates & Approval", checkpoint template)
- `migration-orchestrator-v6.agent.md` (~30 new lines, approval gate, hard rules)
- `migration-planner-v6.agent.md` (~20 new lines, ambiguity rule)
- `migration-executor-v6.agent.md` (~20 new lines, ambiguity rule)
- `README.md` – updated claim: "Real-world hardened + V2/V3 Patterns"

### Total Lines
- **New**: ~280 lines (Phase 1 + 2 only) or ~430 lines (with Phase 3 optional)
- **Updated**: ~170 lines across 5 existing files
- **Total Addition**: ~450–600 lines (consolidating v6 real-world fixes + v2/v3 patterns)

---

## V6 Unique Advantages (Preserved)

After borrowing v2/v3 patterns, v6 will still have:

1. **Real-World Hardening** (10 fixes not in v2/v3)
   - Halfway completion blocking
   - MCP misleading results mitigation
   - Prohibited replacements list
   - Phase A inspection validation (no build)
   - Incomplete docs corrections
   - CSS library anti-patterns (6 more)
   - Batch processing prevention
   - Permission mapping documentation

2. **Skip~N Functionality** (not in v2/v3)
   - Mark N tasks done, jump to N+1
   - Useful for reruns, partial restarts

3. **3-Agent Minimal Design** (v2/v3 use 6)
   - Less context loss per agent
   - Fewer handoff points
   - More autonomy per agent

4. **Mandatory Context Preservation** (explicit in v6, implicit in v2/v3)
   - File-read-first enforcement
   - No agent memory from previous invocations

---

## Recommendation

**Implement Phase 1 + Phase 2 NOW**:
- ✅ Add User Interaction Policy (users need to know when to expect questions)
- ✅ Add Explicit Phase Gates (safety boundary before core upgrade)
- ✅ Add Ambiguity Rule (prevents guessing)
- ✅ Add Hard Rules (formalized safety guardrails)
- ✅ Update agents with references

**Consider Phase 3 (Optional)**:
- NEW doc: "Doc-Driven Methodology" – consolidates philosophy, nice-to-have documentation

**Don't Implement**:
- ❌ Separate core-upgrade agent (v6's orchestrator handles this fine)
- ❌ Separate validator agent (v6's executor validation works better with real-world checks)
- ❌ Expand to 6 agents (3 is better for v6's use case)

---

## Result: V6 Will Become

**"Production-Ready Migration System"** with:
- ✅ Real-world hardening (10 fixes)
- ✅ Skip~N for reruns  
- ✅ Minimal 3-agent design
- ✅ Mandatory context preservation
- ✅ **NEW**: Explicit user interaction policy (from v2)
- ✅ **NEW**: Formalized phase gates with approval (from v2)
- ✅ **NEW**: Ambiguity rule (from v2)
- ✅ **NEW**: Hard rules formalized (from v2)
- ✅ **NEW**: Runtime discovery formalized (from v2, v6-adapted)

**Positioning**: "V6 borrows v2/v3's discipline and formality, adds real-world hardening v2/v3 lack, stays minimal (3 agents vs 6)."
