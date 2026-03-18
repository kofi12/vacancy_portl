# Business Rules

This document captures domain-level constraints and behaviors for current entities.

## How To Use This Document

- Keep rules implementation-agnostic: describe *what must be true*, not controller/service details.
- Write each rule in testable form: "Given/When/Then" or clear precondition + expected outcome.
- Mark uncertain rules as `TBD` and include an owner or question.
- If a rule changes, update this document before code changes are merged.

## Rule Template (Copy Per Entity)

```md
### EntityName

#### Invariants (always true)
- [ ] RULE_ID: Statement

#### Lifecycle rules (create/update/delete)
- [ ] RULE_ID: Statement

#### Relationship rules (cross-entity)
- [ ] RULE_ID: Statement

#### State transitions (if applicable)
- [ ] RULE_ID: From X -> Y only when ...

#### Open questions / TBD
- [ ] TBD: Question
```

## Implementation Owners

- `Entity`: invariant can be enforced with only this entity's own fields/state.
- `DomainService`: rule requires other aggregates, repositories, or workflow checks.
- `Policy`: authorization/permission decision.
- `DB`: database-level integrity/uniqueness/referential backstop.

## Proposed Rules From Current Entities

### Organization

#### Invariants

- [ ] ORG-001: `name` is required and cannot be blank. (Owner: Entity)
- [ ] ORG-002: `ownerId` is required on organization creation. (Owner: Entity)
- [ ] ORG-003: `orgId` must generated on creation. (Owner: DomainService, DB)

#### Lifecycle rules

- [ ] ORG-004: `createdAt` is set once at creation and cannot be rewritten by clients. (Owner: Entity, DomainService)
- [ ] ORG-005: `updatedAt` changes whenever mutable organization fields change. (Owner: Entity, DomainService)

#### Relationship rules

- [ ] ORG-006: `ownerId` must reference an existing user whose role is `owner`. (Owner: DomainService, DB)
- [ ] ORG-007: There is exactly one owner for an organization at any point in time. (Owner: DomainService, Policy, DB)

#### Open questions / TBD

- [ ] TBD-ORG-001: Can ownership transfer, and if yes, what audit trail is required?

### User

#### Invariants

- [ ] USR-001: `fullName` is required and cannot be blank. (Owner: Entity)
- [ ] USR-002: `email` is required and unique within an organization. (Owner: Entity, DB)
- [ ] USR-003: `role` must be one of `owner`, `admin`, or `rp`. (Owner: Entity)
- [ ] USR-004: Authentication fields are all-or-none: if `authProvider` is set, `authSubject` must also be set. (Owner: Entity)

#### Lifecycle rules

- [ ] USR-005: `createdAt` is set by the system on create. (Owner: DomainService)
- [ ] USR-006: `updatedAt` is null until first update, then set by the system. (Owner: DomainService)
- [ ] USR-007: Role can only be changed by `admin`. (Owner: Policy, DomainService)

#### Relationship rules

- [ ] USR-008: Only `owner` user owns an organization (`orgId` is nullable otherwise). (Owner: DomainService, Policy)
- [ ] USR-009: Only one `owner` role is allowed per organization. (Owner: DomainService, DB)

#### Open questions / TBD

- [ ] TBD-USR-001: Is email globally unique across all organizations or only per organization?

### Rcf

#### Invariants

- [ ] RCF-001: `name` is required and cannot be blank. (Owner: Entity)
- [ ] RCF-002: `licensedBeds` must be greater than 0. (Owner: Entity, DB)
- [ ] RCF-003: `currentOpenings` must be greater than or equal to 0. (Owner: Entity, DB)
- [ ] RCF-004: `currentOpenings` cannot exceed `licensedBeds`. (Owner: Entity)

#### Lifecycle rules

- [ ] RCF-005: New facilities default to `isActive = true` unless explicitly disabled. (Owner: Entity, DomainService)
- [ ] RCF-006: Inactive facilities cannot accept new applications. (Owner: DomainService)

#### Relationship rules

- [ ] RCF-007: `orgId` must reference an existing organization. (Owner: DomainService, DB)
- [ ] RCF-008: Facility names are unique within an organization. (Owner: DomainService, DB)

#### Open questions / TBD

- [ ] TBD-RCF-001: Should reducing `licensedBeds` below active occupancy be blocked?

### RcfForm

#### Invariants

- [ ] RCFORM-001: `fileName`, `title`, and `storageKey` are required. (Owner: Entity)
- [ ] RCFORM-002: `formType` must be one of `INTAKE_FORM`, `SCHEDULE_20`, `CUSTOM`. (Owner: Entity)
- [ ] RCFORM-003: `contentType` must be one of allowed values (`application/pdf`, `application/json`, `application/zip`, `multipart/form-data`). (Owner: Entity)

#### Lifecycle rules

- [ ] RCFORM-004: A form template cannot be deleted if referenced by active workflows unless replacement is provided. (Owner: DomainService)
- [ ] RCFORM-005: Updating `formType` for an existing template may require a migration strategy. (Owner: DomainService)

#### Relationship rules

- [ ] RCFORM-006: `rcfId` must reference an existing RCF. (Owner: DomainService, DB)
- [ ] RCFORM-007: `ownerId` must reference an authorized user for that RCF's organization. (Owner: Policy, DomainService, DB)

#### Open questions / TBD

- [ ] TBD-RCFORM-001: Is `storageKey` globally unique or unique per RCF?

### Application

#### Invariants

- [ ] APP-001: `rcfId`, `applicantId`, and `rpId` are required. (Owner: Entity)
- [ ] APP-002: `status` must be one of `SUBMITTED` or `PENDING` (expand when workflow is defined). (Owner: Entity)
- [ ] APP-003: `submittedAt` is required when status is `SUBMITTED`. (Owner: Entity)

#### Lifecycle rules

- [ ] APP-004: Application starts in `PENDING` or `SUBMITTED` based on workflow entry point. (Owner: DomainService)
- [ ] APP-005: `submittedAt` is immutable after submission. (Owner: Entity, DomainService)
- [ ] APP-006: `createdAt` is set once by the system; `updatedAt` changes on every mutation. (Owner: DomainService)


#### State transitions

- [ ] APP-007: `PENDING -> SUBMITTED` is allowed when required documents are complete. (Owner: DomainService)
- [ ] APP-008: `SUBMITTED -> PENDING` is not allowed unless explicitly reopening workflow exists. (Owner: DomainService, Policy)

#### Relationship rules

- [ ] APP-009: `applicantId` must reference an existing applicant/user. (Owner: DomainService, DB)
- [ ] APP-010: `rpId` must reference a valid `rp` user. (Owner: DomainService, Policy, DB)
- [ ] APP-011: `rcfId` must reference an active RCF for new submissions. (Owner: DomainService, DB)

#### Open questions / TBD

- [ ] TBD-APP-001: Are duplicate active applications for the same applicant + RCF allowed?

### ApplicationDocument

#### Invariants

- [ ] APPDOC-001: `applicantId`, `applicationId`, `type`, `originalFileName`, and `contentType` are required. (Owner: Entity)
- [ ] APPDOC-002: `type` must be one of `INTAKE`, `SCHEDULE_20`, `CUSTOM`. (Owner: Entity)
- [ ] APPDOC-003: `contentType` must be in the allowlist. (Owner: Entity)
- [ ] APPDOC-004: `storageKey` must be created on appdoc upload. (Owner: DomainService)

#### Lifecycle rules

- [ ] APPDOC-005: `storageKey` is immutable after upload. (Owner: Entity, DomainService)
- [ ] APPDOC-006: Re-upload behavior must either version documents or replace atomically. (Owner: DomainService)

#### Relationship rules

- [ ] APPDOC-007: `applicationId` must reference a compatible template/form for the same RCF/app flow. (Owner: DomainService, DB)
- [ ] APPDOC-008: `applicantId` must reference an existing applicant/user. (Owner: DomainService, DB)

#### Open questions / TBD

- [ ] TBD-APPDOC-001: Should we allow multiple documents per template type per application?

## Validation Checklist (Before Marking Rules Confirmed)

- [ x ] Every ID field has existence and scope rule (global or per-org uniqueness clarified).
- [ x ] Every enum has allowed values and transition constraints documented.
- [ x ] Every timestamp field has a source-of-truth rule (system-set vs client-set).
- [ x ] Every cross-entity relationship has referential and authorization constraints.
- [ x ] Every mutable field has update permissions and audit expectations.

## Implementation Matrix

| Owner | Implement in code | Typical examples | Test type |
| --- | --- | --- | --- |
| `Entity` | Domain entity constructor/factory and mutation methods in `backend/src/domain/entities/*` | required fields, ranges, enum guards, immutable-after-set | unit tests against entity class |
| `DomainService` | Use-case/domain service layer (or application service orchestrating repositories) | cross-entity existence checks, workflow conditions, state transitions | service/use-case tests with repository fakes |
| `Policy` | Authorization policy/guard checks invoked by use-cases | role-based permissions (`admin` only, `rp` only) | authorization tests (allow/deny matrix) |
| `DB` | Migration/schema constraints and indexes | foreign keys, `NOT NULL`, unique composite indexes | integration tests against real DB constraints |

## Rule-To-Code Mapping Template

Use this table while implementing each rule to track completion.

| Rule ID | Owner(s) | Target code location | Target test | Status |
| --- | --- | --- | --- | --- |
| `APP-001` | Entity | `Application` constructor/factory guard | `application.entity.spec.ts` | `Todo` |
| `APP-007` | DomainService | `SubmitApplication` use-case preconditions | `submit-application.usecase.spec.ts` | `Todo` |
| `APP-010` | DomainService, Policy, DB | submit use-case + role policy + FK to `users` | use-case + policy + DB integration | `Todo` |

## Application Rules: Concrete Mapping

Current codebase note: only entity files exist right now. Proposed paths below are intended next-step locations.

| Rule ID | Owner(s) | Target code location | Target test | Status |
| --- | --- | --- | --- | --- |
| `APP-001` | Entity | `backend/src/domain/entities/application.ts` (constructor/factory required-field guards) | `backend/src/domain/entities/application.spec.ts` | `Todo` |
| `APP-002` | Entity | `backend/src/domain/entities/application.ts` (status enum/guard) | `backend/src/domain/entities/application.spec.ts` | `Todo` |
| `APP-003` | Entity | `backend/src/domain/entities/application.ts` (`submittedAt` required when submitted) | `backend/src/domain/entities/application.spec.ts` | `Todo` |
| `APP-004` | DomainService | `backend/src/domain/services/application/create_application.ts` (initial status policy) | `backend/src/domain/services/application/create_application.spec.ts` | `Todo` |
| `APP-005` | Entity, DomainService | `backend/src/domain/entities/application.ts` + `backend/src/domain/services/application/update_application.ts` | `application.spec.ts` + `update_application.spec.ts` | `Todo` |
| `APP-006` | DomainService | `backend/src/domain/services/application/create_application.ts` and `update_application.ts` (timestamp assignment) | use-case tests for create/update timestamps | `Todo` |
| `APP-007` | DomainService | `backend/src/domain/services/application/submit_application.ts` (document completeness check) | `submit_application.spec.ts` | `Todo` |
| `APP-008` | DomainService, Policy | `backend/src/domain/services/application/reopen_application.ts` + `backend/src/domain/policies/application_policy.ts` | reopen allow/deny tests | `Todo` |
| `APP-009` | DomainService, DB | `create_application.ts` repository existence check + DB FK `applications.applicant_id -> users.id` | use-case failure test + DB integration test | `Todo` |
| `APP-010` | DomainService, Policy, DB | `create_application.ts` (`rp` role validation) + `application_policy.ts` + DB FK `applications.rp_id -> users.id` | role validation tests + DB integration test | `Todo` |
| `APP-011` | DomainService, DB | `create_application.ts` (`rcf` active check) + DB FK `applications.rcf_id -> rcfs.id` | inactive-rcf rejection test + DB integration test | `Todo` |

## Suggested Implementation Order (Current Priority)

1. `Entity` rules first: fail fast on invalid state creation/mutation.
2. `DomainService` rules second: enforce cross-entity and workflow constraints.
3. `Policy` rules third: lock down who can perform each action.
4. `DB` rules last (but before production): add hard integrity safety nets.

## DB Constraints Starter Checklist

- [ ] Add FK: `applications.rcf_id -> rcfs.id`
- [ ] Add FK: `applications.applicant_id -> users.id`
- [ ] Add FK: `applications.rp_id -> users.id`
- [ ] Add FK: `rcfs.org_id -> organizations.id`
- [ ] Add FK: `rcf_forms.rcf_id -> rcfs.id`
- [ ] Add FK: `rcf_forms.owner_id -> users.id`
- [ ] Add FK: `application_documents.application_id -> applications.id`
- [ ] Add FK: `application_documents.applicant_id -> users.id`
- [ ] Add unique index candidate: `users(org_id, email)`
- [ ] Add unique index candidate: `rcfs(org_id, name)`
