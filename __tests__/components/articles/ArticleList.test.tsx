import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ArticleList } from "@/components/articles/ArticleList";
import type { Id } from "@/convex/_generated/dataModel";

// Mock convex hooks
const mockUseQuery = vi.fn();
vi.mock("convex/react", () => ({
  useQuery: (query: unknown, args: unknown) => mockUseQuery(query, args),
}));

// Mock ArticleCard
vi.mock("@/components/articles/ArticleCard", () => ({
  ArticleCard: ({ article }: { article: { title: string } }) => (
    <div data-testid="article-card">{article.title}</div>
  ),
}));

// Mock api
vi.mock("@/convex/_generated/api", () => ({
  api: {
    articles: {
      list: "articles.list",
    },
  },
}));

describe("ArticleList", () => {
  const mockArticles = [
    {
      _id: "article1" as Id<"articles">,
      title: "First Article",
      slug: "first-article",
      excerpt: "Excerpt 1",
      publishedAt: Date.now(),
      author: { displayName: "Author 1", slug: "author-1" },
      tags: [],
    },
    {
      _id: "article2" as Id<"articles">,
      title: "Second Article",
      slug: "second-article",
      excerpt: "Excerpt 2",
      publishedAt: Date.now() - 1000,
      author: { displayName: "Author 2", slug: "author-2" },
      tags: [],
    },
  ];

  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it("renders loading skeleton when data is undefined", () => {
    mockUseQuery.mockReturnValue(undefined);
    render(<ArticleList />);
    expect(screen.getByTestId("article-list-skeleton")).toBeInTheDocument();
  });

  it("renders article cards when data is loaded", () => {
    mockUseQuery.mockReturnValue({
      articles: mockArticles,
      hasMore: false,
      nextCursor: null,
    });
    render(<ArticleList />);
    const cards = screen.getAllByTestId("article-card");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("First Article");
    expect(cards[1]).toHaveTextContent("Second Article");
  });

  it("renders empty state when no articles exist", () => {
    mockUseQuery.mockReturnValue({
      articles: [],
      hasMore: false,
      nextCursor: null,
    });
    render(<ArticleList />);
    expect(screen.getByText(/no articles found/i)).toBeInTheDocument();
  });

  it('renders "Load More" button when hasMore is true', () => {
    mockUseQuery.mockReturnValue({
      articles: mockArticles,
      hasMore: true,
      nextCursor: 123456789,
    });
    render(<ArticleList />);
    expect(
      screen.getByRole("button", { name: /load more/i })
    ).toBeInTheDocument();
  });

  it('does not render "Load More" button when hasMore is false', () => {
    mockUseQuery.mockReturnValue({
      articles: mockArticles,
      hasMore: false,
      nextCursor: null,
    });
    render(<ArticleList />);
    expect(screen.queryByRole("button", { name: /load more/i })).toBeNull();
  });

  it("passes tagId to query when provided", () => {
    const tagId = "tag123" as Id<"tags">;
    mockUseQuery.mockReturnValue({
      articles: [],
      hasMore: false,
      nextCursor: null,
    });
    render(<ArticleList tagId={tagId} />);
    expect(mockUseQuery).toHaveBeenCalledWith("articles.list", {
      tagId,
      cursor: undefined,
    });
  });

  it("calls query without tagId when not provided", () => {
    mockUseQuery.mockReturnValue({
      articles: [],
      hasMore: false,
      nextCursor: null,
    });
    render(<ArticleList />);
    expect(mockUseQuery).toHaveBeenCalledWith("articles.list", {
      tagId: undefined,
      cursor: undefined,
    });
  });

  it("shows loading state on Load More button when loading next page", async () => {
    mockUseQuery.mockReturnValue({
      articles: mockArticles,
      hasMore: true,
      nextCursor: 123456789,
    });

    render(<ArticleList />);

    // Wait for initial render with useEffect
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /load more/i })).toBeInTheDocument();
    });

    // Now return undefined for the next query (simulating loading)
    mockUseQuery.mockReturnValue(undefined);

    const loadMoreButton = screen.getByRole("button", { name: /load more/i });
    fireEvent.click(loadMoreButton);

    // Button should show loading state immediately after click
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /loading/i })).toBeInTheDocument();
    });
  });

  it("renders grid layout", () => {
    mockUseQuery.mockReturnValue({
      articles: mockArticles,
      hasMore: false,
      nextCursor: null,
    });
    const { container } = render(<ArticleList />);
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
  });
});

describe("ArticleListSkeleton", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
    mockUseQuery.mockReturnValue(undefined);
  });

  it("renders placeholder cards", () => {
    render(<ArticleList />);
    const skeleton = screen.getByTestId("article-list-skeleton");
    expect(skeleton).toBeInTheDocument();
  });

  it("applies animate-pulse class", () => {
    render(<ArticleList />);
    const skeleton = screen.getByTestId("article-list-skeleton");
    expect(skeleton.className).toContain("animate-pulse");
  });
});
