import {
  Download,
  FileImage,
  FileText,
  Frown,
  Meh,
  Pause,
  Play,
  RotateCcw,
  Send,
  Smile,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

interface EditableParameters {
  waterMl: string;
  teaGrams: string;
  ratioMlPerGram: string;
  ratioRangeMin?: string;
  ratioRangeMax?: string;
}

const languages: Language[] = ["zh", "en", "de"];

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
  const [editableParameters, setEditableParameters] = useState(() =>
    createEditableParameters(recommendedRecipe, language)
  );

  useEffect(() => {
    setEditableParameters(createEditableParameters(recommendedRecipe, language));
  }, [
    activeVessel,
    language,
    recommendedRecipe.ratioMlPerGram,
    recommendedRecipe.ratioMlPerGramRange?.max,
    recommendedRecipe.ratioMlPerGramRange?.min,
    recommendedRecipe.teaGrams,
    recommendedRecipe.waterMl,
    teaType
  ]);

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
          </div>
          <RecipeSummary
            copy={copy}
            recipe={recipe}
            editableParameters={editableParameters}
            onWaterMlInputChange={updateWaterMlInput}
            onRatioInputChange={updateRatioInput}
            onRatioRangeMinInputChange={updateRatioRangeMinInput}
            onRatioRangeMaxInputChange={updateRatioRangeMaxInput}
          />
        </section>

        <section className="flowArea">
          <BrewingFlow
            copy={copy}
            recipe={recipe}
            editableParameters={editableParameters}
          />
        </section>
        <FeedbackPanel copy={copy} recipe={recipe} />
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
  onWaterMlInputChange: (waterMl: string) => void;
  onRatioInputChange: (ratioMlPerGram: string) => void;
  onRatioRangeMinInputChange: (ratioRangeMin: string) => void;
  onRatioRangeMaxInputChange: (ratioRangeMax: string) => void;
}

interface BrewingFlowProps extends RecipeDisplayProps {
  editableParameters: EditableParameters;
}

type FeedbackPanelProps = RecipeDisplayProps;

function RecipeSummary({
  copy,
  recipe,
  editableParameters,
  onWaterMlInputChange,
  onRatioInputChange,
  onRatioRangeMinInputChange,
  onRatioRangeMaxInputChange
}: RecipeSummaryProps) {
  const formattedRatio = formatEditableRatio(editableParameters);
  const formattedTemperature = formatRecipeTemperature(recipe);

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
            value={editableParameters.waterMl}
            onChange={(event) => onWaterMlInputChange(event.currentTarget.value)}
          />
          <span>{copy.milliliters}</span>
        </div>
      </div>
      <div className="metric">
        <span className="metricLabel">{copy.teaAmount}</span>
        <strong data-testid="tea-amount" data-value={editableParameters.teaGrams}>
          {editableParameters.teaGrams} {copy.grams}
        </strong>
      </div>
      <div className="metric">
        <label className="metricLabel" htmlFor="ratio-input">
          {copy.ratio}
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
      <div className="metric">
        <span className="metricLabel">{copy.temperature}</span>
        <strong data-testid="temperature" data-value={formattedTemperature}>
          {formattedTemperature}
        </strong>
      </div>
      <div className="metric">
        <span className="metricLabel">{copy.infusionCount}</span>
        <strong
          data-testid="infusion-count"
          data-value={formatRecommendedInfusionCount(recipe)}
        >
          {formatRecommendedInfusionCount(recipe)} {copy.infusionCountUnit}
        </strong>
      </div>
    </div>
  );
}

function BrewingFlow({
  copy,
  recipe,
  editableParameters
}: BrewingFlowProps) {
  const steps = useMemo(() => buildTimerSteps(copy, recipe), [copy, recipe]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [timerStepSelection, setTimerStepSelection] =
    useState<TimerStepSelection>({ index: 0, version: 0 });
  const [timerSnapshot, setTimerSnapshot] = useState<TimerSnapshot>(() => ({
    stepIndex: 0,
    remainingSeconds: steps[0]?.seconds ?? 0,
    status: "idle"
  }));
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  useEffect(() => {
    setActiveStepIndex(0);
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

  function openTimerForStep(stepIndex: number) {
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
          const stepDetail = formatStepDetail(step, copy);
          const shouldShowInlineTimer =
            !isTimerOpen &&
            timerSnapshot.stepIndex === index &&
            (timerSnapshot.status === "running" ||
              timerSnapshot.status === "paused");
          const stepButtonLabel = shouldShowInlineTimer
            ? formatClock(timerSnapshot.remainingSeconds)
            : copy.start;

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
              <button
                type="button"
                className={
                  shouldShowInlineTimer
                    ? "stepTimerButton inlineTimerActive"
                    : "stepTimerButton"
                }
                onClick={(event) => {
                  event.stopPropagation();
                  openTimerForStep(index);
                }}
              >
                <Play size={15} aria-hidden="true" />
                {stepButtonLabel}
              </button>
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
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        onActiveStepChange={setActiveStepIndex}
        onTimerSnapshotChange={setTimerSnapshot}
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

  function handleImageExport() {
    try {
      downloadRecipeImage(copy, recipe, editableParameters);
      setExportStatus(copy.imageExported);
      setIsOpen(false);
    } catch {
      setExportStatus(copy.exportFailed);
    }
  }

  function handlePdfExport() {
    try {
      openRecipePdfWindow(copy, recipe, editableParameters);
      setExportStatus(copy.pdfOpened);
      setIsOpen(false);
    } catch {
      setExportStatus(copy.exportFailed);
    }
  }

  return (
    <div className="recipeSaveControls" ref={controlsRef}>
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
        >
          <button type="button" role="menuitem" onClick={handleImageExport}>
            <FileImage size={18} />
            {copy.saveAsImage}
          </button>
          <button type="button" role="menuitem" onClick={handlePdfExport}>
            <FileText size={18} />
            {copy.saveAsPdf}
          </button>
        </div>
      ) : null}
      {exportStatus ? <p className="exportStatus">{exportStatus}</p> : null}
    </div>
  );
}

interface GuidedTimerProps extends RecipeDisplayProps {
  selectedStep: TimerStepSelection;
  isOpen: boolean;
  onClose: () => void;
  onActiveStepChange: (stepIndex: number) => void;
  onTimerSnapshotChange: (snapshot: TimerSnapshot) => void;
}

function GuidedTimer({
  copy,
  recipe,
  selectedStep,
  isOpen,
  onClose,
  onActiveStepChange,
  onTimerSnapshotChange
}: GuidedTimerProps) {
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

  useEffect(() => {
    onTimerSnapshotChange({
      stepIndex: currentStepIndex,
      remainingSeconds,
      status
    });
  }, [currentStepIndex, onTimerSnapshotChange, remainingSeconds, status]);

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
  }, [selectedStep.index, selectedStep.startOnOpen, selectedStep.version, steps]);

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
        className="timerDialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timer-heading"
      >
        <div className="sectionHeader compact">
          <h2 id="timer-heading">{copy.timer}</h2>
          <div className="timerDialogControls">
            <span className={`statusPill ${status}`}>{statusText}</span>
            <button
              type="button"
              className="timerCloseButton"
              aria-label={copy.closeTimer}
              onClick={onClose}
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
          <span>{getTimerStepMessage(copy, steps, currentStepIndex, status)}</span>
        </div>
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
              setRemainingSeconds(currentStep?.seconds ?? 0);
              setStatus("idle");
            }}
          >
            <RotateCcw size={18} />
            {copy.reset}
          </button>
        </div>
        {isStepDone || shouldShowNextForZeroStep ? null : (
          <p className="pourHint">{currentStep?.hint ?? copy.pourOut}</p>
        )}
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

function FeedbackPanel({ copy }: FeedbackPanelProps) {
  const [selectedRating, setSelectedRating] = useState<string | undefined>();
  const [feedbackText, setFeedbackText] = useState("");
  const ratingOptions = [
    { id: "excellent", label: copy.ratingExcellent, Icon: Smile },
    { id: "good", label: copy.ratingGood, Icon: Meh },
    { id: "okay", label: copy.ratingOkay, Icon: Frown }
  ];

  function handleSubmitFeedback() {
    setFeedbackText(copy.feedbackSaved);
  }

  return (
    <section
      className="feedbackPanel"
      aria-labelledby="feedback-heading"
      data-layout="stacked"
    >
      <div className="sectionHeader compact">
        <h2 id="feedback-heading">{copy.feedbackTitle}</h2>
      </div>
      <div className="feedbackRatingBlock">
        <span className="controlLabel">{copy.feedbackRatingLabel}</span>
        <div className="ratingOptions">
          {ratingOptions.map((rating) => {
            const Icon = rating.Icon;

            return (
              <button
                key={rating.id}
                type="button"
                aria-label={rating.label}
                aria-pressed={selectedRating === rating.id}
                className={selectedRating === rating.id ? "active" : ""}
                onClick={() => setSelectedRating(rating.id)}
              >
                <Icon size={26} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>
      <div className="feedbackForm" data-testid="feedback-form">
        <label className="feedbackTextarea">
          <span className="controlLabel">{copy.feedbackComment}</span>
          <textarea
            aria-label={copy.feedbackComment}
            placeholder={copy.feedbackPlaceholder}
            value={feedbackText}
            onChange={(event) => setFeedbackText(event.currentTarget.value)}
          />
        </label>
        <button
          type="button"
          className="submitFeedback"
          onClick={handleSubmitFeedback}
        >
          <Send size={18} />
          {copy.submitFeedback}
        </button>
      </div>
    </section>
  );
}

function buildTimerSteps(
  copy: (typeof copies)["zh"],
  recipe: BrewingRecipe
): TimerStep[] {
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

function parseWaterMl(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function createEditableParameters(
  recipe: BrewingRecipe,
  language: Language
): EditableParameters {
  return {
    waterMl: String(recipe.waterMl),
    teaGrams: formatTeaAmount(recipe.teaGrams, language),
    ratioMlPerGram: String(recipe.ratioMlPerGram),
    ...(recipe.ratioMlPerGramRange
      ? {
          ratioRangeMin: String(recipe.ratioMlPerGramRange.min),
          ratioRangeMax: String(recipe.ratioMlPerGramRange.max)
        }
      : {})
  };
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

function formatEditableRatio(parameters: EditableParameters) {
  if (
    parameters.ratioRangeMin !== undefined &&
    parameters.ratioRangeMax !== undefined
  ) {
    return `1:${parameters.ratioRangeMin}–1:${parameters.ratioRangeMax}`;
  }

  return `1:${parameters.ratioMlPerGram}`;
}

function formatRecipeTemperature(recipe: BrewingRecipe) {
  if (recipe.temperatureCRange) {
    return `${recipe.temperatureCRange.min}–${recipe.temperatureCRange.max}°C`;
  }

  return `${recipe.temperatureC}°C`;
}

function formatRecommendedInfusionCount(recipe: BrewingRecipe) {
  const requiredCount = recipe.infusions.filter(
    (infusion) => !infusion.optional
  ).length;
  const totalCount = recipe.infusions.length;

  if (requiredCount !== totalCount) {
    return `${requiredCount}–${totalCount}`;
  }

  return String(totalCount);
}

function downloadRecipeImage(
  copy: (typeof copies)["zh"],
  recipe: BrewingRecipe,
  editableParameters: EditableParameters
) {
  const svg = buildRecipeCardSvg(copy, recipe, editableParameters);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, "tea-master-recipe.svg");
}

function openRecipePdfWindow(
  copy: (typeof copies)["zh"],
  recipe: BrewingRecipe,
  editableParameters: EditableParameters
) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer");

  if (!printWindow) {
    throw new Error("Could not open print window");
  }

  const lines = buildRecipeCardLines(copy, recipe, editableParameters);
  const body = lines
    .map((line, index) =>
      index === 0
        ? `<h1>${escapeHtml(line)}</h1>`
        : `<p>${escapeHtml(line)}</p>`
    )
    .join("");

  printWindow.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(copy.appName)}</title>
    <style>
      body {
        margin: 0;
        padding: 36px;
        color: #18221d;
        font-family: Inter, "Segoe UI", sans-serif;
        background: #f7f4ec;
      }
      article {
        max-width: 720px;
        margin: 0 auto;
        border: 1px solid #d9ded1;
        border-radius: 16px;
        padding: 32px;
        background: #fffefa;
      }
      h1 {
        margin: 0 0 18px;
        color: #173126;
      }
      p {
        margin: 0 0 10px;
        line-height: 1.55;
      }
    </style>
  </head>
  <body>
    <article>${body}</article>
    <script>
      window.addEventListener("load", () => {
        window.print();
      });
    </script>
  </body>
</html>`);
  printWindow.document.close();
}

function buildRecipeCardSvg(
  copy: (typeof copies)["zh"],
  recipe: BrewingRecipe,
  editableParameters: EditableParameters
) {
  const lines = buildRecipeCardLines(copy, recipe, editableParameters).flatMap(
    (line, index) => (index === 0 ? [line] : wrapLine(line, 42))
  );
  const width = 900;
  const height = Math.max(620, 130 + lines.length * 30);
  const textLines = lines
    .map((line, index) => {
      const y = index === 0 ? 76 : 126 + (index - 1) * 30;
      const className = index === 0 ? "title" : "body";
      return `<text class="${className}" x="56" y="${y}">${escapeXml(line)}</text>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    .title { fill: #173126; font: 700 34px Inter, sans-serif; }
    .body { fill: #36463d; font: 500 22px Inter, sans-serif; }
    .rule { stroke: #c99b50; stroke-width: 3; stroke-linecap: round; }
  </style>
  <rect width="100%" height="100%" rx="24" fill="#fffefa" />
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="18" fill="none" stroke="#d9ded1" />
  <path class="rule" d="M56 96h150" />
  ${textLines}
</svg>`;
}

function buildRecipeCardLines(
  copy: (typeof copies)["zh"],
  recipe: BrewingRecipe,
  editableParameters: EditableParameters
) {
  const steps = buildTimerSteps(copy, recipe);

  return [
    copy.appName,
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

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeHtml(value: string) {
  return escapeXml(value).replace(/'/g, "&#39;");
}

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export default App;
