# User Stories: Testing Infrastructure

**Feature**: 003-vitest-and-react
**Created**: 2026-01-16
**Source**: [spec.md](./spec.md), [plan.md](./plan.md)

---

## Summary

| Story | Title | Priority | Status | Dependencies |
|-------|-------|----------|--------|--------------|
| US-001 | Install Testing Dependencies | P1 | complete | None |
| US-002 | Configure Vitest | P1 | complete | US-001 |
| US-003 | Test Utility Functions | P1 | complete | US-002 |
| US-004 | Test React Components | P1 | pending | US-002 |
| US-005 | Watch Mode for Development | P2 | pending | US-002 |
| US-006 | Coverage Reporting | P3 | pending | US-002 |

**Total Stories**: 6
**Parallel Opportunities**: US-003 and US-004 can be done in parallel after US-002

---

## User Stories

### US-001: Install Testing Dependencies

**Description:** As a developer, I want the testing dependencies installed so that I can start writing tests.

**Acceptance Criteria:**
- [x] Vitest is installed as a dev dependency
- [x] @vitejs/plugin-react is installed for JSX transform
- [x] @testing-library/react is installed for component testing
- [x] @testing-library/jest-dom is installed for DOM matchers
- [x] @testing-library/user-event is installed for user interaction simulation
- [x] jsdom is installed for DOM environment
- [x] @vitest/coverage-v8 is installed for coverage reporting
- [x] Test scripts added to package.json: `test`, `test:watch`, `test:coverage`
- [x] `bun install` completes without errors
- [x] Typecheck passes

**Dependencies:** None
**Phase:** Setup
**Priority:** P1
**Status:** complete

**Implementation Tasks:**
- [x] T001 [US-001] Install vitest and @vitejs/plugin-react
- [x] T002 [US-001] Install @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
- [x] T003 [US-001] Install jsdom and @vitest/coverage-v8
- [x] T004 [US-001] Add test scripts to package.json

---

### US-002: Configure Vitest

**Description:** As a developer, I want Vitest configured correctly so that tests can run with React support and path aliases.

**Acceptance Criteria:**
- [x] `vitest.config.ts` exists with React plugin enabled
- [x] jsdom environment is configured for DOM testing
- [x] `vitest.setup.ts` exists with jest-dom matchers and cleanup
- [x] Path alias `@/*` resolves to project root in test files
- [x] Test file patterns include `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`
- [x] `globals: true` enables Jest-compatible API (describe, it, expect)
- [x] `bun test` command runs without errors (even with no tests)
- [x] Typecheck passes
- [x] Lint passes

**Dependencies:** US-001
**Phase:** Setup
**Priority:** P1
**Status:** complete

**Implementation Tasks:**
- [x] T005 [US-002] Create vitest.config.ts with React plugin and jsdom
- [x] T006 [US-002] Configure path alias resolution matching tsconfig
- [x] T007 [US-002] Create vitest.setup.ts with jest-dom and cleanup
- [x] T008 [US-002] Add Vitest type references for global API

---

### US-003: Test Utility Functions

**Description:** As a developer, I want to write unit tests for utility functions so that I can verify non-UI code works correctly.

**Acceptance Criteria:**
- [x] `__tests__/` directory structure exists
- [x] Sample utility function exists in `lib/example.ts`
- [x] Sample test exists in `__tests__/lib/example.test.ts`
- [x] Test imports utility using path alias `@/lib/example`
- [x] `bun test` runs the sample test and passes
- [x] Test uses describe/it/expect global API
- [x] Multiple test cases run independently
- [x] Typecheck passes
- [x] Lint passes

**Dependencies:** US-002
**Phase:** Foundation
**Priority:** P1
**Status:** complete
**Parallel:** Yes (with US-004)

**Implementation Tasks:**
- [x] T009 [US-003] Create `__tests__/` directory structure
- [x] T010 [US-003] Create sample utility function `lib/example.ts`
- [x] T011 [US-003] Create sample test `__tests__/lib/example.test.ts`
- [x] T012 [US-003] Verify test runs and passes with `bun test`

---

### US-004: Test React Components

**Description:** As a developer, I want to write tests for React components so that I can verify UI behavior works correctly.

**Acceptance Criteria:**
- [ ] Custom test utilities exist in `__tests__/setup/test-utils.tsx`
- [ ] Convex mock utilities exist in `__tests__/setup/mocks/convex.ts`
- [ ] Sample component test exists for SignOutButton
- [ ] Test renders component with React Testing Library
- [ ] Test queries DOM elements (getByRole, getByText, etc.)
- [ ] Test simulates user events (click) with userEvent
- [ ] Test mocks Next.js router and Convex hooks
- [ ] `bun test` runs component tests and passes
- [ ] Typecheck passes
- [ ] Lint passes

**Dependencies:** US-002
**Phase:** Foundation
**Priority:** P1
**Status:** pending
**Parallel:** Yes (with US-003)

**Implementation Tasks:**
- [ ] T013 [US-004] Create `__tests__/setup/test-utils.tsx` with custom render
- [ ] T014 [US-004] Create `__tests__/setup/mocks/convex.ts` for Convex mocking
- [ ] T015 [US-004] Create SignOutButton test in `__tests__/components/auth/`
- [ ] T016 [US-004] Mock Next.js navigation and Convex auth hooks
- [ ] T017 [US-004] Verify component test runs and passes

---

### US-005: Watch Mode for Development

**Description:** As a developer, I want tests to re-run automatically when I change files so that I get immediate feedback during development.

**Acceptance Criteria:**
- [ ] `bun test:watch` starts Vitest in watch mode
- [ ] Modifying a source file triggers relevant test re-run
- [ ] Modifying a test file triggers that test file to re-run
- [ ] Watch mode displays clear output on file changes
- [ ] Watch mode can be exited cleanly (Ctrl+C)
- [ ] Typecheck passes

**Dependencies:** US-002
**Phase:** Polish
**Priority:** P2
**Status:** pending

**Implementation Tasks:**
- [ ] T018 [US-005] Verify `test:watch` script works correctly
- [ ] T019 [US-005] Test file change detection for source files
- [ ] T020 [US-005] Test file change detection for test files

---

### US-006: Coverage Reporting

**Description:** As a developer, I want to see test coverage reports so that I can identify untested code paths.

**Acceptance Criteria:**
- [ ] `bun test:coverage` generates a coverage report
- [ ] Coverage report shows line coverage percentages
- [ ] Coverage report shows function coverage percentages
- [ ] Coverage report shows branch coverage percentages
- [ ] HTML coverage report is generated in `coverage/` directory
- [ ] `coverage/` is added to `.gitignore`
- [ ] Coverage includes app/, components/, lib/ directories
- [ ] Coverage excludes convex/_generated/ and test files
- [ ] Typecheck passes

**Dependencies:** US-002
**Phase:** Polish
**Priority:** P3
**Status:** pending

**Implementation Tasks:**
- [ ] T021 [US-006] Configure coverage provider (v8) in vitest.config.ts
- [ ] T022 [US-006] Configure coverage include/exclude patterns
- [ ] T023 [US-006] Add coverage/ to .gitignore
- [ ] T024 [US-006] Verify coverage report generates correctly

---

## Dependency Graph

```
US-001 (Install Dependencies)
    │
    └──▶ US-002 (Configure Vitest)
              │
              ├──▶ US-003 (Test Utilities) ──┐
              │                               │── can run in parallel
              ├──▶ US-004 (Test Components) ─┘
              │
              ├──▶ US-005 (Watch Mode)
              │
              └──▶ US-006 (Coverage)
```

## Notes

- US-003 and US-004 are parallel and can be implemented in either order
- US-005 and US-006 are independent quality-of-life improvements
- All stories include typecheck/lint criteria per constitution requirements
- The sample tests created serve as documentation for testing patterns
- Convex function testing (from spec US-006) is deferred - can be added as separate feature
