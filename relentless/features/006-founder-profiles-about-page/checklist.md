# Quality Validation Checklist: Founder Profiles & About Page

**Feature**: 006-founder-profiles-about-page
**Generated**: 2026-01-17
**Spec Version**: 1.0

This checklist provides comprehensive validation criteria for the Founder Profiles & About Page feature. Items are organized by category and mapped to user stories where applicable.

---

## 1. Schema & Data Layer

### 1.1 Schema Updates (US-001)

- [x] `slug` field added to profiles table as `v.optional(v.string())`
- [x] `photoStorageId` field added to profiles table as `v.optional(v.id("_storage"))`
- [x] `by_slug` index added for efficient URL routing lookups
- [x] `by_role_and_profileStatus` composite index added for founders query
- [x] Schema validates without errors (`bunx convex dev` runs cleanly)
- [x] Existing profiles remain functional (backward compatibility verified)

### 1.2 Slug Validation

- [ ] Slug generation follows existing pattern from tags.ts (lowercase, hyphenated)
- [ ] Slug uniqueness enforced across profiles table
- [ ] Invalid slug formats rejected with clear error messages
- [ ] Slugs are URL-safe (no special characters except hyphens)

---

## 2. Convex Functions (Backend)

### 2.1 getFounders Query (US-002)

- [ ] Returns only profiles with `role="admin"` AND `profileStatus="published"`
- [ ] Uses composite index `by_role_and_profileStatus` for efficiency
- [ ] Returns all fields needed for ProfileCard: slug, displayName, bio, photoUrl, socialLinks, workingOnNow
- [ ] Returns empty array (not null) when no founders exist
- [ ] Has proper TypeScript return type validator with `v.array(...)`
- [ ] Non-admin profiles excluded from results
- [ ] Unpublished admin profiles excluded from results

### 2.2 getBySlug Query (US-002)

- [ ] Accepts slug argument with `v.string()` validator
- [ ] Uses `by_slug` index for lookup
- [ ] Returns null for non-existent slugs
- [ ] Returns null for non-published profiles (security: no data leakage)
- [ ] Returns null for locked/unlocked profiles (not published)
- [ ] Returns full profile object when slug exists and is published
- [ ] Has proper return type validator with `v.union(..., v.null())`

### 2.3 getAuthoredContent Query (US-008)

- [ ] Accepts `profileId` argument with `v.id("profiles")` validator
- [ ] Queries projects by `authorId` index where `isPublished=true`
- [ ] Queries experiments by `authorId` index where `isPublished=true`
- [ ] Queries articles by `authorId` index
- [ ] Queries videos by `authorId` index where `isPublished=true`
- [ ] Returns grouped content with minimal fields (title, slug)
- [ ] Returns empty arrays (not null) for content types with no items
- [ ] Unpublished content excluded from results

### 2.4 update Mutation (US-009)

- [ ] Requires admin role using `requireRole(ctx, ["admin"])`
- [ ] Accepts profile ID and optional fields for partial updates
- [ ] Validates slug format if provided
- [ ] Checks slug uniqueness if changed (excludes current profile)
- [ ] Updates only specified fields (does not overwrite unspecified fields)
- [ ] Returns `v.null()` on success
- [ ] Throws error for invalid slug format
- [ ] Throws error for duplicate slug

### 2.5 Photo Upload Functions (US-010)

- [ ] `generateUploadUrl` mutation requires admin role
- [ ] `generateUploadUrl` returns valid Convex storage upload URL
- [ ] `getPhotoUrl` query accepts `storageId` with `v.id("_storage")` validator
- [ ] `getPhotoUrl` returns URL string or null
- [ ] Storage URLs are properly resolved and accessible

### 2.6 Admin List Query (US-011)

- [ ] Returns all profiles (not filtered by status)
- [ ] Requires admin role for access
- [ ] Includes fields: _id, displayName, role, profileStatus, slug
- [ ] Supports filtering by role and/or status (optional enhancement)

---

## 3. Frontend Components

### 3.1 ProfilePhoto Component (US-003)

- [ ] Displays image when `photoUrl` is provided
- [ ] Displays initials avatar when photoUrl missing but displayName exists
- [ ] Generates correct initials from displayName (e.g., "David Martinez" -> "DM")
- [ ] Displays generic placeholder when both photoUrl and displayName missing
- [ ] Supports size variants: sm, md, lg, xl
- [ ] Uses Next.js Image component for optimization
- [ ] Handles image loading errors gracefully (fallback to avatar)
- [ ] Has proper alt text for accessibility

### 3.2 SocialLinks Component (US-003)

- [ ] Displays icon for LinkedIn when URL provided
- [ ] Displays icon for Twitter/X when URL provided
- [ ] Displays icon for GitHub when URL provided
- [ ] Displays icon for website when URL provided
- [ ] Hides entire component when no links provided (returns null)
- [ ] Opens links in new tab with `target="_blank"`
- [ ] Includes `rel="noopener noreferrer"` for security
- [ ] Supports optional text labels for accessibility
- [ ] Supports size variants: sm, md
- [ ] Has proper aria-labels on icon-only links

### 3.3 ProfileCard Component (US-004)

- [ ] Displays ProfilePhoto component
- [ ] Displays displayName
- [ ] Displays truncated bio (2-3 lines with ellipsis)
- [ ] Displays SocialLinks component
- [ ] Links to full profile page via `/profiles/[slug]`
- [ ] Has hover state for interactivity
- [ ] Is responsive at various widths
- [ ] Optional "View Full Profile" link can be shown/hidden
- [ ] Handles missing optional fields gracefully

### 3.4 ProfilePage Component (US-007)

- [ ] Displays full-width hero with ProfilePhoto (xl size)
- [ ] Displays displayName as h1 heading
- [ ] Displays complete bio text
- [ ] Displays location indicator (if present)
- [ ] Displays skills as tags/chips (if present)
- [ ] Displays "What I'm Working On" section (if present)
- [ ] Displays SocialLinks with labels
- [ ] Hides empty sections rather than showing placeholders
- [ ] Is responsive on mobile and desktop
- [ ] Has proper page metadata (title, description)

### 3.5 AuthoredContent Component (US-008)

- [ ] Displays sections for each content type with items
- [ ] Hides sections for content types with no items
- [ ] Links content items to their respective pages
- [ ] Shows "No content yet" or hides entirely when all empty
- [ ] Handles loading state appropriately
- [ ] Groups content by type (Projects, Experiments, Articles, Videos)

### 3.6 ProfileEditor Component (US-012)

- [ ] Form includes all editable fields
- [ ] Photo upload with preview
- [ ] Slug auto-generation from displayName
- [ ] Slug field is editable
- [ ] Social links section with URL inputs
- [ ] Skills as tag input (add/remove)
- [ ] Profile status dropdown (locked, unlocked, published)
- [ ] Location text input
- [ ] "What I'm Working On" textarea
- [ ] Save and cancel buttons
- [ ] Success feedback on save
- [ ] Error feedback on validation failure
- [ ] Loading state during save

---

## 4. About Page Sections

### 4.1 MissionSection Component (US-005)

- [ ] Displays headline "Building the future of AI, together" (or similar)
- [ ] Displays mission paragraph explaining purpose
- [ ] Has visual accent (gradient background or hero image)
- [ ] Responsive padding and typography
- [ ] Matches site design system

### 4.2 ValuesSection Component (US-005)

- [ ] Displays section heading "Our Values"
- [ ] Displays 4 value cards with titles and descriptions
- [ ] Values included: Community First, Practical Knowledge, Inclusive Access, Continuous Growth
- [ ] Responsive grid layout (1 col mobile, 2 col tablet, 4 col desktop)
- [ ] Consistent styling with rest of application

### 4.3 FounderSection Component (US-006)

- [ ] Fetches data using `useQuery(api.profiles.getFounders)`
- [ ] Displays "Meet the Founders" heading
- [ ] Maps founders to ProfileCard components
- [ ] Displays loading skeleton while fetching
- [ ] Handles empty array case gracefully ("Coming soon" message)
- [ ] Responsive grid layout for multiple founders

### 4.4 About Page Integration (US-006)

- [ ] Page available at `/about` route
- [ ] Displays MissionSection at top
- [ ] Displays ValuesSection after mission
- [ ] Displays FounderSection after values
- [ ] Sections flow cohesively together
- [ ] Page loads within 2 seconds (success criteria SC-001)

---

## 5. Profile Page Routes

### 5.1 Profile Page Route (US-007)

- [ ] Route exists at `/profiles/[slug]`
- [ ] Extracts slug from URL params correctly
- [ ] Uses `useQuery(api.profiles.getBySlug, { slug })`
- [ ] Displays loading state while fetching
- [ ] Shows 404 page when profile not found
- [ ] Shows 404 page when profile not published
- [ ] Renders ProfilePage component on success
- [ ] Has proper page metadata

### 5.2 Not Found Page (US-007)

- [ ] Styled 404 page at `/profiles/[slug]/not-found.tsx`
- [ ] Clear "Profile not found" message
- [ ] Link back to About page or home
- [ ] Consistent with site error page styling

---

## 6. Admin Pages

### 6.1 Admin Profile List Page (US-011)

- [ ] Route exists at `/admin/profiles`
- [ ] Requires admin authentication
- [ ] Redirects non-admin users or shows ForbiddenPage
- [ ] Displays loading state while fetching
- [ ] Lists all profiles in table format
- [ ] Shows key fields: name, role, status, slug
- [ ] Each profile has link to edit page
- [ ] Matches existing admin page styling patterns

### 6.2 Admin Profile Editor Page (US-012)

- [ ] Route exists at `/admin/profiles/[id]/edit`
- [ ] Requires admin authentication
- [ ] Fetches profile data on load
- [ ] Renders ProfileEditor with populated data
- [ ] Handles form submission via update mutation
- [ ] Shows success toast on successful save
- [ ] Shows error toast on failure
- [ ] Link back to profile list

---

## 7. Edge Cases & Error Handling

### 7.1 Empty States

- [ ] About page handles no founders gracefully
- [ ] Profile page handles missing optional fields
- [ ] AuthoredContent handles no content gracefully
- [ ] SocialLinks handles empty links object

### 7.2 Missing Data

- [ ] ProfilePhoto shows fallback for missing photo
- [ ] Profile page works with minimal data (just displayName)
- [ ] Bio truncation handles very short bios correctly

### 7.3 Invalid States

- [ ] Non-existent profile slug returns 404
- [ ] Unpublished profile slug returns 404 (no data leak)
- [ ] Locked profile slug returns 404
- [ ] Invalid slug format in URL handled gracefully

### 7.4 Security

- [ ] Non-published profiles not accessible via direct URL (SC-007)
- [ ] Admin mutations enforce role check
- [ ] Photo upload requires admin auth
- [ ] No profile data leaked for unpublished profiles

---

## 8. Accessibility

### 8.1 Semantic HTML

- [ ] Proper heading hierarchy (h1, h2, h3)
- [ ] Landmark regions used appropriately (main, section, nav)
- [ ] Lists used for repeated items

### 8.2 Images

- [ ] All profile photos have descriptive alt text
- [ ] Decorative images have empty alt or aria-hidden

### 8.3 Links & Buttons

- [ ] All links have meaningful text (not just icons)
- [ ] Icon-only links have aria-labels
- [ ] Social links indicate opening in new tab
- [ ] Keyboard navigation works for all interactive elements

### 8.4 Color & Contrast

- [ ] Text meets WCAG AA contrast requirements
- [ ] Information not conveyed by color alone

---

## 9. Performance

### 9.1 Load Time (SC-001)

- [ ] About page renders completely within 2 seconds
- [ ] Profile pages render completely within 2 seconds
- [ ] Admin pages load within acceptable time

### 9.2 Image Optimization

- [ ] Profile photos use Next.js Image component
- [ ] Appropriate image sizes for different viewports
- [ ] Lazy loading for below-fold images

### 9.3 Query Efficiency

- [ ] All queries use indexes (no table scans)
- [ ] Composite index used for founders query
- [ ] Parallel queries where possible (e.g., authored content)

---

## 10. Constitution Compliance

### 10.1 Type Safety

- [ ] All code passes TypeScript strict mode with 0 errors
- [ ] No `any` types used
- [ ] All Convex functions have `args` and `returns` validators
- [ ] `v.null()` used for void functions

### 10.2 Testing (TDD)

- [ ] Tests written for Convex functions (getFounders, getBySlug, update)
- [ ] Tests written for key components (ProfileCard, ProfilePage, SocialLinks)
- [ ] Edge cases tested (missing data, unauthorized access)
- [ ] Tests pass before merging

### 10.3 Code Quality

- [ ] `bun run lint` passes with 0 warnings
- [ ] TypeScript typecheck passes with 0 errors
- [ ] All tests pass
- [ ] No unused code/imports

### 10.4 Convex Patterns

- [ ] Functions use `withIndex()` instead of `filter()`
- [ ] Internal functions use `internalQuery/Mutation` if private
- [ ] Functions referenced via `api.profiles.functionName`
- [ ] Index fields named descriptively (e.g., `by_slug`)

---

## 11. User Story Traceability

| User Story | Key Acceptance Criteria | Checklist Coverage |
|------------|------------------------|-------------------|
| US-001 | Schema updates, indexes | Section 1.1 |
| US-002 | getFounders, getBySlug queries | Section 2.1, 2.2 |
| US-003 | ProfilePhoto, SocialLinks components | Section 3.1, 3.2 |
| US-004 | ProfileCard component | Section 3.3 |
| US-005 | Mission, Values sections | Section 4.1, 4.2 |
| US-006 | Founder section, About page | Section 4.3, 4.4 |
| US-007 | Profile page route | Section 3.4, 5.1, 5.2 |
| US-008 | Authored content display | Section 2.3, 3.5 |
| US-009 | Admin update mutation | Section 2.4 |
| US-010 | Photo upload | Section 2.5 |
| US-011 | Admin profile list | Section 2.6, 6.1 |
| US-012 | Admin profile editor | Section 3.6, 6.2 |
| US-013 | Seed founder data | Section 12 (below) |
| US-014 | Template verification | Section 13 (below) |

---

## 12. Data Seeding (US-013)

- [ ] David profile created with role="admin"
- [ ] Nathan profile created with role="admin"
- [ ] Both profiles have profileStatus="published"
- [ ] Slugs set appropriately (e.g., "david", "nathan")
- [ ] All profile fields populated (at least display name and bio)
- [ ] Seed process is documented
- [ ] getFounders returns both profiles after seeding

---

## 13. Template Verification (US-014)

- [ ] ProfileCard renders correctly for role="member"
- [ ] ProfilePage renders correctly for role="member"
- [ ] getBySlug works for member profiles when published
- [ ] No founder-specific logic hardcoded in components
- [ ] Schema supports all needed member profile fields
- [ ] Member profiles do NOT appear in getFounders (admin-only)

---

## 14. Success Criteria Verification

| Criteria | Description | Validation Method |
|----------|-------------|-------------------|
| SC-001 | About page loads within 2 seconds | Performance testing |
| SC-002 | 100% of published founders display | Visual inspection of About page |
| SC-003 | Social links clickable, open in new tab | Manual testing |
| SC-004 | Profile pages display all fields correctly | Visual inspection |
| SC-005 | Admin updates reflect within 5 seconds | Timed test of update mutation |
| SC-006 | Photo uploads complete and display | Manual testing of upload flow |
| SC-007 | Non-published profiles return 404 | Direct URL access testing |

---

## Validation Summary

**Total Checklist Items**: ~130
**Categories**: 14

### Priority Distribution

- **P0 (Blocking)**: Schema updates, core queries (Sections 1, 2.1-2.2)
- **P1 (Core Feature)**: Components, About page, Profile page (Sections 3, 4, 5)
- **P2 (Admin/Enhancement)**: Admin pages, Photo upload (Sections 6, 2.4-2.6)
- **P3 (Future-proofing)**: Template verification (Section 13)

### Sign-off

- [ ] All P0 items complete
- [ ] All P1 items complete
- [ ] All P2 items complete (or deferred with justification)
- [ ] All success criteria verified
- [ ] Constitution compliance verified
- [ ] Feature ready for merge
