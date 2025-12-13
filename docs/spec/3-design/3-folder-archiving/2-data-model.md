# Data Model

## Types

```typescript
// Archive configuration type
interface ArchiveConfig {
	id: string // Unique identifier for this config
	name: string // User-friendly name
	sourcePattern: string // Glob pattern (e.g., "Journal/Week-*")
	destinationPattern: string // Destination with placeholders (e.g., "Archive/{year}/Q{quarter}")
	ageThresholdDays: number // Minimum age in days (e.g., 90)
}

// Plugin settings (extended)
interface CreateOrOpenFilePluginSettings {
	commandConfigs: CommandConfig[] // Existing open-or-create configs
	archiveConfigs: ArchiveConfig[] // New archive configs
}

// Internal types for archive processing
interface FolderMatch {
	path: string // Full folder path
	modifiedTime: number // Last modified timestamp
	ageInDays: number // Calculated age
}

interface ArchiveOperation {
	sourcePath: string // Current folder path
	destinationPath: string // Target archive path
	config: ArchiveConfig // Config that matched this folder
}

// Outcome types for error handling (following maintainability rules)
interface ArchiveSummary {
	movedCount: number
	errorCount: number
	errors: string[]
}

type ArchiveOutcome = { success: true; data: ArchiveSummary } | { success: false; error: string }

type MoveOutcome = { success: true } | { success: false; error: string }
```

## Date Placeholders

Supported placeholders in destination patterns:

- `{year}` - Four-digit year (e.g., "2025")
- `{quarter}` - Quarter number 1-4 (e.g., "1", "2", "3", "4")
- `{month}` - Default format: MM-MMM (e.g., "01-Jan", "12-Dec")
- `{month:MM}` - Two-digit month (e.g., "01", "12")
- `{month:MMM}` - Three-letter month abbreviation (e.g., "Jan", "Dec")
- `{month:MMMM}` - Full month name (e.g., "January", "December")

## Glob Patterns

Supported glob pattern syntax for source patterns:

- `*` - Matches any characters except /
- `**` - Matches any characters including /
- `?` - Matches single character except /

Examples:

- `Journal/Week-*` - Matches all folders starting with "Week-" in Journal/
- `Projects/**/Archive` - Matches Archive folders at any depth under Projects/
