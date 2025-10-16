# .github/copilot-instructions.md — AI coding agent quick guide

Purpose: make AI contributions effective fast. Keep edits small, reference files, and follow existing patterns.

## Big picture

Browser extension (new tab) built with Vue 3 + TypeScript on WXT. Pages live under `entrypoints/` (`newtab` app, `background` service worker). Cross-cutting code is under `shared/` (settings, i18n, sync, storage, media).

## Start here (keys to scan)

- `wxt.config.ts` — manifest branching (Chrome/Firefox/Edge), host_permissions, Vite plugins, path aliases (`@`, `@newtab`).
- `package.json` — scripts: dev/build/zip, lint stack.
- `entrypoints/newtab/main.ts` — app bootstrap, Pinia, i18n init, settings init/save, theme switch.
- `shared/settings/{current.ts,default.ts,settingsStore.ts}` — CURRENT_CONFIG_VERSION, defaults, persistence, migrations.
- `shared/i18n.ts` and `locales/*` — runtime-loaded i18n with special zh fallback rules; manifest strings in `public/_locales/*/messages.json`.

## Dev workflow (pnpm)

- Run: `pnpm dev` (or `dev:firefox`, `dev:edge`) → WXT unpacks to `.output/` with HMR.
- Build: `pnpm build` (also `build:firefox`, `build:edge`), Zip: `pnpm zip*`.
- Checks: `pnpm type-check`, `pnpm lint` (eslint + oxlint + stylelint), `pnpm format`.

## Patterns that matter

- Settings
  - Single source of defaults: `shared/settings/default.ts`; type at `shared/settings/types/v{version}.d.ts`; current exported via `shared/settings/current.ts`.
  - Store: `useSettingsStore()` from `shared/settings/settingsStore.ts` persists with `settingsStorage` (localforage). Old versions migrate on init; Chrome/Edge also read legacy `chrome.storage.local`.
  - Background sync intentionally resets non-syncable wallpaper fields (local/online) — see `entrypoints/background/index.ts`.
- i18n
  - `i18next` + `vite-plugin-i18next-loader`. Resources loaded dynamically: `@/locales/${lng}/${ns}.json`.
  - Fallback: zh-MO→zh-HK, generic zh→zh-CN; Windows zh-TW may switch to zh-HK based on timezone.
- Build/Vite
  - Vue SFC via `@vitejs/plugin-vue`; Markdown SFC via `unplugin-vue-markdown` (see `scripts/mdit-remove-h1.ts`).
  - Auto imports/components generate d.ts in `types/*`; after changing resolvers, re-run dev or `pnpm install` to regenerate.
  - Global Element Plus SCSS injected via Vite `css.preprocessorOptions.scss.additionalData`.
- Aliases: use `@` for repo root and `@newtab` for `entrypoints/newtab`.

## Integration points

- Network permissions in `wxt.config.ts`: bing/api.bing, baidu, google suggest, jinrishici; dev adds `http://localhost/`.
- APIs live under `entrypoints/newtab/scripts/api/*`; network helpers in `shared/network/*`.
- Storage: `localforage` in `shared/settings/settingsStorage.ts`; wallpaper blobs indexed by `shared/settings/wallpaperStore.ts`.
- WebExtension API via `@wxt-dev/webextension-polyfill` (`browser.*`). In background, use `defineBackground` and alarms for periodic work.

## Copyable snippets (correct to this repo)

- Read/modify settings
  ```ts
  import { useSettingsStore, saveSettings } from '@/shared/settings'
  const settings = useSettingsStore()
  // Read a value
  console.log(settings.search.searchEngines);
  // Modify a value
  settings.search.searchEngines = [...];
  ```
- Add a setting
  1. Add default in `shared/settings/default.ts`
  2. Update `shared/settings/types/v7.d.ts` (or bump version + migrate under `shared/settings/migrate/*`)
  3. Access via `useSettingsStore()`; if breaking change, write a migration and export it
- Update host permissions
  - Edit `baseManifest.host_permissions` in `wxt.config.ts` and run dev/build

## Debug notes

- If HMR stalls, reload the unpacked extension from `.output/` in the browser.
- Background sync queue uses alarms and local timers; messages use `type: 'SYNC_*'` — see `shared/sync/*` for types and storage.

## Safety for AI edits

- Keep changes small; avoid manifest permission changes without test steps and rationale.
- When touching settings, update defaults + types (+ migration if needed) in the same PR to prevent runtime errors.
