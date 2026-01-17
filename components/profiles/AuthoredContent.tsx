import Link from "next/link";

type ContentItem = {
  title: string;
  slug: string;
  type: "project" | "experiment" | "article" | "video";
};

interface AuthoredContentProps {
  content: {
    projects: ContentItem[];
    experiments: ContentItem[];
    articles: ContentItem[];
    videos: ContentItem[];
  };
}

const contentTypeConfig = {
  project: { urlPrefix: "/projects", label: "Projects" },
  experiment: { urlPrefix: "/experiments", label: "Experiments" },
  article: { urlPrefix: "/articles", label: "Articles" },
  video: { urlPrefix: "/videos", label: "Videos" },
} as const;

function ContentSection({
  items,
  type,
}: {
  items: ContentItem[];
  type: ContentItem["type"];
}) {
  if (items.length === 0) return null;

  const { urlPrefix, label } = contentTypeConfig[type];

  return (
    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        {label}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`${urlPrefix}/${item.slug}`}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AuthoredContent({ content }: AuthoredContentProps) {
  const { projects, experiments, articles, videos } = content;

  const hasContent =
    projects.length > 0 ||
    experiments.length > 0 ||
    articles.length > 0 ||
    videos.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div data-testid="authored-content">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Authored Content
      </h2>
      <ContentSection items={projects} type="project" />
      <ContentSection items={experiments} type="experiment" />
      <ContentSection items={articles} type="article" />
      <ContentSection items={videos} type="video" />
    </div>
  );
}
