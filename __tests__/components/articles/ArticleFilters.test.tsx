import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { ArticleFilters } from "@/components/articles/ArticleFilters";
import { useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";

// Mock convex/react
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
}));

// Mock the api import
vi.mock("@/convex/_generated/api", () => ({
  api: {
    tags: {
      list: "tags.list",
    },
  },
}));

describe("ArticleFilters", () => {
  const mockTags = [
    { _id: "tag1" as Id<"tags">, _creationTime: 1000, name: "React", slug: "react", contentCount: 5 },
    { _id: "tag2" as Id<"tags">, _creationTime: 2000, name: "TypeScript", slug: "typescript", contentCount: 3 },
    { _id: "tag3" as Id<"tags">, _creationTime: 3000, name: "Testing", slug: "testing", contentCount: 0 },
  ];

  const mockOnTagSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state while tags are loading", () => {
    (useQuery as Mock).mockReturnValue(undefined);
    render(<ArticleFilters selectedTagId={undefined} onTagSelect={mockOnTagSelect} />);
    expect(screen.getByTestId("article-filters-loading")).toBeInTheDocument();
  });

  it('renders "All Articles" button first', () => {
    (useQuery as Mock).mockReturnValue(mockTags);
    render(<ArticleFilters selectedTagId={undefined} onTagSelect={mockOnTagSelect} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveTextContent("All Articles");
  });

  it("renders tags with contentCount > 0", () => {
    (useQuery as Mock).mockReturnValue(mockTags);
    render(<ArticleFilters selectedTagId={undefined} onTagSelect={mockOnTagSelect} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("does not render tags with contentCount === 0", () => {
    (useQuery as Mock).mockReturnValue(mockTags);
    render(<ArticleFilters selectedTagId={undefined} onTagSelect={mockOnTagSelect} />);
    expect(screen.queryByText("Testing")).not.toBeInTheDocument();
  });

  it('applies selected styling to "All Articles" when no tag selected', () => {
    (useQuery as Mock).mockReturnValue(mockTags);
    render(<ArticleFilters selectedTagId={undefined} onTagSelect={mockOnTagSelect} />);
    const allButton = screen.getByText("All Articles");
    expect(allButton).toHaveClass("bg-blue-600");
  });

  it("applies selected styling to active tag", () => {
    (useQuery as Mock).mockReturnValue(mockTags);
    render(<ArticleFilters selectedTagId={"tag1" as Id<"tags">} onTagSelect={mockOnTagSelect} />);
    const reactButton = screen.getByText("React");
    expect(reactButton).toHaveClass("bg-blue-600");
  });

  it('calls onTagSelect with undefined when "All Articles" clicked', () => {
    (useQuery as Mock).mockReturnValue(mockTags);
    render(<ArticleFilters selectedTagId={"tag1" as Id<"tags">} onTagSelect={mockOnTagSelect} />);
    fireEvent.click(screen.getByText("All Articles"));
    expect(mockOnTagSelect).toHaveBeenCalledWith(undefined);
  });

  it("calls onTagSelect with tagId when tag clicked", () => {
    (useQuery as Mock).mockReturnValue(mockTags);
    render(<ArticleFilters selectedTagId={undefined} onTagSelect={mockOnTagSelect} />);
    fireEvent.click(screen.getByText("React"));
    expect(mockOnTagSelect).toHaveBeenCalledWith("tag1");
  });

  it("renders in horizontal scrollable container", () => {
    (useQuery as Mock).mockReturnValue(mockTags);
    render(<ArticleFilters selectedTagId={undefined} onTagSelect={mockOnTagSelect} />);
    const container = screen.getByRole("group");
    expect(container).toHaveClass("overflow-x-auto");
  });

  it("does not call onTagSelect when already selected tag is clicked", () => {
    (useQuery as Mock).mockReturnValue(mockTags);
    render(<ArticleFilters selectedTagId={"tag1" as Id<"tags">} onTagSelect={mockOnTagSelect} />);
    fireEvent.click(screen.getByText("React"));
    // Should not call if already selected
    expect(mockOnTagSelect).not.toHaveBeenCalled();
  });

  it("renders empty state when all tags have contentCount 0", () => {
    const emptyTags = [
      { _id: "tag1" as Id<"tags">, _creationTime: 1000, name: "Empty", slug: "empty", contentCount: 0 },
    ];
    (useQuery as Mock).mockReturnValue(emptyTags);
    render(<ArticleFilters selectedTagId={undefined} onTagSelect={mockOnTagSelect} />);
    // Should only show "All Articles" button
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent("All Articles");
  });
});
