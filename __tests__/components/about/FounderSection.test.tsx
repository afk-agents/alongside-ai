import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import { FounderSection } from "@/components/about/FounderSection";

// Mock the Convex useQuery hook
const mockUseQuery = vi.fn();
vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

// Mock the Convex API
vi.mock("@/convex/_generated/api", () => ({
  api: {
    profiles: {
      getFounders: "profiles:getFounders",
    },
  },
}));

const mockFounders = [
  {
    _id: "profile1",
    _creationTime: 1234567890,
    userId: "user1",
    role: "admin" as const,
    profileStatus: "published" as const,
    displayName: "David Chen",
    bio: "Co-founder passionate about AI education and building inclusive communities.",
    slug: "david",
    photoUrl: "https://example.com/david.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/davidchen",
      twitter: "https://twitter.com/davidchen",
    },
  },
  {
    _id: "profile2",
    _creationTime: 1234567891,
    userId: "user2",
    role: "admin" as const,
    profileStatus: "published" as const,
    displayName: "Nathan Wu",
    bio: "Co-founder focused on practical AI applications and hands-on learning experiences.",
    slug: "nathan",
    photoUrl: "https://example.com/nathan.jpg",
    socialLinks: {
      github: "https://github.com/nathanwu",
    },
  },
];

describe("FounderSection", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  describe("loading state", () => {
    it("shows loading skeleton when founders are loading", () => {
      mockUseQuery.mockReturnValue(undefined);

      render(<FounderSection />);

      expect(screen.getByTestId("founder-skeleton")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows coming soon message when no founders exist", () => {
      mockUseQuery.mockReturnValue([]);

      render(<FounderSection />);

      expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
    });
  });

  describe("founders display", () => {
    it("renders Meet the Founders heading", () => {
      mockUseQuery.mockReturnValue(mockFounders);

      render(<FounderSection />);

      expect(
        screen.getByRole("heading", { name: /meet the founders/i })
      ).toBeInTheDocument();
    });

    it("displays all founder profiles", () => {
      mockUseQuery.mockReturnValue(mockFounders);

      render(<FounderSection />);

      expect(screen.getByText("David Chen")).toBeInTheDocument();
      expect(screen.getByText("Nathan Wu")).toBeInTheDocument();
    });

    it("renders ProfileCard for each founder", () => {
      mockUseQuery.mockReturnValue(mockFounders);

      render(<FounderSection />);

      const cards = screen.getAllByTestId("profile-card");
      expect(cards).toHaveLength(2);
    });
  });

  describe("responsive grid", () => {
    it("renders founders in a grid layout", () => {
      mockUseQuery.mockReturnValue(mockFounders);

      render(<FounderSection />);

      const grid = screen.getByTestId("founders-grid");
      expect(grid).toHaveClass("grid");
    });

    it("has responsive grid columns", () => {
      mockUseQuery.mockReturnValue(mockFounders);

      render(<FounderSection />);

      const grid = screen.getByTestId("founders-grid");
      expect(grid).toHaveClass("md:grid-cols-2");
    });
  });

  describe("query calls", () => {
    it("calls profiles.getFounders query", () => {
      mockUseQuery.mockReturnValue([]);

      render(<FounderSection />);

      expect(mockUseQuery).toHaveBeenCalledWith("profiles:getFounders");
    });
  });
});
