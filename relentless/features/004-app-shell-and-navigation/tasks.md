# Tasks: App Shell and Navigation

**Feature Branch**: `004-app-shell-and-navigation`
**Input**: Design documents from `relentless/features/004-app-shell-and-navigation/`
**Prerequisites**: spec.md (required), plan.md (required)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US-001, US-002)

---

## Phase 1: Setup

**Purpose**: Create shared infrastructure and configuration

- [ ] T001 [P] Create `lib/navigation.ts` with PRIMARY_NAV, FOOTER_NAV, SOCIAL_LINKS constants
- [ ] T002 [P] Create placeholder page template component

**Checkpoint**: Navigation configuration ready - component implementation can begin

---

## Phase 2: User Stories

### US-001: Navigation Configuration and NavLink Component

**Description:** As a developer, I want a centralized navigation configuration and active-aware link component so that navigation links can be reused across the site with consistent active state styling.

**Acceptance Criteria:**
- [ ] `lib/navigation.ts` exports PRIMARY_NAV with 6 links (Home, Events, Lab, Learn, Blog, About)
- [ ] `lib/navigation.ts` exports FOOTER_NAV with 4 links (Contact, Privacy Policy, Terms of Service, FAQ)
- [ ] `lib/navigation.ts` exports SOCIAL_LINKS with 2 links (LinkedIn, Substack)
- [ ] NavLink component renders a Next.js Link
- [ ] NavLink applies activeClassName when current pathname matches href
- [ ] NavLink applies activeClassName when pathname starts with href (for nested routes)
- [ ] NavLink uses `usePathname` hook for route detection
- [ ] Typecheck passes (`bunx tsc --noEmit`)
- [ ] Lint passes (`bun run lint`)
- [ ] Unit tests pass for NavLink component

**Dependencies:** None
**Phase:** Foundation
**Priority:** P1
**Status:** pending

**Implementation Tasks:**
- [ ] T003 [US-001] Write tests for NavLink component (TDD)
- [ ] T004 [US-001] Create `lib/navigation.ts` with typed nav constants
- [ ] T005 [US-001] Create `components/layout/NavLink.tsx` with active state detection

---

### US-002: Desktop Header Navigation

**Description:** As a visitor on a desktop browser, I want to see horizontal navigation links in the header so that I can easily navigate to all major site sections.

**Acceptance Criteria:**
- [ ] Header component renders site logo as link to home (/)
- [ ] Header displays horizontal navigation links on viewports ≥768px
- [ ] Navigation includes: Home, Events, Lab, Learn, Blog, About
- [ ] Navigation links use NavLink component for active state
- [ ] Search icon is visible and links to /search
- [ ] AuthNav component is integrated in the header
- [ ] Header uses semantic `<header>` and `<nav>` HTML elements
- [ ] All links are keyboard accessible (focusable via Tab, activatable via Enter)
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Unit tests pass for Header component

**Dependencies:** US-001
**Phase:** Stories
**Priority:** P1
**Status:** pending

**Implementation Tasks:**
- [ ] T006 [US-002] Write tests for Header component (TDD)
- [ ] T007 [US-002] Create `components/layout/Header.tsx` with desktop navigation
- [ ] T008 [US-002] Add search icon to header secondary navigation
- [ ] T009 [US-002] Integrate existing AuthNav component into Header

---

### US-003: Mobile Hamburger Menu

**Description:** As a visitor on a mobile device, I want to access navigation through a hamburger menu so that I can navigate the site effectively on small screens.

**Acceptance Criteria:**
- [ ] Hamburger menu icon is visible on viewports <768px
- [ ] Horizontal nav is hidden on viewports <768px
- [ ] Clicking hamburger icon opens mobile menu panel
- [ ] Mobile menu displays all navigation links vertically
- [ ] Mobile menu includes auth state (Sign in or email + Sign out)
- [ ] Mobile menu includes search option
- [ ] Clicking a navigation link closes the menu and navigates
- [ ] Clicking outside the menu closes it
- [ ] Pressing Escape key closes the menu
- [ ] Menu has `aria-expanded` attribute on hamburger button
- [ ] Menu content has `aria-hidden` when closed
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Unit tests pass for MobileMenu component

**Dependencies:** US-001, US-002
**Phase:** Stories
**Priority:** P1
**Status:** pending

**Implementation Tasks:**
- [ ] T010 [US-003] Write tests for MobileMenu component (TDD)
- [ ] T011 [US-003] Create `components/layout/MobileMenu.tsx` with slide-in panel
- [ ] T012 [US-003] Add hamburger button to Header (visible <768px)
- [ ] T013 [US-003] Implement Escape key and click-outside handlers
- [ ] T014 [US-003] Add accessibility attributes (aria-expanded, aria-hidden)

---

### US-004: Footer with Utility Links

**Description:** As a visitor, I want to see a footer with utility links and social media links so that I can access legal pages and connect on social platforms.

**Acceptance Criteria:**
- [ ] Footer displays on all pages
- [ ] Footer contains links: Contact, Privacy Policy, Terms of Service, FAQ
- [ ] Footer contains social links: LinkedIn, Substack
- [ ] Social links open in new tab (target="_blank", rel="noopener noreferrer")
- [ ] Footer uses semantic `<footer>` HTML element
- [ ] All footer links are keyboard accessible
- [ ] Footer is a server component (no "use client")
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Unit tests pass for Footer component

**Dependencies:** US-001
**Phase:** Stories
**Priority:** P2
**Status:** pending

**Implementation Tasks:**
- [ ] T015 [P] [US-004] Write tests for Footer component (TDD)
- [ ] T016 [US-004] Create `components/layout/Footer.tsx` with utility and social links

---

### US-005: Placeholder Pages

**Description:** As a visitor, I want to see placeholder pages for all navigation targets so that clicking any navigation link results in a valid page.

**Acceptance Criteria:**
- [ ] /events page exists and displays "Events" heading
- [ ] /lab page exists and displays "The Lab" heading
- [ ] /learn page exists and displays "Learn" heading
- [ ] /blog page exists and displays "Blog" heading
- [ ] /about page exists and displays "About" heading
- [ ] /search page exists and displays "Search" heading
- [ ] /contact page exists and displays "Contact" heading
- [ ] /privacy page exists and displays "Privacy Policy" heading
- [ ] /terms page exists and displays "Terms of Service" heading
- [ ] /faq page exists and displays "FAQ" heading
- [ ] All pages are server components
- [ ] All pages use consistent "Coming Soon" styling
- [ ] Typecheck passes
- [ ] Lint passes

**Dependencies:** None
**Phase:** Stories
**Priority:** P1
**Status:** pending

**Implementation Tasks:**
- [ ] T017 [P] [US-005] Create `app/events/page.tsx` placeholder
- [ ] T018 [P] [US-005] Create `app/lab/page.tsx` placeholder
- [ ] T019 [P] [US-005] Create `app/learn/page.tsx` placeholder
- [ ] T020 [P] [US-005] Create `app/blog/page.tsx` placeholder
- [ ] T021 [P] [US-005] Create `app/about/page.tsx` placeholder
- [ ] T022 [P] [US-005] Create `app/search/page.tsx` placeholder
- [ ] T023 [P] [US-005] Create `app/contact/page.tsx` placeholder
- [ ] T024 [P] [US-005] Create `app/privacy/page.tsx` placeholder
- [ ] T025 [P] [US-005] Create `app/terms/page.tsx` placeholder
- [ ] T026 [P] [US-005] Create `app/faq/page.tsx` placeholder

---

### US-006: Layout Integration

**Description:** As a developer, I want the Header and Footer integrated into the root layout so that they appear consistently on all pages.

**Acceptance Criteria:**
- [ ] `app/layout.tsx` imports and renders Header component
- [ ] `app/layout.tsx` imports and renders Footer component
- [ ] Header appears before main content
- [ ] Footer appears after main content
- [ ] Main content has minimum height for proper footer positioning
- [ ] Existing AuthNav removed from layout (now in Header)
- [ ] Existing header markup replaced with Header component
- [ ] Typecheck passes
- [ ] Lint passes

**Dependencies:** US-002, US-004
**Phase:** Stories
**Priority:** P1
**Status:** pending

**Implementation Tasks:**
- [ ] T027 [US-006] Update `app/layout.tsx` to use Header and Footer components
- [ ] T028 [US-006] Remove old header markup from layout
- [ ] T029 [US-006] Add min-h-screen to main element for footer positioning

---

### US-007: Active Link Indication

**Description:** As a visitor, I want to see which section I'm currently in via visual highlighting of the active navigation link so that I know where I am on the site.

**Acceptance Criteria:**
- [ ] Current page's navigation link has distinct visual styling (bold, underline, or color)
- [ ] Active styling works for exact route matches (e.g., /events)
- [ ] Active styling works for nested routes (e.g., /events/123 highlights Events)
- [ ] Active styling visible on both desktop and mobile navigation
- [ ] Non-active links return to normal state when navigating away
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Tests verify active state changes on navigation

**Dependencies:** US-001, US-002, US-003
**Phase:** Polish
**Priority:** P3
**Status:** pending

**Implementation Tasks:**
- [ ] T030 [US-007] Add active link styling to desktop navigation
- [ ] T031 [US-007] Add active link styling to mobile menu
- [ ] T032 [US-007] Write tests verifying active state on route changes

---

## Phase 3: Polish & Integration

**Purpose**: Final integration and quality checks

- [ ] T033 [P] Run full test suite and fix any failures
- [ ] T034 [P] Run Lighthouse accessibility audit and address issues
- [ ] T035 Verify all navigation flows work end-to-end
- [ ] T036 Visual review on mobile and desktop viewports

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (User Stories)**: Some stories depend on US-001
- **Phase 3 (Polish)**: Depends on all user stories

### User Story Dependencies

```
US-001 (NavLink + Config) ──┬── US-002 (Desktop Header) ──┬── US-003 (Mobile Menu) ─┐
                            │                              │                          │
                            ├── US-004 (Footer) ───────────┼── US-006 (Layout) ───────┤
                            │                              │                          │
US-005 (Placeholder Pages) ─┴──────────────────────────────┴── US-007 (Active Links) ─┘
```

### Parallel Opportunities

- **US-001** and **US-005** can run in parallel (no dependencies)
- **US-004** can run in parallel with **US-002** and **US-003** (only depends on US-001)
- All placeholder page tasks (T017-T026) can run in parallel

---

## Summary

| Phase | User Story | Tasks | Priority |
|-------|------------|-------|----------|
| 1 | Setup | T001-T002 | - |
| 2 | US-001: NavLink + Config | T003-T005 | P1 |
| 2 | US-002: Desktop Header | T006-T009 | P1 |
| 2 | US-003: Mobile Menu | T010-T014 | P1 |
| 2 | US-004: Footer | T015-T016 | P2 |
| 2 | US-005: Placeholder Pages | T017-T026 | P1 |
| 2 | US-006: Layout Integration | T027-T029 | P1 |
| 2 | US-007: Active Link Indication | T030-T032 | P3 |
| 3 | Polish | T033-T036 | - |

**Total User Stories**: 7
**Total Tasks**: 36
**Parallel Opportunities**: US-001/US-005, US-004/US-002/US-003, T017-T026
