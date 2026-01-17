import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/__tests__/setup/test-utils";
import { SignupForm } from "@/components/auth/SignupForm";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock Convex auth
const mockSignIn = vi.fn();
vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: mockSignIn }),
}));

describe("SignupForm", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockSignIn.mockReset();
  });

  it("renders signup form with email and password fields", () => {
    render(<SignupForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("shows error for invalid email format", async () => {
    const user = userEvent.setup();

    render(<SignupForm />);

    // Use email that passes HTML5 validation but fails component regex
    await user.type(screen.getByLabelText(/email/i), "test@invalid");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("shows error for password less than 8 characters", async () => {
    const user = userEvent.setup();

    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "short");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("submits form and redirects on success", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce(undefined);

    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

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

    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(screen.getByRole("button", { name: /creating account/i })).toBeDisabled();

    resolveSignIn!();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it("shows error when account already exists", async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValueOnce(new Error("Account already exists"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email/i), "existing@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/account with this email already exists/i)).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("shows network error message on connection failure", async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValueOnce(new TypeError("Network error"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<SignupForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it("has link to login page", () => {
    render(<SignupForm />);

    const loginLink = screen.getByRole("link", { name: /sign in instead/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});
