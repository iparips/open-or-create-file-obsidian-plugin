# Settings Configuration and Migration

Files:

- `src/settings/common/configureDefaultsAndValidateSettings.ts`
- `src/settings/common/parseSettings.ts`

Purpose: Settings initialization, migration, and validation with backward compatibility

## Key Functions

### 1. configureDefaultsAndValidateSettings()

Plugin startup initialization

Flow:

- Load settings from disk
- Migrate old format via `parseSettings()`
- Apply defaults for missing optional fields
- Validate all settings
- Return validated settings or fallback to defaults
- Display notices for validation failures

### 2. parseSettings()

Settings parsing with migration

Responsibilities:

- Accepts callback to load settings JSON
- Migrates old field names (`commandConfigs` → `openOrCreateCommandConfigs`)
- Applies defaults via `migrateAndApplyDefaults()`
- Validates complete settings
- Used by both initialization and import flows
- Handles all error logging internally

### 3. migrateAndApplyDefaults()

Ensures backward compatibility

Details:

- Adds missing optional fields: `templateFilePath`, `timeShift`, `usePreviousNoteAsTemplate`
- Ensures old settings files work with new versions

## Location Rationale

Located in `common/` because handles plugin-wide settings infrastructure, not specific to open-or-create feature

## Usage

- Plugin initialization: `configureDefaultsAndValidateSettings()` calls `parseSettings()`
- Settings import: `ActionsHeader` calls `parseSettings()` with file content callback
