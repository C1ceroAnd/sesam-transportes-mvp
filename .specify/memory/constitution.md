<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE] → 1.0.0 (initial ratification)
Modified principles: None (first authoring from template)
Added sections: Core Principles (5), Technology Stack, Development Workflow, Governance
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ aligned (Constitution Check section present, no outdated references)
  - .specify/templates/spec-template.md ✅ aligned (user story + requirements structure compatible)
  - .specify/templates/tasks-template.md ✅ aligned (phase structure compatible with MVP-First principle)
Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Date set to first-use date (2026-06-27); confirm with project owner if a
    prior decision date should be used instead.
-->

# Sesam Transportes MVP Constitution

## Core Principles

### I. MVP-First

Every feature MUST be scoped to deliver the smallest independently testable slice of value.
No feature may be built for hypothetical future use. Scope MUST be validated against the
active feature specification before implementation begins. Premature abstractions, generic
frameworks, and "we might need this later" additions are prohibited.

**Why**: This is an MVP; speed-to-validation outweighs architectural elegance. Unused code
is a liability that slows delivery and obscures the product's real requirements.

### II. API-First

All communication between frontend and backend MUST pass through explicitly defined API
contracts (documented in `specs/[feature]/contracts/`). The contract is the source of truth;
implementation conforms to the contract, not the reverse. Contracts MUST be defined before
implementation begins.

**Why**: Transportation management workflows span multiple surfaces (driver apps, dispatch
dashboards, admin panels). Clear contracts enable parallel development and prevent coupling.

### III. Test-Driven for Critical Logic

Transportation business logic (routing, pricing, scheduling, status transitions) MUST be
covered by tests written before implementation. The Red-Green-Refactor cycle is mandatory
for these domains. UI glue code and configuration do not require upfront tests.

**Why**: Errors in routing or scheduling have real-world consequences (missed pickups,
incorrect charges). Tests encode the business rules explicitly and prevent regressions.

### IV. Data Integrity First

Every entity that enters persistent storage MUST be validated at the application boundary
(not only at the UI). Status transitions for transport operations (e.g., order → dispatched
→ in-transit → delivered) MUST be enforced as explicit state machines; free-form status
updates are prohibited.

**Why**: Transportation data drives logistics and billing decisions. Corrupt or inconsistent
state is harder to recover from than a rejected write.

### V. Simplicity — No Speculative Complexity

Three similar code paths are preferable to a premature abstraction. Repository patterns,
event buses, and microservice splits are prohibited until a concrete, current need justifies
them. Complexity MUST be documented in the plan's Complexity Tracking table with a
justification and the simpler alternative that was rejected.

**Why**: MVPs rarely survive contact with production unchanged. Premature architecture
locks in assumptions that turn out to be wrong and slows pivoting.

## Technology Stack

- **Runtime**: Node.js (version per `package.json` engines field or latest LTS)
- **Language**: JavaScript (TypeScript permitted if team already uses it; do not migrate
  mid-project)
- **Testing**: Jest (preferred) or Vitest — one framework, not both
- **API style**: REST unless a specific feature justifies GraphQL; justify in plan.md
- **Database**: MUST be decided per feature; default to a single relational store
  (PostgreSQL or SQLite) unless a documented need for another store exists
- **Frontend**: Framework choice MUST be recorded in the first feature's plan.md and
  locked for the project duration

## Development Workflow

- Features MUST follow the speckit workflow: `/speckit-specify` → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement`
- Every PR MUST reference the feature spec and include a Constitution Check result
- Specs live under `specs/[###-feature-name]/`; source code lives at the repository root
- Commits MUST be atomic: one logical change per commit; squash before merge if needed
- No force-pushes to `main`; use feature branches

## Governance

This constitution supersedes all other development practices and informal agreements.
Amendments MUST:
1. Identify the principle or section being changed and the version bump type
2. Document why the current constitution is insufficient
3. Be applied via `/speckit-constitution` and committed with message
   `docs: amend constitution to vX.Y.Z (<reason>)`

**Versioning policy**:
- MAJOR: Principle removed, renamed, or fundamentally redefined
- MINOR: New principle or section added; material guidance expansion
- PATCH: Wording clarifications, typo fixes, non-semantic refinements

All PRs and code reviews MUST verify compliance with the five Core Principles.
Complexity violations require entries in the plan's Complexity Tracking table before
the PR can be merged.

**Version**: 1.0.0 | **Ratified**: 2026-06-27 | **Last Amended**: 2026-06-27
