import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { RssImporter } from "@/components/articles/RssImporter";
import { useQuery, useMutation, useAction } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";

// Mock convex/react
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useAction: vi.fn(),
}));

// Mock the api module
vi.mock("@/convex/_generated/api", () => ({
  api: {
    articles: {
      importFromRss: "articles.importFromRss",
    },
    articlesRss: {
      parseRssFeed: "articlesRss.parseRssFeed",
    },
    profiles: {
      list: "profiles.list",
    },
    tags: {
      list: "tags.list",
    },
  },
}));

describe("RssImporter", () => {
  const mockProfiles = [
    {
      _id: "profile1" as Id<"profiles">,
      displayName: "John Doe",
      slug: "john-doe",
      profileStatus: "published" as const,
    },
    {
      _id: "profile2" as Id<"profiles">,
      displayName: "Jane Smith",
      slug: "jane-smith",
      profileStatus: "published" as const,
    },
  ];

  const mockTags = [
    {
      _id: "tag1" as Id<"tags">,
      name: "Technology",
      slug: "technology",
      contentCount: 5,
    },
    {
      _id: "tag2" as Id<"tags">,
      name: "AI",
      slug: "ai",
      contentCount: 3,
    },
  ];

  const mockParsedItems = [
    {
      title: "Article One",
      content: "Content of article one...",
      publishedAt: Date.now() - 86400000,
      substackUrl: "https://example.substack.com/p/article-one",
      excerpt: "This is article one.",
      alreadyImported: false,
    },
    {
      title: "Article Two",
      content: "Content of article two...",
      publishedAt: Date.now() - 172800000,
      substackUrl: "https://example.substack.com/p/article-two",
      excerpt: "This is article two.",
      alreadyImported: false,
    },
    {
      title: "Already Imported Article",
      content: "Content of already imported...",
      publishedAt: Date.now() - 259200000,
      substackUrl: "https://example.substack.com/p/already-imported",
      excerpt: "Already imported article.",
      alreadyImported: true,
    },
  ];

  const mockParseRssFeed = vi.fn();
  const mockImportFromRss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useQuery as Mock).mockImplementation((queryName: string) => {
      if (queryName === "profiles.list") return mockProfiles;
      if (queryName === "tags.list") return mockTags;
      return undefined;
    });
    (useAction as Mock).mockReturnValue(mockParseRssFeed);
    (useMutation as Mock).mockReturnValue(mockImportFromRss);
  });

  describe("Initial Rendering", () => {
    it("renders URL input field", () => {
      render(<RssImporter />);
      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      expect(input).toBeInTheDocument();
    });

    it("renders Fetch button", () => {
      render(<RssImporter />);
      expect(screen.getByRole("button", { name: /fetch/i })).toBeInTheDocument();
    });

    it("renders author dropdown after fetch", async () => {
      mockParseRssFeed.mockResolvedValue(mockParsedItems);
      render(<RssImporter />);

      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      fireEvent.change(input, { target: { value: "https://example.substack.com/feed" } });

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/author/i)).toBeInTheDocument();
      });
    });
  });

  describe("URL Validation", () => {
    it("shows validation error for empty URL", async () => {
      render(<RssImporter />);

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByText(/url is required|enter a url|please enter/i)).toBeInTheDocument();
      });
    });

    it("shows validation error for invalid URL format", async () => {
      render(<RssImporter />);

      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      fireEvent.change(input, { target: { value: "not-a-valid-url" } });

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByText(/valid url|invalid url|http/i)).toBeInTheDocument();
      });
    });
  });

  describe("Fetching RSS Feed", () => {
    it("calls parseRssFeed action when Fetch button clicked with valid URL", async () => {
      mockParseRssFeed.mockResolvedValue(mockParsedItems);
      render(<RssImporter />);

      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      fireEvent.change(input, { target: { value: "https://example.substack.com/feed" } });

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(mockParseRssFeed).toHaveBeenCalledWith({
          rssUrl: "https://example.substack.com/feed",
        });
      });
    });

    it("shows loading state while parsing", async () => {
      // Create a promise that we can control
      let resolvePromise!: (value: typeof mockParsedItems) => void;
      const promise = new Promise<typeof mockParsedItems>((resolve) => {
        resolvePromise = resolve;
      });
      mockParseRssFeed.mockReturnValue(promise);

      render(<RssImporter />);

      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      fireEvent.change(input, { target: { value: "https://example.substack.com/feed" } });

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      // Check that button text changes to indicate loading
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /fetching/i })).toBeInTheDocument();
      });

      resolvePromise(mockParsedItems);
    });

    it("displays parsed articles as checklist after fetch", async () => {
      mockParseRssFeed.mockResolvedValue(mockParsedItems);
      render(<RssImporter />);

      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      fireEvent.change(input, { target: { value: "https://example.substack.com/feed" } });

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByText("Article One")).toBeInTheDocument();
        expect(screen.getByText("Article Two")).toBeInTheDocument();
      });
    });

    it("shows error message when fetch fails", async () => {
      mockParseRssFeed.mockRejectedValue(new Error("Network error"));
      render(<RssImporter />);

      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      fireEvent.change(input, { target: { value: "https://example.substack.com/feed" } });

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByText(/error|failed|network/i)).toBeInTheDocument();
      });
    });
  });

  describe("Article Selection", () => {
    it("renders checkboxes for each article", async () => {
      mockParseRssFeed.mockResolvedValue(mockParsedItems);
      render(<RssImporter />);

      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      fireEvent.change(input, { target: { value: "https://example.substack.com/feed" } });

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("disables checkboxes for already imported articles", async () => {
      mockParseRssFeed.mockResolvedValue(mockParsedItems);
      render(<RssImporter />);

      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      fireEvent.change(input, { target: { value: "https://example.substack.com/feed" } });

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByText("Already Imported Article")).toBeInTheDocument();
      });

      // Get all checkboxes and verify the last one (for the already imported article) is disabled
      const checkboxes = screen.getAllByRole("checkbox");
      // The already imported article should have a disabled checkbox
      const disabledCheckboxes = checkboxes.filter((cb) => cb.hasAttribute("disabled"));
      expect(disabledCheckboxes.length).toBeGreaterThan(0);
    });

    it("shows already imported indicator label", async () => {
      mockParseRssFeed.mockResolvedValue(mockParsedItems);
      render(<RssImporter />);

      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      fireEvent.change(input, { target: { value: "https://example.substack.com/feed" } });

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        // Use getAllByText since there may be multiple matches (e.g., in title and badge)
        const alreadyImportedElements = screen.getAllByText(/already imported/i);
        expect(alreadyImportedElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Import Process", () => {
    it("renders Import Selected button after fetch", async () => {
      mockParseRssFeed.mockResolvedValue(mockParsedItems);
      render(<RssImporter />);

      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      fireEvent.change(input, { target: { value: "https://example.substack.com/feed" } });

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /import/i })).toBeInTheDocument();
      });
    });

    it("requires author selection before import", async () => {
      mockParseRssFeed.mockResolvedValue(mockParsedItems);
      render(<RssImporter />);

      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      fireEvent.change(input, { target: { value: "https://example.substack.com/feed" } });

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByText("Article One")).toBeInTheDocument();
      });

      // Check first article
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]);

      // Click import without selecting author
      const importButton = screen.getByRole("button", { name: /import/i });
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText(/author.*(required|select)/i)).toBeInTheDocument();
      });
    });

    it("calls importFromRss mutation with selected items", async () => {
      mockParseRssFeed.mockResolvedValue(mockParsedItems);
      mockImportFromRss.mockResolvedValue({ imported: 1, skipped: 0 });
      render(<RssImporter />);

      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      fireEvent.change(input, { target: { value: "https://example.substack.com/feed" } });

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByText("Article One")).toBeInTheDocument();
      });

      // Select author
      const authorSelect = screen.getByLabelText(/author/i);
      fireEvent.change(authorSelect, { target: { value: "profile1" } });

      // Check first article
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]);

      // Click import
      const importButton = screen.getByRole("button", { name: /import/i });
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(mockImportFromRss).toHaveBeenCalled();
      });
    });

    it("displays success summary after import", async () => {
      mockParseRssFeed.mockResolvedValue(mockParsedItems);
      mockImportFromRss.mockResolvedValue({ imported: 2, skipped: 0 });
      render(<RssImporter />);

      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      fireEvent.change(input, { target: { value: "https://example.substack.com/feed" } });

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByText("Article One")).toBeInTheDocument();
      });

      // Select author
      const authorSelect = screen.getByLabelText(/author/i);
      fireEvent.change(authorSelect, { target: { value: "profile1" } });

      // Check articles
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);

      // Click import
      const importButton = screen.getByRole("button", { name: /import/i });
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText(/2 imported/i)).toBeInTheDocument();
      });
    });

    it("displays skipped count in summary", async () => {
      mockParseRssFeed.mockResolvedValue(mockParsedItems);
      mockImportFromRss.mockResolvedValue({ imported: 1, skipped: 1 });
      render(<RssImporter />);

      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      fireEvent.change(input, { target: { value: "https://example.substack.com/feed" } });

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByText("Article One")).toBeInTheDocument();
      });

      // Select author
      const authorSelect = screen.getByLabelText(/author/i);
      fireEvent.change(authorSelect, { target: { value: "profile1" } });

      // Check articles
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]);

      // Click import
      const importButton = screen.getByRole("button", { name: /import/i });
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText(/1 skipped/i)).toBeInTheDocument();
      });
    });

    it("shows error message when import fails", async () => {
      mockParseRssFeed.mockResolvedValue(mockParsedItems);
      mockImportFromRss.mockRejectedValue(new Error("Import failed"));
      render(<RssImporter />);

      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      fireEvent.change(input, { target: { value: "https://example.substack.com/feed" } });

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByText("Article One")).toBeInTheDocument();
      });

      // Select author
      const authorSelect = screen.getByLabelText(/author/i);
      fireEvent.change(authorSelect, { target: { value: "profile1" } });

      // Check first article
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]);

      // Click import
      const importButton = screen.getByRole("button", { name: /import/i });
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
      });
    });
  });

  describe("Tags Multi-select", () => {
    it("renders tags multi-select after fetch", async () => {
      mockParseRssFeed.mockResolvedValue(mockParsedItems);
      render(<RssImporter />);

      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      fireEvent.change(input, { target: { value: "https://example.substack.com/feed" } });

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByText("Technology")).toBeInTheDocument();
        expect(screen.getByText("AI")).toBeInTheDocument();
      });
    });

    it("passes selected tags to import mutation", async () => {
      mockParseRssFeed.mockResolvedValue(mockParsedItems);
      mockImportFromRss.mockResolvedValue({ imported: 1, skipped: 0 });
      render(<RssImporter />);

      const input = screen.getByPlaceholderText(/rss|substack|feed|url/i);
      fireEvent.change(input, { target: { value: "https://example.substack.com/feed" } });

      const fetchButton = screen.getByRole("button", { name: /fetch/i });
      fireEvent.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByText("Article One")).toBeInTheDocument();
      });

      // Select author
      const authorSelect = screen.getByLabelText(/author/i);
      fireEvent.change(authorSelect, { target: { value: "profile1" } });

      // Select a tag
      const techTag = screen.getByRole("button", { name: /technology/i });
      fireEvent.click(techTag);

      // Check first article
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]);

      // Click import
      const importButton = screen.getByRole("button", { name: /import/i });
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(mockImportFromRss).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: expect.arrayContaining(["tag1"]),
          })
        );
      });
    });
  });
});
