import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ArticleMeta } from "@/components/articles/ArticleMeta";

// Mock the ProfilePhoto component
vi.mock("@/components/profiles/ProfilePhoto", () => ({
  ProfilePhoto: ({
    displayName,
    photoUrl,
    size,
  }: {
    displayName?: string;
    photoUrl?: string;
    size?: string;
  }) => (
    <div
      data-testid="profile-photo"
      data-display-name={displayName}
      data-photo-url={photoUrl}
      data-size={size}
    />
  ),
}));

describe("ArticleMeta", () => {
  const mockAuthor = {
    displayName: "Jane Doe",
    slug: "jane-doe",
    photoUrl: "https://example.com/jane.jpg",
  };

  const now = Date.now();

  it("renders author name with link", () => {
    render(<ArticleMeta author={mockAuthor} publishedAt={now} />);
    const link = screen.getByRole("link", { name: /jane doe/i });
    expect(link).toHaveAttribute("href", "/profiles/jane-doe");
  });

  it("renders ProfilePhoto component", () => {
    render(<ArticleMeta author={mockAuthor} publishedAt={now} />);
    const photo = screen.getByTestId("profile-photo");
    expect(photo).toHaveAttribute("data-display-name", "Jane Doe");
    expect(photo).toHaveAttribute(
      "data-photo-url",
      "https://example.com/jane.jpg"
    );
  });

  it('renders "Unknown Author" when author is null', () => {
    render(<ArticleMeta author={null} publishedAt={now} />);
    expect(screen.getByText("Unknown Author")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders formatted date", () => {
    // January 15, 2026
    const date = new Date(2026, 0, 15).getTime();
    render(<ArticleMeta author={mockAuthor} publishedAt={date} />);
    expect(screen.getByText("January 15, 2026")).toBeInTheDocument();
  });

  it("applies sm size styles", () => {
    render(<ArticleMeta author={mockAuthor} publishedAt={now} size="sm" />);
    const photo = screen.getByTestId("profile-photo");
    expect(photo).toHaveAttribute("data-size", "sm");
  });

  it("applies md size styles by default", () => {
    render(<ArticleMeta author={mockAuthor} publishedAt={now} />);
    const photo = screen.getByTestId("profile-photo");
    expect(photo).toHaveAttribute("data-size", "sm");
  });

  it("handles author without photoUrl", () => {
    const authorNoPhoto = {
      displayName: "John Smith",
      slug: "john-smith",
    };
    render(<ArticleMeta author={authorNoPhoto} publishedAt={now} />);
    const photo = screen.getByTestId("profile-photo");
    expect(photo).toHaveAttribute("data-display-name", "John Smith");
  });

  it("handles author without displayName", () => {
    const authorNoName = {
      slug: "anonymous",
    };
    render(<ArticleMeta author={authorNoName} publishedAt={now} />);
    // Should still link to profile
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/profiles/anonymous");
    // Should show placeholder text
    expect(screen.getByText("Anonymous")).toBeInTheDocument();
  });

  it("has accessible aria-label", () => {
    const date = new Date(2026, 0, 15).getTime();
    render(<ArticleMeta author={mockAuthor} publishedAt={date} />);
    const container = screen.getByLabelText(
      /written by jane doe on january 15, 2026/i
    );
    expect(container).toBeInTheDocument();
  });

  it("applies md size with larger photo", () => {
    render(<ArticleMeta author={mockAuthor} publishedAt={now} size="md" />);
    const photo = screen.getByTestId("profile-photo");
    expect(photo).toHaveAttribute("data-size", "md");
  });
});
