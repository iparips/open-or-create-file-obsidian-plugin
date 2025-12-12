import type { OpenOrCreateCommandConfig } from '../types'
import { CreateOrOpenFilePluginSettings } from '../settings/models/CreateOrOpenFilePluginSettings'
import { OpenOrCreateCommandConfiguration } from '../settings/models/OpenOrCreateCommandConfiguration'

export class CommandConfigBuilder {
	private config: OpenOrCreateCommandConfig = {
		commandName: 'Test Command',
		templateFilePath: 'template.md',
		destinationFolderPattern: 'folder',
		fileNamePattern: 'file.md',
		timeShift: '',
		usePreviousNoteAsTemplate: false,
	}

	withCommandName(name: string): this {
		this.config.commandName = name
		return this
	}

	withTemplatePath(path: string): this {
		this.config.templateFilePath = path
		return this
	}

	withDestinationFolder(pattern: string): this {
		this.config.destinationFolderPattern = pattern
		return this
	}

	withFileName(pattern: string): this {
		this.config.fileNamePattern = pattern
		return this
	}

	withTimeShift(shift: string): this {
		this.config.timeShift = shift
		return this
	}

	withUsePreviousNoteAsTemplate(value: boolean): this {
		this.config.usePreviousNoteAsTemplate = value
		return this
	}

	build(): OpenOrCreateCommandConfig {
		return { ...this.config }
	}
}

export class SettingsBuilder {
	private commands: OpenOrCreateCommandConfig[] = []

	withCommand(command: OpenOrCreateCommandConfig): this {
		this.commands.push(command)
		return this
	}

	withCommands(commands: OpenOrCreateCommandConfig[]): this {
		this.commands = [...commands]
		return this
	}

	build(): CreateOrOpenFilePluginSettings {
		const configuration = new OpenOrCreateCommandConfiguration([...this.commands])
		return new CreateOrOpenFilePluginSettings(configuration)
	}
}

// Convenience functions
export const aCommand = () => new CommandConfigBuilder()
export const aSettings = () => new SettingsBuilder()
