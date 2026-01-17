import { describe, it, expect } from "vitest";
import { formatDisplayName } from "@/lib/example";

describe("formatDisplayName", () => {
  it("returns first name only when no last name provided", () => {
    expect(formatDisplayName("John")).toBe("John");
  });

  it("returns first name only when last name is undefined", () => {
    expect(formatDisplayName("Jane", undefined)).toBe("Jane");
  });

  it("returns full name when both provided", () => {
    expect(formatDisplayName("John", "Doe")).toBe("John Doe");
  });

  it("handles empty strings", () => {
    expect(formatDisplayName("")).toBe("");
  });

  it("handles empty first name with last name", () => {
    expect(formatDisplayName("", "Doe")).toBe(" Doe");
  });
});
