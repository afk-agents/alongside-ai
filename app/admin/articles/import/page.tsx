"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ForbiddenPage } from "@/components/auth/ForbiddenPage";
import { RssImporter } from "@/components/articles";
import Link from "next/link";

/**
 * Admin Substack RSS import page - allows admins to import articles from Substack feeds.
 *
 * Authentication is handled by middleware (redirects to /login if not authenticated).
 * Authorization (role check) is handled here on the client.
 */
export default function RssImportPage() {
  const profile = useQuery(api.users.getCurrentUserProfile);

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
        Import from Substack
      </h1>

      <RssImporter />
    </div>
  );
}
