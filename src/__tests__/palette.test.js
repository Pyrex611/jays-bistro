import { describe, expect, it } from "vitest";
import config from "../../tailwind.config.js";
import { contrastRatio } from "../lib/color.js";

const c = config.theme.extend.colors;

/**
 * Guards the "brand-aware soft pastel" methodology (docs/DESIGN_SYSTEM.md): every documented text-on-surface pair must stay ≥ 4.5:1.
 * If you change a pastel token, this test tells you immediately whether text is still legible.
 */
const PAIRS = [
  // [label, text, surface, minimum]
  ["hero text on sage gradient (light stop)", c.leaf[950], c.sage[400], 4.5],
  ["hero text on sage gradient (dark stop)", c.leaf[950], c.sage[600], 4.5],
  ["hero title on sage gradient (dark stop)", c.leaf[900], c.sage[600], 4.5],
  ["product tile name area text on cream", c.ink[900], c.cream[100], 4.5],
  ["apricot card text (light stop)", c.sun[900], c.apricot[300], 4.5],
  ["apricot card text (dark stop)", c.sun[900], c.apricot[400], 4.5],
  ["price chip text on action orange", c.leaf[950], c.sun[500], 4.5],
  ["primary button text on action green", "#FFFFFF", c.leaf[700], 4.5],
  ["secondary text on cream", c.ink[500], c.cream[100], 4.5],
  ["no-photo icon on sage tile (graphic, 3:1)", c.leaf[700], c.sage[500], 3],
];

describe("pastel palette contrast", () => {
  it.each(PAIRS)("%s", (_label, text, surface, min) => {
    expect(contrastRatio(text, surface)).toBeGreaterThanOrEqual(min);
  });

  it("keeps surfaces pastel (high lightness) and actions saturated", () => {
    const light = (hex) => (Math.max(...[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))) + Math.min(...[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)))) / 2 / 255;
    [c.sage[400], c.sage[500], c.sage[600], c.apricot[300], c.apricot[400]].forEach((hex) => expect(light(hex), hex).toBeGreaterThan(0.5));
    [c.leaf[700], c.sun[500]].forEach((hex) => expect(light(hex), hex).toBeLessThan(0.55));
  });

  it("brand anchors still match the logo", () => {
    expect(c.leaf[700].toLowerCase()).toBe("#286334");
    expect(c.sun[500].toLowerCase()).toBe("#e4830e");
    expect(c.cream[100].toLowerCase()).toBe("#fbf8ee");
  });
});
