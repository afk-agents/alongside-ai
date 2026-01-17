import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/__tests__/setup/test-utils";
import { ForbiddenPage } from "@/components/auth/ForbiddenPage";

describe("ForbiddenPage", () => {
  it("renders 403 heading", () => {
    render(<ForbiddenPage />);
    expect(screen.getByText("403")).toBeInTheDocument();
    expect(screen.getByText("Access Forbidden")).toBeInTheDocument();
  });

  it("shows default message when no message prop provided", () => {
    render(<ForbiddenPage />);
    expect(
      screen.getByText("You don't have permission to access this page.")
    ).toBeInTheDocument();
  });

  it("shows custom message when provided", () => {
    render(<ForbiddenPage message="Only administrators can access this page." />);
    expect(
      screen.getByText("Only administrators can access this page.")
    ).toBeInTheDocument();
  });

  it("renders link to home page", () => {
    render(<ForbiddenPage />);
    const link = screen.getByRole("link", { name: /go back home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });
});
