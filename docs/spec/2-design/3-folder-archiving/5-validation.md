# Validation Rules

## Type Guards

File: `src/settings/utils/validation/typeGuards.ts` (update existing)

Add type guards for archive configs:

```typescript
export function isArchiveConfig(data: unknown): data is ArchiveConfig {
	if (typeof data !== 'object' || data === null) return false

	const config = data as Record<string, unknown>

	return (
		typeof config.id === 'string' &&
		typeof config.name === 'string' &&
		typeof config.sourcePattern === 'string' &&
		typeof config.destinationPattern === 'string' &&
		typeof config.ageThresholdDays === 'number'
	)
}

export function isImportedSettings(data: unknown): data is CreateOrOpenFilePluginSettings {
	if (typeof data !== 'object' || data === null) return false

	const settings = data as Record<string, unknown>

	// Check commandConfigs array
	if (!Array.isArray(settings.commandConfigs)) return false

	// Check archiveConfigs array (optional for backward compatibility)
	if (settings.archiveConfigs !== undefined && !Array.isArray(settings.archiveConfigs)) {
		return false
	}

	return true
}
```

## Archive Configuration Validation

File: `src/settings/utils/validation/validateArchiveConfig.ts` (new file, under 100 lines)

```typescript
export class ArchiveConfigValidator {
	static validate(config: unknown, index: number): ValidationError[] {
		if (!isArchiveConfig(config)) {
			return this.createInvalidConfigError(index)
		}

		return this.validateFields(config, index)
	}

	private static createInvalidConfigError(index: number): ValidationError[] {
		return [
			{
				field: 'archiveConfig',
				fieldDisplayName: 'Archive Configuration',
				message: 'Invalid object or field types',
				archiveConfigIndex: index,
			},
		]
	}

	private static validateFields(config: ArchiveConfig, index: number): ValidationError[] {
		const errors: ValidationError[] = []

		this.validateName(config, index, errors)
		this.validateSourcePattern(config, index, errors)
		this.validateDestinationPattern(config, index, errors)
		this.validateAgeThreshold(config, index, errors)

		return errors
	}

	private static validateName(
		config: ArchiveConfig,
		index: number,
		errors: ValidationError[],
	): void {
		if (!config.name || config.name.trim() === '') {
			errors.push({
				field: 'name',
				fieldDisplayName: 'Name',
				message: 'Name is required',
				archiveConfigIndex: index,
			})
		}
	}

	private static validateSourcePattern(
		config: ArchiveConfig,
		index: number,
		errors: ValidationError[],
	): void {
		if (!config.sourcePattern || config.sourcePattern.trim() === '') {
			errors.push({
				field: 'sourcePattern',
				fieldDisplayName: 'Source Pattern',
				message: 'Source pattern is required',
				archiveConfigIndex: index,
			})
		}
	}

	private static validateDestinationPattern(
		config: ArchiveConfig,
		index: number,
		errors: ValidationError[],
	): void {
		if (!config.destinationPattern || config.destinationPattern.trim() === '') {
			errors.push({
				field: 'destinationPattern',
				fieldDisplayName: 'Destination Pattern',
				message: 'Destination pattern is required',
				archiveConfigIndex: index,
			})
			return
		}

		if (!this.hasValidPlaceholder(config.destinationPattern)) {
			errors.push({
				field: 'destinationPattern',
				fieldDisplayName: 'Destination Pattern',
				message: 'Must contain at least one date placeholder',
				archiveConfigIndex: index,
			})
		}
	}

	private static validateAgeThreshold(
		config: ArchiveConfig,
		index: number,
		errors: ValidationError[],
	): void {
		if (config.ageThresholdDays <= 0) {
			errors.push({
				field: 'ageThresholdDays',
				fieldDisplayName: 'Age Threshold',
				message: 'Age threshold must be a positive number',
				archiveConfigIndex: index,
			})
		}
	}

	private static hasValidPlaceholder(pattern: string): boolean {
		const validPlaceholders = [
			'{year}',
			'{quarter}',
			'{month}',
			'{month:MM}',
			'{month:MMM}',
			'{month:MMMM}',
		]
		return validPlaceholders.some((p) => pattern.includes(p))
	}
}
```

## Update Validation Error Type

File: `src/types.ts` (update existing)

```typescript
interface ValidationError {
	field: string
	fieldDisplayName: string
	message: string
	commandIndex?: number // For open-or-create commands
	archiveConfigIndex?: number // For archive configurations
}
```

## Update Main Validation Function

File: `src/settings/utils/validation/validateSettings.ts` (update existing)

```typescript
export const validateSettings = (data: unknown): ValidationResult => {
	if (!isImportedSettings(data)) {
		return new ValidationResult([
			{ field: 'root', fieldDisplayName: 'Settings', message: 'Invalid data format' },
		])
	}

	const commandErrors = data.commandConfigs.flatMap((command, index) =>
		validateCommand(command, index),
	)

	const archiveErrors = (data.archiveConfigs || []).flatMap((config, index) =>
		ArchiveConfigValidator.validate(config, index),
	)

	return new ValidationResult([...commandErrors, ...archiveErrors])
}
```

## Update Validation Result Class

File: `src/settings/utils/validation/validationResult.ts` (update existing)

Add methods to get errors for archive configs:

```typescript
export class ValidationResult {
	// ... existing methods ...

	getErrorsForArchiveConfig(index: number): ValidationError[] {
		return this.errors.filter((error) => error.archiveConfigIndex === index)
	}

	hasErrorsForArchiveConfig(index: number): boolean {
		return this.getErrorsForArchiveConfig(index).length > 0
	}
}
```

## Validation Integration

Archive config validation is automatically integrated through the existing validation flow:

1. Plugin load (`onload`) → `configureDefaultsAndValidateSettings()` → validates archive configs
2. Settings UI changes → `updateSettings()` → React validation hook → validates archive configs
3. Import settings → `handleSettingsImported()` → validates archive configs
4. Obsidian Sync → `onExternalSettingsChange()` → `configureDefaultsAndValidateSettings()` → validates archive configs

All validation scenarios are covered without additional integration code.
