"use client";

import { useState } from "react";
import Link from "next/link";
import { NavLink } from "./NavLink";
import { MobileMenu } from "./MobileMenu";
import { AuthNav } from "@/components/auth/AuthNav";
import { PRIMARY_NAV } from "@/lib/navigation";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-xl font-semibold text-gray-900 dark:text-gray-100"
            >
              Alongside AI
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {PRIMARY_NAV.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                activeClassName="text-gray-900 font-semibold dark:text-gray-100"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Secondary Navigation (Search + Auth) */}
          <div className="flex items-center gap-4">
            {/* Search Link */}
            <Link
              href="/search"
              className="hidden md:flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              aria-label="Search"
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
            </Link>

            {/* Auth Navigation (desktop) */}
            <div className="hidden md:block">
              <AuthNav />
            </div>

            {/* Hamburger Menu Button (mobile) */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
              onClick={() => setMobileMenuOpen(true)}
              aria-expanded={mobileMenuOpen}
              aria-label="Open menu"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </header>
  );
}
