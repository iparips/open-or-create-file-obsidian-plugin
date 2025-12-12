# Folder Archiving Implementation Tasks

This task list implements the folder archiving feature as specified in @docs/spec/1-requirements/3-folder-archiving.md and designed in @docs/spec/2-design/3-folder-archiving/.

## Phase 0: Code Refactoring (Pre-requisite)

### Task 0.1: Refactor command directory structure

- [ ] Create `src/command/open-or-create/` directory
- [ ] Move `src/command/commandCallback.ts` to `src/command/open-or-create/commandCallback.ts`
- [ ] Move `src/command/timeShift.ts` to `src/command/open-or-create/timeShift.ts`
- [ ] Move `src/command/previous-note-candidate-finder/` to `src/command/open-or-create/previous-note-candidate-finder/`
  - This includes all files and the `__tests__/` subdirectory
- [ ] Update all imports in affected files
- [ ] Update all imports in test files
- [ ] Run tests to ensure nothing broke

### Task 0.2: Move pathSegmentBuilder to open-or-create directory

- [ ] Move `src/command/pathSegmentBuilder.ts` to `src/command/open-or-create/pathSegmentBuilder.ts`
- [ ] Move `src/command/__tests__/pathSegmentBuilder.test.ts` to `src/command/open-or-create/__tests__/pathSegmentBuilder.test.ts`
- [ ] Update imports in `src/command/open-or-create/commandCallback.ts`
- [ ] Update imports in the test file
- [ ] Run tests to ensure pathSegmentBuilder still works: `bun run test pathSegmentBuilder`

### Task 0.3: Create directory structure for new features

- [ ] Create `src/settings/open-or-create/` directory (empty for now, will be used in Phase 5)
- [ ] Create `src/settings/archive/` directory (empty for now, will be populated in later phases)
- [ ] Create `src/settings/common/` directory (empty for now, for shared settings utilities)
- [ ] Create `src/command/archive/` directory (empty for now, will be populated in Phase 2)

### Task 0.4: Verify refactoring

- [ ] Run full test suite: `bun run test`
- [ ] Verify all tests pass
- [ ] Build the plugin
- [ ] Manually test open-or-create command functionality

## Phase 1: Core Data Model

### Task 1.1: Add archive types to types.ts

- [ ] Add `ArchiveConfig` interface to `src/types.ts`
  - `id: string`
  - `name: string`
  - `sourcePattern: string` (glob pattern)
  - `destinationPattern: string` (with placeholders)
  - `ageThresholdDays: number`
- [ ] Update `CreateOrOpenFilePluginSettings` to include `archiveConfigs: ArchiveConfig[]`
- [ ] Update `ValidationError` type to include optional `archiveConfigIndex?: number`

### Task 1.2: Update settings defaults

- [ ] Create `src/settings/constants.ts` if it doesn't exist
- [ ] Add `DEFAULT_ARCHIVE_CONFIG` constant
- [ ] Update `configureDefaultsAndValidateSettings.ts` to handle `archiveConfigs` array
- [ ] Ensure backward compatibility for existing settings files

### Task 1.3: Write tests for data model

- [ ] Write tests for settings defaults with archive configs
- [ ] Write tests for backward compatibility (old settings without archiveConfigs)

## Phase 2: Archive Logic (No UI)

### Task 2.1: Implement folderMatcher

- [ ] Create `src/command/archive/folderMatcher.ts`
- [ ] Implement `createMatcher(globPattern: string): RegExp` function
  - Handle `*` (matches any characters except /)
  - Handle `**` (matches any characters including /)
  - Handle `?` (single character match)
- [ ] Create `src/command/archive/__tests__/folderMatcher.test.ts`
  - Test pattern: `"Journal/Week-*"` matches `"Journal/Week-01"`
  - Test pattern: `"Projects/**/Archive"` matches `"Projects/Foo/Archive"`
  - Test edge cases (empty pattern, special characters)

### Task 2.2: Implement destinationPathBuilder

- [ ] Create `src/command/archive/destinationPathBuilder.ts`
- [ ] Implement `buildDestinationPath(match, destinationPattern): string`
- [ ] Implement helper functions:
  - `formatYear(date): string`
  - `formatQuarter(date): string`
  - `formatMonth(date, format): string`
  - `getShortMonthName(month): string`
  - `getFullMonthName(month): string`
- [ ] Create `src/command/archive/__tests__/destinationPathBuilder.test.ts`
  - Test `{year}` placeholder
  - Test `{quarter}` placeholder (Q1-Q4 based on month)
  - Test `{month:MM}` format (01-12)
  - Test `{month:MMM}` format (Jan-Dec)
  - Test `{month:MMMM}` format (January-December)
  - Test `{month}` default format (MM-MMM)
  - Test combined patterns like `Archive/{year}/Q{quarter}`

### Task 2.3: Implement folderScanner

- [ ] Create `src/command/archive/folderScanner.ts`
- [ ] Implement `scanForMatches(sourcePattern, adapter): Promise<FolderMatch[]>`
  - Get all folders from adapter
  - Filter using matcher
  - Calculate age in days for each folder
- [ ] Implement `calculateAgeInDays(modifiedTime, now): number` helper
- [ ] Create `src/command/archive/__tests__/folderScanner.test.ts`
  - Test with mocked adapter returning sample folders
  - Test age calculation (90 days, 89 days, etc.)
  - Test pattern matching integration

### Task 2.4: Add folder operations to ObsidianAdapter

- [ ] Add `moveFolder(sourcePath, destinationPath): Promise<void>` method
  - Verify source folder exists
  - Create destination parent directories if needed
  - Move folder using Obsidian API
- [ ] Add `getAllFolders(): Promise<TFolder[]>` method
  - Use `Vault.recurseChildren` to collect all folders
- [ ] Add `createFolderIfNeeded(folderPath): Promise<void>` private method
- [ ] Create tests in `src/notes/__tests__/obsidianAdapter.test.ts`
  - Test moveFolder with mocked vault
  - Test getAllFolders returns correct list
  - Test createFolderIfNeeded creates parent directories

### Task 2.5: Implement archiveCommandCallback

- [ ] Create `src/command/archive/archiveCommandCallback.ts`
- [ ] Implement `ArchiveCommandExecutor` class with static methods:
  - `execute(plugin, adapter): Promise<void>` (main entry point)
  - `executeArchiving(configs, adapter): Promise<ArchiveOutcome>`
  - `processAllConfigs(configs, adapter): Promise<ArchiveSummary>`
  - `processConfig(config, adapter): Promise<ArchiveSummary>`
  - `aggregateResults(results): ArchiveSummary`
  - `displayResults(outcome): void`
- [ ] Ensure each method is under 15 lines (follow maintainability rules)
- [ ] Create `src/command/archive/__tests__/archiveCommandCallback.test.ts`
  - Test successful archiving of single folder
  - Test archiving with multiple configs
  - Test error handling (no configs, folder not found)
  - Test result aggregation

### Task 2.6: Define archive outcome types

- [ ] Add to `src/types.ts`:
  - `FolderMatch` type (path, modifiedTime, ageInDays)
  - `ArchiveSummary` type (movedCount, errorCount, errors)
  - `ArchiveOutcome` type (success, data or error)

## Phase 3: Command Registration

### Task 3.1: Register archive command in main.ts

- [ ] Update `src/main.ts` to register archive command
- [ ] Command ID: `"archive-folders"`
- [ ] Command name: `"Archive folders"`
- [ ] Call `ArchiveCommandExecutor.execute(this, adapter)`

### Task 3.2: Test command registration

- [ ] Manually test command appears in command palette
- [ ] Verify command executes without errors when no configs exist
- [ ] Create a test vault with sample folders

### Task 3.3: Manual integration testing

- [ ] Create test archive config manually in data.json
- [ ] Create test folders (e.g., Journal/Week-01-2024)
- [ ] Execute archive command
- [ ] Verify folders are moved correctly
- [ ] Verify error handling works

## Phase 4: Validation

### Task 4.1: Add archive type guards

- [ ] Update `src/settings/utils/validation/typeGuards.ts`
- [ ] Add `isArchiveConfig(config): config is ArchiveConfig`
  - Check required fields: id, name, sourcePattern, destinationPattern, ageThresholdDays
  - Check field types
- [ ] Update `isImportedSettings()` to handle archiveConfigs
- [ ] Write tests for new type guards

### Task 4.2: Implement archive config validation

- [ ] Create `src/settings/utils/validation/validateArchiveConfig.ts`
- [ ] Implement `ArchiveConfigValidator` class with static methods:
  - `validate(config): ValidationResult`
  - `validateName(name): ValidationError[]`
  - `validateSourcePattern(pattern): ValidationError[]`
  - `validateDestinationPattern(pattern): ValidationError[]`
  - `validateAgeThreshold(threshold): ValidationError[]`
- [ ] Each method under 15 lines
- [ ] Create `src/settings/utils/validation/__tests__/validateArchiveConfig.test.ts`
  - Test valid config passes
  - Test empty name fails
  - Test empty source pattern fails
  - Test invalid destination pattern fails (unknown placeholders)
  - Test negative age threshold fails

### Task 4.3: Integrate archive validation into settings

- [ ] Update `src/settings/utils/validation/validateSettings.ts`
- [ ] Add validation for archiveConfigs array
- [ ] Call `ArchiveConfigValidator.validate()` for each config
- [ ] Write integration tests

### Task 4.4: Update ValidationResult helper methods

- [ ] Update `src/settings/utils/validation/validationResult.ts`
- [ ] Add `getErrorsForArchiveConfig(index): ValidationError[]`
- [ ] Add `hasErrorsForArchiveConfig(index): boolean`
- [ ] Write tests for new methods

## Phase 5: Settings UI

### Task 5.1: Create TabNavigation component

- [ ] Create `src/settings/components/TabNavigation.tsx`
- [ ] Implement simple tab switcher (Open/Create, Archive)
- [ ] Keep under 50 lines
- [ ] Add basic CSS styling

### Task 5.2: Extract SettingsActionsHeader

- [ ] Create `src/settings/components/SettingsActionsHeader.tsx`
- [ ] Extract import/export buttons from existing settings component
- [ ] Add "Add Archive Config" button (conditional on active tab)
- [ ] Keep under 75 lines

### Task 5.3: Create OpenOrCreateSettingsPanel

- [ ] Create `src/settings/components/OpenOrCreateSettingsPanel.tsx`
- [ ] Extract existing open-or-create UI from main settings component
- [ ] Make self-contained panel component
- [ ] Keep under 100 lines

### Task 5.4: Create ArchiveConfigCard component

- [ ] Create `src/settings/components/ArchiveConfigCard.tsx`
- [ ] Implement card for single archive config
- [ ] Include inputs:
  - Config name (text input)
  - Source pattern (text input with glob hint)
  - Destination pattern (text input with placeholder hint)
  - Age threshold (number input in days)
  - Delete button
- [ ] Show validation errors inline
- [ ] Keep under 100 lines

### Task 5.5: Create ArchiveSettingsPanel component

- [ ] Create `src/settings/components/ArchiveSettingsPanel.tsx`
- [ ] Render list of ArchiveConfigCard components
- [ ] Handle add/update/delete operations
- [ ] Show "No archive configs" message when empty
- [ ] Keep under 100 lines

### Task 5.6: Update main settings component

- [ ] Update `src/settings/components/index.tsx`
- [ ] Add tab state management (activeTab: 'open-create' | 'archive')
- [ ] Integrate TabNavigation component
- [ ] Integrate SettingsActionsHeader component
- [ ] Integrate OpenOrCreateSettingsPanel and ArchiveSettingsPanel
- [ ] Keep existing validation hooks
- [ ] Handle settings sync events

### Task 5.7: Add CSS styling

- [ ] Create or update styles for tab navigation
- [ ] Style ArchiveConfigCard component
- [ ] Ensure responsive layout
- [ ] Match existing Obsidian UI patterns

### Task 5.8: Test settings UI

- [ ] Manually test adding archive config
- [ ] Manually test editing archive config
- [ ] Manually test deleting archive config
- [ ] Test validation error display
- [ ] Test import/export with archive configs
- [ ] Test tab switching

## Phase 6: Testing and Polish

### Task 6.1: Complete unit test coverage

- [ ] Ensure all new modules have tests
- [ ] Aim for 80%+ code coverage on new code
- [ ] Run `bun run test` and verify all pass

### Task 6.2: Write integration tests

- [ ] Create integration test for full archive flow
- [ ] Test multiple archive configs executing together
- [ ] Test error scenarios (missing folders, permission errors)
- [ ] Test edge cases (empty source pattern, conflicting destinations)

### Task 6.3: Manual testing with various configurations

- [ ] Test with pattern: `"Journal/Week-*"` and destination: `"Archive/{year}/Q{quarter}"`
- [ ] Test with pattern: `"Projects/**/Archive-*"` and destination: `"Backup/{year}/{month:MMMM}"`
- [ ] Test age threshold edge cases (89 days vs 90 days)
- [ ] Test with folders from different time periods
- [ ] Test with no matching folders
- [ ] Test with many matching folders (performance)

### Task 6.4: Error handling verification

- [ ] Test archive command with missing source folders
- [ ] Test with read-only destination (permission error)
- [ ] Test with destination folder already containing same-name folder
- [ ] Test with invalid glob patterns
- [ ] Verify user-friendly error messages displayed

### Task 6.5: Documentation updates

- [ ] Update README.md with archive feature description
- [ ] Add examples of glob patterns
- [ ] Document supported placeholders: `{year}`, `{quarter}`, `{month}`, `{month:MM}`, etc.
- [ ] Add screenshots of settings UI (if applicable)
- [ ] Document age threshold behaviour

### Task 6.6: Final verification

- [ ] Build plugin: `npm run build` or `bun run build`
- [ ] Install in test vault
- [ ] Run through all acceptance criteria from requirements
- [ ] Verify no regression in open-or-create functionality
- [ ] Test settings sync between devices (if using Obsidian Sync)

## Summary

Total estimated tasks: 60+ individual checklist items across 6 phases

Key milestones:

1. Phase 0 complete: Code structure refactored
2. Phase 1 complete: Data model and types defined
3. Phase 2 complete: Archive logic implemented and tested
4. Phase 3 complete: Command registered and working
5. Phase 4 complete: Validation implemented
6. Phase 5 complete: Settings UI implemented
7. Phase 6 complete: Fully tested and documented

Follow the phases in order - each phase builds on the previous one.
