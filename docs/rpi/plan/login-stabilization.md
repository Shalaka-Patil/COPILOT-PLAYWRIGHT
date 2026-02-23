# Plan: Login Test Stabilization (Chromium CI Flakiness)

**Objective:** Stabilize login.spec.js test failures in Chromium CI through targeted timing and selector improvements

**Date:** February 23, 2026  
**Scope:** Fix intermittent timeouts and element interaction failures in Chromium CI environment  
**Research Reference:** `docs/rpi/research/login-chromium-ci-flakiness.md`

---

## SCOPE & BOUNDARIES

### In Scope

- **Timing & Navigation Issues:** Add explicit waits for page load and navigation completion
- **Locator Strategy:** Convert CSS locators to semantic getByTestId (per project standards)
- **Form Readiness:** Ensure form fields interactive before fill operations
- **Cross-browser Verification:** Test stabilization across all 3 browsers (Chromium, Firefox, WebKit)
- **Error-Banner Foundation:** Prepare test structure for error-banner verification (future expansion)

### Out of Scope (Future Enhancements)

- Implementing error-banner assertion logic (scope for separate phase)
- Invalid credential scenarios (scope for error-path testing)
- Custom Chromium device settings
- SauceDemo application changes
- CI environment infrastructure changes
- Rate-limiting or retry policy tuning

### Constraints

- **Code-Only Changes:** Modify only test logic in `tests/login.spec.js`
- **Configuration Stability:** Do not change `playwright.config.js` timeouts or retry settings
- **No Dependencies:** Use only Playwright built-in APIs (no new packages)
- **Reversibility:** All changes must be reversible by reverting single file
- **Project Compliance:** Adhere to `.github/instructions/playwright.instructions.md` standards

---

## ROOT-CAUSE HYPOTHESES (Ranked by Likelihood & Impact)

### Hypothesis 1: Missing Navigation Wait (HIGH CONFIDENCE)

**Rank:** 🔴 **PRIMARY** (Most likely cause)

**Root Cause:**

- Test clicks login button but does not explicitly wait for page navigation
- URL assertion (`expect(page).toHaveURL()`) races with redirect
- Chromium's faster execution exposes race condition more than Firefox/WebKit

**Evidence:**

- Research: No `waitForNavigation()` or `page.waitForURL()` after click
- No intermediate waits between Act and Assert phases
- Chromium 2.1s vs Firefox 6.8s suggests Chromium "too fast" for async navigation
- Project standards discourage hard waits but recommend explicit conditional waits

**Fix Strategy:**

- Add explicit wait for URL pattern before assertion
- Use `page.waitForURL()` with regex matching inventory page
- Verify navigation completes before asserting

---

### Hypothesis 2: CSS Locators vs. Semantic Selectors (HIGH CONFIDENCE)

**Rank:** 🔴 **PRIMARY** (High impact, standards violation)

**Root Cause:**

- Uses `page.locator('[data-test="..."]')` instead of `getByTestId()`
- CSS selectors lack Playwright's auto-waiting behavior
- Violates project locator hierarchy (getByTestId is Tier 3, before CSS)

**Evidence:**

- Research: Project standards prefer getByTestId > locator (CSS)
- CSS selectors don't have implicit waitFor like semantic methods
- Other tests in project use semantic locators successfully

**Fix Strategy:**

- Replace `page.locator('[data-test="username"]')` with `page.getByTestId('username')`
- Replace `page.locator('[data-test="password"]')` with `page.getByTestId('password')`
- Leverage Playwright's auto-waiting on semantic locators

---

### Hypothesis 3: Page Not Fully Interactive Before Form Fill (MEDIUM CONFIDENCE)

**Rank:** 🟡 **SECONDARY** (Moderate impact)

**Root Cause:**

- `page.goto()` uses default `waitUntil: 'load'` (not `'networkidle'`)
- SauceDemo may have JavaScript-driven form initialization
- Form fields present but not enabled/ready when `.fill()` called

**Evidence:**

- Research: No explicit waitUntil specified
- Form elements could be present but disabled on load
- Chromium faster execution means less time for JS to initialize

**Fix Strategy:**

- Add explicit `waitFor()` for form input visibility before fill
- Use `page.getByTestId('username').waitFor({ state: 'visible' })`
- Ensure form is interactive before attempting fill operations

---

### Hypothesis 4: Chromium-Specific Autofill/Event Timing (MEDIUM CONFIDENCE)

**Rank:** 🟡 **SECONDARY** (Lower impact, browser-specific)

**Root Cause:**

- Chromium may trigger autofill or form events differently than Firefox/WebKit
- No explicit wait between fill operations and click
- Client-side validation may not complete before form submission

**Evidence:**

- Research: Chromium twice as fast (timing-sensitive behavior)
- No explicit waits between sequential fill operations
- Event handlers (onChange, onBlur) may not fire before click

**Fix Strategy:**

- Add explicit visibility/focus waits between sensitive operations
- Verify form submission button is enabled before clicking
- Use `locator.waitFor({ state: 'visible' })` for intermediate verification

---

## FILE IMPACT MATRIX

| File                                              | Change Type       | Scope                   | Risk Level | Reversibility           |
| ------------------------------------------------- | ----------------- | ----------------------- | ---------- | ----------------------- |
| `tests/login.spec.js`                             | Code modification | Form interaction, waits | 🟢 LOW     | Immediate (single file) |
| `playwright.config.js`                            | No change         | —                       | N/A        | —                       |
| `.github/instructions/playwright.instructions.md` | Reference only    | No modification         | N/A        | —                       |
| `tests/example.spec.js`                           | No change         | —                       | N/A        | —                       |
| `package.json`                                    | No change         | —                       | N/A        | —                       |

**Affected Test Suite Impact:**

- ✅ 2 external URL tests (example.spec.js): No impact
- ✅ 1 login test (login.spec.js): Direct modification
- ✅ Total: 3 tests, all should pass post-fix
- ✅ Cross-browser: Fix applies equally to Chromium, Firefox, WebKit

---

## ORDERED IMPLEMENTATION STEPS

### Phase 1: Locator Standardization (Steps 1–2)

Migrate to semantic selectors per project standards

**Step 1: Convert Username Locator to Semantic getByTestId**

- **Action:** Replace `page.locator('[data-test="username"]')` with `page.getByTestId('username')`
- **Rationale:**
  - Aligns with project Locator Hierarchy (getByTestId Tier 3 vs. CSS Tier 4)
  - Enables Playwright's built-in auto-waiting behavior
  - More maintainable and resilient to DOM changes
- **File:** `tests/login.spec.js` (Act phase, username fill)
- **Scope:** Single locator replacement
- **Verification:** Code review; no functional test yet

**Step 2: Convert Password Locator to Semantic getByTestId**

- **Action:** Replace `page.locator('[data-test="password"]')` with `page.getByTestId('password')`
- **Rationale:** Same as Step 1; consistency
- **File:** `tests/login.spec.js` (Act phase, password fill)
- **Scope:** Single locator replacement
- **Verification:** Code review; no functional test yet

---

### Phase 2: Navigation Timing Fix (Steps 3–4)

Add explicit waits for page loads and navigation

**Step 3: Add Explicit Wait for Form Element Visibility**

- **Action:** Insert `waitFor()` before first form field fill
  - Wait for username field visibility with 30s timeout (explicit)
  - Ensures form interactive before fill operations begin
- **Rationale:**
  - Guarantees form fields ready for input
  - Catches issues if JavaScript initialization delayed
  - Prevents "element not interactable" errors
- **File:** `tests/login.spec.js` (Act phase, before first fill)
- **Location:** Between `//Act` comment and credential fill
- **Scope:** Single explicit wait statement
- **Example Pattern:** `await page.getByTestId('username').waitFor({ state: 'visible' })`

**Step 4: Add Explicit Wait for Navigation After Login Click**

- **Action:** Replace simple URL assertion with explicit navigation wait
  - Wait for URL pattern match before assertion
  - Prevents race condition between click and page redirect
- **Rationale:**
  - Eliminates race condition: click → redirect → assert
  - Move wait logic from assertion (passive) to navigation (active)
  - Chromium flakiness likely triggered by this timing issue
- **File:** `tests/login.spec.js` (Assert phase)
- **Location:** After button click, before final assertion
- **Scope:** Replace single assertion with wait + assertion pattern
- **Example Pattern:** `await page.waitForURL(/.*inventory/, { timeout: 30000 }); await expect(page).toHaveURL(/.*inventory/);`

---

### Phase 3: Validation & Verification (Steps 5–7)

**Step 5: Validate Local Execution (Parallel Mode)**

- **Action:** Run full test suite locally
- **Command:** `npm test`
- **Expected Output:**
  - 9 tests total (6 existing + 3 new login tests × 3 browsers)
  - All pass (100% success rate)
  - Execution time: ~25–35s
- **Validation:**
  - No "element not found" errors
  - No timeout failures
  - All 3 browsers pass
  - Login tests run in parallel without interference

---

**Step 6: Validate CI Execution (Serial Mode)**

- **Action:** Run full test suite in CI mode
- **Command:** `CI=true npm test`
- **Expected Output:**
  - 9 tests total, all pass
  - Serial execution (1 worker) confirmed
  - No retries needed (0 retries triggered)
  - forbidOnly check passes
- **Validation:**
  - Chromium specifically passes without timeout
  - No flakiness observed
  - Traces not generated (no failures)

---

**Step 7: Verify No Regressions**

- **Action:** Confirm existing tests still pass and no cross-test interference
- **Checks:**
  - ✓ "has title" test passes (playwright.dev, example.spec.js)
  - ✓ "get started link" test passes (playwright.dev, example.spec.js)
  - ✓ Login test passes across all 3 browsers
  - ✓ Total: 9/9 tests passing
  - ✓ No flakiness (consistent pass rate)
  - ✓ No test isolation issues (login doesn't affect existing tests)

---

## ACCEPTANCE CRITERIA

### Code Quality Acceptance (Steps 1–4)

- [ ] Username locator migrated to `getByTestId('username')`
  - CSS locator `[data-test="username"]` removed
  - No syntax errors
- [ ] Password locator migrated to `getByTestId('password')`
  - CSS locator `[data-test="password"]` removed
  - No syntax errors

- [ ] Form visibility wait added
  - `page.getByTestId('username').waitFor({ state: 'visible' })`
  - Placed before first `.fill()` operation
  - Timeout configured (default or explicit 30s)

- [ ] Navigation wait added post-click
  - `page.waitForURL(/.*inventory/)` or equivalent
  - Placed between `.click()` and final assertion
  - Timeout configured (30s or less)

- [ ] Test structure preserved
  - Arrange-Act-Assert pattern maintained
  - Single primary assertion (URL check)
  - No hard waits (`page.waitForTimeout()`)
  - Follows project conventions

---

### Functional Acceptance (Steps 5–7)

- [ ] Local execution success (npm test)
  - 9 tests passing (6 existing + 3 login)
  - Duration: 25–35s (acceptable range)
  - All 3 browsers pass
  - No timeout errors
  - No element not found errors

- [ ] CI execution success (CI=true npm test)
  - 9 tests passing
  - Serial execution confirmed (1 worker)
  - 0 retries triggered (all pass on first attempt)
  - forbidOnly check passes
  - Duration: 25–35s

- [ ] No regressions
  - Existing tests pass: "has title" ✓, "get started link" ✓
  - Total pass rate: 100% (9/9)
  - No new failures introduced
  - No test isolation issues
  - Cross-browser compatibility maintained

- [ ] Flakiness eliminated
  - Chromium does not timeout on login test
  - 0 intermittent failures observed across multiple runs
  - Traces not generated (no failures = no flakiness)

---

## ROLLBACK CRITERIA

### Immediate Rollback (If Syntax Errors)

**Trigger:** Code doesn't compile; syntax errors in JavaScript

**Rollback Steps:**

1. Revert `tests/login.spec.js` to prior version
2. Run `npm test` to verify revert successful
3. Confirm: 9 tests passing (original state)

**Timeline:** <2 minutes

---

### Functional Rollback (If Tests Fail)

**Trigger:** Modified test fails; regression in existing tests; new failures

**Rollback Steps:**

1. Revert `tests/login.spec.js` to prior version
2. Run `npm test` to verify tests pass again
3. Document error: What exactly failed?
4. Decide: Investigate or try different approach

**Timeline:** <5 minutes

---

### Partial Rollback (If One Browser Fails)

**Trigger:** Chromium pass but Firefox/WebKit fail (unexpected regression)

**Rollback Steps:**

1. Remove Phase 2 changes (navigation wait) first
2. Keep Phase 1 changes (locator updates)
3. Test again: See if locator fix alone resolves issue
4. If still fails, revert fully

**Timeline:** <10 minutes

---

## VALIDATION COMMANDS & REQUIRED EVIDENCE

### Pre-Implementation Baseline

**Command:** `npm test` (get baseline before changes)

**Expected Evidence:**

- Test results JSON: `test-results/results.json`
- Status: Current run passes (9/9) or fails with specific error
- Baseline duration: Note current execution time
- HTML report: `playwright-report/index.html` (visual reference)

---

### Post-Implementation Local Validation

**Command:** `npm test`

**Required Evidence For Success:**

```
✓ 9 tests passed (test summary)
✓ Duration: 25-35s (performance check)
✓ All 3 browsers: chromium, firefox, webkit (cross-browser)
✓ No timeout errors in stderr
✓ HTML report viewable with all passes
✓ JSON report contains 0 failures
```

**Validation Script** (pseudocode):

```bash
npm test 2>&1 | grep -E "passed|failed|timeout"
# Expected: "9 passed" with no "failed" or "timeout"
```

---

### Post-Implementation CI Validation

**Command:** `CI=true npm test`

**Required Evidence For Success:**

```
✓ forbidOnly check: Passes (no test.only found)
✓ 9 tests passed (CI mode check)
✓ Serial execution: "workers: 1" or "1 worker" in output
✓ 0 retries triggered (all pass first attempt; stderr shows no retry logs)
✓ Duration: 25-35s
✓ HTML report generated in playwright-report/
✓ JSON report generated in test-results/results.json
```

---

### Flakiness & Regression Validation

**Command:** `npm test` (run 3 times locally; run once in CI mode)

**Required Evidence For Stability:**

```
Run 1: 9 passed (check)
Run 2: 9 passed (check)
Run 3: 9 passed (check)
CI:    9 passed, 0 retries (check)

Final: 100% pass rate across all runs
```

---

### Chromium-Specific Validation

**Command:** `npm test` → inspect results.json for chromium project

**Required Evidence:**

```json
{
  "projectName": "chromium",
  "status": "passed",
  "duration": "~2-3s (acceptable without timeout)",
  "retry": 0,
  "errors": []
}
```

**Note:** Chromium should be fastest (2-3s) without timeouts. Regression = timeout or duration >10s.

---

## RESIDUAL RISKS & FOLLOW-UP WORK

### Residual Risk: Error-Banner Assertion Gap (MEDIUM)

**Issue:** Test only verifies URL; doesn't validate success state via error-banner

**Why It Matters:**

- False passes possible if SauceDemo redirects URL even on failure
- Can't distinguish successful login from page navigation glitches

**Mitigation in This Plan:** Not in scope; foundation laid (locators/waits ready for future)

**Follow-Up Work:**

1. Research: Inspect SauceDemo error-banner element structure
2. Plan: Design error-banner verification assertion
3. Implement: Add secondary assertion checking for success page indicators
4. Phase 2 Enhancement: Integrate error-banner check into test

**Timeline:** Post-stabilization (Phase 2)

---

### Residual Risk: Unknown Failure Modes (MEDIUM)

**Issue:** Current test passes; flakiness reported but no trace files available

**Why It Matters:**

- Without failure logs, root-cause analysis is educated guess
- Fix may not address actual failure if hypothesis wrong

**Mitigation in This Plan:**

- Design addresses 3 primary hypotheses (timing, selectors, page load)
- Each fix targets different failure mode (timeout, element not found, race condition)
- Broad fixes cover most likely scenarios

**Follow-Up Work:**

1. Monitor: If flakiness persists post-fix, capture traces from failing run
2. Analyze: Review trace files to identify true root cause
3. Iterate: Adjust fixes based on actual failure evidence

**Timeline:** Post-implementation monitoring (daily CI runs)

---

### Residual Risk: Chromium-Only Issue Not Confirmed (LOW)

**Issue:** Problem stated as "Chromium only" but current test passes all browsers

**Why It Matters:**

- If current run all pass, flakiness may be intermittent or fixed
- Fix may solve non-existent problem, or fix different issue than intended

**Mitigation in This Plan:**

- Fixes address fundamental timing issues (applicable to all browsers)
- No browser-specific workarounds; improvements benefit all 3 browsers
- If Chromium was uniquely affected, fix prevents future regression

**Follow-Up Work:**

1. Monitor: Track flakiness frequency post-fix
2. Decision: If no failures observed in next 100 CI runs, flakiness was sporadic
3. Root-Cause Deep Dive: If failures persist, investigate Chromium-specific behavior

**Timeline:** Post-implementation (2-week monitoring period)

---

### Residual Risk: External Service Dependency (LOW)

**Issue:** Test depends on SauceDemo availability (external service)

**Why It Matters:**

- SauceDemo outages or rate-limiting would cause test failures outside our control
- Can't fix with code changes; only documentation and monitoring help

**Mitigation in This Plan:** Not in scope; accepted risk of external dependency

**Follow-Up Work:**

1. Monitor: Track "SauceDemo unreachable" vs "test logic" failures
2. Decision: If frequent external issues, migrate test to local mock app
3. Alternative: Add skip condition if SauceDemo unavailable

**Timeline:** Post-implementation (if failures occur)

---

## SUCCESS DEFINITIONS

### Success (Proceed to Implementation)

- ✅ All HIGH priority hypotheses addressed (navigation wait, semantic locators, form readiness)
- ✅ MEDIUM priority issues partially addressed (timing gaps)
- ✅ Acceptance criteria clear and measurable
- ✅ Validation commands defined
- ✅ Rollback plan documented
- ✅ Residual risks identified and accepted

### Conditional Success (With Caveats)

- ⚠️ If test still passes after fix: "No regression" is success (sporadic flakiness may be fixed)
- ⚠️ If test fails on one browser only: Debug browser-specific config; partial success
- ⚠️ If CI passes but local fails: Environment-specific investigation needed

### Failure (Halt & Reconsider)

- ❌ Fix introduces regression (existing tests fail)
- ❌ Syntax errors prevent execution
- ❌ All 3 browsers fail (indicates wrong approach)
- **Action:** Rollback; reassess hypotheses; try different fix

---

## APPROVAL GATE

**This Plan is Ready for Implementation When:**

- ✅ Research artifact reviewed (`docs/rpi/research/login-chromium-ci-flakiness.md`)
- ✅ Root-cause hypotheses ranked and accepted
- ✅ File impact matrix reviewed (only login.spec.js changes)
- ✅ Ordered steps clear and sequential
- ✅ Validation commands verified (commands exist, tools available)
- ✅ Rollback plan tested (confirm git revert works)

**Sign-Off Required:**

- Code review before changes (no code generated during Planning)
- Testing authority confirms Chromium flakiness documented/understood

---

## NEXT PHASE

Once Plan approved, proceed to **Implement stage** to:

1. ✏️ Apply changes to `tests/login.spec.js` (Steps 1–4)
2. ▶️ Execute validation (Steps 5–7)
3. 📊 Generate implementation artifact with evidence

**Do NOT proceed to Implement without Plan approval.**
