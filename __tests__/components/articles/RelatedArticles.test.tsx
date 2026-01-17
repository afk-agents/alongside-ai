import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
import { useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";

// Mock convex/react
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
}));

// Mock the api module
vi.mock("@/convex/_generated/api", () => ({
  api: {
    articles: {
      getRelated: "articles.getRelated",
    },
  },
}));

describe("RelatedArticles", () => {
  const mockArticleId = "article123" as Id<"articles">;

  const mockRelatedArticles = [
    {
      _id: "related1" as Id<"articles">,
      title: "Related Article One",
      slug: "related-article-one",
      excerpt: "This is the first related article.",
      publishedAt: Date.now() - 86400000, // 1 day ago
      sharedTagCount: 2,
    },
    {
      _id: "related2" as Id<"articles">,
      title: "Related Article Two",
      slug: "related-article-two",
      excerpt: "This is the second related article.",
      publishedAt: Date.now() - 172800000, // 2 days ago
      sharedTagCount: 1,
    },
    {
      _id: "related3" as Id<"articles">,
      title: "Related Article Three",
      slug: "related-article-three",
      excerpt: undefined,
      publishedAt: Date.now() - 259200000, // 3 days ago
      sharedTagCount: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders null while loading (undefined)", () => {
    (useQuery as Mock).mockReturnValue(undefined);
    const { container } = render(<RelatedArticles articleId={mockArticleId} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders null when no related articles exist", () => {
    (useQuery as Mock).mockReturnValue([]);
    const { container } = render(<RelatedArticles articleId={mockArticleId} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders section heading when related articles exist", () => {
    (useQuery as Mock).mockReturnValue(mockRelatedArticles);
    render(<RelatedArticles articleId={mockArticleId} />);
    // Check for heading (could be "Related Articles" or "Keep Reading")
    expect(
      screen.getByRole("heading", { name: /related articles|keep reading/i })
    ).toBeInTheDocument();
  });

  it("renders up to 3 related articles", () => {
    (useQuery as Mock).mockReturnValue(mockRelatedArticles);
    render(<RelatedArticles articleId={mockArticleId} />);

    expect(screen.getByText("Related Article One")).toBeInTheDocument();
    expect(screen.getByText("Related Article Two")).toBeInTheDocument();
    expect(screen.getByText("Related Article Three")).toBeInTheDocument();
  });

  it("renders article titles as links to /blog/[slug]", () => {
    (useQuery as Mock).mockReturnValue(mockRelatedArticles);
    render(<RelatedArticles articleId={mockArticleId} />);

    const link1 = screen.getByRole("link", { name: /related article one/i });
    expect(link1).toHaveAttribute("href", "/blog/related-article-one");

    const link2 = screen.getByRole("link", { name: /related article two/i });
    expect(link2).toHaveAttribute("href", "/blog/related-article-two");
  });

  it("renders article excerpts when available", () => {
    (useQuery as Mock).mockReturnValue(mockRelatedArticles);
    render(<RelatedArticles articleId={mockArticleId} />);

    expect(screen.getByText("This is the first related article.")).toBeInTheDocument();
    expect(screen.getByText("This is the second related article.")).toBeInTheDocument();
  });

  it("handles articles without excerpts", () => {
    (useQuery as Mock).mockReturnValue(mockRelatedArticles);
    render(<RelatedArticles articleId={mockArticleId} />);

    // Should render without crashing even when excerpt is undefined
    expect(screen.getByText("Related Article Three")).toBeInTheDocument();
  });

  it("passes the correct articleId to useQuery", () => {
    (useQuery as Mock).mockReturnValue([]);
    render(<RelatedArticles articleId={mockArticleId} />);

    expect(useQuery).toHaveBeenCalledWith(
      "articles.getRelated",
      { articleId: mockArticleId }
    );
  });

  it("uses semantic section element", () => {
    (useQuery as Mock).mockReturnValue(mockRelatedArticles);
    const { container } = render(<RelatedArticles articleId={mockArticleId} />);

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
  });
});
