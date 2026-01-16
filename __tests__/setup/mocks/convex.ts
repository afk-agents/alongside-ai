import { vi } from "vitest";

// Mock useAuthActions hook
export const mockSignOut = vi.fn();
export const mockSignIn = vi.fn();

export const mockUseAuthActions = () => ({
  signOut: mockSignOut,
  signIn: mockSignIn,
});

// Reset all mocks between tests
export function resetConvexMocks() {
  mockSignOut.mockReset();
  mockSignIn.mockReset();
}
