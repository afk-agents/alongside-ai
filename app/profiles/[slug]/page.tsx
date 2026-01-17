"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProfilePage } from "@/components/profiles";
import { notFound } from "next/navigation";
import { use } from "react";

interface ProfileRouteProps {
  params: Promise<{ slug: string }>;
}

function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="mt-4 h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="mt-2 h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="mt-8">
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function ProfileRoute({ params }: ProfileRouteProps) {
  const { slug } = use(params);
  const profile = useQuery(api.profiles.getBySlug, { slug });

  // Loading state
  if (profile === undefined) {
    return <ProfileSkeleton />;
  }

  // Profile not found or not published
  if (profile === null) {
    notFound();
  }

  return <ProfilePage profile={profile} />;
}
