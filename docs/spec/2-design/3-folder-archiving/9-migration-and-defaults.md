# Migration and Defaults

## Default Settings

File: `src/settings/constants.ts` (update existing)

```typescript
export const DEFAULT_SETTINGS: CreateOrOpenFilePluginSettings = {
  commandConfigs: [],
  archiveConfigs: []  // Add this field
}
```

## Default Archive Config

File: `src/settings/configureDefaultsAndValidateSettings.ts` (update existing)

```typescript
const DEFAULT_ARCHIVE_CONFIG: Partial<ArchiveConfig> = {
  ageThresholdDays: 90  // Default age threshold
}

export async function configureDefaultsAndValidateSettings(
  loadData: () => Promise<CreateOrOpenFilePluginSettings>
): Promise<CreateOrOpenFilePluginSettings> {
  try {
    const data = await loadData()
    const settings = data || DEFAULT_SETTINGS

    // Ensure all commands have optional fields (existing logic)
    settings.commandConfigs = settings.commandConfigs.map(config =>
      Object.assign({}, DEFAULT_COMMAND_CONFIG, config)
    )

    // Ensure archiveConfigs array exists and has defaults applied
    settings.archiveConfigs = (settings.archiveConfigs || []).map(config =>
      Object.assign({}, DEFAULT_ARCHIVE_CONFIG, config)
    )

    const validationResult = validateSettings(settings)

    if (!validationResult.isValid) {
      console.error('[Settings] Invalid settings:', validationResult.errors)
      new Notice('Settings file is invalid. Using defaults.')
      return DEFAULT_SETTINGS
    }

    return settings
  } catch (error) {
    console.error('[Settings] Error loading settings:', error)
    new Notice('Failed to load settings. Using defaults.')
    return DEFAULT_SETTINGS
  }
}
```

## Backward Compatibility

Existing settings files without `archiveConfigs` will get empty array by default. This ensures:
- No breaking changes for existing users
- Plugin loads successfully with old settings
- Users can gradually adopt archiving feature

## External Settings Changes (Obsidian Sync)

Archive settings validation is automatically integrated with `onExternalSettingsChange()`:

1. When settings sync from another device → `onExternalSettingsChange()` is called
2. This triggers `debouncedReload()` → calls `configureDefaultsAndValidateSettings()`
3. `configureDefaultsAndValidateSettings()` → calls `validateSettings()` which validates both command configs AND archive configs
4. Invalid settings are caught and user is notified, defaults are used
5. Valid settings are loaded and `settings-reloaded` event is triggered to update UI

This means archive configs are validated whether settings are:
- Loaded on plugin start
- Changed in settings UI
- Imported via import button
- Synced from another device via Obsidian Sync

## Performance Considerations

### Large Vaults

For vaults with thousands of folders:

1. Limit folder scanning
   - Only scan folders matching the glob pattern's static prefix
   - Example: For `"Journal/Week-*"`, only scan `"Journal/"` folder

2. Batch operations
   - Process folders in batches of 50
   - Show progress notice during processing

3. Async processing
   - Use `async/await` throughout
   - Don't block UI during processing

### Implementation

```typescript
async function scanForMatches(
  sourcePattern: string,
  adapter: ObsidianAdapter
): Promise<FolderMatch[]> {
  // Extract static prefix from pattern
  const staticPrefix = extractStaticPrefix(sourcePattern)

  // Only scan folders within the static prefix
  const foldersToScan = staticPrefix
    ? await adapter.getFoldersInPath(staticPrefix)
    : await adapter.getAllFolders()

  // Rest of scanning logic...
}

function extractStaticPrefix(pattern: string): string | null {
  // Find first wildcard character
  const wildcardIndex = pattern.search(/[*?]/)

  if (wildcardIndex === -1) {
    return pattern  // No wildcards, entire pattern is static
  }

  // Return path up to (but not including) the directory with wildcards
  const prefix = pattern.substring(0, wildcardIndex)
  const lastSlash = prefix.lastIndexOf('/')

  return lastSlash > 0 ? prefix.substring(0, lastSlash) : null
}
```
