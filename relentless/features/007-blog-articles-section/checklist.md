# Quality Validation Checklist: Blog/Articles Section

**Feature**: 007-blog-articles-section
**Generated**: 2026-01-17
**Spec Version**: 1.0

This checklist validates the Blog/Articles Section feature against spec requirements, plan architecture, user stories, and project constitution standards.

---

## Pre-Implementation Checks

### Dependency Verification

- [ ] **DEP-001**: Existing `articles` table schema matches plan requirements (title, slug, content, authorId, publishedAt, excerpt, tags, substackUrl, isFeatured)
- [ ] **DEP-002**: Existing indexes verified: `by_slug`, `by_authorId`, `by_publishedAt`, `by_isFeatured_and_publishedAt`
- [ ] **DEP-003**: `profiles` table and `profiles.getAuthoredContent` integration available
- [ ] **DEP-004**: `tags` system integration verified (`tags.list`, `tags.getContentByTagId`)
- [ ] **DEP-005**: Auth system verified (`requireRole` function available for admin protection)

### Package Installation

- [ ] **PKG-001**: `react-markdown` installed and compatible with React 19 (US-005)
- [ ] **PKG-002**: `remark-gfm` installed for GitHub-flavored markdown support (US-005)
- [ ] **PKG-003**: `rehype-sanitize` installed for XSS protection (US-005)
- [ ] **PKG-004**: `rehype-highlight` installed for code syntax highlighting (US-005)
- [x] **PKG-005**: `rss-parser` installed for Substack import (US-019, P3)
- [x] **PKG-006**: No peer dependency warnings or conflicts

---

## Functional Requirements Validation

### FR-001: Article Listing (Sorted by Publication Date)

- [ ] `articles.list` query returns articles sorted by publishedAt (newest first)
- [ ] Sorting verified with multiple articles at different timestamps
- [ ] Pagination cursor correctly maintains sort order across pages
- [ ] **Test**: Given 15 articles, requesting limit=10 returns 10 newest with hasMore=true

### FR-002: Markdown Rendering with XSS Sanitization

- [ ] ArticleContent component uses `react-markdown` with `rehype-sanitize`
- [ ] Headings, lists, code blocks, tables render correctly (GFM support)
- [ ] Code blocks have syntax highlighting applied
- [ ] **Security Test**: `<script>alert('xss')</script>` in content does NOT execute
- [ ] **Security Test**: `<img onerror="alert('xss')" src="x">` is sanitized
- [ ] External links open in new tab with `rel="noopener noreferrer"`

### FR-003: Author Profile Linking

- [ ] Articles reference profiles via `authorId` field
- [ ] Article listing shows author displayName and links to `/profiles/[slug]`
- [ ] Article page shows author with photo, name, and bio link
- [ ] **Edge Case**: Article with deleted author displays "Unknown Author"
- [ ] **Test**: Clicking author name navigates to correct profile page

### FR-004: Tag Filtering Integration

- [ ] `articles.list` accepts optional `tagId` parameter
- [ ] Filtering by tag returns only articles containing that tag
- [ ] ArticleFilters component displays available tags
- [ ] Active tag has distinct visual styling
- [ ] "All Articles" option clears the filter
- [ ] **Test**: Filter by tag A shows only articles with tag A

### FR-005: Related Articles by Shared Tags

- [ ] `articles.getRelated` returns articles sharing at least one tag
- [ ] Current article excluded from related results
- [ ] Results sorted by shared tag count (most relevant first)
- [ ] Falls back to same-author articles if no tag matches
- [ ] Returns empty array gracefully when no related content
- [ ] Maximum 3 related articles returned by default

### FR-006: Admin CRUD Operations

- [ ] `articles.create` creates new article with all required fields
- [ ] `articles.update` updates only provided fields (partial update)
- [ ] `articles.remove` deletes article from database
- [ ] All mutations require admin role (returns error for non-admins)
- [ ] **Test**: Non-admin calling create/update/remove receives authorization error

### FR-007: Slug Validation (Unique and URL-friendly)

- [ ] Slugs validated: lowercase, alphanumeric + hyphens only
- [ ] No leading or trailing hyphens allowed
- [ ] Slug uniqueness enforced on create
- [ ] Slug uniqueness enforced on update (excluding self)
- [ ] Auto-generation from title works correctly
- [ ] **Test**: Creating article with duplicate slug returns error

### FR-008: Substack URL Field

- [ ] `substackUrl` field optional on article creation
- [ ] Article page displays "Read on Substack" link when URL present
- [ ] Link hidden when `substackUrl` is empty/null
- [ ] URL stored as-is (validated format in UI)

### FR-009: Featured Article Flagging

- [ ] `isFeatured` boolean field supported on articles
- [ ] `articles.listFeatured` returns only articles with isFeatured=true
- [ ] Admin can toggle featured status in editor
- [ ] Featured section displayed on blog listing (when no filter active)
- [ ] Maximum 3 featured articles displayed

### FR-010: Substack RSS Import (P3)

- [x] `articles.parseRssFeed` action fetches and parses RSS URL
- [x] RSS items include title, content, publishedAt, substackUrl
- [x] Already-imported articles marked with `alreadyImported: true`
- [ ] `articles.importFromRss` creates articles from selected items
- [ ] Duplicate detection via substackUrl prevents re-import
- [ ] Returns import/skip counts

---

## User Story Acceptance Criteria

### US-001: Core Article Queries

- [ ] `articles.list` returns articles with pagination support
- [ ] `articles.list` includes joined author profile data
- [ ] `articles.list` includes joined tag data (name, slug)
- [ ] `articles.listFeatured` returns featured articles sorted by date
- [ ] Both queries have proper TypeScript return validators

### US-002: Article Detail Query

- [ ] `articles.getBySlug` uses `by_slug` index for O(1) lookup
- [ ] Returns null for non-existent slugs (not error)
- [ ] Includes full content, author profile, and tags
- [ ] Author includes: displayName, slug, photoUrl, bio

### US-003: Related Articles Query (P2)

- [x] `articles.getRelated` excludes current article
- [x] Sorts by sharedTagCount descending, then publishedAt descending
- [x] Falls back to same author's other articles
- [x] Returns sharedTagCount for each result

### US-004: Admin Article CRUD Mutations

- [ ] `articles.listAdmin` returns all articles for admin table
- [ ] `articles.get` returns raw article data for editing
- [ ] `articles.create` validates author exists and is published
- [ ] `articles.create` verifies all tagIds exist
- [ ] `articles.create` auto-generates excerpt from first 160 chars if not provided
- [ ] `articles.update` applies partial patch (only provided fields)
- [ ] `articles.remove` deletes article

### US-005 & US-006: Markdown Rendering

- [ ] `ArticleContent` renders headings with anchor IDs
- [ ] Tables supported via remark-gfm
- [ ] Strikethrough, task lists supported
- [ ] Code blocks have language-specific highlighting
- [ ] Inline code styled distinctly from block code
- [ ] Images responsive with max-width

### US-007: ArticleMeta Component

- [ ] Displays author photo (using ProfilePhoto or similar)
- [ ] Displays author name as link to profile
- [ ] Displays formatted publication date ("January 17, 2026")
- [ ] Handles null author gracefully ("Unknown Author")
- [ ] Supports size variants (sm, md)

### US-008: ArticleCard Component

- [ ] Displays title, excerpt, date, author, tags
- [ ] Excerpt truncated to 2-3 lines with ellipsis (line-clamp)
- [ ] Card links to `/blog/[slug]`
- [ ] Hover state provides visual feedback
- [ ] Featured variant has distinct larger styling
- [ ] Tag badges displayed and clickable

### US-009: ArticleList with Pagination

- [ ] Shows loading skeleton while fetching
- [ ] Displays ArticleCard for each article
- [ ] "Load More" button visible when hasMore=true
- [ ] Clicking Load More appends next page to list
- [ ] Empty state message when no articles exist
- [ ] Accepts tag filter prop and passes to query

### US-010: ArticleFilters Component (P2)

- [ ] Displays popular tags as filter chips
- [ ] Active tag has selected styling
- [ ] "All Articles" option clears filter
- [ ] Horizontal scrollable on mobile
- [ ] Triggers onTagSelect callback with tagId

### US-011: FeaturedArticles Component (P3)

- [ ] Fetches/displays featured articles
- [ ] Returns null when no featured articles
- [ ] Uses prominent styling (larger cards, different layout)
- [ ] Limited to 3 featured articles

### US-012: Blog Listing Page

- [ ] Accessible at `/blog`
- [ ] Page title and description displayed
- [ ] Featured section shown when no filter active
- [ ] Tag filters displayed
- [ ] Article list with pagination
- [ ] Filter state properly updates article list
- [ ] Responsive layout

### US-013: Individual Article Page

- [ ] Accessible at `/blog/[slug]`
- [ ] Displays article title as h1
- [ ] Displays author attribution with profile link
- [ ] Displays publication date
- [ ] Displays tag links to `/tags/[slug]`
- [ ] Renders full Markdown content
- [ ] Shows Substack link if present
- [ ] Returns 404 for non-existent slugs
- [ ] Loading skeleton while fetching

### US-014: RelatedArticles Component (P2)

- [x] Fetches related articles by articleId
- [x] Displays up to 3 related articles
- [x] Links to related article pages
- [x] Hidden when no related articles exist
- [x] Section has clear heading ("Related Articles" or similar)

### US-015-018: Admin Article Pages

- [ ] `/admin/articles` shows article table with all articles
- [ ] Table includes: title, author, date, featured status, actions
- [ ] "Create New Article" button links to `/admin/articles/new`
- [ ] Edit links to `/admin/articles/[id]/edit`
- [ ] Delete button with confirmation dialog
- [ ] `/admin/articles/new` renders empty ArticleEditor
- [ ] `/admin/articles/[id]/edit` pre-populates ArticleEditor
- [ ] 404 shown for invalid article IDs in edit page
- [ ] Redirect to list on successful create/edit

### US-016: ArticleEditor Component

- [ ] Form includes all required fields: title, slug, content, authorId
- [ ] Form includes optional fields: excerpt, tags, publishedAt, isFeatured, substackUrl
- [ ] Slug auto-generates from title (editable)
- [ ] Live Markdown preview in split view
- [ ] Author dropdown populated from published profiles
- [ ] Tags multi-select from existing tags
- [ ] Validation errors displayed inline
- [ ] Save button with loading state
- [ ] Works for both create (article=undefined) and edit modes

### US-019-023: Substack Import (P3)

- [ ] `/admin/articles/import` accessible to admins
- [ ] URL input with "Fetch" button
- [ ] Parsed articles displayed as checkbox list
- [ ] Already-imported articles disabled with indicator
- [ ] Author dropdown required for import
- [ ] Tags multi-select optional
- [ ] "Import Selected" button triggers mutation
- [ ] Success summary shows imported/skipped counts
- [ ] Error handling for invalid URLs

---

## Constitution Compliance

### Type Safety (Principle 1)

- [ ] All Convex functions have `args` validators
- [ ] All Convex functions have `returns` validators
- [ ] Functions returning void use `v.null()`
- [ ] No `any` types in implementation
- [ ] TypeScript strict mode passes with 0 errors
- [ ] `Id<"articles">`, `Id<"profiles">`, `Id<"tags">` used (not plain strings)

### Testing (Principle 2)

- [ ] Unit tests written for all Convex queries
- [ ] Unit tests written for all Convex mutations
- [ ] Component tests written for ArticleContent (Markdown rendering)
- [ ] Component tests written for ArticleCard (rendering variants)
- [ ] Integration tests for blog page flow
- [ ] Integration tests for admin CRUD flow
- [ ] Tests cover edge cases: empty results, deleted author, null tags
- [ ] All tests pass before merge

### Code Quality (Principle 3)

- [ ] `bun run lint` passes with 0 warnings
- [ ] `bunx tsc --noEmit` passes with 0 errors
- [ ] No unused imports or variables
- [ ] Functions are single-responsibility
- [ ] Clear, descriptive naming throughout
- [ ] Code formatted consistently

### Architecture (Principle 4)

- [ ] Pages in `app/blog/` directory structure
- [ ] Admin pages in `app/admin/articles/` directory structure
- [ ] `"use client"` used only where necessary
- [ ] Server components preferred where possible
- [ ] Shared components in `components/articles/`

### Convex Backend (Principle 5)

- [ ] Functions organized in `convex/articles.ts`
- [ ] All queries use `withIndex()` not `filter()`
- [ ] Internal functions use `internalQuery/Mutation/Action`
- [ ] Public API uses `query/mutation/action`
- [ ] References via `api.articles.*` or `internal.articles.*`

### Version Control (Principle 6)

- [ ] Commits use Conventional Commits format
- [ ] Clear, descriptive commit messages
- [ ] Commits are atomic and focused
- [ ] No broken code committed

---

## Security Validation

### Authorization

- [ ] Public queries: `list`, `listFeatured`, `getBySlug`, `getRelated` - no auth required
- [ ] Admin queries: `listAdmin`, `get` - require admin role
- [ ] Admin mutations: `create`, `update`, `remove` - require admin role
- [x] Admin actions: `parseRssFeed` - require admin role
- [ ] Admin mutation: `importFromRss` - require admin role
- [ ] Unauthorized access returns clear error (not data leak)

### Content Security

- [ ] All Markdown content sanitized via `rehype-sanitize`
- [ ] No raw HTML injection possible
- [ ] Slug validation prevents path traversal
- [ ] External URLs validated in RSS import

### Data Integrity

- [ ] Author deletion does not break article display (shows "Unknown Author")
- [ ] Tag deletion handled gracefully (tags.remove cleans up articles)
- [ ] Duplicate substackUrl prevented in imports

---

## Performance Validation

### Query Performance

- [ ] `list` query uses `by_publishedAt` index (not full scan)
- [ ] `getBySlug` uses `by_slug` index (O(1) lookup)
- [ ] `listFeatured` uses `by_isFeatured_and_publishedAt` index
- [ ] `listAdmin` query performant for expected article volume
- [ ] Pagination prevents loading entire dataset

### Rendering Performance

- [ ] Markdown parsed and rendered client-side without blocking
- [ ] Loading skeletons prevent layout shift
- [ ] Related articles fetched in parallel (not blocking)
- [ ] Admin components code-split (not in public bundle)

---

## Accessibility Validation

### Semantic HTML

- [ ] Blog listing uses `<main>`, `<article>`, `<nav>` elements
- [ ] Article page uses `<article>` element
- [ ] Proper heading hierarchy: h1 > h2 > h3
- [ ] Links have descriptive text (not "click here")

### Keyboard Navigation

- [ ] All interactive elements focusable via Tab
- [ ] Filter chips keyboard accessible
- [ ] Load More button keyboard accessible
- [ ] Admin forms fully keyboard navigable

### Screen Reader Support

- [ ] Images have alt text (or empty alt for decorative)
- [ ] Date formatting accessible (not just visual)
- [ ] Loading states announced appropriately
- [ ] Error messages accessible

---

## Edge Case Validation

### Empty States

- [ ] Blog page with 0 articles shows friendly message
- [ ] Tag filter with 0 matching articles shows message
- [ ] Related articles section hidden when 0 related
- [ ] Featured section hidden when 0 featured

### Missing Data

- [ ] Article with null excerpt auto-generates from content
- [ ] Article with deleted author shows "Unknown Author"
- [ ] Article with deleted tags continues to work (tags removed from array)
- [ ] Article with no tags renders without tag section

### Boundary Conditions

- [ ] Very long article titles truncate appropriately
- [ ] Very long excerpts truncate with ellipsis
- [ ] Extremely long Markdown content renders without crash
- [ ] Many tags on article display in scrollable container
- [ ] Pagination handles exactly limit count correctly (hasMore accurate)

---

## Success Criteria Validation (from Spec)

### SC-001: Load Time

- [ ] Blog page loads within 2 seconds (Lighthouse measurement)
- [ ] Article page loads within 2 seconds (Lighthouse measurement)
- [ ] Indexed queries contribute to fast load times

### SC-002: Article Creation Time

- [ ] Admin can create article with full formatting in under 5 minutes
- [ ] Editor UI is intuitive with clear field labels
- [ ] Preview shows accurate rendering

### SC-003: Markdown Rendering

- [ ] Headings render correctly (h1-h6)
- [ ] Ordered and unordered lists render correctly
- [ ] Code blocks render with syntax highlighting
- [ ] Links render and function correctly
- [ ] Images render responsively

### SC-004: Tag Filtering

- [ ] Clicking tag filter shows only matching articles
- [ ] Filter persists during pagination
- [ ] Clear filter shows all articles again

### SC-005: Related Articles Relevance

- [ ] Related articles share at least one tag with current
- [ ] More shared tags = higher relevance position
- [ ] Fallback to same-author articles works

### SC-006: RSS Import

- [ ] RSS parser extracts title from feed items
- [ ] RSS parser extracts content from feed items
- [ ] RSS parser extracts publication date from feed items
- [ ] Imported articles have correct substackUrl

### SC-007: SEO

- [ ] Blog page has proper title and description metadata
- [ ] Article pages have dynamic title (article title)
- [ ] Article pages have description (excerpt)
- [ ] OpenGraph tags present for social sharing

---

## Final Validation

### Pre-Merge Checklist

- [ ] All user stories (US-001 through US-023) acceptance criteria verified
- [ ] All functional requirements (FR-001 through FR-010) validated
- [ ] All constitution principles followed
- [ ] All tests passing
- [ ] No lint warnings
- [ ] No TypeScript errors
- [ ] Manual QA completed on key flows
- [ ] Accessibility audit completed
- [ ] Performance audit completed (Lighthouse)
- [ ] Security review completed (XSS testing)

### Documentation

- [ ] Component props documented with TypeScript interfaces
- [ ] Convex function args/returns self-documenting via validators
- [ ] Complex logic commented where necessary
- [ ] README updated if setup steps changed

---

## Gap Analysis

### Identified Gaps (Spec vs Tasks)

1. **SEO Metadata Generation**: SC-007 requires OpenGraph tags, but tasks don't explicitly cover dynamic metadata generation for article pages. Ensure `generateMetadata` or equivalent is implemented.

2. **Accessibility Focus Management**: Plan mentions "Focus article heading after navigation" but no specific task covers this. Consider adding focus management after route transitions.

3. **Image Alt Text Enforcement**: Edge case mentions admin guidance for alt text, but no validation in editor. Consider adding alt text guidance in ArticleEditor.

4. **Scroll Sync in Editor**: Plan mentions "Sync scroll (optional enhancement)" but marked optional. Document decision if not implementing.

### Recommendations

1. Add explicit task for SEO metadata generation in article pages
2. Verify existing patterns for admin page styling consistency
3. Test RSS import with real Substack feeds before marking complete
4. Consider rate limiting on RSS fetch action to prevent abuse

---

**Checklist Version**: 1.0
**Total Items**: 185
**Categories**: 15
