import type { ValidationError, CreateOrOpenFilePluginSettingsJSON } from '../../../types'
import { ValidationErrors } from './ValidationErrors'
import { CreateOrOpenFilePluginSettings } from '../../models/CreateOrOpenFilePluginSettings'

export class ValidationResult {
	public readonly isValid: boolean
	public readonly errors: ValidationError[]
	public readonly settings: CreateOrOpenFilePluginSettings

	constructor(errors: ValidationError[], settingsData: CreateOrOpenFilePluginSettingsJSON) {
		this.errors = errors
		this.settings = CreateOrOpenFilePluginSettings.fromJSON(settingsData)
		this.isValid = errors.length === 0
	}

	fold<T>(
		successCallback: (validSettings: CreateOrOpenFilePluginSettings) => T,
		failCallback: (errors: ValidationErrors) => T,
	): T {
		if (this.isValid) {
			return successCallback(this.settings)
		} else {
			const validationErrors = new ValidationErrors(this.errors)
			return failCallback(validationErrors)
		}
	}

	getErrorsForCommand(commandIndex: number): ValidationError[] {
		return this.errors.filter((error) => error.commandIndex === commandIndex)
	}
}
