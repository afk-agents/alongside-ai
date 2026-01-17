import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import { NavLink } from "@/components/layout/NavLink";

// Mock usePathname from next/navigation
const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("NavLink", () => {
  beforeEach(() => {
    mockUsePathname.mockReset();
  });

  it("renders a link with the correct href", () => {
    mockUsePathname.mockReturnValue("/");

    render(<NavLink href="/events">Events</NavLink>);

    const link = screen.getByRole("link", { name: /events/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/events");
  });

  it("applies className to the link", () => {
    mockUsePathname.mockReturnValue("/");

    render(
      <NavLink href="/events" className="text-gray-600">
        Events
      </NavLink>
    );

    const link = screen.getByRole("link", { name: /events/i });
    expect(link).toHaveClass("text-gray-600");
  });

  it("applies activeClassName when pathname matches href exactly", () => {
    mockUsePathname.mockReturnValue("/events");

    render(
      <NavLink
        href="/events"
        className="text-gray-600"
        activeClassName="text-gray-900 font-semibold"
      >
        Events
      </NavLink>
    );

    const link = screen.getByRole("link", { name: /events/i });
    expect(link).toHaveClass("text-gray-900");
    expect(link).toHaveClass("font-semibold");
  });

  it("applies activeClassName when pathname starts with href/ (nested routes)", () => {
    mockUsePathname.mockReturnValue("/events/123");

    render(
      <NavLink
        href="/events"
        className="text-gray-600"
        activeClassName="text-gray-900 font-semibold"
      >
        Events
      </NavLink>
    );

    const link = screen.getByRole("link", { name: /events/i });
    expect(link).toHaveClass("text-gray-900");
    expect(link).toHaveClass("font-semibold");
  });

  it("does not apply activeClassName when pathname does not match", () => {
    mockUsePathname.mockReturnValue("/blog");

    render(
      <NavLink
        href="/events"
        className="text-gray-600"
        activeClassName="text-gray-900 font-semibold"
      >
        Events
      </NavLink>
    );

    const link = screen.getByRole("link", { name: /events/i });
    expect(link).toHaveClass("text-gray-600");
    expect(link).not.toHaveClass("font-semibold");
  });

  it("home link (/) only matches exactly, not all routes", () => {
    mockUsePathname.mockReturnValue("/events");

    render(
      <NavLink href="/" className="text-gray-600" activeClassName="font-semibold">
        Home
      </NavLink>
    );

    const link = screen.getByRole("link", { name: /home/i });
    expect(link).not.toHaveClass("font-semibold");
  });

  it("home link (/) is active when pathname is exactly /", () => {
    mockUsePathname.mockReturnValue("/");

    render(
      <NavLink href="/" className="text-gray-600" activeClassName="font-semibold">
        Home
      </NavLink>
    );

    const link = screen.getByRole("link", { name: /home/i });
    expect(link).toHaveClass("font-semibold");
  });

  it("renders children correctly", () => {
    mockUsePathname.mockReturnValue("/");

    render(
      <NavLink href="/about">
        <span>About Us</span>
      </NavLink>
    );

    expect(screen.getByText("About Us")).toBeInTheDocument();
  });
});
