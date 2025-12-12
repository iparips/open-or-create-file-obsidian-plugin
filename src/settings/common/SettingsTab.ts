import { App, PluginSettingTab, Notice } from 'obsidian'
import React from 'react'
import { createRoot, type Root } from 'react-dom/client'

import type CreateOrOpenFilePlugin from '../../main'
import { SettingsLayout } from './components/SettingsLayout'
import { CreateOrOpenFilePluginSettings } from '../../types'
import { validateSettings } from './validation/validateSettings'

export class SettingsTab extends PluginSettingTab {
	saveSettingsAndRegisterCommands: (newSettings: CreateOrOpenFilePluginSettings) => Promise<void>
	private root: Root | null = null

	constructor(
		app: App,
		plugin: CreateOrOpenFilePlugin,
		saveSettingsAndRegisterCommands: (newSettings: CreateOrOpenFilePluginSettings) => Promise<void>,
	) {
		super(app, plugin)
		this.saveSettingsAndRegisterCommands = saveSettingsAndRegisterCommands
	}

	display(): void {
		const { containerEl } = this
		containerEl.empty()

		// Get initial settings from plugin
		const plugin = this.plugin as CreateOrOpenFilePlugin
		const currentSettings = plugin.settings

		this.root = createRoot(containerEl)
		this.root.render(
			React.createElement(SettingsLayout, {
				settings: currentSettings,
				saveSettingsAndRegisterCommands: this.saveSettingsAndRegisterCommands,
				settingsEvents: plugin.settingsEvents,
			}),
		)
	}

	hide(): void {
		const validationResult = validateSettings((this.plugin as CreateOrOpenFilePlugin).settings)
		if (!validationResult.isValid) {
			new Notice(`Please fill out the required settings for the new command to work`, 10000)
		}
		// Clean up React root when settings tab is hidden
		if (this.root) {
			this.root.unmount()
			this.root = null
		}
	}
}
