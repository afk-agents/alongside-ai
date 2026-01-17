import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ArticleHeader } from "@/components/articles/ArticleHeader";
import type { Id } from "@/convex/_generated/dataModel";

// Mock ArticleMeta
vi.mock("@/components/articles/ArticleMeta", () => ({
  ArticleMeta: ({
    author,
    publishedAt,
    size,
  }: {
    author: { displayName?: string } | null;
    publishedAt: number;
    size?: string;
  }) => (
    <div
      data-testid="article-meta"
      data-author={author?.displayName ?? "null"}
      data-published={publishedAt}
      data-size={size}
    />
  ),
}));

// Mock TagBadge
vi.mock("@/components/tags/TagBadge", () => ({
  TagBadge: ({ tag }: { tag: { name: string; slug: string } }) => (
    <span data-testid="tag-badge">{tag.name}</span>
  ),
}));

describe("ArticleHeader", () => {
  const mockAuthor = {
    displayName: "Jane Doe",
    slug: "jane-doe",
    photoUrl: "https://example.com/jane.jpg",
    bio: "Author bio here",
  };

  const mockTags = [
    { _id: "tag1" as Id<"tags">, name: "React", slug: "react" },
    { _id: "tag2" as Id<"tags">, name: "TypeScript", slug: "typescript" },
  ];

  const now = Date.now();

  it("renders title as h1", () => {
    render(
      <ArticleHeader
        title="Test Article Title"
        author={mockAuthor}
        publishedAt={now}
        tags={mockTags}
      />
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Test Article Title");
  });

  it("renders ArticleMeta with md size", () => {
    render(
      <ArticleHeader
        title="Test Article"
        author={mockAuthor}
        publishedAt={now}
        tags={mockTags}
      />
    );
    const meta = screen.getByTestId("article-meta");
    expect(meta).toHaveAttribute("data-size", "md");
    expect(meta).toHaveAttribute("data-author", "Jane Doe");
    expect(meta).toHaveAttribute("data-published", String(now));
  });

  it("renders all tags as clickable badges", () => {
    render(
      <ArticleHeader
        title="Test Article"
        author={mockAuthor}
        publishedAt={now}
        tags={mockTags}
      />
    );
    const tags = screen.getAllByTestId("tag-badge");
    expect(tags).toHaveLength(2);
    expect(tags[0]).toHaveTextContent("React");
    expect(tags[1]).toHaveTextContent("TypeScript");
  });

  it("handles null author", () => {
    render(
      <ArticleHeader
        title="Test Article"
        author={null}
        publishedAt={now}
        tags={mockTags}
      />
    );
    const meta = screen.getByTestId("article-meta");
    expect(meta).toHaveAttribute("data-author", "null");
  });

  it("renders empty tags section when no tags", () => {
    render(
      <ArticleHeader
        title="Test Article"
        author={mockAuthor}
        publishedAt={now}
        tags={[]}
      />
    );
    expect(screen.queryByTestId("tag-badge")).not.toBeInTheDocument();
  });

  it("has proper accessibility structure", () => {
    render(
      <ArticleHeader
        title="Test Article"
        author={mockAuthor}
        publishedAt={now}
        tags={mockTags}
      />
    );
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });
});
