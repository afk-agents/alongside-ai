# Technical Implementation Plan: Founder Profiles & About Page

**Feature**: 006-founder-profiles-about-page
**Created**: 2026-01-17
**Spec Version**: 1.0

## Executive Summary

This plan outlines the technical implementation for transforming the placeholder About page into a comprehensive introduction to Alongside AI with mission, values, and founder biographies. The implementation extends the existing profiles system with URL slugs and builds reusable profile components that will serve as templates for future member profiles.

## Architecture Overview

### System Context

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│  /about                    │  /profiles/[slug]                   │
│  - Mission Section         │  - Full Profile Page                │
│  - Values Section          │  - Author's Content                 │
│  - Founder Cards           │  - Social Links                     │
│                            │                                      │
│  /admin/profiles           │                                      │
│  - Profile List            │                                      │
│  - Profile Editor          │                                      │
└─────────────┬───────────────────────────┬───────────────────────┘
              │                           │
              ▼                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Convex Backend                              │
├─────────────────────────────────────────────────────────────────┤
│  convex/profiles.ts                                              │
│  - getFounders() - Published admin profiles                      │
│  - getBySlug() - Profile by URL slug                            │
│  - update() - Admin edit profile                                 │
│  - getAuthoredContent() - Content by author                      │
│  - generateUploadUrl() - Photo upload                            │
└─────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Convex Database                             │
├─────────────────────────────────────────────────────────────────┤
│  profiles table (existing)                                       │
│  + slug: string (NEW - URL routing)                              │
│  + photoStorageId: Id<"_storage"> (NEW - Convex file storage)   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
components/
├── profiles/
│   ├── ProfileCard.tsx        # Compact card for About page
│   ├── ProfilePage.tsx        # Full profile page component
│   ├── ProfilePhoto.tsx       # Photo with fallback avatar
│   ├── SocialLinks.tsx        # Social link icons
│   ├── AuthoredContent.tsx    # Profile's content list
│   └── ProfileEditor.tsx      # Admin edit form
└── about/
    ├── MissionSection.tsx     # Mission statement
    ├── ValuesSection.tsx      # Core values
    └── FounderSection.tsx     # Founder profiles grid
```

## Data Model Changes

### Schema Update: Add `slug` to profiles table

```typescript
// convex/schema.ts - profiles table modification
profiles: defineTable({
  // ... existing fields ...

  // NEW: URL-friendly identifier for profile pages
  slug: v.optional(v.string()),

  // NEW: Convex file storage ID for profile photo
  photoStorageId: v.optional(v.id("_storage")),
})
  .index("by_userId", ["userId"])
  .index("by_role", ["role"])
  .index("by_profileStatus", ["profileStatus"])
  // NEW: Index for URL routing
  .index("by_slug", ["slug"])
  // NEW: Composite index for founders query
  .index("by_role_and_profileStatus", ["role", "profileStatus"])
```

**Rationale for `slug` field:**
- URL routing via `/profiles/[slug]` requires unique identifier
- Using `slug` instead of `userId` provides human-readable URLs
- Optional field allows backward compatibility with existing profiles
- Generated from displayName (e.g., "David Martinez" -> "david-martinez")

**Rationale for `photoStorageId` field:**
- Existing `photoUrl` can store external URLs or storage URLs
- `photoStorageId` specifically stores Convex file storage reference
- Allows proper file management and URL generation

### Index Justification

| Index | Purpose | Query Pattern |
|-------|---------|---------------|
| `by_slug` | Profile page routing | `getBySlug(slug)` |
| `by_role_and_profileStatus` | Founders query | Admin + Published profiles |

## API Design

### Convex Functions (convex/profiles.ts)

#### 1. `getFounders` - Query published admin profiles

```typescript
export const getFounders = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("profiles"),
    slug: v.string(),
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
  })),
  handler: async (ctx) => {
    // Query profiles with role="admin" AND profileStatus="published"
    // Using composite index by_role_and_profileStatus
  },
});
```

#### 2. `getBySlug` - Get profile by slug

```typescript
export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("profiles"),
      slug: v.string(),
      displayName: v.optional(v.string()),
      bio: v.optional(v.string()),
      photoUrl: v.optional(v.string()),
      socialLinks: v.optional(v.object({ /* ... */ })),
      workingOnNow: v.optional(v.string()),
      skills: v.optional(v.array(v.string())),
      location: v.optional(v.string()),
      role: v.union(v.literal("admin"), v.literal("member"), v.literal("guest")),
      profileStatus: v.union(
        v.literal("locked"),
        v.literal("unlocked"),
        v.literal("published")
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Query by slug, return null if not found OR not published
    // Published check prevents leaked data via direct URL access
  },
});
```

#### 3. `getAuthoredContent` - Get content authored by profile

```typescript
export const getAuthoredContent = query({
  args: { profileId: v.id("profiles") },
  returns: v.object({
    projects: v.array(v.object({
      _id: v.id("projects"),
      title: v.string(),
      slug: v.string(),
    })),
    experiments: v.array(v.object({
      _id: v.id("experiments"),
      title: v.string(),
      slug: v.string(),
      status: v.union(/* ... */),
    })),
    articles: v.array(v.object({
      _id: v.id("articles"),
      title: v.string(),
      slug: v.string(),
    })),
    videos: v.array(v.object({
      _id: v.id("videos"),
      title: v.string(),
      slug: v.string(),
    })),
  }),
  handler: async (ctx, args) => {
    // Query each content type by authorId index
    // Filter to published content only
  },
});
```

#### 4. `update` - Admin update profile (mutation)

```typescript
export const update = mutation({
  args: {
    id: v.id("profiles"),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    slug: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    socialLinks: v.optional(v.object({
      linkedin: v.optional(v.string()),
      twitter: v.optional(v.string()),
      github: v.optional(v.string()),
      website: v.optional(v.string()),
    })),
    workingOnNow: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    profileStatus: v.optional(v.union(
      v.literal("locked"),
      v.literal("unlocked"),
      v.literal("published")
    )),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Require admin role
    // Validate slug uniqueness if changed
    // Update profile fields
  },
});
```

#### 5. `generateUploadUrl` - Generate photo upload URL

```typescript
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    // Require admin role
    return await ctx.storage.generateUploadUrl();
  },
});
```

#### 6. `getPhotoUrl` - Get storage URL for photo

```typescript
export const getPhotoUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
```

## Frontend Implementation

### Page Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/about` | `app/about/page.tsx` | About page with mission, values, founders |
| `/profiles/[slug]` | `app/profiles/[slug]/page.tsx` | Individual profile page |
| `/admin/profiles` | `app/admin/profiles/page.tsx` | Admin profile management |
| `/admin/profiles/[id]/edit` | `app/admin/profiles/[id]/edit/page.tsx` | Admin profile editor |

### Component Specifications

#### ProfileCard Component

```typescript
// components/profiles/ProfileCard.tsx
interface ProfileCardProps {
  profile: {
    slug: string;
    displayName?: string;
    bio?: string;
    photoUrl?: string;
    socialLinks?: SocialLinks;
    workingOnNow?: string;
  };
  showViewProfile?: boolean; // Show "View Full Profile" link
}
```

Features:
- Responsive card layout
- Photo with fallback avatar (initials or placeholder)
- Truncated bio (max 2-3 lines with ellipsis)
- Social link icons
- Optional "View Full Profile" link

#### ProfilePage Component

```typescript
// components/profiles/ProfilePage.tsx
interface ProfilePageProps {
  profile: Profile;
  authoredContent: AuthoredContent;
}
```

Features:
- Full-width hero with photo
- Complete bio section
- Skills tags display
- Location indicator
- "What I'm Working On" section
- Social links with labels
- Authored content sections (projects, experiments, articles, videos)

#### ProfilePhoto Component

```typescript
// components/profiles/ProfilePhoto.tsx
interface ProfilePhotoProps {
  photoUrl?: string;
  displayName?: string;
  size?: "sm" | "md" | "lg" | "xl";
}
```

Features:
- Responsive image sizing
- Fallback to initials avatar when no photo
- Fallback to generic avatar when no name
- Proper aspect ratio and object-fit

#### SocialLinks Component

```typescript
// components/profiles/SocialLinks.tsx
interface SocialLinksProps {
  links: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  showLabels?: boolean; // Show text labels (for profile page)
  size?: "sm" | "md";
}
```

Features:
- Icons for each platform (LinkedIn, Twitter/X, GitHub, Globe)
- Opens in new tab
- Hides entire component if no links
- Optional text labels for accessibility

### About Page Structure

```tsx
// app/about/page.tsx
export default function AboutPage() {
  return (
    <div>
      <MissionSection />      {/* Hero with mission statement */}
      <ValuesSection />       {/* Core values grid */}
      <FounderSection />      {/* Founder profile cards */}
    </div>
  );
}
```

#### MissionSection Content

Static content (hardcoded initially):
- Large headline: "Building the future of AI, together"
- Mission paragraph explaining Alongside AI's purpose
- Visual accent (gradient background or image)

#### ValuesSection Content

Static values list:
1. **Community First** - We believe in the power of shared learning
2. **Practical Knowledge** - Real-world skills over theoretical
3. **Inclusive Access** - Making AI education accessible
4. **Continuous Growth** - Learning never stops

#### FounderSection

Dynamic content from `getFounders` query:
- Section heading: "Meet the Founders"
- Grid of ProfileCard components
- Loading state while fetching

## Implementation Strategy

### Phase 1: Data Layer (Backend)

1. **Schema Migration**
   - Add `slug` field to profiles table
   - Add `by_slug` index
   - Add `by_role_and_profileStatus` composite index
   - Add `photoStorageId` field

2. **Convex Functions**
   - Create `convex/profiles.ts` with all queries/mutations
   - Implement slug generation helper (reuse pattern from tags.ts)
   - Implement slug validation
   - Add photo storage URL generation

### Phase 2: Profile Components

3. **Base Components**
   - ProfilePhoto with fallback handling
   - SocialLinks with icons
   - ProfileCard for compact display

4. **Full Profile Page**
   - ProfilePage component
   - AuthoredContent component
   - Create `/profiles/[slug]` route

### Phase 3: About Page

5. **About Page Sections**
   - MissionSection component
   - ValuesSection component
   - FounderSection component
   - Update `/about` route

### Phase 4: Admin Interface

6. **Admin Profile Management**
   - Profile list page
   - Profile editor with photo upload
   - Slug management

## Security Considerations

### Authorization Model

| Action | Required Role | Validation |
|--------|--------------|------------|
| View About page | None | Public |
| View published profile | None | profileStatus="published" |
| View unpublished profile | None | Return 404 |
| Edit any profile | Admin | requireRole(ctx, ["admin"]) |
| Upload photo | Admin | requireRole(ctx, ["admin"]) |

### Data Protection

1. **Non-published profiles**: `getBySlug` returns `null` for non-published profiles, preventing data leakage
2. **Admin mutations**: All mutations require admin role via `requireRole`
3. **File uploads**: Upload URLs are scoped to authenticated admins only

## Testing Strategy

### Unit Tests (Convex Functions)

```typescript
// convex/profiles.test.ts
describe("profiles.getFounders", () => {
  it("returns only published admin profiles");
  it("excludes non-admin profiles");
  it("excludes unpublished admin profiles");
  it("returns empty array when no founders");
});

describe("profiles.getBySlug", () => {
  it("returns profile for valid slug");
  it("returns null for non-existent slug");
  it("returns null for unpublished profile");
});

describe("profiles.update", () => {
  it("requires admin role");
  it("validates slug uniqueness");
  it("updates specified fields only");
});
```

### Component Tests

```typescript
// ProfileCard
- renders photo or fallback avatar
- displays name and bio
- shows social links when available
- hides social links when empty
- links to profile page

// ProfilePage
- displays all profile fields
- shows authored content sections
- hides empty content sections
- handles missing optional fields

// AboutPage
- renders mission section
- renders values section
- renders founder cards
- handles loading state
- handles no founders state
```

### Integration Tests

```typescript
// About page flow
- visiting /about loads founder profiles
- founder cards link to profile pages
- social links open in new tabs

// Profile page flow
- visiting /profiles/[slug] shows profile
- visiting non-existent slug shows 404
- authored content links work correctly

// Admin flow
- admin can edit profile fields
- admin can upload photo
- admin can set profile status
- changes reflect on public pages
```

## Performance Considerations

### Query Optimization

1. **Composite index for founders**: `by_role_and_profileStatus` allows efficient founder query
2. **Parallel content queries**: `getAuthoredContent` fetches all content types in parallel
3. **Selective field projection**: Return only needed fields in queries

### Image Optimization

1. **Next.js Image component**: Automatic optimization and lazy loading
2. **Responsive images**: Serve appropriate sizes for different viewports
3. **Fallback handling**: Instant display of avatar fallback while image loads

### Caching Strategy

1. **Static content**: Mission and values sections don't require Convex queries
2. **Convex caching**: Real-time subscriptions provide automatic cache invalidation
3. **Image caching**: Leverage browser caching for profile photos

## Accessibility Requirements

1. **Semantic HTML**: Proper heading hierarchy, landmark regions
2. **Alt text**: Descriptive alt text for profile photos
3. **Link text**: Meaningful link text for social links (not just icons)
4. **Keyboard navigation**: All interactive elements accessible via keyboard
5. **Color contrast**: Ensure sufficient contrast for all text
6. **Screen reader support**: ARIA labels where needed

## Dependencies

### Existing Dependencies (No new packages required)
- Next.js 16 - App Router, Image optimization
- Convex - Database, file storage, real-time
- Tailwind CSS 4 - Styling
- React 19 - Components

### Social Icons
- Use inline SVG icons (no external dependency)
- Or use Heroicons if already in project

## Rollout Plan

### Phase 1: Backend & Core Components
- Schema migration with slug field
- Convex functions implementation
- Base profile components

### Phase 2: Public Pages
- Profile page route
- About page update
- Integration testing

### Phase 3: Admin Interface
- Admin profile list
- Profile editor
- Photo upload

### Data Seeding
- Create profiles for David and Nathan with:
  - role: "admin"
  - profileStatus: "published"
  - slug: derived from name
  - All profile fields populated

## Success Metrics

From spec success criteria:
- SC-001: About page loads within 2 seconds
- SC-002: 100% of published founder profiles display correctly
- SC-003: All social links clickable, open in new tabs
- SC-004: Profile pages display all populated fields without layout issues
- SC-005: Admin updates reflect within 5 seconds
- SC-006: Photo uploads complete and display correctly
- SC-007: Non-published profiles return 404 (no data leakage)

## Appendix: Slug Generation

Reuse the `generateSlug` and `validateSlug` functions from `convex/tags.ts`:

```typescript
// For profiles, generate from displayName
// "David Martinez" -> "david-martinez"
// "Nathan O'Brien" -> "nathan-obrien"

export function generateProfileSlug(displayName: string): string {
  return generateSlug(displayName); // Reuse existing function
}
```

## Appendix: File Structure

```
alongside-ai/
├── app/
│   ├── about/
│   │   └── page.tsx                    # Updated About page
│   ├── profiles/
│   │   └── [slug]/
│   │       └── page.tsx                # Profile page
│   └── admin/
│       └── profiles/
│           ├── page.tsx                # Profile list
│           └── [id]/
│               └── edit/
│                   └── page.tsx        # Profile editor
├── components/
│   ├── about/
│   │   ├── MissionSection.tsx
│   │   ├── ValuesSection.tsx
│   │   └── FounderSection.tsx
│   └── profiles/
│       ├── ProfileCard.tsx
│       ├── ProfilePage.tsx
│       ├── ProfilePhoto.tsx
│       ├── SocialLinks.tsx
│       ├── AuthoredContent.tsx
│       └── ProfileEditor.tsx
└── convex/
    ├── schema.ts                       # Updated with slug field
    └── profiles.ts                     # New - profile functions
```
