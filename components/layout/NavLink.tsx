"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
}

export function NavLink({
  href,
  children,
  className = "",
  activeClassName = "",
}: NavLinkProps) {
  const pathname = usePathname();

  // Special case for home: only match exactly "/"
  // For other routes: match exactly or when pathname starts with href/
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const combinedClassName = isActive
    ? `${className} ${activeClassName}`.trim()
    : className;

  return (
    <Link href={href} className={combinedClassName}>
      {children}
    </Link>
  );
}
