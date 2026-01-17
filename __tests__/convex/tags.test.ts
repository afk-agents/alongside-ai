import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import { generateSlug, validateSlug } from "@/convex/tags";
import { api } from "@/convex/_generated/api";
import schema from "@/convex/schema";

describe("generateSlug", () => {
  it("converts name to lowercase", () => {
    expect(generateSlug("LangChain")).toBe("langchain");
  });

  it("replaces spaces with hyphens", () => {
    expect(generateSlug("Vector Databases")).toBe("vector-databases");
  });

  it("replaces multiple spaces with single hyphen", () => {
    expect(generateSlug("Machine   Learning")).toBe("machine-learning");
  });

  it("removes special characters", () => {
    expect(generateSlug("C++ Programming!")).toBe("c-programming");
  });

  it("removes leading and trailing hyphens", () => {
    expect(generateSlug("  Test Topic  ")).toBe("test-topic");
  });

  it("handles multiple consecutive special characters", () => {
    expect(generateSlug("AI & ML")).toBe("ai-ml");
  });

  it("truncates to max 50 characters", () => {
    const longName = "This Is A Very Long Tag Name That Should Be Truncated Because It Exceeds Fifty Characters";
    const result = generateSlug(longName);
    expect(result.length).toBeLessThanOrEqual(50);
    expect(result.endsWith("-")).toBe(false);
  });

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("handles numbers", () => {
    expect(generateSlug("Web3 Development")).toBe("web3-development");
  });

  it("collapses multiple hyphens into one", () => {
    expect(generateSlug("AI---ML")).toBe("ai-ml");
  });
});

describe("validateSlug", () => {
  it("returns true for valid simple slug", () => {
    expect(validateSlug("langchain")).toBe(true);
  });

  it("returns true for slug with hyphens", () => {
    expect(validateSlug("vector-databases")).toBe(true);
  });

  it("returns true for slug with numbers", () => {
    expect(validateSlug("web3")).toBe(true);
  });

  it("returns true for minimum length slug (2 chars)", () => {
    expect(validateSlug("ai")).toBe(true);
  });

  it("returns true for maximum length slug (50 chars)", () => {
    const slug = "a".repeat(50);
    expect(validateSlug(slug)).toBe(true);
  });

  it("returns false for single character slug", () => {
    expect(validateSlug("a")).toBe(false);
  });

  it("returns false for slug longer than 50 chars", () => {
    const slug = "a".repeat(51);
    expect(validateSlug(slug)).toBe(false);
  });

  it("returns false for uppercase letters", () => {
    expect(validateSlug("LangChain")).toBe(false);
  });

  it("returns false for special characters", () => {
    expect(validateSlug("c++")).toBe(false);
  });

  it("returns false for spaces", () => {
    expect(validateSlug("machine learning")).toBe(false);
  });

  it("returns false for leading hyphen", () => {
    expect(validateSlug("-langchain")).toBe(false);
  });

  it("returns false for trailing hyphen", () => {
    expect(validateSlug("langchain-")).toBe(false);
  });

  it("returns false for consecutive hyphens", () => {
    expect(validateSlug("ai--ml")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(validateSlug("")).toBe(false);
  });
});

// Type alias for the test context
type TestContext = ReturnType<typeof convexTest>;

describe("tags.getBySlug query", () => {
  it("returns tag when slug exists", async () => {
    const t = convexTest(schema);

    // Create a tag directly in the database
    const tagId = await t.run(async (ctx) => {
      return await ctx.db.insert("tags", {
        name: "LangChain",
        slug: "langchain",
        description: "Framework for LLM applications",
      });
    });

    const tag = await t.query(api.tags.getBySlug, { slug: "langchain" });

    expect(tag).not.toBeNull();
    expect(tag?._id).toBe(tagId);
    expect(tag?.name).toBe("LangChain");
    expect(tag?.slug).toBe("langchain");
    expect(tag?.description).toBe("Framework for LLM applications");
    expect(tag?._creationTime).toBeDefined();
  });

  it("returns null when slug does not exist", async () => {
    const t = convexTest(schema);

    const tag = await t.query(api.tags.getBySlug, { slug: "nonexistent" });

    expect(tag).toBeNull();
  });

  it("returns tag without description when description is not set", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      return await ctx.db.insert("tags", {
        name: "RAG",
        slug: "rag",
      });
    });

    const tag = await t.query(api.tags.getBySlug, { slug: "rag" });

    expect(tag).not.toBeNull();
    expect(tag?.name).toBe("RAG");
    expect(tag?.description).toBeUndefined();
  });
});

describe("tags.getByIds query", () => {
  it("returns tags for given IDs", async () => {
    const t = convexTest(schema);

    // Create multiple tags
    const { tagId1, tagId2 } = await t.run(async (ctx) => {
      const tagId1 = await ctx.db.insert("tags", {
        name: "LangChain",
        slug: "langchain",
      });
      const tagId2 = await ctx.db.insert("tags", {
        name: "RAG",
        slug: "rag",
      });
      return { tagId1, tagId2 };
    });

    const tags = await t.query(api.tags.getByIds, { tagIds: [tagId1, tagId2] });

    expect(tags).toHaveLength(2);
    expect(tags.find((t) => t._id === tagId1)).toMatchObject({
      _id: tagId1,
      name: "LangChain",
      slug: "langchain",
    });
    expect(tags.find((t) => t._id === tagId2)).toMatchObject({
      _id: tagId2,
      name: "RAG",
      slug: "rag",
    });
  });

  it("returns empty array when no IDs provided", async () => {
    const t = convexTest(schema);

    const tags = await t.query(api.tags.getByIds, { tagIds: [] });

    expect(tags).toEqual([]);
  });

  it("returns empty array when none of the IDs exist", async () => {
    const t = convexTest(schema);

    // Create a tag to get a valid ID format, then delete it
    const deletedId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("tags", {
        name: "Temporary",
        slug: "temporary",
      });
      await ctx.db.delete(id);
      return id;
    });

    const tags = await t.query(api.tags.getByIds, { tagIds: [deletedId] });

    expect(tags).toEqual([]);
  });

  it("returns only existing tags when some IDs are invalid", async () => {
    const t = convexTest(schema);

    // Create one valid tag and get a deleted ID
    const { validId, deletedId } = await t.run(async (ctx) => {
      const validId = await ctx.db.insert("tags", {
        name: "Valid Tag",
        slug: "valid-tag",
      });
      const deletedId = await ctx.db.insert("tags", {
        name: "Temporary",
        slug: "temporary",
      });
      await ctx.db.delete(deletedId);
      return { validId, deletedId };
    });

    const tags = await t.query(api.tags.getByIds, { tagIds: [validId, deletedId] });

    expect(tags).toHaveLength(1);
    expect(tags[0]._id).toBe(validId);
    expect(tags[0].name).toBe("Valid Tag");
  });
});

describe("tags.getContentByTagId query", () => {
  it("returns empty arrays when tag has no content", async () => {
    const t = convexTest(schema);

    // Create a tag
    const tagId = await t.run(async (ctx) => {
      return await ctx.db.insert("tags", {
        name: "Empty Tag",
        slug: "empty-tag",
      });
    });

    const result = await t.query(api.tags.getContentByTagId, { tagId });

    expect(result.events).toEqual([]);
    expect(result.projects).toEqual([]);
    expect(result.experiments).toEqual([]);
    expect(result.articles).toEqual([]);
    expect(result.videos).toEqual([]);
  });

  it("returns events that have the tag and are not archived", async () => {
    const t = convexTest(schema);

    // Create a tag and events
    const { tagId } = await t.run(async (ctx) => {
      const tagId = await ctx.db.insert("tags", {
        name: "LangChain",
        slug: "langchain",
      });

      // Create event with the tag (not archived)
      await ctx.db.insert("events", {
        title: "LangChain Workshop",
        slug: "langchain-workshop",
        description: "Learn LangChain",
        date: Date.now() + 86400000, // Tomorrow
        timezone: "America/New_York",
        location: "Virtual",
        isVirtual: true,
        priceInCents: 0,
        tags: [tagId],
      });

      // Create archived event with the tag (should be filtered out)
      await ctx.db.insert("events", {
        title: "Old LangChain Event",
        slug: "old-langchain-event",
        description: "Old event",
        date: Date.now() - 86400000, // Yesterday
        timezone: "America/New_York",
        location: "Virtual",
        isVirtual: true,
        priceInCents: 0,
        tags: [tagId],
        isArchived: true,
      });

      return { tagId };
    });

    const result = await t.query(api.tags.getContentByTagId, { tagId });

    expect(result.events).toHaveLength(1);
    expect(result.events[0].title).toBe("LangChain Workshop");
    expect(result.events[0].slug).toBe("langchain-workshop");
    expect(result.events[0]).toHaveProperty("date");
    expect(result.events[0]).toHaveProperty("isVirtual");
  });

  it("returns published projects with the tag", async () => {
    const t = convexTest(schema);

    const { tagId } = await t.run(async (ctx) => {
      const tagId = await ctx.db.insert("tags", {
        name: "RAG",
        slug: "rag",
      });

      // Create a profile for authorId
      const userId = await ctx.db.insert("users", {});
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "member",
        profileStatus: "published",
      });

      // Create published project with the tag
      await ctx.db.insert("projects", {
        title: "RAG Implementation",
        slug: "rag-implementation",
        description: "A RAG project",
        authorId: profileId,
        isPublished: true,
        tags: [tagId],
      });

      // Create unpublished project with the tag (should be filtered out)
      await ctx.db.insert("projects", {
        title: "Draft RAG Project",
        slug: "draft-rag-project",
        description: "Draft project",
        authorId: profileId,
        isPublished: false,
        tags: [tagId],
      });

      return { tagId };
    });

    const result = await t.query(api.tags.getContentByTagId, { tagId });

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].title).toBe("RAG Implementation");
    expect(result.projects[0].slug).toBe("rag-implementation");
    expect(result.projects[0]).toHaveProperty("description");
  });

  it("returns published experiments with the tag", async () => {
    const t = convexTest(schema);

    const { tagId } = await t.run(async (ctx) => {
      const tagId = await ctx.db.insert("tags", {
        name: "Agents",
        slug: "agents",
      });

      const userId = await ctx.db.insert("users", {});
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "member",
        profileStatus: "published",
      });

      // Create published experiment with the tag
      await ctx.db.insert("experiments", {
        title: "Agent Framework Experiment",
        slug: "agent-framework-experiment",
        description: "Testing agents",
        authorId: profileId,
        isPublished: true,
        status: "exploring",
        tags: [tagId],
      });

      // Create unpublished experiment (should be filtered out)
      await ctx.db.insert("experiments", {
        title: "Draft Experiment",
        slug: "draft-experiment",
        description: "Draft",
        authorId: profileId,
        isPublished: false,
        status: "exploring",
        tags: [tagId],
      });

      return { tagId };
    });

    const result = await t.query(api.tags.getContentByTagId, { tagId });

    expect(result.experiments).toHaveLength(1);
    expect(result.experiments[0].title).toBe("Agent Framework Experiment");
    expect(result.experiments[0].slug).toBe("agent-framework-experiment");
    expect(result.experiments[0]).toHaveProperty("status");
  });

  it("returns articles with the tag ordered by publishedAt desc", async () => {
    const t = convexTest(schema);

    const { tagId } = await t.run(async (ctx) => {
      const tagId = await ctx.db.insert("tags", {
        name: "Data Engineering",
        slug: "data-engineering",
      });

      const userId = await ctx.db.insert("users", {});
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "member",
        profileStatus: "published",
      });

      // Create articles with different publishedAt times
      await ctx.db.insert("articles", {
        title: "Older Article",
        slug: "older-article",
        content: "Content",
        authorId: profileId,
        publishedAt: Date.now() - 86400000, // Yesterday
        tags: [tagId],
      });

      await ctx.db.insert("articles", {
        title: "Newer Article",
        slug: "newer-article",
        content: "Content",
        authorId: profileId,
        publishedAt: Date.now(), // Now
        tags: [tagId],
      });

      return { tagId };
    });

    const result = await t.query(api.tags.getContentByTagId, { tagId });

    expect(result.articles).toHaveLength(2);
    // Should be ordered by publishedAt desc (newer first)
    expect(result.articles[0].title).toBe("Newer Article");
    expect(result.articles[1].title).toBe("Older Article");
    expect(result.articles[0]).toHaveProperty("publishedAt");
  });

  it("returns published videos with the tag", async () => {
    const t = convexTest(schema);

    const { tagId } = await t.run(async (ctx) => {
      const tagId = await ctx.db.insert("tags", {
        name: "PostgreSQL",
        slug: "postgresql",
      });

      const userId = await ctx.db.insert("users", {});
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "member",
        profileStatus: "published",
      });

      // Create published video with the tag
      await ctx.db.insert("videos", {
        title: "PostgreSQL Tutorial",
        slug: "postgresql-tutorial",
        youtubeId: "abc123",
        authorId: profileId,
        isPublished: true,
        tags: [tagId],
      });

      // Create unpublished video (should be filtered out)
      await ctx.db.insert("videos", {
        title: "Draft Video",
        slug: "draft-video",
        youtubeId: "xyz789",
        authorId: profileId,
        isPublished: false,
        tags: [tagId],
      });

      return { tagId };
    });

    const result = await t.query(api.tags.getContentByTagId, { tagId });

    expect(result.videos).toHaveLength(1);
    expect(result.videos[0].title).toBe("PostgreSQL Tutorial");
    expect(result.videos[0].slug).toBe("postgresql-tutorial");
    expect(result.videos[0]).toHaveProperty("youtubeId");
  });

  it("returns content from multiple types for the same tag", async () => {
    const t = convexTest(schema);

    const { tagId } = await t.run(async (ctx) => {
      const tagId = await ctx.db.insert("tags", {
        name: "AI",
        slug: "ai",
      });

      const userId = await ctx.db.insert("users", {});
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "member",
        profileStatus: "published",
      });

      // Create one of each content type with the tag
      await ctx.db.insert("events", {
        title: "AI Conference",
        slug: "ai-conference",
        description: "Annual AI conference",
        date: Date.now() + 86400000,
        timezone: "America/New_York",
        location: "Virtual",
        isVirtual: true,
        priceInCents: 0,
        tags: [tagId],
      });

      await ctx.db.insert("projects", {
        title: "AI Project",
        slug: "ai-project",
        description: "An AI project",
        authorId: profileId,
        isPublished: true,
        tags: [tagId],
      });

      await ctx.db.insert("experiments", {
        title: "AI Experiment",
        slug: "ai-experiment",
        description: "Testing AI",
        authorId: profileId,
        isPublished: true,
        status: "prototyping",
        tags: [tagId],
      });

      await ctx.db.insert("articles", {
        title: "AI Article",
        slug: "ai-article",
        content: "AI content",
        authorId: profileId,
        publishedAt: Date.now(),
        tags: [tagId],
      });

      await ctx.db.insert("videos", {
        title: "AI Video",
        slug: "ai-video",
        youtubeId: "ai123",
        authorId: profileId,
        isPublished: true,
        tags: [tagId],
      });

      return { tagId };
    });

    const result = await t.query(api.tags.getContentByTagId, { tagId });

    expect(result.events).toHaveLength(1);
    expect(result.projects).toHaveLength(1);
    expect(result.experiments).toHaveLength(1);
    expect(result.articles).toHaveLength(1);
    expect(result.videos).toHaveLength(1);
  });

  it("does not return content without the tag", async () => {
    const t = convexTest(schema);

    const { tagId } = await t.run(async (ctx) => {
      const tagId = await ctx.db.insert("tags", {
        name: "TargetTag",
        slug: "target-tag",
      });

      const otherTagId = await ctx.db.insert("tags", {
        name: "OtherTag",
        slug: "other-tag",
      });

      const userId = await ctx.db.insert("users", {});
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "member",
        profileStatus: "published",
      });

      // Create project with target tag
      await ctx.db.insert("projects", {
        title: "Tagged Project",
        slug: "tagged-project",
        description: "Has target tag",
        authorId: profileId,
        isPublished: true,
        tags: [tagId],
      });

      // Create project with different tag (should not appear)
      await ctx.db.insert("projects", {
        title: "Other Project",
        slug: "other-project",
        description: "Has other tag",
        authorId: profileId,
        isPublished: true,
        tags: [otherTagId],
      });

      // Create project with no tags (should not appear)
      await ctx.db.insert("projects", {
        title: "Untagged Project",
        slug: "untagged-project",
        description: "No tags",
        authorId: profileId,
        isPublished: true,
      });

      return { tagId };
    });

    const result = await t.query(api.tags.getContentByTagId, { tagId });

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].title).toBe("Tagged Project");
  });

  it("orders events by date descending", async () => {
    const t = convexTest(schema);

    const { tagId } = await t.run(async (ctx) => {
      const tagId = await ctx.db.insert("tags", {
        name: "Workshop",
        slug: "workshop",
      });

      // Create events with different dates
      await ctx.db.insert("events", {
        title: "Earlier Event",
        slug: "earlier-event",
        description: "Earlier",
        date: Date.now() + 86400000, // Tomorrow
        timezone: "America/New_York",
        location: "Virtual",
        isVirtual: true,
        priceInCents: 0,
        tags: [tagId],
      });

      await ctx.db.insert("events", {
        title: "Later Event",
        slug: "later-event",
        description: "Later",
        date: Date.now() + 172800000, // Day after tomorrow
        timezone: "America/New_York",
        location: "Virtual",
        isVirtual: true,
        priceInCents: 0,
        tags: [tagId],
      });

      return { tagId };
    });

    const result = await t.query(api.tags.getContentByTagId, { tagId });

    expect(result.events).toHaveLength(2);
    // Should be ordered by date desc (later first)
    expect(result.events[0].title).toBe("Later Event");
    expect(result.events[1].title).toBe("Earlier Event");
  });
});

describe("tags.list query", () => {
  it("returns empty array when no tags exist", async () => {
    const t = convexTest(schema);

    const tags = await t.query(api.tags.list, {});

    expect(tags).toEqual([]);
  });

  it("returns all tags sorted alphabetically by name (case-insensitive)", async () => {
    const t = convexTest(schema);

    // Create tags in non-alphabetical order
    await t.run(async (ctx) => {
      await ctx.db.insert("tags", {
        name: "Zebra",
        slug: "zebra",
      });
      await ctx.db.insert("tags", {
        name: "alpha",
        slug: "alpha",
      });
      await ctx.db.insert("tags", {
        name: "Beta",
        slug: "beta",
      });
    });

    const tags = await t.query(api.tags.list, {});

    expect(tags).toHaveLength(3);
    expect(tags[0].name).toBe("alpha");
    expect(tags[1].name).toBe("Beta");
    expect(tags[2].name).toBe("Zebra");
  });

  it("returns tags with correct shape including contentCount", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      await ctx.db.insert("tags", {
        name: "LangChain",
        slug: "langchain",
        description: "Framework for LLM applications",
      });
    });

    const tags = await t.query(api.tags.list, {});

    expect(tags).toHaveLength(1);
    expect(tags[0]).toHaveProperty("_id");
    expect(tags[0]).toHaveProperty("_creationTime");
    expect(tags[0]).toHaveProperty("name", "LangChain");
    expect(tags[0]).toHaveProperty("slug", "langchain");
    expect(tags[0]).toHaveProperty("description", "Framework for LLM applications");
    expect(tags[0]).toHaveProperty("contentCount");
    expect(typeof tags[0].contentCount).toBe("number");
  });

  it("returns contentCount of 0 for tag with no content", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      await ctx.db.insert("tags", {
        name: "Empty Tag",
        slug: "empty-tag",
      });
    });

    const tags = await t.query(api.tags.list, {});

    expect(tags).toHaveLength(1);
    expect(tags[0].contentCount).toBe(0);
  });

  it("counts published content across all content types", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      const tagId = await ctx.db.insert("tags", {
        name: "AI",
        slug: "ai",
      });

      const userId = await ctx.db.insert("users", {});
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "member",
        profileStatus: "published",
      });

      // Create one of each published content type with the tag
      await ctx.db.insert("events", {
        title: "AI Conference",
        slug: "ai-conference",
        description: "Annual AI conference",
        date: Date.now() + 86400000,
        timezone: "America/New_York",
        location: "Virtual",
        isVirtual: true,
        priceInCents: 0,
        tags: [tagId],
      });

      await ctx.db.insert("projects", {
        title: "AI Project",
        slug: "ai-project",
        description: "An AI project",
        authorId: profileId,
        isPublished: true,
        tags: [tagId],
      });

      await ctx.db.insert("experiments", {
        title: "AI Experiment",
        slug: "ai-experiment",
        description: "Testing AI",
        authorId: profileId,
        isPublished: true,
        status: "prototyping",
        tags: [tagId],
      });

      await ctx.db.insert("articles", {
        title: "AI Article",
        slug: "ai-article",
        content: "AI content",
        authorId: profileId,
        publishedAt: Date.now(),
        tags: [tagId],
      });

      await ctx.db.insert("videos", {
        title: "AI Video",
        slug: "ai-video",
        youtubeId: "ai123",
        authorId: profileId,
        isPublished: true,
        tags: [tagId],
      });
    });

    const tags = await t.query(api.tags.list, {});

    expect(tags).toHaveLength(1);
    expect(tags[0].contentCount).toBe(5);
  });

  it("does not count unpublished content", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      const tagId = await ctx.db.insert("tags", {
        name: "Draft",
        slug: "draft",
      });

      const userId = await ctx.db.insert("users", {});
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "member",
        profileStatus: "published",
      });

      // Create published project (should count)
      await ctx.db.insert("projects", {
        title: "Published Project",
        slug: "published-project",
        description: "Published",
        authorId: profileId,
        isPublished: true,
        tags: [tagId],
      });

      // Create unpublished project (should NOT count)
      await ctx.db.insert("projects", {
        title: "Draft Project",
        slug: "draft-project",
        description: "Draft",
        authorId: profileId,
        isPublished: false,
        tags: [tagId],
      });

      // Create unpublished experiment (should NOT count)
      await ctx.db.insert("experiments", {
        title: "Draft Experiment",
        slug: "draft-experiment",
        description: "Draft",
        authorId: profileId,
        isPublished: false,
        status: "exploring",
        tags: [tagId],
      });

      // Create unpublished video (should NOT count)
      await ctx.db.insert("videos", {
        title: "Draft Video",
        slug: "draft-video",
        youtubeId: "draft123",
        authorId: profileId,
        isPublished: false,
        tags: [tagId],
      });
    });

    const tags = await t.query(api.tags.list, {});

    expect(tags).toHaveLength(1);
    expect(tags[0].contentCount).toBe(1); // Only the published project
  });

  it("does not count archived events", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      const tagId = await ctx.db.insert("tags", {
        name: "Events",
        slug: "events",
      });

      // Create non-archived event (should count)
      await ctx.db.insert("events", {
        title: "Active Event",
        slug: "active-event",
        description: "Active",
        date: Date.now() + 86400000,
        timezone: "America/New_York",
        location: "Virtual",
        isVirtual: true,
        priceInCents: 0,
        tags: [tagId],
      });

      // Create archived event (should NOT count)
      await ctx.db.insert("events", {
        title: "Archived Event",
        slug: "archived-event",
        description: "Archived",
        date: Date.now() - 86400000,
        timezone: "America/New_York",
        location: "Virtual",
        isVirtual: true,
        priceInCents: 0,
        tags: [tagId],
        isArchived: true,
      });
    });

    const tags = await t.query(api.tags.list, {});

    expect(tags).toHaveLength(1);
    expect(tags[0].contentCount).toBe(1); // Only the active event
  });

  it("returns correct counts for multiple tags", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      const tagAI = await ctx.db.insert("tags", {
        name: "AI",
        slug: "ai",
      });
      const tagML = await ctx.db.insert("tags", {
        name: "ML",
        slug: "ml",
      });
      // Create a tag with no content (not assigned to any content)
      await ctx.db.insert("tags", {
        name: "Empty",
        slug: "empty",
      });

      const userId = await ctx.db.insert("users", {});
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "member",
        profileStatus: "published",
      });

      // Create content with different tags
      await ctx.db.insert("projects", {
        title: "AI Project",
        slug: "ai-project",
        description: "AI project",
        authorId: profileId,
        isPublished: true,
        tags: [tagAI],
      });

      await ctx.db.insert("projects", {
        title: "ML Project 1",
        slug: "ml-project-1",
        description: "ML project 1",
        authorId: profileId,
        isPublished: true,
        tags: [tagML],
      });

      await ctx.db.insert("projects", {
        title: "ML Project 2",
        slug: "ml-project-2",
        description: "ML project 2",
        authorId: profileId,
        isPublished: true,
        tags: [tagML],
      });

      await ctx.db.insert("articles", {
        title: "AI Article",
        slug: "ai-article",
        content: "AI content",
        authorId: profileId,
        publishedAt: Date.now(),
        tags: [tagAI],
      });
    });

    const tags = await t.query(api.tags.list, {});

    expect(tags).toHaveLength(3);
    // Should be alphabetically sorted: AI, Empty, ML
    expect(tags[0].name).toBe("AI");
    expect(tags[0].contentCount).toBe(2); // 1 project + 1 article

    expect(tags[1].name).toBe("Empty");
    expect(tags[1].contentCount).toBe(0);

    expect(tags[2].name).toBe("ML");
    expect(tags[2].contentCount).toBe(2); // 2 projects
  });

  it("returns tag without description when description is not set", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      await ctx.db.insert("tags", {
        name: "NoDesc",
        slug: "no-desc",
      });
    });

    const tags = await t.query(api.tags.list, {});

    expect(tags).toHaveLength(1);
    expect(tags[0].description).toBeUndefined();
  });
});

describe("tags.create mutation", () => {
  // Helper to create test context with admin user
  async function setupAdminUser(t: TestContext) {
    // Use run to directly manipulate the database
    const { userId, profileId } = await t.run(async (ctx) => {
      // Create a user
      const userId = await ctx.db.insert("users", {});

      // Create admin profile
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
      });

      return { userId, profileId };
    });

    // Return test context with identity set
    // Note: withIdentity sets ctx.auth.getUserIdentity() return value
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

  it("admin can create a tag with provided slug", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    const tagId = await adminCtx.mutation(api.tags.create, {
      name: "LangChain",
      slug: "langchain",
      description: "Framework for LLM applications",
    });

    expect(tagId).toBeDefined();

    // Verify tag was created
    const tag = await t.run(async (ctx) => {
      return await ctx.db.get(tagId);
    });

    expect(tag).toMatchObject({
      name: "LangChain",
      slug: "langchain",
      description: "Framework for LLM applications",
    });
  });

  it("auto-generates slug from name when not provided", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    const tagId = await adminCtx.mutation(api.tags.create, {
      name: "Vector Databases",
    });

    const tag = await t.run(async (ctx) => {
      return await ctx.db.get(tagId);
    });

    expect(tag?.slug).toBe("vector-databases");
  });

  it("rejects duplicate slug", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    // Create first tag
    await adminCtx.mutation(api.tags.create, {
      name: "LangChain",
      slug: "langchain",
    });

    // Try to create second tag with same slug
    await expect(
      adminCtx.mutation(api.tags.create, {
        name: "LangChain Framework",
        slug: "langchain",
      })
    ).rejects.toThrow(/already exists/);
  });

  it("non-admin throws AuthorizationError", async () => {
    const t = convexTest(schema);
    const { t: guestCtx } = await setupGuestUser(t);

    await expect(
      guestCtx.mutation(api.tags.create, {
        name: "Test Tag",
      })
    ).rejects.toThrow(/Required role: admin/);
  });

  it("unauthenticated user throws AuthenticationError", async () => {
    const t = convexTest(schema);

    await expect(
      t.mutation(api.tags.create, {
        name: "Test Tag",
      })
    ).rejects.toThrow(/Authentication required/);
  });

  it("rejects invalid slug format", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    await expect(
      adminCtx.mutation(api.tags.create, {
        name: "Test",
        slug: "UPPERCASE",
      })
    ).rejects.toThrow(/Invalid slug format/);
  });
});

describe("tags.update mutation", () => {
  // Helper to create test context with admin user
  async function setupAdminUser(t: TestContext) {
    const { userId, profileId } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
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

  it("admin can update tag name and preserve existing description", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    // Create a tag
    const tagId = await t.run(async (ctx) => {
      return await ctx.db.insert("tags", {
        name: "Original Name",
        slug: "original-slug",
        description: "Original description",
      });
    });

    // Update the tag name and explicitly keep the description
    const result = await adminCtx.mutation(api.tags.update, {
      id: tagId,
      name: "Updated Name",
      description: "Original description",
    });

    expect(result).toBeNull();

    // Verify the update
    const tag = await t.run(async (ctx) => {
      return await ctx.db.get(tagId);
    });

    expect(tag?.name).toBe("Updated Name");
    expect(tag?.slug).toBe("original-slug"); // Slug should NOT change
    expect(tag?.description).toBe("Original description");
  });

  it("admin can update tag description", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    const tagId = await t.run(async (ctx) => {
      return await ctx.db.insert("tags", {
        name: "Test Tag",
        slug: "test-tag",
        description: "Original description",
      });
    });

    const result = await adminCtx.mutation(api.tags.update, {
      id: tagId,
      name: "Test Tag",
      description: "Updated description",
    });

    expect(result).toBeNull();

    const tag = await t.run(async (ctx) => {
      return await ctx.db.get(tagId);
    });

    expect(tag?.description).toBe("Updated description");
  });

  it("admin can update both name and description", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    const tagId = await t.run(async (ctx) => {
      return await ctx.db.insert("tags", {
        name: "Original",
        slug: "original",
        description: "Original desc",
      });
    });

    await adminCtx.mutation(api.tags.update, {
      id: tagId,
      name: "New Name",
      description: "New description",
    });

    const tag = await t.run(async (ctx) => {
      return await ctx.db.get(tagId);
    });

    expect(tag?.name).toBe("New Name");
    expect(tag?.description).toBe("New description");
    expect(tag?.slug).toBe("original"); // Slug immutable
  });

  it("preserves description when not provided in update", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    const tagId = await t.run(async (ctx) => {
      return await ctx.db.insert("tags", {
        name: "Test Tag",
        slug: "test-tag",
        description: "Has description",
      });
    });

    // When description is omitted (not passed), it should be preserved
    await adminCtx.mutation(api.tags.update, {
      id: tagId,
      name: "Updated Name",
    });

    const tag = await t.run(async (ctx) => {
      return await ctx.db.get(tagId);
    });

    // Description should be preserved when not provided
    expect(tag?.name).toBe("Updated Name");
    expect(tag?.description).toBe("Has description");
  });

  it("non-admin throws AuthorizationError", async () => {
    const t = convexTest(schema);
    const { t: guestCtx } = await setupGuestUser(t);

    const tagId = await t.run(async (ctx) => {
      return await ctx.db.insert("tags", {
        name: "Test Tag",
        slug: "test-tag",
      });
    });

    await expect(
      guestCtx.mutation(api.tags.update, {
        id: tagId,
        name: "Updated",
      })
    ).rejects.toThrow(/Required role: admin/);
  });

  it("unauthenticated user throws AuthenticationError", async () => {
    const t = convexTest(schema);

    const tagId = await t.run(async (ctx) => {
      return await ctx.db.insert("tags", {
        name: "Test Tag",
        slug: "test-tag",
      });
    });

    await expect(
      t.mutation(api.tags.update, {
        id: tagId,
        name: "Updated",
      })
    ).rejects.toThrow(/Authentication required/);
  });

  it("throws error when tag ID not found", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    // Create and delete a tag to get a valid but non-existent ID
    const deletedId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("tags", {
        name: "Temporary",
        slug: "temporary",
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(
      adminCtx.mutation(api.tags.update, {
        id: deletedId,
        name: "Updated",
      })
    ).rejects.toThrow(/Tag not found/);
  });

  it("slug remains immutable even if different name is provided", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    const tagId = await t.run(async (ctx) => {
      return await ctx.db.insert("tags", {
        name: "LangChain",
        slug: "langchain",
      });
    });

    // Update with a very different name
    await adminCtx.mutation(api.tags.update, {
      id: tagId,
      name: "LangChain Framework for Building LLM Applications",
    });

    const tag = await t.run(async (ctx) => {
      return await ctx.db.get(tagId);
    });

    // Name should update, but slug must remain unchanged
    expect(tag?.name).toBe("LangChain Framework for Building LLM Applications");
    expect(tag?.slug).toBe("langchain");
  });
});

describe("tags.remove mutation", () => {
  // Helper to create test context with admin user
  async function setupAdminUser(t: TestContext) {
    const { userId, profileId } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
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

  it("admin can delete a tag", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    // Create a tag
    const tagId = await t.run(async (ctx) => {
      return await ctx.db.insert("tags", {
        name: "To Be Deleted",
        slug: "to-be-deleted",
      });
    });

    // Delete the tag
    const result = await adminCtx.mutation(api.tags.remove, { id: tagId });

    expect(result).toBeNull();

    // Verify tag is deleted
    const tag = await t.run(async (ctx) => {
      return await ctx.db.get(tagId);
    });

    expect(tag).toBeNull();
  });

  it("removes tag reference from all content types when deleted", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);

    // Create a tag and assign it to various content types
    const { tagId, eventId, projectId, experimentId, articleId, videoId } =
      await t.run(async (ctx) => {
        const tagId = await ctx.db.insert("tags", {
          name: "To Remove",
          slug: "to-remove",
        });

        // Create content with the tag
        const eventId = await ctx.db.insert("events", {
          title: "Test Event",
          slug: "test-event",
          description: "Test",
          date: Date.now(),
          timezone: "America/New_York",
          location: "Virtual",
          isVirtual: true,
          priceInCents: 0,
          tags: [tagId],
        });

        const projectId = await ctx.db.insert("projects", {
          title: "Test Project",
          slug: "test-project",
          description: "Test",
          authorId: profileId,
          isPublished: true,
          tags: [tagId],
        });

        const experimentId = await ctx.db.insert("experiments", {
          title: "Test Experiment",
          slug: "test-experiment",
          description: "Test",
          authorId: profileId,
          isPublished: true,
          status: "exploring",
          tags: [tagId],
        });

        const articleId = await ctx.db.insert("articles", {
          title: "Test Article",
          slug: "test-article",
          content: "Test content",
          authorId: profileId,
          publishedAt: Date.now(),
          tags: [tagId],
        });

        const videoId = await ctx.db.insert("videos", {
          title: "Test Video",
          slug: "test-video",
          youtubeId: "abc123",
          authorId: profileId,
          isPublished: true,
          tags: [tagId],
        });

        return { tagId, eventId, projectId, experimentId, articleId, videoId };
      });

    // Delete the tag
    await adminCtx.mutation(api.tags.remove, { id: tagId });

    // Verify tag is removed from all content
    const contents = await t.run(async (ctx) => {
      return {
        event: await ctx.db.get(eventId),
        project: await ctx.db.get(projectId),
        experiment: await ctx.db.get(experimentId),
        article: await ctx.db.get(articleId),
        video: await ctx.db.get(videoId),
      };
    });

    // Tag should be removed from all content
    expect(contents.event?.tags).not.toContain(tagId);
    expect(contents.project?.tags).not.toContain(tagId);
    expect(contents.experiment?.tags).not.toContain(tagId);
    expect(contents.article?.tags).not.toContain(tagId);
    expect(contents.video?.tags).not.toContain(tagId);
  });

  it("preserves other tags when removing one tag from content", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);

    // Create two tags and assign both to a project
    const { tagToDelete, tagToKeep, projectId } = await t.run(async (ctx) => {
      const tagToDelete = await ctx.db.insert("tags", {
        name: "Delete Me",
        slug: "delete-me",
      });
      const tagToKeep = await ctx.db.insert("tags", {
        name: "Keep Me",
        slug: "keep-me",
      });

      const projectId = await ctx.db.insert("projects", {
        title: "Multi-Tag Project",
        slug: "multi-tag-project",
        description: "Has multiple tags",
        authorId: profileId,
        isPublished: true,
        tags: [tagToDelete, tagToKeep],
      });

      return { tagToDelete, tagToKeep, projectId };
    });

    // Delete one tag
    await adminCtx.mutation(api.tags.remove, { id: tagToDelete });

    // Verify only the deleted tag is removed
    const project = await t.run(async (ctx) => {
      return await ctx.db.get(projectId);
    });

    expect(project?.tags).toHaveLength(1);
    expect(project?.tags).toContain(tagToKeep);
    expect(project?.tags).not.toContain(tagToDelete);
  });

  it("handles content with no tags field gracefully", async () => {
    const t = convexTest(schema);
    const { t: adminCtx, profileId } = await setupAdminUser(t);

    // Create a tag and content without tags
    const { tagId, projectId } = await t.run(async (ctx) => {
      const tagId = await ctx.db.insert("tags", {
        name: "Orphan Tag",
        slug: "orphan-tag",
      });

      // Create project without tags field
      const projectId = await ctx.db.insert("projects", {
        title: "No Tags Project",
        slug: "no-tags-project",
        description: "Has no tags",
        authorId: profileId,
        isPublished: true,
      });

      return { tagId, projectId };
    });

    // Delete the tag - should not throw
    const result = await adminCtx.mutation(api.tags.remove, { id: tagId });
    expect(result).toBeNull();

    // Project should still exist unchanged
    const project = await t.run(async (ctx) => {
      return await ctx.db.get(projectId);
    });

    expect(project).not.toBeNull();
    expect(project?.tags).toBeUndefined();
  });

  it("non-admin throws AuthorizationError", async () => {
    const t = convexTest(schema);
    const { t: guestCtx } = await setupGuestUser(t);

    const tagId = await t.run(async (ctx) => {
      return await ctx.db.insert("tags", {
        name: "Test Tag",
        slug: "test-tag",
      });
    });

    await expect(
      guestCtx.mutation(api.tags.remove, { id: tagId })
    ).rejects.toThrow(/Required role: admin/);
  });

  it("unauthenticated user throws AuthenticationError", async () => {
    const t = convexTest(schema);

    const tagId = await t.run(async (ctx) => {
      return await ctx.db.insert("tags", {
        name: "Test Tag",
        slug: "test-tag",
      });
    });

    await expect(t.mutation(api.tags.remove, { id: tagId })).rejects.toThrow(
      /Authentication required/
    );
  });

  it("throws error when tag ID not found", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    // Create and delete a tag to get a valid but non-existent ID
    const deletedId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("tags", {
        name: "Temporary",
        slug: "temporary",
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(
      adminCtx.mutation(api.tags.remove, { id: deletedId })
    ).rejects.toThrow(/Tag not found/);
  });
});
