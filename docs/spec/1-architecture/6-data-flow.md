# Data Flow

## Command Execution Flow

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

## Settings Update Flow

```
User edits settings in UI
  ↓
OpenOrCreateSettings: Call add/update/delete handler
  ↓
Handler calls useSettings.updateSettings()
  ↓
useSettings: Updates local state + validates
  ↓
useSettings: Calls onSettingsChange (updatePluginSettings)
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
  useSettings: Event listener updates local state
```
