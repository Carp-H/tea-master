# Tea Master UX Iteration Design

## Summary

This iteration improves Tea Master's mobile usability, brewing execution flow, editable parameter clarity, recipe sharing, accessibility, and privacy posture while keeping the site a static React/Vite app.

The app remains fully client-side. It must not add a backend, user accounts, remote telemetry, or code that reads local files.

## Product Behavior

- Mobile users should reach the brewing flow faster after choosing tea and parameters.
- Step 0, "Prepare", is the default highlighted brewing step.
- Each brewing step owns its timer entry point. The timer modal is only a focused enlarged view of the selected step.
- If a timer continues after the modal is closed, the inline step control shows countdown state and allows pause/resume.
- If a closed timer reaches the end, the timer modal reopens automatically.
- Editable fields are visually distinct from computed and read-only fields.
- Tea amount is always computed from water volume and the active tea-water ratio.
- Strength presets change the active tea-water ratio:
  - Green: light 110, standard 100, strong 90
  - White gaiwan: light 40, standard 30, strong 20
  - Black gaiwan: light 40, standard 30, strong 20
  - Black porcelain pot: light 110, standard 100, strong 90
  - Oolong gaiwan: light 20, standard 15, strong 15
  - Dark tea: light 25, standard 20, strong 20
- Manual ratio edits keep the current numeric value and do not require a new tea process.
- Recipe state can still be read from URL query for backward-compatible local restoration, but the app no longer offers link-based recipe sharing.
- Save recipe menu offers PNG, JPEG, and PDF only.

## Interfaces

- Add `BrewStrength = "light" | "standard" | "strong"`.
- Add optional `strengthRatios` to `BrewingGuide`.
- Add `RecipeQueryState` with `lang`, `tea`, `vessel`, `water`, `ratio`, and `strength`.
- Add a small query-state utility for safe query parsing behavior.
- No server API, remote writes, analytics, auth, cookies, or local file reads.

## Accessibility

- Timer modal traps focus to the dialog while open.
- Closing the timer returns focus to the originating step control.
- Escape closes the timer modal.
- Timer completion message uses `aria-live`.
- Interactive controls keep usable touch targets on mobile.

## Privacy And Security

- Static build only.
- Query sharing is user initiated.
- Clipboard writes are limited to the current URL.
- Notifications, vibration, or sound are optional and off by default.
- No dependency should be added unless the feature cannot be implemented with existing browser APIs.

## Acceptance Criteria

- `npm test` and `npm run build` pass.
- Desktop and 390px mobile layouts have no horizontal overflow.
- Chinese, English, and German UI labels remain readable.
- A user can choose tea, adjust water/ratio/strength, start a timer, pause/resume, close/reopen the timer, complete a step, and save or copy a recipe.
- GitHub Pages output remains a static app with no local-machine access path.
