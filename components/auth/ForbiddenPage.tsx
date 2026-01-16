"use client";

import Link from "next/link";

interface ForbiddenPageProps {
  message?: string;
}

/**
 * Forbidden (403) page component to display when user doesn't have
 * required permissions to access a resource.
 *
 * Usage:
 * ```tsx
 * // In a protected page component
 * const profile = useQuery(api.users.getCurrentUserProfile);
 *
 * if (profile && profile.role !== "admin") {
 *   return <ForbiddenPage message="Only administrators can access this page." />;
 * }
 * ```
 */
export function ForbiddenPage({
  message = "You don't have permission to access this page.",
}: ForbiddenPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-900">403</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-700">
        Access Forbidden
      </h2>
      <p className="mt-2 text-gray-500">{message}</p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        Go back home
      </Link>
    </div>
  );
}
