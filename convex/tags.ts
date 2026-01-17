import { v } from "convex/values";
import { mutation, MutationCtx } from "./_generated/server";
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
