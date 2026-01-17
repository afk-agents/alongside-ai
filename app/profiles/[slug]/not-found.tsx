import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Profile Not Found
      </h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        The profile you&apos;re looking for doesn&apos;t exist or is not publicly available.
      </p>
      <Link
        href="/about"
        className="mt-6 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Meet our team
      </Link>
    </div>
  );
}
