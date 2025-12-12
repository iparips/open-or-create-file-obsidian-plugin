import { OpenOrCreateCommandConfig, CreateOrOpenFilePluginSettings } from '../../types'

export const DEFAULT_SETTINGS: CreateOrOpenFilePluginSettings = {
	openOrCreateCommandConfigs: [
		{
			commandName: 'eg: Weekly shopping list',
			templateFilePath: 'eg: 00 - Meta/Templates/shopping-list-template.md',
			destinationFolderPattern: 'eg: 01 - Journal/Weekly/Week-{week}',
			fileNamePattern: 'eg: shopping-list.md',
			timeShift: '',
			usePreviousNoteAsTemplate: false,
		},
	],
}

export const EMPTY_COMMAND_CONFIG: OpenOrCreateCommandConfig = {
	commandName: '',
	templateFilePath: '',
	destinationFolderPattern: '',
	fileNamePattern: '',
	timeShift: '',
	usePreviousNoteAsTemplate: false,
}
