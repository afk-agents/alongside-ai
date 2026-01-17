import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import { Footer } from "@/components/layout/Footer";

describe("Footer", () => {
  it("renders a semantic footer element", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("displays Contact link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /contact/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/contact");
  });

  it("displays Privacy Policy link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /privacy policy/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/privacy");
  });

  it("displays Terms of Service link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /terms of service/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/terms");
  });

  it("displays FAQ link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /faq/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/faq");
  });

  it("displays LinkedIn social link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /linkedin/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://linkedin.com/company/alongside-ai");
  });

  it("displays Substack social link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /substack/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://alongsideai.substack.com");
  });

  it("social links have target=_blank for opening in new tab", () => {
    render(<Footer />);
    const linkedIn = screen.getByRole("link", { name: /linkedin/i });
    const substack = screen.getByRole("link", { name: /substack/i });

    expect(linkedIn).toHaveAttribute("target", "_blank");
    expect(substack).toHaveAttribute("target", "_blank");
  });

  it("social links have rel=noopener noreferrer for security", () => {
    render(<Footer />);
    const linkedIn = screen.getByRole("link", { name: /linkedin/i });
    const substack = screen.getByRole("link", { name: /substack/i });

    expect(linkedIn).toHaveAttribute("rel", "noopener noreferrer");
    expect(substack).toHaveAttribute("rel", "noopener noreferrer");
  });
});
