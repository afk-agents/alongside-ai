import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import { MissionSection } from "@/components/about/MissionSection";

describe("MissionSection", () => {
  it("renders the mission headline", () => {
    render(<MissionSection />);

    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("renders the mission statement text", () => {
    render(<MissionSection />);

    // Check for presence of mission text (uses queryAllByText since "alongside" appears twice)
    const missionTexts = screen.getAllByText(/alongside/i);
    expect(missionTexts.length).toBeGreaterThan(0);
  });

  it("has visual accent styling", () => {
    render(<MissionSection />);

    const section = screen.getByTestId("mission-section");
    // Check for gradient or accent background class
    expect(section.className).toMatch(/bg-gradient|from-|to-/);
  });

  it("renders with proper section padding", () => {
    render(<MissionSection />);

    const section = screen.getByTestId("mission-section");
    expect(section).toHaveClass("py-16");
  });

  it("has centered text alignment", () => {
    render(<MissionSection />);

    const section = screen.getByTestId("mission-section");
    expect(section).toHaveClass("text-center");
  });
});
