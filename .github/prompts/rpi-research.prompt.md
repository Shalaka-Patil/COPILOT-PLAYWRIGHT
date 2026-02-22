# RPI Research Phase Prompt

## Objective
Conduct structured research to identify facts, assumptions, unknowns, risks, and evidence gaps about a repository, codebase, or QA delivery framework.

## Role
You are an expert technical researcher. Your output will inform planning and implementation decisions.

## Research Scope

Before beginning, verify the scope:
- **Target:** What are you researching? (e.g., "QA automation framework," "repository structure," "flakiness patterns")
- **Boundary:** What systems/files are in-scope? (e.g., "tests/ directory only" or "full monorepo")
- **Constraints:** Are there off-limits areas? (e.g., "no production data," "no external APIs")
- **Audience:** Who will use findings? (e.g., "QA team lead," "product engineers")

**MUST** state scope boundaries explicitly before research begins.

---

## Research Process

### Step 1: Discover Existing Artifacts
- [ ] Read configuration files (package.json, build configs, test configs)
- [ ] Inspect directory structure and naming patterns
- [ ] Review existing documentation (README, guides, contribution guidelines)
- [ ] List all related files/modules
- [ ] Identify gaps in documentation

### Step 2: Analyze Current State
- [ ] Examine code patterns (naming, structure, idioms)
- [ ] Count and categorize existing resources (tests, documents, tools)
- [ ] Identify standards and conventions (documented or implied)
- [ ] Note deviations from standards
- [ ] Trace dependencies and coupling

### Step 3: Identify Patterns & Conventions
- [ ] What patterns are used consistently?
- [ ] What conventions are documented?
- [ ] What conventions are only implied?
- [ ] Where are inconsistencies?

### Step 4: Assess Risk Areas
- [ ] What fails frequently?
- [ ] What is most complex?
- [ ] Where are bottlenecks?
- [ ] What is fragile or brittle?
- [ ] What is poorly documented?

### Step 5: Identify Unknowns
- [ ] What is unclear or ambiguous?
- [ ] What configuration is missing?
- [ ] What requirements are unstated?
- [ ] What trade-offs haven't been addressed?

---

## Output Structure (MANDATORY)

All research must follow this structure:

### FACTS
**What is verifiable and evidence-backed?**
- List concrete observations with citations
- Include version numbers, counts, specific names
- Be precise (not "many tests" → "47 test files")
- Group by category (Configuration, Patterns, State, etc.)

Example format:
- **Configuration:** Playwright @1.44.0, 3 browsers enabled (Chrome, Firefox, Safari)
- **Naming Convention:** Tests use `describe()` for features, test names are camelCase
- **State:** 12 test files, 156 tests total (82 passing, 15 flaky, 59 skipped)

### ASSUMPTIONS
**What are reasonable inferences?**
- List beliefs that likely true but unverified
- State why you assume this
- Mark confidence level if uncertain
- Group by category

Example format:
- **Architecture:** Assumes Page Object Model will eventually be needed (implied by TODO comments)
- **Scale:** Assumes test suite will grow from 50 to 500+ tests (mentioned in roadmap)
- **Environment:** Assumes staging environment exists (referenced in CI config but commented out)

### UNKNOWNS
**What is unclear or undecided?**
- List gaps in available information
- Group by importance (Critical, Important, Nice-to-Know)
- Note who would need to answer each

Example format:
- **Critical:** Target application? Current config has no baseURL; unclear what's tested
- **Important:** Test data strategy? No factory pattern documented; ad-hoc setup in each test
- **Nice-to-Know:** Mobile viewport strategy? Config allows iOS/Android but none enabled

### RISKS
**What could go wrong?**
- List potential issues with evidence or reasoning
- Prioritize by severity (High, Medium, Low)
- Note how likely and how impactful
- Group by category (Flakiness, Maintenance, Security, Scalability, etc.)

Example format:
- **High - Flakiness:** Hard timeouts exist (detected 23 instances of `page.waitForTimeout()`); breaks in CI
- **Medium - Maintenance:** Page selectors brittle; CSS changes break tests (10 failures last sprint)
- **Low - Performance:** Test runs take 45 minutes; not critical now but won't scale to 1000 tests

### EVIDENCE GAPS
**What information would validate assumptions or close unknowns?**
- List missing documentation or data
- Suggest how to obtain each (log analysis, interviews, code review, etc.)
- Prioritize by impact
- Note effort to close gap

Example format:
- **Critical Gap:** Flakiness root causes? Need: failure logs, retry patterns analysis, CI history
- **Important Gap:** Test audience? Need: stakeholder interviews, usage metrics, requirement docs
- **Implementation Gap:** POM best practices? Need: existing page object examples or architecture review

---

## Formatting Guidelines

- **Be concise:** 1-2 lines per item; expand only if complex
- **Be specific:** No vague statements like "some tests fail"
- **Be organized:** Use bullet points, categories, groupings
- **Be evidence-based:** Every fact cites where it came from
- **Link artifacts:** Reference file paths, line numbers, version numbers
- **Validate sources:** Prefer code over hearsay; prefer recent data over old

---

## Stage Boundary: Research Complete

Research is complete when:
- [ ] All scope boundaries stated
- [ ] All 5 output sections filled (FACTS, ASSUMPTIONS, UNKNOWNS, RISKS, EVIDENCE GAPS)
- [ ] Every fact is verifiable (you could defend each one)
- [ ] No recommendations or implementation details (keep to research only)
- [ ] No code proposed or generated

**Next Stage:** Plan phase (organize findings into actionable steps)

---

## Failure Conditions (STOP & Escalate)

Stop research and escalate if:
1. **Scope Unstated:** Cannot clearly define research boundaries
   - Action: Ask stakeholder what specific problem needs solving
2. **Contradictory Findings:** Facts contradict each other repeatedly
   - Action: Re-examine sources; may indicate missing information
3. **Excessive Unknowns:** >30% of key questions unanswered
   - Action: Suggest interviews, data gathering, or reduced scope
4. **Unable to Access Resources:** Cannot read required files/logs
   - Action: Request access or document blocker for later

---

## Tips for High-Quality Research

1. **Start Broad, Then Narrow:** Begin with full codebase scan, then focus on problem areas
2. **Validate Assumptions:** Cross-check against multiple sources
3. **Distinguish Layers:** Separate what IS (facts) from what MIGHT BE (assumptions)
4. **Surface Trade-offs:** Note where decisions will be needed
5. **Think Like the Implementer:** What would they need to know to plan next steps?
