# Implementation Order

## Phase 1: Core Data Model

1. Add `ArchiveConfig` type to `src/types.ts`
2. Update `CreateOrOpenFilePluginSettings` type
3. Update `ValidationError` type to include `archiveConfigIndex`
4. Update defaults in `src/settings/constants.ts`
5. Update `configureDefaultsAndValidateSettings.ts`

## Phase 2: Archive Logic (No UI)

1. Implement `src/command/archive/folderMatcher.ts` with tests
   - `createMatcher()` function
   - Glob to regex conversion
   - Pattern matching tests

2. Implement `src/command/archive/destinationPathBuilder.ts` with tests
   - `buildDestinationPath()` function
   - Date placeholder replacement
   - Month format variations
   - Tests for all placeholders

3. Implement `src/command/archive/folderScanner.ts` with tests
   - `scanForMatches()` function
   - Age calculation
   - Folder filtering
   - Tests with mock adapter

4. Add folder methods to `src/notes/obsidianAdapter.ts`
   - `moveFolder()`
   - `getAllFolders()`
   - `createFolderIfNeeded()`

5. Implement `src/command/archive/archiveCommandCallback.ts` with tests
   - `ArchiveCommandExecutor` class
   - Static methods following 15-line rule
   - Integration tests with mocked adapter

## Phase 3: Command Registration

1. Register archive command in `src/main.ts`
2. Test command execution manually
3. Verify error handling
4. Test with sample vault and folders

## Phase 4: Validation

1. Update `src/settings/utils/validation/typeGuards.ts`
   - Add `isArchiveConfig()` type guard
   - Update `isImportedSettings()` for backward compatibility

2. Create `src/settings/utils/validation/validateArchiveConfig.ts`
   - Implement `ArchiveConfigValidator` class
   - Static validation methods
   - Write comprehensive tests

3. Update `src/settings/utils/validation/validateSettings.ts`
   - Integrate archive config validation
   - Test validation flow

4. Update `src/settings/utils/validation/validationResult.ts`
   - Add `getErrorsForArchiveConfig()` method
   - Add `hasErrorsForArchiveConfig()` method

## Phase 5: Settings UI

1. Create `src/settings/components/TabNavigation.tsx`
   - Simple tab switcher component
   - Under 50 lines

2. Create `src/settings/components/SettingsActionsHeader.tsx`
   - Extract import/export from existing component
   - Top-level header outside tabs

3. Create `src/settings/components/OpenOrCreateSettingsPanel.tsx`
   - Extract existing open-or-create UI
   - Self-contained panel component

4. Create `src/settings/components/ArchiveSettingsPanel.tsx`
   - New panel for archive configs
   - Add/update/delete logic
   - Under 100 lines

5. Create `src/settings/components/ArchiveConfigCard.tsx`
   - Individual config card component
   - Input fields with validation
   - Delete button

6. Update `src/settings/components/index.tsx`
   - Add tab state management
   - Integrate all panels
   - Keep existing validation hooks

7. Style components with CSS
   - Tab navigation styles
   - Archive config card styles

## Phase 6: Testing and Polish

1. Write all unit tests
   - Folder matcher tests
   - Destination path builder tests
   - Folder scanner tests
   - Validation tests

2. Write integration tests
   - Full archive flow test
   - Multiple configs test
   - Error handling test

3. Manual testing with various configurations
   - Different glob patterns
   - Different date placeholders
   - Multiple archive configs
   - Edge cases

4. Error handling and edge cases
   - Missing folders
   - Permission errors
   - Destination conflicts
   - Invalid patterns

5. Documentation updates
   - Update README.md
   - Add examples
   - Document placeholders and patterns

## Dependencies

### New Dependencies
None required. Uses existing:
- `date-fns` (already in project) - for date calculations
- Obsidian API - for folder operations
- React (already in project) - for settings UI

### Modified Files
1. `src/types.ts` - Add archive types
2. `src/main.ts` - Register archive command
3. `src/notes/obsidianAdapter.ts` - Add folder operations
4. `src/settings/configureDefaultsAndValidateSettings.ts` - Add archive defaults
5. `src/settings/components/index.tsx` - Add tabs and panels

### New Files
1. `src/command/archive/archiveCommandCallback.ts`
2. `src/command/archive/folderScanner.ts`
3. `src/command/archive/folderMatcher.ts`
4. `src/command/archive/destinationPathBuilder.ts`
5. `src/settings/components/ArchiveSettingsPanel.tsx`
6. `src/settings/components/ArchiveConfigCard.tsx`
7. `src/settings/components/TabNavigation.tsx`
8. `src/settings/components/SettingsActionsHeader.tsx`
9. `src/settings/components/OpenOrCreateSettingsPanel.tsx`
10. `src/settings/utils/validation/validateArchiveConfig.ts`
11. Plus corresponding test files

## Future Enhancements

1. Dry run mode - Preview what would be archived without moving
2. Undo functionality - Reverse last archive operation
3. Auto-archive on schedule - Schedule automatic archiving
4. Archive logs - Keep history of archived folders
5. Exclusion patterns - Skip certain folders even if they match
6. Compression - Optionally zip archived folders
7. Rename on archive - Apply naming patterns to archived folders
