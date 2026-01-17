"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ArticleList,
  ArticleFilters,
  FeaturedArticles,
} from "@/components/articles";

export default function BlogPage() {
  const [selectedTagId, setSelectedTagId] = useState<Id<"tags"> | undefined>(
    undefined
  );

  const featuredArticles = useQuery(api.articles.listFeatured, { limit: 3 });

  // Don't show featured when filtering by tag
  const showFeatured = selectedTagId === undefined && featuredArticles;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Blog
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Insights, updates, and stories from the Alongside AI community.
        </p>
      </div>

      {/* Featured articles section - only when no filter */}
      {showFeatured && featuredArticles.length > 0 && (
        <FeaturedArticles articles={featuredArticles} />
      )}

      {/* Filter controls */}
      <div className="mb-8">
        <ArticleFilters
          selectedTagId={selectedTagId}
          onTagSelect={setSelectedTagId}
        />
      </div>

      {/* Article list with pagination */}
      <ArticleList tagId={selectedTagId} />
    </div>
  );
}
