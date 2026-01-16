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

  // Projects - completed work showcase with rich media support
  projects: defineTable({
    // Required fields
    title: v.string(),
    slug: v.string(), // URL-friendly identifier
    description: v.string(), // Short description
    authorId: v.id("profiles"), // Author profile reference
    isPublished: v.boolean(), // Draft/published state

    // Optional fields
    heroImageUrl: v.optional(v.string()), // Hero image URL
    heroVideoUrl: v.optional(v.string()), // Hero video URL
    caseStudy: v.optional(v.string()), // Rich text case study
    demoUrl: v.optional(v.string()), // Live demo link
    repoUrl: v.optional(v.string()), // Repository link
    youtubeEmbeds: v.optional(v.array(v.string())), // YouTube video IDs
    tags: v.optional(v.array(v.id("tags"))), // Category tags
    isFeatured: v.optional(v.boolean()), // Homepage feature flag
  })
    .index("by_slug", ["slug"]) // URL routing
    .index("by_authorId", ["authorId"]) // Author's projects
    .index("by_isPublished", ["isPublished"]) // Public projects only
    .index("by_isFeatured", ["isFeatured"]), // Featured projects

  // Experiments - in-progress work with status tracking
  experiments: defineTable({
    // Required fields
    title: v.string(),
    slug: v.string(), // URL-friendly identifier
    description: v.string(), // Short description
    authorId: v.id("profiles"), // Author profile reference
    isPublished: v.boolean(), // Draft/published state
    status: v.union(
      v.literal("exploring"), // Initial exploration phase
      v.literal("prototyping"), // Building prototypes
      v.literal("paused"), // Work temporarily paused
      v.literal("concluded") // Experiment completed
    ),

    // Optional fields
    heroImageUrl: v.optional(v.string()), // Hero image URL
    heroVideoUrl: v.optional(v.string()), // Hero video URL
    learningLog: v.optional(v.string()), // Progress updates and learnings
    figuringOut: v.optional(v.string()), // Current challenges being worked on
    demoUrl: v.optional(v.string()), // Live demo link
    repoUrl: v.optional(v.string()), // Repository link
    youtubeEmbeds: v.optional(v.array(v.string())), // YouTube video IDs
    tags: v.optional(v.array(v.id("tags"))), // Category tags
    isFeatured: v.optional(v.boolean()), // Homepage feature flag
  })
    .index("by_slug", ["slug"]) // URL routing
    .index("by_authorId", ["authorId"]) // Author's experiments
    .index("by_status", ["status"]) // Filter by experiment status
    .index("by_isPublished", ["isPublished"]), // Public experiments only

  // Articles - blog content synced from Substack
  articles: defineTable({
    // Required fields
    title: v.string(),
    slug: v.string(), // URL-friendly identifier
    content: v.string(), // Full article content (Markdown/HTML)
    authorId: v.id("profiles"), // Author profile reference
    publishedAt: v.number(), // Publication timestamp (Unix ms)

    // Optional fields
    excerpt: v.optional(v.string()), // Short preview text
    tags: v.optional(v.array(v.id("tags"))), // Category tags
    substackUrl: v.optional(v.string()), // Link back to Substack
    isFeatured: v.optional(v.boolean()), // Homepage feature flag
  })
    .index("by_slug", ["slug"]) // URL routing
    .index("by_authorId", ["authorId"]) // Author's articles
    .index("by_publishedAt", ["publishedAt"]) // Chronological listing
    .index("by_isFeatured_and_publishedAt", ["isFeatured", "publishedAt"]), // Featured articles sorted by date

  // Playlists - video series groupings
  playlists: defineTable({
    // Required fields
    title: v.string(),
    slug: v.string(), // URL-friendly identifier

    // Optional fields
    description: v.optional(v.string()),
    displayOrder: v.optional(v.number()), // Sort order for display
  }).index("by_slug", ["slug"]), // URL routing

  // Videos - YouTube-hosted educational content
  videos: defineTable({
    // Required fields
    title: v.string(),
    slug: v.string(), // URL-friendly identifier
    youtubeId: v.string(), // YouTube video ID
    authorId: v.id("profiles"), // Author profile reference
    isPublished: v.boolean(), // Draft/published state

    // Optional fields
    description: v.optional(v.string()), // Video description
    playlistId: v.optional(v.id("playlists")), // Playlist grouping
    duration: v.optional(v.number()), // Duration in seconds
    tags: v.optional(v.array(v.id("tags"))), // Category tags
    isFeatured: v.optional(v.boolean()), // Homepage feature flag
  })
    .index("by_slug", ["slug"]) // URL routing
    .index("by_authorId", ["authorId"]) // Author's videos
    .index("by_playlistId", ["playlistId"]) // Videos in playlist
    .index("by_isPublished", ["isPublished"]) // Public videos only
    .index("by_isFeatured", ["isFeatured"]), // Featured videos

  // Testimonials - social proof quotes from past event attendees
  testimonials: defineTable({
    // Required fields
    quote: v.string(), // Testimonial text
    authorName: v.string(), // Person's name

    // Optional fields
    authorRole: v.optional(v.string()), // Job title
    authorCompany: v.optional(v.string()), // Company name
    authorPhotoUrl: v.optional(v.string()), // Photo URL
    eventId: v.optional(v.id("events")), // Associated event (optional)
    displayOrder: v.optional(v.number()), // Sort order for display
    isFeatured: v.optional(v.boolean()), // Homepage feature flag
  })
    .index("by_eventId", ["eventId"]) // Event-specific testimonials
    .index("by_isFeatured", ["isFeatured"]) // Featured testimonials
    .index("by_displayOrder", ["displayOrder"]), // Ordered display
});
