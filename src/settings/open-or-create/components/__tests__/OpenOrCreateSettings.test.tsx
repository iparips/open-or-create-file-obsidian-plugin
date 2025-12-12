import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { OpenOrCreateSettings } from '../OpenOrCreateSettings'
import type { CommandConfig, CreateOrOpenFilePluginSettings } from '../../../../types'
import { ValidationResult } from '../../../common/validation/validationResult'
import { aCommand, aSettings } from '../../../../test-support/builders'

// Mock child components to isolate tests
vi.mock('../../../common/components/ValidationSummary', () => ({
	ValidationSummary: () => <div data-testid="validation-summary" />,
}))

vi.mock('../CommandCard', () => ({
	CommandCard: ({
		command,
		index,
		onUpdate,
		onDelete,
	}: {
		command: CommandConfig
		index: number
		onUpdate: (index: number, field: keyof CommandConfig, value: string) => void
		onDelete: (index: number) => void
	}) => (
		<div data-testid={`command-card-${index}`}>
			<input
				data-testid={`command-name-${index}`}
				value={command.commandName}
				onChange={(e) => onUpdate(index, 'commandName', e.target.value)}
			/>
			<button data-testid={`delete-${index}`} onClick={() => onDelete(index)}>
				Delete
			</button>
		</div>
	),
}))

describe('OpenOrCreateSettings', () => {
	const mockUpdateSettings = vi.fn()
	let mockSettings: CreateOrOpenFilePluginSettings
	let mockValidationResult: ValidationResult

	beforeEach(() => {
		vi.clearAllMocks()
		mockSettings = aSettings()
			.withCommand(aCommand().withCommandName('Test Command 1').build())
			.build()
		mockValidationResult = new ValidationResult([])
	})

	afterEach(() => {
		cleanup()
	})

	it('renders command cards for each command', () => {
		render(
			<OpenOrCreateSettings
				settings={mockSettings}
				updateSettings={mockUpdateSettings}
				validationResult={mockValidationResult}
			/>,
		)

		expect(screen.getByTestId('command-card-0')).toBeDefined()
		expect(screen.getByDisplayValue('Test Command 1')).toBeDefined()
	})

	it('renders add command button', () => {
		render(
			<OpenOrCreateSettings
				settings={mockSettings}
				updateSettings={mockUpdateSettings}
				validationResult={mockValidationResult}
			/>,
		)

		expect(screen.getByText('Add command')).toBeDefined()
	})

	describe('addCommand', () => {
		it('adds new command with default values at the beginning', async () => {
			const user = userEvent.setup()

			render(
				<OpenOrCreateSettings
					settings={mockSettings}
					updateSettings={mockUpdateSettings}
					validationResult={mockValidationResult}
				/>,
			)

			await user.click(screen.getByText('Add command'))

			expect(mockUpdateSettings).toHaveBeenCalledWith({
				commandConfigs: [
					{
						commandName: '',
						templateFilePath: '',
						destinationFolderPattern: '',
						fileNamePattern: '',
						timeShift: '',
						usePreviousNoteAsTemplate: false,
					},
					{
						commandName: 'Test Command 1',
						templateFilePath: 'template.md',
						destinationFolderPattern: 'folder',
						fileNamePattern: 'file.md',
						timeShift: '',
						usePreviousNoteAsTemplate: false,
					},
				],
			})
		})
	})

	describe('updateCommand', () => {
		it('calls updateSettings when command field changes', async () => {
			const user = userEvent.setup()

			render(
				<OpenOrCreateSettings
					settings={mockSettings}
					updateSettings={mockUpdateSettings}
					validationResult={mockValidationResult}
				/>,
			)

			const input = screen.getByTestId('command-name-0')
			await user.type(input, 'X')

			expect(mockUpdateSettings).toHaveBeenCalledWith({
				commandConfigs: [
					{
						commandName: 'Test Command 1X',
						templateFilePath: 'template.md',
						destinationFolderPattern: 'folder',
						fileNamePattern: 'file.md',
						timeShift: '',
						usePreviousNoteAsTemplate: false,
					},
				],
			})
		})
	})

	describe('deleteCommand', () => {
		it('removes correct command when multiple exist', async () => {
			const user = userEvent.setup()
			const settingsWithMultiple = aSettings()
				.withCommands([
					aCommand().withCommandName('Command 1').withFileName('file1.md').build(),
					aCommand().withCommandName('Command 2').withFileName('file2.md').build(),
				])
				.build()

			render(
				<OpenOrCreateSettings
					settings={settingsWithMultiple}
					updateSettings={mockUpdateSettings}
					validationResult={mockValidationResult}
				/>,
			)

			await user.click(screen.getByTestId('delete-0'))

			expect(mockUpdateSettings).toHaveBeenCalledWith({
				commandConfigs: [
					{
						commandName: 'Command 2',
						templateFilePath: 'template.md',
						destinationFolderPattern: 'folder',
						fileNamePattern: 'file2.md',
						timeShift: '',
						usePreviousNoteAsTemplate: false,
					},
				],
			})
		})
	})
})
