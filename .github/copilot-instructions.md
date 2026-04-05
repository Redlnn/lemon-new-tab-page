# Copilot Instructions for `lemon-new-tab`

## User preference

Thinking in English but responding in Chinese.

## Build, lint, and test commands

- Install dependencies: `pnpm install` (runs `wxt prepare` via `postinstall`)
- Development:
  - `pnpm dev` (Chrome)
  - `pnpm dev:firefox`
  - `pnpm dev:edge`
- Type-check: `pnpm type-check`
- Build:
  - `pnpm build` (Chrome)
  - `pnpm build:firefox`
  - `pnpm build:edge`
- Package extension ZIPs:
  - `pnpm zip`
  - `pnpm zip:firefox`
  - `pnpm zip:edge`
- Lint/format:
  - `pnpm lint` (runs `lint:oxlint`, `lint:eslint`, `lint:style`)
  - `pnpm lint:oxlint`
  - `pnpm lint:eslint`
  - `pnpm lint:style`
  - `pnpm format`
- Single-file lint example:
  - `pnpm lint:eslint -- entrypoints/newtab/main.ts`

### Tests

- There is currently no automated test suite in this repository (`package.json` has no `test` script and no `*.test`/`*.spec` files were found).
- Single-test command: not available in the current setup.

## High-level architecture

- This is a WXT-based browser extension (Vue 3 + TypeScript + Element Plus) with three entrypoints:
  - `entrypoints/newtab`: main app UI.
  - `entrypoints/background`: background/service worker for sync orchestration.
  - `entrypoints/popup`: small action popup for adding current page to shortcuts.
- Newtab startup flow:
  - `entrypoints/newtab/init.ts` waits for i18n/dayjs initialization, then imports `main.ts`.
  - `main.ts` initializes Pinia + i18n, loads persisted stores (settings/shortcuts/custom search engines), applies theme, mounts `App.vue`, and enables sync if configured.
- Persistence model:
  - App state is managed with Pinia, persisted through WXT storage items (`storage.defineItem`) in `shared/settings`, `shared/shortcut`, `shared/sync`, and newtab shared modules.
  - Settings schema is versioned in `shared/settings/current.ts` and migrated in `shared/settings/migrate/*` (current version: `9`).
  - Wallpaper binaries are stored in IndexedDB via `localforage` (`entrypoints/newtab/shared/wallpaper/wallpaperStorge.ts`), while URL/cache metadata is stored separately in WXT storage.
- Sync architecture:
  - `shared/sync/syncDataStore.ts` performs local-vs-cloud timestamp checks and sends `SYNC_REQUEST` messages.
  - `entrypoints/background/index.ts` receives sync snapshots, keeps only the latest pending item, throttles writes, persists to `sync:syncData`, and notifies active tabs with `SYNC_UPDATE`.
  - Sync intentionally normalizes non-portable data (local/online wallpaper details) before writing cloud state.
- Theme architecture:
  - Base theme variables are generated in `shared/theme/change.ts`.
  - Monet extraction is offloaded to `entrypoints/newtab/shared/theme/monet.worker.ts` and cached through `shared/theme/monetStorage.ts`.

## Key repository conventions

- Use existing storage patterns instead of ad-hoc browser storage calls:
  - `local:*` for device-local persisted data,
  - `sync:*` for cloud-synced payloads,
  - `session:*` for ephemeral session data.
- For persisted Pinia modules, follow the `initX` + `useXStore` + `saveX` pattern (examples: settings, shortcuts, custom search engines).
- Keep settings compatibility logic centralized in `shared/settings`:
  - update `CURRENT_CONFIG_VERSION`,
  - add migration(s) in `shared/settings/migrate`,
  - keep `defaultSettings` aligned with current schema.
- i18n is i18next-based with namespace-prefixed keys (`newtab:*`, `settings:*`, `sync:*`, `faq:*`), and locale resources are loaded from `locales/<lang>/*.json`.
- Respect project path aliases from `wxt.config.ts`:
  - `@` => repository root
  - `@newtab` => `entrypoints/newtab`
- Vue APIs are mostly auto-imported (see WXT/Vite config and generated `types/auto-imports.d.ts`), so existing files commonly omit manual imports for `ref`, `watch`, `computed`, etc.
- CI/release workflow (`.github/workflows/build.yml`) uses Node `24` + pnpm `10` and builds zip artifacts for Chrome/Edge/Firefox.
