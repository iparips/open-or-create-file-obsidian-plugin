import React, { useState } from 'react'
import type { CommandConfig, ValidationError } from '../../types'
import { SettingInput } from './SettingInput'
import { validateField, VALIDATIONS, type ValidationRule } from '../utils/validation/validateField'

interface ValidationErrors {
	commandName?: string
	templateFilePath?: string
	destinationFolderPattern?: string
	fileNamePattern?: string
	timeShift?: string
}

interface CommandCardProps {
	command: CommandConfig
	index: number
	onUpdate: (index: number, field: keyof CommandConfig, value: string) => void
	onDelete: (index: number) => void
	validationErrors?: ValidationError[]
}

export const CommandCard: React.FC<CommandCardProps> = ({
	command,
	index,
	onUpdate,
	onDelete,
	validationErrors: propValidationErrors = [],
}) => {
	const [localValidationErrors, setLocalValidationErrors] = useState<ValidationErrors>({})

	// Merge prop validation errors with local validation errors for display
	const propErrors: ValidationErrors = {}
	propValidationErrors.forEach((error) => {
		if (error.field in command) {
			propErrors[error.field as keyof CommandConfig] = error.message
		}
	})

	// Local errors take precedence over prop errors
	const displayErrors = { ...propErrors, ...localValidationErrors }

	const validate = (field: keyof CommandConfig, value: string, rules: ValidationRule[]) => {
		const errorMessage = validateField(rules, value)
		setLocalValidationErrors((prev: ValidationErrors) => ({ ...prev, [field]: errorMessage }))
	}

	return (
		<div className="command-container" data-plugin="open-or-create-file">
			<div className="settings-grid">
				<SettingInput
					name="Command name"
					description="The name will appear in Obsidian command palette"
					placeholder="Enter command name"
					value={command.commandName}
					onChange={(value) => onUpdate(index, 'commandName', value)}
					onBlur={(value) => validate('commandName', value, [VALIDATIONS.required])}
					error={displayErrors.commandName}
				/>

				<SettingInput
					name="Destination folder"
					description="Path / pattern for destination folder"
					placeholder="01 - Journal/Weekly/Week-{week}"
					value={command.destinationFolderPattern}
					onChange={(value) => onUpdate(index, 'destinationFolderPattern', value)}
					onBlur={(value) => validate('destinationFolderPattern', value, [VALIDATIONS.required])}
					error={displayErrors.destinationFolderPattern}
				/>

				<SettingInput
					name="File name"
					description="Path / pattern for the file name"
					placeholder="shopping-list.md"
					value={command.fileNamePattern}
					onChange={(value) => onUpdate(index, 'fileNamePattern', value)}
					onBlur={(value) => validate('fileNamePattern', value, [VALIDATIONS.requiredAndEndsWithMd])}
					error={displayErrors.fileNamePattern}
				/>

				<SettingInput
					name="Template file"
					description="Optional path to the template file"
					placeholder="00 - Meta/Templates/shopping-list-template.md"
					value={command.templateFilePath}
					onChange={(value) => onUpdate(index, 'templateFilePath', value)}
					onBlur={(value) => validate('templateFilePath', value, [VALIDATIONS.endsWithMd])}
					error={displayErrors.templateFilePath}
				/>

				<SettingInput
					name="Time shift"
					description="Optional time shift (e.g., '+1 day', '-1 week', '+2 months')"
					placeholder=""
					value={command.timeShift}
					onChange={(value) => onUpdate(index, 'timeShift', value)}
					onBlur={(value) => validate('timeShift', value, [VALIDATIONS.timeShift])}
					error={displayErrors.timeShift}
				/>
			</div>

			<div className="command-footer">
				<button className="mod-warning" onClick={() => onDelete(index)}>
					Delete
				</button>
			</div>
		</div>
	)
}
