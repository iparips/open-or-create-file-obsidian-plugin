import type { ValidationError } from '../../../types'

export class ValidationErrors {
	private readonly errors: ValidationError[]

	constructor(errors: ValidationError[]) {
		this.errors = errors
	}

	getAll(): ValidationError[] {
		return [...this.errors]
	}

	getErrorCount(): number {
		return this.errors.length
	}

	getErrorsForCommand(commandIndex: number): ValidationError[] {
		return this.errors.filter((error) => error.commandIndex === commandIndex)
	}

	getErrorSummary(): string[] {
		return this.errors.map((error) =>
			error.commandIndex !== undefined
				? `Command ${error.commandIndex + 1} - ${error.fieldDisplayName}: ${error.message}`
				: `${error.fieldDisplayName}: ${error.message}`,
		)
	}

	getErrorSummaryText(): string {
		return this.getErrorSummary().join('\n')
	}
}
