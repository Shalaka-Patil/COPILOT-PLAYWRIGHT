# Plan: Repository-Level Copilot Governance for QA Delivery

**Based on:** Research phase findings in `docs/rpi/research/copilot-governance-qa.md`

**Objective:** Establish document-driven governance framework + tooling to enable high-quality Copilot-assisted test development at scale

---

## IMPACTED FILES

### 1. **Copilot Agent & Prompt Configuration**

#### `.copilot-agents.md` (NEW)
- **Purpose:** Define specialized Copilot agents for test generation workflows
- **Scope:** Agent names, capabilities, prompt routing, context requirements
- **Enforces:** Test generation governance, consistent agent behavior
- **Output:** Agent registry with model versions, temperature settings, token limits

#### `.copilot-prompts/test-generation-base.md` (NEW)
- **Purpose:** Base prompt template for Copilot test generation
- **Scope:** Test structure boilerplate, anti-pattern guardrails, assertion patterns
- **Enforces:** Playwright best practices, naming conventions, isolation rules
- **Output:** Role-based prompt with instructions, test scaffolds, examples

#### `.copilot-prompts/locator-strategy.md` (NEW)
- **Purpose:** Locator selection hierarchy and fallback logic
- **Scope:** Primary (getByRole/Label), secondary (data-testid), tertiary (CSS)
- **Enforces:** Accessibility-first locators, resilience to UI changes
- **Output:** Decision tree, selector examples, anti-patterns

#### `.copilot-prompts/anti-patterns.md` (NEW)
- **Purpose:** Explicit list of test anti-patterns to avoid
- **Scope:** Flakiness sources, security issues, maintenance risks
- **Enforces:** Quality standards through negative examples
- **Output:** Categorized anti-patterns with explanations and fixes

---

### 2. **Test Architecture & Patterns Documentation**

#### `docs/qa/test-architecture.md` (NEW)
- **Purpose:** Repository-wide test code architecture standards
- **Scope:** Page Object Model (POM), fixture organization, shared utilities structure
- **Enforces:** Consistency of test organization, maintainability, code reuse
- **Output:** Architecture diagrams, implementation examples, trade-off justifications

#### `docs/qa/test-naming-conventions.md` (NEW)
- **Purpose:** Test naming standards and semantic rules
- **Scope:** Test file naming, test case naming, describe() block semantics
- **Enforces:** Self-documenting tests, discoverability
- **Output:** Naming patterns, examples, regex validators

#### `docs/qa/locator-selection-guide.md` (NEW)
- **Purpose:** Practical guide to locator selection with decision logic
- **Scope:** When to use each locator type, accessibility implications, brittleness factors
- **Enforces:** Accessible, maintainable selectors
- **Output:** Priority matrix, decision flowchart, CSS selector guardrails

#### `docs/qa/fixture-patterns.md` (NEW)
- **Purpose:** Shared fixture design and lifecycle patterns
- **Scope:** Authentication, page setup, test data, cleanup, composability
- **Enforces:** Test isolation, reusability, performance
- **Output:** Fixture implementation examples, composition patterns

#### `docs/qa/flakiness-prevention.md` (NEW)
- **Purpose:** Strategies for identifying and preventing flaky tests
- **Scope:** Timeout policies, implicit vs explicit waits, retry behavior, environment variance
- **Enforces:** Test reliability, CI predictability
- **Output:** Policy document, per-test timeout override patterns, debug checklist

---

### 3. **Code Quality & Linting**

#### `.eslintrc.qa.json` (NEW)
- **Purpose:** ESLint configuration specific to test code
- **Scope:** Test naming rules, forbidden patterns, async/await validation
- **Enforces:** Consistent code style, mistake prevention
- **Output:** Linting rules with warnings/errors, max-complexity thresholds

#### `docs/qa/code-review-checklist.md` (NEW)
- **Purpose:** Manual code review checklist for Copilot-generated tests
- **Scope:** Quality gates, anti-patterns to catch, Copilot-specific issues
- **Enforces:** Human validation layer for AI-generated code
- **Output:** Checklist items with risk levels, examples

---

### 4. **Test Infrastructure & Utilities**

#### `tests/fixtures/auth.fixture.js` (NEW)
- **Purpose:** Shared authentication fixture for test suite
- **Scope:** Login flow, session management, cleanup
- **Enforces:** Consistent authentication across tests
- **Output:** Fixture export, usage examples

#### `tests/fixtures/index.js` (NEW)
- **Purpose:** Centralized fixture exports and composition
- **Scope:** Re-export all fixtures, combined fixture definitions
- **Enforces:** Single import point, discoverability
- **Output:** Named exports of all fixtures

#### `tests/utils/page-objects/BasePage.js` (NEW)
- **Purpose:** Base Page Object class for all tests
- **Scope:** Common element interactions, error handling, logging
- **Enforces:** Code reuse, consistent error messages
- **Output:** Class definition with methods

#### `tests/utils/test-data/index.js` (NEW)
- **Purpose:** Test data factory functions
- **Scope:** User objects, test scenarios, cleanup helpers
- **Enforces:** Testable, reusable test data
- **Output:** Factory functions, data schemas

#### `tests/utils/assertions/custom-assertions.js` (NEW)
- **Purpose:** Custom assertion helpers tailored to application
- **Scope:** Business logic assertions, common validations
- **Enforces:** Readability, DRY assertion code
- **Output:** Helper functions

---

### 5. **Configuration Updates**

#### `playwright.config.js` (UPDATE)
- **Changes:**
  - Uncomment/configure `baseURL` with placeholder guidance
  - Add `expect.timeout` configuration option
  - Add per-project timeout overrides (chromiun, firefox, webkit)
  - Comment improvements linking to governance docs
- **Purpose:** Enable test-specific timeout configuration, document patterns

#### `.github/copilot-instructions.md` (UPDATE)
- **Changes:**
  - Add QA-specific section referencing new governance files
  - Link to `.copilot-agents.md`, `.copilot-prompts/`
  - Add test generation workflow
  - Link to code review checklist
- **Purpose:** Copilot awareness of governance framework

#### `README.md` (UPDATE)
- **Changes:**
  - Add "Test Architecture" section linking to docs/qa/
  - Add "Copilot Governance" section
  - Add "Anti-Patterns" section
  - Update with test data factory, fixtures, locator information
- **Purpose:** Developer discoverability of governance

---

### 6. **CI/CD & Observability** (OPTIONAL SCOPE)

#### `.github/workflows/test.yml` (NEW - OPTIONAL)
- **Purpose:** GitHub Actions workflow for automated test execution
- **Scope:** Trigger rules, parallel matrix, failure notifications
- **Note:** Marked OPTIONAL; depends on CI/CD readiness

#### `docs/qa/failure-analysis-guide.md` (NEW - OPTIONAL)
- **Purpose:** Root cause analysis process for test failures
- **Scope:** Debugging steps, log interpretation, flakiness diagnosis
- **Note:** Marked OPTIONAL; can be implemented after observability tooling chosen

---

## ORDERED IMPLEMENTATION STEPS

### Phase 1: Governance Documentation (Days 1-2)
**Goal:** Establish decision frameworks and architecture standards

1. **Create `docs/qa/` directory structure**
   - Foundation for all QA documentation
   - Organized by concern (architecture, patterns, quality, etc.)

2. **Write `docs/qa/test-architecture.md`**
   - Define POM structure, fixture composition, utility organization
   - Establishes mental model for all subsequent decisions
   - Dependencies: None
   - Output: Architecture diagrams, file structure, implementation examples

3. **Write `docs/qa/locator-selection-guide.md`**
   - Define locator hierarchy (getByRole → getByLabel → getByTestId → CSS)
   - Addresses risk #7 (no fallback strategy)
   - Dependencies: None
   - Output: Decision tree, examples, CSS guardrails

4. **Write `docs/qa/flakiness-prevention.md`**
   - Define timeout policies, retry overrides, wait patterns
   - Addresses risks #1-4 (flakiness, environment variance)
   - Dependencies: None
   - Output: Policy document, timeout matrix, debugging checklist

5. **Write `docs/qa/test-naming-conventions.md`**
   - Define test file naming, test case naming, describe semantics
   - Addresses maintainability, discoverability
   - Dependencies: None
   - Output: Pattern definitions, examples, regex validators

6. **Write `docs/qa/fixture-patterns.md`**
   - Define fixture lifecycle, composition patterns, reusability
   - Supports Phase 3 fixture implementation
   - Dependencies: test-architecture.md
   - Output: Fixture patterns, lifecycle diagrams, composition rules

---

### Phase 2: Copilot Governance Files (Days 3-4)
**Goal:** Create specialized prompts and agent configurations for test generation

7. **Create `.copilot-prompts/` directory**
   - Central location for prompt templates
   - Organize by concern (base, locators, anti-patterns)

8. **Write `.copilot-prompts/anti-patterns.md`**
   - Enumerate test anti-patterns (hard waits, shared state, brittle selectors, etc.)
   - Provide guardrails for Copilot generation
   - Dependencies: Phase 1 docs (references architecture, locators, flakiness prevention)
   - Output: Categorized anti-pattern list with explanations

9. **Write `.copilot-prompts/locator-strategy.md`**
   - Embedding of locator hierarchy, selection logic, CSS guardrails
   - Keeps prompts DRY by referencing docs/qa/locator-selection-guide.md
   - Dependencies: docs/qa/locator-selection-guide.md
   - Output: Condensed prompt with decision logic, examples

10. **Write `.copilot-prompts/test-generation-base.md`**
    - Base template for all test generation requests
    - Includes imports, test structure, assertion patterns, isolation rules
    - Dependencies: All Phase 1 docs, anti-patterns.md, locator-strategy.md
    - Output: Prompt template with placeholders, anti-pattern list, examples

11. **Write `.copilot-agents.md`**
    - Define agents: `test-generator`, `fixture-creator`, `code-reviewer`
    - Specify models, roles, capability boundaries
    - Dependencies: All prompts defined
    - Output: Agent registry with persona, prompt references, usage instructions

---

### Phase 3: Code Quality & Tooling (Days 5-6)
**Goal:** Establish linting and code review standards

12. **Create `.eslintrc.qa.json`**
    - Rules for test-specific patterns: test naming, async expectations, fixture usage
    - Enable rule: forbid `test.only`, `test.skip` in CI
    - Dependencies: docs/qa/test-naming-conventions.md
    - Output: ESLint config file with comments referencing docs

13. **Write `docs/qa/code-review-checklist.md`**
    - Manual checklist for reviewing Copilot-generated tests
    - Focus on: flakiness risks, anti-patterns, security, accessibility
    - Dependencies: All Phase 1 docs
    - Output: Comprehensive checklist organized by risk category

14. **Update `.github/copilot-instructions.md`**
    - Add QA governance section
    - Link to agents, prompts, code review checklist
    - Add test generation workflow
    - Dependencies: All governance files
    - Output: Updated instructions file with navigation

---

### Phase 4: Test Infrastructure Utilities (Days 7-8)
**Goal:** Create reusable fixtures, utilities, and patterns

15. **Create `tests/fixtures/auth.fixture.js`**
    - Implement authentication fixture
    - Dependencies: docs/qa/fixture-patterns.md
    - Output: Named export of auth fixture with setup/cleanup

16. **Create `tests/fixtures/index.js`**
    - Export all fixtures (start with auth, placeholder for others)
    - Dependencies: auth.fixture.js
    - Output: Centralized fixture exports

17. **Create `tests/utils/page-objects/BasePage.js`**
    - Implement base page object class
    - Common methods: navigation, element interaction, logging
    - Dependencies: docs/qa/test-architecture.md
    - Output: Class with methods, documentation

18. **Create `tests/utils/test-data/index.js`**
    - Test data factory functions
    - Placeholder structures for user, product, test scenarios
    - Dependencies: docs/qa/test-architecture.md
    - Output: Factory functions with schemas

19. **Create `tests/utils/assertions/custom-assertions.js`**
    - Custom assertion helpers
    - Placeholder for business logic assertions
    - Dependencies: docs/qa/test-architecture.md
    - Output: Helper functions with JSDoc

---

### Phase 5: Configuration & Documentation Updates (Days 9-10)
**Goal:** Update existing configs to enforce governance, update project README

20. **Update `playwright.config.js`**
    - Uncomment baseURL with placeholder guidance
    - Add expect.timeout configuration option
    - Add per-project timeout overrides
    - Add comments linking to governance docs
    - Dependencies: docs/qa/flakiness-prevention.md
    - Output: Updated config file with governance references

21. **Update `README.md`**
    - Add "Test Architecture" section (link to docs/qa/)
    - Add "Copilot Governance" section (link to .copilot-agents.md)
    - Add quick link to anti-patterns.md
    - Add link to code review checklist
    - Dependencies: All governance files
    - Output: Updated README with navigation

---

## OUTPUT SCHEMAS FOR PROMPT FILES

### `.copilot-prompts/anti-patterns.md` Schema
```
## Anti-Patterns (By Category)

### Flakiness / Reliability
- [Anti-pattern Name]
  - Problem: Why this fails
  - Example: Code that demonstrates the issue
  - Corrected: Proper approach
  - Reference: docs/qa/flakiness-prevention.md

### Selector Brittleness
- [Anti-pattern Name]
  - Problem: Why locator fails
  - Example: Failing selector
  - Corrected: Resilient approach
  - Reference: docs/qa/locator-selection-guide.md

### Test Isolation / Data Management
- [Anti-pattern Name]
  - Problem: How tests leak state
  - Example: Problematic fixture usage
  - Corrected: Isolated pattern
  - Reference: docs/qa/fixture-patterns.md

### Security / Privacy
- [Anti-pattern Name]
  - Problem: Vulnerability
  - Example: Exposed credential
  - Corrected: Secure pattern
  - Reference: (organization standard)

### Performance
- [Anti-pattern Name]
  - Problem: Why test is slow
  - Example: Inefficient code
  - Corrected: Optimized approach
  - Reference: docs/qa/test-architecture.md
```

### `.copilot-prompts/locator-strategy.md` Schema
```
## Locator Selection Strategy

### Priority Hierarchy (Use in order)

1. **getByRole()** - Accessibility first
   - When: ARIA role available, element type clear
   - Example: getByRole('button', { name: /submit/i })
   - Why: Tests against semantic HTML
   - ShadowDOM: Supported

2. **getByLabel()** - Form labeling
   - When: Form input with associated label
   - Example: getByLabel('Email Address')
   - Why: Tests practical user interaction
   - ShadowDOM: Limited

3. **getByTestId()** - Test-specific marker
   - When: No semantic role/label available
   - Example: getByTestId('product-price-display')
   - Why: Decouples tests from styling/text
   - ShadowDOM: Unsupported

4. **locator() CSS** - Last resort
   - When: No other option viable
   - Example: locator('div[data-id="widget"]')
   - Why: Most brittle, easy to break on refactor
   - ShadowDOM: Limited

### Fallback Examples
- getByRole() fails? → Try getByLabel() → Try getByTestId() → Escalate

### CSS Guardrails
- Never: nth-child, nth-of-type (brittle)
- Prefer: data-* attributes over class selectors
- Avoid: Multiple class selectors
- Max depth: 3 levels

### iFrame & ShadowDOM
- iFrame: Use page.frameLocator() → locator()
- ShadowDOM: Use pierce CSS combinator only if necessary
- Escalate for guidance if both present
```

### `.copilot-prompts/test-generation-base.md` Schema
```
# Test Generation Prompt Template

## Role
You are a Playwright test generation assistant ensuring test quality, reliability, and maintainability.

## Instructions

### Structure
1. **Imports** (Always at top)
   - const { test, expect } = require('@playwright/test');
   - Import fixtures from tests/fixtures/index.js
   - Import utilities from tests/utils/

2. **Test Naming**
   - File: `[feature].spec.js` (kebab-case, descriptive)
   - Test: test('should [action] resulting in [state]', async ({ page }) => {
   - Describe: Use describe() for feature grouping

3. **Structure Pattern (Arrange-Act-Assert)**
   - Arrange: Setup fixtures, navigate, initialize state
   - Act: Perform user action(s)
   - Assert: Verify single outcome

4. **Assertions**
   - Use custom assertions from tests/utils/assertions/
   - One primary assertion per test
   - Awaited assertions: await expect(...).toBe(...)

5. **Locators**
   - Follow hierarchy: getByRole → getByLabel → getByTestId → CSS
   - See: docs/qa/locator-selection-guide.md
   - Fallback: If primary locator unavailable, document why
   - No page.evaluate() unless unavoidable

### Must-Avoid Patterns
See docs/qa/anti-patterns.md for complete list. Common ones:
- No fixed waits: ❌ page.waitForTimeout(1000) → ✅ page.getByRole(...).waitFor()
- No shared state: Tests must be runnable in any order
- No external deps: Don't rely on previous test results
- No sensitive data: No hardcoded passwords, tokens, emails
- No .only or .skip in production code

### Isolation Rules
- Each test must be independent (no shared fixtures)
- Use cleanup patterns for test data
- References: tests/fixtures/auth.fixture.js, tests/utils/test-data/

### Performance
- Target: < 30 seconds per test
- Avoid: Unnecessary waits, re-navigations, redundant assertions
- Reuse: Page objects (BasePage) for common flows

## Example Test
[Provide application-specific skeleton test]

## Output Requirements
- Return complete test file (top to bottom)
- Include all necessary imports
- Add comments for complex logic
- Include cleanup in fixtures or test.afterEach()
```

### `.copilot-agents.md` Schema
```
# Copilot Agents for QA

## Agent: test-generator
- **Model:** [Claude Haiku 4.5 / or specified version]
- **Temperature:** 0.3 (low creativity, consistent output)
- **Max Tokens:** 2000
- **Context:** @playwright/test, @organization standards
- **Base Prompt:** `.copilot-prompts/test-generation-base.md`
- **Constraints:**
  - No test.only or test.skip
  - Must follow naming conventions from docs/qa/test-naming-conventions.md
  - Must avoid anti-patterns (validate against .copilot-prompts/anti-patterns.md)
- **Usage:** @test-generator describe the test you need

## Agent: fixture-creator
- **Model:** [Claude Haiku 4.5 / or specified version]
- **Temperature:** 0.2 (deterministic)
- **Max Tokens:** 1500
- **Context:** tests/fixtures/*, tests/utils/*, docs/qa/fixture-patterns.md
- **Base Prompt:** `.copilot-prompts/fixture-patterns-prompt.md`
- **Constraints:**
  - Must implement cleanup/teardown
  - Must follow composition pattern
  - Must export via tests/fixtures/index.js
- **Usage:** @fixture-creator create a fixture for [scenario]

## Agent: code-reviewer
- **Model:** [Claude Haiku 4.5 / or specified version]
- **Temperature:** 0.1 (objective analysis)
- **Max Tokens:** 1000
- **Context:** docs/qa/code-review-checklist.md
- **Constraints:**
  - Reference checklist for assessment
  - Flag anti-patterns, security issues, flakiness risks
  - Provide specific remediation with code examples
- **Usage:** @code-reviewer review this test for quality
```

---

## ACCEPTANCE CRITERIA

### Phase 1 Completion: Governance Documentation
- [ ] All Phase 1 docs created and linked in README
- [ ] Each doc contains:
  - Clear purpose statement
  - Concrete examples (at least 2 per doc)
  - Links to related docs (cross-referencing)
  - Decision rationale
- [ ] Test architect can use docs to answer:
  - "How should I structure a test file?"
  - "How should I select locators?"
  - "How do I prevent flaky tests?"
  - "How should I name my test?"

### Phase 2 Completion: Copilot Governance
- [ ] All `.copilot-prompts/` files created and syntactically valid
- [ ] `.copilot-agents.md` defines 3 agents with:
  - Model/temperature/token settings
  - Base prompt references
  - Constraint list
  - Usage instructions
- [ ] Copilot can interpret each prompt without ambiguity
- [ ] Each prompt file contains zero code (documentation only)

### Phase 3 Completion: Code Quality
- [ ] `.eslintrc.qa.json` created with:
  - Test naming rules enabled
  - `test.only`/`test.skip` forbidden in CI
  - max-complexity threshold
  - At least 5 QA-specific rules
- [ ] `docs/qa/code-review-checklist.md` contains:
  - 15+ checklist items organized by risk category
  - At least 1 example per category
  - Links to docs for remediation

### Phase 4 Completion: Infrastructure
- [ ] All 5 files created in `tests/fixtures/` and `tests/utils/`:
  - auth.fixture.js exports fixture function
  - fixtures/index.js has centralized exports
  - BasePage.js implements 3+ methods
  - test-data/index.js has 2+ factory functions
  - assertions/ exports 2+ helper functions
- [ ] All files have JSDoc comments
- [ ] No executable test code (structure only)

### Phase 5 Completion: Configuration Updates
- [ ] `playwright.config.js` updated with:
  - Uncommented baseURL option with guidance
  - expect.timeout configuration
  - Per-project timeout overrides
  - 3+ comments linking to docs/qa/
- [ ] `.github/copilot-instructions.md` updated with:
  - "QA Governance" section
  - Links to `.copilot-agents.md`, `.copilot-prompts/`
  - Link to code-review-checklist.md
- [ ] `README.md` updated with:
  - "Test Architecture" section linking to docs/qa/
  - "Copilot Governance" section
  - "Anti-Patterns" quick link

### Overall Governance Readiness
- [ ] Copilot can be instructed to generate tests following governance
- [ ] Human reviewer can validate tests against checklist in <5 minutes
- [ ] New developer can implement test correctly using docs + prompts
- [ ] Architecture supports 100+ tests without brittleness or flakiness

---

## ROLLBACK CRITERIA

### Rollback Triggers (If met, unwind changes)

1. **Governance Vagueness:**
   - If any governance doc creates ambiguity (2+ valid interpretations)
   - If Copilot-generated tests fail review >30% of time
   - Action: Return to Phase 1, clarify docs

2. **Infeasible Architecture:**
   - If fixture patterns don't compose as designed
   - If BasePage pattern doesn't reduce duplication
   - If test data factories create flakiness
   - Action: Phase 4 redesign or rollback

3. **Tooling Incompatibility:**
   - If ESLint rules conflict with Playwright v1.44.0
   - If Copilot agents can't be configured as specified
   - Action: Phase 3 adjustment or rollback

4. **Scalability Issues:**
   - If >10% of Copilot-generated tests fail without human edit
   - If tests with governance take >2x longer to implement
   - If anti-patterns emerge not covered by docs
   - Action: Phase 1-2 iteration or rollback

### Rollback Process

**If rollback triggered before Phase 3:**
1. Delete `.copilot-prompts/` directory
2. Delete `docs/qa/` directory (backup to docs/rpi/rollback/)
3. Revert `.github/copilot-instructions.md` to original
4. Revert `README.md` to original
5. Retain `RPI_STAGE_CONTRACTS.md` (already in place)

**If rollback triggered after Phase 3:**
1. Delete all Phase 4+ artifacts
2. Revert Phase 5 updates
3. Restore config files to previous version
4. Keep Phase 1-3 governance (docs, ESLint, checklists)

**If rollback triggered after Phase 5:**
1. Branch off current state to `docs/rpi/rollback/governance-v1/`
2. Delete all new files
3. Revert config updates
4. Documented findings for next iteration

---

## DEPENDENCIES & SEQUENCING

```
Phase 1 (Days 1-2) - Governance Docs
├── test-architecture.md
├── locator-selection-guide.md
├── flakiness-prevention.md
├── test-naming-conventions.md
└── fixture-patterns.md

Phase 2 (Days 3-4) - Copilot Governance
├── anti-patterns.md (depends on Phase 1)
├── locator-strategy.md (depends on locator-selection-guide.md)
├── test-generation-base.md (depends on all Phase 1)
└── .copilot-agents.md (depends on all prompts)

Phase 3 (Days 5-6) - Tooling
├── .eslintrc.qa.json (depends on test-naming-conventions.md)
├── code-review-checklist.md (depends on Phase 1 + Phase 2)
└── UPDATE .github/copilot-instructions.md (depends on Phase 2)

Phase 4 (Days 7-8) - Infrastructure
├── tests/fixtures/auth.fixture.js (depends on fixture-patterns.md)
├── tests/fixtures/index.js (depends on auth.fixture.js)
├── tests/utils/page-objects/BasePage.js (depends on test-architecture.md)
├── tests/utils/test-data/index.js (depends on test-architecture.md)
└── tests/utils/assertions/custom-assertions.js (depends on test-architecture.md)

Phase 5 (Days 9-10) - Configuration Updates
├── UPDATE playwright.config.js (depends on flakiness-prevention.md)
├── UPDATE .github/copilot-instructions.md (depends on Phase 2)
└── UPDATE README.md (depends on all governance files)
```

