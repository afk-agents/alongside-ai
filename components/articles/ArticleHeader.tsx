"use client";

import { ArticleMeta } from "./ArticleMeta";
import { TagBadge } from "@/components/tags/TagBadge";
import type { Id } from "@/convex/_generated/dataModel";

interface Author {
  displayName?: string;
  slug?: string;
  photoUrl?: string;
  bio?: string;
}

interface Tag {
  _id: Id<"tags">;
  name: string;
  slug: string;
}

interface ArticleHeaderProps {
  title: string;
  author: Author | null;
  publishedAt: number;
  tags: Tag[];
}

/**
 * ArticleHeader displays the article title, author info, and tags.
 *
 * Features:
 * - Title as h1 heading
 * - ArticleMeta with md size for author and date
 * - Tag badges that link to tag pages
 */
export function ArticleHeader({
  title,
  author,
  publishedAt,
  tags,
}: ArticleHeaderProps) {
  return (
    <header role="banner" className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {title}
      </h1>

      <div className="flex flex-col gap-4">
        <ArticleMeta author={author} publishedAt={publishedAt} size="md" />

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagBadge key={tag._id} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
