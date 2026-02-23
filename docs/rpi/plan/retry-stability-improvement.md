# Plan: Retry Stability Improvement

**Objective:** Design implementation of baseline flakiness metrics and failure categorization to validate and optimize retry policy

**Date:** February 23, 2026  
**Scope:** Enable structured failure tracking and metrics collection without code changes to tests

**Research Reference:** `docs/rpi/research/retry-stability-improvement.md`

---

## SCOPE & BOUNDARIES

### In Scope

- **Configuration changes** to enable failure categorization and metrics collection
- **Reporter setup** for structured JSON/JUnit output with detailed failure data
- **Trace retention policy** updates to capture diagnostics for all failures (not just retries)
- **Test execution monitoring** via HTML report enhancement and failure parsing

### Out of Scope (For Future Improvements)

- Code changes to test files themselves
- Conditional retry implementation (depends on metrics from this phase)
- Exponential backoff implementation
- Per-browser or per-test retry customization
- CI/CD integration alerts or dashboards

### Constraints

- Must not require test code modifications
- Must be reversible via configuration rollback
- Must not break existing `npm test`, `npm run test:headed`, `npm run test:ui` commands
- Must work on Windows (current development OS)

---

## IMPACTED FILES

1. **playwright.config.js** — Enable reporters and trace collection enhancements
2. **docs/rpi/plan/metrics-collection-setup.md** — (NEW) Metrics collection guide
3. **.gitignore** (conditional) — Ensure test artifacts are properly ignored/tracked

### No Changes Required

- `tests/example.spec.js` — Tests remain unchanged
- `package.json` — No new dependencies (Playwright has built-in JSON reporter)
- CI/CD configuration — Metrics are collected locally and in CI unchanged

---

## ORDERED IMPLEMENTATION STEPS

### Phase 1: Reporter Configuration (Steps 1–3)

Essential for capturing failure details in structured format

**Step 1: Enable JSON Reporter**

- **Action:** Add `json` reporter to `playwright.config.js` reporters array
- **Rationale:** Produces machine-parseable test results with:
  - Full error messages and stack traces
  - Test duration and retry count
  - Failure categorization (timed out, assertion failed, etc.)
- **Output Location:** `test-results/results.json`
- **Scope:** Configuration change only

**Step 2: Maintain HTML Reporter**

- **Action:** Keep `html` reporter alongside JSON reporter
- **Rationale:** Developers still get visual test report; enables manual failure inspection
- **Output Location:** `playwright-report/` (unchanged)
- **Scope:** Configuration change only (additive)

**Step 3: Configure JSON Reporter Options**

- **Action:** Set JSON reporter to include:
  - `outputFile` explicitly set to `test-results/results.json`
  - Full test metadata (title, file, browser, status, duration, retries)
- **Rationale:** Explicit configuration prevents accidental changes; consistent output location
- **Scope:** Configuration change only

---

### Phase 2: Trace Collection Enhancement (Steps 4–5)

Improve diagnostics for all failures, not just retried failures

**Step 4: Evaluate Trace Policy Options**

- **Current:** `trace: 'on-first-retry'` (traces only if test fails and then retries)
- **Options to consider:**
  - `trace: 'on-all-retries'` — Traces every retry attempt (verbose)
  - `trace: 'retain-on-failure'` — Traces all failures, retried or not (balanced)
  - `trace: 'always'` — All tests traced (high resource cost)
  - Conditional per-browser/per-project (advanced)
- **Decision Point:** Select policy based on:
  - Resource cost vs. diagnostic value
  - Current CI infrastructure capacity
  - Storage/reporting requirements
- **Scope:** Configuration change only (decision pending)

**Step 5: Implement Trace Policy Update**

- **Action:** Modify `use.trace` value in `playwright.config.js`
- **Rationale:** Capture traces for systematic (non-retried) failures to close diagnostics gap
- **Consideration:** May increase report size; requires storage planning
- **Scope:** Configuration change only

---

### Phase 3: Execution & Metrics Collection (Steps 6–8)

Run tests and gather baseline data

**Step 6: Execute Tests Multiple Times to Establish Baseline**

- **Action:** Run full test suite (all browsers) minimum 5 times locally and 5 times in CI environment
- **Rationale:**
  - Captures variance in test behavior
  - Identifies which tests are consistently failing vs. flaky
  - Establishes pass rate baseline (first attempt, after retries)
- **Data Points Collected:**
  - First-attempt pass rate per test
  - Retry success rate (failures that pass on retry)
  - Browser-specific pass rates (Chromium, Firefox, WebKit)
  - Test duration (min, max, avg)
- **Scope:** Execution only (no code changes)

**Step 7: Parse JSON Reports to Extract Failure Categorization**

- **Action:** Analyze `test-results/results.json` across all runs
- **Extraction Method:** (Design only—no code written yet)
  - Group failures by type: `Error` message patterns
  - Categorize: timeout, assertion, network, element not found, etc.
  - Count failures per category
  - Calculate retry success rate per category
- **Output Format:** (Summary only—not implemented yet)
  - Failure distribution: 40% network, 30% assertion, 20% timeout, 10% other
  - Retry effectiveness: "70% of network failures pass on retry; 5% of assertion failures"
  - High-flakiness tests identified by name
- **Scope:** Analysis and data extraction planning only

**Step 8: Compile Baseline Metrics Report**

- **Action:** Create summary document of findings
- **Contents:**
  - Overall first-pass rate (target: >95%)
  - Failure categorization distribution
  - Per-test flakiness profile
  - Per-browser stability comparison
  - CI vs. local pass rate comparison
  - Retry effectiveness validation
- **Location:** `docs/rpi/metrics-baseline-<date>.md`
- **Scope:** Documentation and reporting (no code)

---

### Phase 4: Analysis & Recommendations (Step 9)

Validate current retry policy and recommend optimizations

**Step 9: Validate Retry Policy Effectiveness**

- **Analysis Questions:**
  - Is 2 retries sufficient? (Do failures still occur after 2 retries?)
  - Are retries effective? (What % of failures do retries fix?)
  - Is retry count optimal by browser?
  - Is retry count optimal by failure type?
  - Should local (0 retries) policy be adjusted?
- **Decision Framework:** If metrics show:
  - > 90% first-pass rate → Retry policy effective; no change needed
  - <90% first-pass rate but >95% after retries → Current policy adequate
  - <95% after retries → Consider increasing retry count or addressing root causes
  - Uneven browser stability → Recommend per-browser retry tuning (future phase)
- **Output:** Recommendation document with evidence
- **Scope:** Analysis and planning; no implementation

---

## ACCEPTANCE CRITERIA

### Configuration Acceptance (Steps 1–5)

- [ ] JSON reporter configured and produces valid `test-results/results.json` on each run
- [ ] HTML reporter still functions; no test output breaks
- [ ] Both reporters work in local and CI environments
- [ ] Trace collection policy updated; no errors during trace collection
- [ ] No test failures introduced by configuration changes alone

### Data Collection Acceptance (Steps 6–8)

- [ ] Minimum 5 test runs completed locally (all 3 browsers, 2 tests = 30 total test executions)
- [ ] Minimum 5 test runs completed in CI environment (or simulated via `CI=true npm test`)
- [ ] JSON reports successfully parsed from all runs
- [ ] Failure categorization completed; each failure classified by type
- [ ] Metrics report contains:
  - First-pass rate (%)
  - Retry success rate (%)
  - Failure distribution by category (chart/table)
  - Per-test flakiness profile
  - Per-browser comparison (Chromium, Firefox, WebKit)

### Analysis Acceptance (Step 9)

- [ ] Retry policy validation completed with evidence
- [ ] Clear recommendation produced (e.g., "No change needed" or "Increase to 3 retries if <85% pass rate persists")
- [ ] Next improvement opportunity identified (e.g., conditional retry logic for network failures)

---

## ROLLBACK CRITERIA

### Immediate Rollback (If Critical Issues)

**Trigger:** Tests fail to run after any configuration change

**Rollback Steps:**

1. Revert `playwright.config.js` to last committed version
2. Verify `npm test` runs without errors
3. Confirm HTML report generation works
4. Delete `test-results/results.json` if it contains invalid data

**Timeline:** <5 minutes

---

### Configuration Rollback (If Trace Collection Issues)

**Trigger:** Trace collection causes CI timeout or disk exhaustion

**Rollback Steps:**

1. Change `trace` policy back to `'on-first-retry'`
2. Clear accumulated trace files: `rm -r test-results/traces-*` (or equivalent on Windows)
3. Re-run tests to verify stability
4. Revert file to git if committed

**Timeline:** <15 minutes

---

### Metrics Rejection (If Analysis Invalid)

**Trigger:** Baseline metrics insufficient for decision-making (<5 runs completed, failure categorization incomplete)

**Fallback:**

- Run additional test iterations to increase confidence
- Document limitations in metrics report
- Proceed to next phase with caveat: "Recommendations subject to validation with larger dataset"

**Timeline:** Extendable; no hard stop

---

## SUCCESS DEFINITIONS

### Success (Go to Implementation)

- ✅ Configuration changes applied without breaking tests
- ✅ Baseline flakiness metrics collected (first-pass rate, retry effectiveness)
- ✅ Failure categorization completed (>80% of failures classified)
- ✅ Retry policy validated:
  - Current 2 retries adequate (>95% pass rate after retries), OR
  - Clear recommendation for change (increase to N retries, add conditional logic, etc.)
- ✅ Metrics report produced and approved for next phase

### Partial Success (Additional Work Needed)

- ⚠️ Configuration applied but trace overhead too high
  - **Action:** Revert trace policy; continue with basic metrics
  - **Impact:** Slightly reduced diagnostics; still valuable for retry analysis
- ⚠️ Only 2–3 baseline runs completed
  - **Action:** Document sample size limitation; proceed with caveat
  - **Impact:** Recommendations carry lower confidence

### Failure (Halt and Reconsider)

- ❌ Configuration changes break test execution
  - **Action:** Full rollback; halt improvement effort
  - **Decision:** Investigate configuration issue before retry
- ❌ JSON reporter fails or produces invalid output consistently
  - **Action:** Rollback reporter; document issue for Playwright troubleshooting
  - **Decision:** Alternative metrics approach needed

---

## TIMELINE & RESOURCE REQUIREMENTS

### Effort Breakdown

- **Configuration Setup (Steps 1–5):** 30–60 minutes
  - Reading Playwright reporter docs
  - Editing `playwright.config.js`
  - Validating reporter output
- **Test Execution & Data Collection (Steps 6–8):** 2–4 hours
  - Running tests 5× locally (15 mins per run = 75 mins)
  - Running tests 5× in CI or simulated CI (may run in parallel)
  - Parsing JSON reports
  - Organizing failure data

- **Analysis & Reporting (Step 9):** 1–2 hours
  - Analyzing metrics against questions
  - Generating recommendations
  - Writing baseline metrics report

**Total Estimated Effort:** 4–7 hours

### Resources Required

- **Human:** Engineer with Playwright familiarity (can be developer or QA)
- **Infrastructure:**
  - Local machine (Windows, as specified)
  - Access to CI environment (or simulation via `CI=true` env var)
  - Disk space for traces and reports (~100–500 MB depending on trace policy)

### Parallel Work Possible

- Steps 1–5 (configuration) should be sequential (affects test execution)
- Steps 6–8 (data collection) can run in parallel on local and CI (separate machines)
- Step 9 (analysis) awaits completion of earlier steps

---

## DEPENDENCIES & ASSUMPTIONS

### Dependencies

- Playwright @1.44.0 installed and functional (prerequisite)
- `npm test` command working in current environment
- Ability to run tests 10+ times and collect output

### Assumptions

- **Valid Baseline Needed:** 5 runs per environment is sufficient to identify patterns
- **No Test Changes:** Tests themselves will not be modified; only configuration
- **Storage Available:** ~200 MB disk space available for test results and traces
- **No CI Secrets Required:** Metrics collection uses existing CI environment (no new secrets needed)

---

## NEXT PHASES (BLOCKED UNTIL THIS PLAN COMPLETES)

Once baseline metrics and failure categorization are established, the following improvements become actionable:

1. **Conditional Retry Logic** (requires failure category data from this phase)
   - Retry only network/timeout failures
   - Skip retries for assertion failures
   - Expected impact: Faster CI feedback, fewer wasted retries

2. **Exponential Backoff** (optional enhancement)
   - Add delay between retry attempts
   - May improve transient failure recovery
   - Requires retry effectiveness validation from this phase

3. **Per-Browser Tuning** (requires per-browser stability data from this phase)
   - Customize retry count by browser if flakiness varies
   - May reduce CI time if some browsers are reliably stable

4. **Failure Tracking Dashboard** (requires continuous metrics from this phase)
   - Implement ongoing flakiness monitoring
   - Identify regressions over time

---

## APPROVAL GATE

**This Plan is Ready for Implementation When:**

- ✅ Research artifact reviewed and approved (`docs/rpi/research/retry-stability-improvement.md`)
- ✅ This Plan reviewed and approved by stakeholder
- ✅ Resource commitment confirmed (4–7 hours)
- ✅ No scope expansion requests beyond Steps 1–9

**Changes Requiring Plan Revision:**

- Adding code changes to tests (violates scope)
- Adding CI/CD pipeline changes (future phase)
- Adding new dependencies or tools (not included in design)
