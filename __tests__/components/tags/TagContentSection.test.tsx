import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import { TagContentSection } from "@/components/tags/TagContentSection";

describe("TagContentSection", () => {
  it("renders section with title and item count", () => {
    const items = [
      { title: "Event 1", slug: "event-1" },
      { title: "Event 2", slug: "event-2" },
    ];

    render(
      <TagContentSection title="Events" items={items} linkPrefix="/events" />
    );

    expect(screen.getByText("Events")).toBeInTheDocument();
    expect(screen.getByText("(2)")).toBeInTheDocument();
  });

  it("renders each item as a link with correct href", () => {
    const items = [
      { title: "My Project", slug: "my-project" },
      { title: "Another Project", slug: "another-project" },
    ];

    render(
      <TagContentSection title="Projects" items={items} linkPrefix="/projects" />
    );

    const link1 = screen.getByRole("link", { name: "My Project" });
    expect(link1).toHaveAttribute("href", "/projects/my-project");

    const link2 = screen.getByRole("link", { name: "Another Project" });
    expect(link2).toHaveAttribute("href", "/projects/another-project");
  });

  it("returns null when items array is empty", () => {
    const { container } = render(
      <TagContentSection title="Events" items={[]} linkPrefix="/events" />
    );

    // Should render nothing
    expect(container.innerHTML).toBe("");
  });

  it("displays item count of 1 correctly", () => {
    const items = [{ title: "Single Item", slug: "single-item" }];

    render(
      <TagContentSection title="Articles" items={items} linkPrefix="/articles" />
    );

    expect(screen.getByText("Articles")).toBeInTheDocument();
    expect(screen.getByText("(1)")).toBeInTheDocument();
  });

  it("handles items with special characters in title", () => {
    const items = [{ title: "C++ Fundamentals", slug: "c-plus-plus-fundamentals" }];

    render(
      <TagContentSection title="Articles" items={items} linkPrefix="/articles" />
    );

    expect(screen.getByText("C++ Fundamentals")).toBeInTheDocument();
  });

  it("renders section title as heading element", () => {
    const items = [{ title: "Test Item", slug: "test-item" }];

    render(
      <TagContentSection title="Videos" items={items} linkPrefix="/videos" />
    );

    const heading = screen.getByRole("heading", { name: /Videos/i });
    expect(heading).toBeInTheDocument();
  });

  it("renders items in the order provided", () => {
    const items = [
      { title: "First", slug: "first" },
      { title: "Second", slug: "second" },
      { title: "Third", slug: "third" },
    ];

    render(
      <TagContentSection title="Events" items={items} linkPrefix="/events" />
    );

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("First");
    expect(links[1]).toHaveTextContent("Second");
    expect(links[2]).toHaveTextContent("Third");
  });
});
