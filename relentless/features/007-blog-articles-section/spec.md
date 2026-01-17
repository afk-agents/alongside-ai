# Feature Specification: Blog/Articles Section

**Feature Branch**: `007-blog-articles-section`
**Created**: 2026-01-17
**Status**: Draft
**Input**: User description: "Blog/Articles Section - Article listing page with filtering. Individual article pages with rich formatting. Author attribution. Related content links. Substack sync (manual or RSS initially)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse All Articles (Priority: P1)

A visitor wants to explore all published articles on the platform. They navigate to the blog page and see a chronologically-ordered list of articles with titles, excerpts, publication dates, and author information. They can scroll through or paginate to find articles of interest.

**Why this priority**: Core functionality - without article browsing, the entire blog section has no value. This is the foundational user journey.

**Independent Test**: Can be fully tested by navigating to /blog, viewing the article list, and verifying articles display with title, excerpt, date, and author. Delivers immediate value as users can discover content.

**Acceptance Scenarios**:

1. **Given** the blog page with published articles, **When** a visitor navigates to /blog, **Then** they see a list of articles sorted by publication date (newest first) showing title, excerpt, publication date, and author name.

2. **Given** the blog page with no articles, **When** a visitor navigates to /blog, **Then** they see a friendly empty state message indicating no articles are available yet.

3. **Given** the blog page with many articles, **When** a visitor views the page, **Then** articles are displayed with appropriate pagination or infinite scroll (initial limit of 10-20 articles).

---

### User Story 2 - Read Individual Article (Priority: P1)

A visitor clicks on an article from the listing to read the full content. They are taken to a dedicated article page with rich formatting, the author's profile information, publication date, and tags.

**Why this priority**: Equal priority with browsing - users must be able to read full articles for the blog to provide value.

**Independent Test**: Can be fully tested by clicking an article from the list and verifying the full content renders with proper formatting, author attribution, and metadata.

**Acceptance Scenarios**:

1. **Given** an article exists with slug "my-article", **When** a visitor navigates to /blog/my-article, **Then** they see the full article content with rich text formatting (headings, lists, code blocks, images, etc.).

2. **Given** an article page, **When** a visitor views it, **Then** they see the article's title, publication date, author name with link to author profile, and associated tags as clickable links.

3. **Given** an article with a Substack URL, **When** a visitor views the article, **Then** they see a link to read the original article on Substack.

4. **Given** a non-existent article slug, **When** a visitor navigates to /blog/invalid-slug, **Then** they see a 404 page with a link back to the blog.

---

### User Story 3 - Filter Articles by Tag (Priority: P2)

A visitor wants to find articles about a specific topic. They click on a tag from an article or browse the tag page to see all articles associated with that tag.

**Why this priority**: Enhances discovery but not required for basic functionality. Users can browse all articles without filtering.

**Independent Test**: Can be fully tested by clicking a tag and verifying only articles with that tag appear, or by navigating to /tags/[slug] and seeing articles in the content list.

**Acceptance Scenarios**:

1. **Given** the blog page with multiple articles, **When** a visitor clicks a tag filter chip, **Then** the article list updates to show only articles with that tag.

2. **Given** a tag page at /tags/[slug], **When** a visitor views it, **Then** they see articles associated with that tag (leveraging existing tag system).

3. **Given** a filter is active, **When** a visitor clicks "Clear filter" or the active tag, **Then** all articles are shown again.

---

### User Story 4 - View Author's Articles (Priority: P2)

A visitor is interested in a particular author and wants to see all their articles. They click on the author's name from an article to view the author's profile with their published articles.

**Why this priority**: Leverages existing profile system for author discovery. Not required for basic reading but enhances engagement.

**Independent Test**: Can be fully tested by clicking an author name and verifying their profile page shows their articles in the authored content section.

**Acceptance Scenarios**:

1. **Given** an article page, **When** a visitor clicks the author's name, **Then** they are taken to the author's profile page at /profiles/[slug].

2. **Given** an author's profile page, **When** a visitor views it, **Then** they see all published articles by that author in the "Authored Content" section.

---

### User Story 5 - Discover Related Content (Priority: P2)

After reading an article, a visitor wants to continue exploring related content. They see a "Related Articles" or "More from this author" section at the bottom of the article page.

**Why this priority**: Increases engagement and time on site, but core reading experience works without it.

**Independent Test**: Can be fully tested by scrolling to the bottom of an article and verifying related content appears based on shared tags or same author.

**Acceptance Scenarios**:

1. **Given** an article with tags, **When** a visitor scrolls to the end of the article, **Then** they see up to 3 related articles that share at least one tag (excluding the current article).

2. **Given** an article with no related content (no shared tags), **When** a visitor views the article, **Then** the related content section shows recent articles from the same author, or is hidden if no alternatives exist.

---

### User Story 6 - Admin Creates Article Manually (Priority: P1)

An admin wants to publish a new article on the platform. They access the admin interface, fill in the article details (title, content, excerpt, tags), and publish it.

**Why this priority**: Content must be created for the blog to function. Manual creation is the MVP before sync is implemented.

**Independent Test**: Can be fully tested by an admin creating an article through the admin interface and verifying it appears on the public blog.

**Acceptance Scenarios**:

1. **Given** an admin is logged in, **When** they navigate to admin articles section, **Then** they see a list of all articles (published and drafts) with create/edit/delete options.

2. **Given** the article create form, **When** an admin fills in title, content (Markdown), excerpt, author, tags, and clicks "Publish", **Then** a new article is created and immediately visible on the public blog.

3. **Given** an existing article, **When** an admin edits it, **Then** changes are saved and reflected on the public site.

4. **Given** an article, **When** an admin deletes it, **Then** the article is removed from the database and no longer accessible.

---

### User Story 7 - Admin Imports from Substack (Priority: P3)

An admin wants to import articles from a Substack newsletter. They provide the Substack RSS feed URL, preview the articles, select which ones to import, and import them.

**Why this priority**: Nice-to-have for content migration. Manual creation provides full functionality; sync is a convenience feature.

**Independent Test**: Can be fully tested by providing a Substack RSS URL, selecting articles to import, and verifying they appear in the system with proper formatting.

**Acceptance Scenarios**:

1. **Given** the admin Substack import page, **When** an admin enters a valid Substack RSS URL, **Then** they see a list of articles from the feed with title, date, and preview.

2. **Given** a list of importable articles, **When** an admin selects articles and clicks "Import", **Then** the selected articles are created with content extracted from RSS, author assigned, and substackUrl populated.

3. **Given** an already-imported article (matching substackUrl), **When** an admin attempts to import it again, **Then** they see a warning that it already exists with option to update or skip.

---

### User Story 8 - Featured Articles Display (Priority: P3)

Certain high-quality articles should be prominently featured on the homepage or at the top of the blog listing.

**Why this priority**: Enhancement for curation. Basic chronological listing provides a working blog without featured articles.

**Independent Test**: Can be fully tested by marking an article as featured and verifying it appears in a featured section.

**Acceptance Scenarios**:

1. **Given** the blog page with featured articles, **When** a visitor views the page, **Then** featured articles appear in a prominent section above or distinct from the main listing.

2. **Given** the admin article edit form, **When** an admin toggles "Featured", **Then** the article's isFeatured flag is updated.

---

### Edge Cases

- What happens when an article has no excerpt? System should auto-generate from first 160 characters of content.
- What happens when an article's author profile is deleted? Article should remain but show "Unknown Author" or the article should be orphaned/archived.
- What happens when importing an article with images from Substack? Images should remain as external URLs initially (not downloaded to storage).
- What happens when Markdown content contains XSS attempts? Content must be sanitized before rendering.
- What happens when an article's tags are deleted? Article should continue to work, tag association is simply removed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display articles sorted by publication date (newest first) on the blog listing page.
- **FR-002**: System MUST support Markdown rendering for article content with sanitization against XSS.
- **FR-003**: System MUST link articles to author profiles via the existing `authorId` field referencing the `profiles` table.
- **FR-004**: System MUST support tag filtering on the blog listing page, integrating with the existing tag system.
- **FR-005**: System MUST display related articles based on shared tags at the bottom of article pages.
- **FR-006**: Admin users MUST be able to create, edit, and delete articles through an admin interface.
- **FR-007**: System MUST validate that article slugs are unique and URL-friendly (following existing slug patterns).
- **FR-008**: System MUST support optional Substack URL field for linking back to original articles.
- **FR-009**: System MUST support featured article flagging for homepage/prominent display.
- **FR-010**: System MUST support Substack RSS import for bulk article creation (initial manual trigger, no auto-sync).

### Key Entities *(include if feature involves data)*

- **Article**: Already defined in schema - represents blog content with title, slug, content (Markdown), authorId (reference to profiles), publishedAt, optional excerpt, tags (array of tag IDs), substackUrl, and isFeatured flag.

- **Profile (existing)**: Author of articles. Articles reference profiles via authorId. Display author's displayName and link to their profile page.

- **Tag (existing)**: Unified taxonomy. Articles use the existing tags system for categorization and filtering. Articles already included in tag content queries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can browse all articles on /blog and navigate to individual article pages within 2 seconds load time.
- **SC-002**: Admin users can create a new article with full formatting in under 5 minutes.
- **SC-003**: All article content renders correctly with Markdown formatting (headings, lists, code blocks, links, images).
- **SC-004**: Tag filtering correctly shows only articles matching the selected tag.
- **SC-005**: Related articles section displays relevant content based on shared tags.
- **SC-006**: Substack RSS import successfully extracts title, content, and publication date from feed items.
- **SC-007**: All article pages are SEO-friendly with proper metadata (title, description, OpenGraph tags).

## Assumptions

1. **Markdown for content**: Articles will use Markdown for rich text formatting, rendered client-side with a library like `react-markdown` or similar.

2. **Author assignment**: When creating articles, admins will select an author from existing published profiles. The system will not auto-create profiles.

3. **RSS parsing for Substack**: Substack's RSS feed provides full article content in the feed item's `content:encoded` or `description` field. If only excerpts are available, a warning will be shown.

4. **No auto-sync initially**: Substack sync is manual/on-demand. Automatic scheduled syncing is out of scope for the initial implementation.

5. **Existing infrastructure**: The existing schema for `articles` table is used as-is. The existing tag system integration (already counting articles) is leveraged.

6. **Image hosting**: Images in article content remain as external URLs. No image upload/hosting is included in this feature (use existing patterns if needed later).

7. **Pagination approach**: Initial implementation uses client-side pagination or infinite scroll. Convex's real-time queries will handle the data fetching.
