"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ForbiddenPage } from "@/components/auth/ForbiddenPage";

/**
 * Admin dashboard page - only accessible to users with admin role.
 *
 * Authentication is handled by middleware (redirects to /login if not authenticated).
 * Authorization (role check) is handled here on the client and should also be
 * enforced in any Convex functions called from this page using requireRole(ctx, ["admin"]).
 */
export default function AdminPage() {
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
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Welcome, {profile.displayName || "Admin"}! You have full access to the
        admin dashboard.
      </p>
      <div className="mt-8 rounded-lg bg-gray-50 p-6">
        <h2 className="text-lg font-medium text-gray-900">Your Profile</h2>
        <dl className="mt-4 space-y-2">
          <div className="flex gap-2">
            <dt className="font-medium text-gray-500">Role:</dt>
            <dd className="text-gray-900">{profile.role}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-gray-500">Status:</dt>
            <dd className="text-gray-900">{profile.profileStatus}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
