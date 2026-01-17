import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import { TagBadge } from "@/components/tags/TagBadge";

describe("TagBadge", () => {
  const mockTag = { name: "LangChain", slug: "langchain" };

  it("renders a link with the correct href to tag page", () => {
    render(<TagBadge tag={mockTag} />);

    const link = screen.getByRole("link", { name: /langchain/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/tags/langchain");
  });

  it("displays the tag name", () => {
    render(<TagBadge tag={mockTag} />);

    expect(screen.getByText("LangChain")).toBeInTheDocument();
  });

  it("applies default styling as rounded pill", () => {
    render(<TagBadge tag={mockTag} />);

    const link = screen.getByRole("link", { name: /langchain/i });
    // Check for rounded pill styling classes
    expect(link).toHaveClass("rounded-full");
  });

  it("applies small size styling when size='sm'", () => {
    render(<TagBadge tag={mockTag} size="sm" />);

    const link = screen.getByRole("link", { name: /langchain/i });
    expect(link).toHaveClass("text-xs");
    expect(link).toHaveClass("px-2");
    expect(link).toHaveClass("py-0.5");
  });

  it("applies medium size styling when size='md' (default)", () => {
    render(<TagBadge tag={mockTag} size="md" />);

    const link = screen.getByRole("link", { name: /langchain/i });
    expect(link).toHaveClass("text-sm");
    expect(link).toHaveClass("px-3");
    expect(link).toHaveClass("py-1");
  });

  it("defaults to medium size when no size prop provided", () => {
    render(<TagBadge tag={mockTag} />);

    const link = screen.getByRole("link", { name: /langchain/i });
    expect(link).toHaveClass("text-sm");
    expect(link).toHaveClass("px-3");
    expect(link).toHaveClass("py-1");
  });

  it("handles tag names with special characters", () => {
    const specialTag = { name: "C++", slug: "c-plus-plus" };
    render(<TagBadge tag={specialTag} />);

    expect(screen.getByText("C++")).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/tags/c-plus-plus");
  });

  it("handles long tag names", () => {
    const longTag = { name: "Very Long Tag Name For Testing", slug: "very-long-tag-name" };
    render(<TagBadge tag={longTag} />);

    expect(screen.getByText("Very Long Tag Name For Testing")).toBeInTheDocument();
  });
});
