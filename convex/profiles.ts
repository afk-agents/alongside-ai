import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Profile return type validator for public queries.
 * Includes all fields that can be publicly exposed.
 */
const publicProfileValidator = v.object({
  _id: v.id("profiles"),
  _creationTime: v.number(),
  userId: v.id("users"),
  role: v.union(v.literal("admin"), v.literal("member"), v.literal("guest")),
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
  slug: v.optional(v.string()),
  photoStorageId: v.optional(v.id("_storage")),
});

/**
 * Get all published founder profiles (admin role with published status).
 *
 * Uses the composite index by_role_and_profileStatus for efficient querying.
 * Returns profiles sorted by creation time (most recent first).
 */
export const getFounders = query({
  args: {},
  returns: v.array(publicProfileValidator),
  handler: async (ctx) => {
    const founders = await ctx.db
      .query("profiles")
      .withIndex("by_role_and_profileStatus", (q) =>
        q.eq("role", "admin").eq("profileStatus", "published")
      )
      .collect();

    // Sort by creation time descending (most recent first)
    return founders.sort((a, b) => b._creationTime - a._creationTime);
  },
});

/**
 * Get a profile by its URL slug.
 *
 * Uses the by_slug index for efficient lookup.
 * Returns null if the profile doesn't exist or is not published.
 */
export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(publicProfileValidator, v.null()),
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    // Return null for non-existent or non-published profiles
    if (!profile || profile.profileStatus !== "published") {
      return null;
    }

    return profile;
  },
});
