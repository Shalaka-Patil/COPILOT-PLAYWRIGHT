# Research: Login Test Chromium CI Flakiness

**Objective:** Analyze login.spec.js flakiness in Chromium CI environment; identify failure patterns, selectors, waits, and timing issues

**Date:** February 23, 2026  
**Scope:** SauceDemo login test flakiness; Chromium browser specific; CI environment conditions

**Problem Symptoms:**

- Intermittent timeouts during test execution
- Missed error-banner assertions (when they should be visible)
- Chromium-specific (may not affect Firefox/WebKit)
- CI environment dependent (different from local)

---

## FACTS

### Test File Structure

**File:** `tests/login.spec.js`  
**Test Count:** 1 test (runs on all 3 browsers)  
**Test Name:** `should log in successfully with valid credentials`

**Test Flow (Current Implementation):**

```
1. Arrange: page.goto("https://www.saucedemo.com")
2. Act (Fill):
   - page.locator('[data-test="username"]').fill("standard_user")
   - page.locator('[data-test="password"]').fill("secret_sauce")
3. Act (Submit):
   - page.getByRole("button", { name: /login/i }).click()
4. Assert:
   - expect(page).toHaveURL(/.*inventory/)
```

**Selector Strategy:**

- Username: CSS locator `[data-test="username"]` (not semantic getByTestId)
- Password: CSS locator `[data-test="password"]` (not semantic getByTestId)
- Login button: Semantic `getByRole("button", { name: /login/i })`
- Success verification: URL pattern (only assertion)

### Configuration & Environment

**Playwright Config (playwright.config.js):**

- Timeout: 30,000ms (30 seconds per test)
- Trace collection: `retain-on-failure` (traces all failures)
- Local execution: `fullyParallel: true`, 4 workers, 0 retries
- CI execution: `workers: 1`, serial, `retries: 2`
- Chromium project: Desktop Chrome device config

**Test Execution Context:**

- Runs on 3 projects: Chromium, Firefox, WebKit
- Latest test run (2026-02-23): All 3 passed
  - Chromium: 2,086ms, passed
  - Firefox: 6,838ms, passed
  - WebKit: 4,990ms, passed
- Retry metadata: `retry: 0` (no retries on last successful run)

**Project Standards (from .github/instructions):**

- Anti-pattern: Hard waits (`page.waitForTimeout()`) are forbidden
- Recommended: Implicit waits via locators (`expect()`, `locator().waitFor()`)
- Locator priority: getByRole > getByLabel > getByTestId > locator (CSS)
- Required: One primary assertion per test

### Current Test Results

**Latest Run Status:** All tests passed (9/9 passing)

- Chromium login: ✅ Passed (2,086ms, retry: 0)
- Firefox login: ✅ Passed (6,838ms, retry: 0)
- WebKit login: ✅ Passed (4,990ms, retry: 0)
- Traces: None generated (no failures = no traces)
- `.last-run.json`: Status "passed", no failed tests

**Previous Failure History:** Not visible in current results.json (would need older traces/logs to analyze)

---

## ASSUMPTIONS

### SauceDemo Application Assumptions

1. **Form Elements Present:** Elements with `data-test="username"` and `data-test="password"` exist and are visible at page load
2. **Login Button Accessible:** Login button with text matching `/login/i` is present and clickable after form fill
3. **Post-Login Navigation:** Successful login redirects to URL containing `/inventory`
4. **No Blocking Elements:** No modal dialogs, loading spinners, or overlays block form interaction
5. **Page Load Timing:** Login page renders completely within default 30s timeout

### Test Timing Assumptions

1. **Implicit Waits Sufficient:** Playwright's auto-waiting on `.fill()` and `.click()` is adequate without explicit waitFor()
2. **No Page Unload:** Form fill operations don't trigger page unload/reload before submission
3. **Login Processing:** Server-side login processes in <30s
4. **No Network Delays:** Network latency not significantly different between local and CI

### Chromium-Specific Assumptions

1. **No Browser-Specific Behavior:** Chromium doesn't have unique form interaction quirks vs Firefox/WebKit
2. **No Memory/Resource Issues:** CI Chromium instance has adequate memory and doesn't timeout under load
3. **No Timing Sensitivity:** Chromium timing doesn't require special waits (e.g., JavaScript execution delays)

### CI Environment Assumptions

1. **Network Accessibility:** SauceDemo is accessible from CI environment (no proxy/firewall blocking)
2. **DNS Resolution:** No DNS resolution delays or timeouts
3. **No Rate Limiting:** CI execution not subject to IP-based rate limits
4. **Serial Execution Stability:** Single worker (1 browser instance) is more stable than parallel

---

## UNKNOWNS

### Critical Missing Data

1. **Actual Failure Patterns:**
   - How often does Chromium CI test fail? (e.g., 10% flakiness, 50%, 100% failure)
   - What is the failure mode? (timeout, assertion failure, element not found, other)
   - Are failures reproducible or random?
   - Do failures occur on retry, or always fail?

2. **Error-Banner Assertion Context:**
   - Current test only checks URL (no error-banner verification)
   - Was error-banner assertion planned but not implemented?
   - What is the error-banner element structure? (class, role, data-test value)
   - When should error-banner be visible (failed login, network error, etc)?

3. **Page Load & Navigation Timing:**
   - How long does SauceDemo login page take to load? (first contentful paint)
   - How long does login processing take? (redirect latency)
   - Does `/inventory` page load immediately or require additional navigation?
   - Are there intermediate redirects (e.g., login → dashboard → inventory)?

4. **Form State & Readiness:**
   - When are username/password fields interactive (visible ready for input)?
   - Does SauceDemo have JavaScript-driven form initialization that requires waiting?
   - Are form fields disabled initially and enabled on page ready?
   - Is there a form `onload` or initialization event that must complete?

5. **Chromium-Specific Behaviors:**
   - Does Chromium handle form `.fill()` differently than Firefox/WebKit?
   - Are there Chromium-specific timeouts or event timing issues?
   - Does Chromium auto-fill or form completion trigger different behavior?
   - Why does Chromium fail when Firefox/WebKit don't (if confirmed)?

### Locator & Selector Questions

1. **CSS Locator Fragility:**
   - Why use CSS `page.locator('[data-test="..."]')` instead of `getByTestId()`?
   - Are CSS locators less reliable than semantic getByTestId in CI?
   - Could attribute selector (`[data-test="..."]`) be affected by attribute encoding or timing?

2. **Login Button Selector:**
   - Is getByRole("button", { name: /login/i }) reliable?
   - Are there multiple buttons (each matching the regex)?
   - Could dynamic button attributes cause selector to fail?
   - Is case sensitivity an issue (case-insensitive regex used)?

3. **Success URL Pattern:**
   - Why use `/.*inventory/` instead of exact URL?
   - Could intermediate redirects cause this pattern to fail?
   - Are there query parameters that break the regex?

### Waiting & Synchronization Questions

1. **Missing Navigation Wait:**
   - After `.click()` on login button, is page navigation awaited?
   - Could test assert URL before page is fully loaded/redirected?
   - Should there be explicit wait for navigation? (e.g., `page.waitForNavigation()`, `page.waitForURL()`)
   - Could `expect(page).toHaveURL()` timeout while waiting for navigation?

2. **Element Readiness:**
   - Is `.fill()` preceded by wait for element visibility?
   - Could element be present but disabled/hidden when `.fill()` called?
   - Does SauceDemo have form field masking or validation that blocks input?

3. **Network Idle Conditions:**
   - Should `page.goto()` wait for network idle? (e.g., `waitUntil: 'networkidle'`)
   - Are there background requests that keep network "busy"?
   - Could omitting networkidle wait cause premature form interaction?

### CI-Specific Questions

1. **Resource Contention:**
   - Is serial execution (1 worker) causing resource starvation?
   - Could memory pressure affect Chromium stability?
   - Are CI machines underpowered compared to local machines?

2. **Network Conditions:**
   - Are CI network latencies higher than expected?
   - Is DNS resolution slower in CI?
   - Are there transient network errors (dropped connections)?

3. **Retry Behavior:**
   - When test fails and retries (up to 2 times), does it consistently fail on all attempts?
   - Or does retry succeed, indicating transient issue?
   - Are retry failures the same error, or different errors?

---

## RISKS

### High Priority

1. **Missing Navigation Wait (Likely Cause of Flakiness)**
   - **Issue:** Test clicks login button but doesn't explicitly wait for page navigation
   - **Consequence:** URL assertion (`expect(page).toHaveURL()`) may race with navigation
   - **Evidence:**
     - Test only checks final URL; no intermediate waits
     - Project standards forbid hard waits but _recommend_ explicit conditional waits
     - Chromium timing may differ from Firefox/WebKit, revealing race condition
   - **Impact:** High flakiness potential; 30s timeout may be exceeded if assertion checks too early
   - **Severity:** 🔴 HIGH

2. **Page Not Fully Loaded Before Form Interaction**
   - **Issue:** `page.goto()` without explicit waitUntil condition
   - **Consequence:** Form elements may not be interactive when `.fill()` called
   - **Evidence:**
     - No `waitUntil` specified in goto(); defaults to 'load' event
     - SauceDemo may have JavaScript-driven form initialization
     - Could trigger "element not clickable" or "element detached" errors
   - **Impact:** Intermittent failures; timing-dependent on CI performance
   - **Severity:** 🔴 HIGH

3. **CSS Locator Brittleness vs. Semantic Selectors**
   - **Issue:** Using `page.locator('[data-test="username"]')` instead of `getByTestId('username')`
   - **Consequence:** CSS selector less resilient to DOM changes; Playwright's locator.waitFor() ignored
   - **Evidence:**
     - Project standards prefer semantic locators for resilience
     - CSS selectors don't have auto-waiting like getByTestId
     - Chromium may handle attribute-based selectors differently
   - **Impact:** Unpredictable failures; potential "element not found" errors
   - **Severity:** 🔴 HIGH (violates project conventions)

4. **No Error-Banner Verification**
   - **Issue:** Test only checks success URL; doesn't verify error states
   - **Consequence:** Failed login (wrong credentials, network error, etc.) passes if URL changes
   - **Evidence:**
     - Research symptom mentions "missed error-banner assertions"
     - Current test has no error-banner check
     - Could mask login failures as successes
   - **Impact:** False passes; hidden login issues
   - **Severity:** 🟡 MEDIUM (affects test validity, not execution)

### Medium Priority

5. **Chromium-Specific Form Handling**
   - **Issue:** Chromium may interact with forms differently (autofill, form events)
   - **Consequence:** Firefox/WebKit pass (slower, more time for async operations) while Chromium fails (fast, before JS ready)
   - **Evidence:**
     - Chromium faster than Firefox in current run (2,086ms vs 6,838ms)
     - If Chromium is "too fast," it may interact before page ready
   - **Impact:** Browser-specific flakiness; selective Chromium failures
   - **Severity:** 🟡 MEDIUM

6. **No Explicit Wait Between Fill & Click**
   - **Issue:** Form fields filled then immediately clicked without wait
   - **Consequence:** Events (onChange, onBlur) may not fire before login submitted
   - **Evidence:**
     - Sequential operations without `await page.locator(...).waitFor()`
     - Could trigger client-side validation errors
   - **Impact:** Intermittent validation failures
   - **Severity:** 🟡 MEDIUM

### Low Priority

7. **SauceDemo Availability/Rate Limiting**
   - **Issue:** External service SauceDemo could be slow, down, or rate-limiting
   - **Consequence:** Transient failures; timeouts
   - **Evidence:** No unknown; SauceDemo is public
   - **Impact:** Environmental flakiness (not test code issue)
   - **Severity:** 🟢 LOW (outside test control)

8. **30-Second Timeout May Be Tight**
   - **Issue:** Login takes ~2–7s in current run; margin for error ~23s (adequate)
   - **Consequence:** If network degrades, login could exceed 30s
   - **Evidence:** Longest run (Firefox) took 6,838ms; still well under 30s
   - **Impact:** Occasional timeout failures under network stress
   - **Severity:** 🟢 LOW (current behavior acceptable)

---

## EVIDENCE GAPS

### Critical Data Missing

- [ ] **Historical failure logs:** No previous runs with Chromium failures available (only current success)
- [ ] **Trace files from failures:** Traces would show exact failure point (current: no traces, test passed)
- [ ] **Error messages from flaky runs:** Unknown what error occurs (timeout? assertion? element not found?)
- [ ] **Failure frequency:** Unknown how often flakiness occurs (sporadic? consistent?)
- [ ] **Network performance during failures:** Unknown if network delays correlate with failures

### Diagnostic Data Missing

- [ ] **Page load timing:** How long to render form elements? When are they interactive?
- [ ] **SauceDemo JavaScript execution:** Any async form setup or validation logic?
- [ ] **Login redirect timing:** How long does server take to process login + redirect?
- [ ] **Chromium vs. Firefox form behavior:** Does Chromium autofill interfere?
- [ ] **Error-banner element structure:** When/where does error-banner appear? What's the selector?

### Comparative Data Missing

- [ ] **Local vs. CI execution patterns:** Do tests behave differently locally?
- [ ] **Parallel vs. serial execution:** Does CI serial execution stabilize or destabilize test?
- [ ] **Per-attempt analysis:** Which retry attempts fail? (1st, 2nd, after initial failure?)
- [ ] **Network packet capture:** Any dropped, slow, or abnormal HTTP requests?

### Configuration Data Missing

- [ ] **SauceDemo load balancing:** Does SauceDemo have regional servers/CDN?
- [ ] **CI network configuration:** Proxies, DNS, security policies?
- [ ] **Chromium sandbox mode:** Could CI run Chromium in restricted mode affecting performance?

---

## CANDIDATE FILE ALLOW-LIST

### Files Directly Related to Login Test Implementation

**Primary Suspect Files:**

1. `tests/login.spec.js` — Test code with potential flakiness
   - Locators and waiting patterns
   - Navigation handling
   - Assertion strategy
2. `playwright.config.js` — Configuration affecting test execution
   - Timeout settings
   - Trace collection
   - Chromium device-specific config
   - Navigation wait settings

3. `.github/instructions/playwright.instructions.md` — Project standards
   - Waiting patterns guidance
   - Locator hierarchy recommendations
   - Error handling patterns

### Supporting Investigation Files

**Secondary Files (Config/Context):** 4. `package.json` — Dependencies (Playwright version, browser versions) 5. `tests/example.spec.js` — Reference for working test patterns (both pass) 6. `docs/rpi/research/saucedemo-login-test.md` — Original research assumptions

### Trace & Logs (When Available)

**Diagnostic Artifacts (Not Yet Present):**

- `test-results/` — Trace files (generated only on failures; none current)
- `playwright-report/` — HTML report (visual debugging)
- `.last-run.json` — Previous run status (currently shows "passed")

---

## CONCLUSION

Login test flakiness in Chromium CI likely stems from **one or more timing/synchronization issues**:

🔴 **Primary Suspect (High Confidence):**

- Missing explicit wait for navigation after login button click
- Using CSS locators instead of semantic getByTestId (violates project standards)
- No wait-for-element-ready before form fill operations

🟡 **Secondary Suspects (Medium Confidence):**

- Chromium faster than other browsers; may interact before async JS initializes
- No network idle wait in page.goto(); form may not be interactive
- Missing intermediate assertions (only checks final URL, no success indicators)

🟢 **Lower Suspects (Low Confidence):**

- SauceDemo availability (external control)
- CI environment resource issues

**Required for Effective Fixing:**

- Trace files or logs from actual failure runs (currently all tests pass)
- Understanding of exact error messages (timeout? assertion? element not found?)
- SauceDemo form structure inspection (current JavaScript behavior unknown)
