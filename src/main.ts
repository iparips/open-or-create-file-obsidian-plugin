import { debounce, Events, Notice, Plugin } from 'obsidian'
import { SettingsTab } from './settings/common/SettingsTab'
import { createOrOpenFileCommandCallback } from './command/open-or-create/commandCallback'
import { ObsidianAdapter } from './notes/obsidianAdapter'
import { OpenOrCreateCommandConfig } from './types'
import { CreateOrOpenFilePluginSettings } from './settings/models/CreateOrOpenFilePluginSettings'
import { parseSettings } from './settings/common/parseSettings'

export default class CreateOrOpenFilePlugin extends Plugin {
	settings!: CreateOrOpenFilePluginSettings
	settingsEvents = new Events()
	private hasRegisteredCommands = false

	private debouncedReload = debounce(
		async () => {
			this.settings = await parseSettings(() => this.loadData())
			this.registerCommands(this.settings.getOpenOrCreateCommandConfigs())
			this.settingsEvents.trigger('settings-reloaded', this.settings)
			new Notice('Settings updated from external.')
		},
		100,
		false,
	)

	async onload() {
		this.settings = await parseSettings(() => this.loadData())
		this.registerCommands(this.settings.getOpenOrCreateCommandConfigs())

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

	private registerCommands(commandConfigs: OpenOrCreateCommandConfig[]): void {
		// Only unregister if we've previously registered commands
		if (this.hasRegisteredCommands) {
			this.unregisterCommands()
		}

		commandConfigs.forEach((config: OpenOrCreateCommandConfig, index: number) => {
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
		await this.saveData(newSettings.toJSON()) // write to data.json
		this.registerCommands(newSettings.getOpenOrCreateCommandConfigs())
	}
}
