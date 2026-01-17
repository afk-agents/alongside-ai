import Link from "next/link";

interface TagBadgeProps {
  tag: { name: string; slug: string };
  size?: "sm" | "md";
}

export function TagBadge({ tag, size = "md" }: TagBadgeProps) {
  const sizeClasses =
    size === "sm"
      ? "text-xs px-2 py-0.5"
      : "text-sm px-3 py-1";

  return (
    <Link
      href={`/tags/${tag.slug}`}
      className={`inline-block rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors ${sizeClasses}`}
    >
      {tag.name}
    </Link>
  );
}
