---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Feature Branch**: `NNN-feature-name`
**Input**: Design documents from `relentless/features/NNN-feature/`
**Prerequisites**: spec.md (required), plan.md (required)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US-001, US-002)

<!--
  ============================================================================
  CRITICAL: FORMAT REQUIREMENTS FOR RELENTLESS CONVERTER

  The `relentless convert` command parses this file to create prd.json.
  User stories MUST follow this exact format:

  ### US-XXX: [Title]

  **Description:** As a [role], I want [goal] so that [benefit].

  **Acceptance Criteria:**
  - [ ] Testable criterion 1
  - [ ] Testable criterion 2

  **Dependencies:** None   (or: US-001, US-002 - actual story IDs only!)
  **Phase:** Stories       (Setup, Foundation, Stories, or Polish)
  **Priority:** P1         (P1, P2, P3 etc.)
  **Status:** pending      (pending, in_progress, complete, deferred)

  **Implementation Tasks:**
  - [ ] T001 [US-XXX] Task description

  IMPORTANT:
  - Dependencies MUST be "None" or valid story IDs (e.g., "US-001")
  - Do NOT use phase names like "Phase 1" as dependencies
  - Task labels use 3-digit format: [US-001] not [US1]
  ============================================================================
-->

---

## Phase 1: Setup

**Purpose**: Project initialization and shared infrastructure

- [ ] T001 [P] Setup task 1
- [ ] T002 [P] Setup task 2
- [ ] T003 Setup task 3 (depends on T001, T002)

**Checkpoint**: Infrastructure ready - user story implementation can begin

---

## Phase 2: User Stories

### US-001: [First User Story Title]

**Description:** As a [role], I want [goal] so that [benefit].

**Acceptance Criteria:**
- [ ] Criterion 1 (specific, testable)
- [ ] Criterion 2 (specific, testable)
- [ ] Typecheck passes (`bunx tsc --noEmit`)
- [ ] Lint passes (`bun run lint`)

**Dependencies:** None
**Phase:** Stories
**Priority:** P1
**Status:** pending

**Implementation Tasks:**
- [ ] T004 [P] [US-001] First implementation task
- [ ] T005 [US-001] Second implementation task
- [ ] T006 [US-001] Third implementation task

---

### US-002: [Second User Story Title]

**Description:** As a [role], I want [goal] so that [benefit].

**Acceptance Criteria:**
- [ ] Criterion 1 (specific, testable)
- [ ] Criterion 2 (specific, testable)
- [ ] Typecheck passes
- [ ] Lint passes

**Dependencies:** None
**Phase:** Stories
**Priority:** P1
**Status:** pending

**Implementation Tasks:**
- [ ] T007 [P] [US-002] First implementation task
- [ ] T008 [US-002] Second implementation task

---

### US-003: [Third User Story Title]

**Description:** As a [role], I want [goal] so that [benefit].

**Acceptance Criteria:**
- [ ] Criterion 1 (specific, testable)
- [ ] Criterion 2 (specific, testable)
- [ ] Typecheck passes
- [ ] Lint passes

**Dependencies:** US-001
**Phase:** Stories
**Priority:** P2
**Status:** pending

**Implementation Tasks:**
- [ ] T009 [P] [US-003] First implementation task
- [ ] T010 [US-003] Second implementation task

---

## Phase 3: Polish & Integration

**Purpose**: Final integration and quality checks

- [ ] T011 [P] Cross-cutting concern 1
- [ ] T012 [P] Cross-cutting concern 2
- [ ] T013 Final validation and testing

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (User Stories)**: Depend on Phase 1 completion
- **Phase 3 (Polish)**: Depends on all user stories

### User Story Dependencies

```
Phase 1 (Setup)
    ├── US-001 ──┐
    ├── US-002 ──┼── Phase 3 (Polish)
    └── US-003 ──┘
```

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel
- User stories without dependencies can run in parallel
- Implementation tasks within a story marked [P] can run in parallel

---

## Summary

| Phase | User Story | Tasks | Priority |
|-------|------------|-------|----------|
| 1 | Setup | T001-T003 | - |
| 2 | US-001: [Title] | T004-T006 | P1 |
| 2 | US-002: [Title] | T007-T008 | P1 |
| 2 | US-003: [Title] | T009-T010 | P2 |
| 3 | Polish | T011-T013 | - |

**Total User Stories**: 3
**Total Tasks**: 13
