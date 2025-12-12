import { debounce, Events, Notice, Plugin } from 'obsidian'
import { SettingsTab } from './settings/common/SettingsTab'
import { createOrOpenFileCommandCallback } from './command/open-or-create/commandCallback'
import { ObsidianAdapter } from './notes/obsidianAdapter'
import { CommandConfig, CreateOrOpenFilePluginSettings } from './types'
import { configureDefaultsAndValidateSettings } from './settings/common/configureDefaultsAndValidateSettings'

export default class CreateOrOpenFilePlugin extends Plugin {
	settings!: CreateOrOpenFilePluginSettings
	settingsEvents = new Events()
	private hasRegisteredCommands = false

	private debouncedReload = debounce(
		async () => {
			this.settings = await configureDefaultsAndValidateSettings(() => this.loadData())
			this.registerCommands(this.settings.commandConfigs)
			this.settingsEvents.trigger('settings-reloaded', this.settings)
			new Notice('Settings updated from external.')
		},
		100,
		false,
	)

	async onload() {
		this.settings = await configureDefaultsAndValidateSettings(() => this.loadData())
		this.registerCommands(this.settings.commandConfigs)

		// bind this so that "this" reference inside update updateSettings points to MyPlugin.
		this.addSettingTab(
			new SettingsTab(this.app, this, this.saveSettingsAndRegisterCommands.bind(this)),
		)
	}

	onunload() {
		this.unregisterCommands()
	}

	// When Obsidian Sync copies settings from another device
	async onExternalSettingsChange() {
		this.debouncedReload()
	}

	private registerCommands(commandConfigs: CommandConfig[]): void {
		// Only unregister if we've previously registered commands
		if (this.hasRegisteredCommands) {
			this.unregisterCommands()
		}

		commandConfigs.forEach((config: CommandConfig, index: number) => {
			this.addCommand({
				id: `${index}`,
				name: config.commandName,
				callback: createOrOpenFileCommandCallback(new ObsidianAdapter(this.app), config),
			})
		})

		this.hasRegisteredCommands = true
	}

	private unregisterCommands() {
		// Find and remove all commands belonging to this plugin
		const allCommands = this.app.commands.listCommands()
		const myCommands = allCommands.filter((cmd) => cmd.id.startsWith(this.manifest.id))
		myCommands.forEach((cmd) => {
			this.app.commands.removeCommand(cmd.id)
		})
	}

	async saveSettingsAndRegisterCommands(
		newSettings: CreateOrOpenFilePluginSettings,
	): Promise<void> {
		this.settings = newSettings
		await this.saveData(newSettings) // write to data.json
		this.registerCommands(newSettings.commandConfigs)
	}
}
