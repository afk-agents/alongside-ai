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
