import { OpenOrCreateCommandConfiguration } from './OpenOrCreateCommandConfiguration'
import type { CreateOrOpenFilePluginSettingsJSON, OpenOrCreateCommandConfig } from '../../types'
import { DEFAULT_SETTINGS_JSON } from '../common/constants'

export class CreateOrOpenFilePluginSettings {
	private openOrCreateCommandConfiguration: OpenOrCreateCommandConfiguration

	static get DEFAULT(): CreateOrOpenFilePluginSettings {
		return CreateOrOpenFilePluginSettings.fromJSON(DEFAULT_SETTINGS_JSON)
	}

	constructor(openOrCreateCommandConfiguration: OpenOrCreateCommandConfiguration) {
		this.openOrCreateCommandConfiguration = openOrCreateCommandConfiguration
	}

	getOpenOrCreateCommandConfigs(): OpenOrCreateCommandConfig[] {
		return this.openOrCreateCommandConfiguration.getAll()
	}

	addOpenOrCreateCommand(): void {
		this.openOrCreateCommandConfiguration.addEmpty()
	}

	updateOpenOrCreateCommand(
		index: number,
		key: keyof OpenOrCreateCommandConfig,
		value: string | boolean,
	): void {
		this.openOrCreateCommandConfiguration.update(index, key, value)
	}

	deleteOpenOrCreateCommand(index: number): void {
		this.openOrCreateCommandConfiguration.delete(index)
	}

	toJSON(): CreateOrOpenFilePluginSettingsJSON {
		const configs = this.openOrCreateCommandConfiguration.toJSON()
		return {
			openOrCreateCommandConfigs: configs,
			// Backwards compatibility: write old format too for users with older plugin versions
			// TODO: Remove commandConfigs field after 2-3 releases (added 2024-12-13)
			commandConfigs: configs,
		}
	}

	static fromJSON(json: CreateOrOpenFilePluginSettingsJSON): CreateOrOpenFilePluginSettings {
		return new CreateOrOpenFilePluginSettings(
			OpenOrCreateCommandConfiguration.fromJSON(json.openOrCreateCommandConfigs),
		)
	}
}
