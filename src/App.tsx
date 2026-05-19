import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getRecommendedVessels, teaProfiles } from "./data/teaProfiles";
import { copies, interpolate, languageNames } from "./i18n";
import { calculateRecipe } from "./lib/calculateRecipe";
import type {
  BrewingRecipe,
  InfusionDetailKey,
  Language,
  TeaType,
  Vessel
} from "./types";
import "./styles.css";

type TimerStatus = "idle" | "running" | "paused" | "steeped" | "completed";

interface TimerStep {
  id: string;
  label: string;
  detail: string;
  seconds: number;
  durationLabel?: string;
  hint?: string;
  kind: "rinse" | "infusion";
}

const languages: Language[] = ["zh", "en", "de"];

function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [teaType, setTeaType] = useState<TeaType>("green");
  const [vessel, setVessel] = useState<Vessel>(
    getRecommendedVessels("green")[0]
  );

  const copy = copies[language];
  const vessels = useMemo(() => getRecommendedVessels(teaType), [teaType]);
  const activeVessel = vessels.includes(vessel) ? vessel : vessels[0];

  useEffect(() => {
    if (activeVessel !== vessel) {
      setVessel(activeVessel);
    }
  }, [activeVessel, vessel]);

  const recommendedRecipe = useMemo(
    () => calculateRecipe({ teaType, vessel: activeVessel, language }),
    [activeVessel, language, teaType]
  );
  const [waterMlInput, setWaterMlInput] = useState(() =>
    String(recommendedRecipe.waterMl)
  );

  useEffect(() => {
    setWaterMlInput(String(recommendedRecipe.waterMl));
  }, [activeVessel, recommendedRecipe.waterMl, teaType]);

  const manualWaterMl = parseWaterMl(waterMlInput);
  const recipe = useMemo(
    () =>
      calculateRecipe({
        teaType,
        vessel: activeVessel,
        language,
        waterMl: manualWaterMl ?? recommendedRecipe.waterMl
      }),
    [
      activeVessel,
      language,
      manualWaterMl,
      recommendedRecipe.waterMl,
      teaType
    ]
  );
  const [activeTimerStepIndex, setActiveTimerStepIndex] = useState(0);

  return (
    <div className="appShell">
      <header className="topBar">
        <div>
          <p className="eyebrow">Tea Master</p>
          <h1>{copy.appName}</h1>
          <p className="subtitle">{copy.subtitle}</p>
        </div>
        <label className="languagePicker">
          <span>{copy.language}</span>
          <select
            aria-label={copy.language}
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
          >
            {languages.map((code) => (
              <option key={code} value={code}>
                {languageNames[code]}
              </option>
            ))}
          </select>
        </label>
      </header>

      <main className="workspace">
        <section className="controlPanel" aria-labelledby="tea-selector-heading">
          <div className="sectionHeader">
            <h2 id="tea-selector-heading">{copy.chooseTea}</h2>
          </div>
          <div className="teaTabs" role="tablist" aria-label={copy.chooseTea}>
            {teaProfiles.map((profile) => (
              <button
                key={profile.id}
                role="tab"
                aria-selected={teaType === profile.id}
                className={teaType === profile.id ? "active" : ""}
                onClick={() => setTeaType(profile.id)}
              >
                {copy.teaNames[profile.id]}
              </button>
            ))}
          </div>

          <div className="controlGrid">
            <VesselSelector
              label={copy.recommendedVessel}
              vesselNames={copy.vesselNames}
              vessels={vessels}
              selected={activeVessel}
              onSelect={setVessel}
            />
          </div>
        </section>

        <section className="recommendationBand" aria-labelledby="recipe-heading">
          <div className="sectionHeader">
            <h2 id="recipe-heading">{copy.recommendation}</h2>
          </div>
          <RecipeSummary
            copy={copy}
            recipe={recipe}
            waterMlInput={waterMlInput}
            onWaterMlInputChange={setWaterMlInput}
          />
        </section>

        <section className="flowArea">
          <BrewingFlow
            copy={copy}
            recipe={recipe}
            activeStepIndex={activeTimerStepIndex}
          />
          <GuidedTimer
            copy={copy}
            recipe={recipe}
            onActiveStepChange={setActiveTimerStepIndex}
          />
        </section>
      </main>
    </div>
  );
}

interface VesselSelectorProps {
  label: string;
  vesselNames: Record<Vessel, string>;
  vessels: Vessel[];
  selected: Vessel;
  onSelect: (vessel: Vessel) => void;
}

function VesselSelector({
  label,
  vesselNames,
  vessels,
  selected,
  onSelect
}: VesselSelectorProps) {
  return (
    <div className="controlBlock">
      <span className="controlLabel">{label}</span>
      <div className="segmented" role="group" aria-label={label}>
        {vessels.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={selected === option}
            className={selected === option ? "active" : ""}
            onClick={() => onSelect(option)}
          >
            {vesselNames[option]}
          </button>
        ))}
      </div>
    </div>
  );
}

interface RecipeDisplayProps {
  copy: (typeof copies)["zh"];
  recipe: BrewingRecipe;
}

interface RecipeSummaryProps extends RecipeDisplayProps {
  waterMlInput: string;
  onWaterMlInputChange: (waterMl: string) => void;
}

interface BrewingFlowProps extends RecipeDisplayProps {
  activeStepIndex: number;
}

function RecipeSummary({
  copy,
  recipe,
  waterMlInput,
  onWaterMlInputChange
}: RecipeSummaryProps) {
  return (
    <div className="summaryGrid">
      <div className="metric">
        <span className="metricLabel">{copy.vessel}</span>
        <strong data-testid="vessel" data-value={copy.vesselNames[recipe.vessel]}>
          {copy.vesselNames[recipe.vessel]}
        </strong>
      </div>
      <div className="metric">
        <label className="metricLabel" htmlFor="water-ml-input">
          {copy.water}
        </label>
        <div className="metricInputValue">
          <input
            id="water-ml-input"
            type="number"
            min="10"
            step="10"
            aria-label={copy.water}
            data-testid="water"
            data-value={recipe.waterMl}
            value={waterMlInput}
            onChange={(event) => onWaterMlInputChange(event.currentTarget.value)}
          />
          <span>{copy.milliliters}</span>
        </div>
      </div>
      <div className="metric">
        <span className="metricLabel">{copy.teaAmount}</span>
        <strong data-testid="tea-amount" data-value={recipe.teaGrams}>
          {recipe.teaGrams} {copy.grams}
        </strong>
      </div>
      <div className="metric">
        <span className="metricLabel">{copy.ratio}</span>
        <strong data-testid="ratio" data-value={formatRatio(recipe)}>
          {formatRatio(recipe)}
        </strong>
      </div>
      <div className="metric">
        <span className="metricLabel">{copy.temperature}</span>
        <strong data-testid="temperature" data-value={formatTemperature(recipe)}>
          {formatTemperature(recipe)}
        </strong>
      </div>
    </div>
  );
}

function BrewingFlow({ copy, recipe, activeStepIndex }: BrewingFlowProps) {
  const steps = buildTimerSteps(copy, recipe);

  return (
    <section className="flowPanel" aria-labelledby="flow-heading">
      <div className="sectionHeader compact">
        <h2 id="flow-heading">{copy.process}</h2>
      </div>
      <ol className="stepList">
        <li>
          <span className="stepNumber">0</span>
          <div>
            <strong>{copy.prepare}</strong>
            <p>{copy.prepareDetail}</p>
          </div>
        </li>
        {steps.map((step, index) => {
          const isActive = index === activeStepIndex;

          return (
            <li
              key={step.id}
              className={isActive ? "activeStep" : undefined}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="stepNumber">{index + 1}</span>
              <div>
                <strong>{step.label}</strong>
                <p>{formatStepDetail(step, copy)}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

interface GuidedTimerProps extends RecipeDisplayProps {
  onActiveStepChange: (stepIndex: number) => void;
}

function GuidedTimer({ copy, recipe, onActiveStepChange }: GuidedTimerProps) {
  const steps = useMemo(() => buildTimerSteps(copy, recipe), [copy, recipe]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(steps[0]?.seconds ?? 0);
  const [status, setStatus] = useState<TimerStatus>("idle");

  useEffect(() => {
    setCurrentStepIndex(0);
    setRemainingSeconds(steps[0]?.seconds ?? 0);
    setStatus("idle");
  }, [steps]);

  useEffect(() => {
    onActiveStepChange(currentStepIndex);
  }, [currentStepIndex, onActiveStepChange]);

  function beginStep(stepIndex: number) {
    const nextSeconds = steps[stepIndex]?.seconds ?? 0;

    setCurrentStepIndex(stepIndex);
    setRemainingSeconds(nextSeconds);
    setStatus(
      nextSeconds <= 0
        ? stepIndex >= steps.length - 1
          ? "completed"
          : "steeped"
        : "running"
    );
  }

  useEffect(() => {
    if (status !== "running") {
      return;
    }

    const id = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds > 1) {
          return seconds - 1;
        }

        setStatus(
          currentStepIndex >= steps.length - 1 ? "completed" : "steeped"
        );
        return 0;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [currentStepIndex, status, steps]);

  const currentStep = steps[currentStepIndex];
  const isStepDone = status === "steeped" || status === "completed";
  const statusText = {
    idle: copy.ready,
    running: copy.running,
    paused: copy.paused,
    steeped: copy.readyToSipStatus,
    completed: copy.completed
  }[status];

  const primaryLabel =
    status === "running"
      ? copy.pause
      : status === "paused"
        ? copy.resume
        : status === "steeped"
          ? copy.nextInfusion
          : copy.start;

  return (
    <section className="timerPanel" aria-labelledby="timer-heading">
      <div className="sectionHeader compact">
        <h2 id="timer-heading">{copy.timer}</h2>
        <span className={`statusPill ${status}`}>{statusText}</span>
      </div>
      <div className="timerFace">
        <p>{currentStep?.label ?? copy.allDone}</p>
        <strong data-testid="timer-display">
          {formatClock(remainingSeconds)}
        </strong>
        <span>
          {isStepDone
            ? copy.readyToSip
            : currentStep
              ? formatStepDetail(currentStep, copy)
              : copy.ready}
        </span>
      </div>
      <div className="timerActions">
        {status === "completed" ? null : (
          <button
            type="button"
            className="primaryAction"
            onClick={() => {
              if (status === "running") {
                setStatus("paused");
              } else if (status === "steeped") {
                beginStep(currentStepIndex + 1);
              } else if (status === "paused") {
                setStatus("running");
              } else {
                beginStep(currentStepIndex);
              }
            }}
          >
            {status === "running" ? <Pause size={18} /> : <Play size={18} />}
            {primaryLabel}
          </button>
        )}
        <button
          type="button"
          className="secondaryAction"
          onClick={() => {
            setCurrentStepIndex(0);
            setRemainingSeconds(steps[0]?.seconds ?? 0);
            setStatus("idle");
          }}
        >
          <RotateCcw size={18} />
          {copy.reset}
        </button>
      </div>
      {isStepDone ? null : (
        <p className="pourHint">{currentStep?.hint ?? copy.pourOut}</p>
      )}
    </section>
  );
}

function buildTimerSteps(
  copy: (typeof copies)["zh"],
  recipe: BrewingRecipe
): TimerStep[] {
  const rinseStep =
    recipe.rinseSeconds === undefined
      ? []
      : [
          {
            id: "rinse",
            label: copy.rinse,
            detail: `${resolveRinseDetail(
              copy,
              recipe.rinseDetailKey
            )} ${copy.rinseDiscardHint}`,
            seconds: recipe.rinseSeconds,
            kind: "rinse" as const
          }
        ];

  return [
    ...rinseStep,
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

function parseWaterMl(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function formatSeconds(seconds: number, unit: string) {
  return `${seconds} ${unit}`;
}

function formatStepDetail(step: TimerStep, copy: (typeof copies)["zh"]) {
  if (step.seconds <= 0) {
    return step.detail;
  }

  const duration = step.durationLabel ?? formatSeconds(step.seconds, copy.seconds);
  return `${duration} · ${step.detail}`;
}

function resolveRinseDetail(
  copy: (typeof copies)["zh"],
  detailKey: InfusionDetailKey | undefined
) {
  return detailKey === "white_rinse" ? copy.whiteRinseDetail : copy.rinseDetail;
}

function resolveInfusionDetail(
  copy: (typeof copies)["zh"],
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
  copy: (typeof copies)["zh"],
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

function resolvePourHint(
  copy: (typeof copies)["zh"],
  detailKey: InfusionDetailKey | undefined
) {
  return detailKey?.startsWith("green_") ? copy.greenCupHint : copy.pourOut;
}

function formatRatio(recipe: BrewingRecipe) {
  const range = recipe.ratioMlPerGramRange;

  if (range) {
    return `1:${range.min}–1:${range.max}`;
  }

  return `1:${recipe.ratioMlPerGram}`;
}

function formatTemperature(recipe: BrewingRecipe) {
  const range = recipe.temperatureCRange;

  if (range) {
    return `${range.min}–${range.max}°C`;
  }

  return `${recipe.temperatureC}°C`;
}

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export default App;
