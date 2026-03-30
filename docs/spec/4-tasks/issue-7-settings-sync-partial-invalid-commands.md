# Tasks: Partial Invalid Command Handling During Settings Reload

- [x] Add `buildSettingsFromValidCommands` helper to `src/settings/common/parseSettings.ts`
- [x] Update failure callback in `parseSettings` to use the helper
- [x] Add test: does return valid commands and show targeted notice when some commands are invalid
- [x] Add test: does return default settings when all commands are invalid (regression guard)
- [x] Add test: does return default settings when a root structural error is present
- [x] Run full test suite and confirm all tests pass
- [x] Mark feature complete in `docs/spec/2-requirements/0-index.md`
