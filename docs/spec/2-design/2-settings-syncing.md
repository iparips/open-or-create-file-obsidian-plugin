# Settings Auto-Reload Design

## Overview

Implement automatic reloading of plugin settings when the data.json file is modified by Obsidian Sync, eliminating the need for users to restart Obsidian to see synced settings.

## Technical Approach

### Chosen Approach: onExternalSettingsChange Lifecycle Method

Use Obsidian's `onExternalSettingsChange()` lifecycle method which fires when the plugin's data.json file is modified externally (e.g., by Obsidian Sync).

#### Implementation

```typescript
const debounce = <T extends (...args: unknown[]) => unknown>(
	fn: T,
	delay: number,
): ((...args: Parameters<T>) => void) => {
	let timeoutId: NodeJS.Timeout | null = null
	return (...args: Parameters<T>) => {
		if (timeoutId) {
			clearTimeout(timeoutId)
		}
		timeoutId = setTimeout(() => {
			fn(...args)
			timeoutId = null
		}, delay)
	}
}

export default class CreateOrOpenFilePlugin extends Plugin {
	settings!: CreateOrOpenFilePluginSettings
	settingsEvents = new Events()
	private debouncedReloadSettings = debounce(() => this.reloadSettingsFromDisk(), 500)

	onExternalSettingsChange() {
		console.log('[Settings Watcher] data.json modified externally')
		this.debouncedReloadSettings()
	}

	private async reloadSettingsFromDisk(): Promise<void> {
		try {
			const newSettings = await this.loadSettingsFromFile()
			const validationResult = validateSettings(newSettings)

			if (validationResult.isValid) {
				this.applyReloadedSettings(newSettings)
			} else {
				this.handleInvalidSettings()
			}
		} catch (error) {
			this.handleReloadError(error)
		}
	}

	private applyReloadedSettings(newSettings: CreateOrOpenFilePluginSettings): void {
		this.settings = newSettings
		this.registerCommands(newSettings.commandConfigs)
		this.settingsEvents.trigger('settings-reloaded', newSettings)
	}

	private handleInvalidSettings(): void {
		new Notice('Synced settings are invalid. Keeping current settings.')
	}

	private handleReloadError(error: unknown): void {
		new Notice('Failed to reload settings from sync')
		console.error('Settings reload error:', error)
	}
}
```

### Why This Approach

Advantages:

- **Official API**: Uses Obsidian's official lifecycle method specifically designed for this purpose
- **Reliable**: Fires only when data.json is actually modified by external sources
- **No setup required**: No need to manually register file watchers
- **Automatic cleanup**: Lifecycle methods are automatically managed by Obsidian

Alternatives Considered:

**Option 2: Vault 'modify' event**

```typescript
this.registerEvent(
	this.app.vault.on('modify', (file) => {
		if (file.path === `${this.manifest.dir}/data.json`) {
			this.reloadSettings()
		}
	}),
)
```

Rejected: Doesn't fire for .obsidian directory files

**Option 3: Vault adapter file watch**

```typescript
this.app.vault.adapter.watch(this.manifest.dir + '/data.json', () => {
	this.reloadSettings()
})
```

Rejected: Lower-level API, manual cleanup required, less reliable

**Option 4: Periodic polling**
Rejected: Inefficient, adds unnecessary overhead

## Data Flow

```
Obsidian Sync modifies data.json
    ↓
onExternalSettingsChange() lifecycle method called
    ↓
debouncedReloadSettings() called (500ms debounce)
    ↓
reloadSettingsFromDisk() called
    ↓
loadSettingsFromFile() reads new data
    ↓
validateSettings() validates new data
    ↓
If valid: applyReloadedSettings()
    ├─ this.settings updated
    ├─ registerCommands() re-registers with new configs
    └─ settingsEvents.trigger('settings-reloaded', newSettings)
             ↓
             React component receives event
             ↓
             UI updates via setLocalSettings()
```

## Debouncing Strategy

Instead of managing timer state manually in the class, we use a reusable `debounce()` utility function:

```typescript
const debounce = <T extends (...args: unknown[]) => unknown>(
	fn: T,
	delay: number,
): ((...args: Parameters<T>) => void) => {
	let timeoutId: NodeJS.Timeout | null = null
	return (...args: Parameters<T>) => {
		if (timeoutId) {
			clearTimeout(timeoutId)
		}
		timeoutId = setTimeout(() => {
			fn(...args)
			timeoutId = null
		}, delay)
	}
}
```

Benefits:

- **Encapsulation**: Timer state is managed in the closure, not instance state
- **Reusable**: Can be used for other debounced operations
- **Type-safe**: Preserves function signature
- **Clean**: No need to manually clear timers throughout the class

## UI Update Mechanism

The React settings component subscribes to the 'settings-reloaded' event:

```typescript
// In SettingsComponent
useEffect(() => {
	const handleSettingsReloaded = (newSettings: CreateOrOpenFilePluginSettings) => {
		console.log('[Settings UI] Received settings-reloaded event, updating UI')
		setLocalSettings(newSettings)
	}

	const eventRef = settingsEvents.on(
		'settings-reloaded',
		handleSettingsReloaded as (...data: unknown[]) => unknown,
	)

	return () => {
		settingsEvents.offref(eventRef)
	}
}, [settingsEvents])
```

This ensures:

- UI updates automatically when settings reload
- Clean separation between plugin and React component
- Proper cleanup when component unmounts

## Edge Cases & Solutions

### 1. Settings Tab is Open

Problem: Settings tab shows stale data after reload

Solution: Event-driven architecture. When settings reload, the plugin triggers a 'settings-reloaded' event that the React component subscribes to, updating the UI immediately.

### 2. Multiple Rapid Changes

Problem: Obsidian Sync might trigger multiple onExternalSettingsChange calls during sync

Solution: Debounce with 500ms delay. Multiple rapid calls are collapsed into a single reload after the last change.

### 3. User is Editing Settings

Problem: Reloading while user is typing could be disruptive

Solution: For MVP, accept last-write-wins behavior (matches Obsidian Sync's conflict resolution). Future enhancement could detect unsaved changes and warn user.

### 4. Corrupted data.json

Problem: File might be corrupted during sync

Solution: Validate before applying:

```typescript
const validationResult = validateSettings(newSettings)

if (validationResult.isValid) {
	this.applyReloadedSettings(newSettings)
} else {
	new Notice('Synced settings are invalid. Keeping current settings.')
	console.error('Invalid settings from sync:', validationResult.errors)
}
```

### 5. Read Errors

Problem: File might not be readable

Solution: Wrap in try-catch with error handling:

```typescript
try {
	const newSettings = await this.loadSettingsFromFile()
	// ... validation and application
} catch (error) {
	new Notice('Failed to reload settings from sync')
	console.error('Settings reload error:', error)
}
```

## Architecture Changes

### Files Modified

1. **src/main.ts**

   - Added `debounce()` utility function
   - Added `debouncedReloadSettings` property
   - Implemented `onExternalSettingsChange()` lifecycle method
   - Added `reloadSettingsFromDisk()` with validation
   - Added `applyReloadedSettings()` to apply and notify
   - Added error handlers: `handleInvalidSettings()`, `handleReloadError()`
   - Added `settingsEvents` event emitter for UI updates

2. **src/settings/components/index.tsx**

   - Added `settingsEvents` prop
   - Added useEffect to subscribe to 'settings-reloaded' event
   - Component updates `localSettings` when event fires

3. **src/settings/CreateOrOpenFileSettingsTab.ts**
   - Pass `plugin.settingsEvents` to React component

### Dependencies

No new dependencies required. Uses existing:

- Obsidian Plugin API (onExternalSettingsChange lifecycle method)
- Obsidian Events class for event-driven UI updates

## Testing Strategy

### Manual Testing

1. Open vault on Device A
2. Modify settings
3. Wait for sync
4. On Device B, verify settings update without restart
5. Verify commands work with new settings
6. Have settings tab open during sync, verify UI updates

### Edge Case Testing

1. **Rapid changes**: Modify settings multiple times quickly, verify single reload
2. **Settings tab open**: Have tab open during sync, verify UI updates
3. **Invalid data**: Manually corrupt data.json, verify graceful handling with notice
4. **Read errors**: Make data.json unreadable, verify error handling

### Automated Testing

Challenge: Hard to test lifecycle methods in unit tests

Approach: Extract core logic into testable functions:

- ✅ Test `loadSettingsFromFile()` handles various data formats
- ✅ Test `validateSettings()` catches errors
- ✅ Test `registerCommands()` with different configs
- ✅ Test React component updates when event fires (using vi.spyOn)

Lifecycle method itself tested manually.

## Rollout Plan

1. ✅ Add debounce utility function
2. ✅ Implement onExternalSettingsChange() lifecycle method
3. ✅ Add validation to reload handler
4. ✅ Add debouncing
5. ✅ Add event emitter for UI updates
6. ✅ Add useEffect to React component to subscribe to events
7. ✅ Test settings tab updates
8. ✅ All tests passing (130/130)
9. Ready to release as minor version (no breaking changes)

## Future Enhancements

- Show notification when settings auto-reload (optional setting)
- Detect unsaved changes in settings tab before reload
- Merge conflict resolution UI
- Settings history/undo
