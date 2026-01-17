"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ForbiddenPage } from "@/components/auth/ForbiddenPage";
import Link from "next/link";

/**
 * Admin profiles list page - displays all profiles in a table format.
 *
 * Authentication is handled by middleware (redirects to /login if not authenticated).
 * Authorization (role check) is handled here on the client and enforced by
 * the Convex list query which requires admin role.
 */
export default function AdminProfilesPage() {
  const profile = useQuery(api.users.getCurrentUserProfile);
  const profiles = useQuery(api.profiles.list);

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

  // Loading profiles state
  if (profiles === undefined) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Profiles</h1>
        <div className="mt-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Profiles</h1>
      </div>
      <p className="mt-2 text-gray-600">
        Manage user profiles and their settings.
      </p>

      <div className="mt-8 overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Slug
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {profiles.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  No profiles found.
                </td>
              </tr>
            ) : (
              profiles.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {p.displayName || (
                      <span className="text-gray-400">No name</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <RoleBadge role={p.role} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <StatusBadge status={p.profileStatus} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {p.slug || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/admin/profiles/${p._id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
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

function RoleBadge({ role }: { role: "admin" | "member" | "guest" }) {
  const colors = {
    admin: "bg-purple-100 text-purple-800",
    member: "bg-blue-100 text-blue-800",
    guest: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${colors[role]}`}
    >
      {role}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: "locked" | "unlocked" | "published";
}) {
  const colors = {
    locked: "bg-red-100 text-red-800",
    unlocked: "bg-yellow-100 text-yellow-800",
    published: "bg-green-100 text-green-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${colors[status]}`}
    >
      {status}
    </span>
  );
}
