import { Notice } from 'obsidian'
import type { OpenOrCreateCommandConfig, CreateOrOpenFilePluginSettings } from '../../types'
import { DEFAULT_SETTINGS } from './constants'
import { validateSettings } from './validation/validateSettings'
const DEFAULT_COMMAND_CONFIG: Partial<OpenOrCreateCommandConfig> = {
	usePreviousNoteAsTemplate: false,
}

export async function configureDefaultsAndValidateSettings(
	loadData: () => Promise<CreateOrOpenFilePluginSettings>,
): Promise<CreateOrOpenFilePluginSettings> {
	try {
		const data = await loadData()
		let settings = data || DEFAULT_SETTINGS

		// Migrate old field name (backward compatibility)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if ((settings as any).commandConfigs && !settings.openOrCreateCommandConfigs) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			settings = {
				...settings,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				openOrCreateCommandConfigs: (settings as any).commandConfigs,
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			delete (settings as any).commandConfigs
		}

		// Ensure all commands have the new optional fields (for backward compatibility)
		settings.openOrCreateCommandConfigs = settings.openOrCreateCommandConfigs.map((config) =>
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
