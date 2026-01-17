# User Stories & Tasks: Founder Profiles & About Page

**Feature**: 006-founder-profiles-about-page
**Created**: 2026-01-17
**Spec Version**: 1.0

## Overview

This document breaks down the Founder Profiles & About Page feature into dependency-ordered user stories with detailed implementation tasks and acceptance criteria. Each user story is independently testable and delivers incremental value.

---

## US-001: Schema Update - Add Profile Slug and Photo Storage Fields

**Priority**: P0 (Foundation)
**Dependencies**: None
**Estimated Effort**: Small

### Description

As a developer, I need the profiles table to include a `slug` field for URL routing and a `photoStorageId` field for Convex file storage, so that profile pages can have clean URLs and photos can be properly managed.

### Acceptance Criteria

- [x] `slug` field added to profiles table as optional string
- [x] `photoStorageId` field added to profiles table as optional Id<"_storage">
- [x] `by_slug` index added for efficient URL routing lookups
- [x] `by_role_and_profileStatus` composite index added for founders query
- [x] Schema validates and Convex dev server runs without errors
- [x] Existing profiles continue to work (backward compatible)

### Tasks

1. **Update convex/schema.ts**
   - Add `slug: v.optional(v.string())` to profiles table
   - Add `photoStorageId: v.optional(v.id("_storage"))` to profiles table
   - Add `.index("by_slug", ["slug"])` for URL routing
   - Add `.index("by_role_and_profileStatus", ["role", "profileStatus"])` for founders query

2. **Verify schema migration**
   - Run `bunx convex dev` to apply schema changes
   - Verify no errors in console

### Test Scenarios

```gherkin
Given the Convex schema is updated
When the Convex dev server starts
Then the schema deploys without errors

Given an existing profile without slug
When the profile is queried
Then the profile is returned with slug as undefined
```

---

## US-002: Profile Queries - Get Founders and Get By Slug

**Priority**: P0 (Foundation)
**Dependencies**: US-001
**Estimated Effort**: Medium

### Description

As a frontend developer, I need Convex queries to fetch published admin profiles (founders) and individual profiles by slug, so that the About page and profile pages can display profile data.

### Acceptance Criteria

- [ ] `getFounders` query returns only profiles with role="admin" AND profileStatus="published"
- [ ] `getFounders` returns all necessary fields for ProfileCard display (slug, displayName, bio, photoUrl, socialLinks, workingOnNow)
- [ ] `getBySlug` query returns a profile by its slug
- [ ] `getBySlug` returns null for non-existent slugs
- [ ] `getBySlug` returns null for non-published profiles (prevents data leakage)
- [ ] Both queries have proper TypeScript return type validators

### Tasks

1. **Create convex/profiles.ts file**
   - Import necessary Convex utilities and validators
   - Import requireRole from users.ts

2. **Implement getFounders query**
   - Query profiles with role="admin" and profileStatus="published"
   - Use composite index `by_role_and_profileStatus` for efficiency
   - Return array with required profile card fields
   - Include photo URL resolution if using storage

3. **Implement getBySlug query**
   - Accept slug argument
   - Query using `by_slug` index
   - Return null if not found OR profileStatus !== "published"
   - Return full profile object with all fields

4. **Export slug generation utilities**
   - Export generateSlug and validateSlug functions (reuse from tags.ts pattern)
   - Adapt for profile display names

### Test Scenarios

```gherkin
Given two admin profiles exist with profileStatus="published"
And one admin profile exists with profileStatus="unlocked"
When getFounders is called
Then only the two published admin profiles are returned

Given a profile exists with slug="david-martinez" and profileStatus="published"
When getBySlug is called with slug="david-martinez"
Then the full profile object is returned

Given a profile exists with slug="draft-user" and profileStatus="unlocked"
When getBySlug is called with slug="draft-user"
Then null is returned (no data leakage)

Given no profile exists with slug="nonexistent"
When getBySlug is called with slug="nonexistent"
Then null is returned
```

---

## US-003: Profile Photo Components - ProfilePhoto and SocialLinks

**Priority**: P1
**Dependencies**: US-002
**Estimated Effort**: Small

### Description

As a frontend developer, I need reusable ProfilePhoto and SocialLinks components, so that profiles can be displayed consistently across the About page and profile pages.

### Acceptance Criteria

- [ ] ProfilePhoto displays image when photoUrl is provided
- [ ] ProfilePhoto displays initials avatar when photoUrl is missing but displayName exists
- [ ] ProfilePhoto displays generic placeholder when both are missing
- [ ] ProfilePhoto supports size variants (sm, md, lg, xl)
- [ ] SocialLinks displays icons for linkedin, twitter, github, website
- [ ] SocialLinks hides when no links are provided
- [ ] SocialLinks opens links in new tab with rel="noopener noreferrer"
- [ ] SocialLinks supports optional text labels for accessibility

### Tasks

1. **Create components/profiles/ProfilePhoto.tsx**
   - Accept props: photoUrl, displayName, size
   - Implement initials extraction from displayName
   - Define size variants with Tailwind classes
   - Handle image loading error gracefully
   - Use Next.js Image component for optimization

2. **Create components/profiles/SocialLinks.tsx**
   - Accept props: links object, showLabels, size
   - Create inline SVG icons for each platform (LinkedIn, Twitter/X, GitHub, Globe)
   - Only render links that have URLs
   - Hide entire component if no links
   - Add proper aria-labels for accessibility

3. **Create components/profiles/index.ts**
   - Export all profile components from barrel file

### Test Scenarios

```gherkin
Given a profile has photoUrl
When ProfilePhoto renders
Then the image is displayed with proper alt text

Given a profile has no photoUrl but has displayName "David Martinez"
When ProfilePhoto renders
Then initials "DM" are displayed in an avatar circle

Given a profile has socialLinks with linkedin and twitter only
When SocialLinks renders
Then only LinkedIn and Twitter icons are displayed
And GitHub and website icons are not rendered

Given a profile has empty socialLinks object
When SocialLinks renders
Then the component returns null (nothing displayed)
```

---

## US-004: ProfileCard Component for About Page

**Priority**: P1
**Dependencies**: US-003
**Estimated Effort**: Small

### Description

As a visitor on the About page, I want to see compact profile cards for each founder, so that I can quickly learn about who is behind Alongside AI.

### Acceptance Criteria

- [ ] ProfileCard displays ProfilePhoto, displayName, bio excerpt, and SocialLinks
- [ ] Bio is truncated with ellipsis after 2-3 lines
- [ ] Card links to full profile page via slug
- [ ] Card has hover state for interactivity
- [ ] Card is responsive and looks good at various widths
- [ ] Optional "View Full Profile" link can be shown/hidden

### Tasks

1. **Create components/profiles/ProfileCard.tsx**
   - Accept profile object prop with required fields
   - Compose ProfilePhoto and SocialLinks components
   - Implement bio truncation with line-clamp CSS
   - Add Link component wrapping to /profiles/[slug]
   - Add hover state styles
   - Support showViewProfile prop

2. **Add responsive styling**
   - Card width adapts to container
   - Consistent padding and spacing
   - Match existing site design patterns

### Test Scenarios

```gherkin
Given a founder profile with all fields populated
When ProfileCard renders
Then photo, name, truncated bio, and social links are visible

Given a founder profile with a long bio
When ProfileCard renders
Then bio is truncated to 2-3 lines with ellipsis

Given a ProfileCard with showViewProfile=true
When user clicks "View Full Profile"
Then they are navigated to /profiles/[slug]
```

---

## US-005: About Page - Mission and Values Sections

**Priority**: P1
**Dependencies**: None
**Estimated Effort**: Small

### Description

As a visitor, I want to see Alongside AI's mission statement and core values on the About page, so that I can understand what the organization stands for.

### Acceptance Criteria

- [ ] MissionSection displays headline and mission paragraph
- [ ] MissionSection has visual accent (gradient or image background)
- [ ] ValuesSection displays 4 core values with titles and descriptions
- [ ] Values are displayed in a responsive grid layout
- [ ] Content is well-formatted and visually appealing
- [ ] Page loads within 2 seconds (no external data fetching needed)

### Tasks

1. **Create components/about/MissionSection.tsx**
   - Large headline: "Building the future of AI, together"
   - Mission paragraph explaining Alongside AI's purpose
   - Visual accent styling (gradient background or hero image)
   - Responsive padding and typography

2. **Create components/about/ValuesSection.tsx**
   - Section heading: "Our Values"
   - Grid of 4 value cards:
     - Community First
     - Practical Knowledge
     - Inclusive Access
     - Continuous Growth
   - Each card has title and brief description
   - Responsive grid (1 col mobile, 2 col tablet, 4 col desktop)

3. **Create components/about/index.ts**
   - Export all about section components

### Test Scenarios

```gherkin
Given a visitor navigates to /about
When the page loads
Then the mission statement is prominently displayed at the top

Given a visitor is viewing the About page
When they scroll to the values section
Then they see 4 value cards with titles and descriptions
```

---

## US-006: About Page - Founder Section with Dynamic Data

**Priority**: P1
**Dependencies**: US-002, US-004, US-005
**Estimated Effort**: Small

### Description

As a visitor on the About page, I want to see profile cards for the founders (David and Nathan), so that I can learn about who created Alongside AI.

### Acceptance Criteria

- [ ] FounderSection fetches data using getFounders query
- [ ] Section displays "Meet the Founders" heading
- [ ] ProfileCards are displayed in responsive grid
- [ ] Loading state shown while fetching
- [ ] Empty state handled gracefully (if no founders)
- [ ] Section integrates seamlessly with Mission and Values sections

### Tasks

1. **Create components/about/FounderSection.tsx**
   - Use `useQuery` hook with api.profiles.getFounders
   - Section heading: "Meet the Founders"
   - Map founders to ProfileCard components
   - Implement loading skeleton state
   - Handle empty array case

2. **Update app/about/page.tsx**
   - Import MissionSection, ValuesSection, FounderSection
   - Remove placeholder content
   - Compose sections in proper order
   - Add proper page metadata

### Test Scenarios

```gherkin
Given there are 2 published admin profiles (founders)
When a visitor navigates to /about
Then they see 2 founder profile cards

Given the founders data is loading
When visitor views the About page
Then a loading skeleton is displayed in the founder section

Given there are no published admin profiles
When visitor views the About page
Then a message like "Coming soon" is shown in the founder section
```

---

## US-007: Individual Profile Page Route

**Priority**: P1
**Dependencies**: US-002, US-003
**Estimated Effort**: Medium

### Description

As a visitor, I want to view a founder's full profile page at /profiles/[slug], so that I can learn more details about them and see their work.

### Acceptance Criteria

- [ ] Profile page route exists at /profiles/[slug]
- [ ] Page fetches profile data using getBySlug query
- [ ] Page displays all profile fields: photo, displayName, bio, location, skills, socialLinks, workingOnNow
- [ ] 404 page shown for non-existent or non-published profiles
- [ ] Page has proper metadata (title, description)
- [ ] Page is responsive and visually appealing

### Tasks

1. **Create app/profiles/[slug]/page.tsx**
   - Extract slug from params
   - Use `useQuery` with api.profiles.getBySlug
   - Handle loading state
   - Handle null response (show 404)
   - Pass profile to ProfilePage component

2. **Create components/profiles/ProfilePage.tsx**
   - Full-width hero with ProfilePhoto (xl size)
   - Display name as h1
   - Bio section with full text
   - Location indicator (if present)
   - Skills displayed as tags/chips
   - "What I'm Working On" section
   - SocialLinks with labels

3. **Create app/profiles/[slug]/not-found.tsx**
   - Styled 404 page for profile not found
   - Link back to About page

### Test Scenarios

```gherkin
Given a profile exists with slug="david-martinez" and profileStatus="published"
When visitor navigates to /profiles/david-martinez
Then the full profile page is displayed

Given a profile exists with slug="draft-user" and profileStatus="unlocked"
When visitor navigates to /profiles/draft-user
Then a 404 page is displayed

Given no profile exists with slug="nonexistent"
When visitor navigates to /profiles/nonexistent
Then a 404 page is displayed
```

---

## US-008: Profile Authored Content Display

**Priority**: P2
**Dependencies**: US-007
**Estimated Effort**: Medium

### Description

As a visitor on a founder's profile page, I want to see content they have authored (projects, experiments, articles, videos), so that I can explore their work.

### Acceptance Criteria

- [ ] `getAuthoredContent` query returns all published content by profile
- [ ] AuthoredContent component displays content grouped by type
- [ ] Empty content types are hidden (not shown with "0 items")
- [ ] Content items link to their respective pages
- [ ] Loading state handled properly

### Tasks

1. **Add getAuthoredContent query to convex/profiles.ts**
   - Accept profileId argument
   - Query projects by authorId index where isPublished=true
   - Query experiments by authorId index where isPublished=true
   - Query articles by authorId index
   - Query videos by authorId index where isPublished=true
   - Return grouped content with minimal fields

2. **Create components/profiles/AuthoredContent.tsx**
   - Accept authoredContent object prop
   - Section for each content type (if not empty)
   - Styled list of content items with links
   - Handle all empty case (show "No content yet" or hide entirely)

3. **Integrate into ProfilePage**
   - Fetch authored content using profile._id
   - Pass to AuthoredContent component

### Test Scenarios

```gherkin
Given a founder has 2 published projects and 1 published experiment
When their profile page loads
Then Projects section shows 2 items and Experiments section shows 1 item

Given a founder has no published content
When their profile page loads
Then the authored content section is hidden or shows "No content yet"

Given a founder has 1 published project but 0 videos
When their profile page loads
Then Projects section appears but Videos section does not
```

---

## US-009: Admin Profile Update Mutation

**Priority**: P2
**Dependencies**: US-001
**Estimated Effort**: Medium

### Description

As an admin, I need a mutation to update profile fields including slug, so that I can manage founder profiles through the admin interface.

### Acceptance Criteria

- [ ] `update` mutation requires admin role
- [ ] Can update: displayName, bio, slug, socialLinks, workingOnNow, skills, location, profileStatus
- [ ] Slug uniqueness is validated
- [ ] Invalid slug format throws error
- [ ] Only specified fields are updated (partial updates)
- [ ] Returns null on success

### Tasks

1. **Add update mutation to convex/profiles.ts**
   - Require admin role using requireRole
   - Accept profile id and optional fields
   - Validate slug format if provided (reuse validateSlug)
   - Check slug uniqueness if changed
   - Patch profile with provided fields
   - Return null

2. **Add slugExists helper function**
   - Check if slug already exists for another profile
   - Exclude current profile from uniqueness check

### Test Scenarios

```gherkin
Given an admin is authenticated
When they call update with valid profile id and new displayName
Then the profile's displayName is updated

Given an admin tries to set slug="existing-slug" that belongs to another profile
When update is called
Then an error is thrown about duplicate slug

Given a non-admin user attempts to call update
When the mutation executes
Then an authorization error is thrown
```

---

## US-010: Admin Photo Upload Functionality

**Priority**: P2
**Dependencies**: US-009
**Estimated Effort**: Small

### Description

As an admin, I need to upload profile photos using Convex file storage, so that founder profiles can display photos.

### Acceptance Criteria

- [ ] `generateUploadUrl` mutation requires admin role
- [ ] Returns a signed upload URL for Convex storage
- [ ] `getPhotoUrl` query converts storage ID to public URL
- [ ] Photo can be linked to profile via photoStorageId field
- [ ] Photos display correctly in ProfilePhoto component

### Tasks

1. **Add generateUploadUrl mutation to convex/profiles.ts**
   - Require admin role
   - Call ctx.storage.generateUploadUrl()
   - Return the URL string

2. **Add getPhotoUrl query to convex/profiles.ts**
   - Accept storageId argument
   - Call ctx.storage.getUrl(storageId)
   - Return URL or null

3. **Update ProfilePhoto component**
   - Handle both photoUrl (external) and photoStorageId (Convex storage)
   - Use getPhotoUrl query for storage IDs

### Test Scenarios

```gherkin
Given an admin is authenticated
When they call generateUploadUrl
Then a valid Convex upload URL is returned

Given a profile has photoStorageId set
When ProfilePhoto component renders
Then the photo is fetched from Convex storage and displayed
```

---

## US-011: Admin Profile List Page

**Priority**: P2
**Dependencies**: US-002, US-009
**Estimated Effort**: Medium

### Description

As an admin, I need a page to view all profiles and access profile editing, so that I can manage founder and member profiles.

### Acceptance Criteria

- [ ] Admin profile list page at /admin/profiles
- [ ] Requires admin authentication
- [ ] Lists all profiles with key fields (name, role, status)
- [ ] Each profile has link to edit page
- [ ] Can filter by role or status
- [ ] Matches existing admin page styling

### Tasks

1. **Add list query to convex/profiles.ts**
   - Return all profiles (admin only)
   - Include id, displayName, role, profileStatus, slug

2. **Create app/admin/profiles/page.tsx**
   - Require admin authentication
   - Fetch profiles using list query
   - Display in table format
   - Add links to edit pages
   - Add filter controls

### Test Scenarios

```gherkin
Given an admin is authenticated
When they navigate to /admin/profiles
Then they see a list of all profiles

Given a non-admin user
When they navigate to /admin/profiles
Then they are redirected or see unauthorized message
```

---

## US-012: Admin Profile Editor Page

**Priority**: P2
**Dependencies**: US-009, US-010, US-011
**Estimated Effort**: Medium

### Description

As an admin, I need a form to edit all profile fields including photo upload, so that I can update founder information.

### Acceptance Criteria

- [ ] Admin profile editor at /admin/profiles/[id]/edit
- [ ] Form includes all editable fields
- [ ] Photo upload with preview
- [ ] Slug auto-generation from displayName (editable)
- [ ] Social links section with URL inputs
- [ ] Skills as tag input
- [ ] Profile status dropdown
- [ ] Save and cancel buttons
- [ ] Success/error feedback on save

### Tasks

1. **Add get query to convex/profiles.ts**
   - Get single profile by ID for admin editing
   - Require admin role
   - Return all fields

2. **Create components/profiles/ProfileEditor.tsx**
   - Form with all profile fields
   - Photo upload component with preview
   - Auto-slug generation button
   - Skills tag input
   - Social links grouped inputs
   - Profile status select

3. **Create app/admin/profiles/[id]/edit/page.tsx**
   - Require admin authentication
   - Fetch profile using get query
   - Render ProfileEditor with profile data
   - Handle form submission
   - Show success/error toast

### Test Scenarios

```gherkin
Given an admin navigates to /admin/profiles/[id]/edit
When the page loads
Then all profile fields are populated in the form

Given an admin updates the bio and clicks Save
When the update succeeds
Then a success message is shown and data is persisted

Given an admin uploads a new photo
When the upload completes
Then the photo preview updates and storageId is saved
```

---

## US-013: Seed Founder Profile Data

**Priority**: P1
**Dependencies**: US-001, US-009
**Estimated Effort**: Small

### Description

As a developer, I need to seed the database with founder profiles for David and Nathan, so that the About page has content to display.

### Acceptance Criteria

- [ ] David and Nathan profiles created with role="admin"
- [ ] Both profiles have profileStatus="published"
- [ ] Slugs are set (e.g., "david", "nathan")
- [ ] Profile fields populated with real or placeholder content
- [ ] Seed script is idempotent (can be run multiple times safely)

### Tasks

1. **Create seed script or use Convex dashboard**
   - Create profile for David with all fields
   - Create profile for Nathan with all fields
   - Set role="admin" and profileStatus="published"
   - Generate appropriate slugs

2. **Document seed process**
   - Add instructions to README or setup docs

### Test Scenarios

```gherkin
Given the seed script has been run
When getFounders query is called
Then both David and Nathan profiles are returned

Given David's profile exists with slug="david"
When visiting /profiles/david
Then David's full profile is displayed
```

---

## US-014: Profile as Member Template Verification

**Priority**: P3
**Dependencies**: US-007, US-008
**Estimated Effort**: Small

### Description

As a developer implementing future member profiles, I need to verify the profile system is generic and reusable, so that member profiles can use the same components and queries.

### Acceptance Criteria

- [ ] ProfileCard renders correctly for any role (admin or member)
- [ ] ProfilePage renders correctly for any role
- [ ] getBySlug works for member profiles (when published)
- [ ] No founder-specific logic hardcoded in components
- [ ] Schema supports all needed member profile fields

### Tasks

1. **Review and verify components**
   - Ensure ProfileCard doesn't check for role="admin"
   - Ensure ProfilePage doesn't have founder-specific logic
   - Document any role-specific considerations

2. **Create test member profile (optional)**
   - Create a test profile with role="member"
   - Verify it renders correctly at /profiles/[slug]
   - Verify it doesn't appear on About page (correct behavior)

### Test Scenarios

```gherkin
Given a profile with role="member" and profileStatus="published"
When visiting their profile page at /profiles/[slug]
Then the profile renders correctly using the same components

Given a profile with role="member" and profileStatus="published"
When getFounders is called
Then the member profile is NOT included (admin only)

Given the ProfileCard component
When rendering a member profile
Then it displays correctly without errors
```

---

## Implementation Order

The user stories should be implemented in this order based on dependencies:

1. **US-001**: Schema Update (foundation - no dependencies)
2. **US-002**: Profile Queries (depends on US-001)
3. **US-003**: ProfilePhoto and SocialLinks components (depends on US-002)
4. **US-004**: ProfileCard component (depends on US-003)
5. **US-005**: Mission and Values sections (no dependencies, can parallel with US-002-004)
6. **US-006**: Founder Section and About page integration (depends on US-002, US-004, US-005)
7. **US-007**: Individual Profile Page (depends on US-002, US-003)
8. **US-008**: Authored Content display (depends on US-007)
9. **US-009**: Admin Update Mutation (depends on US-001)
10. **US-010**: Photo Upload (depends on US-009)
11. **US-011**: Admin Profile List (depends on US-002, US-009)
12. **US-012**: Admin Profile Editor (depends on US-009, US-010, US-011)
13. **US-013**: Seed Founder Data (depends on US-001, US-009, can run earlier manually)
14. **US-014**: Template Verification (depends on US-007, US-008)

### Parallel Tracks

- **Track A (Backend)**: US-001 -> US-002 -> US-009 -> US-010
- **Track B (Components)**: US-003 -> US-004 -> US-007 -> US-008
- **Track C (Static Content)**: US-005
- **Track D (Integration)**: US-006 (after Track A, B, C complete)
- **Track E (Admin)**: US-011 -> US-012 (after US-009, US-010)

---

## Summary

| Story | Title | Priority | Dependencies | Effort |
|-------|-------|----------|--------------|--------|
| US-001 | Schema Update | P0 | None | Small |
| US-002 | Profile Queries | P0 | US-001 | Medium |
| US-003 | ProfilePhoto & SocialLinks | P1 | US-002 | Small |
| US-004 | ProfileCard Component | P1 | US-003 | Small |
| US-005 | Mission & Values Sections | P1 | None | Small |
| US-006 | Founder Section | P1 | US-002, US-004, US-005 | Small |
| US-007 | Profile Page Route | P1 | US-002, US-003 | Medium |
| US-008 | Authored Content | P2 | US-007 | Medium |
| US-009 | Admin Update Mutation | P2 | US-001 | Medium |
| US-010 | Photo Upload | P2 | US-009 | Small |
| US-011 | Admin Profile List | P2 | US-002, US-009 | Medium |
| US-012 | Admin Profile Editor | P2 | US-009, US-010, US-011 | Medium |
| US-013 | Seed Founder Data | P1 | US-001, US-009 | Small |
| US-014 | Template Verification | P3 | US-007, US-008 | Small |

**Total Stories**: 14
**P0 (Foundation)**: 2
**P1 (Core Feature)**: 6
**P2 (Admin)**: 5
**P3 (Future-proofing)**: 1
