import React, { useEffect, useState } from 'react'
import type { CommandConfig, CreateOrOpenFilePluginSettings } from '../../types'

import { ActionsHeader } from './ActionsHeader'
import { CommandCard } from './CommandCard'
import { ValidationSummary } from './ValidationSummary'
import { validateSettings } from '../utils/validation/validateSettings'
import { ValidationResult } from '../utils/validation/validationResult'

interface SettingsProps {
	settings: CreateOrOpenFilePluginSettings
	updatePluginSettings: (newSettings: CreateOrOpenFilePluginSettings) => Promise<void>
}

export const SettingsComponent = ({ settings, updatePluginSettings }: SettingsProps) => {
	const [localSettings, setLocalSettings] = useState<CreateOrOpenFilePluginSettings>(settings)
	const [validationResult, setValidationResult] = useState<ValidationResult>(
		new ValidationResult([]),
	)

	const updateCommand = async (
		index: number,
		commandKey: keyof CommandConfig,
		newValue: string | boolean,
	) => {
		const newSettings = {
			...localSettings,
			commandConfigs: localSettings.commandConfigs.map((config, i) =>
				i === index ? { ...config, [commandKey]: newValue } : config,
			),
		}
		setLocalSettings(newSettings)
		await updatePluginSettings(newSettings)
	}

	const deleteCommand = async (index: number) => {
		const newSettings = { ...localSettings }
		newSettings.commandConfigs.splice(index, 1)
		setLocalSettings(newSettings)
		await updatePluginSettings(newSettings)
	}

	const addCommand = async () => {
		const newSettings = { ...localSettings }
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
		setLocalSettings(newSettings)
		await updatePluginSettings(newSettings)
	}

	const handleSettingsImported = async (importedSettings: CreateOrOpenFilePluginSettings) => {
		setLocalSettings(importedSettings)
		await updatePluginSettings(importedSettings)
	}

	useEffect(() => {
		const result = validateSettings(localSettings)
		setValidationResult(result)
	}, [localSettings])

	return (
		<div className="open-or-create-file-settings" data-plugin="open-or-create-file">
			<ActionsHeader
				settings={localSettings}
				onSettingsImported={handleSettingsImported}
				onAddCommand={addCommand}
			/>
			<ValidationSummary validationResult={validationResult} />
			{localSettings.commandConfigs.map((command: CommandConfig, index) => (
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
