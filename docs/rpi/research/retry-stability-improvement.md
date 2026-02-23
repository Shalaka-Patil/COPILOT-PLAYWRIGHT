# Research: Retry Stability Improvement

**Objective:** Analyze current retry behavior, flakiness patterns, and stability gaps to identify improvement opportunities

**Date:** February 23, 2026  
**Scope:** Playwright test retry configuration and stability characteristics

---

## FACTS

### Current Retry Configuration

- **Local Execution:** `retries: 0`
  - Tests fail immediately on first failure
  - No automatic retry mechanism
  - Feedback is fast but may mask transient issues
- **CI Execution:** `retries: 2` (when `process.env.CI` is set)
  - Failed tests automatically retry up to 2 times
  - Serial execution (`workers: 1`) during retries
  - Trace collection enabled (`trace: 'on-first-retry'`)
- **Global Retry Policy:** Single numeric value (no per-test or per-browser overrides)
  - All test failures trigger same retry logic
  - No conditional retry based on failure type
  - No exponential backoff (immediate retries)

### Retry Mechanics (Playwright @1.44.0)

- **Retry Timing:** Immediate (no delay between attempts)
- **Browser Reuse:** New browser context for each retry attempt (with trace collection)
- **Worker Management:** CI switches to serial to reduce resource contention
- **Test Isolation:** Two external URL tests against `https://playwright.dev` (minimal isolation concerns)

### Test Configuration & Waiting Patterns

- **Implicit Waits:** Playwright auto-retries assertions (30s default timeout)
- **No Explicit Waits:** Tests use only `getByRole()` and basic `expect()` assertions
- **No Fixed Waits:** No `page.waitForTimeout()` calls in current tests
- **No Test-Level Timeout Overrides:** Tests use default 30s timeout

### Test Suite Characteristics

- **Test Count:** 2 tests only (limited data for stability analysis)
- **Test Types:** External web navigation tests (network-dependent, not app-dependent)
- **Browser Coverage:** 3 projects (Chromium, Firefox, WebKit)
- **Total Test Combinations:** 6 (2 tests × 3 browsers) per run
- **Execution Model:**
  - Local: Fully parallel (unlimited workers)
  - CI: Serial execution

### Documented Standards

- **Guideline:** "Tests must be reliable" and "prevent brittleness through design"
- **Anti-pattern:** Hard timeouts (`page.waitForTimeout()`) detected as non-deterministic
- **Recommended:** Implicit waits via meaningful locators (`getByRole > getByLabel > getByTestId > locator`)
- **Per-test Control:** Per-test timeout override supported via `test.setTimeout()`

### Current Failure Diagnostics

- **Trace Collection:** Enabled for first retry only (`trace: 'on-first-retry'`)
- **Trace Output:** Stored in `test-results/` (not explicitly configured, using defaults)
- **Reporter:** HTML report only (no JSON/XML for structured parsing)
- **Test Results Directory:** Exists with `.last-run.json` artifact

---

## ASSUMPTIONS

### Retry Strategy Intent

1. **Transient Failure Hypothesis:** Current 2-retry policy assumes most CI failures are transient:
   - Network timeouts or DNS resolution issues
   - Resource contention in CI environment
   - Race conditions in page navigation
   - Assumption is valid for external URL tests but not verified for internal app tests

2. **Local vs. CI Differentiation:** Zero retries locally assumes:
   - Developers want immediate feedback on test failures
   - Developer machines have better resource isolation than CI
   - False passes via retries are less desirable than delayed feedback locally

3. **Serial CI Execution:** Single worker in CI assumes:
   - Parallel test execution causes interference (browser resource exhaustion, shared state)
   - Project lacks sophisticated test isolation (fixtures, cleanup)
   - Test failure rate increases under parallel load

4. **Trace-on-Retry Effectiveness:** `on-first-retry` policy assumes:
   - Tracing overhead is significant enough to warrant selective collection
   - First failures are often environment-specific and not worth tracing
   - Failure on retry indicates real instability worth diagnostics

### Development Practices

1. Developers run local tests frequently (0 retries provides fast feedback)
2. Failing tests in CI are investigated via HTML report and traces
3. Flaky tests are expected and acceptable (2 retries provides tolerance)
4. No systematic tracking of which tests fail vs. which retry successfully

### Test Dependency Assumptions

1. External URL tests (`playwright.dev`) are stable in most environments
2. Network connectivity is the primary failure source, not test logic
3. 30-second Playwright timeout is appropriate for all test operations
4. Browser-specific flakiness is negligible (same retry count for all)

---

## UNKNOWNS

### Stability Metrics (Critical Missing Data)

1. **First-Attempt Pass Rate:** What percentage of tests pass on first attempt?
   - Current test suite: Unknown (2 tests insufficient for statistical significance)
   - CI environment: Unknown
   - Local environment: Unknown

2. **Retry Success Rate:** Of tests that fail initially, what percentage pass on retry?
   - Indicates transient vs. systematic failures
   - Missing this data prevents validation of current 2-retry policy

3. **Flakiness Distribution:**
   - Which specific tests exhibit flakiness?
   - Do certain tests fail more often than others?
   - Is flakiness concentrated in particular test suites or distributed?

4. **Browser-Specific Stability:**
   - Does Chromium have different failure rates than Firefox/WebKit?
   - Are certain browsers inherently flakier on this project's targets?
   - Should retry counts differ by browser?

5. **CI vs. Local Variance:**
   - Do tests fail more frequently in CI than locally?
   - What is the failure rate ratio (CI/local)?
   - What are the gap causes (network latency, resource limits, etc.)?

### Time & Resource Characteristics

1. **Test Duration Baseline:**
   - P50/P95/P99 execution time for each test?
   - Total suite runtime locally vs. CI?
   - Impact of serial vs. parallel execution on duration?

2. **Retry Overhead:**
   - How much additional time do 2 retries add on average?
   - What is the cost when 0 retries fail (local) vs. 2 retries succeed (CI)?
   - Total CI feedback latency with retries vs. without?

3. **Trace Collection Cost:**
   - CPU/memory impact of `trace: 'on-first-retry'`?
   - Disk space consumed per trace?
   - Report generation time with trace data?

4. **Resource Contention in CI:**
   - Why does serial execution improve stability (if it does)?
   - What resource is contended (CPU, memory, file descriptors)?
   - Would 2 workers + retries be better than 1 worker + retries?

### Failure Pattern Analysis

1. **Transient vs. Systematic:**
   - What percentage of failures are environment-dependent vs. test-logic-dependent?
   - Can transient failures be detected and handled differently?
   - Are systematic failures masked by retries?

2. **Failure Categories:**
   - Network failures: DNS, timeout, connection reset
   - Element not found / visibility failures
   - Assertion failures with correct values
   - Timeout failures (assertion doesn't complete in time)
   - Browser crashes / context errors
   - Other categories?

3. **Retry Timing Effectiveness:**
   - Are immediate retries effective, or do failures need cooldown/backoff?
   - Should retry delay increase with retry count?
   - Does exponential backoff improve stability?

### Enhancement Viability

1. **Conditional Retry Logic:**
   - Could specific failure types trigger conditional retries?
   - Example: Network errors retry; assertion failures don't?
   - Example: Timeouts retry; element not found doesn't?

2. **Per-Test Tuning:**
   - Should slow/flaky tests have higher retry counts?
   - Should priority tests (critical paths) have more aggressive retries?
   - Is per-test override usage viable?

3. **Browser-Specific Strategies:**
   - Should each browser have its own retry count?
   - Should certain browsers skip problematic test subsets?

---

## RISKS

### High Priority

1. **Silent Failures Via Retries (Flakiness Masking)**
   - **Issue:** 2 retries in CI may cause real failures to pass without root cause identification
   - **Consequence:** Technical debt accumulates; underlying instability not addressed
   - **Evidence:** No flakiness tracking; unclear if tests actually stabilize or just retry through failures
   - **Impact:** False confidence in test suite; production risk if flaky code ships

2. **Zero Retries Locally May Cause Developer Frustration**
   - **Issue:** Developers encounter test failures locally that pass in CI (via retries)
   - **Consequence:** Reduced dev velocity; "works in CI" phenomenon
   - **Evidence:** Local and CI environments differ (single worker vs. parallel)
   - **Impact:** Wasted developer time debugging retried failures; trust erosion

3. **No Failure Categorization for Intelligent Retries**
   - **Issue:** All failures trigger identical 2-retry response (network timeouts treated same as assertion failures)
   - **Consequence:** Retrying non-transient failures (assertion bugs) wastes time; missing retries on network flakiness
   - **Evidence:** No error detection/classification in config
   - **Impact:** Suboptimal retry efficiency; longer CI times; missed real failures

### Medium Priority

4. **Single Retry Count Across 3 Browsers (Potential Over/Under-Retrying)**
   - **Issue:** All browsers retry equally (2×) regardless of individual flakiness profiles
   - **Consequence:** One browser may be inherently flakier but not addressed; another may be over-retried
   - **Evidence:** No per-browser stability data collected
   - **Impact:** Inefficient CI resource usage; some browsers tolerate more failures than others

5. **Immediate Retry With No Backoff (May Exacerbate Transient Issues)**
   - **Issue:** Retries happen immediately after failure (no delay)
   - **Consequence:** Network timeouts retry immediately into same congestion; race conditions retry into same state
   - **Evidence:** Playwright default behavior; no explicit backoff configured
   - **Impact:** High retry rate; more CI churn; longer feedback time without improving stability

6. **Trace Collection Only on Retry (May Miss First-Failure Diagnostics)**
   - **Issue:** `trace: 'on-first-retry'` means traces only collected if test fails and passes on retry
   - **Consequence:** Systematic failures (that never retry successfully) have no trace; only flaky failures traced
   - **Evidence:** Trace policy misses permanent failures
   - **Impact:** Reduced debugging capability for consistent failures; bias toward transient issue diagnostics

### Low Priority

7. **No Per-Test Timeout Customization Guidance**
   - **Issue:** Tests use default 30s timeout; no visible override examples
   - **Consequence:** Slow operations may timeout prematurely; fast operations may tolerate unnecessary delays
   - **Evidence:** No test-level timeout overrides in codebase
   - **Impact:** May contribute to flakiness if some operations are legitimately slow

8. **CI Environment Detection Fragility**
   - **Issue:** Retry policy depends on `process.env.CI` detection
   - **Consequence:** Non-standard CI systems (missing CI env var) may run with wrong retry count
   - **Evidence:** No validation of CI env var presence
   - **Impact:** Unexpected behavior in alternative CI platforms

---

## EVIDENCE GAPS

### Critical Data Missing

- [ ] **Baseline flakiness metrics:** First-pass rate, retry success rate, pass rate over time
- [ ] **Failure categorization:** Breakdown of failure types (network, timeout, assertion, etc.)
- [ ] **Per-browser stability:** Failure rates by browser (Chromium vs. Firefox vs. WebKit)
- [ ] **CI vs. local comparison:** Pass rates in both environments
- [ ] **Retry effectiveness analysis:** Do retries improve overall pass rate? By how much?

### Diagnostic Data Missing

- [ ] **Test duration profile:** P50/P95/P99 execution times
- [ ] **Trace usage analysis:** Are collected traces actually reviewed? Actionable?
- [ ] **CI resource consumption:** CPU, memory, disk usage during test execution
- [ ] **Network stability metrics:** CI network latency, timeouts, DNS failures
- [ ] **Browser-specific patterns:** Error logs/traces for each browser

### Comparative Data Missing

- [ ] **Immediate retries vs. backoff:** No A/B comparison of retry strategies
- [ ] **2 retries vs. other counts:** Is 2 optimal or arbitrary?
- [ ] **Trace-on-retry vs. always/never:** Impact analysis of trace policies
- [ ] **Serial vs. parallel CI:** Performance/stability comparison under different worker counts

### Process Data Missing

- [ ] **Failure response workflow:** No documented process for investigating failed/retried tests
- [ ] **Flakiness root cause analysis:** No systematic debugging of retry successes
- [ ] **Test ownership:** No tracking of which tests are flaky or who maintains them
- [ ] **Historical trends:** No dashboard/view of pass rates over time

---

## CONCLUSION

The current retry strategy is **functional but unoptimized and unvalidated**:

- ✅ **Valid Baseline:** 2 retries in CI, 0 locally is a reasonable starting point
- ✅ **Correctly Implemented:** Playwright mechanics are properly configured
- ⚠️ **Unvalidated:** No metrics confirm effectiveness; retry count may be arbitrary
- ⚠️ **Not Intelligent:** All failures retry identically; no categorization or backoff
- ❌ **Silent Masking:** Flaky tests can pass on retry without root cause fix
- ❌ **Insufficient Diagnostics:** Traces collected only for retried failures; permanent failures underdiagnosed

**Improvement Opportunities (in priority order):**

1. Establish baseline flakiness metrics and failure categorization
2. Implement conditional retry logic (e.g., network errors retry; assertion failures don't)
3. Add exponential backoff between retries to improve transient failure handling
4. Expand trace collection to always-trace or trace-all-failures (not just on-retry)
5. Implement per-browser or per-test retry count customization based on actual stability data
6. Add failure analysis and reporting to track which tests are consistently flaky

**Next Steps for Planning Stage:**

- Define which improvement to tackle first (quick win vs. strategic impact)
- Establish metrics collection to baseline current stability
- Design retry enhancement with clear acceptance criteria
- Plan rollback strategy for any retry policy changes
