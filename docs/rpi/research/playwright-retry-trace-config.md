# Research: Playwright Retry and Trace Configuration

**Objective:** Analyze current retry and trace configuration to identify gaps, risks, and optimization opportunities

**Date:** February 23, 2026

---

## FACTS

### Current Configuration (playwright.config.js)

- **Retry Policy:**
  - Local execution: `retries: 0`
  - CI execution: `retries: 2` (conditional on `process.env.CI`)
- **Trace Collection:** `trace: 'on-first-retry'`
  - Traces collected only when test fails and retries
  - Applied globally to all test execution contexts
- **Reporter:** `html` (single reporter)
- **Parallelization:**
  - Local: `fullyParallel: true`, `workers: undefined` (unbounded)
  - CI: `workers: 1` (serial execution)

### Documented Standards (playwright.instructions.md)

- **Local:** 0 retries, unlimited parallel, immediate feedback
- **CI:** 2 retries, serial execution, trace on first failure
- **Per-test timeout override:** Supported via `test.setTimeout()`
- **Trace behavior:** Described as "trace on first failure" in docs

### Test Suite Characteristics

- **Test Count:** 2 tests in single file (example.spec.js)
- **Test Types:** External URL tests against playwright.dev (no internal app tests)
- **Test Duration:** Unknown (not yet profiled)
- **Browser Coverage:** 3 projects (Chromium, Firefox, WebKit)
- **Environment:** Node.js v18+ required

### Test Execution Logs Status

- **Playwright Report:** HTML report directory exists (`playwright-report/`)
- **Test Results:** `test-results/` directory exists
- **Report Index:** `playwright-report/index.html` indicates previous test runs

### Trace Output Configuration

- **Trace Location:** Not explicitly specified in config (defaults to test-results/)
- **Trace Format:** Default value (WASM trace files)
- **Trace Scope:** Global (all projects affected)

---

## ASSUMPTIONS

### Configuration Intent

1. **CI/Local Differentiation:** Retry and trace policies intentionally differ between CI and local dev to:
   - Balance fast local feedback (0 retries) with remote reliability (2 retries)
   - Reduce noise during development while capturing diagnostics in CI

2. **Trace-on-Retry Strategy:** The `on-first-retry` policy assumes:
   - Most failures are environment/race conditions (transient)
   - Tracing overhead is significant enough to warrant selective collection
   - Failed tests retrying indicate flakiness worth capturing

3. **Serial CI Execution:** `workers: 1` in CI assumes:
   - CI environment has resource constraints or cross-test pollution
   - Deterministic pass/fail requires isolation
   - Test parallelism not critical for small test suite

4. **HTML Reporter Sufficiency:** Single `html` reporter assumed adequate for:
   - Test result visualization
   - Trace access alongside test outcomes
   - Debugging failed runs

### Development Practices

1. Developers run tests locally with `npm test` (no CI env var)
2. Traces are reviewed post-mortem for flaky test debugging
3. No explicit test timeout settings beyond Playwright defaults (30s)
4. Test isolation is maintained through Playwright's browser context isolation

---

## UNKNOWNS

### Configuration Gaps

1. **Actual Trace Collection Rate:** What percentage of tests generate traces in CI? (depends on flakiness)
2. **Trace Disk Usage:** How much storage do accumulated traces consume over time?
3. **Trace Usefulness:** Are collected traces actually reviewed/actionable, or accumulated without use?
4. **Test Duration Baseline:** What is P50/P95/P99 test execution time across all tests?
5. **CI Infrastructure:** What are CI environment resource limits, network latency expectations?

### Policy Effectiveness

1. **Retry Adequacy:** Is 2 retries sufficient to catch flakiness or suppress real failures?
2. **False Pass Rate:** How many flaky tests pass on retry without underlying fix?
3. **Timeout Settings:** Are 30s Playwright defaults appropriate for this application?
4. **Network Sensitivity:** How much test flakiness is network-dependent (DNS, latency) vs. app-logic-dependent?

### Browser-Specific Behavior

1. **Browser Flakiness Distribution:** Do specific browsers (Chromium/Firefox/WebKit) show different failure patterns?
2. **Race Condition Patterns:** Are failures random or reproducible within specific browsers?
3. **OS-Level Factors:** Windows-specific test failures in this project (current OS: Windows)?

### Operational Practices

1. **Trace Review Process:** Is there a documented process for reviewing traces from failed tests?
2. **Failure Analysis:** How are transient vs. real failures currently distinguished?
3. **Alerting:** Are CI failures alerted/triaged or silently retried?

---

## RISKS

### High Priority

1. **Silent Failures via Reruns:** Tests passing on retry without root cause identification may mask:
   - Transient race conditions not addressed
   - Environmental issues (timeouts, resource contention)
   - Flaky test logic waiting for non-deterministic outcomes
   - **Impact:** False confidence in test suite reliability; debt accumulates

2. **Trace Overhead Not Quantified:**
   - Trace collection CPU/memory cost unknown
   - Disk space growth unbounded (no retention policy)
   - Report generation time potentially long with large traces
   - **Impact:** CI duration creep; potential storage exhaustion

3. **No Browser-Specific Retry Logic:**
   - All browsers retry equally (2x) regardless of failure patterns
   - Some browsers may be inherently flakier but not addressed
   - **Impact:** Either over-retrying stable browsers or under-retrying flaky ones

### Medium Priority

1. **Policy Documentation Mismatch:**
   - Instructions say "trace on first failure" but config says "on-first-retry"
   - These are subtly different (trace only happens on retry, not all first failures)
   - **Impact:** Confusion for developers; potential debugging gaps

2. **No Timeout Customization Guidance:**
   - Standard 30s timeout may be inappropriate for slow operations
   - No per-test timeout recommendations in guidelines
   - **Impact:** Tests timing out prematurely vs. running too long

3. **Single Reporter Only:**
   - No JSON/XML output for CI integrations (e.g., GitHub Actions annotations)
   - No test metadata (duration, tags, categories) exported
   - **Impact:** Limited visibility in CI/CD pipelines

### Low Priority

1. **Unvalidated CI Detection:**
   - `process.env.CI` check is environment-dependent
   - Different CI systems may not set this variable
   - **Impact:** Configuration inconsistency across CI platforms

2. **Mobile Testing Commented Out:**
   - Mobile/tablet viewport configs commented (not a risk, but feature gap)

---

## EVIDENCE GAPS

### Missing Baseline Metrics

- [ ] Current test pass rate (first attempt vs. after retries)
- [ ] Flakiness heatmap by browser, test, and feature
- [ ] Historical trace usage (are traces reviewed?)
- [ ] Test execution time distribution (min/max/median/p95)
- [ ] CI environment specs (CPU, memory, network latency)

### Missing Configuration Analysis

- [ ] Comparison with Playwright recommended defaults for CI
- [ ] Trace format impact on report generation time
- [ ] Trace retention policy (current: unlimited)
- [ ] Cost/benefit analysis of on-first-retry vs. always/never

### Missing Best Practices Research

- [ ] Enterprise Playwright setups: retry/trace policies
- [ ] Flakiness detection frameworks (e.g., are retries being profiled?)
- [ ] Trace-based debugging workflows in organizations at scale
- [ ] False-pass prevention strategies

### Missing Project Context

- [ ] Expected test suite growth trajectory
- [ ] SLA for CI feedback (how fast must tests complete?)
- [ ] Risk tolerance for shipping flaky tests
- [ ] Known chronic failure sources (if any)

---

## CONCLUSION

The current retry and trace configuration is **minimally functional but unoptimized**:

- ✅ **Correctly Configured:** Retry/trace policies are valid Playwright patterns
- ✅ **Environment-Aware:** Local vs. CI differentiation is correct intent
- ⚠️ **Underdocumented:** Policy effectiveness unknown; trace usage unvalidated
- ⚠️ **Limited Visibility:** No metrics to detect flakiness trends
- ❌ **Missing Safeguards:** No false-pass detection; no trace retention management

**Next Steps for Planning Stage:**

- Establish baseline flakiness metrics (requires test profiling)
- Document trace review process and consumption
- Consider enhanced retry strategies (conditional, exponential backoff)
- Define trace retention and output format policies
- Add per-project/per-test retry overrides if needed
