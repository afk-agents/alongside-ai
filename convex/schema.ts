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

  // Unified taxonomy for cross-content discovery
  tags: defineTable({
    // Required fields
    name: v.string(), // Display name (e.g., "LangChain")
    slug: v.string(), // URL-friendly identifier

    // Optional fields
    description: v.optional(v.string()),
  })
    .index("by_slug", ["slug"]) // URL routing, tag pages
    .index("by_name", ["name"]), // Lookup by name

  // Events - primary revenue driver for educational events
  events: defineTable({
    // Required fields
    title: v.string(),
    slug: v.string(), // URL-friendly identifier
    description: v.string(), // Rich text description
    date: v.number(), // Start timestamp (Unix ms)
    timezone: v.string(), // IANA timezone (e.g., "America/New_York")
    location: v.string(), // Physical address or "Virtual"
    isVirtual: v.boolean(), // Virtual vs in-person flag
    priceInCents: v.number(), // Price in cents (0 for free)

    // Optional fields
    endDate: v.optional(v.number()), // End timestamp for multi-day events
    agenda: v.optional(v.string()), // Event schedule/agenda
    capacity: v.optional(v.number()), // Maximum attendees
    speakerIds: v.optional(v.array(v.id("profiles"))), // Speaker profile references
    tags: v.optional(v.array(v.id("tags"))), // Category tags
    isFeatured: v.optional(v.boolean()), // Homepage feature flag
    isArchived: v.optional(v.boolean()), // Soft archive for past events
  })
    .index("by_slug", ["slug"]) // URL routing
    .index("by_date", ["date"]) // Chronological listing, upcoming vs past
    .index("by_isFeatured_and_date", ["isFeatured", "date"]), // Featured events sorted by date
});
