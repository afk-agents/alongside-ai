import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Extended user profiles with role-based access control
  profiles: defineTable({
    // Foreign key to auth users table
    userId: v.id("users"),

    // Role for authorization: admin has full access, member has limited access, guest is read-only
    role: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("guest")
    ),

    // Profile visibility state
    profileStatus: v.union(
      v.literal("locked"), // Not visible, not editable
      v.literal("unlocked"), // Editable by owner, not publicly visible
      v.literal("published") // Visible in community directory
    ),

    // Optional profile fields
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    photoUrl: v.optional(v.string()),

    // Social links as nested object
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
  })
    .index("by_userId", ["userId"])
    .index("by_role", ["role"])
    .index("by_profileStatus", ["profileStatus"]),
});
