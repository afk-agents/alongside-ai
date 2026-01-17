"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface ArticleFiltersProps {
  selectedTagId: Id<"tags"> | undefined;
  onTagSelect: (tagId: Id<"tags"> | undefined) => void;
}

/**
 * ArticleFilters provides tag-based filtering for the blog listing.
 *
 * Features:
 * - "All Articles" button to clear filter
 * - Tag chips for each tag with articles (contentCount > 0)
 * - Selected styling for active filter
 * - Horizontal scrollable on mobile
 */
export function ArticleFilters({
  selectedTagId,
  onTagSelect,
}: ArticleFiltersProps) {
  const tags = useQuery(api.tags.list);

  if (tags === undefined) {
    return (
      <div
        data-testid="article-filters-loading"
        className="flex gap-2 animate-pulse"
      >
        <div className="h-8 w-24 bg-gray-200 rounded-full" />
        <div className="h-8 w-20 bg-gray-200 rounded-full" />
        <div className="h-8 w-16 bg-gray-200 rounded-full" />
      </div>
    );
  }

  // Filter to only tags with articles
  const tagsWithArticles = tags.filter((tag) => tag.contentCount > 0);

  const isAllSelected = selectedTagId === undefined;

  return (
    <div
      role="group"
      aria-label="Article filters"
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
    >
      <button
        onClick={() => {
          if (!isAllSelected) {
            onTagSelect(undefined);
          }
        }}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
          isAllSelected
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        All Articles
      </button>
      {tagsWithArticles.map((tag) => {
        const isSelected = selectedTagId === tag._id;
        return (
          <button
            key={tag._id}
            onClick={() => {
              if (!isSelected) {
                onTagSelect(tag._id);
              }
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              isSelected
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
