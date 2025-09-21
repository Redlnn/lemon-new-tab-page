## About this Project

This is a browser extension that replaces the default new tab page. It's built with Vue 3, TypeScript, and the [WXT framework](https://wxt.dev/). The extension is highly customizable, allowing users to change wallpapers, search engines, shortcuts, and more.

## Core Architecture & Key Directories

The project structure is organized by the WXT framework, which uses "entrypoints" to define different parts of the extension.

- `wxt.config.ts`: The main configuration file for the WXT build tool. It defines entrypoints, permissions, and other extension manifest properties.
- `entrypoints/`: This is the most important directory.
  - `newtab/`: The main UI for the new tab page. It's a complete Vue 3 application.
    - `App.vue`: The root component of the new tab page.
    - `main.ts`: Initializes the Vue app, Pinia stores, and i18n.
    - `components/`: Contains all the UI components.
    - `scripts/store/`: Contains Pinia stores for managing UI state (e.g., `backgroundSwitchStore`, `focusStore`).
    - `scripts/api/`: Handles fetching data from external services like Bing Wallpaper.
  - `background/`: The background service worker for the extension. It handles tasks that don't require a UI.
- `shared/`: Contains code and logic shared across different entrypoints (like `newtab` and `background`).
  - `settings/`: This is a critical module for managing all user settings.
    - `default.ts`: Defines the default values for all settings.
    - `settingsStore.ts`: A Pinia store that provides reactive access to settings throughout the app.
    - `settingsStorage.ts`: Handles the persistence of settings to the browser's storage (`localforage`).
    - `migrate/`: Contains migration scripts to update user settings from older versions of the extension. This is crucial for backward compatibility.
  - `i18n.ts`: Sets up the internationalization using `vue-i18n`.
  - `locales/`: Contains the YAML translation files for different languages.
- `public/`: Static assets that are copied directly to the extension's root.

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

## Key Patterns & Conventions

### Settings Management

The settings system in `shared/settings/` is central to the extension. To add a new user setting:

1.  **Add the default value:** Add the new setting and its default value to the object in `shared/settings/default.ts`.
2.  **Update the type:** Add the new property to the `Settings` type in `shared/settings/types/v7.d.ts` (or the latest version).
3.  **Access the setting:** Use the `useSettingsStore` Pinia store to reactively access or modify the setting from any Vue component. The store automatically handles persistence.

    ```typescript
    // Example in a Vue component
    import { useSettingsStore } from '@/shared/settings/settingsStore';

    const settingsStore = useSettingsStore();
    // Access a value
    console.log(settingsStore.search.searchEngines);
    // Modify a value
    settingsStore.search.searchEngines = [...];
    ```

4.  **Migration (if necessary):** If the setting change is not backward-compatible, you may need to add a migration script in `shared/settings/migrate/` to ensure smooth updates for existing users.

### State Management

- **Pinia** is used for all state management.
- For UI-specific state that doesn't need to be persisted, use the stores in `entrypoints/newtab/scripts/store/`.
- For settings that need to be persisted and shared across the extension, use the stores in `shared/settings/`.

### Internationalization (i18n)

- All user-facing strings must be added to the locale files in `locales/`.
- Use the `t()` function from `vue-i18n` in Vue components to display translated text.
- The setup is handled in `shared/i18n.ts`.
