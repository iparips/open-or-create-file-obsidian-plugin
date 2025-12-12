import { Notice } from 'obsidian'
import type { CommandConfig, CreateOrOpenFilePluginSettings } from '../../types'
import { DEFAULT_SETTINGS } from './constants'
import { validateSettings } from './validation/validateSettings'
const DEFAULT_COMMAND_CONFIG: Partial<CommandConfig> = {
	usePreviousNoteAsTemplate: false,
}

export async function configureDefaultsAndValidateSettings(
	loadData: () => Promise<CreateOrOpenFilePluginSettings>,
): Promise<CreateOrOpenFilePluginSettings> {
	try {
		const data = await loadData()
		const settings = data || DEFAULT_SETTINGS

		// Ensure all commands have the new optional fields (for backward compatibility)
		settings.commandConfigs = settings.commandConfigs.map((config) =>
			Object.assign({}, DEFAULT_COMMAND_CONFIG, config),
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
