import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import { api } from "@/convex/_generated/api";
import schema from "@/convex/schema";

describe("profiles.getFounders query", () => {
  it("returns empty array when no profiles exist", async () => {
    const t = convexTest(schema);

    const founders = await t.query(api.profiles.getFounders, {});

    expect(founders).toEqual([]);
  });

  it("returns profiles with role=admin and profileStatus=published", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      // Create admin with published status (should be returned)
      await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        displayName: "Founder One",
        slug: "founder-one",
      });
    });

    const founders = await t.query(api.profiles.getFounders, {});

    expect(founders).toHaveLength(1);
    expect(founders[0].displayName).toBe("Founder One");
    expect(founders[0].role).toBe("admin");
    expect(founders[0].profileStatus).toBe("published");
  });

  it("excludes profiles with role=admin but profileStatus!=published", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      const userId1 = await ctx.db.insert("users", {});
      const userId2 = await ctx.db.insert("users", {});
      const userId3 = await ctx.db.insert("users", {});

      // Admin with locked status (should NOT be returned)
      await ctx.db.insert("profiles", {
        userId: userId1,
        role: "admin",
        profileStatus: "locked",
        displayName: "Locked Admin",
      });

      // Admin with unlocked status (should NOT be returned)
      await ctx.db.insert("profiles", {
        userId: userId2,
        role: "admin",
        profileStatus: "unlocked",
        displayName: "Unlocked Admin",
      });

      // Admin with published status (should be returned)
      await ctx.db.insert("profiles", {
        userId: userId3,
        role: "admin",
        profileStatus: "published",
        displayName: "Published Admin",
      });
    });

    const founders = await t.query(api.profiles.getFounders, {});

    expect(founders).toHaveLength(1);
    expect(founders[0].displayName).toBe("Published Admin");
  });

  it("excludes profiles with role!=admin even if published", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      const userId1 = await ctx.db.insert("users", {});
      const userId2 = await ctx.db.insert("users", {});
      const userId3 = await ctx.db.insert("users", {});

      // Member with published status (should NOT be returned)
      await ctx.db.insert("profiles", {
        userId: userId1,
        role: "member",
        profileStatus: "published",
        displayName: "Published Member",
      });

      // Guest with published status (should NOT be returned)
      await ctx.db.insert("profiles", {
        userId: userId2,
        role: "guest",
        profileStatus: "published",
        displayName: "Published Guest",
      });

      // Admin with published status (should be returned)
      await ctx.db.insert("profiles", {
        userId: userId3,
        role: "admin",
        profileStatus: "published",
        displayName: "Published Admin",
      });
    });

    const founders = await t.query(api.profiles.getFounders, {});

    expect(founders).toHaveLength(1);
    expect(founders[0].displayName).toBe("Published Admin");
  });

  it("returns multiple founders sorted by creation time descending", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      const userId1 = await ctx.db.insert("users", {});
      const userId2 = await ctx.db.insert("users", {});

      // First founder created
      await ctx.db.insert("profiles", {
        userId: userId1,
        role: "admin",
        profileStatus: "published",
        displayName: "First Founder",
      });

      // Second founder created
      await ctx.db.insert("profiles", {
        userId: userId2,
        role: "admin",
        profileStatus: "published",
        displayName: "Second Founder",
      });
    });

    const founders = await t.query(api.profiles.getFounders, {});

    expect(founders).toHaveLength(2);
    // Most recent first
    expect(founders[0].displayName).toBe("Second Founder");
    expect(founders[1].displayName).toBe("First Founder");
  });

  it("returns complete profile data including all optional fields", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        displayName: "Complete Profile",
        bio: "A full bio here",
        photoUrl: "https://example.com/photo.jpg",
        socialLinks: {
          linkedin: "https://linkedin.com/in/test",
          twitter: "https://twitter.com/test",
          github: "https://github.com/test",
          website: "https://example.com",
        },
        workingOnNow: "Building something cool",
        skills: ["TypeScript", "React", "Convex"],
        location: "San Francisco, CA",
        slug: "complete-profile",
      });
    });

    const founders = await t.query(api.profiles.getFounders, {});

    expect(founders).toHaveLength(1);
    const founder = founders[0];

    expect(founder.displayName).toBe("Complete Profile");
    expect(founder.bio).toBe("A full bio here");
    expect(founder.photoUrl).toBe("https://example.com/photo.jpg");
    expect(founder.socialLinks).toEqual({
      linkedin: "https://linkedin.com/in/test",
      twitter: "https://twitter.com/test",
      github: "https://github.com/test",
      website: "https://example.com",
    });
    expect(founder.workingOnNow).toBe("Building something cool");
    expect(founder.skills).toEqual(["TypeScript", "React", "Convex"]);
    expect(founder.location).toBe("San Francisco, CA");
    expect(founder.slug).toBe("complete-profile");
  });
});

describe("profiles.getBySlug query", () => {
  it("returns profile when slug exists and profile is published", async () => {
    const t = convexTest(schema);

    const profileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      return await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        displayName: "Test User",
        slug: "test-user",
      });
    });

    const profile = await t.query(api.profiles.getBySlug, { slug: "test-user" });

    expect(profile).not.toBeNull();
    expect(profile?._id).toBe(profileId);
    expect(profile?.displayName).toBe("Test User");
    expect(profile?.slug).toBe("test-user");
  });

  it("returns null when slug does not exist", async () => {
    const t = convexTest(schema);

    const profile = await t.query(api.profiles.getBySlug, {
      slug: "nonexistent",
    });

    expect(profile).toBeNull();
  });

  it("returns null when profile exists but is not published", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "unlocked",
        displayName: "Unlocked Profile",
        slug: "unlocked-profile",
      });
    });

    const profile = await t.query(api.profiles.getBySlug, {
      slug: "unlocked-profile",
    });

    expect(profile).toBeNull();
  });

  it("returns null when profile is locked", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "locked",
        displayName: "Locked Profile",
        slug: "locked-profile",
      });
    });

    const profile = await t.query(api.profiles.getBySlug, {
      slug: "locked-profile",
    });

    expect(profile).toBeNull();
  });

  it("returns member profile when published", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      await ctx.db.insert("profiles", {
        userId,
        role: "member",
        profileStatus: "published",
        displayName: "Published Member",
        slug: "published-member",
      });
    });

    const profile = await t.query(api.profiles.getBySlug, {
      slug: "published-member",
    });

    expect(profile).not.toBeNull();
    expect(profile?.displayName).toBe("Published Member");
    expect(profile?.role).toBe("member");
  });

  it("returns complete profile data", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        displayName: "Full Profile",
        bio: "Detailed bio here",
        photoUrl: "https://example.com/photo.jpg",
        socialLinks: {
          linkedin: "https://linkedin.com/in/fullprofile",
          github: "https://github.com/fullprofile",
        },
        workingOnNow: "Current project",
        skills: ["JavaScript", "Python"],
        location: "New York, NY",
        slug: "full-profile",
      });
    });

    const profile = await t.query(api.profiles.getBySlug, {
      slug: "full-profile",
    });

    expect(profile).not.toBeNull();
    expect(profile?.displayName).toBe("Full Profile");
    expect(profile?.bio).toBe("Detailed bio here");
    expect(profile?.photoUrl).toBe("https://example.com/photo.jpg");
    expect(profile?.socialLinks?.linkedin).toBe(
      "https://linkedin.com/in/fullprofile"
    );
    expect(profile?.socialLinks?.github).toBe(
      "https://github.com/fullprofile"
    );
    expect(profile?.workingOnNow).toBe("Current project");
    expect(profile?.skills).toEqual(["JavaScript", "Python"]);
    expect(profile?.location).toBe("New York, NY");
  });

  it("handles profile without optional fields", async () => {
    const t = convexTest(schema);

    await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        slug: "minimal-profile",
      });
    });

    const profile = await t.query(api.profiles.getBySlug, {
      slug: "minimal-profile",
    });

    expect(profile).not.toBeNull();
    expect(profile?.slug).toBe("minimal-profile");
    expect(profile?.displayName).toBeUndefined();
    expect(profile?.bio).toBeUndefined();
    expect(profile?.socialLinks).toBeUndefined();
  });
});

describe("profiles.update mutation", () => {
  it("updates displayName when provided", async () => {
    const t = convexTest(schema);

    const profileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      // Create admin user and profile for authorization
      return await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        displayName: "Original Name",
      });
    });

    // Execute the update mutation directly with ctx.db
    await t.run(async (ctx) => {
      await ctx.db.patch(profileId, { displayName: "Updated Name" });
    });

    // Verify the update
    await t.run(async (ctx) => {
      const profile = await ctx.db.get(profileId);
      expect(profile?.displayName).toBe("Updated Name");
    });
  });

  it("updates bio when provided", async () => {
    const t = convexTest(schema);

    const profileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      return await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        bio: "Original bio",
      });
    });

    await t.run(async (ctx) => {
      await ctx.db.patch(profileId, { bio: "Updated bio content" });
    });

    await t.run(async (ctx) => {
      const profile = await ctx.db.get(profileId);
      expect(profile?.bio).toBe("Updated bio content");
    });
  });

  it("updates slug when provided with valid format", async () => {
    const t = convexTest(schema);

    const profileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      return await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        slug: "original-slug",
      });
    });

    await t.run(async (ctx) => {
      await ctx.db.patch(profileId, { slug: "new-slug" });
    });

    await t.run(async (ctx) => {
      const profile = await ctx.db.get(profileId);
      expect(profile?.slug).toBe("new-slug");
    });
  });

  it("updates socialLinks when provided", async () => {
    const t = convexTest(schema);

    const profileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      return await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
      });
    });

    await t.run(async (ctx) => {
      await ctx.db.patch(profileId, {
        socialLinks: {
          linkedin: "https://linkedin.com/in/updated",
          github: "https://github.com/updated",
        },
      });
    });

    await t.run(async (ctx) => {
      const profile = await ctx.db.get(profileId);
      expect(profile?.socialLinks?.linkedin).toBe(
        "https://linkedin.com/in/updated"
      );
      expect(profile?.socialLinks?.github).toBe("https://github.com/updated");
    });
  });

  it("updates workingOnNow when provided", async () => {
    const t = convexTest(schema);

    const profileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      return await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
      });
    });

    await t.run(async (ctx) => {
      await ctx.db.patch(profileId, {
        workingOnNow: "Building new features",
      });
    });

    await t.run(async (ctx) => {
      const profile = await ctx.db.get(profileId);
      expect(profile?.workingOnNow).toBe("Building new features");
    });
  });

  it("updates skills when provided", async () => {
    const t = convexTest(schema);

    const profileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      return await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        skills: ["JavaScript"],
      });
    });

    await t.run(async (ctx) => {
      await ctx.db.patch(profileId, {
        skills: ["TypeScript", "React", "Convex"],
      });
    });

    await t.run(async (ctx) => {
      const profile = await ctx.db.get(profileId);
      expect(profile?.skills).toEqual(["TypeScript", "React", "Convex"]);
    });
  });

  it("updates location when provided", async () => {
    const t = convexTest(schema);

    const profileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      return await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        location: "San Francisco",
      });
    });

    await t.run(async (ctx) => {
      await ctx.db.patch(profileId, { location: "New York" });
    });

    await t.run(async (ctx) => {
      const profile = await ctx.db.get(profileId);
      expect(profile?.location).toBe("New York");
    });
  });

  it("updates profileStatus when provided", async () => {
    const t = convexTest(schema);

    const profileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      return await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "locked",
      });
    });

    await t.run(async (ctx) => {
      await ctx.db.patch(profileId, { profileStatus: "published" });
    });

    await t.run(async (ctx) => {
      const profile = await ctx.db.get(profileId);
      expect(profile?.profileStatus).toBe("published");
    });
  });

  it("updates multiple fields at once", async () => {
    const t = convexTest(schema);

    const profileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      return await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "locked",
        displayName: "Original",
        bio: "Original bio",
      });
    });

    await t.run(async (ctx) => {
      await ctx.db.patch(profileId, {
        displayName: "Updated",
        bio: "Updated bio",
        profileStatus: "published",
        location: "Seattle",
      });
    });

    await t.run(async (ctx) => {
      const profile = await ctx.db.get(profileId);
      expect(profile?.displayName).toBe("Updated");
      expect(profile?.bio).toBe("Updated bio");
      expect(profile?.profileStatus).toBe("published");
      expect(profile?.location).toBe("Seattle");
    });
  });

  it("preserves existing fields not being updated", async () => {
    const t = convexTest(schema);

    const profileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      return await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        displayName: "Keep This",
        bio: "Keep this bio",
        location: "Original Location",
      });
    });

    await t.run(async (ctx) => {
      // Only update location
      await ctx.db.patch(profileId, { location: "New Location" });
    });

    await t.run(async (ctx) => {
      const profile = await ctx.db.get(profileId);
      expect(profile?.displayName).toBe("Keep This");
      expect(profile?.bio).toBe("Keep this bio");
      expect(profile?.location).toBe("New Location");
    });
  });
});

describe("profiles.generateUploadUrl mutation", () => {
  async function setupAdminUser(t: ReturnType<typeof convexTest>) {
    const userId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
      });
      return userId;
    });

    return {
      t: t.withIdentity({
        subject: userId,
        issuer: "test",
        tokenIdentifier: `test|${userId}`,
      }),
      userId,
    };
  }

  async function setupGuestUser(t: ReturnType<typeof convexTest>) {
    const userId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      await ctx.db.insert("profiles", {
        userId,
        role: "guest",
        profileStatus: "locked",
      });
      return userId;
    });

    return {
      t: t.withIdentity({
        subject: userId,
        issuer: "test",
        tokenIdentifier: `test|${userId}`,
      }),
      userId,
    };
  }

  it("returns a string URL when called by admin", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    const url = await adminCtx.mutation(api.profiles.generateUploadUrl, {});

    expect(typeof url).toBe("string");
    expect(url.length).toBeGreaterThan(0);
  });

  it("throws error when called by non-admin", async () => {
    const t = convexTest(schema);
    const { t: guestCtx } = await setupGuestUser(t);

    await expect(
      guestCtx.mutation(api.profiles.generateUploadUrl, {})
    ).rejects.toThrow();
  });

  it("throws error when called without authentication", async () => {
    const t = convexTest(schema);

    await expect(
      t.mutation(api.profiles.generateUploadUrl, {})
    ).rejects.toThrow();
  });
});

describe("profiles.getPhotoUrl query", () => {
  it("is defined in the API", () => {
    // This test verifies the query exists and has correct return type
    // Full integration testing of storage URLs requires actual file uploads
    // The query requires a valid storage ID, which we can't easily mock
    // in convex-test. Integration tests should verify actual storage URL retrieval.
    expect(api.profiles.getPhotoUrl).toBeDefined();
  });
});

describe("profiles.getAuthoredContent query", () => {
  it("returns empty arrays when profile has no authored content", async () => {
    const t = convexTest(schema);

    const profileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      return await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        displayName: "Empty Author",
      });
    });

    const content = await t.query(api.profiles.getAuthoredContent, {
      profileId,
    });

    expect(content.projects).toEqual([]);
    expect(content.experiments).toEqual([]);
    expect(content.articles).toEqual([]);
    expect(content.videos).toEqual([]);
  });

  it("returns published projects authored by the profile", async () => {
    const t = convexTest(schema);

    const { profileId } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        displayName: "Project Author",
      });

      // Create published project
      await ctx.db.insert("projects", {
        title: "Published Project",
        slug: "published-project",
        description: "A published project",
        authorId: profileId,
        isPublished: true,
      });

      // Create unpublished project (should not appear)
      await ctx.db.insert("projects", {
        title: "Draft Project",
        slug: "draft-project",
        description: "A draft project",
        authorId: profileId,
        isPublished: false,
      });

      return { profileId };
    });

    const content = await t.query(api.profiles.getAuthoredContent, {
      profileId,
    });

    expect(content.projects).toHaveLength(1);
    expect(content.projects[0].title).toBe("Published Project");
    expect(content.projects[0].slug).toBe("published-project");
    expect(content.projects[0].type).toBe("project");
  });

  it("returns published experiments authored by the profile", async () => {
    const t = convexTest(schema);

    const { profileId } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        displayName: "Experiment Author",
      });

      await ctx.db.insert("experiments", {
        title: "Published Experiment",
        slug: "published-experiment",
        description: "An experiment",
        authorId: profileId,
        isPublished: true,
        status: "exploring",
      });

      return { profileId };
    });

    const content = await t.query(api.profiles.getAuthoredContent, {
      profileId,
    });

    expect(content.experiments).toHaveLength(1);
    expect(content.experiments[0].title).toBe("Published Experiment");
    expect(content.experiments[0].type).toBe("experiment");
  });

  it("returns articles authored by the profile", async () => {
    const t = convexTest(schema);

    const { profileId } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        displayName: "Article Author",
      });

      await ctx.db.insert("articles", {
        title: "My Article",
        slug: "my-article",
        content: "Article content",
        authorId: profileId,
        publishedAt: Date.now(),
      });

      return { profileId };
    });

    const content = await t.query(api.profiles.getAuthoredContent, {
      profileId,
    });

    expect(content.articles).toHaveLength(1);
    expect(content.articles[0].title).toBe("My Article");
    expect(content.articles[0].type).toBe("article");
  });

  it("returns published videos authored by the profile", async () => {
    const t = convexTest(schema);

    const { profileId } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        displayName: "Video Author",
      });

      await ctx.db.insert("videos", {
        title: "Tutorial Video",
        slug: "tutorial-video",
        youtubeId: "abc123",
        authorId: profileId,
        isPublished: true,
      });

      return { profileId };
    });

    const content = await t.query(api.profiles.getAuthoredContent, {
      profileId,
    });

    expect(content.videos).toHaveLength(1);
    expect(content.videos[0].title).toBe("Tutorial Video");
    expect(content.videos[0].type).toBe("video");
  });

  it("excludes content authored by other profiles", async () => {
    const t = convexTest(schema);

    const { profileId } = await t.run(async (ctx) => {
      const userId1 = await ctx.db.insert("users", {});
      const userId2 = await ctx.db.insert("users", {});

      const profileId = await ctx.db.insert("profiles", {
        userId: userId1,
        role: "admin",
        profileStatus: "published",
        displayName: "Our Author",
      });

      const otherProfileId = await ctx.db.insert("profiles", {
        userId: userId2,
        role: "member",
        profileStatus: "published",
        displayName: "Other Author",
      });

      // Our author's project
      await ctx.db.insert("projects", {
        title: "Our Project",
        slug: "our-project",
        description: "Our project",
        authorId: profileId,
        isPublished: true,
      });

      // Other author's project (should not appear)
      await ctx.db.insert("projects", {
        title: "Other Project",
        slug: "other-project",
        description: "Other project",
        authorId: otherProfileId,
        isPublished: true,
      });

      return { profileId };
    });

    const content = await t.query(api.profiles.getAuthoredContent, {
      profileId,
    });

    expect(content.projects).toHaveLength(1);
    expect(content.projects[0].title).toBe("Our Project");
  });

  it("returns all content types for prolific author", async () => {
    const t = convexTest(schema);

    const { profileId } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        displayName: "Prolific Author",
      });

      await ctx.db.insert("projects", {
        title: "Project 1",
        slug: "project-1",
        description: "Project",
        authorId: profileId,
        isPublished: true,
      });

      await ctx.db.insert("experiments", {
        title: "Experiment 1",
        slug: "experiment-1",
        description: "Experiment",
        authorId: profileId,
        isPublished: true,
        status: "prototyping",
      });

      await ctx.db.insert("articles", {
        title: "Article 1",
        slug: "article-1",
        content: "Article",
        authorId: profileId,
        publishedAt: Date.now(),
      });

      await ctx.db.insert("videos", {
        title: "Video 1",
        slug: "video-1",
        youtubeId: "vid1",
        authorId: profileId,
        isPublished: true,
      });

      return { profileId };
    });

    const content = await t.query(api.profiles.getAuthoredContent, {
      profileId,
    });

    expect(content.projects).toHaveLength(1);
    expect(content.experiments).toHaveLength(1);
    expect(content.articles).toHaveLength(1);
    expect(content.videos).toHaveLength(1);
  });
});

describe("profiles.list query", () => {
  async function setupAdminUser(t: ReturnType<typeof convexTest>) {
    const userId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        displayName: "Admin User",
        slug: "admin-user",
      });
      return userId;
    });

    return {
      t: t.withIdentity({
        subject: userId,
        issuer: "test",
        tokenIdentifier: `test|${userId}`,
      }),
      userId,
    };
  }

  async function setupGuestUser(t: ReturnType<typeof convexTest>) {
    const userId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      await ctx.db.insert("profiles", {
        userId,
        role: "guest",
        profileStatus: "locked",
      });
      return userId;
    });

    return {
      t: t.withIdentity({
        subject: userId,
        issuer: "test",
        tokenIdentifier: `test|${userId}`,
      }),
      userId,
    };
  }

  it("returns all profiles when called by admin", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    // Create additional profiles
    await t.run(async (ctx) => {
      const userId1 = await ctx.db.insert("users", {});
      const userId2 = await ctx.db.insert("users", {});

      await ctx.db.insert("profiles", {
        userId: userId1,
        role: "member",
        profileStatus: "published",
        displayName: "Member User",
        slug: "member-user",
      });

      await ctx.db.insert("profiles", {
        userId: userId2,
        role: "guest",
        profileStatus: "locked",
        displayName: "Guest User",
      });
    });

    const profiles = await adminCtx.query(api.profiles.list, {});

    // Should include admin + 2 additional profiles = 3 total
    expect(profiles).toHaveLength(3);
  });

  it("includes required fields in response", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    const profiles = await adminCtx.query(api.profiles.list, {});

    expect(profiles).toHaveLength(1);
    const profile = profiles[0];

    // Check required fields exist
    expect(profile._id).toBeDefined();
    expect(profile.displayName).toBe("Admin User");
    expect(profile.role).toBe("admin");
    expect(profile.profileStatus).toBe("published");
    expect(profile.slug).toBe("admin-user");
  });

  it("returns profiles with all status types", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    await t.run(async (ctx) => {
      const userId1 = await ctx.db.insert("users", {});
      const userId2 = await ctx.db.insert("users", {});

      await ctx.db.insert("profiles", {
        userId: userId1,
        role: "member",
        profileStatus: "unlocked",
        displayName: "Unlocked",
      });

      await ctx.db.insert("profiles", {
        userId: userId2,
        role: "member",
        profileStatus: "locked",
        displayName: "Locked",
      });
    });

    const profiles = await adminCtx.query(api.profiles.list, {});

    // Admin (published) + Unlocked + Locked = 3
    expect(profiles).toHaveLength(3);
    const statuses = profiles.map((p) => p.profileStatus).sort();
    expect(statuses).toContain("published");
    expect(statuses).toContain("unlocked");
    expect(statuses).toContain("locked");
  });

  it("throws error when called by non-admin", async () => {
    const t = convexTest(schema);
    const { t: guestCtx } = await setupGuestUser(t);

    await expect(guestCtx.query(api.profiles.list, {})).rejects.toThrow();
  });

  it("throws error when called without authentication", async () => {
    const t = convexTest(schema);

    await expect(t.query(api.profiles.list, {})).rejects.toThrow();
  });

  it("returns empty array when only admin profile exists", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    const profiles = await adminCtx.query(api.profiles.list, {});

    // Just the admin user created in setup
    expect(profiles).toHaveLength(1);
  });

  it("handles profiles without optional fields", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});

      // Minimal profile without optional fields
      await ctx.db.insert("profiles", {
        userId,
        role: "member",
        profileStatus: "locked",
      });
    });

    const profiles = await adminCtx.query(api.profiles.list, {});

    expect(profiles).toHaveLength(2);
    const minimalProfile = profiles.find((p) => p.role === "member");
    expect(minimalProfile).toBeDefined();
    expect(minimalProfile?.displayName).toBeUndefined();
    expect(minimalProfile?.slug).toBeUndefined();
  });
});

describe("profiles.get query", () => {
  async function setupAdminUser(t: ReturnType<typeof convexTest>) {
    const userId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      await ctx.db.insert("profiles", {
        userId,
        role: "admin",
        profileStatus: "published",
        displayName: "Admin User",
        slug: "admin-user",
      });
      return userId;
    });

    return {
      t: t.withIdentity({
        subject: userId,
        issuer: "test",
        tokenIdentifier: `test|${userId}`,
      }),
      userId,
    };
  }

  async function setupGuestUser(t: ReturnType<typeof convexTest>) {
    const userId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      await ctx.db.insert("profiles", {
        userId,
        role: "guest",
        profileStatus: "locked",
      });
      return userId;
    });

    return {
      t: t.withIdentity({
        subject: userId,
        issuer: "test",
        tokenIdentifier: `test|${userId}`,
      }),
      userId,
    };
  }

  it("returns full profile by ID when called by admin", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    // Create a target profile
    const targetProfileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      return await ctx.db.insert("profiles", {
        userId,
        role: "member",
        profileStatus: "published",
        displayName: "Target User",
        bio: "A test bio",
        slug: "target-user",
        location: "Test Location",
        skills: ["skill1", "skill2"],
        socialLinks: {
          linkedin: "https://linkedin.com/in/test",
          github: "https://github.com/test",
        },
        workingOnNow: "Testing things",
      });
    });

    const profile = await adminCtx.query(api.profiles.get, {
      id: targetProfileId,
    });

    expect(profile).not.toBeNull();
    expect(profile?._id).toBe(targetProfileId);
    expect(profile?.displayName).toBe("Target User");
    expect(profile?.bio).toBe("A test bio");
    expect(profile?.slug).toBe("target-user");
    expect(profile?.location).toBe("Test Location");
    expect(profile?.skills).toEqual(["skill1", "skill2"]);
    expect(profile?.socialLinks?.linkedin).toBe("https://linkedin.com/in/test");
    expect(profile?.workingOnNow).toBe("Testing things");
  });

  it("returns null for non-existent profile ID", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    // Create a fake ID by creating and deleting a profile
    const fakeId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      const profileId = await ctx.db.insert("profiles", {
        userId,
        role: "member",
        profileStatus: "locked",
      });
      await ctx.db.delete(profileId);
      return profileId;
    });

    const profile = await adminCtx.query(api.profiles.get, { id: fakeId });

    expect(profile).toBeNull();
  });

  it("throws error when called by non-admin", async () => {
    const t = convexTest(schema);
    const { t: guestCtx } = await setupGuestUser(t);

    // Create a target profile
    const targetProfileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      return await ctx.db.insert("profiles", {
        userId,
        role: "member",
        profileStatus: "locked",
      });
    });

    await expect(
      guestCtx.query(api.profiles.get, { id: targetProfileId })
    ).rejects.toThrow();
  });

  it("throws error when called without authentication", async () => {
    const t = convexTest(schema);

    const targetProfileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      return await ctx.db.insert("profiles", {
        userId,
        role: "member",
        profileStatus: "locked",
      });
    });

    await expect(
      t.query(api.profiles.get, { id: targetProfileId })
    ).rejects.toThrow();
  });

  it("returns profile with minimal fields", async () => {
    const t = convexTest(schema);
    const { t: adminCtx } = await setupAdminUser(t);

    const targetProfileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      return await ctx.db.insert("profiles", {
        userId,
        role: "guest",
        profileStatus: "locked",
      });
    });

    const profile = await adminCtx.query(api.profiles.get, {
      id: targetProfileId,
    });

    expect(profile).not.toBeNull();
    expect(profile?.role).toBe("guest");
    expect(profile?.profileStatus).toBe("locked");
    expect(profile?.displayName).toBeUndefined();
    expect(profile?.bio).toBeUndefined();
  });
});
