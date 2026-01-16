---
name: tasks
description: "Generate dependency-ordered user stories and tasks from plan. Use after creating plan. Triggers on: create tasks, generate user stories, break down implementation."
---

# User Story & Task Generator

Generate actionable, dependency-ordered user stories from technical plans.

---

## The Job

1. Read spec.md and plan.md
2. Extract user stories from spec
3. Break down into implementation tasks
4. Order by dependencies
5. Create tasks.md with structured user stories

**Important:** tasks.md contains the actual user stories that convert to prd.json!

---

## Step 1: Locate Feature Files

Find the current feature directory and verify:
- `spec.md` exists
- `plan.md` exists
- Feature directory: `relentless/features/NNN-feature/`

---

## Step 2: Load Context

Read:
1. `relentless/constitution.md` - Testing and quality requirements
2. `relentless/features/NNN-feature/spec.md` - User requirements
3. `relentless/features/NNN-feature/plan.md` - Technical design

---

## Step 3: Extract User Stories

From spec.md, identify distinct user stories:
- Each major functional requirement becomes a user story
- Group related functionality
- Typical: 3-8 user stories per feature

**User Story Format:**
```markdown
### US-001: [Title]

**Description:** As a [user], I want [goal] so that [benefit].

**Acceptance Criteria:**
- [ ] Criterion 1 (testable, specific)
- [ ] Criterion 2
- [ ] Criterion 3
- [ ] Typecheck passes
- [ ] Tests pass

**Dependencies:** None
**Phase:** Stories
**Priority:** P1
**Status:** pending

**Implementation Tasks:**
- [ ] T001 [US-001] Task description
```

**CRITICAL - Format Requirements for `relentless convert`:**
- **Dependencies:** Must be `None` or comma-separated story IDs (e.g., `US-001, US-002`)
  - Do NOT use phase names like "Phase 1 (Setup)" - this will cause errors
- **Status:** Must be one of: `pending`, `in_progress`, `complete`, `deferred`
- **Priority:** Use `P1`, `P2`, `P3` format
- **Story IDs:** Use 3-digit format with dash: `US-001` not `US1`

---

## Step 4: Generate Tasks

For each user story, create implementation tasks using format:

```markdown
## User Stories

### US-001: Create User Registration Endpoint

**Description:** As a new user, I want to register with email/password so that I can create an account.

**Acceptance Criteria:**
- [ ] POST /api/auth/register endpoint exists
- [ ] Email validation works
- [ ] Password requirements enforced (min 8 chars)
- [ ] Password is hashed before storage
- [ ] Confirmation email sent
- [ ] Returns 201 with user ID
- [ ] Returns 400 for invalid input
- [ ] Typecheck passes
- [ ] Unit tests pass

**Dependencies:** None
**Phase:** Foundation
**Priority:** P1
**Status:** pending

**Implementation Tasks:**
- [ ] T001 [US-001] Create registration endpoint handler
- [ ] T002 [US-001] Add email validation
- [ ] T003 [US-001] Implement password hashing

---

### US-002: Create User Login Endpoint

**Description:** As a registered user, I want to log in with email/password so that I can access my account.

**Acceptance Criteria:**
- [ ] POST /api/auth/login endpoint exists
- [ ] Validates credentials against database
- [ ] Returns JWT token on success
- [ ] Returns 401 for invalid credentials
- [ ] Token expires after 24 hours
- [ ] Typecheck passes
- [ ] Unit tests pass

**Dependencies:** US-001
**Phase:** Stories
**Priority:** P2
**Status:** pending

**Implementation Tasks:**
- [ ] T004 [US-002] Create login endpoint handler
- [ ] T005 [US-002] Implement JWT token generation

---

### US-003: Email Confirmation Flow

**Description:** As a new user, I want to confirm my email so that my account is activated.

**Acceptance Criteria:**
- [ ] Confirmation email sent on registration
- [ ] Email contains confirmation link
- [ ] GET /api/auth/confirm/:token endpoint exists
- [ ] Token validates and marks account as confirmed
- [ ] Expired tokens return appropriate error
- [ ] Typecheck passes

**Dependencies:** US-001
**Phase:** Stories
**Priority:** P3
**Status:** pending

**Implementation Tasks:**
- [ ] T006 [US-003] Create email confirmation endpoint
- [ ] T007 [US-003] Implement token validation
```

---

## Step 5: Order by Dependencies

Ensure user stories are ordered so dependencies come first:
1. **Phase 0: Setup** - Infrastructure, configuration
2. **Phase 1: Foundation** - Core models, base functionality
3. **Phase 2: Stories** - User-facing features (ordered by dependencies)
4. **Phase 3: Polish** - Optimization, edge cases

Mark parallel stories with:
```markdown
**Parallel:** Yes
```

---

## Step 6: Validate Completeness

Check that:
- [ ] Every functional requirement from spec has a user story
- [ ] Each user story has specific, testable acceptance criteria
- [ ] Dependencies are valid (no circular references)
- [ ] Each story is independently testable
- [ ] Typecheck/test criteria included
- [ ] Priority order makes sense

---

## Step 7: Save & Report

1. Save to `relentless/features/NNN-feature/tasks.md`
2. Update progress.txt
3. Report:
   - Total user stories: N
   - Dependency order: [list]
   - Parallel opportunities: N
   - Next step: `/relentless.checklist` or `relentless convert tasks.md`

---

## Key Guidelines

**User Story Size:**
- Each story completable in one session
- If too large, split into multiple stories
- Typical: 30-90 minutes of work per story

**Acceptance Criteria:**
- Specific and testable
- No vague terms ("works well", "good UX")
- Include quality checks (typecheck, lint, test)
- Verifiable in browser/tests

**Dependencies:**
- Only list direct dependencies as story IDs (e.g., `US-001, US-002`)
- Use `None` if no dependencies (not empty, not phase names)
- Ensure no circular dependencies
- Consider data dependencies (user must exist before profile)

---

## Notes

- tasks.md is the source of truth for user stories
- This file will be converted to prd.json by `relentless convert`
- Make acceptance criteria detailed and specific
- Each story should be independently deployable and testable
