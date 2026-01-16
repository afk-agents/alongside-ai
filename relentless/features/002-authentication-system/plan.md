# Implementation Plan: Authentication System

**Branch**: `002-authentication-system` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)

## Summary

Implement email/password authentication using @convex-dev/auth with the Password provider. This includes signup, login, logout flows, session persistence, auto-creation of profile records on registration, and role-based access control helpers. The frontend uses Next.js App Router with ConvexAuthNextjsProvider.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: @convex-dev/auth, @auth/core, convex, next.js 16, react 19
**Storage**: Convex (authTables + profiles table)
**Testing**: Vitest with @convex-dev/test (Convex function testing)
**Target Platform**: Web (Next.js App Router)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Auth flows complete in <500ms
**Constraints**: No external auth service, all auth handled by Convex
**Scale/Scope**: MVP - email/password only, no OAuth, no email verification

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| Type Safety | ✅ PASS | All Convex functions will have args/returns validators |
| Testing (TDD) | ✅ PASS | Tests written for auth functions |
| Code Quality | ✅ PASS | Will pass lint and typecheck |
| Architecture | ✅ PASS | Follows Next.js App Router conventions |
| Convex Backend | ✅ PASS | Domain-based organization, proper validators |
| Version Control | ✅ PASS | Conventional commits |

## Project Structure

### Source Code

```text
app/
├── (auth)/                    # Auth route group
│   ├── login/
│   │   └── page.tsx          # Login page
│   └── signup/
│       └── page.tsx          # Signup page
├── ConvexClientProvider.tsx   # Updated to ConvexAuthNextjsProvider
└── layout.tsx                 # Root layout

components/
├── auth/
│   ├── LoginForm.tsx         # Login form component
│   ├── SignupForm.tsx        # Signup form component
│   └── SignOutButton.tsx     # Logout button component

convex/
├── auth.ts                   # Existing - add profile callback
├── auth.config.ts            # Existing - unchanged
├── http.ts                   # Existing - unchanged
├── schema.ts                 # Existing - unchanged
└── users.ts                  # New - user/profile queries and helpers

middleware.ts                  # Next.js middleware for route protection
```

## Data Models

### Existing Tables (from authTables)

The `@convex-dev/auth` library provides these tables automatically:
- `users` - Core user records (email, emailVerificationTime)
- `authAccounts` - Authentication provider accounts
- `authSessions` - Active sessions
- `authRefreshTokens` - Refresh tokens
- `authVerificationCodes` - Verification codes (unused for MVP)
- `authRateLimits` - Rate limiting

### Profiles Table (from F01)

```typescript
profiles: defineTable({
  userId: v.id("users"),
  role: v.union(v.literal("admin"), v.literal("member"), v.literal("guest")),
  profileStatus: v.union(v.literal("locked"), v.literal("unlocked"), v.literal("published")),
  displayName: v.optional(v.string()),
  // ... other optional fields
})
  .index("by_userId", ["userId"])
  .index("by_role", ["role"])
  .index("by_profileStatus", ["profileStatus"])
```

## API Contracts

### Convex Functions

#### `users.ts` - User/Profile Functions

```typescript
// Get current user's profile
export const getCurrentUserProfile = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("profiles"),
      userId: v.id("users"),
      role: v.union(v.literal("admin"), v.literal("member"), v.literal("guest")),
      profileStatus: v.union(v.literal("locked"), v.literal("unlocked"), v.literal("published")),
      displayName: v.optional(v.string()),
      // ... other fields
    }),
    v.null()
  ),
  handler: async (ctx) => { /* ... */ }
});

// Get current user with auth info
export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      email: v.optional(v.string()),
      profile: v.union(v.object({ /* profile fields */ }), v.null())
    }),
    v.null()
  ),
  handler: async (ctx) => { /* ... */ }
});
```

#### `auth.ts` - Auth Configuration Updates

```typescript
// Add profile creation callback
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
        };
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
      if (!existingUserId) {
        // New user - create profile with default role
        await ctx.db.insert("profiles", {
          userId,
          role: "guest",
          profileStatus: "locked",
        });
      }
    },
  },
});
```

### Frontend Components

#### Login Flow
1. User navigates to `/login`
2. Enters email and password
3. Calls `signIn("password", formData)` with `flow: "signIn"`
4. On success: redirected to homepage
5. On error: displays "Invalid email or password"

#### Signup Flow
1. User navigates to `/signup`
2. Enters email and password
3. Client-side validation (email format, password length)
4. Calls `signIn("password", formData)` with `flow: "signUp"`
5. On success: profile auto-created, redirected to homepage
6. On error: displays appropriate error message

#### Logout Flow
1. User clicks logout button
2. Calls `signOut()`
3. Session terminated, redirected to homepage

## Implementation Strategy

### Phase 1: Backend Auth Setup
1. Update `convex/auth.ts` with profile creation callback
2. Create `convex/users.ts` with user/profile queries
3. Add role-checking helper functions

### Phase 2: Frontend Provider Setup
4. Update `ConvexClientProvider.tsx` to use `ConvexAuthNextjsProvider`
5. Create `middleware.ts` for route protection

### Phase 3: Auth UI Components
6. Create `components/auth/SignupForm.tsx`
7. Create `components/auth/LoginForm.tsx`
8. Create `components/auth/SignOutButton.tsx`

### Phase 4: Auth Pages
9. Create `app/(auth)/signup/page.tsx`
10. Create `app/(auth)/login/page.tsx`

### Phase 5: Integration & Polish
11. Add auth state display to layout (show login/logout based on state)
12. Implement redirect logic for authenticated users on auth pages

## Testing Strategy

### Unit Tests (Convex Functions)

```typescript
// convex/users.test.ts
describe("getCurrentUserProfile", () => {
  it("returns null when not authenticated", async () => {
    const result = await t.query(api.users.getCurrentUserProfile, {});
    expect(result).toBeNull();
  });

  it("returns profile when authenticated", async () => {
    // Setup: create user and profile
    const result = await t.query(api.users.getCurrentUserProfile, {});
    expect(result).toMatchObject({
      role: "guest",
      profileStatus: "locked",
    });
  });
});
```

### Integration Tests

1. **Registration flow**: Submit signup form → verify user + profile created
2. **Login flow**: Submit login form → verify session established
3. **Logout flow**: Click logout → verify session terminated
4. **Protected routes**: Access protected route unauthenticated → verify redirect

### E2E Test Cases

1. Complete signup → login → logout journey
2. Signup with existing email → error displayed
3. Login with wrong password → error displayed
4. Access /login while authenticated → redirect to home

## Security Considerations

### Authentication
- Passwords hashed by @convex-dev/auth (bcrypt)
- Session tokens stored in HTTP-only cookies
- CSRF protection via SameSite cookie attribute

### Authorization
- Role stored in `profiles` table, not in JWT
- Role checked server-side on each request
- Admin routes protected by middleware + server validation

### Data Validation
- Email format validated client-side and server-side
- Password minimum length enforced (8 characters)
- Generic error messages to prevent enumeration

### Best Practices
- No passwords logged or exposed in errors
- Rate limiting handled by @convex-dev/auth
- HTTPS enforced in production

## Rollout Plan

### Deployment Strategy
1. Deploy backend changes (auth.ts, users.ts)
2. Deploy frontend changes (provider, components, pages)
3. Verify auth flows in staging
4. Deploy to production

### Migration Requirements
- None - new feature, no existing users

### Monitoring
- Monitor Convex function errors
- Track signup/login success rates
- Alert on unusual auth failure patterns

### Rollback Plan
- Revert to previous commit if issues detected
- Auth tables are additive, no data loss on rollback

## File Creation Order

1. `convex/users.ts` - User queries and helpers
2. Update `convex/auth.ts` - Add profile callback
3. Update `app/ConvexClientProvider.tsx` - Switch to auth provider
4. `middleware.ts` - Route protection
5. `components/auth/SignupForm.tsx`
6. `components/auth/LoginForm.tsx`
7. `components/auth/SignOutButton.tsx`
8. `app/(auth)/signup/page.tsx`
9. `app/(auth)/login/page.tsx`

## Dependencies

```json
{
  "@convex-dev/auth": "^0.0.x",
  "@auth/core": "0.37.0"
}
```

Note: These are already installed in the project.
