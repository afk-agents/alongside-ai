import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import { Header } from "@/components/layout/Header";

// Mock usePathname from next/navigation
const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock useConvexAuth for AuthNav
const mockUseConvexAuth = vi.fn();
vi.mock("convex/react", () => ({
  useConvexAuth: () => mockUseConvexAuth(),
  useQuery: vi.fn(() => null),
}));

// Mock SignOutButton to simplify testing
vi.mock("@/components/auth/SignOutButton", () => ({
  SignOutButton: () => <button>Sign out</button>,
}));

describe("Header", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
  });

  it("renders a semantic header element", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders site logo that links to homepage", () => {
    render(<Header />);
    const logo = screen.getByRole("link", { name: /alongside ai/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("href", "/");
  });

  it("renders a nav element with primary navigation", () => {
    render(<Header />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("displays all 6 primary nav links", () => {
    render(<Header />);

    expect(screen.getByRole("link", { name: /^home$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^events$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^lab$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^learn$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^blog$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^about$/i })).toBeInTheDocument();
  });

  it("has correct hrefs for primary nav links", () => {
    render(<Header />);

    expect(screen.getByRole("link", { name: /^home$/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /^events$/i })).toHaveAttribute("href", "/events");
    expect(screen.getByRole("link", { name: /^lab$/i })).toHaveAttribute("href", "/lab");
    expect(screen.getByRole("link", { name: /^learn$/i })).toHaveAttribute("href", "/learn");
    expect(screen.getByRole("link", { name: /^blog$/i })).toHaveAttribute("href", "/blog");
    expect(screen.getByRole("link", { name: /^about$/i })).toHaveAttribute("href", "/about");
  });

  it("includes search link that points to /search", () => {
    render(<Header />);
    const searchLink = screen.getByRole("link", { name: /search/i });
    expect(searchLink).toBeInTheDocument();
    expect(searchLink).toHaveAttribute("href", "/search");
  });

  it("integrates AuthNav component", () => {
    render(<Header />);
    // When not authenticated, should show Sign in link
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows hamburger button for mobile menu", () => {
    render(<Header />);
    const hamburger = screen.getByRole("button", { name: /menu/i });
    expect(hamburger).toBeInTheDocument();
  });

  it("desktop nav has hidden md:flex classes for responsive behavior", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation");
    // The nav should have responsive classes
    expect(nav.className).toMatch(/hidden/);
    expect(nav.className).toMatch(/md:flex/);
  });

  describe("active link indication", () => {
    it("shows active styling on current page link", () => {
      mockUsePathname.mockReturnValue("/events");
      render(<Header />);
      const eventsLink = screen.getByRole("link", { name: /^events$/i });
      expect(eventsLink).toHaveClass("font-semibold");
    });

    it("does not show active styling on non-current page links", () => {
      mockUsePathname.mockReturnValue("/events");
      render(<Header />);
      const blogLink = screen.getByRole("link", { name: /^blog$/i });
      expect(blogLink).not.toHaveClass("font-semibold");
    });

    it("shows active styling for nested routes", () => {
      mockUsePathname.mockReturnValue("/events/123");
      render(<Header />);
      const eventsLink = screen.getByRole("link", { name: /^events$/i });
      expect(eventsLink).toHaveClass("font-semibold");
    });
  });
});
