import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ArticleContent } from "@/components/articles/ArticleContent";

describe("ArticleContent", () => {
  it("renders basic markdown text", () => {
    render(<ArticleContent content="Hello **world**" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("world")).toBeInTheDocument();
  });

  it("renders h1 heading", () => {
    render(<ArticleContent content="# Heading 1" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Heading 1");
  });

  it("renders h2 heading", () => {
    render(<ArticleContent content="## Heading 2" />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Heading 2");
  });

  it("renders headings with id attributes for anchor links", () => {
    render(<ArticleContent content="## My Section Title" />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveAttribute("id", "my-section-title");
  });

  it("renders unordered lists", () => {
    render(
      <ArticleContent
        content={`- Item 1
- Item 2`}
      />
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("renders ordered lists", () => {
    render(<ArticleContent content="1. First\n2. Second\n3. Third" />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
  });

  it("renders code blocks with pre element", () => {
    render(
      <ArticleContent
        content={`\`\`\`javascript
const x = 1;
\`\`\``}
      />
    );
    // Code blocks have syntax highlighting which splits the code
    const pre = document.querySelector("pre");
    expect(pre).toBeInTheDocument();
    expect(pre).toHaveTextContent("const");
    expect(pre).toHaveTextContent("x");
  });

  it("renders inline code", () => {
    render(<ArticleContent content="Use `const` for constants" />);
    const code = screen.getByText("const");
    expect(code.tagName).toBe("CODE");
  });

  it("renders links with proper attributes", () => {
    render(<ArticleContent content="[Link](https://example.com)" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("renders external links with target and rel attributes", () => {
    render(<ArticleContent content="[External](https://external.com)" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders internal links without target blank", () => {
    render(<ArticleContent content="[Internal](/about)" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/about");
    expect(link).not.toHaveAttribute("target");
  });

  it("renders images with responsive container", () => {
    render(
      <ArticleContent content="![Alt text](https://example.com/img.jpg)" />
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Alt text");
    expect(img).toHaveAttribute("src", "https://example.com/img.jpg");
  });

  it("renders blockquotes", () => {
    render(<ArticleContent content="> This is a quote" />);
    const blockquote = screen
      .getByText("This is a quote")
      .closest("blockquote");
    expect(blockquote).toBeInTheDocument();
  });

  it("renders GFM tables", () => {
    render(
      <ArticleContent
        content={`| Header 1 | Header 2 |
| --- | --- |
| Cell 1 | Cell 2 |`}
      />
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Header 1")).toBeInTheDocument();
    expect(screen.getByText("Cell 1")).toBeInTheDocument();
  });

  it("renders GFM strikethrough", () => {
    render(<ArticleContent content="~~deleted~~" />);
    const deleted = screen.getByText("deleted");
    expect(deleted.tagName).toBe("DEL");
  });

  it("renders task list items", () => {
    render(<ArticleContent content="- [x] Completed task" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
  });

  it("sanitizes script tags", () => {
    const { container } = render(
      <ArticleContent content='<script>alert("xss")</script>' />
    );
    // Script should be stripped entirely
    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).not.toContain("alert");
  });

  it("sanitizes event handlers in HTML", () => {
    render(<ArticleContent content='<img src="x" onerror="alert(1)" />Text' />);
    const img = screen.queryByRole("img");
    if (img) {
      expect(img).not.toHaveAttribute("onerror");
    }
  });

  it("uses prose classes for typography", () => {
    const { container } = render(<ArticleContent content="Test content" />);
    const article = container.querySelector("article");
    expect(article).toHaveClass("prose");
  });

  it("renders empty content gracefully", () => {
    const { container } = render(<ArticleContent content="" />);
    expect(container.querySelector("article")).toBeInTheDocument();
  });

  it("handles content with only whitespace", () => {
    const { container } = render(<ArticleContent content="   \n\n   " />);
    expect(container.querySelector("article")).toBeInTheDocument();
  });
});
