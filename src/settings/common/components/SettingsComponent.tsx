import React from 'react'
import type { CreateOrOpenFilePluginSettings } from '../../../types'
import type { Events } from 'obsidian'

import { useSettings } from '../hooks/useSettings'
import { ActionsHeader } from './ActionsHeader'
import { OpenOrCreateSettings } from '../../open-or-create/components/OpenOrCreateSettings'

interface SettingsComponentProps {
	settings: CreateOrOpenFilePluginSettings
	updatePluginSettings: (newSettings: CreateOrOpenFilePluginSettings) => Promise<void>
	settingsEvents: Events
}

export const SettingsComponent: React.FC<SettingsComponentProps> = ({
	settings: initialSettings,
	updatePluginSettings,
	settingsEvents,
}) => {
	const { settings, updateSettings, validationResult } = useSettings({
		initialSettings,
		onSettingsChange: updatePluginSettings,
		settingsEvents,
	})

	return (
		<div className="plugin-settings" data-plugin="open-or-create-file">
			<ActionsHeader settings={settings} onSettingsImported={updateSettings} />
			<OpenOrCreateSettings
				settings={settings}
				updateSettings={updateSettings}
				validationResult={validationResult}
			/>
		</div>
	)
}
