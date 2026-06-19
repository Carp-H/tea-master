import {
  Bell,
  Download,
  FileImage,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getBrewingGuide } from "./data/brewingGuides";
import { getRecommendedVessels, teaProfiles } from "./data/teaProfiles";
import { copies, languageNames } from "./i18n";
import { calculateRecipe } from "./lib/calculateRecipe";
import { parseRecipeQueryState } from "./lib/recipeQueryState";
import {
  buildTimerSteps,
  downloadRecipeImage,
  formatEditableRatio,
  formatRecipeTemperature,
  formatRecommendedInfusionCount,
  formatStepDetail,
  imageExportFormats
} from "./lib/recipeExport";
import type {
  EditableParameters,
  ImageExportFormat,
  TimerStep
} from "./lib/recipeExport";
import type {
  BrewStrength,
  BrewingRecipe,
  Language,
  RecipeQueryState,
  TeaType,
  Vessel
} from "./types";
import "./styles.css";

type TimerStatus = "idle" | "running" | "paused" | "steeped" | "completed";

interface TimerStepSelection {
  index: number;
  version: number;
  startOnOpen?: boolean;
}

interface TimerSnapshot {
  stepIndex: number;
  remainingSeconds: number;
  status: TimerStatus;
}

interface TimerCommand {
  stepIndex: number;
  version: number;
  action: "toggle";
}

const languages: Language[] = ["zh", "en", "de"];
const brewStrengths: BrewStrength[] = ["light", "standard", "strong"];

function BrandLogo() {
  return (
    <div className="brandLogo" role="img" aria-label="Tea Master logo">
      <svg
        className="brandLogoMark"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 88 48"
      >
        <path
          className="brandLogoSteam"
          d="M29 9.5c-4.2 4.1 4.1 6.4-.3 10.6"
        />
        <path
          className="brandLogoSteam"
          d="M41.5 7.5c-4.8 4.7 4.4 7.1-.4 12"
        />
        <path
          className="brandLogoSteam"
          d="M54 10.5c-3.8 3.9 3.5 6.2-.4 9.8"
        />
        <path
          className="brandLogoCupBowl"
          d="M18 25.5h38c-1.6 8.7-8.2 13.8-19 13.8s-17.4-5.1-19-13.8Z"
        />
        <path className="brandLogoTeaLine" d="M23.5 27.2c8.4 2.6 18.4 2.6 27 0" />
        <path className="brandLogoHandle" d="M55 27h5.4c4 0 5.7 4.5 3.1 7.4-1.8 2-4.7 2.2-7.3.9" />
        <path className="brandLogoSaucer" d="M15.5 41c11.4 3.2 31.7 3.2 43.1 0" />
      </svg>
    </div>
  );
}

function App() {
  const initialQueryState = useMemo(getInitialRecipeQueryState, []);
  const flowRef = useRef<HTMLElement>(null);
  const didInitializeEditableParameters = useRef(false);
  const [language, setLanguage] = useState<Language>(initialQueryState.lang);
  const [teaType, setTeaType] = useState<TeaType>(initialQueryState.tea);
  const [vessel, setVessel] = useState<Vessel>(initialQueryState.vessel);
  const [brewStrength, setBrewStrength] = useState<BrewStrength>(
    initialQueryState.strength
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
  const [editableParameters, setEditableParameters] = useState(() =>
    createEditableParameters(
      recommendedRecipe,
      language,
      initialQueryState.ratio,
      initialQueryState.water
    )
  );

  useEffect(() => {
    if (!didInitializeEditableParameters.current) {
      didInitializeEditableParameters.current = true;
      return;
    }

    setEditableParameters(
      createEditableParameters(
        recommendedRecipe,
        language,
        getStrengthRatio(teaType, activeVessel, brewStrength)
      )
    );
  }, [
    activeVessel,
    recommendedRecipe.waterMl,
    teaType
  ]);

  useEffect(() => {
    setEditableParameters((parameters) =>
      recalculateTeaGrams(parameters, language)
    );
  }, [language]);

  const manualWaterMl = parseWaterMl(editableParameters.waterMl);
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
  const exportableParameters = useMemo(
    () => ({ ...editableParameters, strength: brewStrength }),
    [brewStrength, editableParameters]
  );
  function updateWaterMlInput(waterMl: string) {
    setEditableParameters((parameters) =>
      recalculateTeaGrams({ ...parameters, waterMl }, language)
    );
  }

  function updateRatioInput(ratioMlPerGram: string) {
    setEditableParameters((parameters) =>
      recalculateTeaGrams({ ...parameters, ratioMlPerGram }, language)
    );
  }

  function updateBrewStrength(nextStrength: BrewStrength) {
    const nextRatio = getStrengthRatio(teaType, activeVessel, nextStrength);

    setBrewStrength(nextStrength);
    setEditableParameters((parameters) =>
      recalculateTeaGrams(
        {
          ...parameters,
          ratioMlPerGram: String(nextRatio),
          ratioRangeMin: undefined,
          ratioRangeMax: undefined
        },
        language
      )
    );
  }

  function updateRatioRangeMinInput(ratioRangeMin: string) {
    setEditableParameters((parameters) =>
      recalculateTeaGrams({
        ...parameters,
        ratioMlPerGram: ratioRangeMin,
        ratioRangeMin
      }, language)
    );
  }

  function updateRatioRangeMaxInput(ratioRangeMax: string) {
    setEditableParameters((parameters) => ({ ...parameters, ratioRangeMax }));
  }

  function jumpToBrewingFlow() {
    flowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="appShell">
      <header className="topBar">
        <div>
          <BrandLogo />
          <h1>{copy.appName}</h1>
          <p className="subtitle">{copy.subtitle}</p>
        </div>
        <div className="headerAside">
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
          <p className="slogan">{copy.slogan}</p>
        </div>
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
            <button
              type="button"
              className="jumpToFlowButton"
              onClick={jumpToBrewingFlow}
            >
              {copy.startBrewing}
            </button>
          </div>
          <RecipeSummary
            copy={copy}
            recipe={recipe}
            editableParameters={editableParameters}
            brewStrength={brewStrength}
            onBrewStrengthChange={updateBrewStrength}
            onWaterMlInputChange={updateWaterMlInput}
            onRatioInputChange={updateRatioInput}
            onRatioRangeMinInputChange={updateRatioRangeMinInput}
            onRatioRangeMaxInputChange={updateRatioRangeMaxInput}
          />
        </section>

        <section className="flowArea" ref={flowRef}>
          <BrewingFlow
            copy={copy}
            recipe={recipe}
            editableParameters={exportableParameters}
          />
        </section>
      </main>
      <footer className="siteFooter">
        <p>{copy.footerCredit}</p>
      </footer>
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
  editableParameters: EditableParameters;
  brewStrength: BrewStrength;
  onBrewStrengthChange: (strength: BrewStrength) => void;
  onWaterMlInputChange: (waterMl: string) => void;
  onRatioInputChange: (ratioMlPerGram: string) => void;
  onRatioRangeMinInputChange: (ratioRangeMin: string) => void;
  onRatioRangeMaxInputChange: (ratioRangeMax: string) => void;
}

interface BrewingFlowProps extends RecipeDisplayProps {
  editableParameters: EditableParameters;
}

function RecipeSummary({
  copy,
  recipe,
  editableParameters,
  brewStrength,
  onBrewStrengthChange,
  onWaterMlInputChange,
  onRatioInputChange,
  onRatioRangeMinInputChange,
  onRatioRangeMaxInputChange
}: RecipeSummaryProps) {
  const formattedRatio = formatEditableRatio(editableParameters);
  const formattedTemperature = formatRecipeTemperature(recipe);

  return (
    <>
      <div className="summaryToolbar">
        <div className="controlBlock">
          <span className="controlLabel">{copy.strength}</span>
          <div className="segmented" role="group" aria-label={copy.strength}>
            {brewStrengths.map((strength) => (
              <button
                key={strength}
                type="button"
                aria-pressed={brewStrength === strength}
                className={brewStrength === strength ? "active" : ""}
                onClick={() => onBrewStrengthChange(strength)}
              >
                {copy.strengthNames[strength]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="summaryGrid">
      <div className="metric readOnlyMetric">
        <span className="metricLabel">{copy.vessel}</span>
        <strong data-testid="vessel" data-value={copy.vesselNames[recipe.vessel]}>
          {copy.vesselNames[recipe.vessel]}
        </strong>
      </div>
      <div className="metric editableMetric">
        <label className="metricLabel" htmlFor="water-ml-input">
          {copy.water}
          <span className="metricBadge">
            <Pencil size={12} aria-hidden="true" />
            {copy.editableField}
          </span>
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
            value={editableParameters.waterMl}
            onChange={(event) => onWaterMlInputChange(event.currentTarget.value)}
          />
          <span>{copy.milliliters}</span>
        </div>
      </div>
      <div className="metric computedMetric">
        <span className="metricLabel">
          {copy.teaAmount}
          <span className="metricBadge">{copy.autoCalculated}</span>
        </span>
        <strong data-testid="tea-amount" data-value={editableParameters.teaGrams}>
          {editableParameters.teaGrams} {copy.grams}
        </strong>
      </div>
      <div className="metric editableMetric">
        <label className="metricLabel" htmlFor="ratio-input">
          {copy.ratio}
          <span className="metricBadge">
            <Pencil size={12} aria-hidden="true" />
            {copy.editableField}
          </span>
        </label>
        <div className="metricInputValue ratioInputValue" data-testid="ratio" data-value={formattedRatio}>
          {editableParameters.ratioRangeMin !== undefined &&
          editableParameters.ratioRangeMax !== undefined ? (
            <>
              <span>1:</span>
              <input
                id="ratio-input"
                type="number"
                min={getRatioInputMin(editableParameters.ratioRangeMin)}
                step="10"
                aria-label={`${copy.ratio} ${copy.rangeMinLabel}`}
                value={editableParameters.ratioRangeMin}
                onChange={(event) =>
                  onRatioRangeMinInputChange(event.currentTarget.value)
                }
              />
              <span>–1:</span>
              <input
                type="number"
                min={getRatioInputMin(editableParameters.ratioRangeMax)}
                step="10"
                aria-label={`${copy.ratio} ${copy.rangeMaxLabel}`}
                value={editableParameters.ratioRangeMax}
                onChange={(event) =>
                  onRatioRangeMaxInputChange(event.currentTarget.value)
                }
              />
            </>
          ) : (
            <>
              <span>1:</span>
              <input
                id="ratio-input"
                type="number"
                min={getRatioInputMin(editableParameters.ratioMlPerGram)}
                step="10"
                aria-label={copy.ratio}
                value={editableParameters.ratioMlPerGram}
                onChange={(event) => onRatioInputChange(event.currentTarget.value)}
              />
            </>
          )}
        </div>
      </div>
      <div className="metric readOnlyMetric">
        <span className="metricLabel">{copy.temperature}</span>
        <strong data-testid="temperature" data-value={formattedTemperature}>
          {formattedTemperature}
        </strong>
      </div>
      <div className="metric readOnlyMetric">
        <span className="metricLabel">{copy.infusionCount}</span>
        <strong
          data-testid="infusion-count"
          data-value={formatRecommendedInfusionCount(recipe)}
        >
          {formatRecommendedInfusionCount(recipe)} {copy.infusionCountUnit}
        </strong>
      </div>
    </div>
    </>
  );
}

function BrewingFlow({
  copy,
  recipe,
  editableParameters
}: BrewingFlowProps) {
  const steps = useMemo(() => buildTimerSteps(copy, recipe), [copy, recipe]);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [timerStepSelection, setTimerStepSelection] =
    useState<TimerStepSelection>({ index: 0, version: 0 });
  const [timerCommand, setTimerCommand] = useState<TimerCommand>();
  const [timerSnapshot, setTimerSnapshot] = useState<TimerSnapshot>(() => ({
    stepIndex: 0,
    remainingSeconds: steps[0]?.seconds ?? 0,
    status: "idle"
  }));
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const timerReturnFocusElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setActiveStepIndex(-1);
    setTimerSnapshot({
      stepIndex: 0,
      remainingSeconds: steps[0]?.seconds ?? 0,
      status: "idle"
    });
    setTimerStepSelection((selection) => ({
      index: 0,
      version: selection.version + 1
    }));
    setIsTimerOpen(false);
  }, [steps]);

  function selectStep(stepIndex: number) {
    setActiveStepIndex(stepIndex);
  }

  function openTimerForStep(
    stepIndex: number,
    triggerElement?: HTMLElement | null
  ) {
    if (triggerElement) {
      timerReturnFocusElement.current = triggerElement;
    }
    setActiveStepIndex(stepIndex);

    if (
      !isTimerOpen &&
      timerSnapshot.stepIndex === stepIndex &&
      (timerSnapshot.status === "running" || timerSnapshot.status === "paused")
    ) {
      setIsTimerOpen(true);
      return;
    }

    setTimerStepSelection((selection) => ({
      index: stepIndex,
      version: selection.version + 1,
      startOnOpen: true
    }));
    setIsTimerOpen(true);
  }

  function toggleInlineTimer(stepIndex: number) {
    setActiveStepIndex(stepIndex);

    if (
      timerSnapshot.stepIndex !== stepIndex ||
      (timerSnapshot.status !== "running" && timerSnapshot.status !== "paused")
    ) {
      return;
    }

    setTimerCommand((command) => ({
      action: "toggle",
      stepIndex,
      version: (command?.version ?? 0) + 1
    }));
  }

  const isPrepareActive = activeStepIndex === -1;

  return (
    <section className="flowPanel" aria-labelledby="flow-heading">
      <div className="sectionHeader compact">
        <h2 id="flow-heading">{copy.process}</h2>
      </div>
      <ol className="stepList">
        <li
          className={isPrepareActive ? "selectableStep activeStep" : "selectableStep"}
          aria-current={isPrepareActive ? "step" : undefined}
          aria-label={`${copy.prepare} ${copy.prepareDetail}`}
          tabIndex={0}
          onClick={() => selectStep(-1)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              selectStep(-1);
            }
          }}
        >
          <span className="stepNumber">0</span>
          <div>
            <strong>{copy.prepare}</strong>
            <p>{copy.prepareDetail}</p>
          </div>
        </li>
        {steps.map((step, index) => {
          const isActive = index === activeStepIndex;
          const stepDetail = formatStepDetail(step, copy);
          const shouldShowInlineTimer =
            timerSnapshot.stepIndex === index &&
            (timerSnapshot.status === "running" ||
              timerSnapshot.status === "paused");
          const stepButtonLabel = shouldShowInlineTimer
            ? formatClock(timerSnapshot.remainingSeconds)
            : copy.start;
          const inlineToggleLabel =
            timerSnapshot.status === "running" ? copy.pause : copy.resume;

          return (
            <li
              key={step.id}
              className={isActive ? "selectableStep activeStep" : "selectableStep"}
              aria-current={isActive ? "step" : undefined}
              aria-label={`${step.label} ${stepDetail}`}
              tabIndex={0}
              onClick={() => selectStep(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectStep(index);
                }
              }}
            >
              <span className="stepNumber">{index + 1}</span>
              <div className="stepContent">
                <strong>{step.label}</strong>
                <p>{stepDetail}</p>
              </div>
              {shouldShowInlineTimer ? (
                <div className="inlineTimerControls">
                  <button
                    type="button"
                    className="inlineTimerToggle"
                    aria-label={inlineToggleLabel}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleInlineTimer(index);
                    }}
                  >
                    {timerSnapshot.status === "running" ? (
                      <Pause size={15} aria-hidden="true" />
                    ) : (
                      <Play size={15} aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="stepTimerButton inlineTimerActive"
                    data-timer-step-index={index}
                    onClick={(event) => {
                      event.stopPropagation();
                      openTimerForStep(index, event.currentTarget);
                    }}
                  >
                    {stepButtonLabel}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="stepTimerButton"
                  data-timer-step-index={index}
                  onClick={(event) => {
                    event.stopPropagation();
                    openTimerForStep(index, event.currentTarget);
                  }}
                >
                  <Play size={15} aria-hidden="true" />
                  {stepButtonLabel}
                </button>
              )}
            </li>
          );
        })}
      </ol>
      <RecipeSaveControls
        copy={copy}
        recipe={recipe}
        editableParameters={editableParameters}
      />
      <GuidedTimer
        copy={copy}
        recipe={recipe}
        selectedStep={timerStepSelection}
        timerCommand={timerCommand}
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        onActiveStepChange={setActiveStepIndex}
        onTimerSnapshotChange={setTimerSnapshot}
        onTimerFinishedWhileClosed={() => setIsTimerOpen(true)}
        returnFocusElement={timerReturnFocusElement.current}
      />
    </section>
  );
}

interface RecipeSaveControlsProps extends RecipeDisplayProps {
  editableParameters: EditableParameters;
}

function RecipeSaveControls({
  copy,
  recipe,
  editableParameters
}: RecipeSaveControlsProps) {
  const controlsRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnOutsidePointer(event: PointerEvent) {
      const target = event.target;

      if (target instanceof Node && controlsRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [isOpen]);

  async function handleImageExport(format: ImageExportFormat) {
    try {
      await downloadRecipeImage(copy, recipe, editableParameters, format);
      setExportStatus(copy.imageExported);
      setIsOpen(false);
    } catch {
      setExportStatus(copy.exportFailed);
    }
  }

  return (
    <div
      className="recipeSaveControls"
      data-testid="recipe-share-controls"
      ref={controlsRef}
    >
      <button
        type="button"
        className="recipeSaveToggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Download size={18} />
        {copy.saveRecipe}
      </button>
      {isOpen ? (
        <div
          className="recipeSaveOptions"
          role="menu"
          aria-label={copy.saveRecipe}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setIsOpen(false);
            }
          }}
        >
          {imageExportFormats.map((format) => (
            <button
              key={format}
              type="button"
              role="menuitem"
              onClick={() => void handleImageExport(format)}
            >
              <FileImage size={18} />
              {getImageExportLabel(copy, format)}
            </button>
          ))}
        </div>
      ) : null}
      {exportStatus ? <p className="exportStatus">{exportStatus}</p> : null}
    </div>
  );
}

function getImageExportLabel(
  copy: (typeof copies)["zh"],
  format: ImageExportFormat
) {
  switch (format) {
    case "png":
      return copy.saveAsPng;
    case "jpeg":
      return copy.saveAsJpeg;
  }
}

interface GuidedTimerProps extends RecipeDisplayProps {
  selectedStep: TimerStepSelection;
  timerCommand: TimerCommand | undefined;
  isOpen: boolean;
  onClose: () => void;
  onActiveStepChange: (stepIndex: number) => void;
  onTimerSnapshotChange: (snapshot: TimerSnapshot) => void;
  onTimerFinishedWhileClosed: () => void;
  returnFocusElement: HTMLElement | null;
}

function GuidedTimer({
  copy,
  recipe,
  selectedStep,
  timerCommand,
  isOpen,
  onClose,
  onActiveStepChange,
  onTimerSnapshotChange,
  onTimerFinishedWhileClosed,
  returnFocusElement
}: GuidedTimerProps) {
  const steps = useMemo(() => buildTimerSteps(copy, recipe), [copy, recipe]);
  const dialogRef = useRef<HTMLElement>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(steps[0]?.seconds ?? 0);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const previousStatusRef = useRef<TimerStatus>(status);
  const stopTimerAlertRef = useRef<TimerAlertStop | undefined>(undefined);

  useEffect(() => {
    stopTimerAlertRef.current?.();
    stopTimerAlertRef.current = undefined;
    setCurrentStepIndex(0);
    setRemainingSeconds(steps[0]?.seconds ?? 0);
    setStatus("idle");
  }, [steps]);

  useEffect(
    () => () => {
      stopTimerAlertRef.current?.();
    },
    []
  );

  useEffect(() => {
    onTimerSnapshotChange({
      stepIndex: currentStepIndex,
      remainingSeconds,
      status
    });
  }, [currentStepIndex, onTimerSnapshotChange, remainingSeconds, status]);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    const didFinish = status === "steeped" || status === "completed";

    if (previousStatus === "running" && didFinish) {
      if (alertsEnabled) {
        stopTimerAlertRef.current?.();
        stopTimerAlertRef.current = startTimerAlert(
          copy.timer,
          getTimerStepMessage(copy, steps, currentStepIndex, status)
        );
      }

      if (!isOpen) {
        onTimerFinishedWhileClosed();
      }
    }

    previousStatusRef.current = status;
  }, [
    alertsEnabled,
    copy,
    currentStepIndex,
    isOpen,
    onTimerFinishedWhileClosed,
    status,
    steps
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousFocus = document.activeElement;
    dialogRef.current?.focus();

    return () => {
      const liveStepControl = document.querySelector(
        `[data-timer-step-index="${currentStepIndex}"]`
      );
      const focusTarget =
        (returnFocusElement?.isConnected ? returnFocusElement : null) ??
        (liveStepControl instanceof HTMLElement ? liveStepControl : null) ??
        (previousFocus instanceof HTMLElement ? previousFocus : null);
      focusTarget?.focus();
    };
  }, [currentStepIndex, isOpen, returnFocusElement]);

  useEffect(() => {
    const nextStep = steps[selectedStep.index];

    if (!nextStep) {
      return;
    }

    setCurrentStepIndex(selectedStep.index);
    setRemainingSeconds(nextStep.seconds);
    setStatus(
      selectedStep.startOnOpen
        ? getStartedTimerStatus(selectedStep.index, nextStep.seconds, steps)
        : "idle"
    );
    if (selectedStep.startOnOpen) {
      onActiveStepChange(selectedStep.index);
    }
  }, [
    onActiveStepChange,
    selectedStep.index,
    selectedStep.startOnOpen,
    selectedStep.version,
    steps
  ]);

  useEffect(() => {
    if (!timerCommand || timerCommand.stepIndex !== currentStepIndex) {
      return;
    }

    setStatus((currentStatus) => {
      if (currentStatus === "running") {
        return "paused";
      }

      if (currentStatus === "paused") {
        return "running";
      }

      return currentStatus;
    });
  }, [currentStepIndex, timerCommand]);

  function beginStep(stepIndex: number) {
    const nextSeconds = steps[stepIndex]?.seconds ?? 0;

    stopTimerAlertRef.current?.();
    stopTimerAlertRef.current = undefined;
    setCurrentStepIndex(stepIndex);
    setRemainingSeconds(nextSeconds);
    onActiveStepChange(stepIndex);
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
  const shouldShowNextForZeroStep =
    currentStep !== undefined &&
    currentStep.seconds <= 0 &&
    currentStepIndex < steps.length - 1;
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
        : status === "steeped" || shouldShowNextForZeroStep
          ? copy.nextInfusion
          : copy.start;

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="timerOverlay">
      <section
        ref={dialogRef}
        className="timerDialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timer-heading"
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            stopTimerAlertRef.current?.();
            stopTimerAlertRef.current = undefined;
            onClose();
          }
        }}
      >
        <div className="sectionHeader compact">
          <h2 id="timer-heading">{copy.timer}</h2>
          <div className="timerDialogControls">
            <span className={`statusPill ${status}`}>{statusText}</span>
            <button
              type="button"
              className="timerCloseButton"
              aria-label={copy.closeTimer}
              onClick={() => {
                stopTimerAlertRef.current?.();
                stopTimerAlertRef.current = undefined;
                onClose();
              }}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="timerFace">
          <p>{currentStep?.label ?? copy.allDone}</p>
          <strong data-testid="timer-display">
            {formatClock(remainingSeconds)}
          </strong>
          <span aria-live="polite">
            {getTimerStepMessage(copy, steps, currentStepIndex, status)}
          </span>
        </div>
        <label className="timerAlertToggle">
          <input
            type="checkbox"
            checked={alertsEnabled}
            aria-label={copy.timerAlerts}
            onChange={(event) => {
              setAlertsEnabled(event.currentTarget.checked);
              if (event.currentTarget.checked) {
                void enableTimerAlerts();
              }
            }}
          />
          <Bell size={16} aria-hidden="true" />
          {alertsEnabled ? copy.timerAlertsOn : copy.timerAlerts}
        </label>
        <div className="timerActions">
          {status === "completed" ? null : (
            <button
              type="button"
              className="primaryAction"
              onClick={() => {
                if (status === "running") {
                  setStatus("paused");
                } else if (shouldShowNextForZeroStep) {
                  beginStep(currentStepIndex + 1);
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
              stopTimerAlertRef.current?.();
              stopTimerAlertRef.current = undefined;
              setRemainingSeconds(currentStep?.seconds ?? 0);
              setStatus("idle");
            }}
          >
            <RotateCcw size={18} />
            {copy.reset}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

function getStartedTimerStatus(
  stepIndex: number,
  seconds: number,
  steps: TimerStep[]
): TimerStatus {
  if (seconds <= 0) {
    return stepIndex >= steps.length - 1 ? "completed" : "steeped";
  }

  return "running";
}

function getTimerStepMessage(
  copy: (typeof copies)["zh"],
  steps: TimerStep[],
  currentStepIndex: number,
  status: TimerStatus
) {
  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];

  if (!currentStep) {
    return copy.ready;
  }

  if (currentStep.kind === "infusion" && currentStep.seconds <= 0) {
    return copy.immediateSipDetail;
  }

  if (status === "steeped" || status === "completed") {
    if (currentStep.kind === "rinse") {
      return nextStep?.kind === "rinse"
        ? copy.rinseContinue
        : copy.rinseReadyToBrew;
    }

    return copy.readyToSip;
  }

  if (currentStep.kind === "rinse" && currentStep.seconds <= 0) {
    return nextStep?.kind === "rinse" ? copy.rinseContinue : copy.rinseReadyToBrew;
  }

  return formatStepDetail(currentStep, copy);
}

function parseWaterMl(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function getInitialRecipeQueryState(): RecipeQueryState {
  const fallback = getDefaultRecipeQueryState();

  if (typeof window === "undefined") {
    return fallback;
  }

  return parseRecipeQueryState(window.location.search, fallback);
}

function getDefaultRecipeQueryState(): RecipeQueryState {
  return {
    lang: "en",
    tea: "green",
    vessel: "glass_cup",
    water: 250,
    ratio: 100,
    strength: "standard"
  };
}

function getStrengthRatio(
  teaType: TeaType,
  vessel: Vessel,
  strength: BrewStrength
) {
  return (
    getBrewingGuide(teaType, vessel)?.strengthRatios?.[strength] ??
    getBrewingGuide(teaType, vessel)?.ratioMlPerGram ??
    100
  );
}

function createEditableParameters(
  recipe: BrewingRecipe,
  language: Language,
  ratioMlPerGram = recipe.ratioMlPerGram,
  waterMl = recipe.waterMl
): EditableParameters {
  return recalculateTeaGrams(
    {
      waterMl: String(waterMl),
    teaGrams: formatTeaAmount(recipe.teaGrams, language),
      ratioMlPerGram: String(ratioMlPerGram),
    ...(recipe.ratioMlPerGramRange
      ? {
          ratioRangeMin: String(recipe.ratioMlPerGramRange.min),
          ratioRangeMax: String(recipe.ratioMlPerGramRange.max)
        }
      : {})
    },
    language
  );
}

function recalculateTeaGrams(
  parameters: EditableParameters,
  language: Language
): EditableParameters {
  const waterMl = parsePositiveNumber(parameters.waterMl);
  const ratioMlPerGram = parsePositiveNumber(parameters.ratioMlPerGram);

  if (waterMl === undefined || ratioMlPerGram === undefined) {
    return parameters;
  }

  return {
    ...parameters,
    teaGrams: formatTeaAmount(waterMl / ratioMlPerGram, language)
  };
}

function parsePositiveNumber(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  const parsedValue = Number(value.replace(",", "."));
  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : undefined;
}

function getRatioInputMin(value: string | undefined) {
  const parsedValue =
    value === undefined || value.trim() === ""
      ? undefined
      : Number(value.replace(",", "."));

  if (parsedValue === undefined || !Number.isFinite(parsedValue)) {
    return "10";
  }

  const remainder = Math.abs(parsedValue % 10);
  return String(remainder === 0 ? 10 : remainder);
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function formatTeaAmount(value: number, language: Language): string {
  const normalizedValue = roundToTenth(value).toFixed(1);
  return language === "de" ? normalizedValue.replace(".", ",") : normalizedValue;
}

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

async function requestBrowserNotificationPermission() {
  if (!("Notification" in window) || Notification.permission !== "default") {
    return;
  }

  try {
    await Notification.requestPermission();
  } catch {
    // Notifications are optional; unsupported or denied browsers should not
    // interrupt the brewing flow.
  }
}

async function enableTimerAlerts() {
  await requestBrowserNotificationPermission();
  await unlockTimerAlertAudio();
}

type TimerAlertStop = () => void;

function startTimerAlert(title: string, body: string): TimerAlertStop {
  notifyTimerFinished(title, body);
  pulseTimerAlert();

  const repeatId = window.setInterval(pulseTimerAlert, 1200);

  return () => {
    window.clearInterval(repeatId);
    stopTimerVibration();
  };
}

function notifyTimerFinished(title: string, body: string) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  } catch {
    // Optional notifications only.
  }
}

function pulseTimerAlert() {
  try {
    navigator.vibrate?.([450, 180, 450]);
  } catch {
    // Optional haptics only.
  }

  void playCompletionTone();
}

function stopTimerVibration() {
  try {
    navigator.vibrate?.(0);
  } catch {
    // Optional haptics only.
  }
}

let timerAlertAudioContext: AudioContext | undefined;

function getTimerAlertAudioContext() {
  try {
    const AudioContextConstructor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextConstructor) {
      return undefined;
    }

    if (
      timerAlertAudioContext &&
      timerAlertAudioContext.state !== "closed"
    ) {
      return timerAlertAudioContext;
    }

    timerAlertAudioContext = new AudioContextConstructor();
    return timerAlertAudioContext;
  } catch {
    return undefined;
  }
}

async function unlockTimerAlertAudio() {
  try {
    const context = getTimerAlertAudioContext();

    if (!context) {
      return;
    }

    if (context.state === "suspended") {
      await context.resume();
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    gain.gain.value = 0;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.03);
  } catch {
    // Audio alerts are optional.
  }
}

async function playCompletionTone() {
  try {
    const context = getTimerAlertAudioContext();

    if (!context) {
      return;
    }

    if (context.state === "suspended") {
      await context.resume();
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.frequency.value = 880;
    gain.gain.value = 0.08;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.32);
  } catch {
    // Optional sound only.
  }
}

export default App;
