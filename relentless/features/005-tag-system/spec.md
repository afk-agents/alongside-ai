# Feature Specification: Tag System

**Feature Branch**: `005-tag-system`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "Tag System"

## Overview

A unified taxonomy system that enables cross-content discovery across all content types (events, projects, experiments, articles, videos). Tags allow users to find related content by topic (e.g., LangChain, PostgreSQL, Agents, RAG, Data Engineering) through clickable tags on content items and dedicated tag pages that aggregate all content with that tag.

**User Value**: Users can easily discover related content across the site by clicking on topic tags, making it easier to find all resources related to a specific technology or concept.

**Problem Solved**: Without tags, content is siloed by type. Users interested in "RAG" would need to manually search events, projects, articles, and videos separately. Tags provide a unified cross-content discovery mechanism.

## User Scenarios & Testing

### User Story 1 - View Tag Page (Priority: P1)

A visitor clicks on a tag (e.g., "LangChain") on any content item and sees a dedicated page showing all content associated with that tag, grouped by content type.

**Why this priority**: This is the core value proposition of the tag system - enabling cross-content discovery. Without this, tags are just labels with no utility.

**Independent Test**: Can be fully tested by navigating to `/tags/langchain` and verifying all content types with the "LangChain" tag are displayed.

**Acceptance Scenarios**:

1. **Given** a tag "LangChain" exists with 2 events, 1 project, and 3 articles tagged, **When** a visitor navigates to `/tags/langchain`, **Then** the page displays all 6 pieces of content organized by type with the tag name as the page title.

2. **Given** a tag "RAG" exists with only 1 video tagged, **When** a visitor navigates to `/tags/rag`, **Then** the page displays the 1 video and does not show empty sections for content types with no matching items.

3. **Given** a tag slug "nonexistent" does not exist, **When** a visitor navigates to `/tags/nonexistent`, **Then** the system displays a 404 page.

---

### User Story 2 - Click Tag on Content Item (Priority: P1)

A visitor viewing a content item (event, project, article, video, experiment) sees clickable tags and can click one to navigate to that tag's page.

**Why this priority**: This is the primary entry point for tag discovery. Users discover tags while browsing content and use them to find related content.

**Independent Test**: Can be fully tested by viewing any tagged content item and clicking a tag to navigate to the tag page.

**Acceptance Scenarios**:

1. **Given** an event page displays tags "LangChain" and "Agents", **When** a visitor clicks the "LangChain" tag, **Then** the browser navigates to `/tags/langchain`.

2. **Given** a project has no tags assigned, **When** a visitor views the project page, **Then** no tag section or empty tag UI is displayed.

3. **Given** an article has 5 tags assigned, **When** a visitor views the article page, **Then** all 5 tags are displayed and clickable.

---

### User Story 3 - Browse All Tags (Priority: P2)

A visitor wants to explore what topics are covered on the site by viewing a page that lists all available tags.

**Why this priority**: Provides an alternative discovery path for users who want to browse by topic rather than content type. Useful for SEO and site exploration.

**Independent Test**: Can be fully tested by navigating to `/tags` and verifying all tags are displayed with links to their respective tag pages.

**Acceptance Scenarios**:

1. **Given** 10 tags exist in the system, **When** a visitor navigates to `/tags`, **Then** all 10 tags are displayed alphabetically with links to their tag pages.

2. **Given** each tag has content associated with it, **When** viewing the tags listing page, **Then** each tag displays a count of total associated content items.

3. **Given** a tag "PostgreSQL" exists, **When** a visitor clicks on it from the tags listing, **Then** the browser navigates to `/tags/postgresql`.

---

### User Story 4 - Admin Creates Tag (Priority: P2)

An admin user creates a new tag in the system to categorize content.

**Why this priority**: Admins need to manage the taxonomy, but content can exist without tags. Tag creation is a prerequisite for tagging content.

**Independent Test**: Can be fully tested by an admin creating a tag and verifying it appears in the system.

**Acceptance Scenarios**:

1. **Given** an admin is logged in, **When** the admin creates a tag with name "Vector Databases" and slug "vector-databases", **Then** the tag is saved and available for assignment to content.

2. **Given** a tag with slug "langchain" already exists, **When** an admin attempts to create another tag with slug "langchain", **Then** the system rejects the creation with an error indicating the slug must be unique.

3. **Given** an admin provides only a tag name "New Topic", **When** the admin creates the tag, **Then** the system auto-generates a URL-friendly slug "new-topic".

---

### User Story 5 - Admin Assigns Tags to Content (Priority: P3)

An admin user assigns or removes tags from content items (events, projects, experiments, articles, videos).

**Why this priority**: After tags exist and tag pages work, admins need to associate tags with content. This completes the content-to-tag relationship.

**Independent Test**: Can be fully tested by an admin editing content to add/remove tags and verifying the content appears on the tag page.

**Acceptance Scenarios**:

1. **Given** an event exists without tags and tag "LangChain" exists, **When** an admin assigns "LangChain" to the event, **Then** the event appears on the `/tags/langchain` page.

2. **Given** a project has tag "RAG" assigned, **When** an admin removes the "RAG" tag, **Then** the project no longer appears on the `/tags/rag` page.

3. **Given** a video exists and multiple tags exist, **When** an admin assigns 3 tags to the video, **Then** all 3 tags display on the video detail page and the video appears on all 3 tag pages.

---

### User Story 6 - Admin Edits Tag (Priority: P3)

An admin user edits an existing tag's name or description.

**Why this priority**: Tag management is needed for taxonomy maintenance, but editing is less frequent than creation and viewing.

**Independent Test**: Can be fully tested by an admin editing a tag and verifying the changes reflect across the system.

**Acceptance Scenarios**:

1. **Given** a tag with name "LangChain" exists, **When** an admin updates the name to "LangChain Framework", **Then** the updated name displays on all content items and the tag page.

2. **Given** a tag exists with a slug, **When** an admin edits the tag, **Then** the slug cannot be changed (to prevent breaking URLs).

3. **Given** a tag with description "Python framework for LLMs" exists, **When** an admin updates the description to "Build LLM applications", **Then** the new description displays on the tag page.

---

### User Story 7 - Admin Deletes Tag (Priority: P3)

An admin user removes a tag that is no longer needed.

**Why this priority**: Cleanup capability for taxonomy maintenance. Less common operation but necessary for long-term management.

**Independent Test**: Can be fully tested by an admin deleting a tag and verifying it is removed from the system and all content.

**Acceptance Scenarios**:

1. **Given** a tag "Deprecated Topic" exists with 2 articles tagged, **When** an admin deletes the tag, **Then** the tag is removed and the 2 articles no longer reference it.

2. **Given** a tag is deleted, **When** a visitor navigates to the former tag's URL, **Then** a 404 page is displayed.

---

### Edge Cases

- What happens when a tag has 0 content items? The tag page displays with an empty state message: "No content tagged with [tag name] yet."
- What happens when content is deleted? Tag associations for that content are automatically removed.
- What happens when there are many tags (100+)? The tags listing page loads efficiently with pagination or virtualized scrolling.
- How are tag slugs validated? Slugs must be URL-friendly (lowercase, hyphens, no special characters), unique, and between 2-50 characters.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display clickable tags on all content types (events, projects, experiments, articles, videos).
- **FR-002**: System MUST provide a tag detail page at `/tags/[slug]` showing all content with that tag.
- **FR-003**: System MUST group content on tag pages by content type (events, projects, experiments, articles, videos).
- **FR-004**: System MUST provide a tags listing page at `/tags` showing all available tags.
- **FR-005**: System MUST display content counts per tag on the tags listing page.
- **FR-006**: System MUST enforce unique tag slugs.
- **FR-007**: System MUST auto-generate URL-friendly slugs from tag names when not provided.
- **FR-008**: Admin users MUST be able to create, edit, and delete tags.
- **FR-009**: Admin users MUST be able to assign and remove tags from content.
- **FR-010**: System MUST only display published content on public tag pages (non-admin users should not see draft content).
- **FR-011**: System MUST sort tags alphabetically on the tags listing page.
- **FR-012**: System MUST return 404 for non-existent tag slugs.

### Key Entities

- **Tag**: Represents a topic category with name (display), slug (URL), and optional description. Referenced by multiple content types.
- **Content-Tag Association**: Many-to-many relationship between tags and content types (stored as `tags: v.array(v.id("tags"))` on each content type).

## Dependencies

- **Existing Schema**: The `tags` table and tag references on content types already exist in `convex/schema.ts`.
- **Authentication**: Admin functions require user authentication and admin role verification.
- **Navigation**: Tag pages should integrate with the existing app shell and navigation.

## Assumptions

1. **Slug immutability**: Tag slugs cannot be changed after creation to prevent breaking existing URLs and bookmarks. Only name and description can be edited.
2. **No tag hierarchy**: Tags are flat (no parent-child relationships). This simplifies the initial implementation.
3. **Admin-only management**: Only admin users can create, edit, delete tags, and assign tags to content. This prevents taxonomy sprawl.
4. **Content ordering on tag pages**: Content within each type is ordered by recency (newest first for articles/events by date, most recent for projects/experiments/videos by creation time).
5. **No tag limits**: There is no limit on how many tags can be assigned to a single content item.

## Out of Scope

- **Tag suggestions/autocomplete**: Smart tag suggestions while typing (future enhancement).
- **Tag synonyms/aliases**: Mapping multiple terms to a single tag (e.g., "PostgreSQL" and "Postgres").
- **Related tags**: Showing tags commonly used together.
- **Tag filtering on listing pages**: Filtering events/projects/articles by tag on their respective listing pages (separate feature).
- **Tag popularity/trending**: Displaying most-used or trending tags.
- **User-created tags**: Community members creating their own tags (Phase 3 feature per PRD).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Tag pages load in under 2 seconds with up to 100 content items.
- **SC-002**: All tagged content appears on the correct tag page within 1 second of tag assignment.
- **SC-003**: Tag slugs are correctly validated (no duplicates, URL-friendly format) with 100% accuracy.
- **SC-004**: 100% of existing content types (events, projects, experiments, articles, videos) display clickable tags when tags are assigned.
