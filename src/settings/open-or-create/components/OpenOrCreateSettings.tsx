import React from 'react'
import type { CommandConfig, CreateOrOpenFilePluginSettings } from '../../../types'
import { CommandCard } from './CommandCard'
import type { ValidationResult } from '../../common/validation/validationResult'
import { EMPTY_COMMAND_CONFIG } from '../../common/constants'

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
		commandKey: keyof CommandConfig,
		newValue: string | boolean,
	) => {
		const newSettings = {
			...settings,
			commandConfigs: settings.commandConfigs.map((config, i) =>
				i === index ? { ...config, [commandKey]: newValue } : config,
			),
		}
		await updateSettingsAndTriggerValidation(newSettings)
	}

	const deleteCommand = async (index: number) => {
		const newSettings = { ...settings }
		newSettings.commandConfigs.splice(index, 1)
		await updateSettingsAndTriggerValidation(newSettings)
	}

	const addCommand = async () => {
		const newSettings = { ...settings }
		newSettings.commandConfigs = [EMPTY_COMMAND_CONFIG, ...newSettings.commandConfigs]
		await updateSettingsAndTriggerValidation(newSettings)
	}

	return (
		<div className="open-or-create-settings">
			<div className="button-container" data-plugin="open-or-create-file">
				<button onClick={addCommand}>Add command</button>
			</div>
			{settings.commandConfigs.map((command: CommandConfig, index) => (
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
