# Feature Specification: App Shell and Navigation

**Feature Branch**: `004-app-shell-and-navigation`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "App shell and navigation"

## Overview

Create the foundational app shell and navigation system for Alongside AI. This includes a persistent header with primary navigation (Home, Events, Lab, Learn, Blog, About), secondary navigation (Search, Login/Account), a footer with utility links, and a mobile-responsive hamburger menu. The shell provides the consistent layout wrapper for all pages while supporting role-based navigation visibility.

**User Value**: Users can efficiently navigate to all major sections of the site with a clear, consistent interface that adapts to their device and authentication state.

**Problem Solved**: Currently the site has minimal navigation (logo + auth only). Users need access to all content sections, and the structure must accommodate future pages while remaining responsive across devices.

## User Scenarios & Testing

### User Story 1 - Desktop Navigation (Priority: P1)

A visitor on a desktop browser can see and use the primary navigation to access all major site sections without confusion.

**Why this priority**: Primary navigation is the core wayfinding mechanism. Without it, users cannot discover or access content, making this the foundation for all other features.

**Independent Test**: Can be fully tested by loading the site on a desktop viewport and clicking each navigation link to verify it navigates to the correct page.

**Acceptance Scenarios**:

1. **Given** a user on any page with viewport width ≥1024px, **When** they look at the header, **Then** they see the logo on the left and horizontal navigation links: Home, Events, Lab, Learn, Blog, About.
2. **Given** a user viewing the header, **When** they click "Events", **Then** they are navigated to `/events` page.
3. **Given** a user viewing the header, **When** they click "Lab", **Then** they are navigated to `/lab` page.
4. **Given** a user viewing the header, **When** they click "Learn", **Then** they are navigated to `/learn` page.
5. **Given** a user viewing the header, **When** they click "Blog", **Then** they are navigated to `/blog` page.
6. **Given** a user viewing the header, **When** they click "About", **Then** they are navigated to `/about` page.
7. **Given** a user on any page, **When** they click the logo, **Then** they are navigated to the homepage (`/`).

---

### User Story 2 - Mobile Hamburger Menu (Priority: P1)

A visitor on a mobile device can access navigation through a hamburger menu that opens a mobile-friendly menu panel.

**Why this priority**: Mobile users are a significant portion of traffic. Without mobile navigation, half or more of users cannot navigate the site effectively.

**Independent Test**: Can be fully tested by loading the site on a mobile viewport (<768px), tapping the hamburger icon, and verifying menu opens with all navigation links accessible.

**Acceptance Scenarios**:

1. **Given** a user on any page with viewport width <768px, **When** they view the header, **Then** they see the logo on the left and a hamburger menu icon on the right (no horizontal nav links).
2. **Given** a user on mobile viewing the closed menu, **When** they tap the hamburger icon, **Then** a menu panel slides in or overlays showing all navigation links vertically stacked.
3. **Given** a user with the mobile menu open, **When** they tap a navigation link, **Then** the menu closes and they are navigated to the selected page.
4. **Given** a user with the mobile menu open, **When** they tap outside the menu or tap a close button, **Then** the menu closes.
5. **Given** a user on mobile, **When** they navigate to a new page via the menu, **Then** the menu remains closed until they tap the hamburger again.

---

### User Story 3 - Secondary Navigation (Auth State) (Priority: P2)

Users see appropriate authentication-related links based on their login state—"Sign in" for guests, user info + "Sign out" for authenticated users.

**Why this priority**: Auth-aware navigation is important but the existing AuthNav component already handles this. This story ensures it integrates properly with the new shell.

**Independent Test**: Can be tested by viewing the site as a guest (see Sign in link) and as a logged-in user (see email + Sign out).

**Acceptance Scenarios**:

1. **Given** an unauthenticated user on desktop, **When** they view the header, **Then** they see a "Sign in" link in the secondary navigation area (right side).
2. **Given** an authenticated user on desktop, **When** they view the header, **Then** they see their email and a "Sign out" button.
3. **Given** an unauthenticated user on mobile with menu open, **When** they view the menu, **Then** they see "Sign in" option within the mobile menu.
4. **Given** an authenticated user on mobile with menu open, **When** they view the menu, **Then** they see their email and "Sign out" option.

---

### User Story 4 - Footer with Utility Links (Priority: P2)

Users can access utility pages (Contact, Privacy, Terms, FAQ) and social links from a persistent footer across all pages.

**Why this priority**: Footer links are standard for legal/utility pages and social presence, but users don't rely on them for primary navigation.

**Independent Test**: Can be tested by scrolling to the bottom of any page and verifying footer links are present and functional.

**Acceptance Scenarios**:

1. **Given** a user on any page, **When** they scroll to the bottom, **Then** they see a footer with links: Contact, Privacy Policy, Terms of Service, FAQ.
2. **Given** a user viewing the footer, **When** they click "Contact", **Then** they are navigated to `/contact` page.
3. **Given** a user viewing the footer, **When** they click "Privacy Policy", **Then** they are navigated to `/privacy` page.
4. **Given** a user viewing the footer, **When** they click "Terms of Service", **Then** they are navigated to `/terms` page.
5. **Given** a user viewing the footer, **When** they click "FAQ", **Then** they are navigated to `/faq` page.
6. **Given** a user viewing the footer, **When** they see social links section, **Then** they see links to LinkedIn, Substack (open in new tab).

---

### User Story 5 - Active Link Indication (Priority: P3)

Users can see which section they're currently in via visual highlighting of the active navigation link.

**Why this priority**: Visual feedback improves orientation but is a polish feature—navigation works without it.

**Independent Test**: Can be tested by navigating to each section and verifying the corresponding nav link appears visually distinct (e.g., different color, underline, or bold).

**Acceptance Scenarios**:

1. **Given** a user on the Events page, **When** they view the navigation, **Then** the "Events" link appears visually distinct from other links (e.g., highlighted, underlined, or bold).
2. **Given** a user navigating from Events to Lab, **When** the Lab page loads, **Then** the "Lab" link becomes active and "Events" returns to normal state.
3. **Given** a user on mobile with menu open while on the Blog page, **When** they view the menu, **Then** the "Blog" link appears visually distinct.

---

### User Story 6 - Search Access Point (Priority: P3)

Users can access site-wide search from the navigation header.

**Why this priority**: Search functionality (F15) is a separate feature. This story only adds the UI trigger point—a search icon/button that links to a search page or opens a search modal.

**Independent Test**: Can be tested by clicking the search icon and verifying it navigates to `/search` or opens a search interface.

**Acceptance Scenarios**:

1. **Given** a user on desktop, **When** they view the header, **Then** they see a search icon in the secondary navigation area.
2. **Given** a user on any device, **When** they click/tap the search icon, **Then** they are navigated to `/search` page (placeholder for now).
3. **Given** a user on mobile with menu open, **When** they view the menu, **Then** they see a search option.

---

### Edge Cases

- What happens when a navigation link points to a page that doesn't exist yet?
  - Pages should be created as placeholder stubs returning a "Coming Soon" message.
- How does the system handle keyboard navigation?
  - All navigation links must be keyboard accessible (Tab to focus, Enter to activate).
- What happens on very narrow screens (<320px)?
  - The hamburger menu and logo should remain accessible; logo may truncate or abbreviate.
- What happens if JavaScript fails to load?
  - Navigation links should be standard `<a>` tags that work without JS. Hamburger menu should use progressive enhancement.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a persistent header on all pages containing the site logo and navigation.
- **FR-002**: System MUST provide primary navigation links: Home, Events, Lab, Learn, Blog, About.
- **FR-003**: System MUST display horizontal primary navigation on viewports ≥768px.
- **FR-004**: System MUST display a hamburger menu icon on viewports <768px that opens mobile navigation.
- **FR-005**: System MUST display secondary navigation containing authentication state (Sign in / user + Sign out).
- **FR-006**: System MUST display a search icon/button that links to search functionality.
- **FR-007**: System MUST display a persistent footer on all pages with utility links.
- **FR-008**: Footer MUST contain links to: Contact, Privacy Policy, Terms of Service, FAQ.
- **FR-009**: Footer MUST contain social media links (LinkedIn, Substack) that open in new tabs.
- **FR-010**: System MUST visually indicate the currently active navigation link.
- **FR-011**: All navigation links MUST be keyboard accessible (focusable, activatable via Enter key).
- **FR-012**: Mobile menu MUST be closable by tapping outside, pressing Escape, or tapping a close button.
- **FR-013**: System MUST create placeholder pages for routes that don't exist yet (Events, Lab, Learn, Blog, About, Contact, Privacy, Terms, FAQ, Search).

### Key Entities

- **Navigation Link**: Represents a navigable route with label, href, and optional icon.
- **Navigation Section**: Groups links into primary (main content areas), secondary (utility/auth), and footer (legal/social).

## Success Criteria

### Measurable Outcomes

- **SC-001**: All primary navigation links are visible and functional on viewports ≥768px.
- **SC-002**: Hamburger menu is visible and functional on viewports <768px.
- **SC-003**: Page load time remains under 3 seconds with the new shell components.
- **SC-004**: All navigation links pass accessibility checks (keyboard navigation, focus indicators, ARIA labels where needed).
- **SC-005**: Navigation correctly reflects authentication state without layout shift.
- **SC-006**: Active link indication correctly highlights current route on both desktop and mobile.

## Dependencies

- **F02: Authentication System** - Already implemented. Auth state drives secondary navigation display.
- **Tailwind CSS v4** - Used for responsive styling.
- **Next.js App Router** - Layout system enables persistent shell.

## Assumptions

1. **Social links**: LinkedIn and Substack are the only required social links for now (based on PRD footer section).
2. **Search page**: A `/search` placeholder page is sufficient; full search functionality (F15) is a separate feature.
3. **Placeholder pages**: All linked pages will show a simple "Coming Soon" or section title until their respective features are built.
4. **Community link**: The "Community" navigation item mentioned in PRD's secondary nav is gated and will be added in a later feature (F24). Not included in this feature.
5. **Newsletter signup**: Will be added to footer in F17, not part of this shell feature.

## Out of Scope

- Full page content for Events, Lab, Learn, Blog, About, Contact, Privacy, Terms, FAQ (only placeholder stubs).
- Search functionality implementation (F15).
- Community directory link (gated feature, F24).
- Newsletter signup form in footer (F17).
- Admin-only navigation items (F18).
- Animation/transition polish beyond basic mobile menu open/close.
