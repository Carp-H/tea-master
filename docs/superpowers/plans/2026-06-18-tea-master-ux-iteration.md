# Tea Master UX Iteration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Tea Master's mobile flow, timer execution, editable parameters, recipe sharing, accessibility, and privacy safety without adding any backend behavior.

**Architecture:** Keep the app static and client-side. Split current App-level responsibilities into focused React components and pure helpers only where doing so reduces risk in this iteration.

**Tech Stack:** React 19, Vite 7, TypeScript, Vitest, Testing Library, lucide-react, jsPDF.

---

## Task 1: Query State And Strength Presets

- [x] Add `BrewStrength` and `RecipeQueryState` types.
- [x] Add strength ratios to brewing guide data.
- [x] Add unit tests for strength-to-ratio behavior.
- [x] Add query parse tests for valid and invalid URL parameters.
- [x] Implement query-state helper.

## Task 2: Parameter Summary UX

- [x] Add strength selector to recommendation controls.
- [x] Keep tea amount computed from water and ratio.
- [x] Mark editable fields and computed tea amount visually.
- [x] Add "start brewing" jump control.
- [x] Add component tests for strength and computed amount updates.

## Task 3: Timer Execution And Accessibility

- [x] Preserve default active step 0.
- [x] Keep inline countdown visible when modal is closed.
- [x] Ensure inline pause/resume controls affect the real timer.
- [x] Reopen timer modal when a closed running timer completes.
- [x] Add modal focus return, Escape close, and live completion messaging.
- [x] Add component tests for timer start, pause, close, completion, and reset behavior.

## Task 4: Save And Share

- [x] Remove link-based recipe sharing from the save menu.
- [x] Keep PNG, JPEG, and PDF exports.
- [x] Make save menu close on outside click and Escape.
- [x] Add tests for exported format menu and copied URL contents.

## Task 5: Responsive Layout And QA

- [x] Compact mobile recommendation layout.
- [x] Raise mobile step timer touch target to at least 44px.
- [ ] Check desktop and 390px mobile view manually. Desktop Safari was inspected; exact 390px visual QA still needs manual browser confirmation because the available browser control cannot force a mobile viewport.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Check generated source for local-path, secret, telemetry, and localhost leakage risks.

## Completion Constraint

All changes stay local until the user explicitly approves commit and push.
