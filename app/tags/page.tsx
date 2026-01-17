"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";

export default function TagsListingPage() {
  const tags = useQuery(api.tags.list);

  // Show loading state while tags query is loading
  if (tags === undefined) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  // Show empty state when no tags exist
  if (tags.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Tags
        </h1>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            No tags have been created yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Tags
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tags.map((tag) => (
          <Link
            key={tag._id}
            href={`/tags/${tag.slug}`}
            className="block rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800"
          >
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              {tag.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {tag.contentCount} {tag.contentCount === 1 ? "item" : "items"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
