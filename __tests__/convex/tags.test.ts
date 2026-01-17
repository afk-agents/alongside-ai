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
