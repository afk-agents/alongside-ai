import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import { ProfilePage } from "@/components/profiles/ProfilePage";

const mockProfile = {
  _id: "profile123" as unknown as import("convex/values").GenericId<"profiles">,
  _creationTime: 1234567890,
  userId: "user1" as unknown as import("convex/values").GenericId<"users">,
  role: "admin" as const,
  profileStatus: "published" as const,
  displayName: "John Doe",
  bio: "Software engineer passionate about AI and machine learning. Building the future of technology with innovative solutions.",
  slug: "john-doe",
  photoUrl: "https://example.com/photo.jpg",
  location: "San Francisco, CA",
  skills: ["TypeScript", "React", "AI/ML", "Node.js"],
  workingOnNow: "Building an AI-powered learning platform",
  socialLinks: {
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
    twitter: "https://twitter.com/johndoe",
    website: "https://johndoe.com",
  },
};

describe("ProfilePage", () => {
  describe("photo display", () => {
    it("renders profile photo in xl size", () => {
      render(<ProfilePage profile={mockProfile} />);

      const photo = screen.getByTestId("profile-photo");
      expect(photo).toBeInTheDocument();
      expect(photo).toHaveClass("w-24", "h-24"); // xl size
    });
  });

  describe("header content", () => {
    it("renders displayName as h1", () => {
      render(<ProfilePage profile={mockProfile} />);

      const heading = screen.getByRole("heading", { level: 1, name: "John Doe" });
      expect(heading).toBeInTheDocument();
    });

    it("renders location when provided", () => {
      render(<ProfilePage profile={mockProfile} />);

      expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
    });

    it("hides location when not provided", () => {
      const profileWithoutLocation = { ...mockProfile, location: undefined };
      render(<ProfilePage profile={profileWithoutLocation} />);

      expect(screen.queryByTestId("profile-location")).not.toBeInTheDocument();
    });
  });

  describe("bio display", () => {
    it("renders full bio text", () => {
      render(<ProfilePage profile={mockProfile} />);

      expect(
        screen.getByText(/Software engineer passionate about AI/)
      ).toBeInTheDocument();
    });

    it("hides bio section when not provided", () => {
      const profileWithoutBio = { ...mockProfile, bio: undefined };
      render(<ProfilePage profile={profileWithoutBio} />);

      expect(screen.queryByTestId("profile-bio")).not.toBeInTheDocument();
    });
  });

  describe("skills display", () => {
    it("renders skills as tags", () => {
      render(<ProfilePage profile={mockProfile} />);

      expect(screen.getByText("TypeScript")).toBeInTheDocument();
      expect(screen.getByText("React")).toBeInTheDocument();
      expect(screen.getByText("AI/ML")).toBeInTheDocument();
      expect(screen.getByText("Node.js")).toBeInTheDocument();
    });

    it("hides skills section when not provided", () => {
      const profileWithoutSkills = { ...mockProfile, skills: undefined };
      render(<ProfilePage profile={profileWithoutSkills} />);

      expect(screen.queryByTestId("profile-skills")).not.toBeInTheDocument();
    });

    it("hides skills section when empty array", () => {
      const profileWithEmptySkills = { ...mockProfile, skills: [] };
      render(<ProfilePage profile={profileWithEmptySkills} />);

      expect(screen.queryByTestId("profile-skills")).not.toBeInTheDocument();
    });
  });

  describe("workingOnNow display", () => {
    it("renders workingOnNow section", () => {
      render(<ProfilePage profile={mockProfile} />);

      expect(screen.getByText(/Currently Working On/i)).toBeInTheDocument();
      expect(
        screen.getByText("Building an AI-powered learning platform")
      ).toBeInTheDocument();
    });

    it("hides workingOnNow when not provided", () => {
      const profileWithoutWorking = { ...mockProfile, workingOnNow: undefined };
      render(<ProfilePage profile={profileWithoutWorking} />);

      expect(screen.queryByTestId("profile-working-on")).not.toBeInTheDocument();
    });
  });

  describe("social links", () => {
    it("renders SocialLinks component", () => {
      render(<ProfilePage profile={mockProfile} />);

      expect(screen.getByTestId("social-links")).toBeInTheDocument();
    });

    it("hides social links when not provided", () => {
      const profileWithoutSocial = { ...mockProfile, socialLinks: undefined };
      render(<ProfilePage profile={profileWithoutSocial} />);

      expect(screen.queryByTestId("social-links")).not.toBeInTheDocument();
    });
  });

  describe("minimal profile", () => {
    it("renders with only required fields", () => {
      const minimalProfile = {
        _id: "profile123" as unknown as import("convex/values").GenericId<"profiles">,
        _creationTime: 1234567890,
        userId: "user1" as unknown as import("convex/values").GenericId<"users">,
        role: "admin" as const,
        profileStatus: "published" as const,
      };

      render(<ProfilePage profile={minimalProfile} />);

      // Should render without errors, showing placeholder photo
      expect(screen.getByTestId("profile-photo")).toBeInTheDocument();
    });
  });
});
