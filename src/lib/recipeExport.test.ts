import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { copies } from "../i18n";
import { calculateRecipe } from "./calculateRecipe";
import {
  buildRecipeCardSvg,
  downloadRecipeImage,
  getImageExportMetadata,
  imageExportFormats
} from "./recipeExport";
import type { ImageExportFormat } from "./recipeExport";

describe("recipe export", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const recipe = calculateRecipe({
    teaType: "green",
    vessel: "glass_cup",
    language: "zh",
    waterMl: 250
  });
  const editableParameters = {
    waterMl: "250",
    teaGrams: "2.5",
    ratioMlPerGram: "100",
    strength: "standard" as const
  };

  it("builds a branded recipe card SVG with logo, slogan, recipe, strength, web link, and credit", () => {
    const svg = buildRecipeCardSvg(copies.zh, recipe, editableParameters);

    expect(svg).toContain("Tea Master");
    expect(svg).toContain("茶禅一味");
    expect(svg).toContain('data-export-logo="tea-master-logo"');
    expect(svg).toContain("M29 9.5c-4.2 4.1 4.1 6.4-.3 10.6");
    expect(svg).toContain("选择茶类: 绿茶");
    expect(svg).toContain("主泡器: 玻璃杯");
    expect(svg).toContain("注水量（即主泡器容积）: 250 毫升");
    expect(svg).toContain("口味浓淡: 标准");
    expect(svg).toContain("投茶量: 2.5 克");
    expect(svg).toContain("茶水比: 1:100");
    expect(svg).toContain(">https://carp-h.github.io/tea-master/<");
    expect(svg).not.toContain("<a ");
    expect(svg).not.toContain("href=");
    expect(svg).not.toContain("target=");
    expect(svg).toContain("LH x Codex, 诚意呈现。");
  });

  it("uses a long title divider and keeps the footer as a separated one-line footnote", () => {
    const svg = buildRecipeCardSvg(copies.en, recipe, editableParameters);
    const textElements = extractTextElements(svg);
    const bodyYValues = textElements
      .filter((element) => element.className === "body")
      .map((element) => element.y);
    const footerElements = textElements.filter(
      (element) => element.className === "footer"
    );
    const linkElements = textElements.filter(
      (element) => element.className === "siteLink"
    );
    const height = Number(svg.match(/height="(\d+)"/)?.[1]);

    expect(svg).toContain('d="M56 132h788"');
    expect(footerElements).toHaveLength(1);
    expect(linkElements).toHaveLength(1);
    expect(linkElements[0].text).toBe("https://carp-h.github.io/tea-master/");
    expect(footerElements[0].text).toBe(copies.en.footerCredit);
    expect(linkElements[0].y).toBeLessThan(footerElements[0].y);
    expect(footerElements[0].y - Math.max(...bodyYValues)).toBeGreaterThanOrEqual(
      72
    );
    expect(height - footerElements[0].y).toBeGreaterThanOrEqual(48);
  });

  it("wraps English recipe text at readable boundaries instead of splitting words", () => {
    const svg = buildRecipeCardSvg(copies.en, recipe, editableParameters);
    const textLines = extractTextElements(svg).map((element) => element.text);
    const textWithLineBreaks = textLines.join("\n");

    expect(textLines.some((line) => line.includes("boiling"))).toBe(true);
    expect(textWithLineBreaks).not.toMatch(/\bwa\nter\b|\bwat\ner\b/);
    expect(textLines.every((line) => !line.startsWith(" "))).toBe(true);
    expect(textLines.every((line) => !line.endsWith(" "))).toBe(true);
    expect(svg).not.toContain("textLength=");
    expect(svg).not.toContain("lengthAdjust=");
  });

  it("defines the supported image export formats and file metadata", () => {
    expect(imageExportFormats).toEqual(["png", "jpeg"]);
    expect(getImageExportMetadata("png")).toEqual({
      extension: "png",
      filename: "tea-master-recipe.png",
      mimeType: "image/png"
    });
    expect(getImageExportMetadata("jpeg")).toEqual({
      extension: "jpg",
      filename: "tea-master-recipe.jpg",
      mimeType: "image/jpeg"
    });
  });

  it.each([
    ["png", "image/png", "tea-master-recipe.png", undefined],
    ["jpeg", "image/jpeg", "tea-master-recipe.jpg", 0.92]
  ] as const)(
    "renders SVG to canvas and downloads %s image blobs",
    async (format, mimeType, filename, quality) => {
      const { clickSpy, fillRect, scale, toBlobSpy } = mockBrowserExportApis();

      await downloadRecipeImage(
        copies.zh,
        recipe,
        editableParameters,
        format satisfies ImageExportFormat
      );

      expect(toBlobSpy).toHaveBeenCalledWith(
        expect.any(Function),
        mimeType,
        quality
      );
      expect(scale).toHaveBeenCalledWith(3, 3);
      expect(clickSpy.mock.contexts.at(-1)).toHaveProperty("download", filename);

      if (format === "jpeg") {
        expect(fillRect).toHaveBeenCalledWith(0, 0, 900, expect.any(Number));
      } else {
        expect(fillRect).not.toHaveBeenCalled();
      }
    }
  );

});

function mockBrowserExportApis() {
  const fillRect = vi.fn();
  const drawImage = vi.fn();
  const scale = vi.fn();
  const context = {
    drawImage,
    fillRect,
    scale,
    fillStyle: ""
  };
  const toBlobSpy = vi
    .spyOn(HTMLCanvasElement.prototype, "toBlob")
    .mockImplementation(function mockToBlob(callback, mimeType) {
      callback(new Blob(["image"], { type: mimeType }));
    });

  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D
  );
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn(() => "blob:recipe-card")
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn()
  });
  const clickSpy = vi
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => undefined);

  class TestImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    set src(_value: string) {
      queueMicrotask(() => this.onload?.());
    }
  }

  vi.stubGlobal("Image", TestImage);

  return { clickSpy, drawImage, fillRect, scale, toBlobSpy };
}

function extractTextElements(svg: string) {
  return Array.from(
    svg.matchAll(
      /<text class="(?<className>[^"]+)" x="[^"]+" y="(?<y>\d+)"[^>]*>(?<text>.*?)<\/text>/g
    )
  ).map((match) => ({
    className: match.groups?.className ?? "",
    text: match.groups?.text ?? "",
    y: Number(match.groups?.y ?? 0)
  }));
}
