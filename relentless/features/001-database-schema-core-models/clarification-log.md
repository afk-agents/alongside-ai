# Clarification Log: Database Schema & Core Models

## Q1: Profile Creation Timing - RESOLVED
**Date:** 2026-01-16
**Question:** When should a profile record be created for a user?
**Answer:** On any user creation - Profile records are created immediately whenever a user record is created (signup, purchase, or admin creation). This ensures every user always has a profile.
**Updated Sections:**
- Added "Clarified Decisions" section with item #1
- Added FR-015 to Functional Requirements

## Q2: Slug Uniqueness Scope - RESOLVED
**Date:** 2026-01-16
**Question:** Should slugs be unique globally across all content types, or only within each table?
**Answer:** Per-table uniqueness - Slugs are unique per-table only. URLs will be namespaced by content type (e.g., `/projects/my-ai-project` and `/articles/my-ai-project` can coexist).
**Updated Sections:**
- Added "Clarified Decisions" section with item #2

## Q3: Soft Delete vs Hard Delete - RESOLVED
**Date:** 2026-01-16
**Question:** Should content be soft-deleted (archived) or hard-deleted?
**Answer:** Hard delete everywhere - Deleted content is permanently removed. Foreign key references to deleted records will return null and must be handled gracefully in queries.
**Updated Sections:**
- Added "Clarified Decisions" section with item #3

## Q4: Content Publishing State - RESOLVED
**Date:** 2026-01-16
**Question:** Do content types other than articles need a draft/published state?
**Answer:** Add `isPublished` boolean - All content types (projects, experiments, videos) include an `isPublished` boolean field. Content with `isPublished: false` is draft and not shown publicly.
**Updated Sections:**
- Added "Clarified Decisions" section with item #4
- Updated FR-005, FR-007, FR-010 to include `isPublished` field
- Added FR-016 for `isPublished` requirement
- Updated Schema Design: added `isPublished` field and `by_isPublished` index to projects, experiments, and videos tables

## Q5: Created/Updated Timestamps - DEFERRED
**Date:** 2026-01-16
**Question:** Should we add explicit timestamp fields for tracking when records are modified?
**Reason:** Can be decided during implementation. Convex provides `_creationTime` automatically. If `updatedAt` tracking is needed, it can be added later without breaking changes.
