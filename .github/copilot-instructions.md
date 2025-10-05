# .github/copilot-instructions.md — AI coding agent quick guide

Purpose: help an AI (or a contributor AI assistant) become productive fast in this repository. Keep changes small, reference files, and prefer conservative edits.

## Big picture (why/how)

This is a browser extension that replaces the default new tab page. It's built with Vue 3 + TypeScript using the [WXT framework](https://wxt.dev/). WXT defines multiple "entrypoints" (notably `entrypoints/newtab` and `entrypoints/background`) that become extension pages and the service worker. Shared logic lives in `shared/` (settings, i18n, sync, media APIs).

## Key files to read first

- `wxt.config.ts` — build and manifest logic, browser-specific manifest branches (chrome vs firefox)
- `package.json` — scripts (dev/build/zip), pnpm overrides and postinstall hook
- `entrypoints/newtab/main.ts` — app bootstrap (Pinia, i18n)
- `shared/settings/default.ts` and `shared/settings/settingsStore.ts` — settings default values, types and persistence pattern
- `shared/i18n.ts` and `locales/` — i18n wiring and translation files

## Developer Workflow

The project uses `pnpm` as the package manager.

- **To start the development server:**
  - For Chrome: `pnpm dev`
  - For Firefox: `pnpm dev:firefox`
  - For Edge: `pnpm dev:edge`
    WXT will create a `.output/` directory with the unpacked extension and enable hot-reloading.

- **To build the extension for production:**
  - `pnpm build` (or `build:firefox`, `build:edge`)

- **To create a distributable .zip file:**
  - `pnpm zip` (or `zip:firefox`, `zip:edge`)

- **Linting and Formatting:**
  - Run `pnpm lint` to check for code quality issues.
  - Run `pnpm format` to format the code with Prettier.
  - Run `pnpm type-check` to check for TypeScript type errors.

- Note: `postinstall` runs `wxt prepare` which generates platform artifacts

## Project-specific conventions and patterns

### Settings system

- Defaults: `shared/settings/default.ts` is the single source of default values.
- Types: versioned under `shared/settings/types/v7.d.ts` (increment types when structure changes).
- Persistence: `shared/settings/settingsStore.ts` uses `settingsStorage.ts` (localforage) and migration scripts in `shared/settings/migrate/`.
- To add a new setting: (1) add default in `default.ts`; (2) update the Settings type; (3) use it via `useSettingsStore()`; (4) if incompatible with prior versions add a migration in `shared/settings/migrate/` and register it.

### State management

Pinia for all reactive state. UI ephemeral stores live under `entrypoints/newtab/scripts/store/`.

### i18n

translations live in `locales/*` and manifest locale strings are in `public/_locales/*/messages.json`. `vite-plugin-i18next-loader` and `shared/i18n.ts` handle wiring.

### Build plugins & generated types

`unplugin-auto-import` and `unplugin-vue-components` generate d.ts files in `types/` (e.g., `types/auto-imports.d.ts`). If you change auto-import or components, regenerate types by running `pnpm install` or restarting dev.

### Manifest branching

`wxt.config.ts` returns different manifest objects for firefox vs chrome — check `baseManifest.host_permissions` and browser-specific `permissions`.

### CSS/ElementPlus

global Element Plus SCSS is injected by Vite (`additionalData` pointing to `@/assets/styles/element/index.scss`).

## Integration points & external dependencies to watch

- External hosts (see `wxt.config.ts` host_permissions): bing, api.bing.com, suggestion.baidu.com, suggestqueries.google.com, v2.jinrishici.com. These map to API code under `entrypoints/newtab/scripts/api/` and `shared/network`.
- Persistence: `localforage` used for settings & sync storage (`shared/settings/settingsStorage.ts`, `shared/sync/`).
- WebExtension polyfill: `@wxt-dev/webextension-polyfill` and `@types/webextension-polyfill` are used — prefer that API surface in background scripts.

## Concrete examples (copyable patterns)

- Access a persisted setting:

  ```ts
  import { useSettingsStore } from '@/shared/settings/settingsStore'
  const settings = useSettingsStore()
  // Read a value
  console.log(settingsStore.search.searchEngines);
  // Modify a value
  settingsStore.search.searchEngines = [...];
  ```

- Add a new setting named `foo`:
  - add default in `shared/settings/default.ts`, e.g. `foo: { enabled: true }`
  - update the `Settings` type under `shared/settings/types/**.d.ts` (use the latest version)
  - if the new shape is incompatible with previous versions, add a migration in `shared/settings/migrate/` and export it from `index.ts` there.
- Update manifest permissions for a host:
  - edit `wxt.config.ts` baseManifest.host_permissions and run `pnpm build` or `pnpm dev`

## Debug notes & gotchas

- `.output/` contains the unpacked extension during dev — if Chrome/Firefox doesn't load hot changes, inspect `.output/` and reload the extension in the browser.
- Vite is overridden via pnpm to use `rolldown-vite`.

## Safety & editing style for AI edits

- Prefer small, reversible changes (one feature or fix per PR).
- Avoid changing manifest host permissions or optional permissions without explicit test steps and a short justification in PR description.
- When touching settings, update default values, types, and migrations together to avoid runtime errors for existing users.
