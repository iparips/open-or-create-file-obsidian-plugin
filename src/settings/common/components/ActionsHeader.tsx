import React from 'react'
import { saveAs } from 'file-saver'
import { useFilePicker } from 'use-file-picker'
import type { SelectedFiles } from '../../../types'
import { CreateOrOpenFilePluginSettings } from '../../models/CreateOrOpenFilePluginSettings'
import { parseSettings } from '../parseSettings'

interface ActionsHeaderProps {
	settings: CreateOrOpenFilePluginSettings
	updateSettingsAndTriggerValidation: (settings: CreateOrOpenFilePluginSettings) => Promise<void>
}

export const ActionsHeader: React.FC<ActionsHeaderProps> = ({
	settings,
	updateSettingsAndTriggerValidation,
}) => {
	const exportSettings = (): void => {
		const dataStr: string = JSON.stringify(settings.toJSON(), null, 2)
		const blob: Blob = new Blob([dataStr], { type: 'application/json' })
		saveAs(blob, 'open-or-create-file-settings.json')
	}

	const { openFilePicker, loading } = useFilePicker({
		accept: '.json',
		multiple: false,
		readAs: 'Text',
		onFilesSuccessfullySelected: async (selectedFiles: SelectedFiles<string>) => {
			const settings = await parseSettings(async () => {
				return JSON.parse(selectedFiles.filesContent[0].content)
			})

			// Only update if validation passed (parseSettings returns DEFAULT on failure)
			if (settings !== CreateOrOpenFilePluginSettings.DEFAULT) {
				await updateSettingsAndTriggerValidation(settings)
			}
		},
	})

	return (
		<div className="button-container" data-plugin="open-or-create-file">
			<button onClick={openFilePicker} disabled={loading}>
				{loading ? 'Loading...' : 'Import settings'}
			</button>
			<button onClick={exportSettings}>Export settings</button>
		</div>
	)
}
