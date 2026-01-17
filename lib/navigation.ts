export const PRIMARY_NAV = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Lab", href: "/lab" },
  { label: "Learn", href: "/learn" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
] as const;

export const FOOTER_NAV = [
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "FAQ", href: "/faq" },
] as const;

export const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/alongside-ai",
    external: true,
  },
  {
    label: "Substack",
    href: "https://alongsideai.substack.com",
    external: true,
  },
] as const;

export type NavItem = (typeof PRIMARY_NAV)[number];
export type FooterNavItem = (typeof FOOTER_NAV)[number];
export type SocialLinkItem = (typeof SOCIAL_LINKS)[number];
