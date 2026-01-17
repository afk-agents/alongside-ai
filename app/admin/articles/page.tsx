"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ForbiddenPage } from "@/components/auth/ForbiddenPage";
import Link from "next/link";

/**
 * Admin articles list page - displays all articles in a table format.
 *
 * Authentication is handled by middleware (redirects to /login if not authenticated).
 * Authorization (role check) is handled here on the client and enforced by
 * the Convex listAdmin query which requires admin role.
 */
export default function AdminArticlesPage() {
  const profile = useQuery(api.users.getCurrentUserProfile);
  const articles = useQuery(api.articles.listAdmin);
  const removeArticle = useMutation(api.articles.remove);
  const [deletingId, setDeletingId] = useState<Id<"articles"> | null>(null);

  // Loading state
  if (profile === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Authorization check - show 403 if not admin
  if (!profile || profile.role !== "admin") {
    return (
      <ForbiddenPage message="Only administrators can access this page." />
    );
  }

  // Loading articles state
  if (articles === undefined) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Articles
        </h1>
        <div className="mt-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const handleDelete = async (id: Id<"articles">, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      setDeletingId(id);
      try {
        await removeArticle({ id });
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(timestamp));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Articles
        </h1>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Create New Article
        </Link>
      </div>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Manage blog articles and their content.
      </p>

      <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Author
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Featured
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {articles.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No articles found.{" "}
                  <Link
                    href="/admin/articles/new"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Create your first article
                  </Link>
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr
                  key={article._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    <Link
                      href={`/blog/${article.slug}`}
                      className="hover:text-blue-600"
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {article.authorName || (
                      <span className="text-gray-400">Unknown</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(article.publishedAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <FeaturedBadge isFeatured={article.isFeatured ?? false} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-4">
                    <Link
                      href={`/admin/articles/${article._id}/edit`}
                      className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(article._id, article.title)}
                      disabled={deletingId === article._id}
                      className="text-red-600 hover:text-red-900 dark:hover:text-red-400 disabled:opacity-50"
                    >
                      {deletingId === article._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeaturedBadge({ isFeatured }: { isFeatured: boolean }) {
  if (isFeatured) {
    return (
      <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        Featured
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      -
    </span>
  );
}
