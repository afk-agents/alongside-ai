# Feature Specification: Authentication System

**Feature Branch**: `002-authentication-system`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "F02: Authentication system (email/password)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New User Registration (Priority: P1)

A visitor to the site wants to create an account to access member features. They navigate to the sign-up page, enter their email and password, and receive confirmation that their account was created.

**Why this priority**: Registration is the foundational authentication flow. Without it, no other auth features work. This is the entry point for all user accounts.

**Independent Test**: Can be fully tested by navigating to /signup, entering valid credentials, and verifying the user is logged in and can access authenticated routes.

**Acceptance Scenarios**:

1. **Given** a visitor on the signup page, **When** they enter a valid email and password (min 8 characters), **Then** an account is created, they are automatically logged in, and redirected to the homepage.
2. **Given** a visitor on the signup page, **When** they enter an email that already exists, **Then** they see an error message "An account with this email already exists" and are offered a link to sign in.
3. **Given** a visitor on the signup page, **When** they enter a password shorter than 8 characters, **Then** they see a validation error "Password must be at least 8 characters".
4. **Given** a visitor on the signup page, **When** they enter an invalid email format, **Then** they see a validation error "Please enter a valid email address".

---

### User Story 2 - User Login (Priority: P1)

An existing user wants to sign in to their account. They enter their email and password on the login page and gain access to authenticated features.

**Why this priority**: Login is equally critical as registration - users must be able to return to their accounts. Co-priority with registration as they are both essential.

**Independent Test**: Can be fully tested by having a registered user navigate to /login, entering correct credentials, and verifying they are authenticated.

**Acceptance Scenarios**:

1. **Given** a registered user on the login page, **When** they enter correct email and password, **Then** they are logged in and redirected to the homepage (or previous page if applicable).
2. **Given** a user on the login page, **When** they enter an incorrect password, **Then** they see an error message "Invalid email or password" (generic for security).
3. **Given** a user on the login page, **When** they enter a non-existent email, **Then** they see the same error message "Invalid email or password" (to prevent email enumeration).
4. **Given** a logged-in user, **When** they navigate to /login, **Then** they are redirected to the homepage.

---

### User Story 3 - User Logout (Priority: P2)

A logged-in user wants to sign out of their account. They click a logout button and their session is terminated.

**Why this priority**: Logout is important for security and shared devices, but slightly lower priority than login/signup as users can simply close the browser.

**Independent Test**: Can be fully tested by logging in as a user, clicking logout, and verifying the session is terminated and authenticated routes are no longer accessible.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they click the logout button, **Then** their session is terminated and they are redirected to the homepage.
2. **Given** a logged-out user, **When** they attempt to access an authenticated route, **Then** they are redirected to the login page.

---

### User Story 4 - Session Persistence (Priority: P2)

A logged-in user closes their browser and returns later. Their session should persist so they don't need to log in again.

**Why this priority**: Good UX requires session persistence, but it's not critical for MVP functionality.

**Independent Test**: Can be tested by logging in, closing the browser tab, reopening the site, and verifying the user is still authenticated.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they close and reopen the browser, **Then** they remain logged in (session persists).
2. **Given** a logged-in user, **When** their session token expires (after configured period), **Then** they are logged out and must re-authenticate.

---

### User Story 5 - Auto-Create Account on Event Purchase (Priority: P3)

A guest purchases an event ticket without an existing account. The system automatically creates an account using their provided email and sends them credentials.

**Why this priority**: This is a specialized flow tied to F11 (Event Registration). The core auth system should work first before this integration.

**Independent Test**: Can be tested by completing a mock checkout flow with a new email and verifying an account is created.

**Acceptance Scenarios**:

1. **Given** a guest completing event checkout with email that has no account, **When** payment succeeds, **Then** an account is created with that email and a secure random password is generated.
2. **Given** an existing user completing event checkout, **When** they provide their registered email, **Then** no new account is created; the purchase is associated with their existing account.
3. **Given** a new account created via purchase, **When** the user tries to log in, **Then** they must use the password reset flow to set their password (or receive credentials via email).

---

### User Story 6 - Role-Based Access Control (Priority: P2)

The system enforces role-based permissions. Admins can access admin routes, members can access member routes, and guests have read-only access.

**Why this priority**: RBAC is critical for admin functionality but requires the basic auth to work first.

**Independent Test**: Can be tested by logging in as users with different roles and verifying access to protected routes.

**Acceptance Scenarios**:

1. **Given** a user with role "admin", **When** they access /admin routes, **Then** they are granted access.
2. **Given** a user with role "member", **When** they access /admin routes, **Then** they are denied access and see a 403 error.
3. **Given** a user with role "guest", **When** they access member-only routes, **Then** they are denied access.
4. **Given** an unauthenticated visitor, **When** they access any protected route, **Then** they are redirected to /login.

---

### Edge Cases

- What happens when a user tries to register with a disposable email domain? **Assumption**: Accept all valid email formats; spam filtering is out of scope for MVP.
- How does the system handle concurrent sessions from multiple devices? **Assumption**: Allow multiple concurrent sessions using Convex's built-in session management.
- What happens if the Convex backend is unavailable during login? **Assumption**: Display a generic error "Unable to sign in. Please try again later."
- What happens when a user's email changes? **Assumption**: Email changes are out of scope for MVP; users keep their original email.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register with email and password
- **FR-002**: System MUST validate email format on registration and login forms
- **FR-003**: System MUST enforce minimum password length of 8 characters
- **FR-004**: System MUST hash passwords securely (handled by @convex-dev/auth)
- **FR-005**: System MUST authenticate users via email/password and establish a session
- **FR-006**: System MUST allow users to log out and terminate their session
- **FR-007**: System MUST persist sessions across browser closes (cookie-based)
- **FR-008**: System MUST prevent duplicate account registration with same email
- **FR-009**: System MUST provide generic error messages that don't reveal whether an email exists (security)
- **FR-010**: System MUST redirect unauthenticated users to login when accessing protected routes
- **FR-011**: System MUST redirect authenticated users away from login/signup pages
- **FR-012**: System MUST enforce role-based access control for admin, member, and guest roles
- **FR-013**: System MUST create a profile record when a new user registers (linked to profiles table)
- **FR-014**: System MUST provide an API for other features to check authentication status and user role

### Key Entities

- **User (auth)**: Core authentication record managed by @convex-dev/auth. Contains email, hashed password, session tokens. System table.
- **Profile**: Extended user data linked via `userId` foreign key. Contains `role` (admin/member/guest), `profileStatus`, and optional profile fields. Defined in F01 schema.
- **Session**: Managed by @convex-dev/auth. Tracks active user sessions with expiration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete registration flow in under 30 seconds
- **SC-002**: Users can complete login flow in under 15 seconds
- **SC-003**: 100% of authenticated routes correctly enforce authentication
- **SC-004**: 100% of admin routes correctly enforce admin role requirement
- **SC-005**: Zero password-related security vulnerabilities (passwords properly hashed, not logged)
- **SC-006**: Session persistence works across browser restarts
- **SC-007**: All auth-related Convex functions have proper args and returns validators

## Assumptions

1. **Password Provider Only**: Using @convex-dev/auth Password provider only. OAuth/social login is out of scope for MVP.
2. **No Email Verification**: Email verification on registration is out of scope for MVP. Users can log in immediately after registration.
3. **No Password Reset**: Password reset/forgot password flow is out of scope for MVP. Will be added in a future feature.
4. **Default Role**: New registrations default to "guest" role. Admin manually upgrades to "member" after event attendance.
5. **Profile Auto-Creation**: A profile record is automatically created when a user registers, with role="guest" and profileStatus="locked".
6. **Session Duration**: Using @convex-dev/auth default session duration. Custom expiration is out of scope.
7. **Single Factor**: No MFA/2FA for MVP. Email/password only.
8. **Client-Side Validation**: Form validation happens client-side for UX; server-side validation is authoritative.
