import React from 'react'
import type { CommandConfig, CreateOrOpenFilePluginSettings } from '../../../types'
import { ValidationSummary } from '../../common/components/ValidationSummary'
import { CommandCard } from './CommandCard'
import type { ValidationResult } from '../../common/validation/validationResult'

interface OpenOrCreateSettingsProps {
	settings: CreateOrOpenFilePluginSettings
	updateSettings: (newSettings: CreateOrOpenFilePluginSettings) => Promise<void>
	validationResult: ValidationResult
}

export const OpenOrCreateSettings: React.FC<OpenOrCreateSettingsProps> = ({
	settings,
	updateSettings,
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
		await updateSettings(newSettings)
	}

	const deleteCommand = async (index: number) => {
		const newSettings = { ...settings }
		newSettings.commandConfigs.splice(index, 1)
		await updateSettings(newSettings)
	}

	const addCommand = async () => {
		const newSettings = { ...settings }
		newSettings.commandConfigs = [
			{
				commandName: '',
				templateFilePath: '',
				destinationFolderPattern: '',
				fileNamePattern: '',
				timeShift: '',
				usePreviousNoteAsTemplate: false,
			},
			...newSettings.commandConfigs,
		]
		await updateSettings(newSettings)
	}

	return (
		<div className="open-or-create-settings">
			<div className="button-container" data-plugin="open-or-create-file">
				<button onClick={addCommand}>Add command</button>
			</div>
			<ValidationSummary validationResult={validationResult} />
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
