import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import { AuthoredContent } from "@/components/profiles/AuthoredContent";

const mockContent = {
  projects: [
    { title: "Project Alpha", slug: "project-alpha", type: "project" as const },
    { title: "Project Beta", slug: "project-beta", type: "project" as const },
  ],
  experiments: [
    {
      title: "Experiment One",
      slug: "experiment-one",
      type: "experiment" as const,
    },
  ],
  articles: [
    { title: "My Article", slug: "my-article", type: "article" as const },
  ],
  videos: [
    { title: "Tutorial Video", slug: "tutorial-video", type: "video" as const },
  ],
};

describe("AuthoredContent", () => {
  describe("section headings", () => {
    it("renders Projects section when projects exist", () => {
      render(<AuthoredContent content={mockContent} />);

      expect(screen.getByRole("heading", { name: /projects/i })).toBeInTheDocument();
    });

    it("renders Experiments section when experiments exist", () => {
      render(<AuthoredContent content={mockContent} />);

      expect(screen.getByRole("heading", { name: /experiments/i })).toBeInTheDocument();
    });

    it("renders Articles section when articles exist", () => {
      render(<AuthoredContent content={mockContent} />);

      expect(screen.getByRole("heading", { name: /articles/i })).toBeInTheDocument();
    });

    it("renders Videos section when videos exist", () => {
      render(<AuthoredContent content={mockContent} />);

      expect(screen.getByRole("heading", { name: /videos/i })).toBeInTheDocument();
    });
  });

  describe("content items", () => {
    it("displays project titles as links", () => {
      render(<AuthoredContent content={mockContent} />);

      expect(screen.getByRole("link", { name: /project alpha/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /project beta/i })).toBeInTheDocument();
    });

    it("links projects to correct URLs", () => {
      render(<AuthoredContent content={mockContent} />);

      const projectLink = screen.getByRole("link", { name: /project alpha/i });
      expect(projectLink).toHaveAttribute("href", "/projects/project-alpha");
    });

    it("links experiments to correct URLs", () => {
      render(<AuthoredContent content={mockContent} />);

      const experimentLink = screen.getByRole("link", { name: /experiment one/i });
      expect(experimentLink).toHaveAttribute("href", "/experiments/experiment-one");
    });

    it("links articles to correct URLs", () => {
      render(<AuthoredContent content={mockContent} />);

      const articleLink = screen.getByRole("link", { name: /my article/i });
      expect(articleLink).toHaveAttribute("href", "/articles/my-article");
    });

    it("links videos to correct URLs", () => {
      render(<AuthoredContent content={mockContent} />);

      const videoLink = screen.getByRole("link", { name: /tutorial video/i });
      expect(videoLink).toHaveAttribute("href", "/videos/tutorial-video");
    });
  });

  describe("empty content handling", () => {
    it("hides Projects section when no projects", () => {
      const content = { ...mockContent, projects: [] };
      render(<AuthoredContent content={content} />);

      expect(screen.queryByRole("heading", { name: /^projects$/i })).not.toBeInTheDocument();
    });

    it("hides Experiments section when no experiments", () => {
      const content = { ...mockContent, experiments: [] };
      render(<AuthoredContent content={content} />);

      expect(screen.queryByRole("heading", { name: /^experiments$/i })).not.toBeInTheDocument();
    });

    it("hides Articles section when no articles", () => {
      const content = { ...mockContent, articles: [] };
      render(<AuthoredContent content={content} />);

      expect(screen.queryByRole("heading", { name: /^articles$/i })).not.toBeInTheDocument();
    });

    it("hides Videos section when no videos", () => {
      const content = { ...mockContent, videos: [] };
      render(<AuthoredContent content={content} />);

      expect(screen.queryByRole("heading", { name: /^videos$/i })).not.toBeInTheDocument();
    });

    it("renders nothing when all content is empty", () => {
      const emptyContent = {
        projects: [],
        experiments: [],
        articles: [],
        videos: [],
      };
      const { container } = render(<AuthoredContent content={emptyContent} />);

      // Component should render but contain no content
      expect(container.querySelector("section")).toBeNull();
    });
  });

  describe("overall structure", () => {
    it("renders main heading", () => {
      render(<AuthoredContent content={mockContent} />);

      expect(screen.getByRole("heading", { name: /authored content/i })).toBeInTheDocument();
    });

    it("hides main heading when all content is empty", () => {
      const emptyContent = {
        projects: [],
        experiments: [],
        articles: [],
        videos: [],
      };
      render(<AuthoredContent content={emptyContent} />);

      expect(screen.queryByRole("heading", { name: /authored content/i })).not.toBeInTheDocument();
    });
  });
});
