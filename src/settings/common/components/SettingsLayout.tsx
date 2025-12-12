import React from 'react'
import type { CreateOrOpenFilePluginSettings } from '../../../types'
import type { Events } from 'obsidian'

import { useSettings } from '../hooks/useSettings'
import { ActionsHeader } from './ActionsHeader'
import { ValidationSummary } from './ValidationSummary'
import { OpenOrCreateSettings } from '../../open-or-create/components/OpenOrCreateSettings'

interface SettingsComponentProps {
	settings: CreateOrOpenFilePluginSettings
	saveSettingsAndRegisterCommands: (newSettings: CreateOrOpenFilePluginSettings) => Promise<void>
	settingsEvents: Events
}

export const SettingsLayout: React.FC<SettingsComponentProps> = ({
	settings: initialSettings,
	saveSettingsAndRegisterCommands,
	settingsEvents,
}) => {
	const { settings, updateSettingsAndTriggerValidation, validationResult } = useSettings({
		initialSettings,
		saveSettingsAndRegisterCommands,
		settingsEvents,
	})

	return (
		<div className="plugin-settings" data-plugin="open-or-create-file">
			<ActionsHeader settings={settings} onSettingsImported={updateSettingsAndTriggerValidation} />
			<ValidationSummary validationResult={validationResult} />
			<OpenOrCreateSettings
				settings={settings}
				updateSettingsAndTriggerValidation={updateSettingsAndTriggerValidation}
				validationResult={validationResult}
			/>
		</div>
	)
}
