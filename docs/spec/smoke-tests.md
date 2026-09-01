## End to end tests

## Plugin lifecycle

- [x] Plugin loads without console errors on Obsidian startup (the new 1.13 API against your bundled main.js).
- [x] Disable and re-enable the plugin; settings survive.

## Settings UI (React 19.2 + react-dom)

- [x] Open the settings tab; all command configs render.
- [x] Add a new command, edit each field, delete a command; changes persist after closing settings.
- [x] Trigger a validation error (e.g. invalid pattern) and confirm the error displays.

## Command execution (obsidian API surface)

- [x] Run a command where the target file already exists; it opens.
- [x] Run a command where the file is missing and has a timeshift & previous note as template - eg next week todo; it's created from the template in the right folder.

## File pickers (use-file-picker / file-saver)

- [x] Export settings; a file downloads with valid JSON.
- [x] Import that file back; commands reappear intact.
