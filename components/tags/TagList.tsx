"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TagBadge } from "./TagBadge";

interface TagListProps {
  tagIds?: Id<"tags">[];
  size?: "sm" | "md";
}

export function TagList({ tagIds, size = "md" }: TagListProps) {
  const shouldSkip = !tagIds || tagIds.length === 0;

  const tags = useQuery(
    api.tags.getByIds,
    shouldSkip ? "skip" : { tagIds }
  );

  // Render nothing if no tags or loading or empty result
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <TagBadge key={tag._id} tag={tag} size={size} />
      ))}
    </div>
  );
}
