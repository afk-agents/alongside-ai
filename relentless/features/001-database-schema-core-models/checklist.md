# Quality Checklist: Database Schema & Core Models

**Purpose**: Validate completeness and correctness of Convex database schema implementation
**Created**: 2026-01-16
**Feature**: [spec.md](./spec.md)

---

## Schema Structure & Tables

- [x] CHK-001 [US-001] `profiles` table exists in `convex/schema.ts`
- [x] CHK-002 [US-002] `tags` table exists in `convex/schema.ts`
- [x] CHK-003 [US-003] `events` table exists in `convex/schema.ts`
- [x] CHK-004 [US-005] `projects` table exists in `convex/schema.ts`
- [x] CHK-005 [US-006] `experiments` table exists in `convex/schema.ts`
- [x] CHK-006 [US-007] `articles` table exists in `convex/schema.ts`
- [x] CHK-007 [US-008] `videos` table exists in `convex/schema.ts`
- [x] CHK-008 [US-008] `playlists` table exists in `convex/schema.ts`
- [ ] CHK-009 [US-009] `testimonials` table exists in `convex/schema.ts`
- [x] CHK-010 [Cleanup] Placeholder `numbers` table removed from schema

---

## Profiles Table Validation

- [x] CHK-011 [US-001] `userId` field uses `v.id("users")` validator
- [x] CHK-012 [US-001] `role` field uses correct union: `v.union(v.literal("admin"), v.literal("member"), v.literal("guest"))`
- [x] CHK-013 [US-001] `profileStatus` field uses correct union: `v.union(v.literal("locked"), v.literal("unlocked"), v.literal("published"))`
- [x] CHK-014 [US-001] `socialLinks` nested object has all fields: linkedin, twitter, github, website (all optional)
- [x] CHK-015 [US-001] `skills` field uses `v.optional(v.array(v.string()))`
- [x] CHK-016 [US-001] Index `by_userId` defined on `["userId"]`
- [x] CHK-017 [US-001] Index `by_role` defined on `["role"]`
- [x] CHK-018 [US-001] Index `by_profileStatus` defined on `["profileStatus"]`
- [x] CHK-019 [US-004] Verify profile can be created with minimal required fields only

---

## Events Table Validation

- [x] CHK-020 [US-003] All required fields present: title, slug, description, date, timezone, location, isVirtual, priceInCents
- [x] CHK-021 [US-003] `date` uses `v.number()` for Unix timestamp
- [x] CHK-022 [US-003] `priceInCents` uses `v.number()` (not float)
- [x] CHK-023 [US-003] `speakerIds` uses `v.optional(v.array(v.id("profiles")))`
- [x] CHK-024 [US-003] `tags` uses `v.optional(v.array(v.id("tags")))`
- [x] CHK-025 [US-003] Index `by_slug` defined on `["slug"]`
- [x] CHK-026 [US-003] Index `by_date` defined on `["date"]`
- [x] CHK-027 [US-003] Index `by_isFeatured_and_date` defined on `["isFeatured", "date"]`
- [ ] CHK-028 [Gap] Consider adding `by_isArchived` index for filtering archived events

---

## Content Tables Validation

### Projects

- [x] CHK-029 [US-005] `authorId` uses `v.id("profiles")` (required, not optional)
- [x] CHK-030 [US-005] `isPublished` uses `v.boolean()` (required, not optional)
- [x] CHK-031 [US-005] `youtubeEmbeds` uses `v.optional(v.array(v.string()))`
- [x] CHK-032 [US-005] Index `by_isPublished` defined for filtering published content

### Experiments

- [x] CHK-033 [US-006] `status` uses correct union: `v.union(v.literal("exploring"), v.literal("prototyping"), v.literal("paused"), v.literal("concluded"))`
- [x] CHK-034 [US-006] `learningLog` and `figuringOut` fields present (optional strings)
- [x] CHK-035 [US-006] Index `by_status` defined on `["status"]`

### Articles

- [x] CHK-036 [US-007] `content` field is required string (for full article text)
- [x] CHK-037 [US-007] `publishedAt` uses `v.number()` for Unix timestamp (required)
- [x] CHK-038 [US-007] `substackUrl` is optional string
- [x] CHK-039 [US-007] Index `by_publishedAt` defined for chronological queries
- [x] CHK-040 [US-007] Index `by_isFeatured_and_publishedAt` defined for featured content

### Videos & Playlists

- [x] CHK-041 [US-008] `youtubeId` is required string in videos table
- [x] CHK-042 [US-008] `playlistId` uses `v.optional(v.id("playlists"))`
- [x] CHK-043 [US-008] `duration` uses `v.optional(v.number())` for seconds
- [x] CHK-044 [US-008] Videos index `by_playlistId` defined for playlist queries
- [x] CHK-045 [US-008] Playlists `displayOrder` uses `v.optional(v.number())`

---

## Tags Table Validation

- [x] CHK-046 [US-002] `name` is required string
- [x] CHK-047 [US-002] `slug` is required string
- [x] CHK-048 [US-002] Index `by_slug` defined for URL lookups
- [x] CHK-049 [US-002] Index `by_name` defined for name lookups
- [ ] CHK-050 [Gap] Consider case-insensitive index for tag name searches

---

## Testimonials Table Validation

- [ ] CHK-051 [US-009] `quote` is required string
- [ ] CHK-052 [US-009] `authorName` is required string
- [ ] CHK-053 [US-009] `eventId` uses `v.optional(v.id("events"))`
- [ ] CHK-054 [US-009] `displayOrder` uses `v.optional(v.number())`
- [ ] CHK-055 [US-009] Index `by_eventId` defined for event-specific queries
- [ ] CHK-056 [US-009] Index `by_isFeatured` defined for featured testimonials
- [ ] CHK-057 [US-009] Index `by_displayOrder` defined for ordered display

---

## Foreign Key References

- [x] CHK-058 [US-001] profiles.userId references auth `users` table correctly
- [x] CHK-059 [US-003] events.speakerIds references `profiles` table correctly
- [x] CHK-060 [US-003] events.tags references `tags` table correctly
- [x] CHK-061 [US-005] projects.authorId references `profiles` table correctly
- [x] CHK-062 [US-005] projects.tags references `tags` table correctly
- [x] CHK-063 [US-006] experiments.authorId references `profiles` table correctly
- [x] CHK-064 [US-007] articles.authorId references `profiles` table correctly
- [x] CHK-065 [US-008] videos.authorId references `profiles` table correctly
- [x] CHK-066 [US-008] videos.playlistId references `playlists` table correctly
- [ ] CHK-067 [US-009] testimonials.eventId references `events` table correctly

---

## Type Safety (Constitution Compliance)

- [ ] CHK-068 [Constitution] All fields use Convex validators (`v.`)
- [ ] CHK-069 [Constitution] No `any` types in schema definition
- [ ] CHK-070 [Constitution] All optional fields use `v.optional()` wrapper
- [ ] CHK-071 [Constitution] All ID references use `v.id("tableName")` not `v.string()`
- [ ] CHK-072 [Constitution] Union types use `v.literal()` for each variant
- [ ] CHK-073 [Constitution] Arrays use `v.array()` wrapper
- [ ] CHK-074 [Constitution] Nested objects use `v.object()` with proper field definitions

---

## Index Naming Convention (Constitution Compliance)

- [ ] CHK-075 [Constitution] All index names include field names (e.g., `by_userId` not `userIndex`)
- [ ] CHK-076 [Constitution] Multi-field indexes use combined names (e.g., `by_isFeatured_and_date`)
- [ ] CHK-077 [Constitution] Index field order matches query patterns

---

## Deployment & Quality Gates

- [x] CHK-078 [Constitution] `bunx convex dev` deploys schema without errors
- [x] CHK-079 [Constitution] `bunx tsc --noEmit` passes with 0 errors
- [x] CHK-080 [Constitution] `bun run lint` passes with 0 warnings
- [x] CHK-081 [Constitution] `authTables` spread is preserved from @convex-dev/auth
- [ ] CHK-082 [Validation] All 9 tables visible in Convex Dashboard
- [ ] CHK-083 [Validation] All indexes visible in Convex Dashboard

---

## Manual Testing

- [x] CHK-084 [US-004] Can insert profile with each role via Dashboard
- [x] CHK-085 [US-004] Can insert profile with each profileStatus via Dashboard
- [x] CHK-086 [US-003] Can insert event with all required fields via Dashboard
- [x] CHK-087 [US-003] Can insert event with speaker references via Dashboard
- [x] CHK-088 [US-003] Can insert event with tag references via Dashboard
- [ ] CHK-089 [US-005] Can insert project with isPublished: true and false
- [ ] CHK-090 [US-006] Can insert experiment with each status value
- [ ] CHK-091 [US-009] Can insert testimonial with and without eventId

---

## Edge Cases & Error Handling

- [ ] CHK-092 [Edge Case] Schema rejects invalid role values
- [ ] CHK-093 [Edge Case] Schema rejects invalid profileStatus values
- [ ] CHK-094 [Edge Case] Schema rejects invalid experiment status values
- [ ] CHK-095 [Edge Case] Required fields cannot be omitted
- [ ] CHK-096 [Edge Case] Optional fields can be omitted without error
- [ ] CHK-097 [Edge Case] Foreign key IDs validated against correct table
- [ ] CHK-098 [Ambiguity] Slug uniqueness enforcement handled at mutation level (not schema)

---

## Documentation

- [ ] CHK-099 [Documentation] Schema design documented in spec.md
- [ ] CHK-100 [Documentation] All tables have clear comments in schema.ts
- [ ] CHK-101 [Documentation] Index purposes documented

---

## Summary

| Category | Items | Critical |
|----------|-------|----------|
| Schema Structure | 10 | Yes |
| Profiles Validation | 9 | Yes |
| Events Validation | 9 | Yes |
| Content Tables | 17 | Yes |
| Tags Validation | 5 | Yes |
| Testimonials Validation | 7 | Yes |
| Foreign Key References | 10 | Yes |
| Type Safety (Constitution) | 7 | Yes |
| Index Naming (Constitution) | 3 | Yes |
| Deployment & Quality Gates | 6 | Yes |
| Manual Testing | 8 | No |
| Edge Cases | 7 | No |
| Documentation | 3 | No |
| **Total** | **101** | |

---

## Identified Gaps

| ID | Gap Description | Recommendation |
|----|-----------------|----------------|
| CHK-028 | No `by_isArchived` index for events | Add if archive filtering is common |
| CHK-050 | No case-insensitive tag search | Implement at query level or add search index |
| CHK-098 | Slug uniqueness not enforced at schema | Implement in mutation with unique constraint check |

---

## Notes

- Check items off as completed: `[x]`
- All Constitution items (CHK-068 through CHK-083) are MUST requirements
- Edge case items can be deferred if time-constrained
- Gaps identified should be tracked for future iteration
