# Quality Checklist: Authentication System

**Purpose**: Validate completeness of email/password authentication implementation
**Created**: 2026-01-16
**Feature**: [spec.md](./spec.md)

## Backend: Convex Auth Configuration

- [ ] CHK-001 [US1] `convex/auth.ts` uses Password provider from `@convex-dev/auth/providers/Password`
- [ ] CHK-002 [US1] `afterUserCreatedOrUpdated` callback creates profile with role="guest" for new users
- [ ] CHK-003 [US1] `afterUserCreatedOrUpdated` callback creates profile with profileStatus="locked"
- [ ] CHK-004 [US1] Profile creation only occurs for new users (existingUserId check)
- [ ] CHK-005 [Constitution] All Convex functions have `args` and `returns` validators

## Backend: User Queries (convex/users.ts)

- [ ] CHK-006 [US5] `getCurrentUser` query returns user with email and profile
- [ ] CHK-007 [US5] `getCurrentUserProfile` query returns profile with role
- [ ] CHK-008 [US5] Queries return `null` when user is not authenticated
- [ ] CHK-009 [US5] `requireRole` helper checks user role against allowed roles
- [ ] CHK-010 [US5] `withIndex("by_userId")` used for profile lookup (not filter)
- [ ] CHK-011 [Constitution] Return validators match actual return types exactly

## Frontend: Auth Provider

- [x] CHK-012 [US4] `ConvexClientProvider.tsx` uses `ConvexAuthNextjsProvider`
- [x] CHK-013 [US4] Provider correctly initializes `ConvexReactClient`
- [x] CHK-014 [US4] Session persistence works via HTTP-only cookies
- [x] CHK-015 [US2] `useAuthActions` hook available for signIn/signOut

## Frontend: Signup Flow (US1)

- [ ] CHK-016 [US1] `/signup` page renders SignupForm component
- [ ] CHK-017 [US1] Email input validates format before submission
- [ ] CHK-018 [US1] Password input enforces minimum 8 characters
- [ ] CHK-019 [US1] Form calls `signIn("password", formData)` with `flow: "signUp"`
- [ ] CHK-020 [US1] Successful signup redirects to homepage
- [ ] CHK-021 [US1] Duplicate email error displays "An account with this email already exists"
- [ ] CHK-022 [US1] Invalid email error displays "Please enter a valid email address"
- [ ] CHK-023 [US1] Short password error displays "Password must be at least 8 characters"
- [ ] CHK-024 [US1] "Sign in instead" link navigates to /login

## Frontend: Login Flow (US2)

- [x] CHK-025 [US2] `/login` page renders LoginForm component
- [x] CHK-026 [US2] Form calls `signIn("password", formData)` with `flow: "signIn"`
- [x] CHK-027 [US2] Successful login redirects to homepage
- [x] CHK-028 [US2] Invalid credentials show generic "Invalid email or password" (security)
- [x] CHK-029 [US2] Non-existent email shows same "Invalid email or password" (no enumeration)
- [x] CHK-030 [US2] Authenticated users redirected away from /login
- [x] CHK-031 [US2] "Sign up instead" link navigates to /signup

## Frontend: Logout Flow (US3)

- [x] CHK-032 [US3] SignOutButton component calls `signOut()` on click
- [x] CHK-033 [US3] Logout redirects to homepage
- [x] CHK-034 [US3] SignOutButton only visible when user is authenticated
- [x] CHK-035 [US3] Login link visible when user is not authenticated

## Middleware & Route Protection (US5)

- [x] CHK-036 [US5] `middleware.ts` uses `convexAuthNextjsMiddleware`
- [ ] CHK-037 [US5] Protected routes redirect unauthenticated users to /login
- [ ] CHK-038 [US5] Auth pages (/login, /signup) redirect authenticated users to /
- [ ] CHK-039 [US5] Admin routes return 403 for non-admin users
- [ ] CHK-040 [US5] Route matchers correctly identify protected paths

## Session Persistence (US4)

- [x] CHK-041 [US4] Session survives browser close and reopen
- [x] CHK-042 [US4] Expired sessions require re-authentication
- [x] CHK-043 [US4] Session token stored in HTTP-only cookie (not localStorage)

## Security

- [ ] CHK-044 [US1] Passwords never logged or exposed in error messages
- [x] CHK-045 [US2] Generic error messages prevent email enumeration
- [ ] CHK-046 [US5] Role checked server-side in Convex functions (not just middleware)
- [ ] CHK-047 [Constitution] No secrets committed to git
- [ ] CHK-048 [Edge Case] Rate limiting handled by @convex-dev/auth

## Constitution Compliance

- [ ] CHK-049 [Constitution] TypeScript strict mode passes (`bunx tsc --noEmit`)
- [ ] CHK-050 [Constitution] ESLint passes (`bun run lint`) with 0 warnings
- [ ] CHK-051 [Constitution] No `any` types in auth code
- [ ] CHK-052 [Constitution] `"use client"` directive only on components that need it
- [ ] CHK-053 [Constitution] Conventional commit format used for all commits
- [x] CHK-054 [Constitution] Components organized in `components/auth/` directory

## Gaps & Ambiguities

- [ ] CHK-055 [Gap] Password reset flow not implemented (noted as out of scope for MVP)
- [ ] CHK-056 [Gap] Email verification not implemented (noted as out of scope for MVP)
- [ ] CHK-057 [Gap] Account lockout after failed attempts not implemented (consider for future)
- [ ] CHK-058 [Ambiguity] Auto-create account on purchase deferred to F11 - ensure integration point documented
- [ ] CHK-059 [Edge Case] Handle Convex backend unavailable gracefully (generic error message)
- [ ] CHK-060 [Edge Case] Multiple concurrent sessions allowed (Convex default behavior)

## Integration Testing

- [ ] CHK-061 [US1] Full signup flow: form → submit → profile created → redirected
- [ ] CHK-062 [US2] Full login flow: form → submit → authenticated → redirected
- [ ] CHK-063 [US3] Full logout flow: click → session terminated → redirected
- [ ] CHK-064 [US5] Protected route access: unauthenticated → redirect to /login
- [ ] CHK-065 [US5] Admin route access: member user → 403 error

---

## Summary

| Category | Items | User Story Coverage |
|----------|-------|---------------------|
| Backend Auth | 5 | US1, Constitution |
| Backend Queries | 6 | US5, Constitution |
| Frontend Provider | 4 | US2, US4 |
| Signup Flow | 9 | US1 |
| Login Flow | 7 | US2 |
| Logout Flow | 4 | US3 |
| Middleware/RBAC | 5 | US5 |
| Session | 3 | US4 |
| Security | 5 | US1, US2, US5, Constitution |
| Constitution | 6 | Constitution |
| Gaps/Edge Cases | 6 | Gap, Ambiguity, Edge Case |
| Integration Tests | 5 | US1-US5 |

**Total Items**: 65
**User Story Items**: 53 (82%)
**Gap/Ambiguity Items**: 6 (9%)
**Constitution Items**: 6 (9%)
