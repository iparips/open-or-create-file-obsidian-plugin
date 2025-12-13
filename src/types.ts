// Types for use-file-picker library integration
export interface SelectedFiles<T> {
	plainFiles: File[]
	filesContent: Array<{
		name: string
		content: T
		lastModified: number
		size: number
		type: string
		path: string
	}>
}

// Validation types
export interface ValidationError {
	field: string
	fieldDisplayName: string
	message: string
	commandIndex?: number
}

// Command settings types
export interface OpenOrCreateCommandConfig {
	commandName: string
	templateFilePath?: string
	destinationFolderPattern: string
	fileNamePattern: string
	timeShift?: string
	usePreviousNoteAsTemplate?: boolean
}

export interface CreateOrOpenFilePluginSettingsJSON {
	openOrCreateCommandConfigs: OpenOrCreateCommandConfig[]
	// Backwards compatibility: old plugin versions look for this field
	// TODO: Remove after 2-3 releases (added 2024-12-13)
	commandConfigs?: OpenOrCreateCommandConfig[]
}
