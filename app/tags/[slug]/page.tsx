"use client";

import { useQuery } from "convex/react";
import { notFound } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { TagContentSection } from "@/components/tags/TagContentSection";

interface TagDetailPageProps {
  params: { slug: string };
}

export default function TagDetailPage({ params }: TagDetailPageProps) {
  const { slug } = params;

  const tag = useQuery(api.tags.getBySlug, { slug });
  const content = useQuery(
    api.tags.getContentByTagId,
    tag?._id ? { tagId: tag._id } : "skip"
  );

  // Show loading state while tag query is loading
  if (tag === undefined) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  // Tag not found - show 404
  if (tag === null) {
    notFound();
    return null; // TypeScript needs this even though notFound() throws
  }

  // Calculate total content count
  const totalContent =
    (content?.events.length ?? 0) +
    (content?.projects.length ?? 0) +
    (content?.experiments.length ?? 0) +
    (content?.articles.length ?? 0) +
    (content?.videos.length ?? 0);

  const hasContent = totalContent > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Tag header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {tag.name}
        </h1>
        {tag.description && (
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            {tag.description}
          </p>
        )}
      </div>

      {/* Content sections */}
      {hasContent ? (
        <div>
          <TagContentSection
            title="Events"
            items={content?.events.map((e) => ({ title: e.title, slug: e.slug })) ?? []}
            linkPrefix="/events"
          />
          <TagContentSection
            title="Projects"
            items={content?.projects.map((p) => ({ title: p.title, slug: p.slug })) ?? []}
            linkPrefix="/projects"
          />
          <TagContentSection
            title="Experiments"
            items={content?.experiments.map((e) => ({ title: e.title, slug: e.slug })) ?? []}
            linkPrefix="/lab"
          />
          <TagContentSection
            title="Articles"
            items={content?.articles.map((a) => ({ title: a.title, slug: a.slug })) ?? []}
            linkPrefix="/blog"
          />
          <TagContentSection
            title="Videos"
            items={content?.videos.map((v) => ({ title: v.title, slug: v.slug })) ?? []}
            linkPrefix="/videos"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            No content tagged with <span className="font-semibold">{tag.name}</span> yet.
          </p>
        </div>
      )}
    </div>
  );
}
