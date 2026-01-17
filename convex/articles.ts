import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

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
