# Tasks: Tag System

**Feature Branch**: `005-tag-system`
**Input**: Design documents from `relentless/features/005-tag-system/`
**Prerequisites**: spec.md (required), plan.md (required)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US-001, US-002)

---

## Phase 1: Setup

**Purpose**: Create foundation for tag system - Convex functions and helper utilities

- [x] T001 [P] Create `convex/tags.ts` file with imports and helper functions (generateSlug, validateSlug)
- [x] T002 [P] Create `components/tags/` directory structure
- [x] T003 [P] Create `__tests__/convex/tags.test.ts` test file skeleton

**Checkpoint**: Infrastructure ready - user story implementation can begin

---

## Phase 2: User Stories

### US-001: Admin Creates Tag

**Description:** As an admin, I want to create new tags in the system so that I can categorize content by topic.

**Acceptance Criteria:**
- [x] `tags.create` mutation exists in `convex/tags.ts`
- [x] Mutation requires admin role (throws AuthorizationError for non-admins)
- [x] Mutation accepts name (required), slug (optional), description (optional)
- [x] If slug not provided, auto-generates URL-friendly slug from name
- [x] Slug format validated (lowercase, hyphens, 2-50 chars)
- [x] Duplicate slug returns error with descriptive message
- [x] Returns new tag ID on success
- [x] Tests cover: admin creates tag, slug auto-generation, duplicate slug rejection, non-admin rejection
- [x] Typecheck passes (`bunx tsc --noEmit`)
- [x] Lint passes (`bun run lint`)
- [x] Tests pass (`bun test`)

**Dependencies:** None
**Phase:** Stories
**Priority:** P1
**Status:** completed

**Implementation Tasks:**
- [x] T004 [US-001] Write tests for `tags.create` mutation (TDD)
- [x] T005 [US-001] Implement `generateSlug` helper function
- [x] T006 [US-001] Implement `validateSlug` helper function
- [x] T007 [US-001] Implement `tags.create` mutation with admin role check

---

### US-002: View Tag Page

**Description:** As a visitor, I want to view a tag detail page so that I can see all content related to that topic.

**Acceptance Criteria:**
- [x] `tags.getBySlug` query returns tag by slug or null
- [x] `tags.getContentByTagId` query returns grouped content (events, projects, experiments, articles, videos)
- [x] Only published content is returned (isPublished=true, not archived)
- [x] Content is ordered by recency (events by date, articles by publishedAt, others by _creationTime)
- [x] `/tags/[slug]` page displays tag name as title
- [x] Page groups content by type with section headers
- [x] Empty content types are not displayed (no empty sections)
- [x] Non-existent slug shows 404 page
- [x] Tag with 0 content shows "No content tagged with [name] yet" message
- [x] Tests cover: query returns correct content, page renders sections, 404 handling
- [x] Typecheck passes
- [x] Lint passes
- [x] Tests pass

**Dependencies:** US-001
**Phase:** Stories
**Priority:** P1
**Status:** completed

**Implementation Tasks:**
- [x] T008 [US-002] Write tests for `tags.getBySlug` query
- [x] T009 [US-002] Implement `tags.getBySlug` query
- [x] T010 [US-002] Write tests for `tags.getContentByTagId` query
- [x] T011 [US-002] Implement `tags.getContentByTagId` query
- [x] T012 [P] [US-002] Create `TagContentSection` component with tests
- [x] T013 [US-002] Create `/tags/[slug]/page.tsx` with 404 handling

---

### US-003: Click Tag on Content Item

**Description:** As a visitor, I want to click on tags displayed on content items so that I can navigate to that tag's page.

**Acceptance Criteria:**
- [x] `tags.getByIds` query returns tags for given IDs array
- [x] `TagBadge` component renders clickable pill linking to `/tags/[slug]`
- [x] `TagList` component renders multiple TagBadge components
- [x] `TagList` renders nothing when tagIds is empty or undefined
- [x] Tags are styled as rounded pills with hover state
- [x] Links use proper Next.js Link component for client-side navigation
- [x] Tests cover: TagBadge renders with correct href, TagList handles empty state
- [x] Typecheck passes
- [x] Lint passes
- [x] Tests pass

**Dependencies:** US-001
**Phase:** Stories
**Priority:** P1
**Status:** completed

**Implementation Tasks:**
- [x] T014 [US-003] Write tests for `tags.getByIds` query
- [x] T015 [US-003] Implement `tags.getByIds` query
- [x] T016 [P] [US-003] Create `TagBadge` component with tests
- [x] T017 [US-003] Create `TagList` component with tests

---

### US-004: Browse All Tags

**Description:** As a visitor, I want to browse all available tags so that I can discover topics covered on the site.

**Acceptance Criteria:**
- [x] `tags.list` query returns all tags sorted alphabetically by name
- [x] Each tag includes contentCount (total items across all content types)
- [x] `/tags` page displays all tags as a grid/list
- [x] Each tag shows name and content count
- [x] Each tag links to its detail page (`/tags/[slug]`)
- [x] Empty state message when no tags exist
- [x] Tests cover: query returns sorted tags with counts, page renders tag list
- [x] Typecheck passes
- [x] Lint passes
- [x] Tests pass

**Dependencies:** US-001
**Phase:** Stories
**Priority:** P2
**Status:** completed

**Implementation Tasks:**
- [x] T018 [US-004] Write tests for `tags.list` query
- [x] T019 [US-004] Implement `tags.list` query with content counts
- [x] T020 [US-004] Create `/tags/page.tsx` listing page with tests

---

### US-005: Admin Assigns Tags to Content

**Description:** As an admin, I want to assign and remove tags from content items so that content can be discovered by topic.

**Acceptance Criteria:**
- [ ] Content types (events, projects, experiments, articles, videos) have `tags` field accepting array of tag IDs
- [ ] Assigned tags appear on tag detail page via `tags.getContentByTagId`
- [ ] Assigned tags appear in TagList component on content items
- [ ] Removing a tag removes content from tag detail page
- [ ] Tests verify content appears/disappears from tag pages on assignment/removal
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Tests pass

**Dependencies:** US-002, US-003
**Phase:** Stories
**Priority:** P2
**Status:** pending

**Implementation Tasks:**
- [ ] T021 [US-005] Write integration tests for tag assignment flow
- [ ] T022 [US-005] Verify `tags.getContentByTagId` correctly filters by tag assignment
- [ ] T023 [US-005] Verify TagList renders assigned tags for content items

---

### US-006: Admin Edits Tag

**Description:** As an admin, I want to edit a tag's name and description so that I can maintain the taxonomy.

**Acceptance Criteria:**
- [x] `tags.update` mutation exists in `convex/tags.ts`
- [x] Mutation requires admin role
- [x] Mutation accepts id, name (required), description (optional)
- [x] Slug cannot be changed (immutable after creation)
- [x] Updated name reflects on tag page and all content items
- [x] Returns null on success
- [x] Tests cover: admin updates tag, non-admin rejection, slug immutability
- [x] Typecheck passes
- [x] Lint passes
- [x] Tests pass

**Dependencies:** US-001
**Phase:** Stories
**Priority:** P3
**Status:** completed

**Implementation Tasks:**
- [x] T024 [US-006] Write tests for `tags.update` mutation
- [x] T025 [US-006] Implement `tags.update` mutation with slug immutability

---

### US-007: Admin Deletes Tag

**Description:** As an admin, I want to delete a tag so that I can remove obsolete topics from the taxonomy.

**Acceptance Criteria:**
- [ ] `tags.remove` mutation exists in `convex/tags.ts`
- [ ] Mutation requires admin role
- [ ] Mutation removes tag ID from all content types that reference it
- [ ] Mutation deletes the tag document
- [ ] Former tag URL returns 404
- [ ] Content items no longer show deleted tag
- [ ] Returns null on success
- [ ] Tests cover: admin deletes tag, tag removed from content, non-admin rejection
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Tests pass

**Dependencies:** US-001
**Phase:** Stories
**Priority:** P3
**Status:** pending

**Implementation Tasks:**
- [ ] T026 [US-007] Write tests for `tags.remove` mutation
- [ ] T027 [US-007] Implement `tags.remove` mutation with content cleanup

---

## Phase 3: Polish & Integration

**Purpose**: Final integration and quality checks

- [ ] T028 [P] Verify all tag pages load under 2 seconds with sample data
- [ ] T029 [P] Review accessibility (proper link semantics, keyboard navigation)
- [ ] T030 Run full test suite and verify 100% pass rate
- [ ] T031 Final code review: lint, typecheck, test

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (User Stories)**: Depend on Phase 1 completion
- **Phase 3 (Polish)**: Depends on all user stories

### User Story Dependencies

```
                 ┌─── US-002 (View Tag Page) ────┐
                 │                               │
US-001 ──────────┼─── US-003 (Click Tags) ───────┼─── US-005 (Assign Tags)
(Admin Create)   │                               │
                 ├─── US-004 (Browse All) ───────┘
                 │
                 ├─── US-006 (Edit Tag)
                 │
                 └─── US-007 (Delete Tag)
```

### Implementation Order

1. **US-001**: Admin Creates Tag (foundation - all others depend on this)
2. **US-002**: View Tag Page (core value proposition)
3. **US-003**: Click Tag on Content Item (entry point for discovery)
4. **US-004**: Browse All Tags (alternative discovery)
5. **US-005**: Admin Assigns Tags to Content (completes the loop)
6. **US-006**: Admin Edits Tag (maintenance)
7. **US-007**: Admin Deletes Tag (cleanup)

### Parallel Opportunities

- Setup tasks T001, T002, T003 can run in parallel
- After US-001, stories US-002, US-003, US-004, US-006, US-007 can start in parallel
- US-005 requires both US-002 and US-003 to be complete
- Within stories, tasks marked [P] can run in parallel

---

## Summary

| Phase | User Story | Tasks | Priority |
|-------|------------|-------|----------|
| 1 | Setup | T001-T003 | - |
| 2 | US-001: Admin Creates Tag | T004-T007 | P1 |
| 2 | US-002: View Tag Page | T008-T013 | P1 |
| 2 | US-003: Click Tag on Content | T014-T017 | P1 |
| 2 | US-004: Browse All Tags | T018-T020 | P2 |
| 2 | US-005: Admin Assigns Tags | T021-T023 | P2 |
| 2 | US-006: Admin Edits Tag | T024-T025 | P3 |
| 2 | US-007: Admin Deletes Tag | T026-T027 | P3 |
| 3 | Polish | T028-T031 | - |

**Total User Stories**: 7
**Total Tasks**: 31
