"use client";

import { ArticleContent } from "./ArticleContent";

interface MarkdownPreviewProps {
  content: string;
}

/**
 * MarkdownPreview provides a live preview of markdown content.
 * Uses ArticleContent for consistent rendering with the article page.
 */
export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <div className="text-gray-400 dark:text-gray-500 italic">
        Start typing to see preview...
      </div>
    );
  }

  return <ArticleContent content={content} />;
}
