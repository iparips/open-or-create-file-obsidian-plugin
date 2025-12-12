export type ValidationRule = (value?: string) => string | undefined

export const VALIDATIONS = {
	required: (value?: string) =>
		!value || value.trim() === '' ? 'This field is mandatory' : undefined,
	endsWithMd: (value?: string) =>
		value && value.trim() !== '' && !value.endsWith('.md')
			? 'File name should end with .md extension'
			: undefined,
	requiredAndEndsWithMd: (value?: string) => {
		if (!value || value.trim() === '') return 'This field is mandatory'
		if (!value.endsWith('.md')) return 'File name should end with .md extension'
		return undefined
	},
	timeShift: (value?: string) => {
		if (!value || value.trim() === '') return undefined // Optional field
		const timeShiftRegex = /^([+-]?\d+)\s+(day|days|week|weeks|month|months|year|years)$/i
		if (!timeShiftRegex.test(value.trim())) {
			return 'Time shift must be in format "+N unit" or "-N unit" (e.g., "+1 day", "-2 weeks", "+3 months")'
		}
		return undefined
	},
}
