# Command Registration

## Archive Command

In `src/main.ts`:

```typescript
export default class CreateOrOpenFilePlugin extends Plugin {
	async onload() {
		// Load settings
		this.settings = await configureDefaultsAndValidateSettings(this)

		// Register open-or-create commands
		this.registerCommands(this.settings.commandConfigs)

		// Register archive command
		this.addCommand({
			id: 'archive-folders',
			name: 'Archive folders',
			callback: () => archiveCommandCallback(this, new ObsidianAdapter(this.app)),
		})

		// Register settings tab
		this.addSettingTab(new CreateOrOpenFileSettingsTab(this.app, this))
	}
}
```

## Command Callback

The archive command uses the `ArchiveCommandExecutor` class:

```typescript
function archiveCommandCallback(plugin: CreateOrOpenFilePlugin, adapter: ObsidianAdapter): void {
	ArchiveCommandExecutor.execute(plugin, adapter)
}
```

## Command Flow

1. User triggers "Archive folders" command from command palette
2. `archiveCommandCallback()` is invoked
3. `ArchiveCommandExecutor.execute()` orchestrates the archiving process
4. Results are displayed in a notice
