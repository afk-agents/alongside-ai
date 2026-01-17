# Feature Specification: Founder Profiles & About Page

**Feature Branch**: `006-founder-profiles-about-page`
**Created**: 2026-01-17
**Status**: Draft
**Input**: User description: "Founder Profiles & About Page - About page with mission, values, and founder bios (David & Nathan). Founder profiles as the template for future member profiles."

## Overview

This feature transforms the placeholder About page into a comprehensive introduction to Alongside AI, featuring the organization's mission, values, and detailed founder biographies. The founder profiles (David and Nathan) will serve as the template and reference implementation for future member profiles, establishing the pattern for how community members present themselves on the platform.

The About page is a critical public-facing page that communicates the organization's purpose to potential community members, event attendees, and partners. The founder profiles demonstrate the profile system's capabilities and set expectations for member participation.

## User Scenarios & Testing

### User Story 1 - View About Page Content (Priority: P1)

A visitor navigates to the About page to learn about Alongside AI's mission, values, and the people behind it. They want to understand what makes this community different and whether it aligns with their professional interests.

**Why this priority**: The About page is essential for establishing credibility and communicating purpose to all visitors. Without it, potential community members have no way to understand the organization.

**Independent Test**: Can be fully tested by navigating to `/about` and verifying mission statement, values, and introductory content are displayed. Delivers organizational context to visitors.

**Acceptance Scenarios**:

1. **Given** a visitor is on any page, **When** they navigate to `/about`, **Then** they see the organization's mission statement prominently displayed
2. **Given** a visitor is on the About page, **When** they scroll through the content, **Then** they see a list of core values with brief explanations
3. **Given** a visitor is on the About page, **When** the page loads, **Then** the content renders within 2 seconds and is visually cohesive with the site design

---

### User Story 2 - View Founder Biographies on About Page (Priority: P1)

A visitor on the About page wants to learn about the founders (David and Nathan). They see biographical information, photos, professional backgrounds, and social links that help establish trust and demonstrate expertise.

**Why this priority**: Founder bios provide social proof and establish credibility. They also serve as the template for all future member profiles.

**Independent Test**: Can be fully tested by navigating to `/about` and verifying founder sections display photos, names, bios, and social links. Delivers founder credibility information.

**Acceptance Scenarios**:

1. **Given** a visitor is on the About page, **When** they scroll to the founder section, **Then** they see profile cards for both David and Nathan
2. **Given** a visitor views a founder profile card, **When** the card is displayed, **Then** they see: photo, display name, bio/about text, current role/what they're working on
3. **Given** a visitor views a founder profile card, **When** social links are available, **Then** they can click links to LinkedIn, Twitter/X, GitHub, or personal website
4. **Given** a visitor views a founder profile, **When** they click on the founder's name or "View Full Profile" link, **Then** they are taken to the founder's full profile page

---

### User Story 3 - View Individual Founder Profile Page (Priority: P2)

A visitor wants to see more detailed information about a specific founder. They navigate to the founder's dedicated profile page to view their complete professional story, all projects/experiments they've contributed to, and comprehensive contact options.

**Why this priority**: Individual profile pages provide the detailed view needed for deeper engagement and serve as the template for member profiles.

**Independent Test**: Can be fully tested by navigating to `/profiles/[slug]` for a founder and verifying all profile fields and linked content display correctly.

**Acceptance Scenarios**:

1. **Given** a visitor is on any page, **When** they navigate to a founder's profile URL (e.g., `/profiles/david` or `/profiles/nathan`), **Then** they see the founder's complete profile page
2. **Given** a visitor views a founder profile page, **When** the page loads, **Then** they see: full bio, photo, location, skills/expertise tags, social links, and "what I'm working on"
3. **Given** a founder has authored content, **When** viewing their profile page, **Then** the visitor sees links to their projects, experiments, articles, or videos
4. **Given** a visitor is on a founder profile page, **When** they want to connect, **Then** they see clear calls-to-action (social links, contact options)

---

### User Story 4 - Admin Manages Founder Profiles (Priority: P2)

An admin user needs to create and update founder profile information. They use the admin interface to set profile fields, upload photos, and mark profiles as "published" so they appear on the About page.

**Why this priority**: Content management is required to initially populate and later update founder information.

**Independent Test**: Can be fully tested by an admin logging in, navigating to profile management, editing a founder profile, and verifying changes appear on the About page.

**Acceptance Scenarios**:

1. **Given** an admin is logged in, **When** they navigate to profile management, **Then** they can view and edit founder profiles
2. **Given** an admin is editing a profile, **When** they update fields (bio, photo, social links, etc.), **Then** the changes are saved and reflected on the public profile
3. **Given** an admin is editing a profile, **When** they set profileStatus to "published", **Then** the profile appears in the About page founder section
4. **Given** an admin uploads a profile photo, **When** the upload completes, **Then** the photo is stored and displayed on the profile

---

### User Story 5 - Founder Profile as Member Template (Priority: P3)

As the development team implements member profiles in the future, they use the founder profile implementation as the architectural template. The same profile structure, components, and queries work for both founders and regular members.

**Why this priority**: Template value is realized in future features; this story documents the architectural intent.

**Independent Test**: Can be tested by verifying the profile components, queries, and data structures are generic (not founder-specific) and can render any profile with role="member".

**Acceptance Scenarios**:

1. **Given** a profile exists with role "member", **When** the profile page component receives this profile, **Then** it renders correctly using the same components as founder profiles
2. **Given** the profiles table schema, **When** reviewing the structure, **Then** all fields needed for member profiles are already defined (bio, photo, social links, skills, location, etc.)
3. **Given** the profile page route `/profiles/[slug]`, **When** a member profile slug is used, **Then** the page renders the member's profile (identical to founder profile rendering)

---

### Edge Cases

- What happens when a founder profile has no photo? Display a placeholder avatar or initials
- What happens when social links are empty? Hide the social links section rather than showing empty icons
- What happens when a visitor accesses a non-existent profile slug? Display a 404-style "Profile not found" page
- How does the system handle profiles marked as "locked" or "unlocked" (not published)? They do not appear on the About page and return 404 for direct URL access
- What if a founder has no authored content? The "content" section is hidden or shows "No content yet"

## Requirements

### Functional Requirements

- **FR-001**: System MUST display the About page at the `/about` URL route
- **FR-002**: About page MUST include mission statement, values list, and founder section
- **FR-003**: About page MUST display founder profile cards for users with role="admin" and profileStatus="published"
- **FR-004**: Profile cards MUST display: photo (or placeholder), display name, bio excerpt, and social links
- **FR-005**: System MUST support individual profile pages at `/profiles/[slug]` URL route
- **FR-006**: Profile pages MUST display all profile fields: photo, displayName, bio, location, skills, socialLinks, workingOnNow
- **FR-007**: Profile pages MUST link to content authored by that profile (projects, experiments, articles, videos)
- **FR-008**: Admins MUST be able to edit profile information through the admin interface
- **FR-009**: Profile photos MUST be uploadable and stored via Convex file storage
- **FR-010**: Only profiles with profileStatus="published" MUST appear on the public About page
- **FR-011**: Profiles with profileStatus="locked" or "unlocked" MUST NOT be accessible via public URLs
- **FR-012**: System MUST add a `slug` field to the profiles table for URL routing

### Key Entities

- **Profile (existing)**: Represents a user's public-facing identity. Key attributes: userId, role, profileStatus, displayName, bio, photoUrl, socialLinks (linkedin, twitter, github, website), workingOnNow, skills, location. The profile schema already exists and supports most required fields. A `slug` field needs to be added for URL routing.

- **About Page Content**: Static content for mission and values. Will be hardcoded initially in the component.

## Success Criteria

### Measurable Outcomes

- **SC-001**: About page loads and renders completely within 2 seconds on average connections
- **SC-002**: 100% of published founder profiles display correctly on the About page
- **SC-003**: All social links on profiles are clickable and open in new tabs
- **SC-004**: Profile pages correctly display all populated fields with no layout breakage
- **SC-005**: Admin users can successfully update any profile field and see changes reflected within 5 seconds
- **SC-006**: Profile photo uploads complete successfully and display at appropriate resolution
- **SC-007**: Non-published profiles return appropriate 404/not-found response (not leaked data)

## Dependencies

- Existing profile schema in `convex/schema.ts` - already defined with most needed fields
- Existing authentication system - for admin access to profile editing
- Convex file storage - for profile photo uploads
- Existing component patterns - for consistent styling with rest of application

## Assumptions

1. **Founder profiles use admin role**: David and Nathan's profiles will have role="admin" to distinguish them as founders. The About page will query for published admin profiles specifically.

2. **Profile slugs derived from display name**: A new `slug` field will be added to the profiles table for URL routing (e.g., "david-martinez" for `/profiles/david-martinez`).

3. **Mission and values are initially hardcoded**: The About page content (mission, values) will be implemented as static content in the component initially, with potential for CMS-style management in a future feature.

4. **Photo storage uses Convex**: Profile photos will be stored using Convex's built-in file storage system, with photoUrl storing the storage ID or URL.

5. **Two founders initially**: The system is designed for David and Nathan but supports any number of admin profiles appearing in the founder section.

## Out of Scope

- Member self-service profile editing (future feature)
- Profile search or filtering functionality
- Profile verification/badge system
- Member directory page (separate from About page)
- Profile analytics (view counts, engagement)
- Profile import from LinkedIn or other services
- Multi-language support for profile content
- Profile approval workflow for non-admin users
