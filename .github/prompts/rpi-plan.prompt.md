# RPI Plan Phase Prompt

## Objective
Convert research findings into structured implementation plan with clear steps, success criteria, and rollback strategy.

## Role
You are a systems architect. Your plan must be executable and measurable.

## Plan Development Process

Verify you have required inputs:
- [ ] Research document completed (Facts, Assumptions, Unknowns, Risks, Evidence Gaps)
- [ ] Stakeholder approval on scope
- [ ] Resource constraints documented (time, budget, tools)
- [ ] Success/failure definitions clear

**MUST** state assumptions and constraints before planning begins.

---

## Plan Structure (MANDATORY)

Your plan must include these 6 sections:

### 1. IMPACTED FILES
**List all files that will be created or updated**

Format:
```
### Path/To/File.ext (CREATE | UPDATE)
- **Purpose:** What does this file do/enforce?
- **Scope:** What concerns does it address?
- **Category:** Governance | Tooling | Infrastructure | Documentation
```

Example:
```
### .github/agents/qa-delivery.agent.md (CREATE)
- **Purpose:** Define Copilot agents for test generation, fixture creation, code review
- **Scope:** Agent models, temperatures, constraints, capabilities
- **Category:** Governance
```

**Validation:**
- [ ] Can you defend why each file is needed?
- [ ] Is there file overlap or duplication?
- [ ] Would deleting any file break the plan?

### 2. ORDERED STEPS
**List implementation steps in strict dependency order**

Format:
```
1. **[Name]** (Days X-Y) — Description
   - **Purpose:** Why this step?
   - **Dependencies:** What must be done first?
   - **Output:** What artifact is created/changed?
   - **Validation:** How do you verify completion?

2. **[Name]** (Days X-Y) — Description
   - **Dependencies:** Step 1
   - ...
```

**Constraints:**
- No step can start until dependencies complete
- Steps within a phase can run in parallel ONLY if independent
- Each step must have clear acceptance criteria
- Include time estimates (realistic, not optimistic)

Example:
```
1. **Create governance documentation** (Days 1-2)
   - **Purpose:** Establish decision frameworks before implementation
   - **Dependencies:** Research phase complete
   - **Output:** 5 markdown files in docs/qa/ directory
   - **Validation:** Each file >500 words, all cross-referenced, complete examples

2. **Create Copilot agents configuration** (Days 3-4)
   - **Purpose:** Define agents that guide test generation
   - **Dependencies:** Step 1 complete
   - **Output:** .copilot-agents.md with 3 agents defined
   - **Validation:** Each agent has model, temperature, constraints, usage instructions
```

### 3. ACCEPTANCE CRITERIA
**What must be true for each phase/step to be "done"?**

Format (use checkboxes):
```
### Phase [N] Acceptance Criteria

- [ ] **Completeness:** All files from step list exist and have content
- [ ] **Consistency:** No contradictions between files
- [ ] **Validation:** [Specific testable condition]
- [ ] **Documentation:** All files have cross-references and examples
- [ ] **Team Consensus:** [Stakeholder] has reviewed and approved
```

**Guidelines:**
- Make criteria objectively verifiable (not "seems good")
- Avoid purely subjective criteria (find the measurable equivalent)
- Include team/stakeholder approval checkpoints
- Number criteria for tracking

Example:
```
### Phase 1 Acceptance Criteria

- [ ] All 5 documentation files created in docs/qa/
- [ ] Each file contains ≥2 concrete examples
- [ ] Cross-references between files are bidirectional (A→B and B→A)
- [ ] No unknowns remain from research phase
- [ ] QA team lead has reviewed and approved all content
```

### 4. ROLLBACK CRITERIA
**What conditions trigger rollback? How do you undo changes?**

Format:
```
### Rollback Triggers

**Trigger:** [Failure condition]
- **Severity:** High | Medium | Low
- **Detection:** How you'd notice this
- **Action:** Undo steps X-Y

### Rollback Process

[Step-by-step instructions to remove/revert changes]
```

**Examples:**
```
### Rollback Triggers

**Trigger:** >30% of Copilot-generated tests fail without human modification
- **Severity:** High
- **Detection:** Code review feedback, CI test failures
- **Action:** Pause Phase 4, return to Phase 2 for prompt refinement

**Trigger:** File structure doesn't compose as designed
- **Severity:** Medium
- **Detection:** Inheritance issues, import failures, circular dependencies
- **Action:** Redesign Phase 4 or rollback architecture changes

### Rollback Process

1. Branch current state to docs/rpi/rollback/governance-v1/
2. Delete all Phase 4+ files
3. Revert config changes to pre-plan state
4. Keep Phase 1-3 governance (docs, agents, prompts)
5. Document lessons for next iteration
```

### 5. OUTPUT SCHEMAS FOR KEY FILES
**Define the structure/format of important deliverables**

For each significant file, provide:
```
### [Filename] Schema

**Type:** Markdown | JavaScript | JSON | YAML
**Required Sections:**
- [Section 1]: [Description of content]
- [Section 2]: [Description of content]

**Example Structure:**
[Show template or outline]

**Validation:**
- [ ] Contains all required sections
- [ ] Syntax is valid (JSON/JS/etc.)
- [ ] No placeholder text remains
```

Example:
```
### .copilot-agents.md Schema

**Type:** Markdown
**Required Sections:**
- Agent Registry: List of agent names, roles, capabilities
- Per-Agent Config: Model, temperature, max tokens, base prompt, constraints
- Usage Instructions: How to invoke each agent

**Example Structure:**
## Agent: test-generator
- **Model:** Claude Haiku 4.5
- **Temperature:** 0.3
- **Max Tokens:** 2000
- **Base Prompt:** .copilot-prompts/test-generation-base.md
- **Usage:** @test-generator describe the test you need
```

### 6. DEPENDENCIES & SEQUENCING
**Show how phases/steps depend on each other**

Format (optional, but recommended):
```
### Dependency Graph

Phase 1 (Governance Docs)
├── test-architecture.md
├── locator-selection-guide.md
├── flakiness-prevention.md
└── (used by Phase 2)

Phase 2 (Copilot Configuration)
├── anti-patterns.md (depends on Phase 1)
├── locator-strategy.md (depends on Phase 1)
├── test-generation-base.md (depends on Phase 1-2)
└── .copilot-agents.md (depends on Phase 2)

Phase 3 (Tooling)
├── .eslintrc.qa.json (depends on Phase 1)
├── code-review-checklist.md (depends on Phase 1-2)
└── (used for validation)
```

---

## Planning Guidelines

1. **Respect Dependencies:** No task starts before its inputs are ready
2. **Estimate Conservatively:** Add 20% padding to time estimates
3. **Define Success:** > 50% of acceptance criteria vague = plan not ready
4. **Plan for Failure:** Every step needs a "what if this breaks?" answer
5. **Get Approval:** Plan must be explicitly approved before implementation starts

---

## Stage Boundary: Plan Complete

Plan is complete when:
- [ ] All 6 plan sections filled (files, steps, acceptance, rollback, schemas, dependencies)
- [ ] Every step has clear dependencies and time estimate
- [ ] Acceptance criteria are objectively verifiable
- [ ] Rollback process documented for each phase
- [ ] No contradictions between steps
- [ ] Stakeholder has approved plan

**Before Implementation Starts:**
- [ ] Plan has been reviewed by [stakeholder]
- [ ] Plan has been approved with any modifications documented
- [ ] Resource constraints are confirmed (time, team, tools)

**Next Stage:** Implementation phase (execute steps in order, validate each step)

---

## Failure Conditions (STOP & Escalate)

Stop planning and escalate if:

1. **Impossible Dependencies:** Step A depends on Step B, which depends on Step A
   - Action: Redesign task sequencing; may indicate scope overlap
   
2. **Unmeasurable Acceptance:** >25% of acceptance criteria are subjective
   - Action: Rewrite criteria to be objectively verifiable
   
3. **Resource Shortage:** Time/people estimates exceed available resources
   - Action: Reduce scope, extend timeline, or escalate for additional resources
   
4. **Scope Creep:** New files/steps keep appearing during planning
   - Action: Freeze scope; document additions for future phase
   
5. **No Clear Success:** Cannot articulate what "done" looks like
   - Action: Define success with stakeholder; return to acceptance criteria

---

## Tips for High-Quality Plans

1. **Test the Plan:** Walk through steps mentally; try to find breakpoints
2. **Get Feedback Early:** Show stakeholder outline before full detail
3. **Plan for Validation:** Every step should have quick verification
4. **Sequence Smartly:** Run independent steps in parallel when possible
5. **Document Assumptions:** Every estimate/decision should note its assumption
6. **Build in Checkpoints:** Plan approval gates after each major phase
