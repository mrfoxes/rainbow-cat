# Changelog

## 0.2.3 - 2026-10-05

- The cat is drawn directly in the spinner hook, with no `Client` element and no surface module. `hooks/register.ts` is now the only code file.
- A 120 ms `$.clock.every` timer animates the cat while the spinner shows, and stops a few frames after the spinner goes away.
- The README lists `$.clock.every` among the mods API calls.
- No visible change.

## 0.2.2 - 2026-10-05

- Added a listing icon at `.claude-plugin/icon.png`.
- The hooks module and the surface module are plain TypeScript (`hooks/register.ts`, `hooks/cat.ts`), without JSX.
- The on/off choice lives in a module variable backed by `$.store`, instead of `$.state`. `plugin.json` no longer has a `types` field.
- The README lists every hook and every mods API call, and states what the plugin does not do.
- No change to behavior.

## 0.2.1 - 2026-10-05

- The marketplace is now named `mrfoxes`. Install with `claude plugin install rainbow-cat@mrfoxes`.
- No change to behavior.

## 0.2.0 - 2026-10-05

- Renamed from `nyan-cat` to `rainbow-cat`. The repository is now `mrfoxes/rainbow-cat` and the marketplace is `rainbow-cat`.
- The slash command is now `/rainbow` (`/rainbow on`, `/rainbow off`).
- New spinner words: Rainbowing, Purring, Meowing, Sparkling, Prancing, Zooming. The turn summary says "Rainbowed".
- The on/off choice starts fresh under the new name: rainbow cat mode is on after install.

## 0.1.1 - 2026-10-05

- The plugin now lives at the repository root, so its README and LICENSE ship with it.
- Added `displayName` and a README section on what the plugin does and does not do.
- No change to behavior.

## 0.1.0 - 2026-10-05

- First release.
- Nyan cat with a rippling rainbow beside the terminal spinner.
- Spinner words become nyan words; the turn summary says "Nyaned".
- `/nyan`, `/nyan on`, `/nyan off` toggle the mode. The choice persists across sessions.
- Terminals narrower than 40 columns keep the nyan words but not the cat.
- The desktop app keeps its own spinner.
