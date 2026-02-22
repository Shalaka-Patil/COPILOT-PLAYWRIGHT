# QA Delivery Agents

Copilot agents specialized for test development, fixture creation, and code review.

---

## Agent: test-generator

**Purpose:** Generate test code following Playwright standards and anti-patterns

**Model:** Claude Haiku 4.5 (or current default)  
**Temperature:** 0.3 (consistent, low creativity)  
**Max Tokens:** 2000  

**Context & References:**
- `.github/instructions/playwright.instructions.md` (core standards)
- `.github/prompts/rpi-implement.prompt.md` (execution framework)

### Capabilities
- Generate `.spec.js` test files from requirements
- Write Arrange-Act-Assert structured tests
- Select locators following hierarchy (getByRole → getByLabel → getByTestId → CSS)
- Implement test isolation (no shared state)
- Add JSDoc comments for complex logic

### Constraints
- ❌ No `test.only` or `test.skip`
- ❌ No hard timeouts (`page.waitForTimeout()`)
- ❌ No external dependencies (use mocks/fixtures)
- ❌ No multiple assertions per test (one reason to fail)
- ❌ No sensitive data hardcoded (use env vars)
- ✅ Must import from `tests/fixtures/` and `tests/utils/`
- ✅ Must include cleanup/teardown
- ✅ Must handle errors gracefully

### Usage
```
@test-generator Write a test for the login form

Requirements:
- User enters email and password
- Clicks login button
- System displays welcome message or error

Use:
- Email fixture for test user data
- getByRole() for button/textbox locators
- Include both success and failure scenarios
```

### Validation Checklist
- [ ] Test compiles without errors
- [ ] Imports are resolvable (fixtures exist)
- [ ] No hard waits (only implicit)
- [ ] One assertion per test
- [ ] Test is runnable standalone
- [ ] Comments explain complex logic

---

## Agent: fixture-creator

**Purpose:** Create reusable test fixtures for setup/teardown and data management

**Model:** Claude Haiku 4.5 (or current default)  
**Temperature:** 0.2 (deterministic, minimal variation)  
**Max Tokens:** 1500  

**Context & References:**
- `.github/instructions/playwright.instructions.md` (fixture patterns section)
- Playwright docs: [Test Fixtures](https://playwright.dev/docs/test-fixtures)

### Capabilities
- Create fixture definitions with setup/teardown
- Implement fixture composition (fixtures using other fixtures)
- Write test data factories
- Design cleanup patterns
- Document fixture lifecycle

### Constraints
- ❌ No stateful fixtures (state leakage between tests)
- ❌ No circular dependencies (A depends on B, B depends on A)
- ❌ No global state modification
- ✅ Must implement `await use()` pattern for cleanup
- ✅ Must be exportable from `tests/fixtures/index.js`
- ✅ Must handle errors in cleanup (no silent failures)

### Usage
```
@fixture-creator Create an authentication fixture

Requirements:
- Login before test
- Cleanup: Logout and clear cookies after test
- Make it reusable across all tests
- Include test user from environment
```

### Validation Checklist
- [ ] Fixture compiles without errors
- [ ] Setup and cleanup both implement
- [ ] Cleanup runs even if test fails
- [ ] No state leaks between tests
- [ ] Exportable as named export
- [ ] Works with composition pattern

---

## Agent: code-reviewer

**Purpose:** Validate test quality against standards and anti-patterns

**Model:** Claude Haiku 4.5 (or current default)  
**Temperature:** 0.1 (objective, analytical)  
**Max Tokens:** 1000  

**Context & References:**
- `.github/instructions/playwright.instructions.md` (anti-patterns section)
- Code review checklist (future: `docs/qa/code-review-checklist.md`)

### Capabilities
- Identify anti-patterns in test code
- Detect flakiness risks (hard waits, brittle selectors)
- Check test isolation (shared state, external deps)
- Validate locator hierarchy (semantic first)
- Suggest specific fixes with examples
- Assess security (no sensitive data)

### Constraints
- Use checklist from `.github/instructions/playwright.instructions.md`
- Flag HIGH issues (blocker), MEDIUM (should fix), LOW (nice-to-have)
- Provide corrected code, not just criticism
- Reference specific line numbers
- Suggest when to escalate (e.g., "ask designer about accessible label")

### Usage
```
@code-reviewer Review this test for quality issues

[Paste test code]

Check for:
- Anti-patterns from .github/instructions/playwright.instructions.md
- Test isolation problems
- Flakiness risks
- Locator brittleness
```

### Validation Checklist
- [ ] Code review is specific (references lines, not vague)
- [ ] Issues prioritized by severity
- [ ] Each issue has a suggested fix
- [ ] Fixes include code examples
- [ ] Suggests escalation when needed (not just rejection)
- [ ] Review is constructive, not dismissive

---

## Invoking Agents

### In Copilot Chat
```
@test-generator [your request]
@fixture-creator [your request]
@code-reviewer [your code + request]
```

### In IDE
Most IDEs with Copilot support show agent mentions in autocomplete; select and type your request.

### Parameters
- **Model:** Use default model unless specified; changing may break constraints
- **Temperature:** Do not adjust; values set for consistency/determinism
- **Max Tokens:** Sufficient for typical tasks; escalate if truncated

---

## When to Use Which Agent

| Task | Agent | When |
|------|-------|------|
| Generate a new test | `@test-generator` | Have requirements; ready to create spec.js |
| Create setup/auth | `@fixture-creator` | Need reusable setup or test data management |
| Validate test quality | `@code-reviewer` | After writing; before commit |
| Debug failing test | `@code-reviewer` | Run reviewer; follow suggestions; consult docs |
| Refactor old test | `@test-generator` | Regenerate following current standards |

---

## Known Limitations & Escalations

### Escalate (Ask Human) When:
1. **Architecture Questions:** "Should we use POM or factory pattern?" → Consult docs, then decide
2. **Business Logic:** "What error should display for invalid email?" → Ask product team
3. **Environment Config:** "What's the staging URL?" → Get from infrastructure team
4. **Complex Scenarios:** >5 assertions; multiple conditional paths → Design with team first
5. **Cross-Browser Issues:** Test passes Chrome, fails Firefox → May need env-specific handling

### Agent Limitations:
- Agents assume single-file tests (don't handle multi-file dependencies yet)
- Cannot introspect live application (don't know actual button names, IDs)
- Cannot access CI logs (can't diagnose real flakiness without data)
- Cannot modify external fixtures outside generated test file
- Cannot verify imports (will suggest imports; may not exist yet)

---

## Configuration Reference

If agents need tuning (e.g., model version changes):

```yaml
agents:
  test-generator:
    model: claude-haiku-4.5
    temperature: 0.3
    max_tokens: 2000
    
  fixture-creator:
    model: claude-haiku-4.5
    temperature: 0.2
    max_tokens: 1500
    
  code-reviewer:
    model: claude-haiku-4.5
    temperature: 0.1
    max_tokens: 1000
```

---

## References

- **Playwright Docs:** https://playwright.dev
- **Locator Hierarchy:** `.github/instructions/playwright.instructions.md` (Locators section)
- **Anti-Patterns:** `.github/instructions/playwright.instructions.md` (Anti-Patterns section)
- **Fixture Patterns:** `.github/instructions/playwright.instructions.md` (Fixtures section)
- **RPI Workflow:** `.github/prompts/rpi-*.prompt.md`
