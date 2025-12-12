import type { CommandConfig, CreateOrOpenFilePluginSettings } from '../types'

export class CommandConfigBuilder {
	private config: CommandConfig = {
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

	build(): CommandConfig {
		return { ...this.config }
	}
}

export class SettingsBuilder {
	private commands: CommandConfig[] = []

	withCommand(command: CommandConfig): this {
		this.commands.push(command)
		return this
	}

	withCommands(commands: CommandConfig[]): this {
		this.commands = [...commands]
		return this
	}

	build(): CreateOrOpenFilePluginSettings {
		return { commandConfigs: [...this.commands] }
	}
}

// Convenience functions
export const aCommand = () => new CommandConfigBuilder()
export const aSettings = () => new SettingsBuilder()
