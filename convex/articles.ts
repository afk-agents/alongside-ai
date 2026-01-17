import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { requireRole } from "./users";

/**
 * Generate a URL-friendly slug from a title.
 *
 * - Converts to lowercase
 * - Replaces non-alphanumeric characters with hyphens
 * - Removes leading/trailing hyphens
 * - Collapses multiple consecutive hyphens
 * - Truncates to max 50 characters (without ending in hyphen)
 *
 * @param title - The title to convert
 * @returns URL-friendly slug
 */
export function generateSlug(title: string): string {
  if (!title) return "";

  let slug = title
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
 * Check if a slug already exists in the articles database.
 * Optionally exclude a specific article ID (for updates).
 */
async function articleSlugExists(
  ctx: MutationCtx,
  slug: string,
  excludeId?: Id<"articles">
): Promise<boolean> {
  const existing = await ctx.db
    .query("articles")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  if (!existing) return false;
  if (excludeId && existing._id === excludeId) return false;
  return true;
}

/**
 * Author info validator for article listings (minimal fields).
 */
const authorInfoValidator = v.union(
  v.object({
    displayName: v.optional(v.string()),
    slug: v.optional(v.string()),
  }),
  v.null()
);

/**
 * Tag info validator for article listings.
 */
const tagInfoValidator = v.object({
  _id: v.id("tags"),
  name: v.string(),
  slug: v.string(),
});

/**
 * Article list item validator (excludes full content for performance).
 */
const articleListItemValidator = v.object({
  _id: v.id("articles"),
  title: v.string(),
  slug: v.string(),
  excerpt: v.optional(v.string()),
  publishedAt: v.number(),
  isFeatured: v.optional(v.boolean()),
  author: authorInfoValidator,
  tags: v.array(tagInfoValidator),
});

/**
 * Helper to fetch author profile info.
 * Returns minimal author info or null if profile doesn't exist.
 */
async function fetchAuthorInfo(
  ctx: { db: { get: (id: Id<"profiles">) => Promise<unknown> } },
  authorId: Id<"profiles">
): Promise<{ displayName?: string; slug?: string } | null> {
  const profile = (await ctx.db.get(authorId)) as {
    displayName?: string;
    slug?: string;
  } | null;
  if (!profile) return null;
  return {
    displayName: profile.displayName,
    slug: profile.slug,
  };
}

/**
 * Helper to fetch tags by their IDs.
 * Filters out deleted/non-existent tags.
 */
async function fetchTags(
  ctx: { db: { get: (id: Id<"tags">) => Promise<unknown> } },
  tagIds: Id<"tags">[] | undefined
): Promise<Array<{ _id: Id<"tags">; name: string; slug: string }>> {
  if (!tagIds || tagIds.length === 0) return [];

  const tags = await Promise.all(tagIds.map((id) => ctx.db.get(id)));

  return tags
    .filter(
      (tag): tag is { _id: Id<"tags">; name: string; slug: string } =>
        tag !== null
    )
    .map((tag) => ({
      _id: tag._id,
      name: tag.name,
      slug: tag.slug,
    }));
}

/**
 * List published articles with pagination and optional tag filtering.
 *
 * Returns articles ordered by publishedAt descending (most recent first).
 * Supports cursor-based pagination for efficient loading.
 *
 * @param limit - Max articles to return (default 10)
 * @param cursor - Pagination cursor (publishedAt timestamp to start after)
 * @param tagId - Optional tag ID to filter by
 *
 * @returns Object with articles array, nextCursor, and hasMore flag
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
    tagId: v.optional(v.id("tags")),
  },
  returns: v.object({
    articles: v.array(articleListItemValidator),
    nextCursor: v.union(v.number(), v.null()),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const cursor = args.cursor;
    const tagId = args.tagId;

    // Query articles using the by_publishedAt index, order descending
    const articlesQuery = ctx.db
      .query("articles")
      .withIndex("by_publishedAt");

    // Collect all articles then sort descending (Convex indexes are ascending)
    let allArticles = await articlesQuery.collect();

    // Sort by publishedAt descending
    allArticles.sort((a, b) => b.publishedAt - a.publishedAt);

    // Apply cursor-based pagination (skip articles newer than cursor timestamp)
    if (cursor !== undefined) {
      allArticles = allArticles.filter(
        (article) => article.publishedAt < cursor
      );
    }

    // Filter by tagId if provided (post-query filter since tags is an array)
    if (tagId) {
      allArticles = allArticles.filter(
        (article) => article.tags?.includes(tagId)
      );
    }

    // Determine if there are more articles
    const hasMore = allArticles.length > limit;

    // Take only the requested number of articles
    const paginatedArticles = allArticles.slice(0, limit);

    // Calculate next cursor (publishedAt of the last article in this page)
    const nextCursor =
      hasMore && paginatedArticles.length > 0
        ? paginatedArticles[paginatedArticles.length - 1].publishedAt
        : null;

    // Fetch author and tags for each article
    const articlesWithDetails = await Promise.all(
      paginatedArticles.map(async (article) => {
        const [author, tags] = await Promise.all([
          fetchAuthorInfo(ctx, article.authorId),
          fetchTags(ctx, article.tags),
        ]);

        return {
          _id: article._id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          publishedAt: article.publishedAt,
          isFeatured: article.isFeatured,
          author,
          tags,
        };
      })
    );

    return {
      articles: articlesWithDetails,
      nextCursor,
      hasMore,
    };
  },
});

/**
 * Featured article item validator.
 */
const featuredArticleValidator = v.object({
  _id: v.id("articles"),
  title: v.string(),
  slug: v.string(),
  excerpt: v.optional(v.string()),
  publishedAt: v.number(),
  author: authorInfoValidator,
});

/**
 * List featured articles for homepage/blog page display.
 *
 * Returns featured articles ordered by publishedAt descending.
 *
 * @param limit - Max articles to return (default 3)
 *
 * @returns Array of featured articles with author info
 */
export const listFeatured = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(featuredArticleValidator),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 3;

    // Query using the composite index for featured articles
    const allArticles = await ctx.db
      .query("articles")
      .withIndex("by_isFeatured_and_publishedAt", (q) =>
        q.eq("isFeatured", true)
      )
      .collect();

    // Sort by publishedAt descending
    allArticles.sort((a, b) => b.publishedAt - a.publishedAt);

    // Take only the requested limit
    const featuredArticles = allArticles.slice(0, limit);

    // Fetch author info for each article
    const articlesWithAuthor = await Promise.all(
      featuredArticles.map(async (article) => {
        const author = await fetchAuthorInfo(ctx, article.authorId);

        return {
          _id: article._id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          publishedAt: article.publishedAt,
          author,
        };
      })
    );

    return articlesWithAuthor;
  },
});

/**
 * Full author info validator for article detail view.
 */
const fullAuthorInfoValidator = v.union(
  v.object({
    displayName: v.optional(v.string()),
    slug: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
  }),
  v.null()
);

/**
 * Full article detail validator (includes all fields).
 */
const articleDetailValidator = v.union(
  v.object({
    _id: v.id("articles"),
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    publishedAt: v.number(),
    isFeatured: v.optional(v.boolean()),
    substackUrl: v.optional(v.string()),
    author: fullAuthorInfoValidator,
    tags: v.array(tagInfoValidator),
  }),
  v.null()
);

/**
 * Helper to fetch full author profile info for article detail.
 * Returns full author info or null if profile doesn't exist.
 */
async function fetchFullAuthorInfo(
  ctx: { db: { get: (id: Id<"profiles">) => Promise<unknown> } },
  authorId: Id<"profiles">
): Promise<{
  displayName?: string;
  slug?: string;
  photoUrl?: string;
  bio?: string;
} | null> {
  const profile = (await ctx.db.get(authorId)) as {
    displayName?: string;
    slug?: string;
    photoUrl?: string;
    bio?: string;
  } | null;
  if (!profile) return null;
  return {
    displayName: profile.displayName,
    slug: profile.slug,
    photoUrl: profile.photoUrl,
    bio: profile.bio,
  };
}

/**
 * Get a single article by its URL slug with full details.
 *
 * Uses the by_slug index for O(1) lookup.
 * Returns null if article not found.
 *
 * @param slug - The article's URL slug
 *
 * @returns Complete article object with content, author, and tags, or null
 */
export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: articleDetailValidator,
  handler: async (ctx, args) => {
    // Query using the by_slug index for efficient lookup
    const article = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!article) {
      return null;
    }

    // Fetch full author info and tags in parallel
    const [author, tags] = await Promise.all([
      fetchFullAuthorInfo(ctx, article.authorId),
      fetchTags(ctx, article.tags),
    ]);

    return {
      _id: article._id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      publishedAt: article.publishedAt,
      isFeatured: article.isFeatured,
      substackUrl: article.substackUrl,
      author,
      tags,
    };
  },
});

// ============================================================================
// Admin Queries and Mutations
// ============================================================================

/**
 * Admin article list item validator (minimal fields for table display).
 */
const adminArticleListItemValidator = v.object({
  _id: v.id("articles"),
  title: v.string(),
  slug: v.string(),
  publishedAt: v.number(),
  isFeatured: v.optional(v.boolean()),
  authorName: v.optional(v.string()),
  tagCount: v.number(),
});

/**
 * List all articles for admin (includes all articles regardless of status).
 *
 * Requires admin role.
 * Returns articles sorted by publishedAt descending with minimal fields.
 */
export const listAdmin = query({
  args: {},
  returns: v.array(adminArticleListItemValidator),
  handler: async (ctx) => {
    // Require admin role
    await requireRole(ctx, ["admin"]);

    // Query all articles, collect and sort by publishedAt descending
    const allArticles = await ctx.db.query("articles").collect();
    allArticles.sort((a, b) => b.publishedAt - a.publishedAt);

    // Fetch author displayNames and return minimal fields
    const articlesWithAuthor = await Promise.all(
      allArticles.map(async (article) => {
        const profile = await ctx.db.get(article.authorId);
        return {
          _id: article._id,
          title: article.title,
          slug: article.slug,
          publishedAt: article.publishedAt,
          isFeatured: article.isFeatured,
          authorName: profile?.displayName,
          tagCount: article.tags?.length ?? 0,
        };
      })
    );

    return articlesWithAuthor;
  },
});

/**
 * Admin article detail validator (raw fields for editing).
 */
const adminArticleDetailValidator = v.union(
  v.object({
    _id: v.id("articles"),
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    authorId: v.id("profiles"),
    publishedAt: v.number(),
    excerpt: v.optional(v.string()),
    tags: v.optional(v.array(v.id("tags"))),
    substackUrl: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
  }),
  v.null()
);

/**
 * Get a single article by ID for editing (admin only).
 *
 * Requires admin role.
 * Returns raw article data (not joined) for form population.
 */
export const get = query({
  args: { id: v.id("articles") },
  returns: adminArticleDetailValidator,
  handler: async (ctx, args) => {
    // Require admin role
    await requireRole(ctx, ["admin"]);

    const article = await ctx.db.get(args.id);
    if (!article) {
      return null;
    }

    return {
      _id: article._id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      authorId: article.authorId,
      publishedAt: article.publishedAt,
      excerpt: article.excerpt,
      tags: article.tags,
      substackUrl: article.substackUrl,
      isFeatured: article.isFeatured,
    };
  },
});

/**
 * Create a new article (admin only).
 *
 * Requires admin role.
 * Validates slug format and uniqueness.
 * Verifies author profile exists and is published.
 * Verifies all tag IDs exist.
 * Auto-generates excerpt from first 160 chars if not provided.
 */
export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    authorId: v.id("profiles"),
    publishedAt: v.optional(v.number()),
    excerpt: v.optional(v.string()),
    tags: v.optional(v.array(v.id("tags"))),
    substackUrl: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
  },
  returns: v.id("articles"),
  handler: async (ctx, args) => {
    // Require admin role
    await requireRole(ctx, ["admin"]);

    // Validate slug format
    if (!validateSlug(args.slug)) {
      throw new Error(
        `Invalid slug format: "${args.slug}". Slugs must be 2-50 lowercase alphanumeric characters with single hyphens between words.`
      );
    }

    // Check slug uniqueness
    if (await articleSlugExists(ctx, args.slug)) {
      throw new Error(
        `Article with slug "${args.slug}" already exists. Please choose a different slug.`
      );
    }

    // Verify author exists and is published
    const author = await ctx.db.get(args.authorId);
    if (!author || author.profileStatus !== "published") {
      throw new Error(
        "Author profile must exist and be published to create an article."
      );
    }

    // Verify all tags exist if provided
    if (args.tags && args.tags.length > 0) {
      const tags = await Promise.all(args.tags.map((id) => ctx.db.get(id)));
      if (tags.some((tag) => tag === null)) {
        throw new Error("One or more tags do not exist.");
      }
    }

    // Auto-generate excerpt from first 160 chars of content if not provided
    const excerpt =
      args.excerpt ?? (args.content ? args.content.slice(0, 160) : undefined);

    // Insert the article
    const articleId = await ctx.db.insert("articles", {
      title: args.title,
      slug: args.slug,
      content: args.content,
      authorId: args.authorId,
      publishedAt: args.publishedAt ?? Date.now(),
      excerpt,
      tags: args.tags,
      substackUrl: args.substackUrl,
      isFeatured: args.isFeatured,
    });

    return articleId;
  },
});

/**
 * Update an existing article (admin only).
 *
 * Requires admin role.
 * Only updates provided fields (partial update).
 * Validates slug uniqueness if changed.
 * Verifies author if changed.
 * Verifies tags if changed.
 */
export const update = mutation({
  args: {
    id: v.id("articles"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    authorId: v.optional(v.id("profiles")),
    publishedAt: v.optional(v.number()),
    excerpt: v.optional(v.string()),
    tags: v.optional(v.array(v.id("tags"))),
    substackUrl: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Require admin role
    await requireRole(ctx, ["admin"]);

    // Verify article exists
    const existingArticle = await ctx.db.get(args.id);
    if (!existingArticle) {
      throw new Error(`Article not found with ID: ${args.id}`);
    }

    // Validate slug if provided
    if (args.slug !== undefined) {
      if (!validateSlug(args.slug)) {
        throw new Error(
          `Invalid slug format: "${args.slug}". Slugs must be 2-50 lowercase alphanumeric characters with single hyphens between words.`
        );
      }

      // Check slug uniqueness (excluding self)
      if (await articleSlugExists(ctx, args.slug, args.id)) {
        throw new Error(
          `Article with slug "${args.slug}" already exists. Please choose a different slug.`
        );
      }
    }

    // Verify author if changed
    if (args.authorId !== undefined) {
      const author = await ctx.db.get(args.authorId);
      if (!author || author.profileStatus !== "published") {
        throw new Error(
          "Author profile must exist and be published to update article author."
        );
      }
    }

    // Verify tags if changed
    if (args.tags !== undefined && args.tags.length > 0) {
      const tags = await Promise.all(args.tags.map((id) => ctx.db.get(id)));
      if (tags.some((tag) => tag === null)) {
        throw new Error("One or more tags do not exist.");
      }
    }

    // Build patch object with only provided fields
    const patch: Partial<{
      title: string;
      slug: string;
      content: string;
      authorId: Id<"profiles">;
      publishedAt: number;
      excerpt: string;
      tags: Id<"tags">[];
      substackUrl: string;
      isFeatured: boolean;
    }> = {};

    if (args.title !== undefined) patch.title = args.title;
    if (args.slug !== undefined) patch.slug = args.slug;
    if (args.content !== undefined) patch.content = args.content;
    if (args.authorId !== undefined) patch.authorId = args.authorId;
    if (args.publishedAt !== undefined) patch.publishedAt = args.publishedAt;
    if (args.excerpt !== undefined) patch.excerpt = args.excerpt;
    if (args.tags !== undefined) patch.tags = args.tags;
    if (args.substackUrl !== undefined) patch.substackUrl = args.substackUrl;
    if (args.isFeatured !== undefined) patch.isFeatured = args.isFeatured;

    // Apply patch
    await ctx.db.patch(args.id, patch);

    return null;
  },
});

/**
 * Delete an article (admin only).
 *
 * Requires admin role.
 */
export const remove = mutation({
  args: { id: v.id("articles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Require admin role
    await requireRole(ctx, ["admin"]);

    // Verify article exists
    const existingArticle = await ctx.db.get(args.id);
    if (!existingArticle) {
      throw new Error(`Article not found with ID: ${args.id}`);
    }

    // Delete the article
    await ctx.db.delete(args.id);

    return null;
  },
});
