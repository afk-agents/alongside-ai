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

- [ ] T001 [P] Update `app/ConvexClientProvider.tsx` to use `ConvexAuthNextjsProvider` from `@convex-dev/auth/nextjs`
- [ ] T002 [P] Create `convex/users.ts` with `getCurrentUser` and `getCurrentUserProfile` query functions
- [ ] T003 Update `convex/auth.ts` to add `afterUserCreatedOrUpdated` callback for auto-creating profile on registration

**Checkpoint**: Auth infrastructure ready - user story implementation can begin

---

## Phase 2: User Story 1 - New User Registration (Priority: P1) 🎯 MVP

**Goal**: Allow visitors to create accounts with email/password

**Independent Test**: Navigate to /signup, enter valid credentials, verify user is logged in and profile created

### Implementation for User Story 1

- [ ] T004 [P] [US1] Create `components/auth/SignupForm.tsx` with email/password inputs and client-side validation
- [ ] T005 [US1] Create `app/(auth)/signup/page.tsx` that renders SignupForm
- [ ] T006 [US1] Add form validation: email format check, password minimum 8 characters
- [ ] T007 [US1] Handle signup errors: display "An account with this email already exists" for duplicates
- [ ] T008 [US1] Redirect to homepage on successful signup
- [ ] T009 [US1] Verify profile auto-created with role="guest" and profileStatus="locked"

**Acceptance Criteria:**
- [ ] User can navigate to /signup page
- [ ] Form validates email format before submission
- [ ] Form validates password minimum length (8 chars)
- [ ] Successful signup creates user account
- [ ] Successful signup auto-creates profile with role="guest"
- [ ] User is automatically logged in after signup
- [ ] User is redirected to homepage after signup
- [ ] Duplicate email shows appropriate error message
- [ ] Typecheck passes (`bunx tsc --noEmit`)
- [ ] Lint passes (`bun run lint`)

**Checkpoint**: Users can register new accounts

---

## Phase 3: User Story 2 - User Login (Priority: P1) 🎯 MVP

**Goal**: Allow registered users to sign in with email/password

**Independent Test**: Navigate to /login with registered credentials, verify authentication

### Implementation for User Story 2

- [ ] T010 [P] [US2] Create `components/auth/LoginForm.tsx` with email/password inputs
- [ ] T011 [US2] Create `app/(auth)/login/page.tsx` that renders LoginForm
- [ ] T012 [US2] Handle login errors: display generic "Invalid email or password" message
- [ ] T013 [US2] Redirect to homepage on successful login
- [ ] T014 [US2] Redirect authenticated users away from /login to homepage

**Acceptance Criteria:**
- [ ] User can navigate to /login page
- [ ] Successful login authenticates user
- [ ] User is redirected to homepage after login
- [ ] Invalid credentials show "Invalid email or password" (not specific error)
- [ ] Already logged-in users are redirected away from /login
- [ ] Typecheck passes
- [ ] Lint passes

**Checkpoint**: Users can log in to existing accounts

---

## Phase 4: User Story 3 - User Logout (Priority: P2)

**Goal**: Allow authenticated users to sign out

**Independent Test**: Log in, click logout, verify session terminated

### Implementation for User Story 3

- [ ] T015 [P] [US3] Create `components/auth/SignOutButton.tsx` component
- [ ] T016 [US3] Add SignOutButton to app layout (visible when authenticated)
- [ ] T017 [US3] Redirect to homepage after logout

**Acceptance Criteria:**
- [ ] Logout button visible when user is authenticated
- [ ] Logout button not visible when user is not authenticated
- [ ] Clicking logout terminates the session
- [ ] User is redirected to homepage after logout
- [ ] Typecheck passes
- [ ] Lint passes

**Checkpoint**: Users can sign out of their accounts

---

## Phase 5: User Story 4 - Session Persistence (Priority: P2)

**Goal**: Sessions persist across browser restarts

**Independent Test**: Log in, close browser, reopen, verify still authenticated

### Implementation for User Story 4

- [ ] T018 [US4] Verify ConvexAuthNextjsProvider handles session persistence via cookies
- [ ] T019 [US4] Test session persistence across browser close/reopen
- [ ] T020 [US4] Verify session expiration works as expected (default @convex-dev/auth behavior)

**Acceptance Criteria:**
- [ ] Logged-in user remains logged in after browser restart
- [ ] Session token stored in HTTP-only cookie
- [ ] Expired sessions require re-authentication
- [ ] Typecheck passes
- [ ] Lint passes

**Checkpoint**: Sessions persist correctly

---

## Phase 6: User Story 5 - Role-Based Access Control (Priority: P2)

**Goal**: Enforce role-based permissions on protected routes

**Independent Test**: Log in as different roles, verify access to protected routes

### Implementation for User Story 5

- [ ] T021 [P] [US5] Create `middleware.ts` with route protection logic
- [ ] T022 [US5] Add helper function `requireAuth` in `convex/users.ts` for server-side auth checks
- [ ] T023 [US5] Add helper function `requireRole` in `convex/users.ts` for role-based access
- [ ] T024 [US5] Configure middleware to redirect unauthenticated users to /login for protected routes
- [ ] T025 [US5] Configure middleware to show 403 for unauthorized role access

**Acceptance Criteria:**
- [ ] Unauthenticated users redirected to /login when accessing protected routes
- [ ] Users with role="guest" cannot access member-only routes
- [ ] Users with role="member" cannot access admin routes
- [ ] Users with role="admin" can access admin routes
- [ ] Server-side role checking available via helper functions
- [ ] Typecheck passes
- [ ] Lint passes

**Checkpoint**: Role-based access control working

---

## Phase 7: User Story 6 - Auto-Create Account on Purchase (Priority: P3) ⏸️ DEFERRED

**Goal**: Auto-create accounts during event checkout

**Note**: This story is deferred to F11 (Event Registration Flow) as it requires Stripe integration.

**Placeholder Tasks:**
- [ ] T026 [US6] Create internal mutation `createUserFromPurchase` in `convex/users.ts`
- [ ] T027 [US6] Integrate with event purchase flow (F11)

**Acceptance Criteria:**
- [ ] Guest checkout creates user account with provided email
- [ ] Existing users are not duplicated
- [ ] New users have profile with role="guest"

**Checkpoint**: Deferred to F11

---

## Phase 8: Polish & Integration

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
- **Phase 2-4 (US1, US2, US3)**: Depend on Phase 1 completion
- **Phase 5 (US4)**: Depends on Phase 1, can run parallel to US1-3
- **Phase 6 (US5)**: Depends on Phase 1, can run parallel to US1-4
- **Phase 7 (US6)**: DEFERRED to F11
- **Phase 8 (Polish)**: Depends on all active user stories

### User Story Dependencies

```
Phase 1 (Setup)
    ├── US1 (Registration) ──┐
    ├── US2 (Login) ─────────┼── Phase 8 (Polish)
    ├── US3 (Logout) ────────┤
    ├── US4 (Session) ───────┤
    └── US5 (RBAC) ──────────┘
```

### Parallel Opportunities

Within Phase 1:
- T001 and T002 can run in parallel
- T003 depends on T002 (uses users.ts types)

Within User Stories:
- US1, US2, US3, US4, US5 can all run in parallel after Phase 1
- Component tasks (T004, T010, T015) can run in parallel

---

## Summary

| Phase | User Story | Tasks | Priority |
|-------|------------|-------|----------|
| 1 | Setup | T001-T003 | - |
| 2 | US1: Registration | T004-T009 | P1 |
| 3 | US2: Login | T010-T014 | P1 |
| 4 | US3: Logout | T015-T017 | P2 |
| 5 | US4: Session | T018-T020 | P2 |
| 6 | US5: RBAC | T021-T025 | P2 |
| 7 | US6: Auto-Create | DEFERRED | P3 |
| 8 | Polish | T028-T032 | - |

**Total User Stories**: 5 active (1 deferred)
**Total Tasks**: 32
**Parallel Opportunities**: Setup tasks, all component creation tasks
