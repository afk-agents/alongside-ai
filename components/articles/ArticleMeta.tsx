import Link from "next/link";
import { ProfilePhoto } from "@/components/profiles/ProfilePhoto";

interface Author {
  displayName?: string;
  slug?: string;
  photoUrl?: string;
}

interface ArticleMetaProps {
  author: Author | null;
  publishedAt: number;
  size?: "sm" | "md";
}

/**
 * Format a timestamp to a readable date string.
 * Uses Intl.DateTimeFormat for locale-aware formatting.
 */
function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(timestamp));
}

/**
 * ArticleMeta displays author attribution and publication date.
 *
 * @param author - Author profile object or null
 * @param publishedAt - Publication timestamp
 * @param size - Display size: "sm" for cards, "md" for article pages
 */
export function ArticleMeta({ author, publishedAt, size = "sm" }: ArticleMetaProps) {
  const formattedDate = formatDate(publishedAt);
  const authorName = author?.displayName || (author?.slug ? "Anonymous" : null);
  const authorSlug = author?.slug;

  const photoSize = size === "md" ? "md" : "sm";
  const textSizeClass = size === "md" ? "text-base" : "text-sm";

  const ariaLabel = author
    ? `Written by ${authorName} on ${formattedDate}`
    : `Published on ${formattedDate}`;

  return (
    <div
      className={`flex items-center gap-3 ${textSizeClass}`}
      aria-label={ariaLabel}
    >
      {author ? (
        <>
          <ProfilePhoto
            photoUrl={author.photoUrl}
            displayName={author.displayName}
            size={photoSize}
          />
          <div className="flex flex-col">
            {authorSlug ? (
              <Link
                href={`/profiles/${authorSlug}`}
                className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {authorName}
              </Link>
            ) : (
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {authorName}
              </span>
            )}
            <time
              dateTime={new Date(publishedAt).toISOString()}
              className="text-gray-500 dark:text-gray-400"
            >
              {formattedDate}
            </time>
          </div>
        </>
      ) : (
        <div className="flex flex-col">
          <span className="font-medium text-gray-500 dark:text-gray-400">
            Unknown Author
          </span>
          <time
            dateTime={new Date(publishedAt).toISOString()}
            className="text-gray-500 dark:text-gray-400"
          >
            {formattedDate}
          </time>
        </div>
      )}
    </div>
  );
}
