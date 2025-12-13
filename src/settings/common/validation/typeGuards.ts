import type { OpenOrCreateCommandConfig, CreateOrOpenFilePluginSettingsJSON } from '../../../types'

export function isString(value: unknown): value is string {
	return typeof value === 'string'
}

export function isObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function isCommandSettings(value: unknown): value is OpenOrCreateCommandConfig {
	if (!isObject(value)) return false

	const { commandName, templateFilePath, destinationFolderPattern, fileNamePattern, timeShift } =
		value

	return (
		isString(commandName) &&
		(templateFilePath === undefined || isString(templateFilePath)) &&
		isString(destinationFolderPattern) &&
		isString(fileNamePattern) &&
		(timeShift === undefined || isString(timeShift))
	)
}

export function isImportedSettings(value: unknown): value is CreateOrOpenFilePluginSettingsJSON {
	if (!isObject(value)) return false

	const { openOrCreateCommandConfigs } = value
	if (!Array.isArray(openOrCreateCommandConfigs)) return false

	return openOrCreateCommandConfigs.every(isCommandSettings)
}
