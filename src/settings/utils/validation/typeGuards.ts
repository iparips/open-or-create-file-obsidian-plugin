import type { CommandConfig, CreateOrOpenFilePluginSettings } from '../../../types'

export function isString(value: unknown): value is string {
	return typeof value === 'string'
}

export function isObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function isCommandSettings(value: unknown): value is CommandConfig {
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

export function isImportedSettings(value: unknown): value is CreateOrOpenFilePluginSettings {
	if (!isObject(value)) return false

	const { commandConfigs } = value
	if (!Array.isArray(commandConfigs)) return false

	return commandConfigs.every(isCommandSettings)
}
