# Quality Checklist: App Shell and Navigation

**Purpose**: Validate completeness of app shell and navigation implementation
**Created**: 2026-01-16
**Feature**: [spec.md](./spec.md)

## Navigation Configuration

- [ ] CHK-001 [US-001] `lib/navigation.ts` exports typed PRIMARY_NAV array with 6 items
- [ ] CHK-002 [US-001] PRIMARY_NAV contains correct hrefs: `/`, `/events`, `/lab`, `/learn`, `/blog`, `/about`
- [ ] CHK-003 [US-001] FOOTER_NAV contains correct hrefs: `/contact`, `/privacy`, `/terms`, `/faq`
- [ ] CHK-004 [US-001] SOCIAL_LINKS contains valid external URLs for LinkedIn and Substack
- [ ] CHK-005 [US-001] All navigation arrays use `as const` for type narrowing
- [ ] CHK-006 [Gap] Consider adding icons to navigation items for future mobile enhancement

## NavLink Component

- [ ] CHK-007 [US-001] NavLink renders a Next.js `<Link>` component
- [ ] CHK-008 [US-001] NavLink accepts `href`, `children`, `className`, `activeClassName` props
- [ ] CHK-009 [US-001] NavLink uses `usePathname()` hook to detect current route
- [ ] CHK-010 [US-001] Active state triggers for exact match (pathname === href)
- [ ] CHK-011 [US-001] Active state triggers for nested routes (pathname.startsWith(href + '/'))
- [ ] CHK-012 [US-007] Active styling is visually distinct (bold, underline, or color change)
- [ ] CHK-013 [Edge Case] Home link (`/`) doesn't match all routes as "active"

## Header Component

- [ ] CHK-014 [US-002] Header renders semantic `<header>` element
- [ ] CHK-015 [US-002] Logo links to homepage (`/`)
- [ ] CHK-016 [US-002] Primary navigation renders `<nav>` element
- [ ] CHK-017 [US-002] Desktop nav visible at ≥768px viewport (Tailwind `md:flex`)
- [ ] CHK-018 [US-002] Desktop nav hidden at <768px viewport (Tailwind `hidden md:flex`)
- [ ] CHK-019 [US-002] All 6 primary nav links rendered using NavLink component
- [ ] CHK-020 [US-002] Search icon present and links to `/search`
- [ ] CHK-021 [US-002] AuthNav component integrated in header
- [ ] CHK-022 [US-003] Hamburger button visible at <768px (Tailwind `md:hidden`)
- [ ] CHK-023 [US-003] Hamburger button hidden at ≥768px
- [ ] CHK-024 [Constitution] Header is a client component (uses state for mobile menu)

## Mobile Menu Component

- [ ] CHK-025 [US-003] MobileMenu accepts `isOpen` and `onClose` props
- [ ] CHK-026 [US-003] Menu panel visible when `isOpen` is true
- [ ] CHK-027 [US-003] Menu panel hidden when `isOpen` is false
- [ ] CHK-028 [US-003] All primary nav links displayed vertically
- [ ] CHK-029 [US-003] Search option included in mobile menu
- [ ] CHK-030 [US-003] Auth state (Sign in or email + Sign out) displayed
- [ ] CHK-031 [US-003] Clicking nav link calls `onClose` and navigates
- [ ] CHK-032 [US-003] Clicking overlay/backdrop calls `onClose`
- [ ] CHK-033 [US-003] Close button available and calls `onClose`
- [ ] CHK-034 [US-003] Escape key press calls `onClose`
- [ ] CHK-035 [US-003] `aria-expanded` attribute on hamburger button reflects open state
- [ ] CHK-036 [US-003] `aria-hidden` attribute on menu panel reflects visibility
- [ ] CHK-037 [Edge Case] Menu closes on route navigation (pathname change)

## Footer Component

- [ ] CHK-038 [US-004] Footer renders semantic `<footer>` element
- [ ] CHK-039 [US-004] All 4 utility links rendered (Contact, Privacy Policy, Terms of Service, FAQ)
- [ ] CHK-040 [US-004] Social links for LinkedIn and Substack rendered
- [ ] CHK-041 [US-004] Social links have `target="_blank"` attribute
- [ ] CHK-042 [US-004] Social links have `rel="noopener noreferrer"` attribute
- [ ] CHK-043 [Constitution] Footer is a server component (no "use client" directive)
- [ ] CHK-044 [Gap] Consider adding copyright notice with current year

## Placeholder Pages

- [ ] CHK-045 [US-005] `/events` returns 200 with "Events" heading
- [ ] CHK-046 [US-005] `/lab` returns 200 with "The Lab" heading
- [ ] CHK-047 [US-005] `/learn` returns 200 with "Learn" heading
- [ ] CHK-048 [US-005] `/blog` returns 200 with "Blog" heading
- [ ] CHK-049 [US-005] `/about` returns 200 with "About" heading
- [ ] CHK-050 [US-005] `/search` returns 200 with "Search" heading
- [ ] CHK-051 [US-005] `/contact` returns 200 with "Contact" heading
- [ ] CHK-052 [US-005] `/privacy` returns 200 with "Privacy Policy" heading
- [ ] CHK-053 [US-005] `/terms` returns 200 with "Terms of Service" heading
- [ ] CHK-054 [US-005] `/faq` returns 200 with "FAQ" heading
- [ ] CHK-055 [Constitution] All placeholder pages are server components

## Layout Integration

- [ ] CHK-056 [US-006] `app/layout.tsx` imports Header component
- [ ] CHK-057 [US-006] `app/layout.tsx` imports Footer component
- [ ] CHK-058 [US-006] Header rendered before `{children}`
- [ ] CHK-059 [US-006] Footer rendered after `{children}`
- [ ] CHK-060 [US-006] Main content wrapper has `min-h-screen` for sticky footer
- [ ] CHK-061 [US-006] Old inline header markup removed from layout
- [ ] CHK-062 [US-006] Old AuthNav import removed (now in Header)

## Accessibility

- [ ] CHK-063 [US-002] All navigation links focusable via Tab key
- [ ] CHK-064 [US-002] All navigation links activatable via Enter key
- [ ] CHK-065 [US-002] Focus indicators visible on keyboard focus (focus:ring classes)
- [ ] CHK-066 [US-004] Footer links focusable via Tab key
- [ ] CHK-067 [US-003] Mobile menu focus trapped while open
- [ ] CHK-068 [Edge Case] Skip link for keyboard users (nice-to-have)
- [ ] CHK-069 [Gap] Consider adding aria-label to navigation elements

## Testing & Quality

- [ ] CHK-070 [Constitution] Unit tests written BEFORE implementation (TDD)
- [ ] CHK-071 [Constitution] NavLink component has unit tests
- [ ] CHK-072 [Constitution] Header component has unit tests
- [ ] CHK-073 [Constitution] MobileMenu component has unit tests
- [ ] CHK-074 [Constitution] Footer component has unit tests
- [ ] CHK-075 [Constitution] `bunx tsc --noEmit` passes with 0 errors
- [ ] CHK-076 [Constitution] `bun run lint` passes with 0 warnings
- [ ] CHK-077 [Constitution] `bun test` passes with 0 failures
- [ ] CHK-078 [Constitution] Commits use Conventional Commits format (feat:, test:)

## Performance & UX

- [ ] CHK-079 [Spec] Page load time <3 seconds with new shell components
- [ ] CHK-080 [Spec] No layout shift when auth state changes
- [ ] CHK-081 [US-007] Active link indication updates without page flash
- [ ] CHK-082 [Edge Case] Navigation links work with JavaScript disabled (basic anchor tags)
- [ ] CHK-083 [Edge Case] Mobile menu has smooth open/close transition

## Notes

- Check items off as completed: `[x]`
- Items tagged `[Gap]` identify potential improvements not in original spec
- Items tagged `[Edge Case]` identify potential edge cases to handle
- Items tagged `[Constitution]` ensure project governance compliance
- Items tagged `[Spec]` reference original specification requirements

## Summary

| Category | Items | Constitution | Gaps/Edge Cases |
|----------|-------|--------------|-----------------|
| Navigation Config | 6 | 0 | 1 |
| NavLink Component | 7 | 0 | 1 |
| Header Component | 11 | 1 | 0 |
| Mobile Menu | 13 | 0 | 1 |
| Footer Component | 7 | 1 | 1 |
| Placeholder Pages | 11 | 1 | 0 |
| Layout Integration | 7 | 0 | 0 |
| Accessibility | 7 | 0 | 2 |
| Testing & Quality | 9 | 9 | 0 |
| Performance & UX | 5 | 0 | 2 |

**Total Items**: 83
**Constitution Compliance**: 12 items
**Gaps/Edge Cases**: 8 items
