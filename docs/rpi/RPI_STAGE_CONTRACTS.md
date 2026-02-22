# RPI Stage Contracts (Mandatory)

All AI-assisted changes must follow RPI methodology.

## Research Contract

Allowed:
- Read code and documentation
- Inspect tests and logs
- Summarize behavior
- Identify risks and unknowns

Not Allowed:
- Writing or modifying code

Required Output Sections:
- Facts
- Assumptions
- Unknowns
- Risks
- Evidence Gaps

Output must be saved to:
docs/rpi/research/<topic>.md


## Plan Contract

Allowed:
- Design implementation steps
- Define scope and boundaries
- Define acceptance and rollback criteria

Not Allowed:
- Writing production or test code

Required Output Sections:
- Impacted Files
- Ordered Steps
- Acceptance Criteria
- Rollback Criteria

Output must be saved to:
docs/rpi/plan/<topic>.md


## Implement Contract

Allowed:
- Code changes aligned strictly to approved plan

Not Allowed:
- Scope expansion
- Opportunistic refactors

Required Output Sections:
- Change Summary
- Executed Commands / Logs
- Test Evidence
- Residual Risks

Output must be saved to:
docs/rpi/implement/<topic>.md