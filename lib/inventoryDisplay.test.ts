import { describe, expect, it } from "vitest";
import { formatStatValue } from "@/lib/inventoryDisplay";

describe("inventoryDisplay", () => {
  it("formats decimal percentage stats as displayed percentages", () => {
    expect(formatStatValue("criticalChance", 0.03)).toBe("+3%");
    expect(formatStatValue("criticalDamage", 0.25)).toBe("+25%");
  });

  it("formats regular positive stats with a signed value", () => {
    expect(formatStatValue("strength", 2)).toBe("+2");
  });
});
