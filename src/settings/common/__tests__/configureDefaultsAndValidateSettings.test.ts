import { beforeEach, describe, expect, it, vi } from 'vitest'
import { parseSettings } from '../parseSettings'
import { DEFAULT_SETTINGS_JSON } from '../constants'
import { validateSettings } from '../validation/validateSettings'
import { ValidationResult } from '../validation/validationResult'
import { Notice } from 'obsidian'
import type { CreateOrOpenFilePluginSettingsJSON } from '../../../types'

vi.mock('obsidian', () => ({
	Notice: vi.fn(),
}))

vi.mock('../validation/validateSettings', () => ({
	validateSettings: vi.fn(),
}))

describe('configureDefaultsAndValidateSettings', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('when read is successful', () => {
		it('returns settings when settings are valid', async () => {
			// Arrange
			const validSettingsJSON: CreateOrOpenFilePluginSettingsJSON = {
				openOrCreateCommandConfigs: [
					{
						commandName: 'Test Command',
						templateFilePath: 'template.md',
						destinationFolderPattern: 'folder',
						fileNamePattern: 'file.md',
						timeShift: '',
						usePreviousNoteAsTemplate: false,
					},
				],
			}
			const loadData = vi.fn().mockResolvedValue(validSettingsJSON)
			vi.mocked(validateSettings).mockReturnValue(new ValidationResult([], validSettingsJSON))

			// Act
			const result = await parseSettings(loadData)

			// Assert - verify openOrCreateCommandConfigs matches (commandConfigs is for backward compatibility)
			expect(result.toJSON().openOrCreateCommandConfigs).toEqual(
				validSettingsJSON.openOrCreateCommandConfigs,
			)
		})

		it('defaults usePreviousNoteAsTemplate to false when it is missing', async () => {
			// Arrange
			const settingsWithoutField = {
				openOrCreateCommandConfigs: [
					{
						commandName: 'Test Command',
						templateFilePath: 'template.md',
						destinationFolderPattern: 'folder',
						fileNamePattern: 'file.md',
						timeShift: '',
					},
				],
			}
			const loadData = vi.fn().mockResolvedValue(settingsWithoutField)
			const settingsWithDefaults = {
				openOrCreateCommandConfigs: [
					{
						commandName: 'Test Command',
						templateFilePath: 'template.md',
						destinationFolderPattern: 'folder',
						fileNamePattern: 'file.md',
						timeShift: '',
						usePreviousNoteAsTemplate: false,
					},
				],
			}
			vi.mocked(validateSettings).mockReturnValue(new ValidationResult([], settingsWithDefaults))

			// Act
			const result = await parseSettings(loadData)

			// Assert
			expect(result.getOpenOrCreateCommandConfigs()[0].usePreviousNoteAsTemplate).toBe(false)
		})

		it('uses default settings when loaded settings are undefined', async () => {
			// Arrange
			const loadData = vi.fn().mockResolvedValue(undefined)
			vi.mocked(validateSettings).mockReturnValue(new ValidationResult([], DEFAULT_SETTINGS_JSON))

			// Act
			const result = await parseSettings(loadData)

			// Assert - verify openOrCreateCommandConfigs matches (commandConfigs is for backward compatibility)
			expect(result.toJSON().openOrCreateCommandConfigs).toEqual(
				DEFAULT_SETTINGS_JSON.openOrCreateCommandConfigs,
			)
		})

		it('returns default settings and logs an error when settings are invalid', async () => {
			// Arrange
			const invalidSettingsJSON: CreateOrOpenFilePluginSettingsJSON = {
				openOrCreateCommandConfigs: [
					{
						commandName: '',
						templateFilePath: '',
						destinationFolderPattern: '',
						fileNamePattern: '',
						timeShift: '',
						usePreviousNoteAsTemplate: false,
					},
				],
			}
			const loadData = vi.fn().mockResolvedValue(invalidSettingsJSON)
			const validationErrors = [
				{
					field: 'commandName',
					fieldDisplayName: 'Command name',
					message: 'Required',
					commandIndex: 0,
				},
			]
			vi.mocked(validateSettings).mockReturnValue(
				new ValidationResult(validationErrors, invalidSettingsJSON),
			)
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

			// Act
			const result = await parseSettings(loadData)

			// Assert - verify openOrCreateCommandConfigs matches (commandConfigs is for backward compatibility)
			expect(result.toJSON().openOrCreateCommandConfigs).toEqual(
				DEFAULT_SETTINGS_JSON.openOrCreateCommandConfigs,
			)
			expect(consoleErrorSpy).toHaveBeenCalledWith('[Settings] Invalid settings:', [
				'Command 1 - Command name: Required',
			])
			expect(Notice).toHaveBeenCalledWith('Settings file is invalid. Using defaults.')

			consoleErrorSpy.mockRestore()
		})
	})

	describe('when read is unsuccessful', () => {
		it('returns default settings and logs an error', async () => {
			// Arrange
			const error = new Error('Failed to read file')
			const loadData = vi.fn().mockRejectedValue(error)
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

			// Act
			const result = await parseSettings(loadData)

			// Assert - verify openOrCreateCommandConfigs matches (commandConfigs is for backward compatibility)
			expect(result.toJSON().openOrCreateCommandConfigs).toEqual(
				DEFAULT_SETTINGS_JSON.openOrCreateCommandConfigs,
			)
			expect(consoleErrorSpy).toHaveBeenCalledWith('[Settings] Error loading settings:', error)
			expect(Notice).toHaveBeenCalledWith('Failed to load settings. Using defaults.')

			consoleErrorSpy.mockRestore()
		})
	})
})
