## Requirements

Plugin settings should automatically reload when synced from another device via Obsidian Sync.

## User Story

As a user who works across multiple devices,
When I modify plugin settings on Device A,
And Obsidian Sync syncs the data.json file to Device B,
Then Device B should automatically reload the settings without requiring an Obsidian restart.

## Current Behavior

Settings are stored using Obsidian's `loadData()` and `saveData()` API (main.ts:22, main.ts:65).

Settings file location: `.obsidian/plugins/open-or-create-file-command/data.json`

The file IS being synced correctly by Obsidian Sync (confirmed by sync log):

```
2025-12-06 15:56 - Server pushed [Pixel 7] .../data.json
2025-12-06 15:56 - Downloading file .../data.json
2025-12-06 15:56 - Downloading complete .../data.json
2025-12-06 15:56 - Accepted .../data.json
2025-12-06 15:56 - Fully synced
```

## Problem Statement

The data.json file is synced successfully, but the plugin does not reload settings when the file changes.

Settings are only loaded once during plugin initialization (main.ts:13):

```typescript
async onload() {
    this.settings = await this.loadSettingsFromFile()
    // ...
}
```

There is no file watcher to detect when data.json is modified by Obsidian Sync.

After sync downloads the updated data.json:

- The file on disk is updated with new settings
- The plugin's in-memory settings (this.settings) remain unchanged
- Commands continue using the old settings
- Settings UI shows stale data
- User must restart Obsidian to see synced settings

## Desired Behavior

When Obsidian Sync updates the data.json file:

1. Plugin detects the file change
2. Plugin reloads settings from disk
3. Plugin re-registers commands with new settings
4. User sees updated settings immediately (no restart required)

## Acceptance Criteria

1. File watching:

   - Plugin watches the data.json file for external changes
   - Detects when Obsidian Sync modifies the file

2. Automatic reload:

   - When data.json changes externally, reload settings from disk
   - Re-register commands with updated configurations
   - Update in-memory settings

3. Avoid conflicts:

   - If settings tab is open and user is editing, don't reload (or warn user)
   - If both devices modified settings simultaneously, last-write-wins (Obsidian Sync behavior)

4. User experience:

   - Optional: Show a Notice when settings are auto-reloaded
   - Commands should work with new settings immediately after reload

5. No performance impact:
   - File watching should not cause performance issues
   - Debounce rapid file changes (sync might write multiple times)

## Edge Cases

1. Settings tab is open when sync occurs:

   - Warn user that remote changes were detected
   - Offer to reload or keep current (unsaved) changes

2. Multiple rapid changes (sync writes multiple times):

   - Debounce reload (wait 500ms after last change)
   - Only reload once

3. data.json becomes corrupted during sync:

   - Validate before reloading
   - If invalid, keep current in-memory settings
   - Show error notice

4. User is actively typing in settings when sync occurs:
   - Don't reload while settings tab has focus
   - Queue reload for when tab is closed

## Out of Scope

- Conflict resolution UI (rely on Obsidian Sync's last-write-wins)
- Syncing settings across different vaults
- Custom sync location
