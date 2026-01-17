"use client";

import { useEffect } from "react";
import Link from "next/link";
import { NavLink } from "./NavLink";
import { AuthNav } from "@/components/auth/AuthNav";
import { PRIMARY_NAV } from "@/lib/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 md:hidden"
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Menu
          </span>
          <button
            type="button"
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="px-4 py-4">
          <div className="space-y-1">
            {PRIMARY_NAV.map((item) => (
              <div key={item.href} onClick={onClose}>
                <NavLink
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-base text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                  activeClassName="bg-gray-100 text-gray-900 font-semibold dark:bg-gray-800 dark:text-gray-100"
                >
                  {item.label}
                </NavLink>
              </div>
            ))}

            {/* Search Link */}
            <Link
              href="/search"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-base text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              onClick={onClose}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </Link>
          </div>

          {/* Auth */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <AuthNav />
          </div>
        </nav>
      </div>
    </div>
  );
}
