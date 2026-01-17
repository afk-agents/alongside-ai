# User Stories & Tasks: Blog/Articles Section

**Feature**: 007-blog-articles-section
**Created**: 2026-01-17
**Spec Version**: 1.0

## Overview

This document breaks down the Blog/Articles Section feature into dependency-ordered user stories with detailed implementation tasks and acceptance criteria. Each user story is independently testable and delivers incremental value. The feature leverages the existing schema (articles table already defined), profiles system (for author attribution), and tag system (for categorization and filtering).

---

## US-001: Core Article Queries - List and Featured

**Priority**: P0 (Foundation)
**Dependencies**: None
**Estimated Effort**: Medium

### Description

As a frontend developer, I need Convex queries to fetch published articles with pagination and featured articles, so that the blog listing page can display article data.

### Acceptance Criteria

- [ ] `articles.list` query returns articles sorted by publishedAt (newest first)
- [ ] `articles.list` supports pagination with cursor and limit
- [ ] `articles.list` supports optional tagId filter
- [ ] `articles.list` returns article with joined author profile and tags
- [ ] `articles.listFeatured` returns articles with isFeatured=true
- [ ] Both queries have proper TypeScript return type validators
- [ ] Queries handle empty results gracefully

### Tasks

1. **Create convex/articles.ts file**
   - Import necessary Convex utilities and validators
   - Import api and internal references

2. **Implement list query**
   - Accept args: limit (optional, default 10), cursor (optional), tagId (optional)
   - Query articles using `by_publishedAt` index, order descending
   - Apply cursor-based pagination (skip articles newer than cursor timestamp)
   - Filter by tagId if provided (post-query filter since tags is an array)
   - Join author profile (fetch profile by authorId, handle null if deleted)
   - Join tags (fetch each tag by id, filter out deleted)
   - Return: articles array, nextCursor, hasMore

3. **Implement listFeatured query**
   - Accept args: limit (optional, default 3)
   - Query using `by_isFeatured_and_publishedAt` index
   - Filter where isFeatured === true
   - Order by publishedAt descending
   - Join author profile (displayName, slug only)
   - Return array of featured articles

### Test Scenarios

```gherkin
Given 15 published articles exist
When list is called with limit=10
Then 10 articles are returned with nextCursor set and hasMore=true

Given articles exist with various tags
When list is called with tagId="tag-123"
Then only articles containing that tag are returned

Given 3 articles are marked as featured
When listFeatured is called
Then all 3 featured articles are returned sorted by date

Given an article's author profile was deleted
When list is called
Then the article is returned with author=null
```

---

## US-002: Article Detail Query - Get By Slug

**Priority**: P0 (Foundation)
**Dependencies**: US-001
**Estimated Effort**: Small

### Description

As a frontend developer, I need a Convex query to fetch a single article by its URL slug with full details, so that individual article pages can render complete content.

### Acceptance Criteria

- [ ] `articles.getBySlug` returns full article data for valid slug
- [ ] Query includes author profile with extended fields (displayName, slug, photoUrl, bio)
- [ ] Query includes tags with name and slug for linking
- [ ] Returns null for non-existent slugs
- [ ] Uses `by_slug` index for efficient lookup
- [ ] Proper TypeScript return type validator

### Tasks

1. **Implement getBySlug query in convex/articles.ts**
   - Accept slug string argument
   - Query using `by_slug` index for O(1) lookup
   - Return null if article not found
   - Join author profile (full profile fields needed for article page)
   - Join tags (id, name, slug for clickable tag links)
   - Return complete article object with content

### Test Scenarios

```gherkin
Given an article exists with slug="my-first-post"
When getBySlug is called with slug="my-first-post"
Then the full article with content, author, and tags is returned

Given no article exists with slug="nonexistent"
When getBySlug is called with slug="nonexistent"
Then null is returned

Given an article exists but its author profile was deleted
When getBySlug is called
Then the article is returned with author=null
```

---

## US-003: Related Articles Query

**Priority**: P2
**Dependencies**: US-002
**Estimated Effort**: Medium

### Description

As a visitor reading an article, I want to see related articles based on shared tags, so that I can continue exploring relevant content.

### Acceptance Criteria

- [x] `articles.getRelated` returns up to 3 articles sharing at least one tag
- [x] Excludes the current article from results
- [x] Sorts by number of shared tags (most relevant first), then by publishedAt
- [x] Falls back to articles by same author if no tag matches
- [x] Returns empty array if no related content exists
- [x] Proper TypeScript return type validator

### Tasks

1. **Implement getRelated query in convex/articles.ts**
   - Accept articleId and optional limit (default 3)
   - Fetch current article to get its tags array
   - Query all articles (recent, limit to 50 for performance)
   - Filter: exclude current article, require at least one shared tag
   - Calculate sharedTagCount for each candidate
   - Sort by sharedTagCount desc, then publishedAt desc
   - If no results, query articles by same authorId
   - Return top N with title, slug, excerpt, publishedAt, sharedTagCount

### Test Scenarios

```gherkin
Given article A has tags ["tech", "ai"] and articles B, C, D share tag "ai"
When getRelated is called for article A
Then articles B, C, D are returned sorted by relevance

Given article A has tags but no other articles share those tags
And the same author has other published articles
When getRelated is called for article A
Then the author's other articles are returned

Given article A has no tags and author has no other articles
When getRelated is called for article A
Then an empty array is returned
```

---

## US-004: Admin Article CRUD Mutations

**Priority**: P1
**Dependencies**: US-001
**Estimated Effort**: Large

### Description

As an admin, I need mutations to create, update, and delete articles, so that I can manage blog content through the admin interface.

### Acceptance Criteria

- [ ] `articles.create` creates new article with all required fields
- [ ] `articles.create` validates slug format and uniqueness
- [ ] `articles.create` verifies authorId exists and is published
- [ ] `articles.create` verifies all tagIds exist
- [ ] `articles.create` auto-generates excerpt if not provided
- [ ] `articles.update` updates only provided fields
- [ ] `articles.update` validates slug uniqueness if changed
- [ ] `articles.remove` deletes article by id
- [ ] All mutations require admin role
- [ ] All mutations have proper return type validators

### Tasks

1. **Add slug validation utilities**
   - Export validateSlug function (reuse pattern from tags.ts)
   - Export generateSlug function to create slug from title
   - Validate: lowercase, alphanumeric + hyphens, no leading/trailing hyphens

2. **Implement listAdmin query**
   - Require admin role (import requireRole from users.ts)
   - Query all articles sorted by publishedAt desc
   - Join author displayName
   - Return minimal fields for table display: id, title, slug, publishedAt, isFeatured, authorName, tagCount

3. **Implement get query (admin single)**
   - Require admin role
   - Accept id: Id<"articles">
   - Return full article data for editing (raw fields, not joined)
   - Return null if not found

4. **Implement create mutation**
   - Require admin role
   - Accept: title, slug, content, authorId, publishedAt (optional, default now), excerpt (optional), tags (optional), substackUrl (optional), isFeatured (optional)
   - Validate slug format
   - Check slug uniqueness
   - Verify authorId references existing published profile
   - Verify all tagIds exist (if provided)
   - Auto-generate excerpt from first 160 chars of content if not provided
   - Insert article
   - Return new article id

5. **Implement update mutation**
   - Require admin role
   - Accept: id and all optional fields
   - Verify article exists
   - If slug provided, validate format and uniqueness (excluding self)
   - If authorId provided, verify it exists
   - If tags provided, verify all exist
   - Build patch object with only provided fields
   - Apply patch

6. **Implement remove mutation**
   - Require admin role
   - Accept id: Id<"articles">
   - Verify article exists
   - Delete article

### Test Scenarios

```gherkin
Given an admin is authenticated
When they call create with valid data
Then a new article is created and its id is returned

Given an article exists with slug="existing-slug"
When admin calls create with slug="existing-slug"
Then an error is thrown about duplicate slug

Given an admin calls create with authorId of unpublished profile
When the mutation executes
Then an error is thrown about invalid author

Given an admin calls update with new title only
When the mutation executes
Then only the title is updated, other fields remain unchanged

Given an admin calls remove with valid article id
When the mutation executes
Then the article is deleted from the database

Given a non-admin user attempts any mutation
When the mutation executes
Then an authorization error is thrown
```

---

## US-005: Install Markdown Rendering Dependencies

**Priority**: P1
**Dependencies**: None
**Estimated Effort**: Small

### Description

As a developer, I need to install the required npm packages for Markdown rendering with proper sanitization, so that article content can be rendered safely.

### Acceptance Criteria

- [ ] react-markdown package installed
- [ ] remark-gfm package installed (GitHub-flavored markdown)
- [ ] rehype-sanitize package installed (XSS protection)
- [ ] rehype-highlight package installed (code syntax highlighting)
- [ ] Packages are compatible with React 19 and Next.js 16
- [ ] No dependency conflicts in package.json

### Tasks

1. **Install Markdown packages**
   - Run: `bun add react-markdown remark-gfm rehype-sanitize rehype-highlight`
   - Verify installation successful
   - Verify no peer dependency warnings

2. **Verify compatibility**
   - Run `bun run build` to ensure no build errors
   - Test basic import in a component file

### Test Scenarios

```gherkin
Given the packages are installed
When the Next.js app builds
Then no dependency or compilation errors occur

Given the packages are installed
When importing react-markdown in a component
Then the import resolves correctly
```

---

## US-006: ArticleContent Component - Markdown Renderer

**Priority**: P1
**Dependencies**: US-005
**Estimated Effort**: Medium

### Description

As a visitor reading an article, I want the Markdown content to render with proper formatting including headings, lists, code blocks, and images, so that articles are readable and visually appealing.

### Acceptance Criteria

- [ ] Component renders Markdown to HTML using react-markdown
- [ ] GitHub-flavored markdown supported (tables, strikethrough, task lists)
- [ ] HTML is sanitized to prevent XSS attacks
- [ ] Code blocks have syntax highlighting
- [ ] Headings get anchor IDs for linking
- [ ] External links open in new tab with rel="noopener noreferrer"
- [ ] Images are responsive
- [ ] Proper typography styling with prose classes

### Tasks

1. **Create components/articles/ArticleContent.tsx**
   - Import ReactMarkdown, remarkGfm, rehypeSanitize, rehypeHighlight
   - Accept content prop (string)
   - Configure remark and rehype plugins
   - Create custom component mappings:
     - Headings: add slugified id for anchor links
     - Links: detect external (starts with http), add target/rel
     - Code: distinguish inline vs block, apply syntax highlighting
     - Images: wrap in responsive container

2. **Add styling**
   - Use Tailwind prose classes for typography
   - Configure dark mode prose variants
   - Style code blocks with background and padding
   - Add highlight.js theme CSS (or equivalent)

3. **Create components/articles/index.ts**
   - Create barrel export file for article components

### Test Scenarios

```gherkin
Given markdown content with headings, lists, and code
When ArticleContent renders
Then all elements display with proper formatting

Given markdown content with <script> tag
When ArticleContent renders
Then the script tag is sanitized and not executed

Given markdown content with external link
When ArticleContent renders
Then the link opens in new tab with noopener noreferrer

Given markdown content with code block marked as "typescript"
When ArticleContent renders
Then syntax highlighting is applied to the code
```

---

## US-007: ArticleMeta Component - Author Attribution

**Priority**: P1
**Dependencies**: None
**Estimated Effort**: Small

### Description

As a visitor, I want to see who wrote an article and when it was published, so that I can understand the source and timeliness of the content.

### Acceptance Criteria

- [ ] Component displays author photo, name, and publication date
- [ ] Author name links to author's profile page
- [ ] Shows "Unknown Author" when author is null
- [ ] Date is formatted nicely (e.g., "January 17, 2026")
- [ ] Supports size variants (sm for cards, md for article page)
- [ ] Accessible with proper alt text and aria labels

### Tasks

1. **Create components/articles/ArticleMeta.tsx**
   - Accept props: author (object or null), publishedAt (number), size (sm/md)
   - Import ProfilePhoto from profiles components
   - Display author photo using ProfilePhoto component
   - Display author name with Link to /profiles/[slug]
   - Handle null author with "Unknown Author" text
   - Format publishedAt timestamp to readable date
   - Apply size-based styling

2. **Add date formatting utility**
   - Create utility function for date formatting
   - Format: "Month Day, Year" (e.g., "January 17, 2026")
   - Consider using Intl.DateTimeFormat for localization

### Test Scenarios

```gherkin
Given an article with author profile
When ArticleMeta renders
Then author photo, name, and formatted date are displayed

Given an article with author.slug="david"
When user clicks the author name
Then they navigate to /profiles/david

Given an article with author=null
When ArticleMeta renders
Then "Unknown Author" is displayed instead of name

Given an article with publishedAt timestamp
When ArticleMeta renders
Then the date is formatted as "January 17, 2026"
```

---

## US-008: ArticleCard Component - Listing Display

**Priority**: P1
**Dependencies**: US-007
**Estimated Effort**: Small

### Description

As a visitor browsing the blog, I want to see article previews in a compact card format, so that I can quickly scan and select articles of interest.

### Acceptance Criteria

- [ ] Card displays title, excerpt, publication date, and author
- [ ] Card shows tag badges for associated tags
- [ ] Excerpt is truncated to 2-3 lines with ellipsis
- [ ] Card links to full article page
- [ ] Hover state provides visual feedback
- [ ] Supports featured variant with larger/different styling
- [ ] Responsive design works on all screen sizes

### Tasks

1. **Create components/articles/ArticleCard.tsx**
   - Accept article prop with: title, slug, excerpt, publishedAt, author, tags
   - Accept variant prop: "default" | "featured"
   - Import ArticleMeta component for author/date
   - Import TagBadge from existing tag components (if available)
   - Wrap card in Link to /blog/[slug]
   - Apply line-clamp for excerpt truncation
   - Add hover effects (shadow, scale, or border)
   - Style featured variant differently (larger, highlighted)

2. **Add to barrel export**
   - Export ArticleCard from components/articles/index.ts

### Test Scenarios

```gherkin
Given an article with all fields populated
When ArticleCard renders
Then title, excerpt, date, author, and tags are visible

Given an article with a 500-character excerpt
When ArticleCard renders
Then the excerpt is truncated to 2-3 lines with ellipsis

Given an ArticleCard is clicked
When the click event fires
Then navigation to /blog/[slug] occurs

Given variant="featured" is passed
When ArticleCard renders
Then larger/highlighted styling is applied
```

---

## US-009: ArticleList Component with Pagination

**Priority**: P1
**Dependencies**: US-001, US-008
**Estimated Effort**: Medium

### Description

As a visitor on the blog page, I want to see a list of articles with the ability to load more, so that I can browse all available content without initial page load delays.

### Acceptance Criteria

- [ ] Component fetches articles using articles.list query
- [ ] Displays ArticleCard for each article
- [ ] Shows loading skeleton while fetching
- [ ] Shows "Load More" button when hasMore is true
- [ ] Loads next page when button clicked
- [ ] Shows empty state message when no articles exist
- [ ] Supports tag filter passed from parent

### Tasks

1. **Create components/articles/ArticleList.tsx**
   - Accept initialTagId prop (optional)
   - Use useQuery with api.articles.list
   - Track pagination state: cursor, allArticles array
   - Render loading skeleton initially
   - Map articles to ArticleCard components
   - Display "Load More" button if hasMore
   - Handle button click: fetch next page with cursor
   - Append new articles to existing list
   - Show empty state if no articles

2. **Create ArticleListSkeleton component**
   - Create placeholder cards during loading
   - Match ArticleCard dimensions
   - Use animate-pulse for loading effect

### Test Scenarios

```gherkin
Given articles exist in the database
When ArticleList mounts
Then a loading skeleton is shown initially
And then articles are displayed in cards

Given 15 articles exist
When ArticleList loads with limit=10
Then 10 articles are shown with "Load More" button

Given user clicks "Load More"
When the next page loads
Then 5 more articles are appended to the list

Given no articles exist
When ArticleList renders
Then an empty state message is displayed
```

---

## US-010: ArticleFilters Component - Tag Filtering

**Priority**: P2
**Dependencies**: US-009
**Estimated Effort**: Small

### Description

As a visitor, I want to filter articles by tag, so that I can find content on specific topics.

### Acceptance Criteria

- [ ] Component displays popular tags as filter chips
- [ ] Active tag has distinct selected styling
- [ ] Clicking a tag triggers filter callback
- [ ] "All Articles" option clears filter
- [ ] Horizontal scrollable on mobile if many tags
- [ ] Fetches tags from existing tags.list query

### Tasks

1. **Create components/articles/ArticleFilters.tsx**
   - Accept props: selectedTagId, onTagSelect callback
   - Use useQuery with api.tags.list (or appropriate query)
   - Display tags with contentCount > 0 for articles
   - Render "All Articles" button first
   - Render tag chips in horizontal scrollable container
   - Apply selected styling to active tag
   - Call onTagSelect with tagId on click
   - Call onTagSelect with undefined for "All"

2. **Add to barrel export**
   - Export ArticleFilters from index.ts

### Test Scenarios

```gherkin
Given tags exist with articles
When ArticleFilters renders
Then tag chips are displayed in a scrollable row

Given selectedTagId matches a tag
When ArticleFilters renders
Then that tag chip has selected/active styling

Given user clicks a tag chip
When the click handler fires
Then onTagSelect is called with that tag's id

Given user clicks "All Articles"
When the click handler fires
Then onTagSelect is called with undefined
```

---

## US-011: FeaturedArticles Component

**Priority**: P3
**Dependencies**: US-001, US-008
**Estimated Effort**: Small

### Description

As a visitor on the blog page, I want to see featured articles prominently displayed, so that I can discover highlighted content.

### Acceptance Criteria

- [ ] Component fetches featured articles using articles.listFeatured
- [ ] Displays featured ArticleCards in prominent section
- [ ] Section hidden when no featured articles exist
- [ ] Distinct visual treatment (different layout, larger cards, or background)
- [ ] Maximum 3 featured articles displayed

### Tasks

1. **Create components/articles/FeaturedArticles.tsx**
   - Accept articles prop (from parent or fetch itself)
   - Render section with "Featured" heading
   - Display ArticleCard with variant="featured"
   - Use different grid layout (e.g., larger first item)
   - Return null if articles array is empty

2. **Add to barrel export**
   - Export FeaturedArticles from index.ts

### Test Scenarios

```gherkin
Given 3 featured articles exist
When FeaturedArticles renders
Then 3 featured cards are displayed in prominent layout

Given no featured articles exist
When FeaturedArticles renders
Then the component returns null (not rendered)
```

---

## US-012: Blog Listing Page

**Priority**: P1
**Dependencies**: US-009, US-010, US-011
**Estimated Effort**: Medium

### Description

As a visitor, I want to browse all published articles on a dedicated blog page, so that I can discover content.

### Acceptance Criteria

- [ ] Blog page accessible at /blog
- [ ] Page has title "Blog" or similar heading
- [ ] Featured articles section shown when featured exist (no active filter)
- [ ] Tag filter chips displayed
- [ ] Article list with pagination below filters
- [ ] Filter state updates article list
- [ ] Page is responsive and well-styled
- [ ] Page has proper metadata (title, description)

### Tasks

1. **Create app/blog/page.tsx**
   - Mark as client component ("use client")
   - Add page header with title and description
   - Fetch featured articles with useQuery
   - Manage tag filter state with useState
   - Conditionally render FeaturedArticles (when no filter)
   - Render ArticleFilters with state and callback
   - Render ArticleList with tag filter
   - Add proper page structure and spacing

2. **Add metadata export**
   - Export metadata object with title and description
   - Note: may need to move to layout.tsx for client component

### Test Scenarios

```gherkin
Given a visitor navigates to /blog
When the page loads
Then they see the blog header, filters, and article list

Given featured articles exist and no filter is active
When the blog page loads
Then the featured section is displayed above the list

Given a visitor clicks a tag filter
When the filter is applied
Then the article list updates to show only matching articles
And the featured section is hidden

Given a visitor clicks "All Articles"
When the filter is cleared
Then all articles are shown and featured section reappears
```

---

## US-013: Individual Article Page

**Priority**: P1
**Dependencies**: US-002, US-006, US-007
**Estimated Effort**: Medium

### Description

As a visitor, I want to read a full article on its own page, so that I can consume the complete content with proper formatting.

### Acceptance Criteria

- [ ] Article page accessible at /blog/[slug]
- [ ] Fetches article data using articles.getBySlug
- [ ] Displays article title as h1
- [ ] Displays author attribution with link to profile
- [ ] Displays publication date
- [ ] Displays tag links
- [ ] Renders full Markdown content with ArticleContent
- [ ] Shows Substack link if substackUrl exists
- [ ] Shows 404 page for non-existent slugs
- [ ] Loading state while fetching

### Tasks

1. **Create app/blog/[slug]/page.tsx**
   - Mark as client component
   - Extract slug from params (Next.js 16: params is Promise)
   - Fetch article with useQuery and slug
   - Show loading skeleton while undefined
   - Call notFound() if article is null
   - Render ArticleHeader with title, meta, tags
   - Render ArticleContent with content
   - Render Substack link if exists

2. **Create components/articles/ArticleHeader.tsx**
   - Accept article prop
   - Display title as h1
   - Display ArticleMeta component
   - Display tag links as clickable chips
   - Link tags to /tags/[slug]

3. **Create app/blog/[slug]/not-found.tsx**
   - Styled 404 page for article not found
   - Include link back to /blog

### Test Scenarios

```gherkin
Given an article exists with slug="my-article"
When visitor navigates to /blog/my-article
Then the full article is displayed with title, author, date, and content

Given an article has substackUrl set
When the article page renders
Then a "Read on Substack" link is displayed

Given no article exists with slug="nonexistent"
When visitor navigates to /blog/nonexistent
Then a 404 page is displayed with link back to blog

Given the article data is loading
When the page renders
Then a loading skeleton is shown
```

---

## US-014: RelatedArticles Component

**Priority**: P2
**Dependencies**: US-003, US-013
**Estimated Effort**: Small

### Description

As a visitor who finished reading an article, I want to see related articles, so that I can continue exploring similar content.

### Acceptance Criteria

- [x] Component fetches related articles using articles.getRelated
- [x] Displays up to 3 related articles
- [x] Shows article title, date, and excerpt
- [x] Links to related article pages
- [x] Section hidden when no related articles exist
- [x] Section heading: "Related Articles" or "Keep Reading"

### Tasks

1. **Create components/articles/RelatedArticles.tsx**
   - [x] Accept articleId prop
   - [x] Fetch related articles with useQuery
   - [x] Return null if loading or empty results
   - [x] Render section with heading
   - [x] Display compact article cards (simplified ArticleCard or custom)
   - [x] Link each to /blog/[slug]

2. **Integrate into article page**
   - [x] Add RelatedArticles component after article content
   - [x] Pass current article._id

### Test Scenarios

```gherkin
Given an article has related articles by shared tags
When RelatedArticles renders
Then up to 3 related articles are displayed

Given an article has no related articles
When RelatedArticles renders
Then the component returns null (not visible)

Given a visitor clicks a related article
When the click occurs
Then they navigate to that article's page
```

---

## US-015: Admin Article List Page

**Priority**: P1
**Dependencies**: US-004
**Estimated Effort**: Medium

### Description

As an admin, I need a page to view all articles and access article management, so that I can oversee blog content.

### Acceptance Criteria

- [ ] Admin article list at /admin/articles
- [ ] Requires admin authentication
- [ ] Displays all articles in table format
- [ ] Shows: title, author, date, featured status
- [ ] Has actions: Edit, Delete for each article
- [ ] Has "Create New Article" button
- [ ] Matches existing admin page styling

### Tasks

1. **Create app/admin/articles/page.tsx**
   - Require admin authentication
   - Fetch articles with api.articles.listAdmin
   - Display in table with columns: Title, Author, Date, Featured, Actions
   - Add "Create New Article" button linking to /admin/articles/new
   - Add Edit link to /admin/articles/[id]/edit
   - Add Delete button with confirmation

2. **Create components/articles/ArticleTable.tsx**
   - Accept articles array prop
   - Accept onDelete callback
   - Render table with proper headers
   - Format date column
   - Show featured as badge/icon
   - Include action buttons/links

### Test Scenarios

```gherkin
Given an admin navigates to /admin/articles
When the page loads
Then all articles are displayed in a table

Given an admin clicks "Create New Article"
When the click occurs
Then they navigate to /admin/articles/new

Given an admin clicks Delete on an article
When they confirm the action
Then the article is removed from the list
```

---

## US-016: Article Editor Component

**Priority**: P1
**Dependencies**: US-004, US-006
**Estimated Effort**: Large

### Description

As an admin, I need a form to create and edit articles with Markdown preview, so that I can write and publish blog content.

### Acceptance Criteria

- [ ] Form includes: title, slug, content (textarea), excerpt, author selector, tags multi-select
- [ ] Form includes: publication date picker, featured toggle, Substack URL
- [ ] Slug auto-generates from title (editable)
- [ ] Live Markdown preview of content
- [ ] Author dropdown populated from published profiles
- [ ] Tags multi-select from existing tags
- [ ] Validation errors displayed
- [ ] Save button with loading state
- [ ] Works for both create and edit modes

### Tasks

1. **Create components/articles/ArticleEditor.tsx**
   - Accept article prop (undefined for create, defined for edit)
   - Accept onSuccess callback
   - Form state for all fields
   - Auto-generate slug from title (with edit capability)
   - Fetch profiles for author dropdown
   - Fetch tags for multi-select
   - Validate required fields
   - Call create or update mutation on submit
   - Display validation errors
   - Show loading state during submission

2. **Create components/articles/MarkdownPreview.tsx**
   - Accept content prop
   - Render using ArticleContent component
   - Style as preview panel
   - Live update as content changes

3. **Create split editor layout**
   - Two-column layout: editor | preview
   - Collapsible preview on mobile
   - Sync scroll (optional enhancement)

### Test Scenarios

```gherkin
Given an admin opens the article editor
When they type a title
Then the slug field auto-populates with a slugified version

Given an admin writes Markdown in the content field
When they type
Then the preview panel updates in real-time

Given an admin fills all required fields and clicks Save
When validation passes
Then the article is created/updated and success message shown

Given an admin leaves required field empty
When they click Save
Then validation errors are displayed
```

---

## US-017: Create Article Page

**Priority**: P1
**Dependencies**: US-015, US-016
**Estimated Effort**: Small

### Description

As an admin, I need a page to create new articles, so that I can add content to the blog.

### Acceptance Criteria

- [ ] Create page at /admin/articles/new
- [ ] Requires admin authentication
- [ ] Renders ArticleEditor in create mode
- [ ] Redirects to admin list on success
- [ ] Matches existing admin page styling

### Tasks

1. **Create app/admin/articles/new/page.tsx**
   - Require admin authentication
   - Render ArticleEditor with article=undefined
   - Handle onSuccess: redirect to /admin/articles
   - Add page header "Create New Article"

### Test Scenarios

```gherkin
Given an admin navigates to /admin/articles/new
When the page loads
Then an empty article editor is displayed

Given an admin creates an article successfully
When the mutation completes
Then they are redirected to /admin/articles
```

---

## US-018: Edit Article Page

**Priority**: P1
**Dependencies**: US-016, US-017
**Estimated Effort**: Small

### Description

As an admin, I need a page to edit existing articles, so that I can update and correct blog content.

### Acceptance Criteria

- [ ] Edit page at /admin/articles/[id]/edit
- [ ] Requires admin authentication
- [ ] Fetches article data using articles.get
- [ ] Pre-populates ArticleEditor with existing data
- [ ] Shows 404 for invalid article id
- [ ] Redirects to admin list on success

### Tasks

1. **Create app/admin/articles/[id]/edit/page.tsx**
   - Require admin authentication
   - Extract id from params
   - Fetch article with api.articles.get
   - Show loading while fetching
   - Show 404 if not found
   - Render ArticleEditor with fetched article
   - Handle onSuccess: redirect to /admin/articles

2. **Create app/admin/articles/[id]/edit/not-found.tsx**
   - Styled 404 for article not found
   - Link back to admin articles list

### Test Scenarios

```gherkin
Given an article exists with id="abc123"
When admin navigates to /admin/articles/abc123/edit
Then the editor is pre-populated with that article's data

Given no article exists with id="invalid"
When admin navigates to /admin/articles/invalid/edit
Then a 404 page is displayed
```

---

## US-019: Install RSS Parser Dependency

**Priority**: P3
**Dependencies**: None
**Estimated Effort**: Small

### Description

As a developer, I need to install the RSS parsing package for Substack import functionality, so that the RSS action can be implemented.

### Acceptance Criteria

- [x] rss-parser package installed
- [x] Package compatible with Convex actions (Node.js runtime)
- [x] No dependency conflicts

### Tasks

1. **Install rss-parser package**
   - Run: `bun add rss-parser`
   - Verify installation successful
   - Test import in Convex action

### Test Scenarios

```gherkin
Given the package is installed
When imported in a Convex action
Then no runtime errors occur
```

---

## US-020: Substack RSS Parser Action

**Priority**: P3
**Dependencies**: US-019
**Estimated Effort**: Medium

### Description

As an admin, I need to parse a Substack RSS feed URL to preview articles for import, so that I can migrate content from Substack.

### Acceptance Criteria

- [x] `articles.parseRssFeed` action parses RSS URL
- [x] Returns array of parsed articles with: title, content, publishedAt, substackUrl, excerpt
- [x] Indicates which articles are already imported (matching substackUrl)
- [x] Handles RSS parsing errors gracefully
- [x] Requires admin role
- [x] Validates URL format

### Tasks

1. **Implement parseRssFeed action in convex/articles.ts**
   - [x] Import rss-parser
   - [x] Require admin role
   - [x] Validate URL format (starts with http/https)
   - [x] Configure parser for Substack feeds (content:encoded field)
   - [x] Parse feed URL
   - [x] Handle errors (network, parsing)
   - [x] Check existing articles by substackUrl (internal query)
   - [x] Return parsed items with alreadyImported flag

2. **Add internal helper query**
   - [x] getExistingSubstackUrls: return all substackUrls for duplicate detection

### Test Scenarios

```gherkin
Given a valid Substack RSS URL
When parseRssFeed is called
Then an array of parsed articles is returned

Given an invalid URL
When parseRssFeed is called
Then an error is thrown

Given some articles already imported from feed
When parseRssFeed is called
Then alreadyImported=true for those items
```

---

## US-021: RSS Import Mutation

**Priority**: P3
**Dependencies**: US-020
**Estimated Effort**: Medium

### Description

As an admin, I need to import selected articles from a parsed RSS feed, so that I can bulk add Substack content to the blog.

### Acceptance Criteria

- [x] `articles.importFromRss` mutation accepts array of parsed articles
- [x] Creates articles with auto-generated slugs
- [x] Assigns specified author to all articles
- [x] Optionally applies tags to all articles
- [x] Skips already-imported articles (matching substackUrl)
- [x] Returns count of imported and skipped articles
- [x] Requires admin role

### Tasks

1. **Implement importFromRss mutation**
   - [x] Require admin role
   - [x] Accept: items array, authorId, optional tags array
   - [x] For each item:
     - [x] Generate slug from title
     - [x] Check for existing substackUrl
     - [x] If new: insert article with all fields
     - [x] If exists: skip
   - [x] Track imported and skipped counts
   - [x] Return { imported, skipped }

### Test Scenarios

```gherkin
Given an array of 5 RSS items and none imported yet
When importFromRss is called
Then 5 articles are created and { imported: 5, skipped: 0 } returned

Given an array with 2 items already imported
When importFromRss is called
Then only new articles are created and skipped count reflects duplicates

Given authorId is provided
When importFromRss is called
Then all imported articles have that author assigned
```

---

## US-022: RSS Importer UI Component

**Priority**: P3
**Dependencies**: US-020, US-021
**Estimated Effort**: Medium

### Description

As an admin, I need a UI to input an RSS URL, preview articles, and select which ones to import, so that I can control the import process.

### Acceptance Criteria

- [x] URL input field with "Fetch" button
- [x] Loading state while parsing
- [x] Preview list of articles with checkboxes
- [x] Already-imported articles shown but disabled
- [x] Author dropdown for assignment
- [x] Tags multi-select (optional)
- [x] "Import Selected" button
- [x] Success/error feedback after import

### Tasks

1. **Create components/articles/RssImporter.tsx**
   - [x] URL input with validation
   - [x] Fetch button triggers parseRssFeed action
   - [x] Display parsed articles as checklist
   - [x] Disable checkboxes for alreadyImported
   - [x] Author dropdown (required)
   - [x] Tags multi-select (optional)
   - [x] Import button triggers importFromRss
   - [x] Display results summary

### Test Scenarios

```gherkin
Given admin enters a Substack RSS URL
When they click Fetch
Then a list of articles appears with checkboxes

Given some articles are already imported
When the list renders
Then those checkboxes are disabled with "Already imported" label

Given admin selects 3 articles and clicks Import
When the import completes
Then a summary shows "3 imported, 0 skipped"
```

---

## US-023: RSS Import Admin Page

**Priority**: P3
**Dependencies**: US-022
**Estimated Effort**: Small

### Description

As an admin, I need a dedicated page for Substack import, so that I can access the import functionality.

### Acceptance Criteria

- [ ] Import page at /admin/articles/import
- [ ] Requires admin authentication
- [ ] Renders RssImporter component
- [ ] Has navigation back to articles list

### Tasks

1. **Create app/admin/articles/import/page.tsx**
   - Require admin authentication
   - Add page header "Import from Substack"
   - Render RssImporter component
   - Add back link to /admin/articles

### Test Scenarios

```gherkin
Given an admin navigates to /admin/articles/import
When the page loads
Then the RSS importer UI is displayed

Given a non-admin user
When they navigate to /admin/articles/import
Then they are redirected or see unauthorized
```

---

## Implementation Order

The user stories should be implemented in this order based on dependencies:

### Phase 1: Backend Foundation (P0)
1. **US-001**: Core Article Queries (foundation - no dependencies)
2. **US-002**: Article Detail Query (depends on US-001)

### Phase 2: Frontend Dependencies (P1)
3. **US-005**: Install Markdown Dependencies (no dependencies)
4. **US-006**: ArticleContent Component (depends on US-005)
5. **US-007**: ArticleMeta Component (no dependencies)

### Phase 3: Public UI Components (P1)
6. **US-008**: ArticleCard Component (depends on US-007)
7. **US-009**: ArticleList Component (depends on US-001, US-008)

### Phase 4: Admin Backend (P1)
8. **US-004**: Admin Article CRUD Mutations (depends on US-001)

### Phase 5: Public Pages (P1)
9. **US-012**: Blog Listing Page (depends on US-009, US-010, US-011)
10. **US-013**: Individual Article Page (depends on US-002, US-006, US-007)

### Phase 6: Admin UI (P1)
11. **US-015**: Admin Article List Page (depends on US-004)
12. **US-016**: Article Editor Component (depends on US-004, US-006)
13. **US-017**: Create Article Page (depends on US-015, US-016)
14. **US-018**: Edit Article Page (depends on US-016, US-017)

### Phase 7: Enhanced Features (P2)
15. **US-003**: Related Articles Query (depends on US-002)
16. **US-010**: ArticleFilters Component (depends on US-009)
17. **US-014**: RelatedArticles Component (depends on US-003, US-013)

### Phase 8: Featured Articles (P3)
18. **US-011**: FeaturedArticles Component (depends on US-001, US-008)

### Phase 9: Substack Import (P3)
19. **US-019**: Install RSS Parser Dependency (no dependencies)
20. **US-020**: Substack RSS Parser Action (depends on US-019)
21. **US-021**: RSS Import Mutation (depends on US-020)
22. **US-022**: RSS Importer UI Component (depends on US-020, US-021)
23. **US-023**: RSS Import Admin Page (depends on US-022)

### Parallel Tracks

- **Track A (Backend)**: US-001 -> US-002 -> US-003 -> US-004
- **Track B (Markdown)**: US-005 -> US-006
- **Track C (Components)**: US-007 -> US-008 -> US-009
- **Track D (Public Pages)**: US-012, US-013, US-014 (after Tracks A, B, C)
- **Track E (Admin)**: US-015 -> US-016 -> US-017 -> US-018 (after US-004)
- **Track F (Import)**: US-019 -> US-020 -> US-021 -> US-022 -> US-023

---

## Summary

| Story | Title | Priority | Dependencies | Effort |
|-------|-------|----------|--------------|--------|
| US-001 | Core Article Queries | P0 | None | Medium |
| US-002 | Article Detail Query | P0 | US-001 | Small |
| US-003 | Related Articles Query | P2 | US-002 | Medium |
| US-004 | Admin Article CRUD Mutations | P1 | US-001 | Large |
| US-005 | Install Markdown Dependencies | P1 | None | Small |
| US-006 | ArticleContent Component | P1 | US-005 | Medium |
| US-007 | ArticleMeta Component | P1 | None | Small |
| US-008 | ArticleCard Component | P1 | US-007 | Small |
| US-009 | ArticleList Component | P1 | US-001, US-008 | Medium |
| US-010 | ArticleFilters Component | P2 | US-009 | Small |
| US-011 | FeaturedArticles Component | P3 | US-001, US-008 | Small |
| US-012 | Blog Listing Page | P1 | US-009, US-010, US-011 | Medium |
| US-013 | Individual Article Page | P1 | US-002, US-006, US-007 | Medium |
| US-014 | RelatedArticles Component | P2 | US-003, US-013 | Small |
| US-015 | Admin Article List Page | P1 | US-004 | Medium |
| US-016 | Article Editor Component | P1 | US-004, US-006 | Large |
| US-017 | Create Article Page | P1 | US-015, US-016 | Small |
| US-018 | Edit Article Page | P1 | US-016, US-017 | Small |
| US-019 | Install RSS Parser | P3 | None | Small |
| US-020 | Substack RSS Parser Action | P3 | US-019 | Medium |
| US-021 | RSS Import Mutation | P3 | US-020 | Medium |
| US-022 | RSS Importer UI Component | P3 | US-020, US-021 | Medium |
| US-023 | RSS Import Admin Page | P3 | US-022 | Small |

**Total Stories**: 23
**P0 (Foundation)**: 2
**P1 (Core Feature)**: 12
**P2 (Enhanced)**: 4
**P3 (Nice-to-have)**: 5

**Effort Distribution**:
- Small: 10 stories
- Medium: 10 stories
- Large: 3 stories
