# Tasks: Database Schema & Core Models

**Input**: Design documents from `relentless/features/001-database-schema-core-models/`
**Prerequisites**: spec.md (✓), plan.md (✓), clarification-log.md (✓)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)

---

## Phase 1: Setup

**Purpose**: Verify environment and prepare for schema changes

- [x] T001 [P] Verify Convex dev server runs without errors (`bunx convex dev`)
- [x] T002 [P] Verify TypeScript compilation passes (`bunx tsc --noEmit`)
- [x] T003 [P] Verify ESLint passes (`bun run lint`)

**Checkpoint**: Development environment ready

---

## Phase 2: Foundation - Core Schema Tables

**Purpose**: Define base tables that other user stories depend on

**⚠️ CRITICAL**: All user story implementations depend on this phase completing first

### US-001: Profiles Table (Blocking - Required by all content tables)

**Description**: As a developer, I need the profiles table defined so that content can reference author profiles.

**Acceptance Criteria:**
- [x] `profiles` table defined in `convex/schema.ts`
- [x] `userId` field links to auth users table via `v.id("users")`
- [x] `role` field uses union validator: `"admin" | "member" | "guest"`
- [x] `profileStatus` field uses union validator: `"locked" | "unlocked" | "published"`
- [x] All optional profile fields defined (displayName, bio, photoUrl, socialLinks, etc.)
- [x] `socialLinks` nested object validator is correct
- [x] Indexes defined: `by_userId`, `by_role`, `by_profileStatus`
- [x] TypeScript compiles without errors

**Dependencies:** None
**Phase:** Foundation
**Priority:** P0 (Blocking)
**Status:** COMPLETE

### US-002: Tags Table (Blocking - Required by content tables)

**Description**: As a developer, I need the tags table defined so that content can reference tags.

**Acceptance Criteria:**
- [x] `tags` table defined in `convex/schema.ts`
- [x] Required fields: `name`, `slug`
- [x] Optional field: `description`
- [x] Indexes defined: `by_slug`, `by_name`
- [x] TypeScript compiles without errors

**Dependencies:** None
**Phase:** Foundation
**Priority:** P0 (Blocking)
**Status:** COMPLETE

### Implementation Tasks - Foundation

- [x] T004 [US-001] Remove placeholder `numbers` table from `convex/schema.ts`
- [x] T005 [US-001] Add `profiles` table definition with all fields in `convex/schema.ts`
- [x] T006 [US-001] Add indexes for `profiles` table: `by_userId`, `by_role`, `by_profileStatus`
- [x] T007 [US-002] Add `tags` table definition with all fields in `convex/schema.ts`
- [x] T008 [US-002] Add indexes for `tags` table: `by_slug`, `by_name`
- [x] T009 Run `bunx convex dev` to validate schema deploys correctly
- [x] T010 Run `bunx tsc --noEmit` to verify TypeScript compilation

**Checkpoint**: Foundation tables ready - content tables can now be added

---

## Phase 3: User Story 1 - Events Schema (Priority: P1)

**Goal**: Define events table to support event creation and management

**Independent Test**: Insert an event document via Convex Dashboard and verify all fields persist correctly

### US-003: Events Table

**Description**: As an admin, I want a complete events schema so that I can create and manage educational events with all required fields.

**Acceptance Criteria:**
- [x] `events` table defined in `convex/schema.ts`
- [x] Required fields: `title`, `slug`, `description`, `date`, `timezone`, `location`, `isVirtual`, `priceInCents`
- [x] Optional fields: `endDate`, `agenda`, `capacity`, `speakerIds`, `tags`, `isFeatured`, `isArchived`
- [x] `speakerIds` uses `v.array(v.id("profiles"))`
- [x] `tags` uses `v.array(v.id("tags"))`
- [x] `priceInCents` uses `v.number()` (integers for currency)
- [x] Indexes defined: `by_slug`, `by_date`, `by_isFeatured_and_date`
- [x] Can insert event with all fields via Convex Dashboard
- [x] Can query events by date using index
- [x] TypeScript compiles without errors
- [x] Lint passes

**Dependencies:** US-001 (profiles), US-002 (tags)
**Phase:** Stories
**Priority:** P1
**Status:** COMPLETE

### Implementation Tasks - User Story 1

- [x] T011 [US-003] Add `events` table definition with all required fields in `convex/schema.ts`
- [x] T012 [US-003] Add `events` table optional fields including `speakerIds` and `tags` references
- [x] T013 [US-003] Add indexes for `events` table: `by_slug`, `by_date`, `by_isFeatured_and_date`
- [x] T014 [US-003] Run `bunx convex dev` to deploy schema
- [x] T015 [US-003] Run `bunx tsc --noEmit` to verify compilation
- [x] T016 [US-003] Manual test: Insert sample event via Convex Dashboard

**Checkpoint**: Events schema complete and deployable

---

## Phase 4: User Story 2 - Profiles Schema Completion (Priority: P1)

**Goal**: Complete profiles table to support user management with roles

**Independent Test**: Create a profile via Convex Dashboard with different roles and verify role queries work

### US-004: Profile Role System

**Description**: As an admin, I want a profile system with roles so that I can manage user permissions (admin, member, guest).

**Acceptance Criteria:**
- [x] Profile table supports all three roles: `admin`, `member`, `guest`
- [x] Profile table supports all three statuses: `locked`, `unlocked`, `published`
- [x] Can query profiles by role using `by_role` index
- [x] Can query profiles by status using `by_profileStatus` index
- [x] Social links object supports: linkedin, twitter, github, website
- [x] Skills stored as array of strings
- [x] TypeScript compiles without errors
- [x] Lint passes

**Dependencies:** US-001 (profiles foundation)
**Phase:** Stories
**Priority:** P1
**Status:** COMPLETE

### Implementation Tasks - User Story 2

- [x] T017 [US-004] Verify `profiles` table has correct role union validator
- [x] T018 [US-004] Verify `profiles` table has correct profileStatus union validator
- [x] T019 [US-004] Manual test: Insert profiles with each role via Convex Dashboard
- [x] T020 [US-004] Manual test: Query profiles by role using index

**Checkpoint**: Profile role system complete

---

## Phase 5: User Story 3 - Content Tables (Priority: P2)

**Goal**: Define all content tables (projects, experiments, articles, videos, playlists) with unified tag system

**Independent Test**: Create content items with tags and verify tag relationships work

### US-005: Projects Table

**Description**: As an admin, I want a projects schema so that I can showcase completed work.

**Acceptance Criteria:**
- [x] `projects` table defined with all required fields
- [x] `authorId` references `profiles` table
- [x] `tags` references `tags` table as array
- [x] `isPublished` boolean for draft/published state
- [x] Indexes: `by_slug`, `by_authorId`, `by_isPublished`, `by_isFeatured`
- [x] TypeScript compiles without errors

**Dependencies:** US-001 (profiles), US-002 (tags)
**Phase:** Stories
**Priority:** P2
**Status:** COMPLETE

### US-006: Experiments Table

**Description**: As an admin, I want an experiments schema so that I can share in-progress work.

**Acceptance Criteria:**
- [x] `experiments` table defined with all required fields
- [x] `status` union validator: `exploring`, `prototyping`, `paused`, `concluded`
- [x] `learningLog` and `figuringOut` optional fields
- [x] Indexes: `by_slug`, `by_authorId`, `by_status`, `by_isPublished`
- [x] TypeScript compiles without errors

**Dependencies:** US-001 (profiles), US-002 (tags)
**Phase:** Stories
**Priority:** P2
**Status:** COMPLETE

### US-007: Articles Table

**Description**: As an admin, I want an articles schema so that I can publish blog content.

**Acceptance Criteria:**
- [x] `articles` table defined with all required fields
- [x] `content` field for full article text
- [x] `publishedAt` timestamp field
- [x] `substackUrl` optional field for linking back
- [x] Indexes: `by_slug`, `by_authorId`, `by_publishedAt`, `by_isFeatured_and_publishedAt`
- [x] TypeScript compiles without errors

**Dependencies:** US-001 (profiles), US-002 (tags)
**Phase:** Stories
**Priority:** P2
**Status:** COMPLETE

### US-008: Videos & Playlists Tables

**Description**: As an admin, I want videos and playlists schemas so that I can organize educational content.

**Acceptance Criteria:**
- [x] `videos` table defined with `youtubeId` required field
- [x] `playlistId` references `playlists` table
- [x] `playlists` table defined with `title`, `slug`, `description`, `displayOrder`
- [x] Videos indexes: `by_slug`, `by_authorId`, `by_playlistId`, `by_isPublished`, `by_isFeatured`
- [x] Playlists index: `by_slug`
- [x] TypeScript compiles without errors

**Dependencies:** US-001 (profiles), US-002 (tags)
**Phase:** Stories
**Priority:** P2
**Status:** COMPLETE

### Implementation Tasks - User Story 3

- [x] T021 [P] [US-005] Add `projects` table definition in `convex/schema.ts`
- [x] T022 [P] [US-005] Add indexes for `projects` table
- [x] T023 [P] [US-006] Add `experiments` table definition in `convex/schema.ts`
- [x] T024 [P] [US-006] Add indexes for `experiments` table
- [x] T025 [P] [US-007] Add `articles` table definition in `convex/schema.ts`
- [x] T026 [P] [US-007] Add indexes for `articles` table
- [x] T027 [P] [US-008] Add `playlists` table definition in `convex/schema.ts`
- [x] T028 [P] [US-008] Add `videos` table definition in `convex/schema.ts`
- [x] T029 [P] [US-008] Add indexes for `videos` and `playlists` tables
- [x] T030 Run `bunx convex dev` to deploy all content tables
- [x] T031 Run `bunx tsc --noEmit` to verify compilation
- [ ] T032 Manual test: Insert content with tags and verify relationships

**Checkpoint**: All content tables complete

---

## Phase 6: User Story 4 - Testimonials Table (Priority: P3)

**Goal**: Define testimonials table for social proof

**Independent Test**: Create testimonials and verify event association works

### US-009: Testimonials Table

**Description**: As an admin, I want a testimonials schema so that I can display social proof from past attendees.

**Acceptance Criteria:**
- [ ] `testimonials` table defined with all required fields
- [ ] Required: `quote`, `authorName`
- [ ] Optional: `authorRole`, `authorCompany`, `authorPhotoUrl`, `eventId`, `displayOrder`, `isFeatured`
- [ ] `eventId` optional reference to `events` table
- [ ] Indexes: `by_eventId`, `by_isFeatured`, `by_displayOrder`
- [ ] Can query testimonials for specific event
- [ ] Can query featured testimonials
- [ ] TypeScript compiles without errors
- [ ] Lint passes

**Dependencies:** US-003 (events - for eventId reference)
**Phase:** Stories
**Priority:** P3

### Implementation Tasks - User Story 4

- [ ] T033 [US-009] Add `testimonials` table definition in `convex/schema.ts`
- [ ] T034 [US-009] Add indexes for `testimonials` table
- [ ] T035 [US-009] Run `bunx convex dev` to deploy schema
- [ ] T036 [US-009] Manual test: Insert testimonials with and without event association

**Checkpoint**: Testimonials schema complete

---

## Phase 7: Polish & Validation

**Purpose**: Final validation and quality checks

- [ ] T037 Run full `bunx convex dev` deployment
- [ ] T038 Run `bunx tsc --noEmit` - must pass with 0 errors
- [ ] T039 Run `bun run lint` - must pass with 0 warnings
- [ ] T040 Verify all 9 tables exist in Convex Dashboard
- [ ] T041 Verify all indexes are created and functional
- [ ] T042 Insert test data for each table type via Dashboard
- [ ] T043 Update feature status to Complete

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup (no dependencies)
    │
    ▼
Phase 2: Foundation (US-001 profiles, US-002 tags)
    │
    ├──────────────┬──────────────┬──────────────┐
    ▼              ▼              ▼              ▼
Phase 3       Phase 4       Phase 5       Phase 6
(Events)     (Profiles)    (Content)    (Testimonials)
   P1           P1           P2            P3
    │              │              │              │
    └──────────────┴──────────────┴──────────────┘
                          │
                          ▼
                    Phase 7: Polish
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US-001 (Profiles foundation) | None | US-002 |
| US-002 (Tags) | None | US-001 |
| US-003 (Events) | US-001, US-002 | US-004, US-005-008 |
| US-004 (Profile roles) | US-001 | US-003, US-005-008 |
| US-005 (Projects) | US-001, US-002 | US-003, US-004, US-006-008 |
| US-006 (Experiments) | US-001, US-002 | US-003, US-004, US-005, US-007-008 |
| US-007 (Articles) | US-001, US-002 | US-003, US-004, US-005-006, US-008 |
| US-008 (Videos/Playlists) | US-001, US-002 | US-003, US-004, US-005-007 |
| US-009 (Testimonials) | US-003 | None |

### Parallel Opportunities

**After Phase 2 completes, ALL of the following can run in parallel:**
- US-003 (Events)
- US-004 (Profile completion)
- US-005 (Projects)
- US-006 (Experiments)
- US-007 (Articles)
- US-008 (Videos/Playlists)

**Only US-009 (Testimonials) must wait for US-003 (Events)**

---

## Implementation Strategy

### MVP First (Events + Profiles)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundation (profiles, tags)
3. Complete Phase 3: Events (P1)
4. Complete Phase 4: Profile roles (P1)
5. **STOP and VALIDATE**: Schema supports event creation

### Full Schema

1. Complete MVP steps above
2. Complete Phase 5: All content tables (P2)
3. Complete Phase 6: Testimonials (P3)
4. Complete Phase 7: Polish & Validation

---

## Summary

| Metric | Count |
|--------|-------|
| Total User Stories | 9 |
| Total Tasks | 43 |
| Parallel-eligible Tasks | 18 |
| Blocking Dependencies | 2 (US-001, US-002) |

**Next Step**: `/relentless.checklist` or begin implementation with Phase 1
