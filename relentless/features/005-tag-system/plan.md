# Implementation Plan: Tag System

**Branch**: `005-tag-system` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)

## Summary

Implement a unified tag taxonomy system enabling cross-content discovery. The `tags` table already exists in the Convex schema; this feature adds Convex queries/mutations for tag CRUD operations, queries to fetch content by tag, and React components for tag display and navigation.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 16
**Primary Dependencies**: Convex, @convex-dev/auth, Tailwind CSS v4
**Storage**: Convex (real-time database)
**Testing**: Vitest + React Testing Library
**Target Platform**: Web (Next.js App Router)
**Project Type**: Web application (Next.js + Convex)
**Performance Goals**: Tag pages load < 2 seconds with 100 content items
**Constraints**: Follow TDD, all Convex functions require args/returns validators

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| Type Safety | PASS | All functions will have args/returns validators |
| Testing (TDD) | PASS | Tests written before implementation |
| Code Quality | PASS | Lint, typecheck, test gates enforced |
| Next.js App Router | PASS | Pages in `app/tags/` directory |
| Convex Backend | PASS | Domain-based organization in `convex/tags.ts` |
| Version Control | PASS | Conventional commits per story |

## Project Structure

### Documentation (this feature)

```text
relentless/features/005-tag-system/
├── spec.md              # Feature specification
├── plan.md              # This file
├── tasks.md             # User stories and tasks (next step)
├── checklist.md         # Quality validation checklist
└── progress.txt         # Progress log
```

### Source Code (new files)

```text
# Convex Backend
convex/
└── tags.ts              # Tag CRUD operations and content queries

# Frontend Components
components/
└── tags/
    ├── TagBadge.tsx          # Clickable tag badge component
    ├── TagList.tsx           # List of tag badges for content items
    └── TagContentSection.tsx # Content section on tag detail page

# Frontend Pages
app/
└── tags/
    ├── page.tsx              # /tags - All tags listing
    └── [slug]/
        └── page.tsx          # /tags/[slug] - Tag detail page

# Tests
__tests__/
├── convex/
│   └── tags.test.ts          # Convex function unit tests
└── components/
    └── tags/
        ├── TagBadge.test.tsx
        ├── TagList.test.tsx
        └── TagContentSection.test.tsx
```

## Data Models

### Existing Schema (convex/schema.ts)

The `tags` table already exists:

```typescript
tags: defineTable({
  name: v.string(),        // Display name (e.g., "LangChain")
  slug: v.string(),        // URL-friendly identifier
  description: v.optional(v.string()),
})
  .index("by_slug", ["slug"])
  .index("by_name", ["name"]),
```

Content types already have tag references:
- `events.tags: v.optional(v.array(v.id("tags")))`
- `projects.tags: v.optional(v.array(v.id("tags")))`
- `experiments.tags: v.optional(v.array(v.id("tags")))`
- `articles.tags: v.optional(v.array(v.id("tags")))`
- `videos.tags: v.optional(v.array(v.id("tags")))`

### Schema Addition Required

Add index for efficient content-by-tag queries. Since Convex doesn't support querying "where array contains value", we need to query all content and filter, OR add a junction table. For MVP with small content volume, filtering is acceptable.

**Decision**: Use client-side filtering for MVP. Content types already have `tags` field. For each content type, query all published items and filter by tag ID. This is acceptable for initial scale (<1000 content items total).

## API Contracts

### Public Queries (convex/tags.ts)

#### `tags.list`
List all tags sorted alphabetically with content counts.

```typescript
export const list = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("tags"),
    _creationTime: v.number(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    contentCount: v.number(),
  })),
  handler: async (ctx) => { /* ... */ },
});
```

#### `tags.getBySlug`
Get a single tag by slug. Returns null if not found.

```typescript
export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("tags"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => { /* ... */ },
});
```

#### `tags.getContentByTagId`
Get all published content for a tag, grouped by content type.

```typescript
export const getContentByTagId = query({
  args: { tagId: v.id("tags") },
  returns: v.object({
    events: v.array(v.object({
      _id: v.id("events"),
      title: v.string(),
      slug: v.string(),
      date: v.number(),
      isVirtual: v.boolean(),
    })),
    projects: v.array(v.object({
      _id: v.id("projects"),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
    })),
    experiments: v.array(v.object({
      _id: v.id("experiments"),
      title: v.string(),
      slug: v.string(),
      status: v.string(),
    })),
    articles: v.array(v.object({
      _id: v.id("articles"),
      title: v.string(),
      slug: v.string(),
      publishedAt: v.number(),
    })),
    videos: v.array(v.object({
      _id: v.id("videos"),
      title: v.string(),
      slug: v.string(),
      youtubeId: v.string(),
    })),
  }),
  handler: async (ctx, args) => { /* ... */ },
});
```

#### `tags.getByIds`
Get multiple tags by their IDs (for displaying tags on content items).

```typescript
export const getByIds = query({
  args: { tagIds: v.array(v.id("tags")) },
  returns: v.array(v.object({
    _id: v.id("tags"),
    name: v.string(),
    slug: v.string(),
  })),
  handler: async (ctx, args) => { /* ... */ },
});
```

### Admin Mutations (convex/tags.ts)

#### `tags.create`
Create a new tag (admin only).

```typescript
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.id("tags"),
  handler: async (ctx, args) => {
    // Require admin role
    // Auto-generate slug if not provided
    // Validate slug uniqueness
    // Insert tag
  },
});
```

#### `tags.update`
Update tag name/description (admin only). Slug is immutable.

```typescript
export const update = mutation({
  args: {
    id: v.id("tags"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Require admin role
    // Patch tag (excluding slug)
  },
});
```

#### `tags.remove`
Delete a tag and remove from all content (admin only).

```typescript
export const remove = mutation({
  args: { id: v.id("tags") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Require admin role
    // Remove tag ID from all content types
    // Delete tag
  },
});
```

### Helper Functions (convex/tags.ts)

#### `generateSlug`
Generate URL-friendly slug from name.

```typescript
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}
```

#### `validateSlug`
Validate slug format.

```typescript
function validateSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,48}[a-z0-9]$/.test(slug) ||
         /^[a-z0-9]{1,2}$/.test(slug);
}
```

## Component Design

### TagBadge

Clickable pill/badge displaying a single tag.

```typescript
interface TagBadgeProps {
  tag: { name: string; slug: string };
  size?: "sm" | "md";
}
```

- Links to `/tags/[slug]`
- Tailwind styling: rounded pill, hover state
- Accessible: proper link semantics

### TagList

Displays a list of tags for a content item.

```typescript
interface TagListProps {
  tagIds: Id<"tags">[];
  size?: "sm" | "md";
}
```

- Uses `tags.getByIds` query
- Renders nothing if tagIds is empty/undefined
- Horizontal flex layout with wrapping

### TagContentSection

Section on tag detail page showing content of one type.

```typescript
interface TagContentSectionProps {
  title: string;
  items: ContentItem[];
  linkPrefix: string; // e.g., "/events", "/projects"
}
```

- Displays section title with item count
- Lists content items with links
- Hidden when items array is empty

## Implementation Strategy

### Phase 1: Backend (Convex Functions)

1. Create `convex/tags.ts` with public queries
2. Add admin mutations with role checks
3. Add helper functions for slug generation/validation
4. Write unit tests for all functions

### Phase 2: Tag Components

1. Create `TagBadge` component
2. Create `TagList` component
3. Create `TagContentSection` component
4. Write component tests

### Phase 3: Tag Pages

1. Create `/tags` listing page
2. Create `/tags/[slug]` detail page
3. Add 404 handling for non-existent tags
4. Write page tests

### Phase 4: Integration

1. Add TagList to content detail pages (placeholder for future content pages)
2. Verify end-to-end functionality
3. Run full test suite

## Testing Strategy

### Unit Tests (Convex Functions)

Test files: `__tests__/convex/tags.test.ts`

- `tags.list`: Returns tags sorted alphabetically, includes content counts
- `tags.getBySlug`: Returns tag or null for non-existent
- `tags.getContentByTagId`: Returns grouped content, filters unpublished
- `tags.getByIds`: Returns matching tags
- `tags.create`: Validates admin role, generates slug, enforces uniqueness
- `tags.update`: Validates admin role, updates only name/description
- `tags.remove`: Validates admin role, removes from content, deletes tag

### Component Tests

Test files: `__tests__/components/tags/*.test.tsx`

- `TagBadge`: Renders link with correct href, displays name
- `TagList`: Renders multiple badges, handles empty state
- `TagContentSection`: Renders items, hides when empty

### Integration Tests (Page Level)

- `/tags` page loads and displays all tags
- `/tags/[slug]` page shows correct content
- `/tags/nonexistent` shows 404

## Security Considerations

### Authorization

- **Public queries**: `list`, `getBySlug`, `getContentByTagId`, `getByIds` - no auth required
- **Admin mutations**: `create`, `update`, `remove` - require admin role via `requireRole(ctx, ["admin"])`

### Data Validation

- Slug format validated (lowercase, hyphens, no special chars)
- Slug uniqueness enforced at creation
- Content filtering ensures only published items visible

### Input Sanitization

- Tag names limited to reasonable length (e.g., 100 chars)
- Slug auto-generated from name if not provided
- Description is optional, no special validation needed

## Rollout Plan

### Deployment Strategy

Feature is additive - no migrations needed. Deploy in order:
1. Convex functions (backend)
2. React components
3. Next.js pages

### Feature Flag

Not required - pages are new routes that don't affect existing functionality.

### Monitoring

- Convex dashboard for function errors
- Check tag page load times in browser dev tools

### Rollback Plan

If issues arise:
1. Revert Convex function changes
2. Revert React components
3. Pages become 404 (acceptable rollback state)

## Dependencies Between User Stories

```
US-4 (Admin Creates Tag) ──┬──> US-1 (View Tag Page)
                           └──> US-3 (Browse All Tags)
                                      ↓
US-5 (Admin Assigns Tags) ──────> US-2 (Click Tag on Content)
                                      ↓
US-6 (Admin Edits Tag) ─────────────┘

US-7 (Admin Deletes Tag) ─── independent cleanup capability
```

**Implementation Order**:
1. US-4: Admin Creates Tag (prerequisite for all others)
2. US-1: View Tag Page (core value)
3. US-2: Click Tag on Content Item (entry point)
4. US-3: Browse All Tags (discovery)
5. US-5: Admin Assigns Tags to Content
6. US-6: Admin Edits Tag
7. US-7: Admin Deletes Tag
