# Settings Layer - UI Components

The settings layer is organised into three directories:

- `common/`: Shared settings infrastructure (validation, hooks, UI components)
- `open-or-create/`: Open-or-create specific settings components
- `archive/`: Archive feature settings (future)

## 1. Settings Tab (`src/settings/common/SettingsTab.ts`)

Class: `SettingsTab`

Purpose: Obsidian settings UI integration using React

Lifecycle:

- `display()`: Renders React component into Obsidian container
- `hide()`: Validates settings and unmounts React root

React Integration: Uses `react-dom/client` with `createRoot()`

## 2. Settings Component (`src/settings/common/components/SettingsComponent.tsx`)

Component: `SettingsComponent`

Architecture: React with custom hook for state management

Purpose: Main settings UI entrypoint that wires together child components

Key Features:

- Uses `useSettings` hook for state management
- Delegates to feature-specific components (`OpenOrCreateSettings`)
- Handles settings import via `ActionsHeader`

Child Components:

- `ActionsHeader`: Import/Export buttons (shared)
- `OpenOrCreateSettings`: Open-or-create commands panel

## 3. Settings Hook (`src/settings/common/hooks/useSettings.ts`)

Hook: `useSettings()`

Purpose: Centralized settings state management

Responsibilities:

- Manages local settings state
- Handles validation with real-time updates
- Listens to `settings-reloaded` event for external changes (Obsidian Sync)
- Provides single `updateSettings()` function that updates state, validates, and persists

Returns:

- `settings`: Current settings state
- `updateSettings`: Single function that updates, validates, and saves settings
- `validationResult`: Current validation state

Benefits:

- Cleaner than render props pattern
- Single responsibility API (merged setSettings + saveSettings)
- State logic reusable across components
- Easier to test in isolation

Implementation Note:

The `settings-reloaded` event listener doesn't depend on `settingsEvents` because it's a stable service that never changes during component lifecycle.

## 4. Feature-Specific Settings (`src/settings/open-or-create/components/`)

Component: `OpenOrCreateSettings`

Purpose: UI for managing open-or-create commands

Key Features:

- Add/update/delete command operations
- Real-time validation feedback via `ValidationSummary`
- Individual command cards via `CommandCard`

Child Components:

- `CommandCard`: Individual command configuration UI with validation errors
- Uses shared components: `SettingInput`, `SettingToggle`

React Immutability Note:

When updating settings in event handlers, components must create new instances to trigger re-renders:

```typescript
const newSettings = CreateOrOpenFilePluginSettings.fromJSON(settings.toJSON())
newSettings.addOpenOrCreateCommand()
await updateSettings(newSettings)
```

This ensures React detects the change (new reference) rather than mutating the existing object.
