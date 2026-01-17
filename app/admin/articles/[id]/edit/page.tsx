"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ForbiddenPage } from "@/components/auth/ForbiddenPage";
import { ArticleEditor } from "@/components/articles";
import { notFound } from "next/navigation";
import Link from "next/link";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

/**
 * Edit article page for admins.
 *
 * Authentication is handled by middleware (redirects to /login if not authenticated).
 * Authorization (role check) is handled here on the client and enforced by
 * the Convex get query which requires admin role.
 */
export default function EditArticlePage({ params }: EditArticlePageProps) {
  const router = useRouter();
  const { id } = use(params);
  const profile = useQuery(api.users.getCurrentUserProfile);
  const article = useQuery(api.articles.get, { id: id as Id<"articles"> });

  // Loading state
  if (profile === undefined || article === undefined) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Edit Article
        </h1>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  // Authorization check - show 403 if not admin
  if (!profile || profile.role !== "admin") {
    return (
      <ForbiddenPage message="Only administrators can access this page." />
    );
  }

  // Article not found
  if (article === null) {
    notFound();
    return null;
  }

  const handleSuccess = () => {
    router.push("/admin/articles");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/admin/articles"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Back to Articles
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Edit Article
      </h1>

      <ArticleEditor article={article} onSuccess={handleSuccess} />
    </div>
  );
}
