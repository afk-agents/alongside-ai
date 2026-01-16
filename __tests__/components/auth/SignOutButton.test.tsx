import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/__tests__/setup/test-utils";
import { SignOutButton } from "@/components/auth/SignOutButton";
import {
  mockSignOut,
  resetConvexMocks,
} from "@/__tests__/setup/mocks/convex";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock Convex auth
vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signOut: mockSignOut }),
}));

describe("SignOutButton", () => {
  beforeEach(() => {
    resetConvexMocks();
    mockPush.mockReset();
  });

  it("renders sign out button", () => {
    render(<SignOutButton />);
    expect(
      screen.getByRole("button", { name: /sign out/i })
    ).toBeInTheDocument();
  });

  it("calls signOut and redirects on click", async () => {
    const user = userEvent.setup();
    mockSignOut.mockResolvedValueOnce(undefined);

    render(<SignOutButton />);
    await user.click(screen.getByRole("button", { name: /sign out/i }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("shows loading state while signing out", async () => {
    const user = userEvent.setup();
    // Create a promise that doesn't resolve immediately
    let resolveSignOut: () => void;
    mockSignOut.mockImplementationOnce(
      () =>
        new Promise<void>((r) => {
          resolveSignOut = r;
        })
    );

    render(<SignOutButton />);
    await user.click(screen.getByRole("button", { name: /sign out/i }));

    expect(
      screen.getByRole("button", { name: /signing out/i })
    ).toBeDisabled();

    // Resolve and cleanup
    resolveSignOut!();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it("redirects to home even if signOut fails", async () => {
    const user = userEvent.setup();
    mockSignOut.mockRejectedValueOnce(new Error("Network error"));

    render(<SignOutButton />);
    await user.click(screen.getByRole("button", { name: /sign out/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
