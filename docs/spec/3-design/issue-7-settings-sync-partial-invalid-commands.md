# Design: Partial Invalid Command Handling During Settings Reload

## Overview

When settings are loaded and some (but not all) commands fail validation, preserve the valid
commands rather than discarding everything and falling back to the built-in default. The fix
is isolated to a single file (`parseSettings.ts`) with no changes required to the validation
layer, models, or `main.ts`.

## Technical Approach

### Decision: Fix in `parseSettings`, not in the validation layer

Two locations could house this logic:

Option A — change `validateSettings` to filter out invalid commands before returning.

Option B — change `parseSettings` to filter in the failure callback, using the `settingsJSON`
already in scope as a closure variable.

Option A would mix filtering concerns into the validation layer, which should only report
errors. The validation layer is also used by the settings UI to drive inline error messages;
changing its output shape would require UI updates too.

Option B is chosen. `parseSettings` is the correct place because it is the policy layer —
it already decides what to do when validation fails. The `settingsJSON` variable is already
in scope at the point of the failure callback, so no additional data threading is required.

### New Helper: `buildSettingsFromValidCommands`

A pure helper function is extracted to keep `parseSettings` within the 15-line limit and
to make the filtering logic independently testable.

```typescript
function buildSettingsFromValidCommands(
	errors: ValidationErrors,
	settingsJSON: CreateOrOpenFilePluginSettingsJSON,
): CreateOrOpenFilePluginSettings | null {
	const hasRootError = errors.getAll().some((e) => e.commandIndex === undefined)
	if (hasRootError) return null

	const invalidIndices = new Set(errors.getAll().map((e) => e.commandIndex as number))
	const validCommands = settingsJSON.openOrCreateCommandConfigs.filter(
		(_, i) => !invalidIndices.has(i),
	)

	if (validCommands.length === 0) return null

	return CreateOrOpenFilePluginSettings.fromJSON({
		...settingsJSON,
		openOrCreateCommandConfigs: validCommands,
	})
}
```

`null` means "cannot recover any valid commands" — the caller falls back to DEFAULT.

### Updated Failure Callback in `parseSettings`

```typescript
return validationResult.fold(
	(validSettings) => validSettings,
	(errors) => {
		const partial = buildSettingsFromValidCommands(errors, settingsJSON)
		if (partial !== null) {
			const removedCount = new Set(
				errors
					.getAll()
					.map((e) => e.commandIndex)
					.filter((i): i is number => i !== undefined),
			).size
			new Notice(`${removedCount} invalid command(s) removed. Valid commands loaded.`)
			return partial
		}
		console.error('[Settings] Invalid settings:', errors.getErrorSummary())
		new Notice('Settings file is invalid. Using defaults.')
		return CreateOrOpenFilePluginSettings.DEFAULT
	},
)
```

## Root Error vs Per-Command Error

`ValidationErrors` carries two distinct error shapes:

- Root error: produced by `validateSettings` when `isImportedSettings` fails (structural failure).
  These errors have `commandIndex === undefined`.
- Per-command error: produced by `validateCommand`. These errors always have a numeric
  `commandIndex`.

`buildSettingsFromValidCommands` returns `null` immediately when any root error is present,
preserving the current "Using defaults" behaviour for structurally malformed files.

## Data Flow (updated)

```
onExternalSettingsChange()
    ↓
parseSettings(loadData)
    ↓
migrateAndApplyDefaults(data) → settingsJSON
    ↓
validateSettings(settingsJSON) → ValidationResult
    ↓ fold
    ├─ isValid=true  → return validSettings (unchanged)
    └─ isValid=false
           ↓
           buildSettingsFromValidCommands(errors, settingsJSON)
           ├─ root error present       → null
           ├─ all commands invalid     → null
           └─ some commands valid      → CreateOrOpenFilePluginSettings (valid commands only)
                    ↓                              ↓
             Notice "Using defaults"    Notice "N invalid command(s) removed"
             return DEFAULT             return partial settings
                                               ↓
                                        main.ts: this.settings = partial
                                        registerCommands(validConfigs only)
                                        settingsEvents.trigger('settings-reloaded', partial)
                                        UI updates via useSettings hook
```

## Architecture Decisions

### No changes to `ValidationResult` or `ValidationErrors`

Both classes already expose all the data needed (`errors` array with `commandIndex`).
Adding a convenience method (e.g. `getInvalidCommandIndices()`) to `ValidationErrors`
would only benefit this one call site and is not warranted for a bug fix.

### No changes to `main.ts`

The filtered `CreateOrOpenFilePluginSettings` returned by `parseSettings` flows through
`main.ts` unchanged: `this.settings` is updated, `registerCommands` is called with only
the valid configs, and `settings-reloaded` fires with the filtered settings. The settings
tab UI receives the filtered settings and displays only valid commands.

### No changes to the initial load path

`parseSettings` is called both at startup and during external reload. The fix applies
equally to both cases, which is the correct behaviour — a corrupt file should never
silently wipe all valid commands regardless of when it is loaded.

### Notice wording

| Scenario                           | Notice                                                    |
| ---------------------------------- | --------------------------------------------------------- |
| Some commands invalid              | `"N invalid command(s) removed. Valid commands loaded."`  |
| All commands invalid or root error | `"Settings file is invalid. Using defaults."` (unchanged) |
| Load exception                     | `"Failed to load settings. Using defaults."` (unchanged)  |

## Files Modified

1. `src/settings/common/parseSettings.ts`
   - Add `buildSettingsFromValidCommands` helper function (~12 lines)
   - Update failure callback in `parseSettings` to call helper and branch (~10 lines)

No other files require changes.

## Testing Strategy

Tests live alongside the existing `parseSettings` tests. Follow existing unit test rules
(nested describe, "does X when Y" naming, Arrange-Act-Assert, 100% branch coverage).

New test cases for `buildSettingsFromValidCommands`:

- does return null when errors contain a root-level error (commandIndex undefined)
- does return null when all commands are invalid
- does return null when the valid commands list is empty after filtering
- does return settings containing only valid commands when some commands are invalid
- does preserve command order when filtering

New test cases for `parseSettings` (failure path):

- does return valid commands and show targeted notice when settings contain some invalid commands
- does return DEFAULT and show "Using defaults" notice when all commands are invalid
- does return DEFAULT and show "Using defaults" notice when settings have a root structural error
- does return DEFAULT and show error notice when loadData throws (unchanged, regression guard)
