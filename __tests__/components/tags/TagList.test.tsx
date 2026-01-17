import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import { TagList } from "@/components/tags/TagList";
import { Id } from "@/convex/_generated/dataModel";

// Mock the Convex useQuery hook
const mockUseQuery = vi.fn();
vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

// Mock the Convex API
vi.mock("@/convex/_generated/api", () => ({
  api: {
    tags: {
      getByIds: "tags:getByIds",
    },
  },
}));

describe("TagList", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it("renders nothing when tagIds is empty array", () => {
    mockUseQuery.mockReturnValue([]);

    const { container } = render(<TagList tagIds={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when tagIds is undefined", () => {
    mockUseQuery.mockReturnValue([]);

    const { container } = render(<TagList tagIds={undefined} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when query returns empty array", () => {
    mockUseQuery.mockReturnValue([]);

    const tagIds = ["tag1", "tag2"] as unknown as Id<"tags">[];
    const { container } = render(<TagList tagIds={tagIds} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when query returns undefined (loading)", () => {
    mockUseQuery.mockReturnValue(undefined);

    const tagIds = ["tag1"] as unknown as Id<"tags">[];
    const { container } = render(<TagList tagIds={tagIds} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders TagBadge for each tag returned by query", () => {
    const mockTags = [
      { _id: "tag1", name: "LangChain", slug: "langchain" },
      { _id: "tag2", name: "RAG", slug: "rag" },
      { _id: "tag3", name: "Agents", slug: "agents" },
    ];
    mockUseQuery.mockReturnValue(mockTags);

    const tagIds = ["tag1", "tag2", "tag3"] as unknown as Id<"tags">[];
    render(<TagList tagIds={tagIds} />);

    expect(screen.getByText("LangChain")).toBeInTheDocument();
    expect(screen.getByText("RAG")).toBeInTheDocument();
    expect(screen.getByText("Agents")).toBeInTheDocument();

    // Each tag should be a link
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
  });

  it("renders tags with correct links", () => {
    const mockTags = [
      { _id: "tag1", name: "LangChain", slug: "langchain" },
    ];
    mockUseQuery.mockReturnValue(mockTags);

    const tagIds = ["tag1"] as unknown as Id<"tags">[];
    render(<TagList tagIds={tagIds} />);

    const link = screen.getByRole("link", { name: /langchain/i });
    expect(link).toHaveAttribute("href", "/tags/langchain");
  });

  it("applies horizontal flex layout with wrapping", () => {
    const mockTags = [
      { _id: "tag1", name: "LangChain", slug: "langchain" },
      { _id: "tag2", name: "RAG", slug: "rag" },
    ];
    mockUseQuery.mockReturnValue(mockTags);

    const tagIds = ["tag1", "tag2"] as unknown as Id<"tags">[];
    const { container } = render(<TagList tagIds={tagIds} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("flex-wrap");
  });

  it("passes size prop to TagBadge components", () => {
    const mockTags = [
      { _id: "tag1", name: "LangChain", slug: "langchain" },
    ];
    mockUseQuery.mockReturnValue(mockTags);

    const tagIds = ["tag1"] as unknown as Id<"tags">[];
    render(<TagList tagIds={tagIds} size="sm" />);

    // sm size should have text-xs styling
    const link = screen.getByRole("link");
    expect(link).toHaveClass("text-xs");
    expect(link).toHaveClass("px-2");
    expect(link).toHaveClass("py-0.5");
  });

  it("uses default md size when no size prop provided", () => {
    const mockTags = [
      { _id: "tag1", name: "LangChain", slug: "langchain" },
    ];
    mockUseQuery.mockReturnValue(mockTags);

    const tagIds = ["tag1"] as unknown as Id<"tags">[];
    render(<TagList tagIds={tagIds} />);

    // md size should have text-sm styling
    const link = screen.getByRole("link");
    expect(link).toHaveClass("text-sm");
    expect(link).toHaveClass("px-3");
    expect(link).toHaveClass("py-1");
  });

  it("calls useQuery with correct arguments", () => {
    const mockTags = [{ _id: "tag1", name: "Test", slug: "test" }];
    mockUseQuery.mockReturnValue(mockTags);

    const tagIds = ["tag1", "tag2"] as unknown as Id<"tags">[];
    render(<TagList tagIds={tagIds} />);

    expect(mockUseQuery).toHaveBeenCalledWith(
      "tags:getByIds",
      { tagIds }
    );
  });

  it("calls useQuery with skip when tagIds is empty", () => {
    mockUseQuery.mockReturnValue([]);

    render(<TagList tagIds={[]} />);

    // Should call with "skip" to avoid unnecessary query
    expect(mockUseQuery).toHaveBeenCalledWith("tags:getByIds", "skip");
  });

  it("calls useQuery with skip when tagIds is undefined", () => {
    mockUseQuery.mockReturnValue([]);

    render(<TagList tagIds={undefined} />);

    // Should call with "skip" to avoid unnecessary query
    expect(mockUseQuery).toHaveBeenCalledWith("tags:getByIds", "skip");
  });

  it("has gap between tag badges", () => {
    const mockTags = [
      { _id: "tag1", name: "LangChain", slug: "langchain" },
      { _id: "tag2", name: "RAG", slug: "rag" },
    ];
    mockUseQuery.mockReturnValue(mockTags);

    const tagIds = ["tag1", "tag2"] as unknown as Id<"tags">[];
    const { container } = render(<TagList tagIds={tagIds} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("gap-2");
  });
});
