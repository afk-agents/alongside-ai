import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import { api } from "@/convex/_generated/api";
import schema from "@/convex/schema";
import { Id } from "@/convex/_generated/dataModel";

// Type alias for the test context
type TestContext = ReturnType<typeof convexTest>;

// Helper to create a profile for testing
async function createTestProfile(t: TestContext) {
  return await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {});
    const profileId = await ctx.db.insert("profiles", {
      userId,
      role: "member",
      profileStatus: "published",
      displayName: "Test Author",
      slug: "test-author",
    });
    return { userId, profileId };
  });
}

// Helper to create a tag for testing
async function createTestTag(
  t: TestContext,
  name: string,
  slug: string
): Promise<Id<"tags">> {
  return await t.run(async (ctx) => {
    return await ctx.db.insert("tags", { name, slug });
  });
}

// Helper to create an article for testing
async function createTestArticle(
  t: TestContext,
  profileId: Id<"profiles">,
  data: {
    title: string;
    slug: string;
    content?: string;
    publishedAt?: number;
    excerpt?: string;
    tags?: Id<"tags">[];
    isFeatured?: boolean;
    substackUrl?: string;
  }
) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert("articles", {
      title: data.title,
      slug: data.slug,
      content: data.content ?? "Test content",
      authorId: profileId,
      publishedAt: data.publishedAt ?? Date.now(),
      excerpt: data.excerpt,
      tags: data.tags,
      isFeatured: data.isFeatured,
      substackUrl: data.substackUrl,
    });
  });
}

describe("articles.list query", () => {
  it("returns empty array when no articles exist", async () => {
    const t = convexTest(schema);

    const result = await t.query(api.articles.list, {});

    expect(result.articles).toEqual([]);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });

  it("returns articles ordered by publishedAt descending", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    // Create articles with different publish times
    const now = Date.now();
    await createTestArticle(t, profileId, {
      title: "Older Article",
      slug: "older-article",
      publishedAt: now - 86400000, // Yesterday
    });
    await createTestArticle(t, profileId, {
      title: "Newer Article",
      slug: "newer-article",
      publishedAt: now, // Now
    });
    await createTestArticle(t, profileId, {
      title: "Middle Article",
      slug: "middle-article",
      publishedAt: now - 43200000, // 12 hours ago
    });

    const result = await t.query(api.articles.list, {});

    expect(result.articles).toHaveLength(3);
    expect(result.articles[0].title).toBe("Newer Article");
    expect(result.articles[1].title).toBe("Middle Article");
    expect(result.articles[2].title).toBe("Older Article");
  });

  it("respects the limit parameter", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    // Create 5 articles
    for (let i = 0; i < 5; i++) {
      await createTestArticle(t, profileId, {
        title: `Article ${i}`,
        slug: `article-${i}`,
        publishedAt: Date.now() - i * 1000, // Staggered times
      });
    }

    const result = await t.query(api.articles.list, { limit: 2 });

    expect(result.articles).toHaveLength(2);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBeDefined();
  });

  it("defaults to limit of 10", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    // Create 15 articles
    for (let i = 0; i < 15; i++) {
      await createTestArticle(t, profileId, {
        title: `Article ${i}`,
        slug: `article-${i}`,
        publishedAt: Date.now() - i * 1000,
      });
    }

    const result = await t.query(api.articles.list, {});

    expect(result.articles).toHaveLength(10);
    expect(result.hasMore).toBe(true);
  });

  it("supports cursor-based pagination", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    // Create 5 articles with distinct timestamps
    const now = Date.now();
    for (let i = 0; i < 5; i++) {
      await createTestArticle(t, profileId, {
        title: `Article ${4 - i}`, // Reverse order for clarity
        slug: `article-${4 - i}`,
        publishedAt: now - i * 10000, // 10 second gaps
      });
    }

    // Get first page
    const page1 = await t.query(api.articles.list, { limit: 2 });
    expect(page1.articles).toHaveLength(2);
    expect(page1.articles[0].title).toBe("Article 4");
    expect(page1.articles[1].title).toBe("Article 3");
    expect(page1.hasMore).toBe(true);

    // Get second page using cursor
    const page2 = await t.query(api.articles.list, {
      limit: 2,
      cursor: page1.nextCursor!,
    });
    expect(page2.articles).toHaveLength(2);
    expect(page2.articles[0].title).toBe("Article 2");
    expect(page2.articles[1].title).toBe("Article 1");
    expect(page2.hasMore).toBe(true);

    // Get third page
    const page3 = await t.query(api.articles.list, {
      limit: 2,
      cursor: page2.nextCursor!,
    });
    expect(page3.articles).toHaveLength(1);
    expect(page3.articles[0].title).toBe("Article 0");
    expect(page3.hasMore).toBe(false);
  });

  it("filters by tagId when provided", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    const tagAI = await createTestTag(t, "AI", "ai");
    const tagML = await createTestTag(t, "ML", "ml");

    await createTestArticle(t, profileId, {
      title: "AI Article",
      slug: "ai-article",
      tags: [tagAI],
    });
    await createTestArticle(t, profileId, {
      title: "ML Article",
      slug: "ml-article",
      tags: [tagML],
    });
    await createTestArticle(t, profileId, {
      title: "Both Tags Article",
      slug: "both-tags-article",
      tags: [tagAI, tagML],
    });
    await createTestArticle(t, profileId, {
      title: "No Tags Article",
      slug: "no-tags-article",
    });

    const result = await t.query(api.articles.list, { tagId: tagAI });

    expect(result.articles).toHaveLength(2);
    const titles = result.articles.map((a) => a.title);
    expect(titles).toContain("AI Article");
    expect(titles).toContain("Both Tags Article");
    expect(titles).not.toContain("ML Article");
    expect(titles).not.toContain("No Tags Article");
  });

  it("includes author profile information", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    await createTestArticle(t, profileId, {
      title: "Test Article",
      slug: "test-article",
    });

    const result = await t.query(api.articles.list, {});

    expect(result.articles).toHaveLength(1);
    expect(result.articles[0].author).toBeDefined();
    expect(result.articles[0].author?.displayName).toBe("Test Author");
    expect(result.articles[0].author?.slug).toBe("test-author");
  });

  it("handles deleted author gracefully", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    await createTestArticle(t, profileId, {
      title: "Orphan Article",
      slug: "orphan-article",
    });

    // Delete the profile
    await t.run(async (ctx) => {
      await ctx.db.delete(profileId);
    });

    const result = await t.query(api.articles.list, {});

    expect(result.articles).toHaveLength(1);
    expect(result.articles[0].author).toBeNull();
  });

  it("includes tags information", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);
    const tagId = await createTestTag(t, "AI", "ai");

    await createTestArticle(t, profileId, {
      title: "Tagged Article",
      slug: "tagged-article",
      tags: [tagId],
    });

    const result = await t.query(api.articles.list, {});

    expect(result.articles).toHaveLength(1);
    expect(result.articles[0].tags).toHaveLength(1);
    expect(result.articles[0].tags[0]).toMatchObject({
      _id: tagId,
      name: "AI",
      slug: "ai",
    });
  });

  it("filters out deleted tags", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);
    const tagId = await createTestTag(t, "Deleted Tag", "deleted-tag");
    const keepTagId = await createTestTag(t, "Keep Tag", "keep-tag");

    await createTestArticle(t, profileId, {
      title: "Article With Tags",
      slug: "article-with-tags",
      tags: [tagId, keepTagId],
    });

    // Delete one tag
    await t.run(async (ctx) => {
      await ctx.db.delete(tagId);
    });

    const result = await t.query(api.articles.list, {});

    expect(result.articles).toHaveLength(1);
    expect(result.articles[0].tags).toHaveLength(1);
    expect(result.articles[0].tags[0].name).toBe("Keep Tag");
  });

  it("returns correct shape with all expected fields", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);
    const tagId = await createTestTag(t, "Test", "test");

    await createTestArticle(t, profileId, {
      title: "Complete Article",
      slug: "complete-article",
      content: "Full content here",
      excerpt: "Short excerpt",
      tags: [tagId],
      isFeatured: true,
      substackUrl: "https://example.substack.com/p/complete-article",
    });

    const result = await t.query(api.articles.list, {});

    expect(result.articles).toHaveLength(1);
    const article = result.articles[0];

    expect(article).toHaveProperty("_id");
    expect(article).toHaveProperty("title", "Complete Article");
    expect(article).toHaveProperty("slug", "complete-article");
    expect(article).toHaveProperty("excerpt", "Short excerpt");
    expect(article).toHaveProperty("publishedAt");
    expect(article).toHaveProperty("isFeatured", true);
    expect(article).toHaveProperty("author");
    expect(article).toHaveProperty("tags");
    // Note: content is NOT included in list view for performance
  });
});

describe("articles.listFeatured query", () => {
  it("returns empty array when no featured articles exist", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    // Create non-featured article
    await createTestArticle(t, profileId, {
      title: "Regular Article",
      slug: "regular-article",
      isFeatured: false,
    });

    const result = await t.query(api.articles.listFeatured, {});

    expect(result).toEqual([]);
  });

  it("returns only featured articles", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    await createTestArticle(t, profileId, {
      title: "Featured Article",
      slug: "featured-article",
      isFeatured: true,
    });
    await createTestArticle(t, profileId, {
      title: "Not Featured",
      slug: "not-featured",
      isFeatured: false,
    });
    await createTestArticle(t, profileId, {
      title: "Another Featured",
      slug: "another-featured",
      isFeatured: true,
    });

    const result = await t.query(api.articles.listFeatured, {});

    expect(result).toHaveLength(2);
    const titles = result.map((a) => a.title);
    expect(titles).toContain("Featured Article");
    expect(titles).toContain("Another Featured");
    expect(titles).not.toContain("Not Featured");
  });

  it("orders by publishedAt descending", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    const now = Date.now();
    await createTestArticle(t, profileId, {
      title: "Older Featured",
      slug: "older-featured",
      isFeatured: true,
      publishedAt: now - 86400000,
    });
    await createTestArticle(t, profileId, {
      title: "Newer Featured",
      slug: "newer-featured",
      isFeatured: true,
      publishedAt: now,
    });

    const result = await t.query(api.articles.listFeatured, {});

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Newer Featured");
    expect(result[1].title).toBe("Older Featured");
  });

  it("defaults to limit of 3", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    // Create 5 featured articles
    for (let i = 0; i < 5; i++) {
      await createTestArticle(t, profileId, {
        title: `Featured ${i}`,
        slug: `featured-${i}`,
        isFeatured: true,
        publishedAt: Date.now() - i * 1000,
      });
    }

    const result = await t.query(api.articles.listFeatured, {});

    expect(result).toHaveLength(3);
  });

  it("respects custom limit", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    // Create 5 featured articles
    for (let i = 0; i < 5; i++) {
      await createTestArticle(t, profileId, {
        title: `Featured ${i}`,
        slug: `featured-${i}`,
        isFeatured: true,
        publishedAt: Date.now() - i * 1000,
      });
    }

    const result = await t.query(api.articles.listFeatured, { limit: 2 });

    expect(result).toHaveLength(2);
  });

  it("includes author displayName and slug only", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    await createTestArticle(t, profileId, {
      title: "Featured With Author",
      slug: "featured-with-author",
      isFeatured: true,
    });

    const result = await t.query(api.articles.listFeatured, {});

    expect(result).toHaveLength(1);
    expect(result[0].author).toBeDefined();
    expect(result[0].author?.displayName).toBe("Test Author");
    expect(result[0].author?.slug).toBe("test-author");
  });

  it("treats undefined isFeatured as not featured", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    // Create article without isFeatured field (defaults to undefined)
    await t.run(async (ctx) => {
      await ctx.db.insert("articles", {
        title: "No Featured Flag",
        slug: "no-featured-flag",
        content: "Content",
        authorId: profileId,
        publishedAt: Date.now(),
        // isFeatured is not set
      });
    });

    const result = await t.query(api.articles.listFeatured, {});

    expect(result).toHaveLength(0);
  });

  it("returns correct shape with expected fields", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    await createTestArticle(t, profileId, {
      title: "Featured Article",
      slug: "featured-article",
      excerpt: "Test excerpt",
      isFeatured: true,
    });

    const result = await t.query(api.articles.listFeatured, {});

    expect(result).toHaveLength(1);
    const article = result[0];

    expect(article).toHaveProperty("_id");
    expect(article).toHaveProperty("title", "Featured Article");
    expect(article).toHaveProperty("slug", "featured-article");
    expect(article).toHaveProperty("excerpt", "Test excerpt");
    expect(article).toHaveProperty("publishedAt");
    expect(article).toHaveProperty("author");
  });
});

// Helper to create a profile with full details for testing getBySlug
async function createFullTestProfile(t: TestContext) {
  return await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {});
    const profileId = await ctx.db.insert("profiles", {
      userId,
      role: "member",
      profileStatus: "published",
      displayName: "Full Author",
      slug: "full-author",
      photoUrl: "https://example.com/photo.jpg",
      bio: "This is a test author bio.",
    });
    return { userId, profileId };
  });
}

describe("articles.getBySlug query", () => {
  it("returns null when article does not exist", async () => {
    const t = convexTest(schema);

    const result = await t.query(api.articles.getBySlug, {
      slug: "nonexistent-article",
    });

    expect(result).toBeNull();
  });

  it("returns article with full details by slug", async () => {
    const t = convexTest(schema);
    const { profileId } = await createFullTestProfile(t);

    await createTestArticle(t, profileId, {
      title: "Test Article",
      slug: "test-article",
      content: "Full article content here.",
      excerpt: "Short excerpt",
    });

    const result = await t.query(api.articles.getBySlug, {
      slug: "test-article",
    });

    expect(result).not.toBeNull();
    expect(result?.title).toBe("Test Article");
    expect(result?.slug).toBe("test-article");
    expect(result?.content).toBe("Full article content here.");
    expect(result?.excerpt).toBe("Short excerpt");
  });

  it("includes full author profile fields", async () => {
    const t = convexTest(schema);
    const { profileId } = await createFullTestProfile(t);

    await createTestArticle(t, profileId, {
      title: "Article With Author",
      slug: "article-with-author",
    });

    const result = await t.query(api.articles.getBySlug, {
      slug: "article-with-author",
    });

    expect(result).not.toBeNull();
    expect(result?.author).toBeDefined();
    expect(result?.author?.displayName).toBe("Full Author");
    expect(result?.author?.slug).toBe("full-author");
    expect(result?.author?.photoUrl).toBe("https://example.com/photo.jpg");
    expect(result?.author?.bio).toBe("This is a test author bio.");
  });

  it("handles deleted author gracefully", async () => {
    const t = convexTest(schema);
    const { profileId } = await createFullTestProfile(t);

    await createTestArticle(t, profileId, {
      title: "Orphan Article",
      slug: "orphan-article",
    });

    // Delete the profile
    await t.run(async (ctx) => {
      await ctx.db.delete(profileId);
    });

    const result = await t.query(api.articles.getBySlug, {
      slug: "orphan-article",
    });

    expect(result).not.toBeNull();
    expect(result?.author).toBeNull();
  });

  it("includes tags with id, name, and slug", async () => {
    const t = convexTest(schema);
    const { profileId } = await createFullTestProfile(t);
    const tagAI = await createTestTag(t, "AI", "ai");
    const tagML = await createTestTag(t, "ML", "ml");

    await createTestArticle(t, profileId, {
      title: "Tagged Article",
      slug: "tagged-article",
      tags: [tagAI, tagML],
    });

    const result = await t.query(api.articles.getBySlug, {
      slug: "tagged-article",
    });

    expect(result).not.toBeNull();
    expect(result?.tags).toHaveLength(2);

    const aiTag = result?.tags.find((t) => t.slug === "ai");
    expect(aiTag).toBeDefined();
    expect(aiTag?._id).toBe(tagAI);
    expect(aiTag?.name).toBe("AI");

    const mlTag = result?.tags.find((t) => t.slug === "ml");
    expect(mlTag).toBeDefined();
    expect(mlTag?._id).toBe(tagML);
    expect(mlTag?.name).toBe("ML");
  });

  it("filters out deleted tags", async () => {
    const t = convexTest(schema);
    const { profileId } = await createFullTestProfile(t);
    const tagToDelete = await createTestTag(t, "Delete Me", "delete-me");
    const tagToKeep = await createTestTag(t, "Keep Me", "keep-me");

    await createTestArticle(t, profileId, {
      title: "Article With Mixed Tags",
      slug: "article-with-mixed-tags",
      tags: [tagToDelete, tagToKeep],
    });

    // Delete one tag
    await t.run(async (ctx) => {
      await ctx.db.delete(tagToDelete);
    });

    const result = await t.query(api.articles.getBySlug, {
      slug: "article-with-mixed-tags",
    });

    expect(result).not.toBeNull();
    expect(result?.tags).toHaveLength(1);
    expect(result?.tags[0].slug).toBe("keep-me");
  });

  it("returns empty tags array when article has no tags", async () => {
    const t = convexTest(schema);
    const { profileId } = await createFullTestProfile(t);

    await createTestArticle(t, profileId, {
      title: "No Tags Article",
      slug: "no-tags-article",
    });

    const result = await t.query(api.articles.getBySlug, {
      slug: "no-tags-article",
    });

    expect(result).not.toBeNull();
    expect(result?.tags).toEqual([]);
  });

  it("includes all article fields in response", async () => {
    const t = convexTest(schema);
    const { profileId } = await createFullTestProfile(t);
    const tagId = await createTestTag(t, "Test", "test");

    const publishedAt = Date.now();
    await createTestArticle(t, profileId, {
      title: "Complete Article",
      slug: "complete-article",
      content: "Full content for the article.",
      excerpt: "Short excerpt text",
      tags: [tagId],
      isFeatured: true,
      substackUrl: "https://example.substack.com/p/complete-article",
      publishedAt,
    });

    const result = await t.query(api.articles.getBySlug, {
      slug: "complete-article",
    });

    expect(result).not.toBeNull();
    expect(result?._id).toBeDefined();
    expect(result?.title).toBe("Complete Article");
    expect(result?.slug).toBe("complete-article");
    expect(result?.content).toBe("Full content for the article.");
    expect(result?.excerpt).toBe("Short excerpt text");
    expect(result?.publishedAt).toBe(publishedAt);
    expect(result?.isFeatured).toBe(true);
    expect(result?.substackUrl).toBe(
      "https://example.substack.com/p/complete-article"
    );
    expect(result?.author).toBeDefined();
    expect(result?.tags).toHaveLength(1);
  });

  it("uses by_slug index for efficient lookup", async () => {
    const t = convexTest(schema);
    const { profileId } = await createFullTestProfile(t);

    // Create multiple articles
    for (let i = 0; i < 10; i++) {
      await createTestArticle(t, profileId, {
        title: `Article ${i}`,
        slug: `article-${i}`,
      });
    }

    // Query should still be efficient with index
    const result = await t.query(api.articles.getBySlug, {
      slug: "article-5",
    });

    expect(result).not.toBeNull();
    expect(result?.title).toBe("Article 5");
  });
});

// Helper to create admin user context
async function setupAdminUser(t: TestContext) {
  const { userId, profileId } = await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {});
    const profileId = await ctx.db.insert("profiles", {
      userId,
      role: "admin",
      profileStatus: "published",
      displayName: "Admin User",
      slug: "admin-user",
    });
    return { userId, profileId };
  });

  return {
    t: t.withIdentity({
      subject: userId,
      issuer: "test",
      tokenIdentifier: `test|${userId}`,
    }),
    userId,
    profileId,
  };
}

// Helper to create guest user context
async function setupGuestUser(t: TestContext) {
  const { userId, profileId } = await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {});
    const profileId = await ctx.db.insert("profiles", {
      userId,
      role: "guest",
      profileStatus: "locked",
    });
    return { userId, profileId };
  });

  return {
    t: t.withIdentity({
      subject: userId,
      issuer: "test",
      tokenIdentifier: `test|${userId}`,
    }),
    userId,
    profileId,
  };
}

// Helper to create a published profile for use as article author
async function createPublishedProfile(t: TestContext) {
  return await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {});
    const profileId = await ctx.db.insert("profiles", {
      userId,
      role: "member",
      profileStatus: "published",
      displayName: "Published Author",
      slug: "published-author",
    });
    return profileId;
  });
}

describe("articles.listAdmin query", () => {
  it("requires admin role", async () => {
    const t = convexTest(schema);
    const { t: guestCtx } = await setupGuestUser(t);

    await expect(guestCtx.query(api.articles.listAdmin, {})).rejects.toThrow(
      /Required role: admin/
    );
  });

  it("throws for unauthenticated user", async () => {
    const t = convexTest(schema);

    await expect(t.query(api.articles.listAdmin, {})).rejects.toThrow(
      /Authentication required/
    );
  });

  it("returns empty array when no articles exist", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    const result = await adminCtx.query(api.articles.listAdmin, {});

    expect(result).toEqual([]);
  });

  it("returns all articles sorted by publishedAt descending", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);

    const now = Date.now();
    await createTestArticle(t, profileId, {
      title: "Older Article",
      slug: "older-article",
      publishedAt: now - 86400000,
    });
    await createTestArticle(t, profileId, {
      title: "Newer Article",
      slug: "newer-article",
      publishedAt: now,
    });

    const result = await adminCtx.query(api.articles.listAdmin, {});

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Newer Article");
    expect(result[1].title).toBe("Older Article");
  });

  it("includes author displayName", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);

    await createTestArticle(t, profileId, {
      title: "Test Article",
      slug: "test-article",
    });

    const result = await adminCtx.query(api.articles.listAdmin, {});

    expect(result).toHaveLength(1);
    expect(result[0].authorName).toBe("Admin User");
  });

  it("handles deleted author gracefully", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);
    const authorId = await createPublishedProfile(t);

    await createTestArticle(t, authorId, {
      title: "Orphan Article",
      slug: "orphan-article",
    });

    await t.run(async (ctx) => {
      await ctx.db.delete(authorId);
    });

    const result = await adminCtx.query(api.articles.listAdmin, {});

    expect(result).toHaveLength(1);
    expect(result[0].authorName).toBeUndefined();
  });

  it("returns correct shape with minimal fields", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);
    const tagId = await createTestTag(t, "Test", "test");

    await createTestArticle(t, profileId, {
      title: "Admin Article",
      slug: "admin-article",
      tags: [tagId, tagId], // Intentionally duplicate to verify count
      isFeatured: true,
    });

    const result = await adminCtx.query(api.articles.listAdmin, {});

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("_id");
    expect(result[0]).toHaveProperty("title", "Admin Article");
    expect(result[0]).toHaveProperty("slug", "admin-article");
    expect(result[0]).toHaveProperty("publishedAt");
    expect(result[0]).toHaveProperty("isFeatured", true);
    expect(result[0]).toHaveProperty("authorName", "Admin User");
    expect(result[0]).toHaveProperty("tagCount", 2);
  });
});

describe("articles.get query (admin)", () => {
  it("requires admin role", async () => {
    const t = convexTest(schema);
    const { t: guestCtx } = await setupGuestUser(t);
    const { profileId } = await createTestProfile(t);

    const articleId = await createTestArticle(t, profileId, {
      title: "Test",
      slug: "test",
    });

    await expect(
      guestCtx.query(api.articles.get, { id: articleId })
    ).rejects.toThrow(/Required role: admin/);
  });

  it("throws for unauthenticated user", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    const articleId = await createTestArticle(t, profileId, {
      title: "Test",
      slug: "test",
    });

    await expect(t.query(api.articles.get, { id: articleId })).rejects.toThrow(
      /Authentication required/
    );
  });

  it("returns null for non-existent article", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);

    const deletedId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("articles", {
        title: "Temp",
        slug: "temp",
        content: "Content",
        authorId: profileId,
        publishedAt: Date.now(),
      });
      await ctx.db.delete(id);
      return id;
    });

    const result = await adminCtx.query(api.articles.get, { id: deletedId });

    expect(result).toBeNull();
  });

  it("returns full article data for editing", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);
    const tagId = await createTestTag(t, "Test", "test");

    const publishedAt = Date.now();
    const articleId = await createTestArticle(t, profileId, {
      title: "Edit Article",
      slug: "edit-article",
      content: "Full content",
      excerpt: "Short excerpt",
      tags: [tagId],
      isFeatured: true,
      substackUrl: "https://example.substack.com/p/edit",
      publishedAt,
    });

    const result = await adminCtx.query(api.articles.get, { id: articleId });

    expect(result).not.toBeNull();
    expect(result?._id).toBe(articleId);
    expect(result?.title).toBe("Edit Article");
    expect(result?.slug).toBe("edit-article");
    expect(result?.content).toBe("Full content");
    expect(result?.excerpt).toBe("Short excerpt");
    expect(result?.authorId).toBe(profileId);
    expect(result?.publishedAt).toBe(publishedAt);
    expect(result?.tags).toEqual([tagId]);
    expect(result?.isFeatured).toBe(true);
    expect(result?.substackUrl).toBe("https://example.substack.com/p/edit");
  });
});

describe("articles.create mutation", () => {
  it("requires admin role", async () => {
    const t = convexTest(schema);
    const { t: guestCtx } = await setupGuestUser(t);
    const authorId = await createPublishedProfile(t);

    await expect(
      guestCtx.mutation(api.articles.create, {
        title: "Test",
        slug: "test",
        content: "Content",
        authorId,
      })
    ).rejects.toThrow(/Required role: admin/);
  });

  it("throws for unauthenticated user", async () => {
    const t = convexTest(schema);
    const authorId = await createPublishedProfile(t);

    await expect(
      t.mutation(api.articles.create, {
        title: "Test",
        slug: "test",
        content: "Content",
        authorId,
      })
    ).rejects.toThrow(/Authentication required/);
  });

  it("creates article with all required fields", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);
    const authorId = await createPublishedProfile(t);

    const articleId = await adminCtx.mutation(api.articles.create, {
      title: "New Article",
      slug: "new-article",
      content: "Article content here",
      authorId,
    });

    expect(articleId).toBeDefined();

    const article = await t.run(async (ctx) => {
      return await ctx.db.get(articleId);
    });

    expect(article?.title).toBe("New Article");
    expect(article?.slug).toBe("new-article");
    expect(article?.content).toBe("Article content here");
    expect(article?.authorId).toBe(authorId);
    expect(article?.publishedAt).toBeDefined();
  });

  it("creates article with all optional fields", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);
    const authorId = await createPublishedProfile(t);
    const tagId = await createTestTag(t, "Test", "test");
    const publishedAt = Date.now() - 86400000;

    const articleId = await adminCtx.mutation(api.articles.create, {
      title: "Full Article",
      slug: "full-article",
      content: "Full content",
      authorId,
      excerpt: "Custom excerpt",
      tags: [tagId],
      isFeatured: true,
      substackUrl: "https://example.substack.com/p/full",
      publishedAt,
    });

    const article = await t.run(async (ctx) => {
      return await ctx.db.get(articleId);
    });

    expect(article?.excerpt).toBe("Custom excerpt");
    expect(article?.tags).toEqual([tagId]);
    expect(article?.isFeatured).toBe(true);
    expect(article?.substackUrl).toBe("https://example.substack.com/p/full");
    expect(article?.publishedAt).toBe(publishedAt);
  });

  it("auto-generates excerpt from first 160 chars of content if not provided", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);
    const authorId = await createPublishedProfile(t);

    const longContent =
      "This is a very long article content that exceeds one hundred sixty characters and should be truncated to create an automatic excerpt for the article preview display.";

    const articleId = await adminCtx.mutation(api.articles.create, {
      title: "Auto Excerpt",
      slug: "auto-excerpt",
      content: longContent,
      authorId,
    });

    const article = await t.run(async (ctx) => {
      return await ctx.db.get(articleId);
    });

    expect(article?.excerpt).toBeDefined();
    expect(article?.excerpt?.length).toBeLessThanOrEqual(160);
    expect(article?.excerpt).toBe(longContent.slice(0, 160));
  });

  it("validates slug format", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);
    const authorId = await createPublishedProfile(t);

    await expect(
      adminCtx.mutation(api.articles.create, {
        title: "Invalid Slug",
        slug: "INVALID SLUG",
        content: "Content",
        authorId,
      })
    ).rejects.toThrow(/Invalid slug format/);
  });

  it("rejects duplicate slug", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);
    const authorId = await createPublishedProfile(t);

    await createTestArticle(t, profileId, {
      title: "Existing",
      slug: "existing-slug",
    });

    await expect(
      adminCtx.mutation(api.articles.create, {
        title: "Duplicate",
        slug: "existing-slug",
        content: "Content",
        authorId,
      })
    ).rejects.toThrow(/already exists/);
  });

  it("verifies authorId references existing published profile", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    // Create an unpublished profile
    const unpublishedId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      return await ctx.db.insert("profiles", {
        userId,
        role: "member",
        profileStatus: "unlocked", // Not published
      });
    });

    await expect(
      adminCtx.mutation(api.articles.create, {
        title: "Invalid Author",
        slug: "invalid-author",
        content: "Content",
        authorId: unpublishedId,
      })
    ).rejects.toThrow(/Author profile must exist and be published/);
  });

  it("verifies all tagIds exist", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);
    const authorId = await createPublishedProfile(t);

    const deletedTagId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("tags", { name: "Temp", slug: "temp" });
      await ctx.db.delete(id);
      return id;
    });

    await expect(
      adminCtx.mutation(api.articles.create, {
        title: "Invalid Tags",
        slug: "invalid-tags",
        content: "Content",
        authorId,
        tags: [deletedTagId],
      })
    ).rejects.toThrow(/One or more tags do not exist/);
  });

  it("defaults publishedAt to now if not provided", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);
    const authorId = await createPublishedProfile(t);

    const beforeCreate = Date.now();

    const articleId = await adminCtx.mutation(api.articles.create, {
      title: "Default Date",
      slug: "default-date",
      content: "Content",
      authorId,
    });

    const afterCreate = Date.now();

    const article = await t.run(async (ctx) => {
      return await ctx.db.get(articleId);
    });

    expect(article?.publishedAt).toBeGreaterThanOrEqual(beforeCreate);
    expect(article?.publishedAt).toBeLessThanOrEqual(afterCreate);
  });
});

describe("articles.update mutation", () => {
  it("requires admin role", async () => {
    const t = convexTest(schema);
    const { t: guestCtx } = await setupGuestUser(t);
    const { profileId } = await createTestProfile(t);

    const articleId = await createTestArticle(t, profileId, {
      title: "Test",
      slug: "test",
    });

    await expect(
      guestCtx.mutation(api.articles.update, {
        id: articleId,
        title: "Updated",
      })
    ).rejects.toThrow(/Required role: admin/);
  });

  it("throws for unauthenticated user", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    const articleId = await createTestArticle(t, profileId, {
      title: "Test",
      slug: "test",
    });

    await expect(
      t.mutation(api.articles.update, {
        id: articleId,
        title: "Updated",
      })
    ).rejects.toThrow(/Authentication required/);
  });

  it("throws error for non-existent article", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);

    const deletedId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("articles", {
        title: "Temp",
        slug: "temp",
        content: "Content",
        authorId: profileId,
        publishedAt: Date.now(),
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(
      adminCtx.mutation(api.articles.update, {
        id: deletedId,
        title: "Updated",
      })
    ).rejects.toThrow(/Article not found/);
  });

  it("updates only provided fields", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);

    const articleId = await createTestArticle(t, profileId, {
      title: "Original Title",
      slug: "original-slug",
      content: "Original content",
      excerpt: "Original excerpt",
    });

    await adminCtx.mutation(api.articles.update, {
      id: articleId,
      title: "Updated Title",
    });

    const article = await t.run(async (ctx) => {
      return await ctx.db.get(articleId);
    });

    expect(article?.title).toBe("Updated Title");
    expect(article?.slug).toBe("original-slug"); // Unchanged
    expect(article?.content).toBe("Original content"); // Unchanged
    expect(article?.excerpt).toBe("Original excerpt"); // Unchanged
  });

  it("validates slug uniqueness when changed", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);

    await createTestArticle(t, profileId, {
      title: "First",
      slug: "first-article",
    });

    const secondId = await createTestArticle(t, profileId, {
      title: "Second",
      slug: "second-article",
    });

    await expect(
      adminCtx.mutation(api.articles.update, {
        id: secondId,
        slug: "first-article", // Already exists
      })
    ).rejects.toThrow(/already exists/);
  });

  it("allows updating to same slug (self)", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);

    const articleId = await createTestArticle(t, profileId, {
      title: "My Article",
      slug: "my-article",
    });

    // Should not throw when updating to same slug
    const result = await adminCtx.mutation(api.articles.update, {
      id: articleId,
      slug: "my-article",
      title: "Updated Title",
    });

    expect(result).toBeNull();
  });

  it("validates slug format when changed", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);

    const articleId = await createTestArticle(t, profileId, {
      title: "Test",
      slug: "test-article",
    });

    await expect(
      adminCtx.mutation(api.articles.update, {
        id: articleId,
        slug: "INVALID SLUG",
      })
    ).rejects.toThrow(/Invalid slug format/);
  });

  it("verifies authorId if changed", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);

    const articleId = await createTestArticle(t, profileId, {
      title: "Test",
      slug: "test-article",
    });

    // Create an unpublished profile
    const unpublishedId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      return await ctx.db.insert("profiles", {
        userId,
        role: "member",
        profileStatus: "unlocked",
      });
    });

    await expect(
      adminCtx.mutation(api.articles.update, {
        id: articleId,
        authorId: unpublishedId,
      })
    ).rejects.toThrow(/Author profile must exist and be published/);
  });

  it("verifies tagIds if changed", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);

    const articleId = await createTestArticle(t, profileId, {
      title: "Test",
      slug: "test-article",
    });

    const deletedTagId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("tags", { name: "Temp", slug: "temp" });
      await ctx.db.delete(id);
      return id;
    });

    await expect(
      adminCtx.mutation(api.articles.update, {
        id: articleId,
        tags: [deletedTagId],
      })
    ).rejects.toThrow(/One or more tags do not exist/);
  });

  it("can update all fields at once", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);
    const authorId = await createPublishedProfile(t);
    const tagId = await createTestTag(t, "New Tag", "new-tag");
    const newPublishedAt = Date.now() - 86400000;

    const articleId = await createTestArticle(t, profileId, {
      title: "Original",
      slug: "original",
    });

    await adminCtx.mutation(api.articles.update, {
      id: articleId,
      title: "Updated Title",
      slug: "updated-slug",
      content: "Updated content",
      authorId,
      excerpt: "Updated excerpt",
      tags: [tagId],
      isFeatured: true,
      substackUrl: "https://updated.substack.com/p/post",
      publishedAt: newPublishedAt,
    });

    const article = await t.run(async (ctx) => {
      return await ctx.db.get(articleId);
    });

    expect(article?.title).toBe("Updated Title");
    expect(article?.slug).toBe("updated-slug");
    expect(article?.content).toBe("Updated content");
    expect(article?.authorId).toBe(authorId);
    expect(article?.excerpt).toBe("Updated excerpt");
    expect(article?.tags).toEqual([tagId]);
    expect(article?.isFeatured).toBe(true);
    expect(article?.substackUrl).toBe("https://updated.substack.com/p/post");
    expect(article?.publishedAt).toBe(newPublishedAt);
  });
});

describe("articles.remove mutation", () => {
  it("requires admin role", async () => {
    const t = convexTest(schema);
    const { t: guestCtx } = await setupGuestUser(t);
    const { profileId } = await createTestProfile(t);

    const articleId = await createTestArticle(t, profileId, {
      title: "Test",
      slug: "test",
    });

    await expect(
      guestCtx.mutation(api.articles.remove, { id: articleId })
    ).rejects.toThrow(/Required role: admin/);
  });

  it("throws for unauthenticated user", async () => {
    const t = convexTest(schema);
    const { profileId } = await createTestProfile(t);

    const articleId = await createTestArticle(t, profileId, {
      title: "Test",
      slug: "test",
    });

    await expect(
      t.mutation(api.articles.remove, { id: articleId })
    ).rejects.toThrow(/Authentication required/);
  });

  it("throws error for non-existent article", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);

    const deletedId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("articles", {
        title: "Temp",
        slug: "temp",
        content: "Content",
        authorId: profileId,
        publishedAt: Date.now(),
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(
      adminCtx.mutation(api.articles.remove, { id: deletedId })
    ).rejects.toThrow(/Article not found/);
  });

  it("deletes article by id", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);

    const articleId = await createTestArticle(t, profileId, {
      title: "To Delete",
      slug: "to-delete",
    });

    const result = await adminCtx.mutation(api.articles.remove, {
      id: articleId,
    });

    expect(result).toBeNull();

    const article = await t.run(async (ctx) => {
      return await ctx.db.get(articleId);
    });

    expect(article).toBeNull();
  });

  it("returns null on successful deletion", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);

    const articleId = await createTestArticle(t, profileId, {
      title: "To Delete",
      slug: "to-delete",
    });

    const result = await adminCtx.mutation(api.articles.remove, {
      id: articleId,
    });

    expect(result).toBeNull();
  });
});
