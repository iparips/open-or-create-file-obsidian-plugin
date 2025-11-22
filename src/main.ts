import { Plugin } from 'obsidian'
import { CreateOrOpenFileSettingsTab } from './settings/CreateOrOpenFileSettingsTab'
import { DEFAULT_SETTINGS } from './settings/constants'
import { createOrOpenFileCommandCallback } from './command/commandCallback'
import { ObsidianAdapter } from './notes/obsidianAdapter'
import { CommandConfig, CreateOrOpenFilePluginSettings } from './types'

export default class CreateOrOpenFilePlugin extends Plugin {
	settings!: CreateOrOpenFilePluginSettings
	private isInitialLoad = true

	async onload() {
		this.settings = await this.loadSettingsFromFile()
		this.registerCommands(this.settings.commandConfigs)
		// bind this so that "this" reference inside update updateSettings points to MyPlugin.
		this.addSettingTab(
			new CreateOrOpenFileSettingsTab(this.app, this, this.updateSettings.bind(this)),
		)
	}

	private async loadSettingsFromFile(): Promise<CreateOrOpenFilePluginSettings> {
		const data: CreateOrOpenFilePluginSettings = await this.loadData()
		const settings = Object.assign({}, DEFAULT_SETTINGS, data)

		// Ensure all commands have the new optional fields
		settings.commandConfigs = settings.commandConfigs.map((config) => ({
			...config,
			usePreviousNoteAsTemplate: config.usePreviousNoteAsTemplate ?? false,
		}))

		return settings
	}

	onunload() {
		this.unregisterCommands()
	}

	private registerCommands(commandConfigs: CommandConfig[]): void {
		// Only unregister if we're not in the initial loading phase
		// During onload, there are no existing commands to clean up
		if (!this.isInitialLoad) {
			this.unregisterCommands()
		}

		commandConfigs.forEach((config: CommandConfig, index: number) => {
			this.addCommand({
				id: `${index}`,
				name: config.commandName,
				callback: createOrOpenFileCommandCallback(new ObsidianAdapter(this.app), config),
			})
		})
	}

	private unregisterCommands() {
		// Find and remove all commands belonging to this plugin
		const allCommands = this.app.commands.listCommands()
		const myCommands = allCommands.filter((cmd) => cmd.id.startsWith(this.manifest.id))
		myCommands.forEach((cmd) => {
			this.app.commands.removeCommand(cmd.id)
		})
	}

	async updateSettings(newSettings: CreateOrOpenFilePluginSettings): Promise<void> {
		this.settings = newSettings
		await this.saveData(newSettings) // write to data.json
		this.isInitialLoad = false // Mark that we're no longer in initial load
		this.registerCommands(newSettings.commandConfigs)
	}
}
