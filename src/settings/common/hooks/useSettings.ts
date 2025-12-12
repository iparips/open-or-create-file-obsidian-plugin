import { useEffect, useState } from 'react'
import type { Events } from 'obsidian'
import type { CreateOrOpenFilePluginSettings } from '../../../types'
import { ValidationResult } from '../validation/validationResult'
import { validateSettings } from '../validation/validateSettings'

interface UseSettingsProps {
	initialSettings: CreateOrOpenFilePluginSettings
	saveSettingsAndRegisterCommands: (newSettings: CreateOrOpenFilePluginSettings) => Promise<void>
	settingsEvents: Events
}

interface UseSettingsResult {
	settings: CreateOrOpenFilePluginSettings
	updateSettingsAndTriggerValidation: (newSettings: CreateOrOpenFilePluginSettings) => Promise<void>
	validationResult: ValidationResult
}

export function useSettings({
	initialSettings,
	saveSettingsAndRegisterCommands,
	settingsEvents,
}: UseSettingsProps): UseSettingsResult {
	const [settings, setSettings] = useState<CreateOrOpenFilePluginSettings>(initialSettings)
	const [validationResult, setValidationResult] = useState<ValidationResult>(() =>
		validateSettings(initialSettings),
	)

	// Handle external settings changes (e.g., from Obsidian Sync)
	// settingsEvents is a stable service reference, not reactive data
	useEffect(() => {
		const handleSettingsReloaded = (newSettings: CreateOrOpenFilePluginSettings) => {
			setSettings(newSettings)
			setValidationResult(validateSettings(newSettings))
		}

		const eventRef = settingsEvents.on(
			'settings-reloaded',
			handleSettingsReloaded as (...data: unknown[]) => unknown,
		)

		return () => {
			settingsEvents.offref(eventRef)
		}
	}, [])

	// Re-validate when settings change
	useEffect(() => {
		setValidationResult(validateSettings(settings))
	}, [settings])

	const updateSettings = async (newSettings: CreateOrOpenFilePluginSettings) => {
		setSettings(newSettings)
		await saveSettingsAndRegisterCommands(newSettings)
	}

	return {
		settings,
		updateSettingsAndTriggerValidation: updateSettings,
		validationResult,
	}
}
