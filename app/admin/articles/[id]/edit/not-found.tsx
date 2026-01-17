import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Article Not Found
      </h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        The article you&apos;re looking for doesn&apos;t exist or has been deleted.
      </p>
      <Link
        href="/admin/articles"
        className="mt-6 inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        ← Back to Articles
      </Link>
    </div>
  );
}
