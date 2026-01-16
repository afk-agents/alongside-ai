"use client";

import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { SignOutButton } from "./SignOutButton";

export function AuthNav() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );

  // Don't render anything while loading to prevent flash
  if (isLoading) {
    return (
      <div className="h-10 w-20 animate-pulse bg-gray-100 rounded-md" />
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        {currentUser?.email && (
          <span className="text-sm text-gray-600">{currentUser.email}</span>
        )}
        <SignOutButton />
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
    >
      Sign in
    </Link>
  );
}
