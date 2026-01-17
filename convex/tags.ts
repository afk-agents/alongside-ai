import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { requireRole } from "./users";

/**
 * Generate a URL-friendly slug from a tag name.
 *
 * - Converts to lowercase
 * - Replaces non-alphanumeric characters with hyphens
 * - Removes leading/trailing hyphens
 * - Collapses multiple consecutive hyphens
 * - Truncates to max 50 characters (without ending in hyphen)
 *
 * @param name - The tag name to convert
 * @returns URL-friendly slug
 */
export function generateSlug(name: string): string {
  if (!name) return "";

  let slug = name
    .toLowerCase()
    // Replace any non-alphanumeric character with hyphen
    .replace(/[^a-z0-9]+/g, "-")
    // Remove leading hyphens
    .replace(/^-+/, "")
    // Remove trailing hyphens
    .replace(/-+$/, "");

  // Truncate to 50 chars, ensuring we don't end with a hyphen
  if (slug.length > 50) {
    slug = slug.slice(0, 50);
    // Remove trailing hyphen if truncation created one
    slug = slug.replace(/-+$/, "");
  }

  return slug;
}

/**
 * Validate that a slug is URL-friendly.
 *
 * Valid slugs:
 * - Only lowercase letters, numbers, and hyphens
 * - Between 2-50 characters
 * - No leading or trailing hyphens
 * - No consecutive hyphens
 *
 * @param slug - The slug to validate
 * @returns true if valid, false otherwise
 */
export function validateSlug(slug: string): boolean {
  if (!slug) return false;

  // Length check: 2-50 characters
  if (slug.length < 2 || slug.length > 50) return false;

  // Must match: lowercase alphanumeric, with single hyphens between chars
  // Pattern: starts with alphanumeric, optionally followed by (hyphen + alphanumeric) groups
  const validPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

  return validPattern.test(slug);
}

/**
 * Check if a slug already exists in the database.
 */
async function slugExists(ctx: MutationCtx, slug: string): Promise<boolean> {
  const existing = await ctx.db
    .query("tags")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  return existing !== null;
}

/**
 * Create a new tag (admin only).
 *
 * - Requires admin role
 * - Auto-generates slug from name if not provided
 * - Validates slug format and uniqueness
 * - Returns the new tag ID
 */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.id("tags"),
  handler: async (ctx, args) => {
    // Require admin role
    await requireRole(ctx, ["admin"]);

    // Generate or validate slug
    let slug = args.slug;
    if (!slug) {
      slug = generateSlug(args.name);
    }

    // Validate slug format
    if (!validateSlug(slug)) {
      throw new Error(
        `Invalid slug format: "${slug}". Slugs must be 2-50 lowercase alphanumeric characters with single hyphens between words.`
      );
    }

    // Check for duplicate slug
    if (await slugExists(ctx, slug)) {
      throw new Error(
        `Tag with slug "${slug}" already exists. Please choose a different name or provide a unique slug.`
      );
    }

    // Insert the tag
    const tagId = await ctx.db.insert("tags", {
      name: args.name,
      slug,
      description: args.description,
    });

    return tagId;
  },
});

/**
 * List all tags sorted alphabetically by name (case-insensitive) with content counts.
 *
 * Returns array of tags including:
 * - _id, _creationTime, name, slug, description
 * - contentCount: total published content items across all content types
 *
 * Content is counted as published when:
 * - Events: not archived (isArchived !== true)
 * - Projects: isPublished === true
 * - Experiments: isPublished === true
 * - Articles: always counted (no publish state)
 * - Videos: isPublished === true
 */
export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("tags"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
      contentCount: v.number(),
    })
  ),
  handler: async (ctx) => {
    // Fetch all tags
    const allTags = await ctx.db.query("tags").collect();

    // Fetch all content types in parallel
    const [allEvents, allProjects, allExperiments, allArticles, allVideos] =
      await Promise.all([
        ctx.db.query("events").collect(),
        ctx.db.query("projects").collect(),
        ctx.db.query("experiments").collect(),
        ctx.db.query("articles").collect(),
        ctx.db.query("videos").collect(),
      ]);

    // Build a map of tagId -> content count
    const tagContentCounts = new Map<string, number>();

    // Initialize all tags with 0 count
    for (const tag of allTags) {
      tagContentCounts.set(tag._id, 0);
    }

    // Count published events (not archived)
    for (const event of allEvents) {
      if (event.isArchived !== true && event.tags) {
        for (const tagId of event.tags) {
          const current = tagContentCounts.get(tagId) ?? 0;
          tagContentCounts.set(tagId, current + 1);
        }
      }
    }

    // Count published projects
    for (const project of allProjects) {
      if (project.isPublished === true && project.tags) {
        for (const tagId of project.tags) {
          const current = tagContentCounts.get(tagId) ?? 0;
          tagContentCounts.set(tagId, current + 1);
        }
      }
    }

    // Count published experiments
    for (const experiment of allExperiments) {
      if (experiment.isPublished === true && experiment.tags) {
        for (const tagId of experiment.tags) {
          const current = tagContentCounts.get(tagId) ?? 0;
          tagContentCounts.set(tagId, current + 1);
        }
      }
    }

    // Count articles (always counted - no publish state)
    for (const article of allArticles) {
      if (article.tags) {
        for (const tagId of article.tags) {
          const current = tagContentCounts.get(tagId) ?? 0;
          tagContentCounts.set(tagId, current + 1);
        }
      }
    }

    // Count published videos
    for (const video of allVideos) {
      if (video.isPublished === true && video.tags) {
        for (const tagId of video.tags) {
          const current = tagContentCounts.get(tagId) ?? 0;
          tagContentCounts.set(tagId, current + 1);
        }
      }
    }

    // Sort tags alphabetically by name (case-insensitive)
    const sortedTags = allTags.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    // Map to return type with content counts
    return sortedTags.map((tag) => ({
      _id: tag._id,
      _creationTime: tag._creationTime,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      contentCount: tagContentCounts.get(tag._id) ?? 0,
    }));
  },
});

/**
 * Get a tag by its slug.
 *
 * Uses the by_slug index for efficient lookup.
 * Returns the full tag object or null if not found.
 */
export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("tags"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const tag = await ctx.db
      .query("tags")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    return tag;
  },
});

/**
 * Get multiple tags by their IDs.
 *
 * Returns an array of tags with _id, name, and slug.
 * Skips any IDs that don't exist (no error thrown).
 * Returns empty array if no IDs provided or none found.
 */
export const getByIds = query({
  args: { tagIds: v.array(v.id("tags")) },
  returns: v.array(
    v.object({
      _id: v.id("tags"),
      name: v.string(),
      slug: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    if (args.tagIds.length === 0) {
      return [];
    }

    const tags = await Promise.all(
      args.tagIds.map((id) => ctx.db.get(id))
    );

    // Filter out null values (deleted/non-existent tags) and map to return type
    return tags
      .filter((tag): tag is NonNullable<typeof tag> => tag !== null)
      .map((tag) => ({
        _id: tag._id,
        name: tag.name,
        slug: tag.slug,
      }));
  },
});

/**
 * Get all published content for a specific tag.
 *
 * Returns content grouped by type:
 * - events: not archived, ordered by date desc
 * - projects: isPublished === true, ordered by _creationTime desc
 * - experiments: isPublished === true, ordered by _creationTime desc
 * - articles: ordered by publishedAt desc
 * - videos: isPublished === true, ordered by _creationTime desc
 */
export const getContentByTagId = query({
  args: { tagId: v.id("tags") },
  returns: v.object({
    events: v.array(
      v.object({
        _id: v.id("events"),
        title: v.string(),
        slug: v.string(),
        date: v.number(),
        isVirtual: v.boolean(),
      })
    ),
    projects: v.array(
      v.object({
        _id: v.id("projects"),
        title: v.string(),
        slug: v.string(),
        description: v.string(),
      })
    ),
    experiments: v.array(
      v.object({
        _id: v.id("experiments"),
        title: v.string(),
        slug: v.string(),
        status: v.union(
          v.literal("exploring"),
          v.literal("prototyping"),
          v.literal("paused"),
          v.literal("concluded")
        ),
      })
    ),
    articles: v.array(
      v.object({
        _id: v.id("articles"),
        title: v.string(),
        slug: v.string(),
        publishedAt: v.number(),
      })
    ),
    videos: v.array(
      v.object({
        _id: v.id("videos"),
        title: v.string(),
        slug: v.string(),
        youtubeId: v.string(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const { tagId } = args;

    // Fetch all content types in parallel
    const [allEvents, allProjects, allExperiments, allArticles, allVideos] =
      await Promise.all([
        ctx.db.query("events").collect(),
        ctx.db.query("projects").collect(),
        ctx.db.query("experiments").collect(),
        ctx.db.query("articles").collect(),
        ctx.db.query("videos").collect(),
      ]);

    // Filter events: has tag and not archived, order by date desc
    const events = allEvents
      .filter(
        (event) =>
          event.tags?.includes(tagId) && event.isArchived !== true
      )
      .sort((a, b) => b.date - a.date)
      .map((event) => ({
        _id: event._id,
        title: event.title,
        slug: event.slug,
        date: event.date,
        isVirtual: event.isVirtual,
      }));

    // Filter projects: has tag and isPublished, order by _creationTime desc
    const projects = allProjects
      .filter(
        (project) =>
          project.tags?.includes(tagId) && project.isPublished === true
      )
      .sort((a, b) => b._creationTime - a._creationTime)
      .map((project) => ({
        _id: project._id,
        title: project.title,
        slug: project.slug,
        description: project.description,
      }));

    // Filter experiments: has tag and isPublished, order by _creationTime desc
    const experiments = allExperiments
      .filter(
        (experiment) =>
          experiment.tags?.includes(tagId) && experiment.isPublished === true
      )
      .sort((a, b) => b._creationTime - a._creationTime)
      .map((experiment) => ({
        _id: experiment._id,
        title: experiment.title,
        slug: experiment.slug,
        status: experiment.status,
      }));

    // Filter articles: has tag, order by publishedAt desc
    const articles = allArticles
      .filter((article) => article.tags?.includes(tagId))
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .map((article) => ({
        _id: article._id,
        title: article.title,
        slug: article.slug,
        publishedAt: article.publishedAt,
      }));

    // Filter videos: has tag and isPublished, order by _creationTime desc
    const videos = allVideos
      .filter(
        (video) => video.tags?.includes(tagId) && video.isPublished === true
      )
      .sort((a, b) => b._creationTime - a._creationTime)
      .map((video) => ({
        _id: video._id,
        title: video.title,
        slug: video.slug,
        youtubeId: video.youtubeId,
      }));

    return {
      events,
      projects,
      experiments,
      articles,
      videos,
    };
  },
});
