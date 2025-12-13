import { Notice } from 'obsidian'
import type { OpenOrCreateCommandConfig, CreateOrOpenFilePluginSettingsJSON } from '../../types'
import { CreateOrOpenFilePluginSettings } from '../models/CreateOrOpenFilePluginSettings'
import { validateSettings } from './validation/validateSettings'

const DEFAULT_COMMAND_CONFIG: Partial<OpenOrCreateCommandConfig> = {
	templateFilePath: '',
	timeShift: '',
	usePreviousNoteAsTemplate: false,
}

function migrateAndApplyDefaults(data: unknown): CreateOrOpenFilePluginSettingsJSON {
	let settingsJSON = (data ||
		CreateOrOpenFilePluginSettings.DEFAULT.toJSON()) as CreateOrOpenFilePluginSettingsJSON

	// Backwards compatibility: prefer commandConfigs if present (old plugin might have updated it)
	// This handles the case where:
	// 1. New plugin writes both fields
	// 2. Old plugin reads commandConfigs, edits, writes only commandConfigs
	// 3. New plugin needs to use the updated commandConfigs, not stale openOrCreateCommandConfigs
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if ((settingsJSON as any).commandConfigs) {
		settingsJSON = {
			...settingsJSON,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			openOrCreateCommandConfigs: (settingsJSON as any).commandConfigs,
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		delete (settingsJSON as any).commandConfigs
	}

	// Ensure all commands have the new optional fields (for backward compatibility)
	settingsJSON.openOrCreateCommandConfigs = settingsJSON.openOrCreateCommandConfigs.map((config) =>
		Object.assign({}, DEFAULT_COMMAND_CONFIG, config),
	)

	return settingsJSON
}

export async function parseSettings(
	loadData: () => Promise<CreateOrOpenFilePluginSettingsJSON>,
): Promise<CreateOrOpenFilePluginSettings> {
	try {
		const data = await loadData()
		const settingsJSON = migrateAndApplyDefaults(data)
		const validationResult = validateSettings(settingsJSON)

		return validationResult.fold(
			(validSettings) => validSettings,
			(errors) => {
				console.error('[Settings] Invalid settings:', errors.getErrorSummary())
				new Notice('Settings file is invalid. Using defaults.')
				return CreateOrOpenFilePluginSettings.DEFAULT
			},
		)
	} catch (error) {
		console.error('[Settings] Error loading settings:', error)
		new Notice('Failed to load settings. Using defaults.')
		return CreateOrOpenFilePluginSettings.DEFAULT
	}
}
