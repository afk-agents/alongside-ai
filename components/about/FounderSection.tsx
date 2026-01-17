"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProfileCard } from "@/components/profiles";

function FounderSkeleton() {
  return (
    <div data-testid="founder-skeleton" className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="mt-4 h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="mt-2 h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="mt-1 h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FounderSection() {
  const founders = useQuery(api.profiles.getFounders);

  return (
    <section
      data-testid="founder-section"
      className="py-16 px-4 bg-gray-50 dark:bg-gray-800"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
          Meet the Founders
        </h2>

        {founders === undefined ? (
          <FounderSkeleton />
        ) : founders.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Coming soon
          </p>
        ) : (
          <div
            data-testid="founders-grid"
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            {founders.map((founder) => (
              <ProfileCard
                key={founder._id}
                profile={founder}
                showViewProfile
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
