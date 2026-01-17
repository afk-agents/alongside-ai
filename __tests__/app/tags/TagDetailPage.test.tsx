import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import TagDetailPage from "@/app/tags/[slug]/page";
import { notFound } from "next/navigation";

// Mock the Convex useQuery hook
const mockUseQuery = vi.fn();
vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

// Mock the Convex API
vi.mock("@/convex/_generated/api", () => ({
  api: {
    tags: {
      getBySlug: "tags:getBySlug",
      getContentByTagId: "tags:getContentByTagId",
    },
  },
}));

// Mock next/navigation notFound
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

describe("TagDetailPage", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
    vi.mocked(notFound).mockClear();
  });

  describe("loading state", () => {
    it("shows loading message when tag is loading", () => {
      mockUseQuery.mockReturnValue(undefined);

      render(<TagDetailPage params={{ slug: "langchain" }} />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("404 handling", () => {
    it("calls notFound when tag is null", () => {
      // Mock notFound to throw like it does in real Next.js
      vi.mocked(notFound).mockImplementation(() => {
        throw new Error("NEXT_NOT_FOUND");
      });

      // First call for getBySlug returns null
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "tags:getBySlug") return null;
        return undefined;
      });

      expect(() => {
        render(<TagDetailPage params={{ slug: "nonexistent" }} />);
      }).toThrow("NEXT_NOT_FOUND");

      expect(notFound).toHaveBeenCalled();
    });
  });

  describe("tag page display", () => {
    const mockTag = {
      _id: "tag1",
      _creationTime: 1234567890,
      name: "LangChain",
      slug: "langchain",
      description: "Framework for building LLM applications",
    };

    const mockContent = {
      events: [
        { _id: "e1", title: "LangChain Meetup", slug: "langchain-meetup", date: 1234567890, isVirtual: false },
      ],
      projects: [
        { _id: "p1", title: "RAG Pipeline", slug: "rag-pipeline", description: "A RAG implementation" },
      ],
      experiments: [],
      articles: [
        { _id: "a1", title: "Getting Started with LangChain", slug: "getting-started-langchain", publishedAt: 1234567890 },
      ],
      videos: [],
    };

    it("displays tag name as page title", () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "tags:getBySlug") return mockTag;
        if (query === "tags:getContentByTagId") return mockContent;
        return undefined;
      });

      render(<TagDetailPage params={{ slug: "langchain" }} />);

      const heading = screen.getByRole("heading", { level: 1, name: /langchain/i });
      expect(heading).toBeInTheDocument();
    });

    it("displays tag description when present", () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "tags:getBySlug") return mockTag;
        if (query === "tags:getContentByTagId") return mockContent;
        return undefined;
      });

      render(<TagDetailPage params={{ slug: "langchain" }} />);

      expect(screen.getByText("Framework for building LLM applications")).toBeInTheDocument();
    });

    it("does not display description area when tag has no description", () => {
      const tagWithoutDescription = { ...mockTag, description: undefined };
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "tags:getBySlug") return tagWithoutDescription;
        if (query === "tags:getContentByTagId") return mockContent;
        return undefined;
      });

      render(<TagDetailPage params={{ slug: "langchain" }} />);

      expect(screen.queryByText("Framework for building LLM applications")).not.toBeInTheDocument();
    });

    it("renders sections for content types with items", () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "tags:getBySlug") return mockTag;
        if (query === "tags:getContentByTagId") return mockContent;
        return undefined;
      });

      render(<TagDetailPage params={{ slug: "langchain" }} />);

      // Events section should exist
      expect(screen.getByRole("heading", { name: /events/i })).toBeInTheDocument();
      expect(screen.getByText("LangChain Meetup")).toBeInTheDocument();

      // Projects section should exist
      expect(screen.getByRole("heading", { name: /projects/i })).toBeInTheDocument();
      expect(screen.getByText("RAG Pipeline")).toBeInTheDocument();

      // Articles section should exist
      expect(screen.getByRole("heading", { name: /articles/i })).toBeInTheDocument();
      expect(screen.getByText("Getting Started with LangChain")).toBeInTheDocument();
    });

    it("does not render sections for empty content types", () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "tags:getBySlug") return mockTag;
        if (query === "tags:getContentByTagId") return mockContent;
        return undefined;
      });

      render(<TagDetailPage params={{ slug: "langchain" }} />);

      // Experiments and Videos are empty in mockContent
      expect(screen.queryByRole("heading", { name: /experiments/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: /videos/i })).not.toBeInTheDocument();
    });

    it("shows empty state when all content arrays are empty", () => {
      const emptyContent = {
        events: [],
        projects: [],
        experiments: [],
        articles: [],
        videos: [],
      };
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "tags:getBySlug") return mockTag;
        if (query === "tags:getContentByTagId") return emptyContent;
        return undefined;
      });

      render(<TagDetailPage params={{ slug: "langchain" }} />);

      // Check for the empty state message
      expect(screen.getByText(/no content tagged with/i)).toBeInTheDocument();
      // The tag name appears twice (in h1 and empty message) so use getAllByText
      expect(screen.getAllByText("LangChain")).toHaveLength(2);
    });
  });

  describe("content links", () => {
    const mockTag = {
      _id: "tag1",
      _creationTime: 1234567890,
      name: "Test Tag",
      slug: "test-tag",
    };

    it("links events to /events/[slug]", () => {
      const content = {
        events: [{ _id: "e1", title: "Test Event", slug: "test-event", date: 1234567890, isVirtual: false }],
        projects: [],
        experiments: [],
        articles: [],
        videos: [],
      };
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "tags:getBySlug") return mockTag;
        if (query === "tags:getContentByTagId") return content;
        return undefined;
      });

      render(<TagDetailPage params={{ slug: "test-tag" }} />);

      const link = screen.getByRole("link", { name: /test event/i });
      expect(link).toHaveAttribute("href", "/events/test-event");
    });

    it("links projects to /projects/[slug]", () => {
      const content = {
        events: [],
        projects: [{ _id: "p1", title: "Test Project", slug: "test-project", description: "desc" }],
        experiments: [],
        articles: [],
        videos: [],
      };
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "tags:getBySlug") return mockTag;
        if (query === "tags:getContentByTagId") return content;
        return undefined;
      });

      render(<TagDetailPage params={{ slug: "test-tag" }} />);

      const link = screen.getByRole("link", { name: /test project/i });
      expect(link).toHaveAttribute("href", "/projects/test-project");
    });

    it("links articles to /blog/[slug]", () => {
      const content = {
        events: [],
        projects: [],
        experiments: [],
        articles: [{ _id: "a1", title: "Test Article", slug: "test-article", publishedAt: 1234567890 }],
        videos: [],
      };
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "tags:getBySlug") return mockTag;
        if (query === "tags:getContentByTagId") return content;
        return undefined;
      });

      render(<TagDetailPage params={{ slug: "test-tag" }} />);

      const link = screen.getByRole("link", { name: /test article/i });
      expect(link).toHaveAttribute("href", "/blog/test-article");
    });

    it("links videos to /videos/[slug]", () => {
      const content = {
        events: [],
        projects: [],
        experiments: [],
        articles: [],
        videos: [{ _id: "v1", title: "Test Video", slug: "test-video", youtubeId: "abc123" }],
      };
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "tags:getBySlug") return mockTag;
        if (query === "tags:getContentByTagId") return content;
        return undefined;
      });

      render(<TagDetailPage params={{ slug: "test-tag" }} />);

      const link = screen.getByRole("link", { name: /test video/i });
      expect(link).toHaveAttribute("href", "/videos/test-video");
    });

    it("links experiments to /lab/[slug]", () => {
      const content = {
        events: [],
        projects: [],
        experiments: [{ _id: "x1", title: "Test Experiment", slug: "test-experiment", status: "exploring" }],
        articles: [],
        videos: [],
      };
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "tags:getBySlug") return mockTag;
        if (query === "tags:getContentByTagId") return content;
        return undefined;
      });

      render(<TagDetailPage params={{ slug: "test-tag" }} />);

      const link = screen.getByRole("link", { name: /test experiment/i });
      expect(link).toHaveAttribute("href", "/lab/test-experiment");
    });
  });

  describe("query calls", () => {
    it("calls getBySlug with correct slug", () => {
      mockUseQuery.mockReturnValue(undefined);

      render(<TagDetailPage params={{ slug: "langchain" }} />);

      expect(mockUseQuery).toHaveBeenCalledWith("tags:getBySlug", { slug: "langchain" });
    });

    it("calls getContentByTagId with tag ID when tag exists", () => {
      const mockTag = {
        _id: "tag123",
        _creationTime: 1234567890,
        name: "Test",
        slug: "test",
      };
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "tags:getBySlug") return mockTag;
        return undefined;
      });

      render(<TagDetailPage params={{ slug: "test" }} />);

      expect(mockUseQuery).toHaveBeenCalledWith("tags:getContentByTagId", { tagId: "tag123" });
    });

    it("skips getContentByTagId when tag is null", () => {
      // Mock notFound to throw like it does in real Next.js
      vi.mocked(notFound).mockImplementation(() => {
        throw new Error("NEXT_NOT_FOUND");
      });

      mockUseQuery.mockImplementation((query: string) => {
        if (query === "tags:getBySlug") return null;
        return undefined;
      });

      // The render throws because notFound() throws
      expect(() => {
        render(<TagDetailPage params={{ slug: "nonexistent" }} />);
      }).toThrow("NEXT_NOT_FOUND");

      // Content query should have been called with skip since tag was null
      expect(mockUseQuery).toHaveBeenCalledWith("tags:getContentByTagId", "skip");
    });
  });
});
