import { v } from "convex/values";
import { query } from "./_generated/server";
import { auth } from "./auth";

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
