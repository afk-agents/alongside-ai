import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import { MobileMenu } from "@/components/layout/MobileMenu";

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

describe("MobileMenu", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockUsePathname.mockReturnValue("/");
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
  });

  afterEach(() => {
    // Reset body overflow style
    document.body.style.overflow = "";
  });

  describe("when closed", () => {
    it("renders nothing when isOpen is false", () => {
      const { container } = render(
        <MobileMenu isOpen={false} onClose={mockOnClose} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("when open", () => {
    it("renders the menu panel when isOpen is true", () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Menu")).toBeInTheDocument();
    });

    it("displays all primary navigation links", () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /events/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /lab/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /learn/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /blog/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument();
    });

    it("displays search link", () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole("link", { name: /search/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /search/i })).toHaveAttribute(
        "href",
        "/search"
      );
    });

    it("renders close button", () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      expect(
        screen.getByRole("button", { name: /close menu/i })
      ).toBeInTheDocument();
    });

    it("calls onClose when close button is clicked", () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      const closeButton = screen.getByRole("button", { name: /close menu/i });
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when backdrop is clicked", () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      // The backdrop is the first div inside the container with aria-hidden="true"
      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop).not.toBeNull();
      fireEvent.click(backdrop!);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when Escape key is pressed", () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      fireEvent.keyDown(document, { key: "Escape" });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("prevents body scroll when open", () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("has aria-hidden attribute on the container", () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      // The outer container has aria-hidden={!isOpen}, which is "false" when open
      const menuContainer = screen.getByText("Menu").closest(
        ".fixed.inset-0.z-50"
      );
      expect(menuContainer).toHaveAttribute("aria-hidden", "false");
    });

    it("calls onClose when search link is clicked", () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      const searchLink = screen.getByRole("link", { name: /search/i });
      fireEvent.click(searchLink);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when navigation link is clicked", () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      const eventsLink = screen.getByRole("link", { name: /events/i });
      fireEvent.click(eventsLink);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("accessibility", () => {
    it("all navigation links are keyboard accessible via Tab", () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).not.toHaveAttribute("tabIndex", "-1");
      });
    });

    it("close button is keyboard accessible", () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      const closeButton = screen.getByRole("button", { name: /close menu/i });
      expect(closeButton).not.toHaveAttribute("tabIndex", "-1");
    });
  });

  describe("active link indication", () => {
    it("shows active styling on current page link", () => {
      mockUsePathname.mockReturnValue("/events");
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      const eventsLink = screen.getByRole("link", { name: /^events$/i });
      expect(eventsLink).toHaveClass("font-semibold");
    });

    it("does not show active styling on non-current page links", () => {
      mockUsePathname.mockReturnValue("/events");
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      const blogLink = screen.getByRole("link", { name: /^blog$/i });
      expect(blogLink).not.toHaveClass("font-semibold");
    });

    it("shows active styling for nested routes", () => {
      mockUsePathname.mockReturnValue("/events/123");
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      const eventsLink = screen.getByRole("link", { name: /^events$/i });
      expect(eventsLink).toHaveClass("font-semibold");
    });
  });
});
