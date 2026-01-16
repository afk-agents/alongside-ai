import { v } from "convex/values";
import { query, QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import { auth } from "./auth";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Role type for type-safe role checking.
 */
export type Role = "admin" | "member" | "guest";

/**
 * Authentication error thrown when user is not authenticated.
 */
export class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization error thrown when user doesn't have required role.
 */
export class AuthorizationError extends Error {
  constructor(message = "Insufficient permissions") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Helper function to require authentication in Convex functions.
 * Throws AuthenticationError if user is not authenticated.
 *
 * @param ctx - Convex query, mutation, or action context
 * @returns The authenticated user's ID
 * @throws AuthenticationError if not authenticated
 *
 * @example
 * ```typescript
 * export const myMutation = mutation({
 *   args: {},
 *   returns: v.null(),
 *   handler: async (ctx) => {
 *     const userId = await requireAuth(ctx);
 *     // User is authenticated, proceed with logic
 *   },
 * });
 * ```
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx | ActionCtx
): Promise<Id<"users">> {
  const userId = await auth.getUserId(ctx);
  if (!userId) {
    throw new AuthenticationError();
  }
  return userId;
}

/**
 * Helper function to require specific role(s) in Convex functions.
 * Throws AuthenticationError if not authenticated.
 * Throws AuthorizationError if user doesn't have any of the required roles.
 *
 * @param ctx - Convex query or mutation context
 * @param allowedRoles - Array of roles that are allowed access
 * @returns Object with userId and profile
 * @throws AuthenticationError if not authenticated
 * @throws AuthorizationError if user doesn't have required role
 *
 * @example
 * ```typescript
 * export const adminOnlyMutation = mutation({
 *   args: {},
 *   returns: v.null(),
 *   handler: async (ctx) => {
 *     const { userId, profile } = await requireRole(ctx, ["admin"]);
 *     // User is an admin, proceed with logic
 *   },
 * });
 *
 * export const memberOrAdminQuery = query({
 *   args: {},
 *   returns: v.null(),
 *   handler: async (ctx) => {
 *     const { userId, profile } = await requireRole(ctx, ["admin", "member"]);
 *     // User is admin or member, proceed with logic
 *   },
 * });
 * ```
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: Role[]
): Promise<{ userId: Id<"users">; profile: Doc<"profiles"> }> {
  const userId = await requireAuth(ctx);

  // Get profile using the by_userId index
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();

  if (!profile) {
    throw new AuthorizationError("Profile not found");
  }

  if (!allowedRoles.includes(profile.role)) {
    throw new AuthorizationError(
      `Required role: ${allowedRoles.join(" or ")}. Current role: ${profile.role}`
    );
  }

  return { userId, profile };
}

/**
 * Get the currently authenticated user with their profile.
 * Returns null if not authenticated.
 */
export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      email: v.optional(v.string()),
      profile: v.union(
        v.object({
          _id: v.id("profiles"),
          _creationTime: v.number(),
          userId: v.id("users"),
          role: v.union(
            v.literal("admin"),
            v.literal("member"),
            v.literal("guest")
          ),
          profileStatus: v.union(
            v.literal("locked"),
            v.literal("unlocked"),
            v.literal("published")
          ),
          displayName: v.optional(v.string()),
          bio: v.optional(v.string()),
          photoUrl: v.optional(v.string()),
          socialLinks: v.optional(
            v.object({
              linkedin: v.optional(v.string()),
              twitter: v.optional(v.string()),
              github: v.optional(v.string()),
              website: v.optional(v.string()),
            })
          ),
          workingOnNow: v.optional(v.string()),
          skills: v.optional(v.array(v.string())),
          location: v.optional(v.string()),
        }),
        v.null()
      ),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    // Get profile using the by_userId index
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    return {
      _id: user._id,
      email: user.email,
      profile,
    };
  },
});

/**
 * Get the current user's profile only.
 * Returns null if not authenticated or no profile exists.
 */
export const getCurrentUserProfile = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      userId: v.id("users"),
      role: v.union(
        v.literal("admin"),
        v.literal("member"),
        v.literal("guest")
      ),
      profileStatus: v.union(
        v.literal("locked"),
        v.literal("unlocked"),
        v.literal("published")
      ),
      displayName: v.optional(v.string()),
      bio: v.optional(v.string()),
      photoUrl: v.optional(v.string()),
      socialLinks: v.optional(
        v.object({
          linkedin: v.optional(v.string()),
          twitter: v.optional(v.string()),
          github: v.optional(v.string()),
          website: v.optional(v.string()),
        })
      ),
      workingOnNow: v.optional(v.string()),
      skills: v.optional(v.array(v.string())),
      location: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get profile using the by_userId index
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    return profile;
  },
});
