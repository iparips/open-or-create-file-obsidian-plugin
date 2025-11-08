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
export interface CommandConfig {
	commandName: string
	templateFilePath?: string
	destinationFolderPattern: string
	fileNamePattern: string
	timeShift?: string
	usePreviousNoteAsTemplate?: boolean
}

export interface CreateOrOpenFilePluginSettings {
	commandConfigs: CommandConfig[]
}
