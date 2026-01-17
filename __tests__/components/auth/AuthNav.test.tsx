import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import { AuthNav } from "@/components/auth/AuthNav";

// Mock useConvexAuth
const mockUseConvexAuth = vi.fn();
vi.mock("convex/react", () => ({
  useConvexAuth: () => mockUseConvexAuth(),
  useQuery: vi.fn(() => null),
}));

// Mock SignOutButton to simplify testing
vi.mock("@/components/auth/SignOutButton", () => ({
  SignOutButton: () => <button>Sign out</button>,
}));

describe("AuthNav", () => {
  beforeEach(() => {
    mockUseConvexAuth.mockReset();
  });

  it("shows loading skeleton while auth is loading", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });

    render(<AuthNav />);

    // Should show the loading skeleton (animated div)
    const skeleton = document.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
  });

  it("shows sign in link when not authenticated", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });

    render(<AuthNav />);

    const signInLink = screen.getByRole("link", { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute("href", "/login");
  });

  it("shows sign out button when authenticated", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });

    render(<AuthNav />);

    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });
});
