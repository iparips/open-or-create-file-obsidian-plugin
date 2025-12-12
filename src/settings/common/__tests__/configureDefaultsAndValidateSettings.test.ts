import { beforeEach, describe, expect, it, vi } from 'vitest'
import { configureDefaultsAndValidateSettings } from '../configureDefaultsAndValidateSettings'
import { DEFAULT_SETTINGS } from '../constants'
import { validateSettings } from '../validation/validateSettings'
import { ValidationResult } from '../validation/validationResult'
import { Notice } from 'obsidian'
import type { CreateOrOpenFilePluginSettings } from '../../../types'

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
			const validSettings: CreateOrOpenFilePluginSettings = {
				commandConfigs: [
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
			const loadData = vi.fn().mockResolvedValue(validSettings)
			vi.mocked(validateSettings).mockReturnValue(new ValidationResult([]))

			// Act
			const result = await configureDefaultsAndValidateSettings(loadData)

			// Assert
			expect(result).toEqual(validSettings)
		})

		it('defaults usePreviousNoteAsTemplate to false when it is missing', async () => {
			// Arrange
			const settingsWithoutField = {
				commandConfigs: [
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
			vi.mocked(validateSettings).mockReturnValue(new ValidationResult([]))

			// Act
			const result = await configureDefaultsAndValidateSettings(loadData)

			// Assert
			expect(result.commandConfigs[0].usePreviousNoteAsTemplate).toBe(false)
		})

		it('uses default settings when loaded settings are undefined', async () => {
			// Arrange
			const loadData = vi.fn().mockResolvedValue(undefined)
			vi.mocked(validateSettings).mockReturnValue(new ValidationResult([]))

			// Act
			const result = await configureDefaultsAndValidateSettings(loadData)

			// Assert
			expect(result).toEqual(DEFAULT_SETTINGS)
		})

		it('returns default settings and logs an error when settings are invalid', async () => {
			// Arrange
			const invalidSettings: CreateOrOpenFilePluginSettings = {
				commandConfigs: [
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
			const loadData = vi.fn().mockResolvedValue(invalidSettings)
			const validationErrors = [
				{ field: 'commandName', fieldDisplayName: 'Command name', message: 'Required' },
			]
			vi.mocked(validateSettings).mockReturnValue(new ValidationResult(validationErrors))
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

			// Act
			const result = await configureDefaultsAndValidateSettings(loadData)

			// Assert
			expect(result).toEqual(DEFAULT_SETTINGS)
			expect(consoleErrorSpy).toHaveBeenCalledWith('[Settings] Invalid settings:', validationErrors)
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
			const result = await configureDefaultsAndValidateSettings(loadData)

			// Assert
			expect(result).toEqual(DEFAULT_SETTINGS)
			expect(consoleErrorSpy).toHaveBeenCalledWith('[Settings] Error loading settings:', error)
			expect(Notice).toHaveBeenCalledWith('Failed to load settings. Using defaults.')

			consoleErrorSpy.mockRestore()
		})
	})
})
