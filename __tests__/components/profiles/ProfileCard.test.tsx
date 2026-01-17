import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import { ProfileCard } from "@/components/profiles/ProfileCard";

// Mock the Convex useQuery hook for ProfilePhoto component
vi.mock("convex/react", () => ({
  useQuery: vi.fn(() => undefined),
}));

const mockProfile = {
  _id: "profile123" as unknown as import("convex/values").GenericId<"profiles">,
  displayName: "John Doe",
  bio: "Software engineer passionate about AI and machine learning. Building the future of technology.",
  slug: "john-doe",
  photoUrl: "https://example.com/photo.jpg",
  socialLinks: {
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
  },
};

describe("ProfileCard", () => {
  describe("rendering content", () => {
    it("displays the profile photo", () => {
      render(<ProfileCard profile={mockProfile} />);

      const photo = screen.getByTestId("profile-photo");
      expect(photo).toBeInTheDocument();
    });

    it("displays the display name", () => {
      render(<ProfileCard profile={mockProfile} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("displays bio excerpt", () => {
      render(<ProfileCard profile={mockProfile} />);

      expect(
        screen.getByText(/Software engineer passionate about AI/)
      ).toBeInTheDocument();
    });

    it("displays social links", () => {
      render(<ProfileCard profile={mockProfile} />);

      expect(screen.getByTestId("social-links")).toBeInTheDocument();
    });
  });

  describe("bio truncation", () => {
    it("applies line-clamp class for bio truncation", () => {
      render(<ProfileCard profile={mockProfile} />);

      const bioElement = screen.getByText(/Software engineer/);
      expect(bioElement).toHaveClass("line-clamp-3");
    });
  });

  describe("link behavior", () => {
    it("links card to profile page when slug exists", () => {
      render(<ProfileCard profile={mockProfile} />);

      const link = screen.getByRole("link", { name: /john doe/i });
      expect(link).toHaveAttribute("href", "/profiles/john-doe");
    });

    it("does not render link when slug is missing", () => {
      const profileWithoutSlug = { ...mockProfile, slug: undefined };
      render(<ProfileCard profile={profileWithoutSlug} />);

      const links = screen.queryAllByRole("link");
      // Only social links, not the card link
      const cardLink = links.find((l) => l.getAttribute("href")?.startsWith("/profiles/"));
      expect(cardLink).toBeUndefined();
    });
  });

  describe("view profile link", () => {
    it("shows View Profile link when showViewProfile is true", () => {
      render(<ProfileCard profile={mockProfile} showViewProfile />);

      const viewLink = screen.getByRole("link", { name: /view profile/i });
      expect(viewLink).toBeInTheDocument();
      expect(viewLink).toHaveAttribute("href", "/profiles/john-doe");
    });

    it("hides View Profile link by default", () => {
      render(<ProfileCard profile={mockProfile} />);

      expect(screen.queryByRole("link", { name: /view profile/i })).not.toBeInTheDocument();
    });

    it("hides View Profile link when slug is missing", () => {
      const profileWithoutSlug = { ...mockProfile, slug: undefined };
      render(<ProfileCard profile={profileWithoutSlug} showViewProfile />);

      expect(screen.queryByRole("link", { name: /view profile/i })).not.toBeInTheDocument();
    });
  });

  describe("hover state", () => {
    it("has hover state styling", () => {
      render(<ProfileCard profile={mockProfile} />);

      const card = screen.getByTestId("profile-card");
      expect(card).toHaveClass("hover:shadow-lg");
    });
  });

  describe("responsive design", () => {
    it("has responsive width classes", () => {
      render(<ProfileCard profile={mockProfile} />);

      const card = screen.getByTestId("profile-card");
      expect(card).toHaveClass("w-full");
    });
  });

  describe("missing data handling", () => {
    it("handles missing bio gracefully", () => {
      const profileWithoutBio = { ...mockProfile, bio: undefined };
      render(<ProfileCard profile={profileWithoutBio} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("handles missing socialLinks gracefully", () => {
      const profileWithoutSocial = { ...mockProfile, socialLinks: undefined };
      render(<ProfileCard profile={profileWithoutSocial} />);

      expect(screen.queryByTestId("social-links")).not.toBeInTheDocument();
    });

    it("handles missing photoUrl gracefully", () => {
      const profileWithoutPhoto = { ...mockProfile, photoUrl: undefined };
      render(<ProfileCard profile={profileWithoutPhoto} />);

      // Should show initials fallback
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("handles missing displayName with fallback", () => {
      const profileWithoutName = { ...mockProfile, displayName: undefined };
      render(<ProfileCard profile={profileWithoutName} />);

      // Should still render the card
      const card = screen.getByTestId("profile-card");
      expect(card).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    it("renders with rounded corners", () => {
      render(<ProfileCard profile={mockProfile} />);

      const card = screen.getByTestId("profile-card");
      expect(card).toHaveClass("rounded-lg");
    });

    it("renders with border", () => {
      render(<ProfileCard profile={mockProfile} />);

      const card = screen.getByTestId("profile-card");
      expect(card).toHaveClass("border");
    });

    it("has transition for smooth hover effect", () => {
      render(<ProfileCard profile={mockProfile} />);

      const card = screen.getByTestId("profile-card");
      expect(card).toHaveClass("transition-shadow");
    });
  });
});
