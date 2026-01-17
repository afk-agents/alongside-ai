import Link from "next/link";
import { FOOTER_NAV, SOCIAL_LINKS } from "@/lib/navigation";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          {/* Utility Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {FOOTER_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-500">
          © {new Date().getFullYear()} Alongside AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
