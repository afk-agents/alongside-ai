import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ArticleCard } from "@/components/articles/ArticleCard";
import type { Id } from "@/convex/_generated/dataModel";

// Mock the components
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
      data-author={author?.displayName}
      data-published-at={publishedAt}
      data-size={size}
    />
  ),
}));

vi.mock("@/components/tags/TagBadge", () => ({
  TagBadge: ({ tag, size }: { tag: { name: string; slug: string }; size?: string }) => (
    <span data-testid="tag-badge" data-tag-name={tag.name} data-size={size}>
      {tag.name}
    </span>
  ),
}));

describe("ArticleCard", () => {
  const mockArticle = {
    _id: "article123" as Id<"articles">,
    title: "Building AI Applications",
    slug: "building-ai-applications",
    excerpt: "Learn how to build AI applications with modern tools and frameworks.",
    publishedAt: Date.now(),
    author: {
      displayName: "Jane Doe",
      slug: "jane-doe",
    },
    tags: [
      { _id: "tag1" as Id<"tags">, name: "AI", slug: "ai" },
      { _id: "tag2" as Id<"tags">, name: "Tutorial", slug: "tutorial" },
    ],
  };

  it("renders article title", () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText("Building AI Applications")).toBeInTheDocument();
  });

  it("renders article as a link to blog post", () => {
    render(<ArticleCard article={mockArticle} />);
    const link = screen.getByRole("link", { name: /building ai applications/i });
    expect(link).toHaveAttribute("href", "/blog/building-ai-applications");
  });

  it("renders excerpt with truncation", () => {
    render(<ArticleCard article={mockArticle} />);
    expect(
      screen.getByText(
        "Learn how to build AI applications with modern tools and frameworks."
      )
    ).toBeInTheDocument();
  });

  it("renders ArticleMeta component", () => {
    render(<ArticleCard article={mockArticle} />);
    const meta = screen.getByTestId("article-meta");
    expect(meta).toHaveAttribute("data-author", "Jane Doe");
    expect(meta).toHaveAttribute("data-size", "sm");
  });

  it("renders tag badges", () => {
    render(<ArticleCard article={mockArticle} />);
    const badges = screen.getAllByTestId("tag-badge");
    expect(badges).toHaveLength(2);
    expect(badges[0]).toHaveAttribute("data-tag-name", "AI");
    expect(badges[1]).toHaveAttribute("data-tag-name", "Tutorial");
  });

  it("handles article without excerpt", () => {
    const articleNoExcerpt = { ...mockArticle, excerpt: undefined };
    render(<ArticleCard article={articleNoExcerpt} />);
    expect(screen.getByText("Building AI Applications")).toBeInTheDocument();
  });

  it("handles article without tags", () => {
    const articleNoTags = { ...mockArticle, tags: [] };
    render(<ArticleCard article={articleNoTags} />);
    expect(screen.queryAllByTestId("tag-badge")).toHaveLength(0);
  });

  it("handles null author", () => {
    const articleNoAuthor = { ...mockArticle, author: null };
    render(<ArticleCard article={articleNoAuthor} />);
    const meta = screen.getByTestId("article-meta");
    expect(meta).not.toHaveAttribute("data-author");
  });

  it("applies default variant styling", () => {
    const { container } = render(<ArticleCard article={mockArticle} />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("bg-white");
  });

  it("applies featured variant styling", () => {
    const { container } = render(
      <ArticleCard article={mockArticle} variant="featured" />
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("bg-gradient-to-br");
  });

  it("has hover effects", () => {
    const { container } = render(<ArticleCard article={mockArticle} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("hover:");
  });

  it("applies line-clamp class to excerpt", () => {
    render(<ArticleCard article={mockArticle} />);
    const excerptElement = screen.getByText(
      "Learn how to build AI applications with modern tools and frameworks."
    );
    expect(excerptElement).toHaveClass("line-clamp-2");
  });
});
