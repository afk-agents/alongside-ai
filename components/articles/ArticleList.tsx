"use client";

import { useReducer, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArticleCard } from "./ArticleCard";
import type { Id } from "@/convex/_generated/dataModel";

interface ArticleListProps {
  tagId?: Id<"tags">;
}

type ArticleItem = {
  _id: Id<"articles">;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt: number;
  isFeatured?: boolean;
  author: { displayName?: string; slug?: string } | null;
  tags: Array<{ _id: Id<"tags">; name: string; slug: string }>;
};

type State = {
  cursor: number | undefined;
  loadedPages: ArticleItem[][];
  isLoadingMore: boolean;
  lastHasMore: boolean;
  lastNextCursor: number | null;
  processedResultId: string | null;
};

type Action =
  | { type: "LOAD_MORE"; nextCursor: number }
  | { type: "INITIAL_LOAD"; articles: ArticleItem[]; hasMore: boolean; nextCursor: number | null; resultId: string }
  | { type: "APPEND_PAGE"; articles: ArticleItem[]; hasMore: boolean; nextCursor: number | null; resultId: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD_MORE":
      return { ...state, isLoadingMore: true, cursor: action.nextCursor };
    case "INITIAL_LOAD":
      return {
        ...state,
        loadedPages: [action.articles],
        lastHasMore: action.hasMore,
        lastNextCursor: action.nextCursor,
        processedResultId: action.resultId,
      };
    case "APPEND_PAGE":
      return {
        ...state,
        loadedPages: [...state.loadedPages, action.articles],
        isLoadingMore: false,
        lastHasMore: action.hasMore,
        lastNextCursor: action.nextCursor,
        processedResultId: action.resultId,
      };
    default:
      return state;
  }
}

const initialState: State = {
  cursor: undefined,
  loadedPages: [],
  isLoadingMore: false,
  lastHasMore: false,
  lastNextCursor: null,
  processedResultId: null,
};

/**
 * Skeleton component for loading state.
 */
function ArticleListSkeleton() {
  return (
    <div
      data-testid="article-list-skeleton"
      className="animate-pulse grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"
        />
      ))}
    </div>
  );
}

/**
 * Empty state component.
 */
function EmptyState() {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 dark:text-gray-400 text-lg">
        No articles found.
      </p>
      <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
        Check back later for new content.
      </p>
    </div>
  );
}

/**
 * ArticleList displays a paginated list of articles with Load More functionality.
 *
 * @param tagId - Optional tag ID to filter articles by
 */
export function ArticleList({ tagId }: ArticleListProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { cursor, loadedPages, isLoadingMore, lastHasMore, lastNextCursor, processedResultId } = state;

  const result = useQuery(api.articles.list, {
    tagId,
    cursor,
  });

  // Create a unique identifier for the current result
  const resultId = result
    ? `${result.articles.map((a) => a._id).join(",")}-${result.hasMore}-${result.nextCursor}`
    : null;

  // Flatten all loaded pages into a single array (must be before conditionals)
  const articlesToDisplay = useMemo(() => loadedPages.flat(), [loadedPages]);

  // Use stored values when loading more, otherwise use current result
  const hasMore = isLoadingMore
    ? lastHasMore
    : (result?.hasMore ?? lastHasMore);
  const nextCursorValue = isLoadingMore
    ? lastNextCursor
    : (result?.nextCursor ?? lastNextCursor);

  // Process result when it arrives
  if (result && resultId && resultId !== processedResultId) {
    if (isLoadingMore) {
      dispatch({
        type: "APPEND_PAGE",
        articles: result.articles,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
        resultId,
      });
    } else if (cursor === undefined && loadedPages.length === 0) {
      dispatch({
        type: "INITIAL_LOAD",
        articles: result.articles,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
        resultId,
      });
    }
  }

  // Show skeleton only on initial load
  if (result === undefined && loadedPages.length === 0) {
    return <ArticleListSkeleton />;
  }

  if (articlesToDisplay.length === 0) {
    return <EmptyState />;
  }

  const handleLoadMore = () => {
    if (nextCursorValue !== null) {
      dispatch({ type: "LOAD_MORE", nextCursor: nextCursorValue });
    }
  };

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articlesToDisplay.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>

      {(hasMore || isLoadingMore) && nextCursorValue !== null && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
