import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FeaturedArticles } from "@/components/articles/FeaturedArticles";
import type { Id } from "@/convex/_generated/dataModel";

// Mock the ArticleCard component
vi.mock("@/components/articles/ArticleCard", () => ({
  ArticleCard: ({
    article,
    variant,
  }: {
    article: { title: string; slug: string };
    variant?: string;
  }) => (
    <div
      data-testid="article-card"
      data-variant={variant}
      data-slug={article.slug}
    >
      {article.title}
    </div>
  ),
}));

describe("FeaturedArticles", () => {
  const mockArticles = [
    {
      _id: "article1" as Id<"articles">,
      title: "First Featured Article",
      slug: "first-featured",
      excerpt: "First excerpt",
      publishedAt: 1000,
      author: { displayName: "Author 1", slug: "author-1" },
      tags: [],
    },
    {
      _id: "article2" as Id<"articles">,
      title: "Second Featured Article",
      slug: "second-featured",
      excerpt: "Second excerpt",
      publishedAt: 2000,
      author: { displayName: "Author 2", slug: "author-2" },
      tags: [],
    },
    {
      _id: "article3" as Id<"articles">,
      title: "Third Featured Article",
      slug: "third-featured",
      excerpt: "Third excerpt",
      publishedAt: 3000,
      author: { displayName: "Author 3", slug: "author-3" },
      tags: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section with "Featured" heading', () => {
    render(<FeaturedArticles articles={mockArticles} />);
    expect(screen.getByRole("heading", { name: /featured/i })).toBeInTheDocument();
  });

  it("renders ArticleCard with featured variant", () => {
    render(<FeaturedArticles articles={mockArticles} />);
    const cards = screen.getAllByTestId("article-card");
    expect(cards[0]).toHaveAttribute("data-variant", "featured");
  });

  it("returns null when articles array is empty", () => {
    const { container } = render(<FeaturedArticles articles={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays maximum 3 featured articles", () => {
    const fourArticles = [
      ...mockArticles,
      {
        _id: "article4" as Id<"articles">,
        title: "Fourth Article",
        slug: "fourth",
        excerpt: "Fourth excerpt",
        publishedAt: 4000,
        author: { displayName: "Author 4", slug: "author-4" },
        tags: [],
      },
    ];
    render(<FeaturedArticles articles={fourArticles} />);
    const cards = screen.getAllByTestId("article-card");
    expect(cards).toHaveLength(3);
  });

  it("renders all articles when less than 3", () => {
    const twoArticles = mockArticles.slice(0, 2);
    render(<FeaturedArticles articles={twoArticles} />);
    const cards = screen.getAllByTestId("article-card");
    expect(cards).toHaveLength(2);
  });

  it("applies distinct visual treatment with section styling", () => {
    render(<FeaturedArticles articles={mockArticles} />);
    const section = screen.getByRole("region", { name: /featured articles/i });
    expect(section).toBeInTheDocument();
  });

  it("renders articles in provided order", () => {
    render(<FeaturedArticles articles={mockArticles} />);
    const cards = screen.getAllByTestId("article-card");
    expect(cards[0]).toHaveAttribute("data-slug", "first-featured");
    expect(cards[1]).toHaveAttribute("data-slug", "second-featured");
    expect(cards[2]).toHaveAttribute("data-slug", "third-featured");
  });

  it("renders with grid layout", () => {
    render(<FeaturedArticles articles={mockArticles} />);
    const grid = screen.getByTestId("featured-grid");
    expect(grid).toHaveClass("grid");
  });
});
