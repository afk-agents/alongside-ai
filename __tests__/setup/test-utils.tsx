import { render, RenderOptions } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";

// Wrapper for providers (Convex, etc.)
function AllProviders({ children }: { children: ReactNode }) {
  // Add providers here as needed (e.g., mocked ConvexProvider)
  return <>{children}</>;
}

// Custom render that includes providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library
export * from "@testing-library/react";
export { customRender as render };
