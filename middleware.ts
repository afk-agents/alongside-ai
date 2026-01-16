import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

/**
 * Next.js middleware for Convex Auth integration.
 *
 * Configures:
 * - Session cookie persistence (30 days) for browser restart persistence
 * - HTTP-only cookies (handled by @convex-dev/auth by default)
 *
 * Route protection (US-005) will be added in a future story.
 */
export default convexAuthNextjsMiddleware(
  // Handler for route protection - to be implemented in US-005
  () => {
    // No route protection yet - all routes are public
    // US-005 will add authentication checks here
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
