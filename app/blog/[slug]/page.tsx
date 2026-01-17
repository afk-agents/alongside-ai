"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { notFound } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { ArticleHeader, ArticleContent, RelatedArticles } from "@/components/articles";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default function ArticlePage({ params }: ArticlePageProps) {
  // Next.js 16: params is a Promise
  const { slug } = use(params);

  const article = useQuery(api.articles.getBySlug, { slug });

  // Loading state
  if (article === undefined) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  // Article not found
  if (article === null) {
    notFound();
    return null;
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <ArticleHeader
        title={article.title}
        author={article.author}
        publishedAt={article.publishedAt}
        tags={article.tags}
      />

      <ArticleContent content={article.content} />

      {article.substackUrl && (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            Originally published on{" "}
            <a
              href={article.substackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Substack
            </a>
          </p>
        </div>
      )}

      <RelatedArticles articleId={article._id} />
    </article>
  );
}
