# System Overview

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

### 2. Type System (`src/types.ts`)

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
