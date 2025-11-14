# CLAUDE.md - AI Assistant Guide for Lemon New Tab Page

> **Last Updated:** 2025-11-14
> **Project Version:** 2.5.4
> **Framework:** WXT 0.20.11 + Vue 3.5.22 + TypeScript 5.9.3

This document provides comprehensive guidance for AI assistants working on the Lemon New Tab Page browser extension codebase.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Codebase Architecture](#codebase-architecture)
3. [Development Workflows](#development-workflows)
4. [Key Conventions](#key-conventions)
5. [Critical Systems](#critical-systems)
6. [Common Tasks](#common-tasks)
7. [Testing & Deployment](#testing--deployment)
8. [Troubleshooting](#troubleshooting)

---

## Project Overview

### What is Lemon New Tab Page?

A **high-performance, privacy-focused browser extension** that provides a customizable new tab page with:

- 🔍 **Search**: Multi-engine search with instant suggestions
- 🖼️ **Wallpapers**: Bing daily images, custom images/videos, or solid colors
- 💬 **YiYan (一言)**: Ancient Chinese poems and inspirational quotes
- 🪜 **Quick Access**: Browser top sites + custom bookmarks with drag-and-drop
- 🌐 **i18n**: Full support for English, Simplified Chinese, Traditional Chinese, and Cantonese
- 🌓 **Dark Mode**: Automatic or manual theme switching
- ☁️ **Cloud Sync**: Cross-device settings synchronization
- ⚡ **Pure Local**: No external dependencies, instant loading

### Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Vue 3.5.22 (Composition API, `<script setup>`) |
| **Build Tool** | WXT 0.20.11 (Web Extension Toolkit) + Vite (Rolldown) |
| **Language** | TypeScript 5.9.3 |
| **UI Library** | Element Plus 2.11.7 |
| **State Management** | Pinia 3.0.3 |
| **i18n** | i18next 25.6.0 |
| **Storage** | localforage 1.10.0 (IndexedDB) |
| **Styling** | SCSS with custom variables |
| **Linting** | ESLint 9.39.0 + Oxlint 1.25.0 + Stylelint 16.25.0 |
| **Formatting** | Prettier 3.6.2 |

### Browser Compatibility

- **Chrome/Edge:** 116+
- **Firefox:** 128+

---

## Codebase Architecture

### Directory Structure

```
lemon-new-tab-page/
├── entrypoints/               # Extension entry points
│   ├── background/            # Background service worker
│   │   └── index.ts           # Sync queue management, alarms, message handling
│   └── newtab/                # New tab page UI
│       ├── index.html         # HTML template
│       ├── main.ts            # App initialization
│       ├── App.vue            # Root component
│       ├── components/        # Vue components (Search, Clock, Settings, etc.)
│       ├── composables/       # Composition functions
│       ├── scripts/           # Utilities (API, storage, stores)
│       └── styles/            # SCSS stylesheets
├── shared/                    # Shared modules across entrypoints
│   ├── settings/              # Settings management (default, storage, store, migration)
│   ├── bookmark/              # Bookmark/shortcut management
│   ├── customSearchEngine/    # Custom search engine management
│   ├── sync/                  # Cloud sync system
│   ├── yiyan/                 # Poem/quote providers
│   ├── i18n.ts                # i18next configuration
│   ├── network/               # Fetch utilities (HTTP, JSONP)
│   └── media/                 # Media type detection and validation
├── locales/                   # i18n translation files
│   ├── en/                    # English
│   ├── zh-CN/                 # Simplified Chinese
│   ├── zh-TW/                 # Traditional Chinese
│   └── zh-HK/                 # Hong Kong Cantonese
├── public/                    # Static assets
│   ├── _locales/              # WebExtension manifest locales
│   ├── favicon.png            # Tab favicon
│   └── icon.png               # Extension icon
├── assets/                    # Global assets
│   ├── icon.svg               # Vector icon
│   └── styles/                # Global SCSS variables
├── types/                     # TypeScript type definitions
│   ├── env.d.ts               # Vite environment types
│   ├── auto-imports.d.ts      # Auto-imported functions (generated)
│   └── components.d.ts        # Auto-imported components (generated)
├── scripts/                   # Build scripts
│   ├── depAnalysis.ts         # Dependency analysis
│   └── mdit-*.ts              # Markdown-it plugins for CHANGELOG
├── wxt.config.ts              # WXT configuration (manifest, plugins, aliases)
├── tsconfig.json              # TypeScript root config
├── tsconfig.app.json          # App TypeScript config
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

### Key Entry Points

#### 1. Background Worker (`entrypoints/background/index.ts`)

**Purpose:** Background service worker for managing sync operations

**Key Functions:**
- `processSyncQueue()`: Batch and aggregate sync requests from multiple tabs
- `canSync()`: Throttle sync operations (minimum 2-second intervals)
- `scheduleLocalTick()`: Schedule next sync execution using Alarms API

**Data Flow:**
```
Tab/Content → Send sync message → Background worker → Queue request
                                                    ↓
                                     Alarm triggers (2s intervals)
                                                    ↓
                                     Process queue → Save to storage
                                                    ↓
                                     Broadcast to all tabs
```

#### 2. New Tab UI (`entrypoints/newtab/`)

**Initialization Flow:**
1. `index.html` loads → script imports `main.ts`
2. `main.ts` → Initialize Pinia store + i18n
3. Load settings from storage (with migration if needed)
4. Load bookmarks + custom search engines
5. Mount Vue app → render `App.vue`
6. Initialize background sync if enabled

**Main Components:**
- `App.vue` - Root component with layout structure
- `Background.vue` - Wallpaper/background display (images, videos, solid colors)
- `Clock.vue` - Digital clock with date/time
- `YiYan.vue` - Ancient poems/quotes display
- `SearchBox/` - Search input with suggestions and engine switcher
- `Shortcut/` - Bookmarks grid with drag-and-drop
- `SettingsPage/` - Settings panel with navigation tree

---

## Development Workflows

### Package Manager

**⚠️ IMPORTANT:** This project uses **pnpm** exclusively.

```bash
# Install dependencies
pnpm install

# DO NOT use npm or yarn - dependencies may break
```

### Development Commands

```bash
# Development mode (Chrome, hot reload)
pnpm dev

# Development mode for Firefox
pnpm dev:firefox

# Development mode for Edge
pnpm dev:edge

# Type checking
pnpm type-check

# Build for production
pnpm build              # Chrome
pnpm build:firefox      # Firefox
pnpm build:edge         # Edge

# Create distributable ZIP
pnpm zip                # Chrome
pnpm zip:firefox        # Firefox
pnpm zip:edge           # Edge

# Linting & Formatting
pnpm lint               # Run all linters (oxlint, eslint, stylelint)
pnpm lint:oxlint        # Oxlint only (Rust-based, fast)
pnpm lint:eslint        # ESLint only
pnpm lint:style         # Stylelint only
pnpm format             # Prettier formatting
```

### Build Output

- **Development:** `.output/chrome-mv3/` (or firefox-mv3, edge-mv3)
- **Production:** `.output/chrome-mv3/` (optimized)
- **ZIP:** `.output/*.zip`

### Hot Reload

WXT provides automatic hot reload during development:
- **Content/UI changes:** Instant reload
- **Background worker:** Automatic restart
- **Manifest changes:** Full extension reload

---

## Key Conventions

### Code Style

#### TypeScript

- **Naming Conventions:**
  - `PascalCase` for components, types, interfaces, classes
  - `camelCase` for variables, functions, methods
  - `UPPER_SNAKE_CASE` for constants
  - Prefix interfaces with `I` when needed for clarity (e.g., `ISettings`)

- **Import Order:**
  1. Vue core imports
  2. Third-party libraries
  3. Local imports (components, composables, types)
  4. Styles

- **Type Safety:**
  - Prefer interfaces over types for object shapes
  - Use `as const` for literal objects
  - Avoid `any` - use `unknown` and type guards instead
  - Leverage auto-imports from `unplugin-auto-import`

#### Vue Components

- **Component Style:** `<script setup>` with TypeScript
- **Props:** Use `defineProps<PropsInterface>()` with TypeScript
- **Emits:** Use `defineEmits<EmitsInterface>()` with TypeScript
- **Refs:** Use `ref<Type>()` with explicit types
- **Reactive:** Prefer `ref` over `reactive` for primitive values

**Example Component Structure:**
```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ISomeType } from '@/types'

// Props
interface Props {
  title: string
  count?: number
}
const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// Emits
interface Emits {
  (e: 'update', value: string): void
}
const emit = defineEmits<Emits>()

// State
const visible = ref(false)
const data = ref<ISomeType[]>([])

// Computed
const displayTitle = computed(() => `${props.title} (${props.count})`)

// Methods
function handleClick() {
  emit('update', 'new value')
}

// Lifecycle
onMounted(() => {
  // Initialize
})
</script>

<template>
  <div class="component-name">
    <h1>{{ displayTitle }}</h1>
    <button @click="handleClick">Click Me</button>
  </div>
</template>

<style scoped lang="scss">
.component-name {
  // Styles
}
</style>
```

#### SCSS

- **Variables:** Use `/assets/styles/variables.scss` for global variables
- **Mixins:** Acrylic glass effect mixin in `/entrypoints/newtab/styles/mixins/acrylic.scss`
- **Scoping:** Use `scoped` attribute for component styles
- **Naming:** BEM-like naming (`.block__element--modifier`)
- **Colors:** Use CSS variables from Element Plus theme system

### Commit Messages

Follow **Gitmoji** convention (emojis indicate commit type):

- `:sparkles:` `:sparkles:` - New feature
- `:bug:` `:bug:` - Bug fix
- `:lipstick:` `:lipstick:` - UI/style updates
- `:recycle:` `:recycle:` - Refactoring
- `:fire:` `:fire:` - Remove code/files
- `:globe_with_meridians:` `:globe_with_meridians:` - i18n/localization
- `:bookmark:` `:bookmark:` - Version tag
- `:construction:` `:construction:` - Work in progress

**Recent Examples:**
```
:bug: 修复启动时背景遮罩会闪烁的问题(close #46)
:bookmark: v2.5.4
:lipstick: 统一右键菜单大小
:globe_with_meridians: 优化翻译
```

### File Naming

- **Components:** `PascalCase.vue` (e.g., `SearchBox.vue`)
- **Composables:** `camelCase.ts` with `use` prefix (e.g., `useDialog.ts`)
- **Utils:** `camelCase.ts` (e.g., `bookmark.ts`)
- **Stores:** `camelCase.ts` with `Store` suffix (e.g., `settingsStore.ts`)
- **Types:** `camelCase.d.ts` or `types.d.ts`

### Path Aliases

Configured in `tsconfig.app.json` and `wxt.config.ts`:

```typescript
// @ → project root
import { settingsStore } from '@/shared/settings'

// @newtab → entrypoints/newtab/
import SearchBox from '@newtab/components/SearchBox/index.vue'
```

---

## Critical Systems

### 1. Settings Management System

**Location:** `/shared/settings/`

#### Schema Versioning

The settings system supports **7 versions** (v1-v7) with automatic migration:

- **Current Version:** v7 (defined in `shared/settings/types/index.ts`)
- **Migration System:** `shared/settings/migrate/`
- **Version History:** `shared/settings/types/v1.d.ts` through `v7.d.ts`

#### Default Settings

**File:** `shared/settings/default.ts`

**Key Settings Categories:**
```typescript
{
  settingsSchemaVersion: 7,

  // Language
  lang: 'auto',  // 'auto' | 'zh-CN' | 'zh-TW' | 'zh-HK' | 'en'

  // Theme
  theme: 'auto',  // 'auto' | 'light' | 'dark'
  themeColor: '#409EFF',  // Primary color

  // Clock
  clock: {
    enable: true,
    use12Hour: false,
    showSeconds: true,
    showDate: true,
    showLunarDate: false,
    showWeek: true,
    showFestival: true
  },

  // Search
  search: {
    enable: true,
    showSearchEngineIcon: true,
    defaultSearchEngineId: 'google',
    historyMaxCount: 20,
    enableSearchHistory: true,
    enableSearchSuggestions: true
  },

  // Background
  background: {
    type: 'color',  // 'color' | 'bing' | 'imageApi' | 'localImage' | 'localVideo'
    solidColor: '#1e1e1e',
    imageApiUrl: '',
    localImage: null,
    localVideo: null,
    enableMask: true,
    maskOpacity: 0.5
  },

  // Shortcuts
  shortcut: {
    enable: true,
    showTopSites: true,
    topSitesCount: 8,
    enableDragSort: true
  },

  // YiYan (Poems/Quotes)
  yiyan: {
    enable: true,
    provider: 'jinrishici',  // 'jinrishici' | 'v1' | 'v2'
    customApiUrl: ''
  },

  // Sync
  sync: {
    enable: false,
    lastSyncTimestamp: 0
  },

  // Performance
  performance: {
    enableAcrylicEffect: true,
    enableDialogAnimation: true
  }
}
```

#### Adding New Settings

**⚠️ CRITICAL PROCESS:**

1. **Update Type Definition** (`shared/settings/types/index.ts`):
   ```typescript
   export interface ISettings {
     // ... existing fields
     newFeature: {
       enabled: boolean
       value: string
     }
   }
   ```

2. **Increment Schema Version:**
   ```typescript
   settingsSchemaVersion: 8  // Increment from 7 to 8
   ```

3. **Add Default Value** (`shared/settings/default.ts`):
   ```typescript
   newFeature: {
     enabled: true,
     value: 'default'
   }
   ```

4. **Create Migration File** (`shared/settings/migrate/fromVer7.ts`):
   ```typescript
   import type { ISettingsV7 } from '../types/v7'
   import type { ISettings } from '../types'

   export default function migrateFromV7(oldSettings: ISettingsV7): ISettings {
     return {
       ...oldSettings,
       settingsSchemaVersion: 8,
       newFeature: {
         enabled: true,
         value: 'default'
       }
     }
   }
   ```

5. **Update Migration Orchestrator** (`shared/settings/migrate/index.ts`):
   ```typescript
   import migrateFromV7 from './fromVer7'

   const migrations = {
     1: migrateFromV1,
     2: migrateFromV2,
     3: migrateFromV3,
     4: migrateFromV4,
     5: migrateFromV5,
     6: migrateFromV6,
     7: migrateFromV7  // Add new migration
   }
   ```

6. **Copy Previous Version Type** (`shared/settings/types/v7.d.ts`):
   ```typescript
   // Copy current settings interface to v7.d.ts before modifying
   export interface ISettingsV7 {
     // ... previous version without newFeature
   }
   ```

7. **Update Settings UI** (if needed):
   - Add new component in `entrypoints/newtab/components/SettingsPage/Settings/`
   - Update settings navigation in `SettingsMenuView.vue`
   - Add i18n strings in `locales/*/settings.json`

**Migration is AUTOMATIC** - users upgrading from older versions will have their settings migrated on load.

### 2. Internationalization (i18n) System

**Location:** `/shared/i18n.ts` and `/locales/`

#### Language Detection

**Auto-detection logic** (`shared/lang.ts`):
```typescript
1. Check user preference in settings
2. If 'auto':
   a. Check browser language (navigator.language)
   b. Special handling for zh-TW:
      - If timezone is 'Asia/Hong_Kong' or 'Asia/Macau' → use 'zh-HK'
      - Otherwise → use 'zh-TW'
   c. Fallback to 'en' if language not supported
```

#### Supported Languages

| Code | Language | Locale Files |
|------|----------|--------------|
| `en` | English | `locales/en/*.json` |
| `zh-CN` | Simplified Chinese | `locales/zh-CN/*.json` |
| `zh-TW` | Traditional Chinese | `locales/zh-TW/*.json` |
| `zh-HK` | Hong Kong Cantonese | `locales/zh-HK/*.json` |

#### Translation Files Structure

Each language has 4 JSON files:
```
locales/[lang]/
├── newtab.json      # UI strings (buttons, labels, placeholders)
├── settings.json    # Settings panel labels and descriptions
├── faq.json         # FAQ content
└── sync.json        # Sync-related messages
```

#### Adding Translations

1. **Add key to all 4 languages:**
   ```json
   // locales/en/newtab.json
   {
     "myNewFeature": {
       "title": "New Feature",
       "description": "This is a new feature"
     }
   }
   ```

2. **Use in components:**
   ```vue
   <template>
     <h1>{{ t('myNewFeature.title') }}</h1>
     <p>{{ t('myNewFeature.description') }}</p>
   </template>

   <script setup lang="ts">
   import { useI18n } from 'vue-i18n'
   const { t } = useI18n()
   </script>
   ```

3. **Use in TypeScript:**
   ```typescript
   import i18next from 'i18next'
   const title = i18next.t('myNewFeature.title')
   ```

### 3. State Management (Pinia)

**All stores are located in:**
- **Settings:** `shared/settings/settingsStore.ts`
- **Wallpaper:** `shared/settings/wallpaperStore.ts`
- **Bookmarks:** `shared/bookmark/bookmarkStore.ts`
- **Custom Search Engines:** `shared/customSearchEngine/customSearchEngineStore.ts`
- **Sync:** `shared/sync/syncDataStore.ts`
- **UI State:** `entrypoints/newtab/scripts/store/` (backgroundSwitchStore, focusStore)

#### Store Pattern

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMyStore = defineStore('myStore', () => {
  // State
  const count = ref(0)
  const items = ref<Item[]>([])

  // Getters
  const doubleCount = computed(() => count.value * 2)

  // Actions
  function increment() {
    count.value++
  }

  async function loadItems() {
    items.value = await fetchItems()
  }

  return {
    count,
    items,
    doubleCount,
    increment,
    loadItems
  }
})
```

#### Settings Store Special Behavior

**File:** `shared/settings/settingsStore.ts`

- **Auto-save:** Changes automatically persist to storage with debouncing
- **Migration:** Automatically migrates old settings on load
- **Sync:** Broadcasts changes to background worker if sync is enabled
- **Watchers:** Deep watch on settings object triggers save

**Usage:**
```typescript
import { useSettingsStore } from '@/shared/settings'

const settingsStore = useSettingsStore()

// Read settings
const clockEnabled = settingsStore.settings.clock.enable

// Update settings
settingsStore.settings.clock.enable = false  // Auto-saves

// Reset to defaults
await settingsStore.reset()

// Force reload
await settingsStore.load()
```

### 4. Cloud Sync System

**Location:** `/shared/sync/` and `/entrypoints/background/index.ts`

#### Architecture

```
Tab 1 changes settings → Send message to background
Tab 2 changes settings → Send message to background
                              ↓
                    Background worker queues changes
                              ↓
                    Alarm triggers (every 2 seconds)
                              ↓
                    Process queue (merge all changes)
                              ↓
                    Save merged data to storage.sync
                              ↓
                    Broadcast update to all tabs
```

#### Sync Data Structure

```typescript
interface ISyncData {
  settings: ISettings           // User settings
  bookmarks: IBookmark[]        // Custom bookmarks
  customSearchEngines: ICustomSearchEngine[]
  lastUpdateTimestamp: number   // Last sync timestamp
}
```

#### Sync Storage Types

- **Local:** `browser.storage.local` (unlimited, per-device)
- **Sync:** `browser.storage.sync` (limited to 100KB, cross-device)

**Sync Quotas:**
- Chrome/Edge: 100 KB total, 8 KB per item
- Firefox: 100 KB total

#### Enabling/Disabling Sync

```typescript
// In settings store
settingsStore.settings.sync.enable = true

// This triggers:
// 1. Initial sync data upload
// 2. Background worker starts listening
// 3. Changes auto-broadcast to other devices
```

### 5. Search System

**Location:** `/entrypoints/newtab/components/SearchBox/` and `/entrypoints/newtab/scripts/api/search/`

#### Search Engines

**Built-in engines** defined in `SearchBox/index.vue`:
- Google, Bing, Baidu, DuckDuckGo, Yandex, Yahoo, Ecosia, Qwant, Brave, Sogou, 360, Shenma

**Custom engines** managed in `shared/customSearchEngine/`

#### Search Suggestions

**Flow:**
1. User types in search box
2. Debounced input (300ms) triggers suggestion fetch
3. `scripts/api/search/suggestRunner.ts` calls search engine API
4. Response parsed by `suggestParser.ts`
5. Cached in `suggestCache.ts` (5-minute TTL)
6. Displayed in `SearchSuggestionArea.vue`

**Supported suggestion APIs:**
- Google (JSONP)
- Bing (JSONP)
- Baidu (JSONP)
- DuckDuckGo (JSON)

#### Search History

- **Storage:** `localforage` (IndexedDB)
- **Max Count:** Configurable in settings (default: 20)
- **File:** `entrypoints/newtab/scripts/storages/searchStorages.ts`

### 6. Wallpaper System

**Location:** `/entrypoints/newtab/components/Background.vue` and `/shared/settings/wallpaperStore.ts`

#### Wallpaper Types

| Type | Description | Storage |
|------|-------------|---------|
| `color` | Solid color | Settings |
| `bing` | Bing daily image | Cached in store |
| `imageApi` | Custom image API URL | Fetched on load |
| `localImage` | User-uploaded image | IndexedDB (localforage) |
| `localVideo` | User-uploaded video | IndexedDB (localforage) |

#### Local Media Storage

**Files:** `shared/settings/wallpaperStore.ts`

- **Format:** Base64 data URLs
- **Size Limits:** Browser-dependent (typically 5-10 MB per item)
- **Validation:** Media type verification before upload

**Upload Flow:**
1. User selects file in settings
2. File validated (type, size)
3. Convert to base64 data URL
4. Store in localforage
5. Update settings with reference

#### Bing Wallpaper API

**File:** `entrypoints/newtab/scripts/api/bingWallpaper.ts`

- **Endpoint:** `https://www.bing.com/HPImageArchive.aspx`
- **Cache:** Stored in wallpaperStore for 24 hours
- **Region:** Supports different regions (en-US, zh-CN, etc.)

### 7. Bookmark/Shortcut System

**Location:** `/shared/bookmark/` and `/entrypoints/newtab/components/Shortcut/`

#### Data Sources

1. **Browser Top Sites:** `chrome.topSites.get()` API
2. **Custom Bookmarks:** User-added shortcuts

#### Bookmark Structure

```typescript
interface IBookmark {
  id: string          // UUID v4
  title: string
  url: string
  favicon?: string    // Data URL or empty
  pinned: boolean     // Pinned to top
  order: number       // Display order
}
```

#### Features

- **Drag & Drop:** Reorder shortcuts (`useShortcutDrag.ts`)
- **Favicon Upload:** Custom favicon support (`useFaviconUpload.ts`)
- **Top Sites Merge:** Combine browser top sites with custom bookmarks (`useTopSitesMerge.ts`)
- **Grid Layout:** Responsive grid based on count (`useShortcutLayout.ts`)

#### Adding Custom Bookmark

```typescript
import { useBookmarkStore } from '@/shared/bookmark'

const bookmarkStore = useBookmarkStore()

bookmarkStore.add({
  title: 'Example',
  url: 'https://example.com',
  favicon: '',  // Auto-fetch or user upload
  pinned: false
})
```

---

## Common Tasks

### Adding a New Feature

**Step-by-step guide:**

1. **Plan the feature:**
   - Identify affected components
   - Determine if settings are needed
   - Check if i18n is required

2. **Update settings (if needed):**
   - Add to `shared/settings/types/index.ts`
   - Add default value to `shared/settings/default.ts`
   - Create migration file
   - Increment schema version

3. **Add i18n strings:**
   - Add to all 4 language files in `locales/*/`

4. **Create component:**
   ```bash
   # New component in entrypoints/newtab/components/
   touch entrypoints/newtab/components/MyFeature.vue
   ```

5. **Add to settings UI (if configurable):**
   ```bash
   # New settings page
   touch entrypoints/newtab/components/SettingsPage/Settings/MyFeatureSettings.vue
   ```

6. **Import in parent component:**
   ```vue
   <script setup lang="ts">
   import MyFeature from '@newtab/components/MyFeature.vue'
   </script>

   <template>
     <MyFeature v-if="settingsStore.settings.myFeature.enable" />
   </template>
   ```

7. **Test across browsers:**
   ```bash
   pnpm dev              # Chrome
   pnpm dev:firefox      # Firefox
   pnpm dev:edge         # Edge
   ```

8. **Update CHANGELOG.md:**
   - Add entry for new feature

### Modifying Existing Settings

**Example: Change default clock format to 12-hour**

1. **Edit default:**
   ```typescript
   // shared/settings/default.ts
   clock: {
     use12Hour: true  // Changed from false
   }
   ```

2. **Test migration:**
   - Existing users keep their settings
   - New users get new default

### Adding a New Language

**Example: Adding Japanese support**

1. **Create locale directory:**
   ```bash
   mkdir -p locales/ja
   ```

2. **Copy and translate files:**
   ```bash
   cp locales/en/newtab.json locales/ja/newtab.json
   cp locales/en/settings.json locales/ja/settings.json
   cp locales/en/faq.json locales/ja/faq.json
   cp locales/en/sync.json locales/ja/sync.json
   # Then translate each file
   ```

3. **Add WebExtension manifest locale:**
   ```bash
   mkdir -p public/_locales/ja
   cp public/_locales/en/messages.json public/_locales/ja/messages.json
   # Translate extension name and description
   ```

4. **Update language detection:**
   ```typescript
   // shared/lang.ts
   const supportedLanguages = ['en', 'zh-CN', 'zh-TW', 'zh-HK', 'ja']
   ```

5. **Update settings UI:**
   ```typescript
   // Add to language selector in SettingsPage
   { label: '日本語', value: 'ja' }
   ```

### Updating Dependencies

```bash
# Check outdated packages
pnpm outdated

# Update specific package
pnpm update <package-name>

# Update all packages (careful!)
pnpm update

# After updating, test thoroughly:
pnpm type-check
pnpm lint
pnpm build
```

### Debugging

#### Vue DevTools

Install Vue DevTools browser extension:
- **Chrome:** [Vue.js devtools](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox:** [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

**Enable for extensions:**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Find "Vue.js devtools"
4. Click "Details" → Enable "Allow access to file URLs"

#### Console Logging

```typescript
// Development only
if (import.meta.env.DEV) {
  console.log('[MyComponent]', data)
}

// Production logging (avoid)
// WXT automatically strips console.log in production builds
```

#### WXT DevTools

Access WXT-specific debugging:
```bash
pnpm dev
# Opens browser with extension loaded
# Check WXT console output in terminal
```

---

## Testing & Deployment

### Pre-Release Checklist

- [ ] Run type check: `pnpm type-check`
- [ ] Run linters: `pnpm lint`
- [ ] Test in Chrome: `pnpm dev`
- [ ] Test in Firefox: `pnpm dev:firefox`
- [ ] Test in Edge: `pnpm dev:edge`
- [ ] Verify all features work
- [ ] Test settings migration from previous version
- [ ] Check console for errors/warnings
- [ ] Test on clean profile (no existing settings)
- [ ] Update version in `package.json`
- [ ] Update CHANGELOG.md
- [ ] Create git tag

### Building for Release

```bash
# 1. Update version
# Edit package.json: "version": "2.5.5"

# 2. Build all browsers
pnpm build
pnpm build:firefox
pnpm build:edge

# 3. Create ZIPs
pnpm zip
pnpm zip:firefox
pnpm zip:edge

# 4. Test built extensions
# Load unpacked from .output/chrome-mv3/
# Load unpacked from .output/firefox-mv3/
# Load unpacked from .output/edge-mv3/

# 5. Check ZIP files
ls -lh .output/*.zip
```

### Uploading to Stores

#### Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Upload `.output/chrome-mv3.zip`
3. Fill in store listing (if first time)
4. Submit for review

#### Microsoft Edge Add-ons

1. Go to [Microsoft Partner Center](https://partner.microsoft.com/dashboard)
2. Upload `.output/edge-mv3.zip`
3. Fill in store listing
4. Submit for review

#### Firefox Browser Add-ons

1. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. Upload `.output/firefox-mv3.zip`
3. Fill in store listing
4. Submit for review (may require source code)

---

## Troubleshooting

### Common Issues

#### 1. TypeScript Errors After Dependency Update

```bash
# Clear caches and regenerate types
rm -rf node_modules/.vite
rm -rf .output
pnpm install
pnpm type-check
```

#### 2. Auto-imports Not Working

```typescript
// types/auto-imports.d.ts and types/components.d.ts are auto-generated
// If imports fail, restart TypeScript server in VSCode:
// Cmd+Shift+P → "TypeScript: Restart TS Server"
```

#### 3. Settings Not Persisting

```typescript
// Check if settings store is initialized
import { useSettingsStore } from '@/shared/settings'
const store = useSettingsStore()
await store.load()  // Force reload
```

#### 4. Sync Not Working

```typescript
// Check background worker
// In browser console: chrome.runtime.getBackgroundPage()

// Check sync storage quota
chrome.storage.sync.getBytesInUse(null, (bytes) => {
  console.log('Sync storage used:', bytes, '/ 102400 bytes')
})
```

#### 5. Build Fails

```bash
# Clear output and rebuild
rm -rf .output
pnpm build

# Check for errors in:
# - wxt.config.ts
# - tsconfig files
# - Package.json scripts
```

#### 6. Extension Not Loading in Firefox

Firefox requires different manifest permissions:
- Check `wxt.config.ts` → `manifest` → `firefox` overrides
- Ensure `browser_specific_settings` is set
- Verify minimum Firefox version (128+)

### Performance Issues

#### 1. Slow Extension Load

**Possible causes:**
- Large background images
- Too many bookmarks
- Sync data too large

**Solutions:**
```typescript
// Disable acrylic effect
settingsStore.settings.performance.enableAcrylicEffect = false

// Disable dialog animations
settingsStore.settings.performance.enableDialogAnimation = false

// Reduce bookmark count
settingsStore.settings.shortcut.topSitesCount = 4
```

#### 2. High Memory Usage

**Check:**
- Video wallpapers (use images instead)
- Large local images (compress before upload)
- Search suggestion cache (auto-clears after 5 min)

### Getting Help

1. **Check existing issues:** [GitHub Issues](https://github.com/Redlnn/lemon-new-tab-page/issues)
2. **WXT Documentation:** [WXT Docs](https://wxt.dev/)
3. **Vue 3 Documentation:** [Vue 3 Docs](https://vuejs.org/)
4. **Element Plus:** [Element Plus Docs](https://element-plus.org/)

---

## Important Notes for AI Assistants

### What to AVOID

1. **DO NOT** use `npm` or `yarn` - this project uses **pnpm exclusively**
2. **DO NOT** modify settings schema without creating migration
3. **DO NOT** add emojis to code/commits unless explicitly requested
4. **DO NOT** skip type checking before committing
5. **DO NOT** break existing settings migration chain
6. **DO NOT** remove i18n strings without updating all languages
7. **DO NOT** commit auto-generated files (`auto-imports.d.ts`, `components.d.ts`)

### What to ALWAYS DO

1. **ALWAYS** test in all 3 browsers (Chrome, Firefox, Edge)
2. **ALWAYS** add translations for new UI strings
3. **ALWAYS** update CHANGELOG.md for user-facing changes
4. **ALWAYS** preserve backward compatibility for settings
5. **ALWAYS** use TypeScript strict mode
6. **ALWAYS** follow Gitmoji commit convention
7. **ALWAYS** use `<script setup lang="ts">` for Vue components
8. **ALWAYS** validate user input (XSS prevention)

### Code Quality Standards

- **TypeScript:** No `any` types, no `@ts-ignore` without justification
- **Vue:** Prefer Composition API, avoid Options API
- **Reactivity:** Use `ref` and `computed`, avoid direct mutations
- **Performance:** Lazy load heavy components, debounce expensive operations
- **Security:** Sanitize user input, validate URLs, use DOMPurify for HTML

### Settings Migration Rules

**NEVER break the migration chain:**
```
v1 → v2 → v3 → v4 → v5 → v6 → v7 → v8 (your new version)
```

**Each migration file must:**
1. Accept previous version interface
2. Return current version interface
3. Set new `settingsSchemaVersion`
4. Provide defaults for new fields
5. Preserve all existing user data

---

## Quick Reference

### Useful Paths

| Purpose | Path |
|---------|------|
| Settings Schema | `shared/settings/types/index.ts` |
| Default Settings | `shared/settings/default.ts` |
| Settings Store | `shared/settings/settingsStore.ts` |
| Main Entry | `entrypoints/newtab/main.ts` |
| Background Worker | `entrypoints/background/index.ts` |
| i18n Config | `shared/i18n.ts` |
| WXT Config | `wxt.config.ts` |
| Type Definitions | `types/` |

### Key Files to Check Before Changes

1. `package.json` - Dependencies and scripts
2. `wxt.config.ts` - Extension manifest and build config
3. `shared/settings/default.ts` - Default settings
4. `shared/settings/types/index.ts` - Settings interface
5. `locales/*/` - All translation files
6. `CHANGELOG.md` - Version history

### Environment Variables

None currently used. All configuration is in `wxt.config.ts`.

---

**Document Version:** 1.0
**Compatible with:** Lemon New Tab Page v2.5.4+
**Last Reviewed:** 2025-11-14

For questions or updates to this document, please create an issue or pull request on GitHub.
