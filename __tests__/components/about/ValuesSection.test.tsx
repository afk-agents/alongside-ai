import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import { ValuesSection } from "@/components/about/ValuesSection";

describe("ValuesSection", () => {
  it("renders Our Values heading", () => {
    render(<ValuesSection />);

    expect(screen.getByRole("heading", { name: /our values/i })).toBeInTheDocument();
  });

  describe("value cards", () => {
    it("renders Community First value", () => {
      render(<ValuesSection />);

      expect(screen.getByText("Community First")).toBeInTheDocument();
    });

    it("renders Practical Knowledge value", () => {
      render(<ValuesSection />);

      expect(screen.getByText("Practical Knowledge")).toBeInTheDocument();
    });

    it("renders Inclusive Access value", () => {
      render(<ValuesSection />);

      expect(screen.getByText("Inclusive Access")).toBeInTheDocument();
    });

    it("renders Continuous Growth value", () => {
      render(<ValuesSection />);

      expect(screen.getByText("Continuous Growth")).toBeInTheDocument();
    });

    it("renders 4 value cards total", () => {
      render(<ValuesSection />);

      const cards = screen.getAllByTestId("value-card");
      expect(cards).toHaveLength(4);
    });
  });

  describe("responsive grid", () => {
    it("has responsive grid classes", () => {
      render(<ValuesSection />);

      const grid = screen.getByTestId("values-grid");
      // 1 col mobile, 2 col tablet, 4 col desktop
      expect(grid).toHaveClass("grid-cols-1");
      expect(grid).toHaveClass("md:grid-cols-2");
      expect(grid).toHaveClass("lg:grid-cols-4");
    });

    it("has gap between grid items", () => {
      render(<ValuesSection />);

      const grid = screen.getByTestId("values-grid");
      expect(grid).toHaveClass("gap-6");
    });
  });

  describe("styling", () => {
    it("renders with proper section padding", () => {
      render(<ValuesSection />);

      const section = screen.getByTestId("values-section");
      expect(section).toHaveClass("py-16");
    });
  });
});
