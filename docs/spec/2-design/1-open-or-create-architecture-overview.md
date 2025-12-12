# Architecture Overview

## Purpose

This document provides a high-level overview of the Open or Create File Obsidian Plugin architecture. It is intended for LLMs to understand the system structure before planning changes.

## System Overview

The plugin enables users to create custom Obsidian commands that open or create files based on configurable date-based patterns and templates. It automates creation of daily notes, weekly plans, and other regularly used documents.

## Core Components

### 1. Plugin Entry Point (`src/main.ts`)

Class: `CreateOrOpenFilePlugin`

Responsibilities:

- Plugin lifecycle management (load/unload)
- Settings persistence and synchronisation
- Dynamic command registration/unregistration
- Handles external settings changes (from Obsidian Sync)

Key Methods:

- `onload()`: Initializes settings and registers commands
- `registerCommands()`: Dynamically creates Obsidian commands from config
- `unregisterCommands()`: Removes all plugin commands
- `updateSettings()`: Persists settings and re-registers commands
- `onExternalSettingsChange()`: Handles settings sync with debouncing

Dependencies:

- `CreateOrOpenFileSettingsTab`: Settings UI
- `createOrOpenFileCommandCallback`: Command execution logic
- `ObsidianAdapter`: Obsidian API abstraction
- `configureDefaultsAndValidateSettings`: Settings initialisation

### 2. Command Execution Layer (`src/command/`)

#### 2.1 Command Callback (`commandCallback.ts`)

Function: `createOrOpenFileCommandCallback()`

Flow:

1. Parse time shift configuration
2. Build note file path from patterns + time shift
3. Resolve template (static template OR previous note)
4. Delegate to `NoteCreator` to open/create file
5. Display result notice to user

Key Logic:

- `buildNoteFilePath()`: Constructs full file path using patterns
- `resolveTemplatePath()`: Determines template source (static file or previous note)

#### 2.2 Path Segment Builder (`pathSegmentBuilder.ts`)

Class: `PathSegmentBuilder`

Purpose: Replaces date placeholders in patterns with formatted date values

Supported Placeholders:

- `{year}` → 4-digit year (e.g., "2025")
- `{month}` → 2-digit month (e.g., "06")
- `{day}` → 2-digit day (e.g., "07")
- `{date}` → ISO date (e.g., "2025-06-07")
- `{time}` → HH-mm-ss format (e.g., "14-30-45")
- `{week}` → ISO week number (e.g., "23")
- `{dow}` → Day of week abbreviation (e.g., "Sat")

Key Method:

- `build()`: Applies time shift, then replaces all placeholders in pattern

Dependencies: `date-fns` library for date manipulation

#### 2.3 Time Shift (`timeShift.ts`)

Class: `TimeShiftParser`

Purpose: Parses user-specified time shifts like "+1 day" or "-2 weeks"

Format: `[+|-]N unit` where unit is day(s), week(s), month(s), year(s)

Enum: `TimeShiftUnit` (Day, Week, Month, Year)

Type: `TimeShift { amount: number, unit: TimeShiftUnit }`

#### 2.4 Previous Note Candidate Finder (`previous-note-candidate-finder/`)

Class: `PreviousNoteCandidatesFinder`

Purpose: Generates candidate paths for finding previous notes to use as templates

Algorithm:

1. Detect time granularity from patterns (daily, weekly, monthly, yearly)
2. If command has time shift, its unit overrides detected granularity
3. Generate up to 10 candidate paths going backwards in time
4. First existing file becomes the template

Key Components:

- `TimeShiftUnitDetector`: Detects granularity from placeholders in patterns
- `range()`: Utility for generating number sequences

Limitation: Time shift unit override can cause unexpected behavior (documented in README.md:99-106)

### 3. Note Management Layer (`src/notes/`)

#### 3.1 Note Creator (`noteCreator.ts`)

Class: `NoteCreator`

Purpose: High-level note operations (open existing or create new)

Method: `openOrCreateFileFromTemplate(noteFilePath, templateFilePath?)`

Logic:

1. Check if note exists
2. If exists: open it
3. If not: create from template, then open

#### 3.2 Obsidian Adapter (`obsidianAdapter.ts`)

Class: `ObsidianAdapter`

Purpose: Abstraction layer over Obsidian API for testability

Key Methods:

- `openFile()`: Opens file using Obsidian workspace API
- `doesFileExist()`: Checks vault for file existence
- `createFileAndFolder()`: Creates parent folders + file from template
- `getTemplateContentOrEmpty()`: Loads template content or returns empty string
- `loadTemplateContent()`: Reads template file from vault

Design Pattern: Adapter pattern for dependency injection and testing

### 4. Settings Layer (`src/settings/`)

#### 4.1 Settings Tab (`CreateOrOpenFileSettingsTab.ts`)

Class: `CreateOrOpenFileSettingsTab`

Purpose: Obsidian settings UI integration using React

Lifecycle:

- `display()`: Renders React component into Obsidian container
- `hide()`: Validates settings and unmounts React root

React Integration: Uses `react-dom/client` with `createRoot()`

#### 4.2 Settings Component (`components/index.tsx`)

Component: `SettingsComponent`

Architecture: React with local state management

State:

- `localSettings`: In-memory settings copy for UI updates
- `validationResult`: Real-time validation feedback

Key Features:

- Real-time validation on settings changes
- Import/Export functionality via `ActionsHeader`
- Individual command cards via `CommandCard`
- Validation summary via `ValidationSummary`
- Settings sync event handling (external changes from Obsidian Sync)

Child Components:

- `ActionsHeader`: Import/Export/Add command buttons
- `CommandCard`: Individual command configuration UI
- `SettingInput`: Text input with validation
- `SettingToggle`: Boolean toggle
- `ValidationSummary`: Aggregated validation errors

#### 4.3 Settings Configuration (`configureDefaultsAndValidateSettings.ts`)

Function: `configureDefaultsAndValidateSettings()`

Purpose: Settings initialization with validation and backward compatibility

Flow:

1. Load settings from disk
2. Apply defaults for missing optional fields
3. Validate all settings
4. Return validated settings or fallback to defaults
5. Display notices for validation failures

#### 4.4 Validation System (`utils/validation/`)

Core Files:

- `validateSettings.ts`: Top-level settings validation
- `validateField.ts`: Field-level validation rules
- `validationResult.ts`: Validation result wrapper
- `validations.ts`: Reusable validation functions
- `typeGuards.ts`: TypeScript type guards

Validation Rules:

- `required`: Non-empty string
- `endsWithMd`: Optional field ending in .md
- `requiredAndEndsWithMd`: Required field ending in .md
- `timeShift`: Valid time shift format

Architecture: Rule-based validation with composable validators

### 5. Type System (`src/types.ts`)

Key Types:

```typescript
CommandConfig {
  commandName: string
  templateFilePath?: string
  destinationFolderPattern: string
  fileNamePattern: string
  timeShift?: string
  usePreviousNoteAsTemplate?: boolean
}

CreateOrOpenFilePluginSettings {
  commandConfigs: CommandConfig[]
}

ValidationError {
  field: string
  fieldDisplayName: string
  message: string
  commandIndex?: number
}
```

## Data Flow

### Command Execution Flow

```
User triggers command
  ↓
main.ts: Command callback created during registration
  ↓
commandCallback.ts: Parse config + time shift
  ↓
pathSegmentBuilder.ts: Build destination path with date placeholders
  ↓
(IF usePreviousNoteAsTemplate)
  ↓
  previous-note-candidate-finder: Generate candidate paths
  timeShiftUnitDetector: Detect granularity
  ↓
  Iterate candidates until existing file found
  ↓
noteCreator.ts: Check if file exists
  ↓
(IF exists)
  obsidianAdapter: Open file
(ELSE)
  obsidianAdapter: Load template → Create folders → Create file → Open file
  ↓
Display result notice
```

### Settings Update Flow

```
User edits settings in UI
  ↓
SettingsComponent: Update local state
  ↓
SettingsComponent: Call updatePluginSettings()
  ↓
main.ts: updateSettings() method
  ↓
Save to disk (data.json)
  ↓
Unregister old commands
  ↓
Register new commands
  ↓
(IF external change via Obsidian Sync)
  ↓
  main.ts: onExternalSettingsChange() with debouncing
  ↓
  Trigger 'settings-reloaded' event
  ↓
  SettingsComponent: useEffect updates local state
```

## Key Design Decisions

### 1. Dynamic Command Registration

Commands are registered dynamically based on settings:

- Allows unlimited custom commands
- Commands can be added/removed without code changes
- Each command gets unique ID (index-based)

Trade-off: Commands must be unregistered and re-registered on settings changes

### 2. React for Settings UI

Settings tab uses React instead of Obsidian's imperative API:

- Better state management
- Component reusability
- Easier validation feedback

Trade-off: Larger bundle size, React dependency

### 3. Time Shift Unit Override

When time shift is specified, its unit overrides detected granularity:

- Simplifies implementation (single unit throughout)
- Can cause unexpected behavior (documented limitation)

Future consideration: Allow independent time shift and search granularity

### 4. Backward Compatibility

`configureDefaultsAndValidateSettings()` applies defaults for new optional fields:

- Ensures old settings files work with new versions
- Uses `Object.assign()` to merge defaults with stored config

### 5. Validation Separation

Validation logic separated from UI components:

- Pure validation functions (no React dependencies)
- Reusable across settings tab and initialization
- Easier to test

## Testing Architecture

### Test Support (`src/test-support/`)

- `__mocks__/obsidian.ts`: Mock Obsidian API for unit tests

### Test Organisation

Tests colocated with source code in `__tests__/` directories:

- `command/__tests__/`: Path building and candidate finding
- `notes/__tests__/`: Note creation logic
- `settings/__tests__/`: Validation and settings management
- `settings/components/__tests__/`: React component tests

### Testing Libraries

- Vitest: Test runner (configured in package.json)
- @testing-library/react: React component testing
- happy-dom/jsdom: DOM environment for tests

## Dependencies

### Production Dependencies

- obsidian: Obsidian API (plugin platform)
- date-fns: Date manipulation and formatting
- react/react-dom: Settings UI framework
- file-saver: Export settings as JSON
- use-file-picker: Import settings from JSON

### Development Dependencies

- typescript: Type safety
- esbuild: Bundler (via Bun)
- vitest: Test framework
- eslint/prettier: Code quality
- @testing-library/react: Component testing

## File Organization

```
src/
├── main.ts                      # Plugin entry point
├── types.ts                     # Shared TypeScript types
├── command/                     # Command execution logic
│   ├── commandCallback.ts       # Command handler
│   ├── pathSegmentBuilder.ts    # Date pattern replacement
│   ├── timeShift.ts             # Time shift parsing
│   └── previous-note-candidate-finder/  # Previous note search
├── notes/                       # Note management
│   ├── noteCreator.ts           # High-level note operations
│   └── obsidianAdapter.ts       # Obsidian API abstraction
├── settings/                    # Settings management
│   ├── CreateOrOpenFileSettingsTab.ts  # Obsidian settings integration
│   ├── components/              # React UI components
│   ├── utils/validation/        # Validation logic
│   └── configureDefaultsAndValidateSettings.ts
└── test-support/                # Test utilities
```

## Extension Points

When adding new features, consider these extension points:

### 1. New Date Placeholders

- Add to `PATTERN_UNITS` in `pathSegmentBuilder.ts`
- Add format case in `formatPlaceholder()`
- Update `TimeShiftUnitDetector` if it affects granularity

### 2. New Validation Rules

- Add to `VALIDATIONS` in `validateField.ts`
- Add to `buildFieldValidations()` for specific fields
- Update validation tests

### 3. New Command Configuration Fields

- Add to `CommandConfig` type in `types.ts`
- Add to `DEFAULT_COMMAND_CONFIG` in `configureDefaultsAndValidateSettings.ts`
- Add UI component in `CommandCard.tsx`
- Add validation rules if needed

### 4. New Template Sources

- Modify `resolveTemplatePath()` in `commandCallback.ts`
- Add new resolution strategy
- Update `CommandConfig` with new options

### 5. Settings Import/Export Formats

- Modify `ActionsHeader.tsx` component
- Add new file type support
- Update validation for new format

## Performance Considerations

### 1. Debounced External Settings Changes

`onExternalSettingsChange()` uses 100ms debounce to prevent excessive reloads during Obsidian Sync

### 2. Command Registration Efficiency

Commands only unregistered when previously registered (tracked by `hasRegisteredCommands`)

### 3. Previous Note Search Limit

Candidate search limited to 10 attempts to prevent excessive filesystem checks

### 4. Validation Performance

Validation runs on every settings change in React component (acceptable for typical command count)

## Security Considerations

### 1. Path Normalization

All file paths normalized via `normalizePath()` to prevent directory traversal

### 2. Template File Validation

Template files must exist and be readable before use

### 3. Settings Validation

All settings validated before use to prevent invalid state

## Future Architecture Considerations

Based on existing design docs (`docs/spec/2-design/`):

1. Settings Syncing (2-settings-syncing.md): Already implemented with `onExternalSettingsChange()`

2. Folder Archiving (3-folder-archiving.md): Future feature requiring:
   - New command type or configuration field
   - Folder scanning and file moving logic
   - Integration with command execution flow

When implementing new features:

1. Start with requirement spec in `docs/spec/1-requirements/`
2. Create design doc in `docs/spec/2-design/`
3. Follow maintainability rules in `docs/spec/0-rules/`
4. Write tests following unit test rules
5. Update this architecture doc if core structure changes
