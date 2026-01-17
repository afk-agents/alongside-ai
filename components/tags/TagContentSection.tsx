import Link from "next/link";

interface ContentItem {
  title: string;
  slug: string;
}

interface TagContentSectionProps {
  title: string;
  items: ContentItem[];
  linkPrefix: string;
}

export function TagContentSection({
  title,
  items,
  linkPrefix,
}: TagContentSectionProps) {
  // Don't render anything if there are no items
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
        {title}{" "}
        <span className="text-gray-500 font-normal">({items.length})</span>
      </h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`${linkPrefix}/${item.slug}`}
              className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
