import React from 'react'
import { saveAs } from 'file-saver'
import { useFilePicker } from 'use-file-picker'
import { processImportedSettings } from './ActionsHeader.utils'
import type { SelectedFiles, CreateOrOpenFilePluginSettings } from '../../types'

interface ActionsHeaderProps {
	settings: CreateOrOpenFilePluginSettings
	onSettingsImported: (settings: CreateOrOpenFilePluginSettings) => Promise<void>
	onAddCommand: () => void
}

export const ActionsHeader: React.FC<ActionsHeaderProps> = ({
	settings,
	onSettingsImported,
	onAddCommand,
}) => {
	const exportSettings = (): void => {
		const dataStr: string = JSON.stringify(settings, null, 2)
		const blob: Blob = new Blob([dataStr], { type: 'application/json' })
		saveAs(blob, 'open-or-create-file-settings.json')
	}

	const { openFilePicker, loading } = useFilePicker({
		accept: '.json',
		multiple: false,
		readAs: 'Text',
		onFilesSuccessfullySelected: (selectedFiles: SelectedFiles<string>) =>
			processImportedSettings(selectedFiles, onSettingsImported),
	})

	return (
		<div className="button-container" data-plugin="open-or-create-file">
			<button onClick={onAddCommand}>Add command</button>
			<button onClick={openFilePicker} disabled={loading}>
				{loading ? 'Loading...' : 'Import settings'}
			</button>
			<button onClick={exportSettings}>Export settings</button>
		</div>
	)
}
