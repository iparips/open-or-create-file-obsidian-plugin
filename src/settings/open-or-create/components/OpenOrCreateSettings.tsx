import React from 'react'
import type { OpenOrCreateCommandConfig } from '../../../types'
import { CreateOrOpenFilePluginSettings } from '../../models/CreateOrOpenFilePluginSettings'
import { CommandCard } from './CommandCard'
import type { ValidationResult } from '../../common/validation/validationResult'

interface OpenOrCreateSettingsProps {
	settings: CreateOrOpenFilePluginSettings
	updateSettingsAndTriggerValidation: (newSettings: CreateOrOpenFilePluginSettings) => Promise<void>
	validationResult: ValidationResult
}

export const OpenOrCreateSettings: React.FC<OpenOrCreateSettingsProps> = ({
	settings,
	updateSettingsAndTriggerValidation,
	validationResult,
}) => {
	const updateCommand = async (
		index: number,
		commandKey: keyof OpenOrCreateCommandConfig,
		newValue: string | boolean,
	) => {
		const newSettings = CreateOrOpenFilePluginSettings.fromJSON(settings.toJSON())
		newSettings.updateOpenOrCreateCommand(index, commandKey, newValue)
		await updateSettingsAndTriggerValidation(newSettings)
	}

	const deleteCommand = async (index: number) => {
		const newSettings = CreateOrOpenFilePluginSettings.fromJSON(settings.toJSON())
		newSettings.deleteOpenOrCreateCommand(index)
		await updateSettingsAndTriggerValidation(newSettings)
	}

	const addCommand = async () => {
		const newSettings = CreateOrOpenFilePluginSettings.fromJSON(settings.toJSON())
		newSettings.addOpenOrCreateCommand()
		await updateSettingsAndTriggerValidation(newSettings)
	}

	return (
		<div className="open-or-create-settings">
			<div className="button-container" data-plugin="open-or-create-file">
				<button onClick={addCommand}>Add command</button>
			</div>
			{settings.getOpenOrCreateCommandConfigs().map((command: OpenOrCreateCommandConfig, index) => (
				<CommandCard
					key={index}
					command={command}
					index={index}
					onUpdate={updateCommand}
					onDelete={deleteCommand}
					validationErrors={validationResult.getErrorsForCommand(index)}
				/>
			))}
		</div>
	)
}
