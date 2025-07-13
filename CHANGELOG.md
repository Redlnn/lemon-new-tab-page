# Changelog

> Translated by ChatGPT from Chinese.

## 2.2.3 (07/13/2025)

### Optimization

- Automatically hide the pinned icon when `Show Most Visited` is turned off

### Fixes

- Fixed the issue where previously displayed Most Visited items were not removed after turning off `Show Most Visited`
- Fixed the issue of high CPU usage during window resizing
- Fixed an issue where wallpapers would change on other clients due to cloud sync
  > Since local images are limited by storage size and online images are restricted by
  > permissions, wallpapers cannot be synced, so wallpaper-related data will not be synced

## 2.2.2 (07/10/2025)

### Optimization

- Adjusted background image loading timing to minimize visibility of the loading process

### Fixes

- Fixed a flickering issue that occurred during each load when the background mask was enabled

## 2.2.1 (07/07/2025)

### Fixes

- Fixed an issue where the local background selection box style was not applied

## 2.2.0 (07/07/2025)

### Features

- Added toggle for switching between day and night mask colors.
- Added reminder for items that do not support cloud synchronization.
- Implemented cloud synchronization for settings and bookmarks. The following features do not support synchronization:
  - Local or online background images
  - Most visited sites (including ignored sites)
  - Dark mode and system-following status, etc.

### Optimization

- Refactored a large amount of code.
- Updated and completed translations.

### Fixes

- Fixed the issue where the background mask color did not take effect.
- Fixed the issue where the default font did not apply for English systems.
- Fixed the issue where Element components always used zhCn for i18n.
- Prevented the description of the YiYan switch from being too long in English environments.

## 2.1.0 (06/07/2025)

### Optimization

- Set the clock font to monospace for improved visual appearance.
- Adjusted font selection order to enhance aesthetics.
- When manually adding a shortcut, pressing Enter now submits it to improve user experience.
- Reduced background opacity of the pin icon on pinned shortcuts to improve visual
  appearance.
- Adjusted CSS order and removed component restrictions to reduce extension size.
- Refactored most of the JS and some CSS to improve performance.
  - Fixed bugs related to configuration upgrades.
  - Replaced axios with fetch API to reduce size.
  - Implemented background change animations with new syntax.
  - Fixed spelling errors.
  - Thanks to Copilot for assistance.

### Fixes

- Fixed an issue where Latin text for some Linux users was falling back to emoji fonts.

### Others

- Refactored code to improve readability.

## 2.0.0 (03/20/2025)

**Important**: Major version upgrade, please carefully read the following changelog.

### Known Issues

- Some Windows devices may experience a freeze on startup when setting the
  Chromium-based browser’s homepage. The solution can be found in the
  [README](/README.md#已知问题).

### Features

- Optimized performance to improve opening speed and avoid lag in certain situations.
- Pinned quick access links can now be reordered by dragging.
- Refactored the layout style of the quick access area for better compatibility.
  Due to this refactoring, some existing settings may have been reset.
  We apologize for any inconvenience.
- Refactored configuration storage and internal version iterations.
  Due to this, some existing settings may be misaligned during configuration upgrades.
  We apologize for any inconvenience.
- Added options for “using white font in light mode for quick access” and “icon spacing”.
  The original “icon width” setting has been changed to “icon size”.
- "Adjust the page's responsive styles to prevent misalignment when shrinking the browser,
  thus supporting use on narrow-screen devices
  (unfortunately, Firefox mobile add-ons cannot replace the new tab page).
- Default search engine is now Bing.

### Fixes

- Fixed an issue where the search box could not lose focus by clicking the original
  quick access area after expanding.
- Applied clock font settings to the YiYan (a line of Chinese poetry) to improve
  page appearance in dark mode.
- Fixed an issue where clicks on some areas of the quick launch submenu did not work.
- Fix auto focus search box not working (unfortunately Chrome prioritizes address bar).

## 1.8.1 (03/05/2025)

### Fixes

- Fixed the issue that background color does not follow system (or browser)
  when JS is not loaded (#19)
- Fixed the logic and animation issues of "Dark mode" and "Follow system" switch</li>

## 1.8.0 (01/05/2025)

### Features

- You can now use online image APIs as wallpaper.
- Added a toggle for dark clock font.

## 1.7.0 (12/17/2024)

### Features

- **Updated default theme colors and icons.**
- Improved translation for zh_tw.
- Added transition effects when switching background types. However, users with slow internet or low-performance devices may still notice the new background image appearing abruptly.
- Enhanced the display effect for solid color backgrounds (when the background type is set to "None").
  - Clock font color now inverts on solid color backgrounds.
  - The search box background is now static pure white with an added outline.
  - Added the option to disable shadows for the clock, search box, and quick access area.

### Improvements

- Adjusted the timing of background loading to avoid freezing the page when fetching the background.
- Standardized animation durations for a smoother experience.
- Did not display the container for the quote when it was unavailable.
- Show error message when failing to get Bing wallpaper.

### Fixes

- Fixed the issue where wallpaper preview did not display after switching wallpaper types multiple times in the settings page.

## 1.6.1 (12/12/2024)

### Features

- Now the search box can automatically focus when opening the new tab (disabled by default).

### Fixes

- Fixed the issue where the Quick Start area would flicker when loading the new tab page.
- Optimized the style of the "Add New Shortcut" button by reducing its opacity when the mouse is not hovering over it.

## 1.6.0 (10/09/2024)

### Features

- Added support for customizing icons when adding pinned access.
- You can now open the changelog again via the right-click settings button.
- Improved visual experience when the color mode is set to follow the system.
- Updated the default theme color and optimized the appearance of some components.

### Fixes

- Fixed the issue where the browser would redirect Bing to the national region.
  > To restore non-national region access, you need to clear the \*.bing.com cookies in your browser.
- Reduced CPU usage
- Moved the settings initialization phase earlier to avoid seeing the default settings state when opening a new tab.

## 1.5.4 (09/18/2024)

### Features

- Added support for displaying the date and Chinese lunar calendar.
- Brand new settings window and changelog window.
- Using <www.bing.com> instead of cn.bing.com to avoid redirection when using Bing.
- Now you can change the background mask color.
- Now you can disable the background of the quick access area.
- Optimized the position of the search bar after closing the quick access area.
- [Firefox] Now supports setting it as the homepage (#12).

### Fixes

- Now the search engine dropdown in the settings page can display the full name of Google.
- Fixed the issue where the background blur was set to a fixed value when focusing the search bar.
- Fixed the issue of browser freezing, high CPU usage, and memory leaks when using local images as backgrounds.

## 1.5.3 (09/07/2024)

### Features

- Partial refactor to support Firefox browser.
- Supports caching of Bing's daily image.
- Added transition animation for local backgrounds or cached Bing wallpapers.
- Optimized the display of the 12-hour clock format.
- [i18n] Internationalization support.

### Fixes

- Fixed the issue where unpinning did not take effect.
- Fixed the issue where frequently visited sites could not be deleted (#8).
- Fixed the issue where the "Enable Most Visited" switch did not work.
- Fixed the issue where duplicate bookmarks appeared after hiding most visited.
- Hid Chrome-specific hints in Firefox browser.
- Fixed the issue where search suggestion API candidates and icons could not be displayed.
- Remove Herobrine

> For earlier update logs, please refer to the commit history
