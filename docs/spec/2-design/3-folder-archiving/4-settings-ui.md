# Settings UI Design

## Main Settings Component

File: `src/settings/components/index.tsx` (updated)

Update the main settings component to include tabs for both features:

```typescript
export const SettingsComponent = ({
  settings,
  updatePluginSettings,
  settingsEvents
}: SettingsProps) => {
  const [localSettings, setLocalSettings] = useState<CreateOrOpenFilePluginSettings>(settings)
  const [activeTab, setActiveTab] = useState<'open-or-create' | 'archive'>('open-or-create')
  const [validationResult, setValidationResult] = useState<ValidationResult>(
    new ValidationResult([])
  )

  const handleSettingsImported = async (importedSettings: CreateOrOpenFilePluginSettings) => {
    setLocalSettings(importedSettings)
    await updatePluginSettings(importedSettings)
  }

  // Existing useEffect hooks for settings sync and validation...

  return (
    <div className="open-or-create-file-settings">
      <SettingsActionsHeader
        settings={localSettings}
        onSettingsImported={handleSettingsImported}
      />

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'open-or-create' && (
        <OpenOrCreateSettingsPanel
          settings={localSettings}
          updateSettings={updatePluginSettings}
          validationResult={validationResult}
        />
      )}

      {activeTab === 'archive' && (
        <ArchiveSettingsPanel
          settings={localSettings}
          updateSettings={updatePluginSettings}
          validationResult={validationResult}
        />
      )}
    </div>
  )
}
```

## Settings Actions Header

File: `src/settings/components/SettingsActionsHeader.tsx` (new file)

Create a top-level actions header for import/export:

```typescript
interface SettingsActionsHeaderProps {
  settings: CreateOrOpenFilePluginSettings
  onSettingsImported: (settings: CreateOrOpenFilePluginSettings) => Promise<void>
}

export const SettingsActionsHeader = ({
  settings,
  onSettingsImported
}: SettingsActionsHeaderProps) => {
  const exportSettings = (): void => {
    const dataStr = JSON.stringify(settings, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    saveAs(blob, 'open-or-create-file-settings.json')
  }

  const { openFilePicker, loading } = useFilePicker({
    accept: '.json',
    multiple: false,
    readAs: 'Text',
    onFilesSuccessfullySelected: (selectedFiles: SelectedFiles<string>) =>
      processImportedSettings(selectedFiles, onSettingsImported)
  })

  return (
    <div className="settings-actions-header">
      <button onClick={openFilePicker} disabled={loading}>
        {loading ? 'Loading...' : 'Import settings'}
      </button>
      <button onClick={exportSettings}>Export settings</button>
    </div>
  )
}
```

## Tab Navigation

File: `src/settings/components/TabNavigation.tsx` (new file, under 50 lines)

```typescript
interface TabNavigationProps {
  activeTab: 'open-or-create' | 'archive'
  onTabChange: (tab: 'open-or-create' | 'archive') => void
}

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="settings-tab-navigation">
      <button
        className={activeTab === 'open-or-create' ? 'active' : ''}
        onClick={() => onTabChange('open-or-create')}
      >
        Open or Create
      </button>
      <button
        className={activeTab === 'archive' ? 'active' : ''}
        onClick={() => onTabChange('archive')}
      >
        Folder Archiving
      </button>
    </div>
  )
}
```

## Archive Settings Panel

File: `src/settings/components/ArchiveSettingsPanel.tsx` (new file)

```typescript
export const ArchiveSettingsPanel = ({
  settings,
  updateSettings
}: PanelProps) => {
  const updateArchiveConfig = async (id: string, updates: Partial<ArchiveConfig>) => {
    const newSettings = {
      ...settings,
      archiveConfigs: settings.archiveConfigs.map(config =>
        config.id === id ? { ...config, ...updates } : config
      )
    }
    await updateSettings(newSettings)
  }

  const deleteArchiveConfig = async (id: string) => {
    const newSettings = {
      ...settings,
      archiveConfigs: settings.archiveConfigs.filter(c => c.id !== id)
    }
    await updateSettings(newSettings)
  }

  const addArchiveConfig = async () => {
    const newConfig: ArchiveConfig = {
      id: generateId(),
      name: 'New Archive Configuration',
      sourcePattern: '',
      destinationPattern: '',
      ageThresholdDays: 90
    }
    const newSettings = {
      ...settings,
      archiveConfigs: [newConfig, ...settings.archiveConfigs]
    }
    await updateSettings(newSettings)
  }

  return (
    <>
      <div className="archive-settings-header">
        <button onClick={addArchiveConfig}>Add Configuration</button>
      </div>
      {settings.archiveConfigs.map(config => (
        <ArchiveConfigCard
          key={config.id}
          config={config}
          onUpdate={(updates) => updateArchiveConfig(config.id, updates)}
          onDelete={() => deleteArchiveConfig(config.id)}
        />
      ))}
    </>
  )
}
```

## Archive Config Card

File: `src/settings/components/ArchiveConfigCard.tsx` (new file)

Component displaying a single archive configuration as a card with input fields.

Fields:

- Name (text input)
- Source Pattern (text input with glob help text)
- Destination Pattern (text input with placeholder help text)
- Age Threshold (number input in days)
- Delete button

Validation:

- Name: Required, non-empty
- Source Pattern: Required, valid glob pattern
- Destination Pattern: Required, contains valid placeholders
- Age Threshold: Required, positive integer

## Open Or Create Settings Panel

File: `src/settings/components/OpenOrCreateSettingsPanel.tsx` (extract existing UI)

```typescript
export const OpenOrCreateSettingsPanel = ({
  settings,
  updateSettings,
  validationResult
}: PanelProps) => {
  const updateCommand = async (index: number, key: keyof CommandConfig, value: string | boolean) => {
    const newSettings = {
      ...settings,
      commandConfigs: settings.commandConfigs.map((config, i) =>
        i === index ? { ...config, [key]: value } : config
      )
    }
    await updateSettings(newSettings)
  }

  const deleteCommand = async (index: number) => {
    const newSettings = { ...settings }
    newSettings.commandConfigs.splice(index, 1)
    await updateSettings(newSettings)
  }

  const addCommand = async () => {
    // ... existing add logic
  }

  return (
    <>
      <ActionsHeader onAddCommand={addCommand} />
      <ValidationSummary validationResult={validationResult} />
      {settings.commandConfigs.map((command, index) => (
        <CommandCard
          key={index}
          command={command}
          index={index}
          onUpdate={updateCommand}
          onDelete={deleteCommand}
          validationErrors={validationResult.getErrorsForCommand(index)}
        />
      ))}
    </>
  )
}
```

## Main Settings Tab Integration

File: `src/settings/CreateOrOpenFileSettingsTab.ts` (no changes needed)

The settings tab remains simple - it just renders a single React component that handles all UI:

```typescript
export class CreateOrOpenFileSettingsTab extends PluginSettingTab {
	updatePluginSettingsCallback: (settings: CreateOrOpenFilePluginSettings) => Promise<void>
	private root: Root | null = null

	display(): void {
		const { containerEl } = this
		containerEl.empty()

		const plugin = this.plugin as CreateOrOpenFilePlugin
		const currentSettings = plugin.settings

		// Render single React component that handles tabs internally
		this.root = createRoot(containerEl)
		this.root.render(
			React.createElement(SettingsComponent, {
				settings: currentSettings,
				updatePluginSettings: this.updatePluginSettingsCallback,
				settingsEvents: plugin.settingsEvents,
			}),
		)
	}

	hide(): void {
		const validationResult = validateSettings((this.plugin as CreateOrOpenFilePlugin).settings)
		if (!validationResult.isValid) {
			new Notice('Please fill out the required settings', 10000)
		}
		if (this.root) {
			this.root.unmount()
			this.root = null
		}
	}
}
```
