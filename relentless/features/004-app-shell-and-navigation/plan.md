# Implementation Plan: App Shell and Navigation

**Branch**: `004-app-shell-and-navigation` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)

## Summary

Build the foundational navigation system for Alongside AI: a responsive header with primary navigation (Home, Events, Lab, Learn, Blog, About), secondary navigation (Search, Auth), mobile hamburger menu, and footer with utility/social links. Uses Next.js App Router layout system with Tailwind CSS for responsive styling. No backend changes required—this is a frontend-only feature.

## Technical Context

**Language/Version**: TypeScript 5.x with React 19
**Primary Dependencies**: Next.js 16 (App Router), Tailwind CSS 4, `next/link`, `next/navigation`
**Storage**: N/A (no database changes)
**Testing**: Vitest + React Testing Library
**Target Platform**: Web (desktop and mobile browsers)
**Project Type**: Web application (Next.js)
**Performance Goals**: Page load <3s, no layout shift on auth state change
**Constraints**: Mobile-first responsive design, keyboard accessible, works without JS for links
**Scale/Scope**: 10 placeholder pages, 3 navigation components, 1 layout update

## Constitution Check

| Rule | Status | Notes |
|------|--------|-------|
| TypeScript strict mode, 0 errors | ✅ Will comply | All components typed |
| All Convex functions have args/returns | N/A | No Convex changes |
| Write tests before implementation (TDD) | ✅ Will comply | Tests first for each component |
| `bun run lint` with 0 warnings | ✅ Will comply | Run before each commit |
| Follow Next.js App Router conventions | ✅ Will comply | Using `app/` directory, server components default |
| Use `"use client"` only when necessary | ✅ Will comply | Only for interactive components |
| Conventional Commits format | ✅ Will comply | feat:, test:, etc. |

## Project Structure

### Documentation (this feature)

```text
relentless/features/004-app-shell-and-navigation/
├── spec.md              # Feature specification
├── plan.md              # This file
├── tasks.md             # Task breakdown (next step)
├── progress.txt         # Progress tracking
└── checklist.md         # Quality checklist (optional)
```

### Source Code Changes

```text
# New Components
components/
├── layout/
│   ├── Header.tsx           # Main header with nav (client component)
│   ├── Footer.tsx           # Site footer (server component)
│   ├── MobileMenu.tsx       # Hamburger menu panel (client component)
│   └── NavLink.tsx          # Active-aware link (client component)

# Updated Files
app/
├── layout.tsx               # Update to use new Header/Footer

# New Placeholder Pages
app/
├── events/page.tsx          # "Events - Coming Soon"
├── lab/page.tsx             # "The Lab - Coming Soon"
├── learn/page.tsx           # "Learn - Coming Soon"
├── blog/page.tsx            # "Blog - Coming Soon"
├── about/page.tsx           # "About - Coming Soon"
├── search/page.tsx          # "Search - Coming Soon"
├── contact/page.tsx         # "Contact - Coming Soon"
├── privacy/page.tsx         # "Privacy Policy - Coming Soon"
├── terms/page.tsx           # "Terms of Service - Coming Soon"
└── faq/page.tsx             # "FAQ - Coming Soon"

# Tests
__tests__/
├── components/
│   └── layout/
│       ├── Header.test.tsx
│       ├── Footer.test.tsx
│       ├── MobileMenu.test.tsx
│       └── NavLink.test.tsx
```

## Component Design

### Navigation Configuration

Define navigation structure as typed constants for reuse:

```typescript
// lib/navigation.ts
export const PRIMARY_NAV = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Lab", href: "/lab" },
  { label: "Learn", href: "/learn" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
] as const;

export const FOOTER_NAV = [
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "FAQ", href: "/faq" },
] as const;

export const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://linkedin.com/company/alongside-ai", external: true },
  { label: "Substack", href: "https://alongsideai.substack.com", external: true },
] as const;
```

### Header Component

```typescript
// components/layout/Header.tsx
"use client";

import Link from "next/link";
import { NavLink } from "./NavLink";
import { MobileMenu } from "./MobileMenu";
import { AuthNav } from "@/components/auth/AuthNav";
import { PRIMARY_NAV } from "@/lib/navigation";

export function Header() {
  // State for mobile menu open/closed
  // Render: logo, desktop nav, search icon, auth, hamburger (mobile only)
}
```

**Client Component**: Required for mobile menu state and click handlers.

### NavLink Component

```typescript
// components/layout/NavLink.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
}

export function NavLink({ href, children, className, activeClassName }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  // Apply activeClassName when route matches
}
```

**Client Component**: Uses `usePathname` hook for active state detection.

### MobileMenu Component

```typescript
// components/layout/MobileMenu.tsx
"use client";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Handle Escape key to close
  // Handle click outside to close
  // Render overlay + slide-in panel with nav links + auth
}
```

**Client Component**: Required for event handlers and state management.

### Footer Component

```typescript
// components/layout/Footer.tsx
import Link from "next/link";
import { FOOTER_NAV, SOCIAL_LINKS } from "@/lib/navigation";

export function Footer() {
  // Server component - no interactivity needed
  // Render utility links + social links
}
```

**Server Component**: Static content, no interactivity.

### Layout Update

Update `app/layout.tsx` to include Header and Footer:

```typescript
// app/layout.tsx
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ConvexAuthNextjsServerProvider>
          <ConvexClientProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
```

## Styling Strategy

### Responsive Breakpoints

- **Mobile**: <768px - Hamburger menu, no horizontal nav
- **Tablet/Desktop**: ≥768px - Horizontal nav, no hamburger

### Tailwind Classes Pattern

```tsx
// Desktop nav - hidden on mobile, flex on md+
<nav className="hidden md:flex items-center gap-6">

// Hamburger button - visible on mobile, hidden on md+
<button className="md:hidden">

// Mobile menu overlay
<div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
```

### Active Link Styling

```tsx
// Default state
<NavLink className="text-gray-600 hover:text-gray-900">

// Active state
<NavLink activeClassName="text-gray-900 font-semibold border-b-2 border-gray-900">
```

## Testing Strategy

### Unit Tests (per component)

| Component | Test Cases |
|-----------|------------|
| `NavLink` | Renders correctly, applies active class on current route, no active class on other routes |
| `Header` | Renders logo, desktop nav visible on large viewport, hamburger visible on small viewport |
| `MobileMenu` | Opens/closes correctly, calls onClose when clicking link, handles Escape key |
| `Footer` | Renders all utility links, social links have target="_blank" |

### Integration Tests

| Scenario | Test |
|----------|------|
| Navigation flow | Click link → navigates to correct page |
| Auth integration | AuthNav renders correctly in header |
| Mobile menu | Open menu → click link → menu closes + page navigates |

### Test Setup

Use existing Vitest + RTL setup. Mock `next/navigation` for `usePathname`:

```typescript
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));
```

## Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | All links focusable via Tab, activated via Enter |
| Focus indicators | Tailwind `focus:ring-2 focus:ring-offset-2` |
| Mobile menu | `aria-expanded` on hamburger, `aria-hidden` on menu when closed |
| Skip link | Add "Skip to main content" link (nice-to-have) |
| Semantic HTML | `<header>`, `<nav>`, `<main>`, `<footer>` elements |

## Implementation Phases

### Phase 1: Foundation (P1 Stories)
1. Create `lib/navigation.ts` with nav configuration
2. Create `NavLink` component with active state
3. Create `Header` component with desktop nav
4. Create `MobileMenu` component
5. Update `app/layout.tsx`
6. Create 10 placeholder pages

### Phase 2: Polish (P2-P3 Stories)
7. Create `Footer` component
8. Add search icon to header
9. Integrate AuthNav into mobile menu
10. Style active link indication
11. Add accessibility attributes

### Phase 3: Testing
12. Write unit tests for all components
13. Write integration tests for navigation flows

## Rollout Plan

### Deployment
- Single PR with all changes
- No database migrations required
- No feature flags needed (direct replacement of current nav)

### Monitoring
- Verify all pages load correctly post-deploy
- Check Lighthouse score for performance/accessibility

### Rollback
- Revert PR if issues discovered
- No data changes, clean rollback possible

## Complexity Tracking

No constitution violations. This feature uses standard patterns:
- React components with Tailwind styling
- Next.js App Router conventions
- Existing auth integration
