"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ForbiddenPage } from "@/components/auth/ForbiddenPage";
import { ProfileEditor } from "@/components/profiles";
import Link from "next/link";

/**
 * Admin profile edit page - allows editing of a single profile.
 *
 * Authentication is handled by middleware (redirects to /login if not authenticated).
 * Authorization (role check) is handled here on the client and enforced by
 * the Convex get query which requires admin role.
 */
export default function AdminProfileEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const currentUserProfile = useQuery(api.users.getCurrentUserProfile);
  const profile = useQuery(api.profiles.get, {
    id: id as Id<"profiles">,
  });

  // Loading state for current user
  if (currentUserProfile === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Authorization check - show 403 if not admin
  if (!currentUserProfile || currentUserProfile.role !== "admin") {
    return (
      <ForbiddenPage message="Only administrators can access this page." />
    );
  }

  // Loading state for profile
  if (profile === undefined) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Profile not found
  if (profile === null) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Profile Not Found
          </h1>
          <p className="mt-2 text-gray-600">
            The profile you are looking for does not exist.
          </p>
          <Link
            href="/admin/profiles"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Back to Profiles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/admin/profiles"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Profiles
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="mt-1 text-gray-600">
          {profile.displayName || "Unnamed Profile"} &middot;{" "}
          <span className="capitalize">{profile.role}</span>
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ProfileEditor profile={profile} />
      </div>
    </div>
  );
}
