"use client";

import { ArticleCard } from "./ArticleCard";
import type { Id } from "@/convex/_generated/dataModel";

interface FeaturedArticle {
  _id: Id<"articles">;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt: number;
  author: {
    displayName?: string;
    slug?: string;
    photoUrl?: string;
  } | null;
  tags: Array<{ _id: Id<"tags">; name: string; slug: string }>;
}

interface FeaturedArticlesProps {
  articles: FeaturedArticle[];
}

/**
 * FeaturedArticles displays highlighted articles in a prominent section.
 *
 * Features:
 * - "Featured" heading
 * - Maximum 3 articles displayed
 * - Uses ArticleCard with featured variant
 * - Returns null when no articles
 * - Distinct visual treatment with background and larger cards
 */
export function FeaturedArticles({ articles }: FeaturedArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  // Limit to max 3 featured articles
  const displayArticles = articles.slice(0, 3);

  return (
    <section
      aria-label="Featured articles"
      role="region"
      className="mb-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 md:p-8"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Featured
      </h2>
      <div
        data-testid="featured-grid"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {displayArticles.map((article) => (
          <ArticleCard key={article._id} article={article} variant="featured" />
        ))}
      </div>
    </section>
  );
}
