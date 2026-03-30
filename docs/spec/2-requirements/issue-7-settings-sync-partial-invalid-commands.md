# Bug: External Settings Reload Discards All Commands When Any Command Is Invalid

## Problem Statement

When an external settings change is detected (e.g. via Obsidian Sync) and the settings file
contains at least one invalid command, the plugin discards all commands — including valid ones —
and replaces the entire configuration with the single built-in default command.

The user sees: `Settings file is invalid. Using defaults.`

This can be triggered by adding a new command in the settings tab (which writes an empty/invalid
command to `data.json`), then receiving an external sync event before finishing the configuration.

## Root Cause

In `src/settings/common/parseSettings.ts`, the `validationResult.fold()` failure callback
returns `CreateOrOpenFilePluginSettings.DEFAULT` unconditionally:

```typescript
return validationResult.fold(
	(validSettings) => validSettings,
	(errors) => {
		new Notice('Settings file is invalid. Using defaults.')
		return CreateOrOpenFilePluginSettings.DEFAULT // discards all commands
	},
)
```

`ValidationResult` already stores per-command error indices in its `errors` array
(`error.commandIndex`), so the information required to filter out only the invalid commands
is available without any additional data collection.

## Current Behaviour

Given settings with:

- Command A (valid)
- Command B (invalid — e.g. empty commandName)
- Command C (valid)

After an external reload, the plugin registers only the built-in example command, and Commands A
and C are lost until the user manually restores them.

## Desired Behaviour

Given settings with:

- Command A (valid)
- Command B (invalid)
- Command C (valid)

After an external reload, the plugin:

1. Removes Command B (the invalid one)
2. Preserves and registers Commands A and C
3. Shows a targeted notice: e.g. `1 invalid command(s) removed. Valid commands reloaded.`

## Acceptance Criteria

1. Given a settings file containing 2 valid commands and 1 invalid command, when external
   settings are reloaded, then the 2 valid commands are registered and the invalid command
   is silently dropped.

2. Given a settings file where all commands are invalid, when external settings are reloaded,
   then the DEFAULT settings are used and the notice `Settings file is invalid. Using defaults.`
   is shown (existing behaviour preserved for total failure).

3. Given a settings file where all commands are valid, when external settings are reloaded,
   then all commands are preserved — no regression from current behaviour.

4. Given a settings file with a structurally malformed root object (not a valid settings
   shape), when settings are reloaded, then DEFAULT is used and the appropriate error notice
   is shown.

5. The notice shown when some commands are removed is distinct from the notice shown when
   all settings are invalid, so the user can tell which case occurred.

6. The `settings-reloaded` event fired in `main.ts` carries the filtered (valid-only) settings,
   so the settings tab UI reflects the same state as the registered commands.

## Edge Cases

- Single command which is invalid: fall back to DEFAULT (one example command).
- Empty `openOrCreateCommandConfigs` array: fall back to DEFAULT.
- Root-level structural failure (`isImportedSettings` guard fails): fall back to DEFAULT
  as today — there is no command list to filter.
- Mix of root-level errors and per-command errors: treat as total failure and use DEFAULT
  (root errors mean the shape is unrecoverable).

## Out of Scope

- Preserving partially-filled invalid commands so the user can finish editing them after a sync.
- UI-level conflict resolution between devices.
- Blocking a save from the settings tab when a command is in an invalid state.

## Proposed Fix Approach

In `parseSettings.ts`, change the failure path of `validationResult.fold()` to:

1. Collect the set of invalid command indices from the errors.
2. Filter `settingsJSON.openOrCreateCommandConfigs` to remove commands at those indices.
3. If the filtered list is non-empty, construct and return settings from the valid commands
   only, and show a notice indicating how many commands were dropped.
4. If the filtered list is empty, fall back to DEFAULT as today.

No changes are required to `ValidationResult`, `validateSettings`, or the command registration
logic — the fix is isolated to `parseSettings`.
