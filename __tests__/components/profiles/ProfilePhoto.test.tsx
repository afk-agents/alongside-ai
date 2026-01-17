import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import { ProfilePhoto } from "@/components/profiles/ProfilePhoto";

// Mock the Convex useQuery hook
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
}));

import { useQuery } from "convex/react";

describe("ProfilePhoto", () => {
  describe("with photoUrl", () => {
    it("renders an image when photoUrl is provided", () => {
      render(
        <ProfilePhoto
          photoUrl="https://example.com/photo.jpg"
          displayName="John Doe"
        />
      );

      const img = screen.getByRole("img", { name: /john doe/i });
      expect(img).toBeInTheDocument();
    });

    it("uses displayName as alt text for image", () => {
      render(
        <ProfilePhoto
          photoUrl="https://example.com/photo.jpg"
          displayName="Jane Smith"
        />
      );

      const img = screen.getByRole("img", { name: /jane smith/i });
      expect(img).toHaveAttribute("alt", "Jane Smith");
    });
  });

  describe("with initials fallback", () => {
    it("displays initials when photoUrl is missing but displayName exists", () => {
      render(<ProfilePhoto displayName="John Doe" />);

      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("uses first letter of each word for initials (max 2)", () => {
      render(<ProfilePhoto displayName="Alice Bob Charlie" />);

      // Should only use first two initials
      expect(screen.getByText("AB")).toBeInTheDocument();
    });

    it("handles single-word displayName", () => {
      render(<ProfilePhoto displayName="Mononym" />);

      expect(screen.getByText("M")).toBeInTheDocument();
    });

    it("handles lowercase displayName", () => {
      render(<ProfilePhoto displayName="john doe" />);

      expect(screen.getByText("JD")).toBeInTheDocument();
    });
  });

  describe("generic placeholder", () => {
    it("displays generic placeholder when both photoUrl and displayName are missing", () => {
      render(<ProfilePhoto />);

      // Should show a user icon or generic avatar
      const placeholder = screen.getByTestId("profile-photo-placeholder");
      expect(placeholder).toBeInTheDocument();
    });
  });

  describe("size variants", () => {
    it("applies sm size classes", () => {
      render(<ProfilePhoto displayName="Test User" size="sm" />);

      const container = screen.getByTestId("profile-photo");
      expect(container).toHaveClass("w-8", "h-8");
    });

    it("applies md size classes (default)", () => {
      render(<ProfilePhoto displayName="Test User" size="md" />);

      const container = screen.getByTestId("profile-photo");
      expect(container).toHaveClass("w-12", "h-12");
    });

    it("applies lg size classes", () => {
      render(<ProfilePhoto displayName="Test User" size="lg" />);

      const container = screen.getByTestId("profile-photo");
      expect(container).toHaveClass("w-16", "h-16");
    });

    it("applies xl size classes", () => {
      render(<ProfilePhoto displayName="Test User" size="xl" />);

      const container = screen.getByTestId("profile-photo");
      expect(container).toHaveClass("w-24", "h-24");
    });

    it("defaults to md size when no size prop provided", () => {
      render(<ProfilePhoto displayName="Test User" />);

      const container = screen.getByTestId("profile-photo");
      expect(container).toHaveClass("w-12", "h-12");
    });
  });

  describe("image error handling", () => {
    it("falls back to initials when image fails to load", () => {
      render(
        <ProfilePhoto
          photoUrl="https://example.com/broken.jpg"
          displayName="Error Test"
        />
      );

      const img = screen.getByRole("img");
      fireEvent.error(img);

      // After error, should show initials
      expect(screen.getByText("ET")).toBeInTheDocument();
    });

    it("falls back to placeholder when image fails and no displayName", () => {
      render(<ProfilePhoto photoUrl="https://example.com/broken.jpg" />);

      const img = screen.getByRole("img");
      fireEvent.error(img);

      // After error, should show placeholder
      expect(screen.getByTestId("profile-photo-placeholder")).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    it("renders as a rounded circle", () => {
      render(<ProfilePhoto displayName="Test User" />);

      const container = screen.getByTestId("profile-photo");
      expect(container).toHaveClass("rounded-full");
    });

    it("has accessible background for initials", () => {
      render(<ProfilePhoto displayName="Test User" />);

      const container = screen.getByTestId("profile-photo");
      expect(container).toHaveClass("bg-gray-200");
    });
  });

  describe("accessibility", () => {
    it("provides appropriate aria-label for image", () => {
      render(
        <ProfilePhoto
          photoUrl="https://example.com/photo.jpg"
          displayName="John Doe"
        />
      );

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("alt", "John Doe");
    });

    it("provides aria-label for placeholder", () => {
      render(<ProfilePhoto />);

      const container = screen.getByTestId("profile-photo");
      expect(container).toHaveAttribute("aria-label", "Profile photo");
    });
  });

  describe("with photoStorageId", () => {
    beforeEach(() => {
      vi.mocked(useQuery).mockReset();
    });

    it("renders image when storage URL is fetched successfully", () => {
      vi.mocked(useQuery).mockReturnValue("https://storage.convex.cloud/photo.jpg");

      render(
        <ProfilePhoto
          photoStorageId={"abc123" as unknown as import("@/convex/_generated/dataModel").Id<"_storage">}
          displayName="Storage User"
        />
      );

      const img = screen.getByRole("img", { name: /storage user/i });
      expect(img).toBeInTheDocument();
    });

    it("shows loading state while fetching URL", () => {
      vi.mocked(useQuery).mockReturnValue(undefined);

      render(
        <ProfilePhoto
          photoStorageId={"abc123" as unknown as import("@/convex/_generated/dataModel").Id<"_storage">}
          displayName="Loading User"
        />
      );

      // Should show initials while loading
      expect(screen.getByText("LU")).toBeInTheDocument();
    });

    it("shows initials when storage URL is null", () => {
      vi.mocked(useQuery).mockReturnValue(null);

      render(
        <ProfilePhoto
          photoStorageId={"abc123" as unknown as import("@/convex/_generated/dataModel").Id<"_storage">}
          displayName="Null User"
        />
      );

      // Should show initials when URL is null
      expect(screen.getByText("NU")).toBeInTheDocument();
    });

    it("prefers photoUrl over photoStorageId when both provided", () => {
      vi.mocked(useQuery).mockReturnValue("https://storage.convex.cloud/storage-photo.jpg");

      render(
        <ProfilePhoto
          photoUrl="https://example.com/direct-photo.jpg"
          photoStorageId={"abc123" as unknown as import("@/convex/_generated/dataModel").Id<"_storage">}
          displayName="Both User"
        />
      );

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", expect.stringContaining("direct-photo.jpg"));
    });
  });
});
