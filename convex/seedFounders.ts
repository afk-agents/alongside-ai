import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Seed founder profiles for David and Nathan.
 *
 * This is an internal mutation that should be run from the Convex dashboard
 * or via `npx convex run seedFounders:seed`.
 *
 * The seed is idempotent - it checks if profiles with the slugs already exist
 * before creating them.
 *
 * Usage:
 *   npx convex run seedFounders:seed
 */
export const seed = internalMutation({
  args: {},
  returns: v.object({
    created: v.array(v.string()),
    skipped: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const created: string[] = [];
    const skipped: string[] = [];

    // Founder data
    const founders = [
      {
        slug: "david",
        displayName: "David",
        bio: "Co-founder of Alongside AI. Passionate about making AI education accessible to everyone. Building tools and communities that help people learn and grow together.",
        role: "admin" as const,
        profileStatus: "published" as const,
        workingOnNow:
          "Building the next generation of AI learning experiences",
        skills: ["Machine Learning", "Education Technology", "Community Building"],
        location: "San Francisco, CA",
        socialLinks: {
          twitter: "https://twitter.com/davidalongsideai",
          linkedin: "https://linkedin.com/in/david-alongside-ai",
          github: "https://github.com/david-alongside",
        },
      },
      {
        slug: "nathan",
        displayName: "Nathan",
        bio: "Co-founder of Alongside AI. Focused on creating practical, hands-on AI learning experiences. Believes the best way to learn is by building real projects alongside others.",
        role: "admin" as const,
        profileStatus: "published" as const,
        workingOnNow: "Developing interactive AI workshops and experiments",
        skills: ["AI/ML Engineering", "Product Development", "Technical Writing"],
        location: "New York, NY",
        socialLinks: {
          twitter: "https://twitter.com/nathanalongsideai",
          linkedin: "https://linkedin.com/in/nathan-alongside-ai",
          github: "https://github.com/nathan-alongside",
        },
      },
    ];

    for (const founder of founders) {
      // Check if profile with this slug already exists
      const existing = await ctx.db
        .query("profiles")
        .withIndex("by_slug", (q) => q.eq("slug", founder.slug))
        .unique();

      if (existing) {
        skipped.push(founder.displayName);
        continue;
      }

      // Create a user for this founder
      const userId = await ctx.db.insert("users", {});

      // Create the founder profile
      await ctx.db.insert("profiles", {
        userId,
        ...founder,
      });

      created.push(founder.displayName);
    }

    return { created, skipped };
  },
});
