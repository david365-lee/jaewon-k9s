# Changelog

## 0.1.9 - 2026-10-24

- Add precise wheel zoom in the K9s sidebar: accumulate 120px of normalized wheel input, change by 1px, and limit rapid bursts to one change per 180ms.
- Add exact font-size entry and +/-/Reset controls. Font size affects all integrated terminals.
- Disable native terminal Ctrl+wheel zoom by default; explicit user overrides remain respected. VS Code does not expose terminal wheel events to extensions.
- Render icon.png directly from icon.svg and use the same PNG for the publisher icon asset.


## 0.1.8 — 2026-10-24

- Register a dedicated Jaewon K9s Activity Bar container and an Open K9s launcher.
- Include the monochrome terminal SVG for the Activity Bar and matching PNG/SVG package artwork.


## 0.1.7 — 2026-10-24

- Consolidate Windows rendering fixes: initialize UTF-8 before K9s, enforce single-cell ambiguous characters, and use full-color output by default.
- Keep legacy 16-color console output optional and clarify that changes apply to newly launched terminals.
- Document K9s prompt icons and the native `k9s.ui.noIcons: true` option without modifying user configuration automatically.
- Update Korean, English, Japanese, and Simplified Chinese READMEs, Marketplace descriptions, and settings translations.
- Preserve the unified searchable context picker with type, current context, cluster, and API endpoint details.

Validation: 8 automated tests; Korean Windows user confirmed borders and prompt display after applying the documented K9s configuration.

## 0.1.6

- Explicitly use narrow ambiguous-character widths on Windows (`RUNEWIDTH_EASTASIAN=0`) to match VS Code's terminal grid, independently of the inherited console code page.

## 0.1.5

- Set the Windows console input and output code pages to UTF-8 before starting K9s, preventing CP949 box-drawing width mismatches.
- Restore full-color output by default; legacy 16-color console compatibility remains optional.

## 0.1.4

- Enable Windows console compatibility output for new K9s terminals to work around VT rendering corruption.
- Add a setting to opt out and restore full-color output. Other platforms are unchanged.

## 0.1.3

- Replace the two-step context-type and context selection with one searchable picker.
- Show local/remote type, current-context status, cluster, and API endpoint in each picker item.
- Update the multilingual usage and Marketplace update documentation.

## 0.1.2

- Fix Marketplace README links by pointing language guides, icon files, and license details to stable GitHub URLs.

## 0.1.1

- Refresh the extension icon with a transparent background and clear lowercase `k9s` wordmark.
- Add a friendly MIT License and South Korean creator note to the localized Marketplace descriptions.

## 0.1.0

- Add local, remote, and all-context selection for the VS Code integrated terminal.
- Add K9s terminal zoom commands and Ctrl+mouse-wheel zoom support.
- Add localized metadata and prompts for Korean, English, Japanese, and Simplified Chinese.
- Prepare a transparent 128×128 icon and Marketplace publishing documentation.
