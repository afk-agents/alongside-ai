import Link from "next/link";
import { ArticleMeta } from "./ArticleMeta";
import { TagBadge } from "@/components/tags/TagBadge";
import type { Id } from "@/convex/_generated/dataModel";

interface Author {
  displayName?: string;
  slug?: string;
  photoUrl?: string;
}

interface Tag {
  _id: Id<"tags">;
  name: string;
  slug: string;
}

interface Article {
  _id: Id<"articles">;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt: number;
  author: Author | null;
  tags: Tag[];
}

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured";
}

/**
 * ArticleCard displays an article preview in a card format.
 *
 * @param article - Article data including title, slug, excerpt, author, tags
 * @param variant - "default" or "featured" for different styling
 */
export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const isFeatured = variant === "featured";

  const cardClasses = isFeatured
    ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800"
    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700";

  return (
    <article
      className={`${cardClasses} rounded-lg p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.01]`}
    >
      <Link
        href={`/blog/${article.slug}`}
        className="block group"
      >
        <h3
          className={`font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
            isFeatured ? "text-xl" : "text-lg"
          }`}
        >
          {article.title}
        </h3>
      </Link>

      {article.excerpt && (
        <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2 text-sm">
          {article.excerpt}
        </p>
      )}

      <div className="mt-4">
        <ArticleMeta
          author={article.author}
          publishedAt={article.publishedAt}
          size="sm"
        />
      </div>

      {article.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <TagBadge key={tag._id} tag={tag} size="sm" />
          ))}
        </div>
      )}
    </article>
  );
}
