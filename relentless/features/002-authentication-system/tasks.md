# Tasks: Authentication System

**Feature Branch**: `002-authentication-system`
**Input**: Design documents from `relentless/features/002-authentication-system/`
**Prerequisites**: spec.md (required), plan.md (required)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project configuration and provider setup - BLOCKS all user stories

- [x] T001 [P] Update `app/ConvexClientProvider.tsx` to use `ConvexAuthNextjsProvider` from `@convex-dev/auth/nextjs`
- [x] T002 [P] Create `convex/users.ts` with `getCurrentUser` and `getCurrentUserProfile` query functions
- [x] T003 Update `convex/auth.ts` to add `afterUserCreatedOrUpdated` callback for auto-creating profile on registration

**Checkpoint**: Auth infrastructure ready - user story implementation can begin

---

## Phase 2: User Stories

### US-001: New User Registration

**Description**: As a visitor, I want to create an account with email/password so that I can access the platform.

**Acceptance Criteria:**
- [x] User can navigate to /signup page
- [x] Form validates email format before submission
- [x] Form validates password minimum length (8 chars)
- [x] Successful signup creates user account
- [x] Successful signup auto-creates profile with role="guest"
- [x] User is automatically logged in after signup
- [x] User is redirected to homepage after signup
- [x] Duplicate email shows appropriate error message
- [x] Typecheck passes (`bunx tsc --noEmit`)
- [x] Lint passes (`bun run lint`)

**Dependencies:** None
**Phase:** Stories
**Priority:** P1
**Status:** complete

**Implementation Tasks:**
- [x] T004 [P] [US-001] Create `components/auth/SignupForm.tsx` with email/password inputs and client-side validation
- [x] T005 [US-001] Create `app/(auth)/signup/page.tsx` that renders SignupForm
- [x] T006 [US-001] Add form validation: email format check, password minimum 8 characters
- [x] T007 [US-001] Handle signup errors: display "An account with this email already exists" for duplicates
- [x] T008 [US-001] Redirect to homepage on successful signup
- [x] T009 [US-001] Verify profile auto-created with role="guest" and profileStatus="locked"

---

### US-002: User Login

**Description**: As a registered user, I want to sign in with email/password so that I can access my account.

**Acceptance Criteria:**
- [x] User can navigate to /login page
- [x] Successful login authenticates user
- [x] User is redirected to homepage after login
- [x] Invalid credentials show "Invalid email or password" (not specific error)
- [x] Already logged-in users are redirected away from /login
- [x] Typecheck passes
- [x] Lint passes

**Dependencies:** None
**Phase:** Stories
**Priority:** P1
**Status:** complete

**Implementation Tasks:**
- [x] T010 [P] [US-002] Create `components/auth/LoginForm.tsx` with email/password inputs
- [x] T011 [US-002] Create `app/(auth)/login/page.tsx` that renders LoginForm
- [x] T012 [US-002] Handle login errors: display generic "Invalid email or password" message
- [x] T013 [US-002] Redirect to homepage on successful login
- [x] T014 [US-002] Redirect authenticated users away from /login to homepage

---

### US-003: User Logout

**Description**: As an authenticated user, I want to sign out so that I can end my session securely.

**Acceptance Criteria:**
- [x] Logout button visible when user is authenticated
- [x] Logout button not visible when user is not authenticated
- [x] Clicking logout terminates the session
- [x] User is redirected to homepage after logout
- [x] Typecheck passes
- [x] Lint passes

**Dependencies:** None
**Phase:** Stories
**Priority:** P2
**Status:** complete

**Implementation Tasks:**
- [x] T015 [P] [US-003] Create `components/auth/SignOutButton.tsx` component
- [x] T016 [US-003] Add SignOutButton to app layout (visible when authenticated)
- [x] T017 [US-003] Redirect to homepage after logout

---

### US-004: Session Persistence

**Description**: As a user, I want my session to persist across browser restarts so that I don't have to log in repeatedly.

**Acceptance Criteria:**
- [ ] Logged-in user remains logged in after browser restart
- [ ] Session token stored in HTTP-only cookie
- [ ] Expired sessions require re-authentication
- [ ] Typecheck passes
- [ ] Lint passes

**Dependencies:** None
**Phase:** Stories
**Priority:** P2
**Status:** pending

**Implementation Tasks:**
- [ ] T018 [US-004] Verify ConvexAuthNextjsProvider handles session persistence via cookies
- [ ] T019 [US-004] Test session persistence across browser close/reopen
- [ ] T020 [US-004] Verify session expiration works as expected (default @convex-dev/auth behavior)

---

### US-005: Role-Based Access Control

**Description**: As an admin, I want to enforce role-based permissions so that users can only access appropriate content.

**Acceptance Criteria:**
- [ ] Unauthenticated users redirected to /login when accessing protected routes
- [ ] Users with role="guest" cannot access member-only routes
- [ ] Users with role="member" cannot access admin routes
- [ ] Users with role="admin" can access admin routes
- [ ] Server-side role checking available via helper functions
- [ ] Typecheck passes
- [ ] Lint passes

**Dependencies:** None
**Phase:** Stories
**Priority:** P2
**Status:** pending

**Implementation Tasks:**
- [ ] T021 [P] [US-005] Create `middleware.ts` with route protection logic
- [ ] T022 [US-005] Add helper function `requireAuth` in `convex/users.ts` for server-side auth checks
- [ ] T023 [US-005] Add helper function `requireRole` in `convex/users.ts` for role-based access
- [ ] T024 [US-005] Configure middleware to redirect unauthenticated users to /login for protected routes
- [ ] T025 [US-005] Configure middleware to show 403 for unauthorized role access

---

### US-006: Auto-Create Account on Purchase (DEFERRED)

**Description**: As a guest purchaser, I want an account automatically created during checkout so that I can access my purchases later.

**Acceptance Criteria:**
- [ ] Guest checkout creates user account with provided email
- [ ] Existing users are not duplicated
- [ ] New users have profile with role="guest"

**Dependencies:** None
**Phase:** Stories
**Priority:** P3
**Status:** deferred
**Notes:** Deferred to F11 (Event Registration Flow) as it requires Stripe integration.

**Implementation Tasks:**
- [ ] T026 [US-006] Create internal mutation `createUserFromPurchase` in `convex/users.ts`
- [ ] T027 [US-006] Integrate with event purchase flow (F11)

---

## Phase 3: Polish & Integration

**Purpose**: Final integration and quality checks

- [ ] T028 [P] Add auth state indicator to layout (show user email or login link)
- [ ] T029 [P] Add "Sign up instead" / "Sign in instead" links between auth pages
- [ ] T030 Verify all auth flows work end-to-end
- [ ] T031 Run full typecheck and lint
- [ ] T032 Manual testing of all acceptance scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately, BLOCKS all stories
- **Phase 2 (US-001 to US-005)**: Depend on Phase 1 completion
- **US-006**: DEFERRED to F11
- **Phase 3 (Polish)**: Depends on all active user stories

### User Story Dependencies

```
Phase 1 (Setup)
    ├── US-001 (Registration) ──┐
    ├── US-002 (Login) ─────────┼── Phase 3 (Polish)
    ├── US-003 (Logout) ────────┤
    ├── US-004 (Session) ───────┤
    └── US-005 (RBAC) ──────────┘
```

### Parallel Opportunities

Within Phase 1:
- T001 and T002 can run in parallel
- T003 depends on T002 (uses users.ts types)

Within User Stories:
- US-001, US-002, US-003, US-004, US-005 can all run in parallel after Phase 1
- Component tasks (T004, T010, T015) can run in parallel

---

## Summary

| Phase | User Story | Tasks | Priority |
|-------|------------|-------|----------|
| 1 | Setup | T001-T003 | - |
| 2 | US-001: Registration | T004-T009 | P1 |
| 2 | US-002: Login | T010-T014 | P1 |
| 2 | US-003: Logout | T015-T017 | P2 |
| 2 | US-004: Session | T018-T020 | P2 |
| 2 | US-005: RBAC | T021-T025 | P2 |
| 2 | US-006: Auto-Create | DEFERRED | P3 |
| 3 | Polish | T028-T032 | - |

**Total User Stories**: 5 active (1 deferred)
**Total Tasks**: 32
**Parallel Opportunities**: Setup tasks, all component creation tasks
