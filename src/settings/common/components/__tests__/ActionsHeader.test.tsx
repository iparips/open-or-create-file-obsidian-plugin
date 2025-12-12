import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { saveAs } from 'file-saver'
import { ActionsHeader } from '../ActionsHeader'
import type { CreateOrOpenFilePluginSettings } from '../../../../types'
import { aCommand, aSettings } from '../../../../test-support/builders'

// Mock file-saver
vi.mock('file-saver', () => ({
	saveAs: vi.fn(),
}))

// Mock use-file-picker
const mockOpenFilePicker = vi.fn()
vi.mock('use-file-picker', () => ({
	useFilePicker: vi.fn(({ onFilesSuccessfullySelected }) => {
		// Store the callback so tests can trigger it
		mockOpenFilePicker.mockImplementation(() => {
			onFilesSuccessfullySelected({
				filesContent: [
					{
						content: JSON.stringify(
							aSettings()
								.withCommand(
									aCommand()
										.withCommandName('Imported Command')
										.withTemplatePath('imported.md')
										.withDestinationFolder('imported-folder')
										.withFileName('imported-file.md')
										.build(),
								)
								.build(),
						),
					},
				],
			})
		})
		return {
			openFilePicker: mockOpenFilePicker,
			loading: false,
		}
	}),
}))

describe('ActionsHeader', () => {
	const mockOnSettingsImported = vi.fn()
	let mockSettings: CreateOrOpenFilePluginSettings

	beforeEach(() => {
		vi.clearAllMocks()
		mockSettings = aSettings().withCommand(aCommand().build()).build()
	})

	afterEach(() => {
		cleanup()
	})

	it('renders import and export buttons', () => {
		render(<ActionsHeader settings={mockSettings} onSettingsImported={mockOnSettingsImported} />)

		expect(screen.getByText('Import settings')).toBeDefined()
		expect(screen.getByText('Export settings')).toBeDefined()
	})

	describe('export', () => {
		it('exports settings as JSON when export button is clicked', async () => {
			const user = userEvent.setup()

			render(<ActionsHeader settings={mockSettings} onSettingsImported={mockOnSettingsImported} />)

			await user.click(screen.getByText('Export settings'))

			expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'open-or-create-file-settings.json')
		})
	})

	describe('import', () => {
		it('opens file picker when import button is clicked', async () => {
			const user = userEvent.setup()

			render(<ActionsHeader settings={mockSettings} onSettingsImported={mockOnSettingsImported} />)

			await user.click(screen.getByText('Import settings'))

			expect(mockOpenFilePicker).toHaveBeenCalled()
		})

		it('calls onSettingsImported with parsed settings when valid file is selected', async () => {
			const user = userEvent.setup()

			render(<ActionsHeader settings={mockSettings} onSettingsImported={mockOnSettingsImported} />)

			await user.click(screen.getByText('Import settings'))

			expect(mockOnSettingsImported).toHaveBeenCalledWith(
				aSettings()
					.withCommand(
						aCommand()
							.withCommandName('Imported Command')
							.withTemplatePath('imported.md')
							.withDestinationFolder('imported-folder')
							.withFileName('imported-file.md')
							.build(),
					)
					.build(),
			)
		})
	})
})
