import { describe, expect, it } from 'vitest'
import { isCommandSettings, isImportedSettings, isObject, isString } from '../typeGuards'

describe('isString', () => {
	it('should return true for strings', () => {
		expect(isString('hello')).toBe(true)
		expect(isString('')).toBe(true)
		expect(isString('   ')).toBe(true)
	})

	it('should return false for non-strings', () => {
		expect(isString(123)).toBe(false)
		expect(isString(null)).toBe(false)
		expect(isString(undefined)).toBe(false)
		expect(isString({})).toBe(false)
		expect(isString([])).toBe(false)
		expect(isString(true)).toBe(false)
	})
})

describe('isObject', () => {
	it('should return true for plain objects', () => {
		expect(isObject({})).toBe(true)
		expect(isObject({ key: 'value' })).toBe(true)
	})

	it('should return false for non-objects', () => {
		expect(isObject(null)).toBe(false)
		expect(isObject(undefined)).toBe(false)
		expect(isObject('string')).toBe(false)
		expect(isObject(123)).toBe(false)
		expect(isObject([])).toBe(false)
		expect(isObject(true)).toBe(false)
	})

	it('should return false for arrays', () => {
		expect(isObject([])).toBe(false)
		expect(isObject([1, 2, 3])).toBe(false)
	})
})

describe('isCommandSettings', () => {
	it('should return true for valid command settings', () => {
		const validCommand = {
			commandName: 'test-command',
			templateFilePath: 'template.md',
			destinationFolderPattern: 'folder',
			fileNamePattern: 'file.md',
		}
		expect(isCommandSettings(validCommand)).toBe(true)
	})

	it('should return true for command with undefined templateFilePath', () => {
		const validCommand = {
			commandName: 'test-command',
			templateFilePath: undefined,
			destinationFolderPattern: 'folder',
			fileNamePattern: 'file.md',
		}
		expect(isCommandSettings(validCommand)).toBe(true)
	})

	it('should return true for command with empty string templateFilePath', () => {
		const validCommand = {
			commandName: 'test-command',
			templateFilePath: '',
			destinationFolderPattern: 'folder',
			fileNamePattern: 'file.md',
		}
		expect(isCommandSettings(validCommand)).toBe(true)
	})

	it('should return false for non-objects', () => {
		expect(isCommandSettings(null)).toBe(false)
		expect(isCommandSettings(undefined)).toBe(false)
		expect(isCommandSettings('string')).toBe(false)
		expect(isCommandSettings(123)).toBe(false)
		expect(isCommandSettings([])).toBe(false)
	})

	it('should return false for objects missing required fields', () => {
		expect(isCommandSettings({})).toBe(false)
		expect(isCommandSettings({ commandName: 'test' })).toBe(false)
		expect(
			isCommandSettings({
				commandName: 'test',
				destinationFolderPattern: 'folder',
			}),
		).toBe(false)
	})

	it('should return false for objects with wrong field types', () => {
		expect(
			isCommandSettings({
				commandName: 123,
				templateFilePath: 'template.md',
				destinationFolderPattern: 'folder',
				fileNamePattern: 'file.md',
			}),
		).toBe(false)

		expect(
			isCommandSettings({
				commandName: 'test',
				templateFilePath: 123,
				destinationFolderPattern: 'folder',
				fileNamePattern: 'file.md',
			}),
		).toBe(false)

		expect(
			isCommandSettings({
				commandName: 'test',
				templateFilePath: 'template.md',
				destinationFolderPattern: 123,
				fileNamePattern: 'file.md',
			}),
		).toBe(false)

		expect(
			isCommandSettings({
				commandName: 'test',
				templateFilePath: 'template.md',
				destinationFolderPattern: 'folder',
				fileNamePattern: 123,
			}),
		).toBe(false)
	})
})

describe('isImportedSettings', () => {
	it('should return true for valid imported settings', () => {
		const validData = {
			commandConfigs: [
				{
					commandName: 'test-command-1',
					templateFilePath: 'template.md',
					destinationFolderPattern: 'folder',
					fileNamePattern: 'file.md',
				},
				{
					commandName: 'test-command-2',
					templateFilePath: undefined,
					destinationFolderPattern: 'folder',
					fileNamePattern: 'file.md',
				},
			],
		}
		expect(isImportedSettings(validData)).toBe(true)
	})

	it('should return true for empty commands array', () => {
		expect(isImportedSettings({ commandConfigs: [] })).toBe(true)
	})

	it('should return false for non-objects', () => {
		expect(isImportedSettings(null)).toBe(false)
		expect(isImportedSettings(undefined)).toBe(false)
		expect(isImportedSettings('string')).toBe(false)
		expect(isImportedSettings(123)).toBe(false)
		expect(isImportedSettings([])).toBe(false)
	})

	it('should return false for objects without commands', () => {
		expect(isImportedSettings({})).toBe(false)
		expect(isImportedSettings({ otherField: 'value' })).toBe(false)
	})

	it('should return false for objects with non-array commands', () => {
		expect(isImportedSettings({ commandConfigs: 'not-array' })).toBe(false)
		expect(isImportedSettings({ commandConfigs: 123 })).toBe(false)
		expect(isImportedSettings({ commandConfigs: {} })).toBe(false)
		expect(isImportedSettings({ commandConfigs: null })).toBe(false)
	})

	it('should return false for arrays with invalid commandConfigs', () => {
		expect(
			isImportedSettings({
				commandConfigs: [null],
			}),
		).toBe(false)

		expect(
			isImportedSettings({
				commandConfigs: ['string'],
			}),
		).toBe(false)

		expect(
			isImportedSettings({
				commandConfigs: [123],
			}),
		).toBe(false)

		expect(
			isImportedSettings({
				commandConfigs: [
					{
						commandName: 'valid-command',
						templateFilePath: 'template.md',
						destinationFolderPattern: 'folder',
						fileNamePattern: 'file.md',
					},
					{ commandName: 123 }, // Invalid command
				],
			}),
		).toBe(false)
	})
})
