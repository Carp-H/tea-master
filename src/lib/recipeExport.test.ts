import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { copies } from "../i18n";
import { calculateRecipe } from "./calculateRecipe";
import {
  buildRecipeCardSvg,
  downloadRecipeImage,
  downloadRecipePdf,
  getImageExportMetadata,
  imageExportFormats,
  RECIPE_PDF_FILENAME
} from "./recipeExport";
import type { ImageExportFormat } from "./recipeExport";

const pdfMocks = vi.hoisted(() => ({
  addImage: vi.fn(),
  save: vi.fn(),
  jsPDF: vi.fn()
}));

vi.mock("jspdf", () => ({
  jsPDF: pdfMocks.jsPDF
}));

describe("recipe export", () => {
  beforeEach(() => {
    pdfMocks.addImage.mockClear();
    pdfMocks.save.mockClear();
    pdfMocks.jsPDF.mockClear();
    pdfMocks.jsPDF.mockReturnValue({
      addImage: pdfMocks.addImage,
      save: pdfMocks.save
    });
  });

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
    ratioMlPerGram: "100"
  };

  it("builds a branded recipe card SVG with logo, slogan, recipe, and credit", () => {
    const svg = buildRecipeCardSvg(copies.zh, recipe, editableParameters);

    expect(svg).toContain("Tea Master");
    expect(svg).toContain("茶禅一味");
    expect(svg).toContain('data-export-logo="tea-master-logo"');
    expect(svg).toContain("M29 9.5c-4.2 4.1 4.1 6.4-.3 10.6");
    expect(svg).toContain("选择茶类: 绿茶");
    expect(svg).toContain("主泡器: 玻璃杯");
    expect(svg).toContain("注水量: 250 毫升");
    expect(svg).toContain("投茶量: 2.5 克");
    expect(svg).toContain("茶水比: 1:100");
    expect(svg).toContain("LH x Codex, 诚意呈现。");
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
    expect(RECIPE_PDF_FILENAME).toBe("tea-master-recipe.pdf");
  });

  it.each([
    ["png", "image/png", "tea-master-recipe.png", undefined],
    ["jpeg", "image/jpeg", "tea-master-recipe.jpg", 0.92]
  ] as const)(
    "renders SVG to canvas and downloads %s image blobs",
    async (format, mimeType, filename, quality) => {
      const { clickSpy, fillRect, toBlobSpy } = mockBrowserExportApis();

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
      expect(clickSpy.mock.contexts.at(-1)).toHaveProperty("download", filename);

      if (format === "jpeg") {
        expect(fillRect).toHaveBeenCalledWith(0, 0, 900, expect.any(Number));
      } else {
        expect(fillRect).not.toHaveBeenCalled();
      }
    }
  );

  it("embeds the rendered recipe card in a direct PDF download", async () => {
    mockBrowserExportApis();

    await downloadRecipePdf(copies.zh, recipe, editableParameters);

    expect(pdfMocks.jsPDF).toHaveBeenCalledWith(
      expect.objectContaining({
        orientation: "landscape",
        unit: "pt",
        format: [900, expect.any(Number)]
      })
    );
    expect(pdfMocks.addImage).toHaveBeenCalledWith(
      expect.stringMatching(/^data:image\/png;base64,/),
      "PNG",
      0,
      0,
      900,
      expect.any(Number)
    );
    expect(pdfMocks.save).toHaveBeenCalledWith("tea-master-recipe.pdf");
  });
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
