import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/__tests__/setup/test-utils";
import { LoginForm } from "@/components/auth/LoginForm";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock Convex auth
const mockSignIn = vi.fn();
const mockUseConvexAuth = vi.fn();
vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: mockSignIn }),
}));
vi.mock("convex/react", () => ({
  useConvexAuth: () => mockUseConvexAuth(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockSignIn.mockReset();
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
  });

  it("renders login form with email and password fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows loading state while checking auth", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });

    render(<LoginForm />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("returns null when already authenticated", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });

    const { container } = render(<LoginForm />);

    expect(container.firstChild).toBeNull();
  });

  it("submits form and redirects on success", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce(undefined);

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("password", expect.any(FormData));
    });
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("shows loading state while submitting", async () => {
    const user = userEvent.setup();
    let resolveSignIn: () => void;
    mockSignIn.mockImplementationOnce(
      () => new Promise<void>((r) => { resolveSignIn = r; })
    );

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();

    resolveSignIn!();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it("shows error message on invalid credentials", async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValueOnce(new Error("Invalid credentials"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("shows network error message on connection failure", async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValueOnce(new TypeError("Network error"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it("has link to signup page", () => {
    render(<LoginForm />);

    const signupLink = screen.getByRole("link", { name: /sign up instead/i });
    expect(signupLink).toHaveAttribute("href", "/signup");
  });
});
