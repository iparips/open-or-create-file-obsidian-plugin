import { ValidationRule, VALIDATIONS } from './validations'

export { VALIDATIONS, ValidationRule }

export const validateField = (rules: ValidationRule[], value?: string): string | undefined => {
	const firstApplicableRule = rules.find((rule) => rule(value))
	return firstApplicableRule ? firstApplicableRule(value) : undefined
}
