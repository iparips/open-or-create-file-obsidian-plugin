import type { CreateOrOpenFilePluginSettings } from '../../../types'
import type { SelectedFiles } from '../../../types'
import { validateSettings } from '../validation/validateSettings'

export const processImportedSettings = async (
	{ filesContent }: SelectedFiles<string>,
	onSettingsImported: (settings: CreateOrOpenFilePluginSettings) => Promise<void>,
) => {
	try {
		const parsedData = JSON.parse(filesContent[0].content)
		const validationResult = validateSettings(parsedData)

		if (!validationResult.isValid) {
			const errorMessages = validationResult.getErrorSummaryText()
			alert(`Import failed due to validation errors:\n\n${errorMessages}`)
			return
		}

		await onSettingsImported(parsedData as CreateOrOpenFilePluginSettings)
	} catch (err: unknown) {
		alert('Import failed: Check your file and try again')
	}
}
