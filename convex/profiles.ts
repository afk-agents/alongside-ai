import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireRole } from "./users";

/**
 * Profile list item validator for admin list view.
 * Includes minimal fields needed for table display.
 */
const profileListItemValidator = v.object({
  _id: v.id("profiles"),
  displayName: v.optional(v.string()),
  role: v.union(v.literal("admin"), v.literal("member"), v.literal("guest")),
  profileStatus: v.union(
    v.literal("locked"),
    v.literal("unlocked"),
    v.literal("published")
  ),
  slug: v.optional(v.string()),
});

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

/**
 * List all profiles (admin only).
 *
 * Returns all profiles with minimal fields for table display.
 * Sorted by creation time descending (most recent first).
 */
export const list = query({
  args: {},
  returns: v.array(profileListItemValidator),
  handler: async (ctx) => {
    // Require admin role
    await requireRole(ctx, ["admin"]);

    const profiles = await ctx.db.query("profiles").collect();

    // Sort by creation time descending (most recent first)
    return profiles
      .sort((a, b) => b._creationTime - a._creationTime)
      .map((p) => ({
        _id: p._id,
        displayName: p.displayName,
        role: p.role,
        profileStatus: p.profileStatus,
        slug: p.slug,
      }));
  },
});

/**
 * Validate slug format.
 * Slugs must be 2-50 lowercase alphanumeric characters with single hyphens between words.
 */
function validateSlug(slug: string): boolean {
  if (!slug) return false;
  if (slug.length < 2 || slug.length > 50) return false;
  const validPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return validPattern.test(slug);
}

/**
 * Check if a slug already exists, excluding a specific profile.
 */
async function slugExistsExcluding(
  ctx: { db: { query: (table: "profiles") => unknown } },
  slug: string,
  excludeProfileId: string
): Promise<boolean> {
  const existing = await (ctx.db as import("./_generated/server").QueryCtx["db"])
    .query("profiles")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();

  return existing !== null && existing._id !== excludeProfileId;
}

/**
 * Update a profile (admin only).
 *
 * Requires admin role. Accepts optional fields and only updates provided fields.
 * Validates slug format and checks for uniqueness.
 */
export const update = mutation({
  args: {
    id: v.id("profiles"),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    slug: v.optional(v.string()),
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
    profileStatus: v.optional(
      v.union(
        v.literal("locked"),
        v.literal("unlocked"),
        v.literal("published")
      )
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Require admin role
    await requireRole(ctx, ["admin"]);

    // Verify profile exists
    const profile = await ctx.db.get(args.id);
    if (!profile) {
      throw new Error("Profile not found");
    }

    // Validate slug if provided
    if (args.slug !== undefined) {
      if (!validateSlug(args.slug)) {
        throw new Error(
          `Invalid slug format: "${args.slug}". Slugs must be 2-50 lowercase alphanumeric characters with single hyphens between words.`
        );
      }

      // Check slug uniqueness (excluding current profile)
      if (await slugExistsExcluding(ctx, args.slug, args.id)) {
        throw new Error(
          `Slug "${args.slug}" is already in use. Please choose a different slug.`
        );
      }
    }

    // Build patch object with only provided fields
    const patch: Record<string, unknown> = {};
    if (args.displayName !== undefined) patch.displayName = args.displayName;
    if (args.bio !== undefined) patch.bio = args.bio;
    if (args.slug !== undefined) patch.slug = args.slug;
    if (args.socialLinks !== undefined) patch.socialLinks = args.socialLinks;
    if (args.workingOnNow !== undefined) patch.workingOnNow = args.workingOnNow;
    if (args.skills !== undefined) patch.skills = args.skills;
    if (args.location !== undefined) patch.location = args.location;
    if (args.profileStatus !== undefined)
      patch.profileStatus = args.profileStatus;

    // Apply the patch
    await ctx.db.patch(args.id, patch);

    return null;
  },
});

/**
 * Generate a signed upload URL for profile photos (admin only).
 *
 * Requires admin role. Returns a short-lived URL that can be used to
 * upload a file directly to Convex storage.
 */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    // Require admin role
    await requireRole(ctx, ["admin"]);

    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get a URL for a stored photo by its storage ID.
 *
 * Returns the URL if the file exists, or null if it doesn't.
 */
export const getPhotoUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Content item validator for authored content response.
 */
const contentItemValidator = v.object({
  title: v.string(),
  slug: v.string(),
  type: v.union(
    v.literal("project"),
    v.literal("experiment"),
    v.literal("article"),
    v.literal("video")
  ),
});

/**
 * Authored content response validator.
 */
const authoredContentValidator = v.object({
  projects: v.array(contentItemValidator),
  experiments: v.array(contentItemValidator),
  articles: v.array(contentItemValidator),
  videos: v.array(contentItemValidator),
});

/**
 * Get all published content authored by a profile.
 *
 * Returns grouped content (projects, experiments, articles, videos)
 * with minimal fields for display. Only returns published content.
 */
export const getAuthoredContent = query({
  args: { profileId: v.id("profiles") },
  returns: authoredContentValidator,
  handler: async (ctx, args) => {
    // Query published projects by author
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_authorId", (q) => q.eq("authorId", args.profileId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    // Query published experiments by author
    const experiments = await ctx.db
      .query("experiments")
      .withIndex("by_authorId", (q) => q.eq("authorId", args.profileId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    // Query articles by author (articles don't have isPublished - publishedAt implies published)
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_authorId", (q) => q.eq("authorId", args.profileId))
      .collect();

    // Query published videos by author
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_authorId", (q) => q.eq("authorId", args.profileId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    return {
      projects: projects.map((p) => ({
        title: p.title,
        slug: p.slug,
        type: "project" as const,
      })),
      experiments: experiments.map((e) => ({
        title: e.title,
        slug: e.slug,
        type: "experiment" as const,
      })),
      articles: articles.map((a) => ({
        title: a.title,
        slug: a.slug,
        type: "article" as const,
      })),
      videos: videos.map((v) => ({
        title: v.title,
        slug: v.slug,
        type: "video" as const,
      })),
    };
  },
});
