import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

/**
 * Route matchers for different access levels.
 *
 * Protected routes require authentication.
 * Admin routes require admin role (checked in Convex functions).
 * Member routes require member or admin role (checked in Convex functions).
 * Auth pages should redirect authenticated users away.
 */
const isAuthPage = createRouteMatcher(["/login", "/signup"]);
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)",
  "/settings(.*)",
]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isMemberRoute = createRouteMatcher(["/members(.*)"]);

/**
 * Next.js middleware for Convex Auth integration.
 *
 * Configures:
 * - Session cookie persistence (30 days) for browser restart persistence
 * - HTTP-only cookies (handled by @convex-dev/auth by default)
 * - Route protection: redirects unauthenticated users to /login
 * - Auth page protection: redirects authenticated users to /
 *
 * Note: Role-based access control (admin/member routes) is enforced
 * server-side in Convex functions using requireRole helper.
 * Middleware only checks authentication status, not roles.
 */
export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const isAuthenticated = await convexAuth.isAuthenticated();

    // Redirect authenticated users away from auth pages
    if (isAuthPage(request) && isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/");
    }

    // Redirect unauthenticated users to login for protected routes
    if (isProtectedRoute(request) && !isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/login");
    }

    // Admin routes require authentication (role checked server-side)
    if (isAdminRoute(request) && !isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/login");
    }

    // Member routes require authentication (role checked server-side)
    if (isMemberRoute(request) && !isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/login");
    }
  },
  {
    // Configure cookie persistence for 30 days (matches default session duration)
    // Without maxAge, the cookie is a session cookie that clears when browser closes
    cookieConfig: {
      maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
    },
  }
);

export const config = {
  // Run middleware on all routes except static files and Next.js internals
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
