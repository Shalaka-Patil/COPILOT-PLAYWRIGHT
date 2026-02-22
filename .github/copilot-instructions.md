<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Playwright Project Guidelines

## Testing Standards

- Write tests in the `tests/` directory with `.spec.js` extension
- Use descriptive test names that clearly indicate what is being tested
- Follow the Arrange-Act-Assert pattern
- Use meaningful selectors and avoid brittle tests
- Keep tests independent and isolated

## Code Style

- Use modern JavaScript (ES6+)
- Use descriptive variable and function names
- Keep tests focused on a single scenario
- Comment complex test logic

## Playwright Best Practices

- Use locators over page.evaluate() when possible
- Wait for elements implicitly rather than using fixed waits
- Use test.describe() to group related tests
- Leverage Playwright's auto-waiting capabilities
- Use fixtures for setup and teardown

## Configuration

- Modify `playwright.config.js` for browser, reporter, and parallel execution settings
- Set `baseURL` in config if testing against a specific application
- Use environment variables for sensitive data

## Commands

- `npm test` - Run all tests
- `npm run test:headed` - Run tests with browser visible
- `npm run test:ui` - Launch Playwright UI mode
- `npm run test:debug` - Debug tests step-by-step
- `npm run codegen` - Generate test code interactively

# QA Delivery Governance

**For test development, use these resources:**

## Core Instructions
- **Playwright Standards:** `.github/instructions/playwright.instructions.md` — Naming, locators, fixtures, anti-patterns
- **QA Agents:** `.github/agents/qa-delivery.agent.md` — Specialized Copilot agents for test generation, fixtures, code review

## Copilot Agents
Invoke agents in Copilot for specialized assistance:
- `@test-generator` — Generate test code from requirements
- `@fixture-creator` — Create reusable test setup/teardown
- `@code-reviewer` — Validate tests against standards

**Example:**
```
@test-generator Write a test that verifies users can log in
Requirements: Email/password form, success/error paths
```

## RPI Workflow for Copilot Development
For complex QA tasks, follow RPI process:
- `.github/prompts/rpi-research.prompt.md` — Structured research (Facts, Assumptions, Unknowns, Risks)
- `.github/prompts/rpi-plan.prompt.md` — Approval-based planning (Files, Steps, Criteria, Rollback)
- `.github/prompts/rpi-implement.prompt.md` — Execution discipline (Allow-list, validation, reporting)

# Mandatory RPI Workflow

When working on non-trivial tasks:

1. Follow RPI Stage Contracts defined in docs/rpi/RPI_STAGE_CONTRACTS.md
2. Never skip stages
3. Never mix stages
4. Do not write code during Research or Plan
5. Do not expand scope during Implement
6. Always produce structured output
7. Always save artifacts under docs/rpi/

If user skips stage process, ask for clarification.

**Note:** QA-specific governance operates within RPI framework using `.github/prompts/` and `.github/agents/`.