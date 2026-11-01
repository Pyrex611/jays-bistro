import { describe, expect, it } from "vitest";
import { pickActiveGroup } from "../lib/scrollSpy.js";

const groups = (...tops) => ["Meals", "Protein", "Starters", "Bites", "Beverages", "Soups"].slice(0, tops.length).map((name, i) => ({ name, top: tops[i] }));

describe("pickActiveGroup", () => {
  it("starts on the first group", () => {
    expect(pickActiveGroup(groups(300, 1500, 2400), 200)).toBe("Meals");
  });

  it("switches when the next group's first card rises above the line", () => {
    expect(pickActiveGroup(groups(-900, 150, 900), 200)).toBe("Protein");
    expect(pickActiveGroup(groups(-900, 250, 900), 200)).toBe("Meals");
  });

  it("picks the last group whose card has passed the line (never skips backwards)", () => {
    expect(pickActiveGroup(groups(-3000, -2000, -1000, 50, 800), 200)).toBe("Bites");
  });

  it("activates the final, short group at the very bottom of the page", () => {
    const g = groups(-3000, -2000, -1200, -800, -400, 600);
    expect(pickActiveGroup(g, 200)).toBe("Beverages");
    expect(pickActiveGroup(g, 200, true)).toBe("Soups");
  });

  it("handles no groups", () => {
    expect(pickActiveGroup([], 200)).toBeNull();
  });
});
