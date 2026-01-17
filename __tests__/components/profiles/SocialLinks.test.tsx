import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import { SocialLinks } from "@/components/profiles/SocialLinks";

describe("SocialLinks", () => {
  describe("rendering links", () => {
    it("renders linkedin link when provided", () => {
      render(<SocialLinks links={{ linkedin: "https://linkedin.com/in/johndoe" }} />);

      const link = screen.getByRole("link", { name: /linkedin/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "https://linkedin.com/in/johndoe");
    });

    it("renders twitter link when provided", () => {
      render(<SocialLinks links={{ twitter: "https://twitter.com/johndoe" }} />);

      const link = screen.getByRole("link", { name: /twitter/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "https://twitter.com/johndoe");
    });

    it("renders github link when provided", () => {
      render(<SocialLinks links={{ github: "https://github.com/johndoe" }} />);

      const link = screen.getByRole("link", { name: /github/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "https://github.com/johndoe");
    });

    it("renders website link when provided", () => {
      render(<SocialLinks links={{ website: "https://johndoe.com" }} />);

      const link = screen.getByRole("link", { name: /website/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "https://johndoe.com");
    });

    it("renders multiple links when provided", () => {
      render(
        <SocialLinks
          links={{
            linkedin: "https://linkedin.com/in/johndoe",
            github: "https://github.com/johndoe",
            website: "https://johndoe.com",
          }}
        />
      );

      expect(screen.getByRole("link", { name: /linkedin/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /github/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /website/i })).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("returns null when no links provided", () => {
      const { container } = render(<SocialLinks links={{}} />);

      expect(container.firstChild).toBeNull();
    });

    it("returns null when links prop is undefined", () => {
      const { container } = render(<SocialLinks />);

      expect(container.firstChild).toBeNull();
    });

    it("returns null when all links are undefined", () => {
      const { container } = render(
        <SocialLinks
          links={{
            linkedin: undefined,
            twitter: undefined,
            github: undefined,
            website: undefined,
          }}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("security attributes", () => {
    it("opens links in new tab", () => {
      render(<SocialLinks links={{ linkedin: "https://linkedin.com/in/johndoe" }} />);

      const link = screen.getByRole("link", { name: /linkedin/i });
      expect(link).toHaveAttribute("target", "_blank");
    });

    it("has noopener noreferrer for security", () => {
      render(<SocialLinks links={{ github: "https://github.com/johndoe" }} />);

      const link = screen.getByRole("link", { name: /github/i });
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("accessibility", () => {
    it("provides aria-label for linkedin", () => {
      render(<SocialLinks links={{ linkedin: "https://linkedin.com/in/johndoe" }} />);

      const link = screen.getByRole("link", { name: /linkedin/i });
      expect(link).toHaveAttribute("aria-label", "LinkedIn");
    });

    it("provides aria-label for twitter", () => {
      render(<SocialLinks links={{ twitter: "https://twitter.com/johndoe" }} />);

      const link = screen.getByRole("link", { name: /twitter/i });
      expect(link).toHaveAttribute("aria-label", "Twitter");
    });

    it("provides aria-label for github", () => {
      render(<SocialLinks links={{ github: "https://github.com/johndoe" }} />);

      const link = screen.getByRole("link", { name: /github/i });
      expect(link).toHaveAttribute("aria-label", "GitHub");
    });

    it("provides aria-label for website", () => {
      render(<SocialLinks links={{ website: "https://johndoe.com" }} />);

      const link = screen.getByRole("link", { name: /website/i });
      expect(link).toHaveAttribute("aria-label", "Website");
    });

    it("hides icons from screen readers", () => {
      render(<SocialLinks links={{ linkedin: "https://linkedin.com/in/johndoe" }} />);

      const icon = screen.getByTestId("linkedin-icon");
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("optional text labels", () => {
    it("shows text labels when showLabels is true", () => {
      render(
        <SocialLinks
          links={{ linkedin: "https://linkedin.com/in/johndoe" }}
          showLabels
        />
      );

      expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    });

    it("hides text labels by default", () => {
      render(<SocialLinks links={{ linkedin: "https://linkedin.com/in/johndoe" }} />);

      expect(screen.queryByText("LinkedIn")).not.toBeInTheDocument();
    });
  });

  describe("styling", () => {
    it("renders as a flex container", () => {
      render(<SocialLinks links={{ linkedin: "https://linkedin.com/in/johndoe" }} />);

      const container = screen.getByTestId("social-links");
      expect(container).toHaveClass("flex");
    });

    it("applies gap between links", () => {
      render(
        <SocialLinks
          links={{
            linkedin: "https://linkedin.com/in/johndoe",
            github: "https://github.com/johndoe",
          }}
        />
      );

      const container = screen.getByTestId("social-links");
      expect(container).toHaveClass("gap-3");
    });
  });
});
