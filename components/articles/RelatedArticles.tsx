"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface RelatedArticlesProps {
  articleId: Id<"articles">;
}

/**
 * Displays related articles based on shared tags.
 *
 * Fetches related articles using articles.getRelated query.
 * Returns null if loading or no related articles exist.
 *
 * @param articleId - The ID of the current article to find related content for
 */
export function RelatedArticles({ articleId }: RelatedArticlesProps) {
  const relatedArticles = useQuery(api.articles.getRelated, { articleId });

  // Return null if loading or empty results
  if (relatedArticles === undefined || relatedArticles.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Related Articles
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relatedArticles.map((article) => (
          <Link
            key={article._id}
            href={`/blog/${article.slug}`}
            className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {article.excerpt}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              {formatDate(article.publishedAt)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * Formats a timestamp to a readable date string.
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
