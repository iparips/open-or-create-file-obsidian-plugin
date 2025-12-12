import type { OpenOrCreateCommandConfig } from '../../types'
import { EMPTY_COMMAND_CONFIG } from '../common/constants'

export class OpenOrCreateCommandConfiguration {
	private configs: OpenOrCreateCommandConfig[]

	constructor(configs: OpenOrCreateCommandConfig[]) {
		// Assumes configs are valid
		this.configs = configs
	}

	getAll(): OpenOrCreateCommandConfig[] {
		return this.configs
	}

	addEmpty(): void {
		this.configs = [EMPTY_COMMAND_CONFIG, ...this.configs]
	}

	update(index: number, key: keyof OpenOrCreateCommandConfig, value: string | boolean): void {
		this.configs = this.configs.map((config, i) =>
			i === index ? { ...config, [key]: value } : config,
		)
	}

	delete(index: number): void {
		this.configs = this.configs.filter((_, i) => i !== index)
	}

	toJSON(): OpenOrCreateCommandConfig[] {
		return this.configs
	}

	static fromJSON(configs: OpenOrCreateCommandConfig[]): OpenOrCreateCommandConfiguration {
		return new OpenOrCreateCommandConfiguration(configs)
	}
}
