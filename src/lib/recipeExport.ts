import { interpolate } from "../i18n";
import type { Copy } from "../i18n";
import type { BrewingRecipe, InfusionDetailKey } from "../types";

export interface EditableParameters {
  waterMl: string;
  teaGrams: string;
  ratioMlPerGram: string;
  ratioRangeMin?: string;
  ratioRangeMax?: string;
}

export interface TimerStep {
  id: string;
  label: string;
  detail: string;
  seconds: number;
  durationLabel?: string;
  hint?: string;
  kind: "rinse" | "infusion";
}

export const imageExportFormats = ["png", "jpeg"] as const;
export type ImageExportFormat = (typeof imageExportFormats)[number];

interface ImageExportMetadata {
  extension: string;
  filename: string;
  mimeType: string;
}

const RECIPE_EXPORT_BASE_FILENAME = "tea-master-recipe";
export const RECIPE_PDF_FILENAME = `${RECIPE_EXPORT_BASE_FILENAME}.pdf`;

const recipeCardWidth = 900;
const recipeCardHorizontalPadding = 56;

export function getImageExportMetadata(
  format: ImageExportFormat
): ImageExportMetadata {
  switch (format) {
    case "png":
      return {
        extension: "png",
        filename: `${RECIPE_EXPORT_BASE_FILENAME}.png`,
        mimeType: "image/png"
      };
    case "jpeg":
      return {
        extension: "jpg",
        filename: `${RECIPE_EXPORT_BASE_FILENAME}.jpg`,
        mimeType: "image/jpeg"
      };
  }
}

export async function downloadRecipeImage(
  copy: Copy,
  recipe: BrewingRecipe,
  editableParameters: EditableParameters,
  format: ImageExportFormat
) {
  const metadata = getImageExportMetadata(format);
  const { svg, width, height } = buildRecipeCardDocument(
    copy,
    recipe,
    editableParameters
  );

  const imageBlob = await renderSvgToImageBlob(svg, {
    width,
    height,
    mimeType: metadata.mimeType,
    background: format === "jpeg" ? "#fffefa" : undefined
  });
  downloadBlob(imageBlob, metadata.filename);
}

export async function downloadRecipePdf(
  copy: Copy,
  recipe: BrewingRecipe,
  editableParameters: EditableParameters
) {
  const { svg, width, height } = buildRecipeCardDocument(
    copy,
    recipe,
    editableParameters
  );
  const imageBlob = await renderSvgToImageBlob(svg, {
    width,
    height,
    mimeType: "image/png",
    background: "#fffefa",
    scale: 2
  });
  const imageDataUrl = await readBlobAsDataUrl(imageBlob);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: height > width ? "portrait" : "landscape",
    unit: "pt",
    format: [width, height]
  });

  pdf.addImage(imageDataUrl, "PNG", 0, 0, width, height);
  pdf.save(RECIPE_PDF_FILENAME);
}

export function buildRecipeCardSvg(
  copy: Copy,
  recipe: BrewingRecipe,
  editableParameters: EditableParameters
) {
  return buildRecipeCardDocument(copy, recipe, editableParameters).svg;
}

export function buildTimerSteps(copy: Copy, recipe: BrewingRecipe): TimerStep[] {
  const rinseSteps = recipe.rinses.map((rinse) => ({
    id: `rinse-${rinse.index}`,
    label:
      recipe.rinses.length > 1
        ? interpolate(copy.rinseWithIndex, { index: rinse.index })
        : copy.rinse,
    detail: `${resolveRinseDetail(copy, rinse.detailKey)} ${copy.rinseDiscardHint}`,
    seconds: rinse.seconds,
    kind: "rinse" as const
  }));

  return [
    ...rinseSteps,
    ...recipe.infusions.map((infusion) => ({
      id: `infusion-${infusion.index}`,
      label: interpolate(
        infusion.optional ? copy.optionalInfusion : copy.infusion,
        { index: infusion.index }
      ),
      detail: resolveInfusionDetail(copy, infusion.detailKey, infusion.seconds),
      durationLabel: resolveDurationLabel(copy, infusion.detailKey),
      hint: resolvePourHint(copy, infusion.detailKey),
      seconds: infusion.seconds,
      kind: "infusion" as const
    }))
  ];
}

export function formatStepDetail(step: TimerStep, copy: Copy) {
  if (step.seconds <= 0) {
    return step.detail;
  }

  const duration = step.durationLabel ?? formatSeconds(step.seconds, copy.seconds);
  return `${duration} · ${step.detail}`;
}

export function formatEditableRatio(parameters: EditableParameters) {
  if (
    parameters.ratioRangeMin !== undefined &&
    parameters.ratioRangeMax !== undefined
  ) {
    return `1:${parameters.ratioRangeMin}–1:${parameters.ratioRangeMax}`;
  }

  return `1:${parameters.ratioMlPerGram}`;
}

export function formatRecipeTemperature(recipe: BrewingRecipe) {
  if (recipe.temperatureCRange) {
    return `${recipe.temperatureCRange.min}–${recipe.temperatureCRange.max}°C`;
  }

  return `${recipe.temperatureC}°C`;
}

export function formatRecommendedInfusionCount(recipe: BrewingRecipe) {
  const requiredCount = recipe.infusions.filter(
    (infusion) => !infusion.optional
  ).length;
  const totalCount = recipe.infusions.length;

  if (requiredCount !== totalCount) {
    return `${requiredCount}–${totalCount}`;
  }

  return String(totalCount);
}

function buildRecipeCardDocument(
  copy: Copy,
  recipe: BrewingRecipe,
  editableParameters: EditableParameters
) {
  const lines = buildRecipeCardLines(copy, recipe, editableParameters).flatMap(
    (line) => wrapLine(line, 46)
  );
  const contentStartY = 168;
  const lineHeight = 30;
  const height = Math.max(680, contentStartY + lines.length * lineHeight + 72);
  const textLines = lines
    .map((line, index) => {
      const y = contentStartY + index * lineHeight;
      const className = index === lines.length - 1 ? "footer" : "body";
      return `<text class="${className}" x="${recipeCardHorizontalPadding}" y="${y}">${escapeXml(line)}</text>`;
    })
    .join("");

  return {
    width: recipeCardWidth,
    height,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${recipeCardWidth}" height="${height}" viewBox="0 0 ${recipeCardWidth} ${height}">
  <style>
    .title { fill: #173126; font: 700 36px Inter, "Segoe UI", sans-serif; }
    .slogan { fill: #8b5d2b; font: 700 22px Georgia, "Times New Roman", serif; }
    .body { fill: #36463d; font: 500 22px Inter, "Segoe UI", sans-serif; }
    .footer { fill: #6d756f; font: 600 19px Inter, "Segoe UI", sans-serif; }
    .rule { stroke: #c99b50; stroke-width: 3; stroke-linecap: round; }
    .logoPrimary { fill: none; stroke: #2b6f58; stroke-linecap: round; stroke-linejoin: round; }
    .logoCup { fill: #eef6ef; stroke-width: 2.4; }
    .logoSteam { stroke-width: 2; opacity: 0.68; }
    .logoLine { fill: none; stroke: #c99b50; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  </style>
  <rect width="100%" height="100%" rx="24" fill="#fffefa" />
  <rect x="20" y="20" width="${recipeCardWidth - 40}" height="${height - 40}" rx="18" fill="none" stroke="#d9ded1" />
  <g data-export-logo="tea-master-logo" transform="translate(48 46)">
    <path class="logoPrimary logoSteam" d="M29 9.5c-4.2 4.1 4.1 6.4-.3 10.6" />
    <path class="logoPrimary logoSteam" d="M41.5 7.5c-4.8 4.7 4.4 7.1-.4 12" />
    <path class="logoPrimary logoSteam" d="M54 10.5c-3.8 3.9 3.5 6.2-.4 9.8" />
    <path class="logoPrimary logoCup" d="M18 25.5h38c-1.6 8.7-8.2 13.8-19 13.8s-17.4-5.1-19-13.8Z" />
    <path class="logoLine" d="M23.5 27.2c8.4 2.6 18.4 2.6 27 0" />
    <path class="logoPrimary" stroke-width="2" d="M55 27h5.4c4 0 5.7 4.5 3.1 7.4-1.8 2-4.7 2.2-7.3.9" />
    <path class="logoLine" opacity="0.82" d="M15.5 41c11.4 3.2 31.7 3.2 43.1 0" />
  </g>
  <text class="title" x="144" y="72">${escapeXml(copy.appName)}</text>
  <text class="slogan" x="144" y="106">${escapeXml(copy.slogan)}</text>
  <path class="rule" d="M${recipeCardHorizontalPadding} 132h180" />
  ${textLines}
</svg>`
  };
}

function buildRecipeCardLines(
  copy: Copy,
  recipe: BrewingRecipe,
  editableParameters: EditableParameters
) {
  const steps = buildTimerSteps(copy, recipe);

  return [
    `${copy.chooseTea}: ${copy.teaNames[recipe.teaType]}`,
    `${copy.vessel}: ${copy.vesselNames[recipe.vessel]}`,
    `${copy.water}: ${editableParameters.waterMl} ${copy.milliliters}`,
    `${copy.teaAmount}: ${editableParameters.teaGrams} ${copy.grams}`,
    `${copy.ratio}: ${formatEditableRatio(editableParameters)}`,
    `${copy.temperature}: ${formatRecipeTemperature(recipe)}`,
    `${copy.infusionCount}: ${formatRecommendedInfusionCount(recipe)} ${copy.infusionCountUnit}`,
    `${copy.process}:`,
    `0. ${copy.prepare} - ${copy.prepareDetail}`,
    ...steps.map(
      (step, index) => `${index + 1}. ${step.label} - ${formatStepDetail(step, copy)}`
    ),
    copy.footerCredit
  ];
}

function formatSeconds(seconds: number, unit: string) {
  return `${seconds} ${unit}`;
}

function resolveRinseDetail(
  copy: Copy,
  detailKey: InfusionDetailKey | undefined
) {
  switch (detailKey) {
    case "white_rinse":
      return copy.whiteRinseDetail;
    case "immediate":
      return copy.rinseImmediateDetail;
    default:
      return copy.rinseDetail;
  }
}

function resolveInfusionDetail(
  copy: Copy,
  detailKey: InfusionDetailKey | undefined,
  seconds: number
) {
  switch (detailKey) {
    case "green_first":
      return copy.greenFirstInfusionDetail;
    case "green_refill":
      return copy.greenRefillInfusionDetail;
    case "green_optional":
      return copy.greenOptionalInfusionDetail;
    case "white_rinse":
      return copy.whiteRinseDetail;
    case "white_first":
      return copy.whiteFirstInfusionDetail;
    case "white_second":
      return copy.whiteSecondInfusionDetail;
    case "immediate":
      return copy.immediateInfusionDetail;
    case "standard":
    default:
      return seconds <= 0 ? copy.immediateInfusionDetail : copy.infusionDetail;
  }
}

function resolveDurationLabel(
  copy: Copy,
  detailKey: InfusionDetailKey | undefined
) {
  switch (detailKey) {
    case "green_optional":
      return copy.greenOptionalDuration;
    case "white_first":
      return copy.whiteFirstDuration;
    case "white_second":
      return copy.whiteSecondDuration;
    default:
      return undefined;
  }
}

function resolvePourHint(copy: Copy, detailKey: InfusionDetailKey | undefined) {
  return detailKey?.startsWith("green_") ? copy.greenCupHint : copy.pourOut;
}

function wrapLine(line: string, maxLength: number) {
  if (line.length <= maxLength) {
    return [line];
  }

  const chunks: string[] = [];
  for (let index = 0; index < line.length; index += maxLength) {
    chunks.push(line.slice(index, index + maxLength));
  }
  return chunks;
}

interface RenderSvgOptions {
  width: number;
  height: number;
  mimeType: string;
  background?: string;
  scale?: number;
}

async function renderSvgToImageBlob(svg: string, options: RenderSvgOptions) {
  const scale = options.scale ?? 1;
  const image = await loadSvgImage(svg);
  const canvas = document.createElement("canvas");

  canvas.width = Math.ceil(options.width * scale);
  canvas.height = Math.ceil(options.height * scale);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering is not available");
  }

  context.scale(scale, scale);

  if (options.background) {
    context.fillStyle = options.background;
    context.fillRect(0, 0, options.width, options.height);
  }

  context.drawImage(image, 0, 0, options.width, options.height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Could not encode ${options.mimeType}`));
          return;
        }

        resolve(blob);
      },
      options.mimeType,
      options.mimeType === "image/jpeg" ? 0.92 : undefined
    );
  });
}

function loadSvgImage(svg: string) {
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const image = new Image();

  return new Promise<HTMLImageElement>((resolve, reject) => {
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not render recipe card SVG"));
    };
    image.src = url;
  });
}

function readBlobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read exported image"));
    reader.readAsDataURL(blob);
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
