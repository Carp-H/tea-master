import { describe, expect, it } from "vitest";
import { getRecommendedVessels, teaProfiles } from "../data/teaProfiles";
import { calculateRecipe } from "./calculateRecipe";

describe("tea vessel recommendations", () => {
  it("returns the planned vessel options for every tea type", () => {
    expect(getRecommendedVessels("green")).toEqual(["glass_cup"]);
    expect(getRecommendedVessels("white")).toEqual(["gaiwan"]);
    expect(getRecommendedVessels("black")).toEqual(["gaiwan", "porcelain_pot"]);
    expect(getRecommendedVessels("oolong")).toEqual(["gaiwan"]);
    expect(getRecommendedVessels("dark")).toEqual([
      "gaiwan",
      "zisha_clay_pot"
    ]);
  });

  it("only exposes the simplified tea set", () => {
    expect(teaProfiles.map((profile) => profile.id)).toEqual([
      "green",
      "white",
      "black",
      "oolong",
      "dark"
    ]);
  });

  it("keeps each tea profile aligned with its vessel recommendations", () => {
    for (const profile of teaProfiles) {
      expect(profile.vessels).toEqual(getRecommendedVessels(profile.id));
    }
  });
});

describe("recipe calculation", () => {
  it("uses the revised tea-water ratios by tea type and vessel", () => {
    const green = calculateRecipe({ teaType: "green", vessel: "glass_cup" });
    const blackGaiwan = calculateRecipe({ teaType: "black", vessel: "gaiwan" });
    const blackPot = calculateRecipe({
      teaType: "black",
      vessel: "porcelain_pot"
    });
    const oolong = calculateRecipe({ teaType: "oolong", vessel: "gaiwan" });
    const darkGaiwan = calculateRecipe({ teaType: "dark", vessel: "gaiwan" });
    const darkZishaClay = calculateRecipe({
      teaType: "dark",
      vessel: "zisha_clay_pot"
    });

    expect(green.ratioMlPerGram).toBe(100);
    expect(green.teaGrams).toBe(2.5);
    expect(calculateRecipe({ teaType: "white", vessel: "gaiwan" }).ratioMlPerGram).toBe(30);
    expect(calculateRecipe({ teaType: "white", vessel: "gaiwan" }).ratioMlPerGramRange).toBeUndefined();
    expect(blackGaiwan.ratioMlPerGram).toBe(30);
    expect(blackPot.ratioMlPerGram).toBe(100);
    expect(oolong.ratioMlPerGram).toBe(15);
    expect(oolong.ratioMlPerGramRange).toBeUndefined();
    expect(oolong.teaGrams).toBe(7.3);
    expect(darkGaiwan.ratioMlPerGram).toBe(20);
    expect(darkGaiwan.ratioMlPerGramRange).toBeUndefined();
    expect(darkZishaClay.ratioMlPerGram).toBe(20);
    expect(darkZishaClay.teaGrams).toBe(6.5);
  });

  it("uses the revised oolong temperature range and seven-infusion flow", () => {
    const recipe = calculateRecipe({ teaType: "oolong", vessel: "gaiwan" });

    expect(recipe.temperatureCRange).toEqual({ min: 95, max: 100 });
    expect(recipe.rinseSeconds).toBeUndefined();
    expect(recipe.infusions.map((infusion) => infusion.seconds)).toEqual([
      0, 0, 5, 10, 15, 20, 25
    ]);
  });

  it("uses the glass-cup green tea temperature range and refill flow", () => {
    const recipe = calculateRecipe({ teaType: "green", vessel: "glass_cup" });

    expect(recipe.temperatureCRange).toEqual({ min: 80, max: 100 });
    expect(recipe.infusions).toEqual([
      {
        index: 1,
        seconds: 120,
        detailKey: "green_first"
      },
      {
        index: 2,
        seconds: 180,
        detailKey: "green_refill"
      },
      {
        index: 3,
        seconds: 180,
        detailKey: "green_optional",
        optional: true
      }
    ]);
  });

  it("uses the revised white tea gaiwan-only fixed ratio, rinse, and six-to-seven infusion flow", () => {
    const recipe = calculateRecipe({ teaType: "white", vessel: "gaiwan" });

    expect(recipe.vessel).toBe("gaiwan");
    expect(recipe.ratioMlPerGram).toBe(30);
    expect(recipe.ratioMlPerGramRange).toBeUndefined();
    expect(recipe.teaGrams).toBe(3.7);
    expect(recipe.temperatureC).toBe(100);
    expect(recipe.rinseSeconds).toBe(0);
    expect(recipe.rinseDetailKey).toBe("white_rinse");
    expect(recipe.infusions).toEqual([
      {
        index: 1,
        seconds: 25,
        detailKey: "white_first"
      },
      {
        index: 2,
        seconds: 30,
        detailKey: "white_second"
      },
      {
        index: 3,
        seconds: 35
      },
      {
        index: 4,
        seconds: 40
      },
      {
        index: 5,
        seconds: 45
      },
      {
        index: 6,
        seconds: 50
      },
      {
        index: 7,
        seconds: 55,
        optional: true
      }
    ]);
  });

  it("uses the revised black tea porcelain-pot capacity, temperature range, and two-infusion flow", () => {
    const recipe = calculateRecipe({
      teaType: "black",
      vessel: "porcelain_pot"
    });

    expect(recipe.waterMl).toBe(230);
    expect(recipe.ratioMlPerGram).toBe(100);
    expect(recipe.teaGrams).toBe(2.3);
    expect(recipe.temperatureCRange).toEqual({ min: 90, max: 100 });
    expect(recipe.infusions).toEqual([
      {
        index: 1,
        seconds: 120
      },
      {
        index: 2,
        seconds: 180
      },
      {
        index: 3,
        seconds: 300,
        optional: true
      }
    ]);
  });

  it("uses the revised black tea gaiwan temperature and four-to-six infusion flow", () => {
    const recipe = calculateRecipe({
      teaType: "black",
      vessel: "gaiwan"
    });

    expect(recipe.temperatureC).toBe(100);
    expect(recipe.temperatureCRange).toBeUndefined();
    expect(recipe.infusions).toEqual([
      { index: 1, seconds: 20 },
      { index: 2, seconds: 20 },
      { index: 3, seconds: 25 },
      { index: 4, seconds: 30 },
      { index: 5, seconds: 40, optional: true },
      { index: 6, seconds: 50, optional: true }
    ]);
  });

  it("uses the revised dark tea two-rinse flow and eight-to-ten infusion flow", () => {
    const recipe = calculateRecipe({
      teaType: "dark",
      vessel: "gaiwan"
    });

    expect(recipe.rinses).toEqual([
      {
        index: 1,
        seconds: 10
      },
      {
        index: 2,
        seconds: 0,
        detailKey: "immediate"
      }
    ]);
    expect(recipe.infusions).toEqual([
      { index: 1, seconds: 0, detailKey: "immediate" },
      { index: 2, seconds: 0, detailKey: "immediate" },
      { index: 3, seconds: 0, detailKey: "immediate" },
      { index: 4, seconds: 5 },
      { index: 5, seconds: 10 },
      { index: 6, seconds: 15 },
      { index: 7, seconds: 20 },
      { index: 8, seconds: 25 },
      { index: 9, seconds: 30, optional: true },
      { index: 10, seconds: 35, optional: true }
    ]);
  });

  it("calculates vessel-capacity values from tea type and selected vessel", () => {
    const recipe = calculateRecipe({
      teaType: "white",
      vessel: "gaiwan"
    });

    expect(recipe.waterMl).toBe(110);
    expect(recipe.teaGrams).toBe(3.7);
    expect(recipe.ratioMlPerGram).toBe(30);
    expect(recipe.temperatureC).toBe(100);
    expect(recipe.infusions.map((infusion) => infusion.seconds)).toEqual([
      25, 30, 35, 40, 45, 50, 55
    ]);
  });

  it("updates the numeric recommendation when the vessel changes", () => {
    const gaiwan = calculateRecipe({
      teaType: "dark",
      vessel: "gaiwan"
    });
    const zishaClay = calculateRecipe({
      teaType: "dark",
      vessel: "zisha_clay_pot"
    });

    expect(gaiwan.waterMl).toBe(110);
    expect(gaiwan.teaGrams).toBe(5.5);
    expect(gaiwan.rinses.map((rinse) => rinse.seconds)).toEqual([10, 0]);
    expect(zishaClay.waterMl).toBe(130);
    expect(zishaClay.teaGrams).toBe(6.5);
    expect(zishaClay.ratioMlPerGram).toBe(gaiwan.ratioMlPerGram);
  });

  it("uses a manually edited water amount to recalculate tea grams from the recommended ratio", () => {
    const recipe = calculateRecipe({
      teaType: "white",
      vessel: "gaiwan",
      waterMl: 600
    });

    expect(recipe.waterMl).toBe(600);
    expect(recipe.ratioMlPerGram).toBe(30);
    expect(recipe.teaGrams).toBe(20);
  });

  it("does not let language affect recipe calculation", () => {
    const chineseRecipe = calculateRecipe({
      teaType: "oolong",
      vessel: "gaiwan",
      language: "zh"
    });
    const germanRecipe = calculateRecipe({
      teaType: "oolong",
      vessel: "gaiwan",
      language: "de"
    });

    expect(germanRecipe).toEqual(chineseRecipe);
  });

  it("rejects a vessel that is not recommended for the tea type", () => {
    expect(() =>
      calculateRecipe({ teaType: "green", vessel: "gaiwan" })
    ).toThrow("Vessel gaiwan is not available for tea type green");
  });
});
