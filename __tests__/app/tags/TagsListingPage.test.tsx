import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import TagsListingPage from "@/app/tags/page";

// Mock the Convex useQuery hook
const mockUseQuery = vi.fn();
vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

// Mock the Convex API
vi.mock("@/convex/_generated/api", () => ({
  api: {
    tags: {
      list: "tags:list",
    },
  },
}));

describe("TagsListingPage", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  describe("loading state", () => {
    it("shows loading message when tags are loading", () => {
      mockUseQuery.mockReturnValue(undefined);

      render(<TagsListingPage />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows empty message when no tags exist", () => {
      mockUseQuery.mockReturnValue([]);

      render(<TagsListingPage />);

      expect(screen.getByText(/no tags have been created yet/i)).toBeInTheDocument();
    });
  });

  describe("tags display", () => {
    const mockTags = [
      {
        _id: "tag1",
        _creationTime: 1234567890,
        name: "Agents",
        slug: "agents",
        description: "AI Agents and autonomous systems",
        contentCount: 5,
      },
      {
        _id: "tag2",
        _creationTime: 1234567891,
        name: "LangChain",
        slug: "langchain",
        description: undefined,
        contentCount: 3,
      },
      {
        _id: "tag3",
        _creationTime: 1234567892,
        name: "RAG",
        slug: "rag",
        description: "Retrieval Augmented Generation",
        contentCount: 0,
      },
    ];

    it("displays page title", () => {
      mockUseQuery.mockReturnValue(mockTags);

      render(<TagsListingPage />);

      expect(screen.getByRole("heading", { level: 1, name: /tags/i })).toBeInTheDocument();
    });

    it("displays all tags", () => {
      mockUseQuery.mockReturnValue(mockTags);

      render(<TagsListingPage />);

      expect(screen.getByText("Agents")).toBeInTheDocument();
      expect(screen.getByText("LangChain")).toBeInTheDocument();
      expect(screen.getByText("RAG")).toBeInTheDocument();
    });

    it("displays content count for each tag", () => {
      mockUseQuery.mockReturnValue(mockTags);

      render(<TagsListingPage />);

      // Content counts should be displayed (5, 3, 0 items)
      expect(screen.getByText(/5 items?/i)).toBeInTheDocument();
      expect(screen.getByText(/3 items?/i)).toBeInTheDocument();
      expect(screen.getByText(/0 items?/i)).toBeInTheDocument();
    });

    it("links each tag to its detail page", () => {
      mockUseQuery.mockReturnValue(mockTags);

      render(<TagsListingPage />);

      const agentsLink = screen.getByRole("link", { name: /agents/i });
      const langchainLink = screen.getByRole("link", { name: /langchain/i });
      const ragLink = screen.getByRole("link", { name: /rag/i });

      expect(agentsLink).toHaveAttribute("href", "/tags/agents");
      expect(langchainLink).toHaveAttribute("href", "/tags/langchain");
      expect(ragLink).toHaveAttribute("href", "/tags/rag");
    });

    it("displays tags in alphabetical order from query", () => {
      // Tags should come from the query already sorted
      const sortedTags = [
        { _id: "tag1", _creationTime: 1, name: "Agents", slug: "agents", contentCount: 1 },
        { _id: "tag2", _creationTime: 2, name: "LangChain", slug: "langchain", contentCount: 2 },
        { _id: "tag3", _creationTime: 3, name: "RAG", slug: "rag", contentCount: 3 },
      ];
      mockUseQuery.mockReturnValue(sortedTags);

      render(<TagsListingPage />);

      const links = screen.getAllByRole("link");
      const tagLinks = links.filter(link =>
        link.getAttribute("href")?.startsWith("/tags/")
      );

      expect(tagLinks).toHaveLength(3);
      expect(tagLinks[0]).toHaveAttribute("href", "/tags/agents");
      expect(tagLinks[1]).toHaveAttribute("href", "/tags/langchain");
      expect(tagLinks[2]).toHaveAttribute("href", "/tags/rag");
    });

    it("renders tags in a grid layout", () => {
      mockUseQuery.mockReturnValue(mockTags);

      const { container } = render(<TagsListingPage />);

      // Check for grid classes
      const gridContainer = container.querySelector(".grid");
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe("query calls", () => {
    it("calls tags.list query", () => {
      mockUseQuery.mockReturnValue([]);

      render(<TagsListingPage />);

      expect(mockUseQuery).toHaveBeenCalledWith("tags:list");
    });
  });

  describe("singular/plural item text", () => {
    it("shows singular 'item' for count of 1", () => {
      const singleItemTag = [
        { _id: "tag1", _creationTime: 1, name: "Solo", slug: "solo", contentCount: 1 },
      ];
      mockUseQuery.mockReturnValue(singleItemTag);

      render(<TagsListingPage />);

      expect(screen.getByText(/1 item(?!s)/)).toBeInTheDocument();
    });

    it("shows plural 'items' for count other than 1", () => {
      const multiItemTag = [
        { _id: "tag1", _creationTime: 1, name: "Multi", slug: "multi", contentCount: 5 },
      ];
      mockUseQuery.mockReturnValue(multiItemTag);

      render(<TagsListingPage />);

      expect(screen.getByText(/5 items/)).toBeInTheDocument();
    });
  });
});
