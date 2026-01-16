# Feature Specification: Database Schema & Core Models

**Feature Branch**: `001-database-schema-core-models`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "F01: Database Schema & Core Models - Define Convex schema for users, events, content types (projects, articles, videos), tags, testimonials. Establish role system (admin, member, guest)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Creates Event with Full Schema Support (Priority: P1)

An admin user creates a new event in the system. The database schema correctly stores all event fields including title, date/time, location, description, pricing, and relationships to tags and speakers.

**Why this priority**: Events are the primary revenue driver. Without a working event schema, no other features (registration, payments, content) can function.

**Independent Test**: Can be fully tested by inserting an event document via Convex dashboard and verifying all fields persist correctly with proper types.

**Acceptance Scenarios**:

1. **Given** the schema is deployed, **When** an admin creates an event with title, date, time, timezone, location, description, agenda, price, and tags, **Then** the event is persisted with all fields correctly typed and indexed.
2. **Given** an event exists, **When** querying by date range using the index, **Then** the event is returned efficiently without scanning all documents.
3. **Given** an event exists with a speaker reference, **When** querying the event, **Then** the speaker profile ID resolves correctly.

---

### User Story 2 - User Account Creation with Role Assignment (Priority: P1)

A new user registers (or is auto-created via purchase). The system assigns them the appropriate role (guest by default) and creates their profile record with proper foreign key relationships to the auth user.

**Why this priority**: Authentication and authorization are foundational. All protected features depend on users having roles.

**Independent Test**: Can be tested by creating a user via auth flow and verifying profile and role assignment in the database.

**Acceptance Scenarios**:

1. **Given** a new user signs up, **When** their account is created, **Then** a profile record is created with `role: "guest"` and `profileStatus: "locked"`.
2. **Given** an existing user, **When** an admin changes their role to "member", **Then** the role field updates and persists correctly.
3. **Given** a user with role "admin", **When** querying their permissions, **Then** the system correctly identifies them as having admin access.

---

### User Story 3 - Content Creation with Unified Tag System (Priority: P2)

An admin creates a project, article, or video. Each content type uses a consistent tagging system that allows cross-content discovery.

**Why this priority**: Content is the secondary driver after events. Tags enable the discovery features planned for search and filtering.

**Independent Test**: Can be tested by creating content items with tags and verifying tag queries return all related content across types.

**Acceptance Scenarios**:

1. **Given** the schema is deployed, **When** an admin creates a project with tags ["LangChain", "RAG"], **Then** the project stores tag references correctly.
2. **Given** a tag "PostgreSQL" exists, **When** querying all content with that tag, **Then** projects, articles, and videos with that tag are all returned.
3. **Given** an article is created, **When** it references an author profile, **Then** the foreign key relationship is valid and queryable.

---

### User Story 4 - Testimonial Display with Event Association (Priority: P3)

An admin adds a testimonial from a past attendee. The testimonial can optionally be linked to a specific event and is displayed on relevant pages.

**Why this priority**: Social proof supports conversions but is not required for core functionality.

**Independent Test**: Can be tested by creating testimonials and verifying they can be queried both globally and by event association.

**Acceptance Scenarios**:

1. **Given** the schema is deployed, **When** an admin creates a testimonial with quote, name, role, and optional photo URL, **Then** the testimonial persists correctly.
2. **Given** a testimonial linked to an event, **When** querying testimonials for that event, **Then** only associated testimonials are returned.
3. **Given** testimonials exist, **When** querying for homepage display, **Then** featured testimonials are returned in display order.

---

### Edge Cases

- What happens when a tag is deleted that has associated content? → Content retains tag IDs; queries handle missing tags gracefully.
- How does the system handle a user with no profile record? → Auth tables exist independently; profile creation is triggered on relevant actions.
- What happens when an event's speaker profile is deleted? → Events store optional speaker IDs; null/missing speakers render as "TBA".
- How are past events distinguished from upcoming events? → Query by date index; no separate status field needed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST define a `profiles` table linked to auth users with fields for displayName, bio, photo, socialLinks, location, skills.
- **FR-002**: System MUST implement a `role` field on profiles with enum values: `"admin"`, `"member"`, `"guest"`.
- **FR-003**: System MUST implement a `profileStatus` field with enum values: `"locked"`, `"unlocked"`, `"published"`.
- **FR-004**: System MUST define an `events` table with fields: title, slug, description, date, endDate, timezone, location, isVirtual, agenda, priceInCents, capacity, tags, speakerIds.
- **FR-005**: System MUST define a `projects` table with fields: title, slug, description, heroImageUrl, heroVideoUrl, caseStudy, demoUrl, repoUrl, youtubeEmbeds, tags, authorId, isPublished, isFeatured.
- **FR-006**: System MUST define an `articles` table with fields: title, slug, content, excerpt, authorId, tags, substackUrl, publishedAt, isFeatured.
- **FR-007**: System MUST define a `videos` table with fields: title, slug, description, youtubeId, playlistId, duration, tags, authorId, isPublished, isFeatured.
- **FR-008**: System MUST define a `tags` table with fields: name, slug, description.
- **FR-009**: System MUST define a `testimonials` table with fields: quote, authorName, authorRole, authorCompany, authorPhotoUrl, eventId (optional), displayOrder, isFeatured.
- **FR-010**: System MUST define a `experiments` table (same as projects plus: status, learningLog, figuringOut, isPublished fields).
- **FR-011**: System MUST define a `playlists` table for video groupings with fields: title, slug, description, displayOrder.
- **FR-012**: System MUST define indexes for common query patterns: events by date, content by slug, content by author, profiles by role/status.
- **FR-013**: System MUST use Convex validators (`v.`) for all field definitions with proper types.
- **FR-014**: System MUST use `Id<"tableName">` types for all foreign key references.
- **FR-015**: System MUST create a profile record immediately when any user record is created (via signup, purchase, or admin action).
- **FR-016**: System MUST include `isPublished` boolean field on projects, experiments, and videos tables to support draft/published states.

### Key Entities

- **Profile**: Extended user data beyond auth. Links to auth user via userId. Contains role, profile status, and all public-facing profile information.
- **Event**: Paid educational event with full scheduling, pricing, and content relationships. Primary revenue entity.
- **Project**: Completed work showcase with rich media and case study support. Links to author profile.
- **Experiment**: In-progress work with status tracking and learning log. Same structure as Project with additional fields.
- **Article**: Blog content synced from Substack. Links to author profile.
- **Video**: YouTube-hosted educational content. Links to optional playlist grouping.
- **Playlist**: Grouping for video series/collections.
- **Tag**: Unified taxonomy entity used across all content types for discoverability.
- **Testimonial**: Social proof quotes with attribution. Optional event association.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All Convex validators pass TypeScript strict mode with 0 errors.
- **SC-002**: All defined indexes support the documented query patterns without full table scans.
- **SC-003**: Schema supports all fields documented in the Master PRD for each entity.
- **SC-004**: Foreign key relationships are queryable and return valid referenced documents.
- **SC-005**: Role system correctly distinguishes between admin, member, and guest access levels.
- **SC-006**: Schema deployment succeeds via `bunx convex dev` with no migration errors.

## Assumptions

1. **Auth Tables**: The existing `authTables` from `@convex-dev/auth` provide the base user/session tables. We extend rather than replace.
2. **Slug Generation**: Slugs will be generated at creation time from titles. This schema defines the field; slug generation logic is implementation detail.
3. **Price Storage**: Prices are stored in cents (integers) to avoid floating-point issues. Display formatting is a frontend concern.
4. **YouTube Integration**: Videos reference YouTube by ID only. No local video storage is planned.
5. **Tag References**: Content stores tag IDs as arrays. Tag names are denormalized only for search indexing if needed.
6. **Event Capacity**: Capacity field is optional and informational; enforcement is handled at registration time.
7. **Substack Sync**: Articles store `substackUrl` for linking back; actual sync mechanism is a separate feature.

## Clarified Decisions

1. **Profile Creation**: Profile records are created immediately whenever a user record is created (signup, purchase, or admin creation). This ensures every user always has a profile.
2. **Slug Uniqueness**: Slugs are unique per-table only. URLs will be namespaced by content type (e.g., `/projects/my-ai-project` and `/articles/my-ai-project` can coexist).
3. **Deletion Strategy**: Hard delete is used everywhere. Deleted content is permanently removed. Foreign key references to deleted records will return null and must be handled gracefully in queries.
4. **Publishing State**: All content types (projects, experiments, videos) include an `isPublished` boolean field. Content with `isPublished: false` is draft and not shown publicly.

## Schema Design

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Extended user profiles
  profiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("guest")),
    profileStatus: v.union(v.literal("locked"), v.literal("unlocked"), v.literal("published")),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    socialLinks: v.optional(v.object({
      linkedin: v.optional(v.string()),
      twitter: v.optional(v.string()),
      github: v.optional(v.string()),
      website: v.optional(v.string()),
    })),
    workingOnNow: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_role", ["role"])
    .index("by_profileStatus", ["profileStatus"]),

  // Events (primary revenue driver)
  events: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    date: v.number(), // Unix timestamp
    endDate: v.optional(v.number()),
    timezone: v.string(),
    location: v.string(),
    isVirtual: v.boolean(),
    agenda: v.optional(v.string()),
    priceInCents: v.number(),
    capacity: v.optional(v.number()),
    speakerIds: v.optional(v.array(v.id("profiles"))),
    tags: v.optional(v.array(v.id("tags"))),
    isFeatured: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
  })
    .index("by_slug", ["slug"])
    .index("by_date", ["date"])
    .index("by_isFeatured_and_date", ["isFeatured", "date"]),

  // Projects (completed work showcase)
  projects: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    heroImageUrl: v.optional(v.string()),
    heroVideoUrl: v.optional(v.string()),
    caseStudy: v.optional(v.string()),
    demoUrl: v.optional(v.string()),
    repoUrl: v.optional(v.string()),
    youtubeEmbeds: v.optional(v.array(v.string())),
    authorId: v.id("profiles"),
    tags: v.optional(v.array(v.id("tags"))),
    isPublished: v.boolean(),
    isFeatured: v.optional(v.boolean()),
  })
    .index("by_slug", ["slug"])
    .index("by_authorId", ["authorId"])
    .index("by_isPublished", ["isPublished"])
    .index("by_isFeatured", ["isFeatured"]),

  // Experiments (in-progress work)
  experiments: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    heroImageUrl: v.optional(v.string()),
    heroVideoUrl: v.optional(v.string()),
    status: v.union(
      v.literal("exploring"),
      v.literal("prototyping"),
      v.literal("paused"),
      v.literal("concluded")
    ),
    learningLog: v.optional(v.string()),
    figuringOut: v.optional(v.string()),
    demoUrl: v.optional(v.string()),
    repoUrl: v.optional(v.string()),
    youtubeEmbeds: v.optional(v.array(v.string())),
    authorId: v.id("profiles"),
    tags: v.optional(v.array(v.id("tags"))),
    isPublished: v.boolean(),
    isFeatured: v.optional(v.boolean()),
  })
    .index("by_slug", ["slug"])
    .index("by_authorId", ["authorId"])
    .index("by_status", ["status"])
    .index("by_isPublished", ["isPublished"]),

  // Articles (blog content)
  articles: defineTable({
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    authorId: v.id("profiles"),
    tags: v.optional(v.array(v.id("tags"))),
    substackUrl: v.optional(v.string()),
    publishedAt: v.number(), // Unix timestamp
    isFeatured: v.optional(v.boolean()),
  })
    .index("by_slug", ["slug"])
    .index("by_authorId", ["authorId"])
    .index("by_publishedAt", ["publishedAt"])
    .index("by_isFeatured_and_publishedAt", ["isFeatured", "publishedAt"]),

  // Videos (educational content)
  videos: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    youtubeId: v.string(),
    playlistId: v.optional(v.id("playlists")),
    duration: v.optional(v.number()), // seconds
    authorId: v.id("profiles"),
    tags: v.optional(v.array(v.id("tags"))),
    isPublished: v.boolean(),
    isFeatured: v.optional(v.boolean()),
  })
    .index("by_slug", ["slug"])
    .index("by_authorId", ["authorId"])
    .index("by_playlistId", ["playlistId"])
    .index("by_isPublished", ["isPublished"])
    .index("by_isFeatured", ["isFeatured"]),

  // Playlists (video groupings)
  playlists: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
  })
    .index("by_slug", ["slug"]),

  // Tags (unified taxonomy)
  tags: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"]),

  // Testimonials (social proof)
  testimonials: defineTable({
    quote: v.string(),
    authorName: v.string(),
    authorRole: v.optional(v.string()),
    authorCompany: v.optional(v.string()),
    authorPhotoUrl: v.optional(v.string()),
    eventId: v.optional(v.id("events")),
    displayOrder: v.optional(v.number()),
    isFeatured: v.optional(v.boolean()),
  })
    .index("by_eventId", ["eventId"])
    .index("by_isFeatured", ["isFeatured"])
    .index("by_displayOrder", ["displayOrder"]),
});
```

## Notes

- The `numbers` table from the existing schema is a placeholder and should be removed.
- `authTables` spread provides: `users`, `sessions`, `accounts`, `verificationTokens`, `authenticators`.
- Separate `profiles` table linked to `users` allows clean separation of auth data from profile data.
- All timestamps use Unix timestamps (numbers) for consistency and timezone handling.
- Tag `usageCount` was omitted from schema; can be computed via queries or added as denormalized field later if needed for performance.
