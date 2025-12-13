# Performance and Security

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

### 1. Path Normalisation

All file paths normalised via `normalizePath()` to prevent directory traversal

### 2. Template File Validation

Template files must exist and be readable before use

### 3. Settings Validation

All settings validated before use to prevent invalid state
