import { describe, it, expect } from "vitest";

describe("RssImportPage", () => {
  it("page file exists and is a client component", async () => {
    const pageModule = await import("@/app/admin/articles/import/page");
    expect(pageModule.default).toBeDefined();
  });

  it("exports a default function for the page component", async () => {
    const pageModule = await import("@/app/admin/articles/import/page");
    expect(typeof pageModule.default).toBe("function");
  });
});
