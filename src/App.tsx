import { Minus, Pause, Play, Plus, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getRecommendedVessels, teaProfiles } from "./data/teaProfiles";
import { copies, interpolate, languageNames } from "./i18n";
import { calculateRecipe } from "./lib/calculateRecipe";
import type { BrewingRecipe, Language, TeaType, Vessel } from "./types";
import "./styles.css";

type TimerStatus = "idle" | "running" | "paused" | "completed";

interface TimerStep {
  id: string;
  label: string;
  detail: string;
  seconds: number;
  kind: "rinse" | "infusion";
}

const languages: Language[] = ["zh", "en", "de"];

function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [teaType, setTeaType] = useState<TeaType>("green");
  const [people, setPeople] = useState(1);
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

  const recipe = useMemo(
    () => calculateRecipe({ teaType, vessel: activeVessel, people, language }),
    [activeVessel, language, people, teaType]
  );

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
            <PeopleStepper
              copy={copy}
              people={people}
              onChange={(next) => setPeople(next)}
            />
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
          <RecipeSummary copy={copy} recipe={recipe} />
        </section>

        <section className="flowArea">
          <BrewingFlow copy={copy} recipe={recipe} />
          <GuidedTimer copy={copy} recipe={recipe} />
        </section>
      </main>
    </div>
  );
}

interface PeopleStepperProps {
  copy: (typeof copies)["zh"];
  people: number;
  onChange: (people: number) => void;
}

function PeopleStepper({ copy, people, onChange }: PeopleStepperProps) {
  return (
    <div className="controlBlock">
      <span className="controlLabel">{copy.people}</span>
      <div className="stepper">
        <button
          type="button"
          aria-label={copy.decreasePeople}
          onClick={() => onChange(Math.max(1, people - 1))}
          disabled={people <= 1}
        >
          <Minus size={18} />
        </button>
        <output>{formatPeople(people, copy.peopleUnit)}</output>
        <button
          type="button"
          aria-label={copy.increasePeople}
          onClick={() => onChange(Math.min(8, people + 1))}
          disabled={people >= 8}
        >
          <Plus size={18} />
        </button>
      </div>
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

interface RecipeSummaryProps {
  copy: (typeof copies)["zh"];
  recipe: BrewingRecipe;
}

function RecipeSummary({ copy, recipe }: RecipeSummaryProps) {
  const fields = [
    {
      label: copy.vessel,
      value: copy.vesselNames[recipe.vessel],
      testId: "vessel"
    },
    {
      label: copy.water,
      value: `${recipe.waterMl} ${copy.milliliters}`,
      testId: "water",
      dataValue: recipe.waterMl
    },
    {
      label: copy.teaAmount,
      value: `${recipe.teaGrams} ${copy.grams}`,
      testId: "tea-amount",
      dataValue: recipe.teaGrams
    },
    {
      label: copy.ratio,
      value: `1:${recipe.ratioMlPerGram}`,
      testId: "ratio"
    },
    {
      label: copy.temperature,
      value: `${recipe.temperatureC}°C`,
      testId: "temperature"
    }
  ];

  return (
    <div className="summaryGrid">
      {fields.map((field) => (
        <div className="metric" key={field.label}>
          <span>{field.label}</span>
          <strong
            data-testid={field.testId}
            data-value={field.dataValue ?? field.value}
          >
            {field.value}
          </strong>
        </div>
      ))}
    </div>
  );
}

function BrewingFlow({ copy, recipe }: RecipeSummaryProps) {
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
        {steps.map((step, index) => (
          <li key={step.id}>
            <span className="stepNumber">{index + 1}</span>
            <div>
              <strong>{step.label}</strong>
              <p>
                {formatSeconds(step.seconds, copy.seconds)} · {step.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function GuidedTimer({ copy, recipe }: RecipeSummaryProps) {
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
    if (status !== "running") {
      return;
    }

    const id = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds > 1) {
          return seconds - 1;
        }

        setCurrentStepIndex((index) => {
          const nextIndex = index + 1;
          if (nextIndex >= steps.length) {
            setStatus("completed");
            return index;
          }

          setRemainingSeconds(steps[nextIndex].seconds);
          return nextIndex;
        });

        return 0;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [status, steps]);

  const currentStep = steps[currentStepIndex];
  const statusText = {
    idle: copy.ready,
    running: copy.running,
    paused: copy.paused,
    completed: copy.completed
  }[status];

  const primaryLabel =
    status === "running"
      ? copy.pause
      : status === "paused"
        ? copy.resume
        : copy.start;

  return (
    <section className="timerPanel" aria-labelledby="timer-heading">
      <div className="sectionHeader compact">
        <h2 id="timer-heading">{copy.timer}</h2>
        <span className={`statusPill ${status}`}>{statusText}</span>
      </div>
      <div className="timerFace">
        <p>{status === "completed" ? copy.allDone : currentStep?.label}</p>
        <strong data-testid="timer-display">
          {formatClock(status === "completed" ? 0 : remainingSeconds)}
        </strong>
        <span>
          {status === "completed"
            ? copy.completed
            : currentStep
              ? `${formatSeconds(currentStep.seconds, copy.seconds)} · ${currentStep.detail}`
              : copy.ready}
        </span>
      </div>
      <div className="timerActions">
        <button
          type="button"
          className="primaryAction"
          onClick={() => {
            if (status === "running") {
              setStatus("paused");
            } else {
              setStatus("running");
            }
          }}
          disabled={status === "completed"}
        >
          {status === "running" ? <Pause size={18} /> : <Play size={18} />}
          {primaryLabel}
        </button>
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
      {status === "completed" ? null : (
        <p className="pourHint">{copy.pourOut}</p>
      )}
    </section>
  );
}

function buildTimerSteps(copy: (typeof copies)["zh"], recipe: BrewingRecipe): TimerStep[] {
  const rinseStep = recipe.rinseSeconds
    ? [
        {
          id: "rinse",
          label: copy.rinse,
          detail: copy.rinseDetail,
          seconds: recipe.rinseSeconds,
          kind: "rinse" as const
        }
      ]
    : [];

  return [
    ...rinseStep,
    ...recipe.infusions.map((infusion) => ({
      id: `infusion-${infusion.index}`,
      label: interpolate(copy.infusion, { index: infusion.index }),
      detail: copy.infusionDetail,
      seconds: infusion.seconds,
      kind: "infusion" as const
    }))
  ];
}

function formatPeople(people: number, unit: string) {
  return `${people} ${unit}`;
}

function formatSeconds(seconds: number, unit: string) {
  return `${seconds} ${unit}`;
}

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export default App;
