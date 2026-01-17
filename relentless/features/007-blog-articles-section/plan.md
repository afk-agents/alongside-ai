# Technical Implementation Plan: Blog/Articles Section

**Feature**: 007-blog-articles-section
**Created**: 2026-01-17
**Spec Version**: 1.0

## Executive Summary

This plan outlines the technical implementation for a complete blog/articles section including article listing, individual article pages with rich Markdown rendering, tag-based filtering, author attribution, related content discovery, admin CRUD operations, and Substack RSS import. The implementation leverages the existing schema (articles table already defined), profiles system (for author attribution), and tag system (for categorization and filtering).

## Architecture Overview

### System Context

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                               │
├─────────────────────────────────────────────────────────────────────────┤
│  /blog                          │  /blog/[slug]                          │
│  - Article listing              │  - Full article content                │
│  - Tag filter chips             │  - Author attribution                  │
│  - Pagination                   │  - Related articles                    │
│  - Featured section             │  - Tag links                           │
│                                 │  - Substack source link                │
│                                 │                                        │
│  /admin/articles                │  /admin/articles/new                   │
│  - Article list table           │  - Create article form                 │
│  - Status badges                │  - Markdown editor                     │
│  - Quick actions                │  - Author selector                     │
│                                 │  - Tag multi-select                    │
│                                 │                                        │
│  /admin/articles/[id]/edit      │  /admin/articles/import                │
│  - Edit article form            │  - RSS URL input                       │
│  - Preview functionality        │  - Import preview list                 │
│                                 │  - Selective import                    │
└─────────────┬───────────────────────────────┬───────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Convex Backend                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  convex/articles.ts                                                      │
│  - list() - Public article listing with pagination                       │
│  - getBySlug() - Single article with author                              │
│  - getRelated() - Related articles by tags                               │
│  - listByTag() - Articles filtered by tag                                │
│  - listAdmin() - All articles for admin                                  │
│  - get() - Single article for editing (admin)                            │
│  - create() - Create new article (admin)                                 │
│  - update() - Update article (admin)                                     │
│  - remove() - Delete article (admin)                                     │
│  - parseRssFeed() - Parse Substack RSS (action)                          │
│  - importFromRss() - Import articles from RSS (mutation)                 │
└─────────────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Convex Database                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  articles table (EXISTING - schema already defined)                      │
│  - title: string                                                         │
│  - slug: string                                                          │
│  - content: string (Markdown)                                            │
│  - authorId: Id<"profiles">                                              │
│  - publishedAt: number                                                   │
│  - excerpt?: string                                                      │
│  - tags?: Id<"tags">[]                                                   │
│  - substackUrl?: string                                                  │
│  - isFeatured?: boolean                                                  │
│                                                                          │
│  Indexes (EXISTING):                                                     │
│  - by_slug                                                               │
│  - by_authorId                                                           │
│  - by_publishedAt                                                        │
│  - by_isFeatured_and_publishedAt                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
components/
├── articles/
│   ├── ArticleCard.tsx           # Compact card for listing
│   ├── ArticlePage.tsx           # Full article page layout
│   ├── ArticleContent.tsx        # Markdown renderer with sanitization
│   ├── ArticleHeader.tsx         # Title, date, author, tags
│   ├── ArticleMeta.tsx           # Author attribution component
│   ├── RelatedArticles.tsx       # Related content section
│   ├── ArticleList.tsx           # Article grid/list with loading
│   ├── ArticleFilters.tsx        # Tag filter chips
│   ├── FeaturedArticles.tsx      # Featured section for listing
│   ├── ArticleEditor.tsx         # Admin create/edit form
│   ├── MarkdownPreview.tsx       # Live preview in editor
│   └── RssImporter.tsx           # Substack RSS import UI
└── admin/
    └── articles/                  # Admin-specific article components
        └── ArticleTable.tsx       # Admin list table
```

## Data Model

### Schema (EXISTING - No Changes Required)

The articles table is already defined in `convex/schema.ts`:

```typescript
// convex/schema.ts - articles table (already exists)
articles: defineTable({
  // Required fields
  title: v.string(),
  slug: v.string(),                    // URL-friendly identifier
  content: v.string(),                 // Full article content (Markdown/HTML)
  authorId: v.id("profiles"),          // Author profile reference
  publishedAt: v.number(),             // Publication timestamp (Unix ms)

  // Optional fields
  excerpt: v.optional(v.string()),     // Short preview text
  tags: v.optional(v.array(v.id("tags"))),  // Category tags
  substackUrl: v.optional(v.string()), // Link back to Substack
  isFeatured: v.optional(v.boolean()), // Homepage feature flag
})
  .index("by_slug", ["slug"])                              // URL routing
  .index("by_authorId", ["authorId"])                      // Author's articles
  .index("by_publishedAt", ["publishedAt"])                // Chronological listing
  .index("by_isFeatured_and_publishedAt", ["isFeatured", "publishedAt"])  // Featured articles
```

### Index Utilization

| Index | Purpose | Query Pattern |
|-------|---------|---------------|
| `by_slug` | Article page routing | `getBySlug(slug)` - efficient O(1) lookup |
| `by_authorId` | Author's articles | `listByAuthor(authorId)` - already used in `profiles.getAuthoredContent` |
| `by_publishedAt` | Chronological listing | `list()` - newest first pagination |
| `by_isFeatured_and_publishedAt` | Featured articles | `listFeatured()` - featured sorted by date |

### Related Entities (Already Integrated)

1. **Profiles** (existing integration)
   - Articles reference profiles via `authorId`
   - `profiles.getAuthoredContent` already queries articles by author
   - Public profiles have `slug` for URL routing

2. **Tags** (existing integration)
   - Articles use `tags?: Id<"tags">[]` for categorization
   - `tags.list` already counts articles in `contentCount`
   - `tags.getContentByTagId` already returns articles for a tag
   - `tags.remove` already removes tag from articles when deleted

## API Design

### Convex Functions (convex/articles.ts)

#### 1. `list` - Public article listing with pagination

```typescript
export const list = query({
  args: {
    limit: v.optional(v.number()),     // Default: 10
    cursor: v.optional(v.string()),    // Pagination cursor (publishedAt timestamp)
    tagId: v.optional(v.id("tags")),   // Optional tag filter
  },
  returns: v.object({
    articles: v.array(v.object({
      _id: v.id("articles"),
      title: v.string(),
      slug: v.string(),
      excerpt: v.optional(v.string()),
      publishedAt: v.number(),
      isFeatured: v.optional(v.boolean()),
      author: v.union(
        v.object({
          _id: v.id("profiles"),
          displayName: v.optional(v.string()),
          slug: v.optional(v.string()),
          photoUrl: v.optional(v.string()),
        }),
        v.null()
      ),
      tags: v.array(v.object({
        _id: v.id("tags"),
        name: v.string(),
        slug: v.string(),
      })),
    })),
    nextCursor: v.union(v.string(), v.null()),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    // Query articles by publishedAt index, newest first
    let query = ctx.db
      .query("articles")
      .withIndex("by_publishedAt")
      .order("desc");

    // Apply cursor if provided (skip articles newer than cursor)
    // Apply tag filter if provided (post-query filter)
    // Join author profile and tags
    // Return paginated results with nextCursor
  },
});
```

#### 2. `listFeatured` - Featured articles for homepage/listing hero

```typescript
export const listFeatured = query({
  args: {
    limit: v.optional(v.number()),  // Default: 3
  },
  returns: v.array(v.object({
    _id: v.id("articles"),
    title: v.string(),
    slug: v.string(),
    excerpt: v.optional(v.string()),
    publishedAt: v.number(),
    author: v.union(
      v.object({
        displayName: v.optional(v.string()),
        slug: v.optional(v.string()),
      }),
      v.null()
    ),
  })),
  handler: async (ctx, args) => {
    // Query using by_isFeatured_and_publishedAt index
    // Filter isFeatured === true
    // Order by publishedAt desc
    // Limit results
  },
});
```

#### 3. `getBySlug` - Single article with full details

```typescript
export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("articles"),
      title: v.string(),
      slug: v.string(),
      content: v.string(),
      excerpt: v.optional(v.string()),
      publishedAt: v.number(),
      substackUrl: v.optional(v.string()),
      isFeatured: v.optional(v.boolean()),
      author: v.union(
        v.object({
          _id: v.id("profiles"),
          displayName: v.optional(v.string()),
          slug: v.optional(v.string()),
          photoUrl: v.optional(v.string()),
          bio: v.optional(v.string()),
        }),
        v.null()
      ),
      tags: v.array(v.object({
        _id: v.id("tags"),
        name: v.string(),
        slug: v.string(),
      })),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Query by slug index
    // Join author profile (published profiles only)
    // Join tags
    // Return null if not found
  },
});
```

#### 4. `getRelated` - Related articles by shared tags

```typescript
export const getRelated = query({
  args: {
    articleId: v.id("articles"),
    limit: v.optional(v.number()),  // Default: 3
  },
  returns: v.array(v.object({
    _id: v.id("articles"),
    title: v.string(),
    slug: v.string(),
    excerpt: v.optional(v.string()),
    publishedAt: v.number(),
    sharedTagCount: v.number(),  // For relevance sorting
  })),
  handler: async (ctx, args) => {
    // Get current article's tags
    // Find articles sharing at least one tag (excluding current)
    // Sort by sharedTagCount desc, then publishedAt desc
    // If no shared tags, return recent articles by same author
    // If still empty, return empty array
  },
});
```

#### 5. `listAdmin` - All articles for admin (includes drafts if added)

```typescript
export const listAdmin = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("articles"),
    title: v.string(),
    slug: v.string(),
    publishedAt: v.number(),
    isFeatured: v.optional(v.boolean()),
    authorName: v.optional(v.string()),
    tagCount: v.number(),
  })),
  handler: async (ctx) => {
    // Require admin role
    // Query all articles, newest first
    // Join author displayName
    // Return list with minimal fields for table display
  },
});
```

#### 6. `get` - Single article for editing (admin)

```typescript
export const get = query({
  args: { id: v.id("articles") },
  returns: v.union(
    v.object({
      _id: v.id("articles"),
      title: v.string(),
      slug: v.string(),
      content: v.string(),
      authorId: v.id("profiles"),
      publishedAt: v.number(),
      excerpt: v.optional(v.string()),
      tags: v.optional(v.array(v.id("tags"))),
      substackUrl: v.optional(v.string()),
      isFeatured: v.optional(v.boolean()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Require admin role
    // Return full article data
  },
});
```

#### 7. `create` - Create new article (admin mutation)

```typescript
export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    authorId: v.id("profiles"),
    publishedAt: v.optional(v.number()),  // Default: now
    excerpt: v.optional(v.string()),
    tags: v.optional(v.array(v.id("tags"))),
    substackUrl: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
  },
  returns: v.id("articles"),
  handler: async (ctx, args) => {
    // Require admin role
    // Validate slug format (reuse validateSlug from tags.ts)
    // Check slug uniqueness
    // Verify authorId exists and is published
    // Verify all tagIds exist
    // Auto-generate excerpt if not provided (first 160 chars of content)
    // Insert article
    // Return new article ID
  },
});
```

#### 8. `update` - Update article (admin mutation)

```typescript
export const update = mutation({
  args: {
    id: v.id("articles"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    authorId: v.optional(v.id("profiles")),
    publishedAt: v.optional(v.number()),
    excerpt: v.optional(v.string()),
    tags: v.optional(v.array(v.id("tags"))),
    substackUrl: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Require admin role
    // Verify article exists
    // Validate slug uniqueness if changed
    // Verify authorId if changed
    // Verify tagIds if changed
    // Build patch object with only provided fields
    // Apply patch
  },
});
```

#### 9. `remove` - Delete article (admin mutation)

```typescript
export const remove = mutation({
  args: { id: v.id("articles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Require admin role
    // Verify article exists
    // Delete article
  },
});
```

#### 10. `parseRssFeed` - Parse Substack RSS (action)

```typescript
export const parseRssFeed = action({
  args: { rssUrl: v.string() },
  returns: v.array(v.object({
    title: v.string(),
    content: v.string(),
    publishedAt: v.number(),
    substackUrl: v.string(),
    excerpt: v.optional(v.string()),
    alreadyImported: v.boolean(),  // Check if substackUrl exists
  })),
  handler: async (ctx, args) => {
    // Require admin role
    // Validate URL format
    // Fetch RSS feed
    // Parse XML (use DOMParser or xml2js)
    // Extract title, content:encoded, pubDate, link
    // Check each item against existing substackUrl
    // Return parsed items for preview
  },
});
```

#### 11. `importFromRss` - Import selected articles (mutation)

```typescript
export const importFromRss = mutation({
  args: {
    items: v.array(v.object({
      title: v.string(),
      content: v.string(),
      publishedAt: v.number(),
      substackUrl: v.string(),
      excerpt: v.optional(v.string()),
    })),
    authorId: v.id("profiles"),
    tags: v.optional(v.array(v.id("tags"))),
  },
  returns: v.object({
    imported: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx, args) => {
    // Require admin role
    // For each item:
    //   - Generate slug from title
    //   - Check for duplicate substackUrl
    //   - Insert if new, skip if exists
    // Return counts
  },
});
```

## Frontend Implementation

### Page Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/blog` | `app/blog/page.tsx` | Article listing with filters |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | Individual article page |
| `/admin/articles` | `app/admin/articles/page.tsx` | Admin article list |
| `/admin/articles/new` | `app/admin/articles/new/page.tsx` | Create article form |
| `/admin/articles/[id]/edit` | `app/admin/articles/[id]/edit/page.tsx` | Edit article form |
| `/admin/articles/import` | `app/admin/articles/import/page.tsx` | Substack RSS import |

### Component Specifications

#### ArticleCard Component

```typescript
// components/articles/ArticleCard.tsx
interface ArticleCardProps {
  article: {
    title: string;
    slug: string;
    excerpt?: string;
    publishedAt: number;
    author: {
      displayName?: string;
      slug?: string;
      photoUrl?: string;
    } | null;
    tags: Array<{ name: string; slug: string }>;
  };
  variant?: "default" | "featured";
}
```

Features:
- Title with link to article
- Excerpt (truncated to 2-3 lines)
- Publication date (formatted: "Jan 17, 2026")
- Author name with link to profile
- Tag badges (using existing TagBadge component)
- Hover effect for interactivity
- Featured variant with larger styling

#### ArticlePage Component

```typescript
// components/articles/ArticlePage.tsx
interface ArticlePageProps {
  article: {
    _id: Id<"articles">;
    title: string;
    content: string;
    publishedAt: number;
    substackUrl?: string;
    author: { ... } | null;
    tags: Array<{ _id: Id<"tags">; name: string; slug: string }>;
  };
}
```

Features:
- Article header (title, date, author)
- Tag list
- Markdown-rendered content
- Substack link (if available)
- Related articles section

#### ArticleContent Component (Markdown Renderer)

```typescript
// components/articles/ArticleContent.tsx
interface ArticleContentProps {
  content: string;  // Markdown content
}
```

Features:
- Use `react-markdown` for rendering
- Use `remark-gfm` for GitHub-flavored markdown (tables, strikethrough)
- Use `rehype-sanitize` for XSS protection
- Use `rehype-highlight` or `rehype-prism-plus` for code syntax highlighting
- Custom component mapping for headings (id anchors), links (external in new tab), images (responsive)

#### ArticleMeta Component

```typescript
// components/articles/ArticleMeta.tsx
interface ArticleMetaProps {
  author: {
    displayName?: string;
    slug?: string;
    photoUrl?: string;
  } | null;
  publishedAt: number;
  size?: "sm" | "md";
}
```

Features:
- Author photo (small, using ProfilePhoto component)
- Author name with link to profile
- Publication date formatted
- "Unknown Author" fallback if author null

#### RelatedArticles Component

```typescript
// components/articles/RelatedArticles.tsx
interface RelatedArticlesProps {
  articleId: Id<"articles">;
}
```

Features:
- Uses `articles.getRelated` query
- Displays up to 3 related articles
- Shows article title, date, shared tag indicator
- Hidden if no related articles

#### ArticleList Component

```typescript
// components/articles/ArticleList.tsx
interface ArticleListProps {
  initialTagId?: Id<"tags">;
}
```

Features:
- Uses `articles.list` query with pagination
- Tag filter state management
- Loading skeleton while fetching
- "Load More" button or infinite scroll
- Empty state message

#### ArticleFilters Component

```typescript
// components/articles/ArticleFilters.tsx
interface ArticleFiltersProps {
  selectedTagId?: Id<"tags">;
  onTagSelect: (tagId: Id<"tags"> | undefined) => void;
}
```

Features:
- Fetches popular tags (top by content count)
- Horizontal scrollable chip list
- Active state for selected tag
- "All Articles" reset option

#### ArticleEditor Component

```typescript
// components/articles/ArticleEditor.tsx
interface ArticleEditorProps {
  article?: Article;  // Undefined for create, defined for edit
  onSuccess?: () => void;
}
```

Features:
- Form fields: title, slug (auto-generated from title), content, excerpt
- Author selector (dropdown of published profiles)
- Tag multi-select (using existing tag list)
- Publication date picker (default: now)
- Featured toggle
- Substack URL field
- Split view: editor | preview
- Save button with loading state
- Validation error display

#### MarkdownPreview Component

```typescript
// components/articles/MarkdownPreview.tsx
interface MarkdownPreviewProps {
  content: string;
}
```

Features:
- Live preview of Markdown content
- Uses same rendering as ArticleContent
- Scroll sync with editor (optional)

#### RssImporter Component

```typescript
// components/articles/RssImporter.tsx
```

Features:
- RSS URL input field
- "Fetch" button to parse feed
- Preview list of articles with checkboxes
- Already-imported indicator (disabled checkbox)
- Author selector (for all imported articles)
- Tag selector (optional, applied to all)
- "Import Selected" button
- Progress/result feedback

### Blog Page Structure

```tsx
// app/blog/page.tsx
"use client";

export default function BlogPage() {
  const [selectedTag, setSelectedTag] = useState<Id<"tags"> | undefined>();
  const featured = useQuery(api.articles.listFeatured);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <h1 className="text-3xl font-bold">Blog</h1>
      <p className="text-gray-600 mt-2">
        Insights, tutorials, and updates from the Alongside AI team.
      </p>

      {/* Featured Section (only when no filter active) */}
      {!selectedTag && featured && featured.length > 0 && (
        <FeaturedArticles articles={featured} />
      )}

      {/* Filter Chips */}
      <ArticleFilters
        selectedTagId={selectedTag}
        onTagSelect={setSelectedTag}
      />

      {/* Article List */}
      <ArticleList initialTagId={selectedTag} />
    </div>
  );
}
```

### Article Page Structure

```tsx
// app/blog/[slug]/page.tsx
"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { notFound } from "next/navigation";

export default function ArticleRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const article = useQuery(api.articles.getBySlug, { slug });

  // Loading state
  if (article === undefined) {
    return <ArticleSkeleton />;
  }

  // Not found
  if (article === null) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      {/* Article Header */}
      <ArticleHeader article={article} />

      {/* Content */}
      <ArticleContent content={article.content} />

      {/* Substack Link */}
      {article.substackUrl && (
        <SubstackLink url={article.substackUrl} />
      )}

      {/* Related Articles */}
      <RelatedArticles articleId={article._id} />
    </article>
  );
}
```

## Dependencies

### New Package Requirements

```bash
# Markdown rendering
bun add react-markdown remark-gfm rehype-sanitize rehype-highlight

# RSS parsing (for action)
bun add rss-parser
```

| Package | Purpose | Version |
|---------|---------|---------|
| `react-markdown` | Markdown to React components | ^9.x |
| `remark-gfm` | GitHub-flavored markdown support | ^4.x |
| `rehype-sanitize` | XSS protection for HTML | ^6.x |
| `rehype-highlight` | Code syntax highlighting | ^7.x |
| `rss-parser` | Parse RSS feeds in Convex action | ^3.x |

### Existing Dependencies (No changes)
- Next.js 16 - App Router, routing
- Convex - Database, real-time, actions
- Tailwind CSS 4 - Styling
- React 19 - Components

## Implementation Strategy

### Phase 1: Backend Queries & Mutations (P1)

**Story 1.1: Core Article Queries**
- Implement `articles.list` with pagination
- Implement `articles.getBySlug` with author/tag joins
- Implement `articles.listFeatured`
- Implement `articles.getRelated`

**Story 1.2: Admin Article Mutations**
- Implement `articles.listAdmin` (admin list)
- Implement `articles.get` (admin single)
- Implement `articles.create`
- Implement `articles.update`
- Implement `articles.remove`

### Phase 2: Public Article Pages (P1)

**Story 2.1: Article Listing Page**
- Create `ArticleCard` component
- Create `ArticleList` component with loading states
- Update `/blog` page with real data
- Implement empty state

**Story 2.2: Individual Article Page**
- Add `react-markdown` and related packages
- Create `ArticleContent` component with sanitization
- Create `ArticleHeader` component
- Create `ArticleMeta` component
- Create `/blog/[slug]` page
- Create not-found page

### Phase 3: Tag Filtering (P2)

**Story 3.1: Tag Filter Integration**
- Create `ArticleFilters` component
- Add tag filter state to blog page
- Update `ArticleList` to accept tag filter
- Add active filter indicator
- Add clear filter functionality

### Phase 4: Related Content & Author Links (P2)

**Story 4.1: Related Articles**
- Create `RelatedArticles` component
- Integrate into article page
- Handle empty state (same author fallback)

**Story 4.2: Author Attribution**
- Create author link in article header
- Verify profile page shows articles (already implemented in `getAuthoredContent`)

### Phase 5: Featured Articles (P3)

**Story 5.1: Featured Section**
- Create `FeaturedArticles` component
- Add to blog listing page
- Style distinctly from regular list

### Phase 6: Admin Interface (P1)

**Story 6.1: Admin Article List**
- Create `ArticleTable` component
- Create `/admin/articles` page
- Add create/edit/delete actions

**Story 6.2: Article Editor**
- Create `ArticleEditor` component
- Create `MarkdownPreview` component
- Create `/admin/articles/new` page
- Create `/admin/articles/[id]/edit` page

### Phase 7: Substack Import (P3)

**Story 7.1: RSS Parser Action**
- Add `rss-parser` package
- Implement `articles.parseRssFeed` action
- Handle RSS parsing errors gracefully

**Story 7.2: Import UI**
- Create `RssImporter` component
- Create `/admin/articles/import` page
- Implement `articles.importFromRss` mutation

## Security Considerations

### Authorization Model

| Action | Required Role | Validation |
|--------|--------------|------------|
| View article listing | None | Public |
| View individual article | None | Public |
| Filter by tag | None | Public |
| View admin article list | Admin | `requireRole(ctx, ["admin"])` |
| Create article | Admin | `requireRole(ctx, ["admin"])` |
| Edit article | Admin | `requireRole(ctx, ["admin"])` |
| Delete article | Admin | `requireRole(ctx, ["admin"])` |
| Parse RSS feed | Admin | `requireRole(ctx, ["admin"])` |
| Import from RSS | Admin | `requireRole(ctx, ["admin"])` |

### Content Security

1. **XSS Prevention**: All Markdown content rendered through `rehype-sanitize` to strip dangerous HTML
2. **Slug Validation**: Slugs validated for format (alphanumeric, hyphens) before insert/update
3. **Author Verification**: `authorId` verified to exist before article creation
4. **Tag Verification**: All `tagIds` verified to exist before article creation

### Data Integrity

1. **Orphaned Articles**: If author profile deleted, article remains but shows "Unknown Author"
2. **Deleted Tags**: If tag deleted, `tags.remove` already cleans up article tag arrays
3. **Duplicate Prevention**: RSS import checks `substackUrl` for duplicates

## Testing Strategy

### Unit Tests (Convex Functions)

```typescript
// convex/articles.test.ts
describe("articles.list", () => {
  it("returns articles sorted by publishedAt desc");
  it("respects pagination limit");
  it("filters by tag when tagId provided");
  it("returns author info with each article");
  it("returns tags with each article");
  it("handles empty results");
});

describe("articles.getBySlug", () => {
  it("returns article for valid slug");
  it("returns null for non-existent slug");
  it("includes author profile data");
  it("includes tag data");
  it("handles deleted author gracefully");
});

describe("articles.getRelated", () => {
  it("returns articles with shared tags");
  it("excludes current article");
  it("sorts by shared tag count");
  it("falls back to same author articles");
  it("returns empty array when no related");
});

describe("articles.create", () => {
  it("requires admin role");
  it("validates slug format");
  it("rejects duplicate slug");
  it("verifies author exists");
  it("auto-generates excerpt if not provided");
  it("creates article with all fields");
});

describe("articles.update", () => {
  it("requires admin role");
  it("updates only provided fields");
  it("validates slug uniqueness on change");
  it("preserves unchanged fields");
});

describe("articles.remove", () => {
  it("requires admin role");
  it("deletes article");
  it("throws for non-existent article");
});
```

### Component Tests

```typescript
// ArticleCard
- renders title and excerpt
- formats publication date correctly
- shows author name and photo
- renders tag badges
- links to article page
- applies featured styling when variant="featured"

// ArticleContent
- renders markdown headings
- renders code blocks with syntax highlighting
- sanitizes dangerous HTML
- renders images responsively
- opens external links in new tab

// ArticleMeta
- shows author photo and name
- links to author profile
- shows "Unknown Author" when null
- formats date correctly

// RelatedArticles
- renders when related articles exist
- hidden when no related articles
- shows article titles and dates
```

### Integration Tests

```typescript
// Blog page flow
- visiting /blog loads article listing
- pagination loads more articles
- tag filter shows filtered results
- clearing filter shows all articles

// Article page flow
- visiting /blog/[slug] shows full article
- author link navigates to profile
- tag links navigate to tag pages
- related articles appear at bottom

// Admin flow
- admin can create article
- article appears in public listing
- admin can edit article
- changes reflect on public page
- admin can delete article
- article removed from listing
```

## Performance Considerations

### Query Optimization

1. **Indexed Queries**: All list queries use appropriate indexes (`by_publishedAt`, `by_isFeatured_and_publishedAt`, `by_authorId`)
2. **Pagination**: List queries support cursor-based pagination to limit data transfer
3. **Selective Joins**: Author and tag data joined server-side to minimize round trips
4. **Parallel Fetches**: Related articles fetched in parallel with main article content

### Rendering Optimization

1. **Lazy Loading**: Markdown rendering happens client-side with suspense boundaries
2. **Code Splitting**: Admin components dynamically imported
3. **Image Optimization**: Use Next.js Image component for any article images
4. **Skeleton Loading**: Show content skeletons while data loads

### Caching Strategy

1. **Convex Real-time**: Automatic cache invalidation via subscriptions
2. **Static Content**: Related articles can use shorter poll interval (less critical)
3. **Markdown Rendering**: Memoize parsed markdown to avoid re-parsing

## Accessibility Requirements

1. **Semantic HTML**: Use `<article>`, `<header>`, `<main>`, `<nav>` elements
2. **Heading Hierarchy**: Proper h1 > h2 > h3 structure in articles
3. **Link Text**: Descriptive link text (not "click here")
4. **Alt Text**: Require alt text for images in markdown (admin guidance)
5. **Keyboard Navigation**: All interactive elements accessible via keyboard
6. **Color Contrast**: Ensure code blocks have sufficient contrast
7. **Focus Management**: Focus article heading after navigation

## Success Criteria Mapping

| Spec Criteria | Implementation | Verification |
|--------------|----------------|--------------|
| SC-001: Load within 2 seconds | Indexed queries, pagination | Lighthouse performance |
| SC-002: Create article in 5 minutes | Streamlined editor UI | User testing |
| SC-003: Markdown renders correctly | react-markdown + remark-gfm | Visual testing |
| SC-004: Tag filtering works | `list` query with tagId filter | Integration test |
| SC-005: Related articles relevant | `getRelated` query logic | Unit test |
| SC-006: RSS import extracts data | `parseRssFeed` action | Unit test |
| SC-007: SEO-friendly pages | Metadata generation | Manual verification |

## Appendix: File Structure

```
alongside-ai/
├── app/
│   ├── blog/
│   │   ├── page.tsx                    # Article listing
│   │   └── [slug]/
│   │       ├── page.tsx                # Article page
│   │       └── not-found.tsx           # 404 for articles
│   └── admin/
│       └── articles/
│           ├── page.tsx                # Admin article list
│           ├── new/
│           │   └── page.tsx            # Create article
│           ├── [id]/
│           │   └── edit/
│           │       └── page.tsx        # Edit article
│           └── import/
│               └── page.tsx            # RSS import
├── components/
│   └── articles/
│       ├── ArticleCard.tsx
│       ├── ArticlePage.tsx
│       ├── ArticleContent.tsx
│       ├── ArticleHeader.tsx
│       ├── ArticleMeta.tsx
│       ├── RelatedArticles.tsx
│       ├── ArticleList.tsx
│       ├── ArticleFilters.tsx
│       ├── FeaturedArticles.tsx
│       ├── ArticleEditor.tsx
│       ├── MarkdownPreview.tsx
│       ├── RssImporter.tsx
│       └── index.ts                    # Barrel export
└── convex/
    └── articles.ts                     # Article functions
```

## Appendix: Markdown Rendering Configuration

```typescript
// components/articles/ArticleContent.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";

const customComponents = {
  // Add IDs to headings for anchor links
  h1: ({ node, ...props }) => <h1 id={slugify(props.children)} {...props} />,
  h2: ({ node, ...props }) => <h2 id={slugify(props.children)} {...props} />,
  // ... etc

  // External links open in new tab
  a: ({ node, href, ...props }) => {
    const isExternal = href?.startsWith("http");
    return (
      <a
        href={href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      />
    );
  },

  // Code blocks with language class
  code: ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    return !inline ? (
      <pre className={className}>
        <code className={match ? `language-${match[1]}` : ""} {...props}>
          {children}
        </code>
      </pre>
    ) : (
      <code className="inline-code" {...props}>{children}</code>
    );
  },
};

export function ArticleContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize, rehypeHighlight]}
      components={customComponents}
      className="prose prose-lg dark:prose-invert max-w-none"
    >
      {content}
    </ReactMarkdown>
  );
}
```

## Appendix: RSS Feed Parsing

```typescript
// convex/articles.ts (action)
import Parser from "rss-parser";

export const parseRssFeed = action({
  args: { rssUrl: v.string() },
  returns: v.array(/* ... */),
  handler: async (ctx, args) => {
    // Substack RSS feeds typically look like:
    // https://yoursubstack.substack.com/feed

    const parser = new Parser({
      customFields: {
        item: [
          ["content:encoded", "contentEncoded"],  // Full HTML content
        ],
      },
    });

    const feed = await parser.parseURL(args.rssUrl);

    // Check existing articles by substackUrl
    const existingUrls = await ctx.runQuery(
      internal.articles.getExistingSubstackUrls
    );

    return feed.items.map((item) => ({
      title: item.title ?? "Untitled",
      content: item.contentEncoded ?? item.content ?? "",
      publishedAt: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
      substackUrl: item.link ?? "",
      excerpt: item.contentSnippet?.slice(0, 160),
      alreadyImported: existingUrls.includes(item.link ?? ""),
    }));
  },
});
```
