import { describe, expect, it } from "vitest";
import { parseRecipeQueryState } from "./recipeQueryState";

describe("recipe query state", () => {
  const fallback = {
    lang: "en",
    tea: "green",
    vessel: "glass_cup",
    water: 250,
    ratio: 100,
    strength: "standard"
  } as const;

  it("parses a complete valid recipe query state", () => {
    expect(
      parseRecipeQueryState(
        "?lang=zh&tea=black&vessel=porcelain_pot&water=230&ratio=90&strength=strong",
        fallback
      )
    ).toEqual({
      lang: "zh",
      tea: "black",
      vessel: "porcelain_pot",
      water: 230,
      ratio: 90,
      strength: "strong"
    });
  });

  it("falls back for invalid language, tea, vessel, water, ratio, and strength values", () => {
    expect(
      parseRecipeQueryState(
        "?lang=fr&tea=yellow&vessel=clay&water=-1&ratio=0&strength=heavy",
        fallback
      )
    ).toEqual(fallback);
  });

  it("falls back when the vessel is not valid for the selected tea", () => {
    expect(
      parseRecipeQueryState(
        "?lang=de&tea=green&vessel=gaiwan&water=300&ratio=100&strength=light",
        fallback
      )
    ).toEqual({
      lang: "de",
      tea: "green",
      vessel: "glass_cup",
      water: 300,
      ratio: 100,
      strength: "light"
    });
  });

});
