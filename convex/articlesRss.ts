"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import Parser from "rss-parser";

/**
 * Parsed RSS item type for parseRssFeed return value.
 */
interface ParsedRssItem {
  title: string;
  content: string;
  publishedAt: number;
  substackUrl: string;
  excerpt?: string;
  alreadyImported: boolean;
}

/**
 * Parsed RSS item validator for feed parsing results.
 */
const parsedRssItemValidator = v.object({
  title: v.string(),
  content: v.string(),
  publishedAt: v.number(),
  substackUrl: v.string(),
  excerpt: v.optional(v.string()),
  alreadyImported: v.boolean(),
});

/**
 * Test action to verify rss-parser works in Convex runtime.
 * This action instantiates the RSS parser to confirm the package is compatible.
 *
 * @internal Used only for testing RSS parser compatibility
 */
export const testRssParserImport = action({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async () => {
    // Create parser instance to verify the import works
    const parser = new Parser();

    // Verify parser has expected methods
    const hasParseURL = typeof parser.parseURL === "function";
    const hasParseString = typeof parser.parseString === "function";

    if (hasParseURL && hasParseString) {
      return {
        success: true,
        message:
          "rss-parser successfully imported and instantiated in Convex action",
      };
    }

    return {
      success: false,
      message: "rss-parser imported but missing expected methods",
    };
  },
});

/**
 * Parse a Substack RSS feed URL and return articles for import preview.
 *
 * Fetches and parses the RSS feed, extracting article metadata.
 * Checks each item against existing articles to mark duplicates.
 *
 * Requires admin role.
 *
 * @param rssUrl - The Substack RSS feed URL to parse
 * @returns Array of parsed articles with alreadyImported flag
 */
export const parseRssFeed = action({
  args: {
    rssUrl: v.string(),
  },
  returns: v.array(parsedRssItemValidator),
  handler: async (ctx, args): Promise<ParsedRssItem[]> => {
    // Require admin role
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Get user's profile to check role
    // Note: Internal queries are defined in articles.ts
    const profile = await ctx.runQuery(internal.articles.getProfileByTokenId, {
      tokenIdentifier: identity.tokenIdentifier,
    });

    if (!profile || profile.role !== "admin") {
      throw new Error("Required role: admin");
    }

    // Validate URL format
    if (
      !args.rssUrl.startsWith("http://") &&
      !args.rssUrl.startsWith("https://")
    ) {
      throw new Error(
        "Invalid URL format. URL must start with http:// or https://"
      );
    }

    // Create parser with Substack-specific configuration
    const parser = new Parser({
      customFields: {
        item: [["content:encoded", "contentEncoded"]],
      },
    });

    // Parse the RSS feed
    let feed;
    try {
      feed = await parser.parseURL(args.rssUrl);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to parse RSS feed: ${errorMessage}`);
    }

    // Get existing substack URLs to check for duplicates
    // Note: Internal query is defined in articles.ts
    const existingUrls: string[] = await ctx.runQuery(
      internal.articles.getExistingSubstackUrls,
      {}
    );
    const existingUrlSet = new Set<string>(existingUrls);

    // Map feed items to our structure
    const parsedItems: ParsedRssItem[] = feed.items.map((item) => {
      // Use content:encoded if available (full HTML content), fallback to content or description
      const content: string =
        (item as { contentEncoded?: string }).contentEncoded ||
        item.content ||
        item.contentSnippet ||
        "";

      // Parse publication date
      const publishedAt: number = item.pubDate
        ? new Date(item.pubDate).getTime()
        : Date.now();

      // Generate excerpt from content snippet if available
      const excerpt: string | undefined = item.contentSnippet
        ? item.contentSnippet.slice(0, 160)
        : undefined;

      // Get article link (substack URL)
      const substackUrl: string = item.link || "";

      // Check if already imported
      const alreadyImported: boolean = existingUrlSet.has(substackUrl);

      return {
        title: item.title || "Untitled",
        content,
        publishedAt,
        substackUrl,
        excerpt,
        alreadyImported,
      };
    });

    return parsedItems;
  },
});
