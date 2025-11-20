import { describe, expect, it } from 'vitest'
import { VALIDATIONS, validateField } from '../../validation/validateField'

describe('validateField', () => {
	it('should return undefined when no rules provided', () => {
		expect(validateField([], 'any value')).toBeUndefined()
	})

	it('should return undefined when all rules pass', () => {
		expect(validateField([VALIDATIONS.required, VALIDATIONS.endsWithMd], 'file.md')).toBeUndefined()
	})

	it('should return first failing rule error', () => {
		// Empty string should fail required rule first
		expect(validateField([VALIDATIONS.required, VALIDATIONS.endsWithMd], '')).toBe(
			'This field is mandatory',
		)
	})

	it('should return first failing rule error when multiple rules fail', () => {
		// Required rule should be checked first, even though endsWithMd would also fail
		expect(validateField([VALIDATIONS.required, VALIDATIONS.endsWithMd], '')).toBe(
			'This field is mandatory',
		)
	})

	it('should return second rule error when first passes', () => {
		expect(validateField([VALIDATIONS.required, VALIDATIONS.endsWithMd], 'file.txt')).toBe(
			'File name should end with .md extension',
		)
	})

	it('should work with single rule', () => {
		expect(validateField([VALIDATIONS.required], '')).toBe('This field is mandatory')
		expect(validateField([VALIDATIONS.required], 'valid')).toBeUndefined()
	})

	it('should work with combined rule', () => {
		expect(validateField([VALIDATIONS.requiredAndEndsWithMd], '')).toBe('This field is mandatory')
		expect(validateField([VALIDATIONS.requiredAndEndsWithMd], 'file.txt')).toBe(
			'File name should end with .md extension',
		)
		expect(validateField([VALIDATIONS.requiredAndEndsWithMd], 'file.md')).toBeUndefined()
	})

	it('should handle rule order correctly', () => {
		// Order matters - first failing rule wins
		expect(validateField([VALIDATIONS.endsWithMd, VALIDATIONS.required], 'file.txt')).toBe(
			'File name should end with .md extension',
		)
		expect(validateField([VALIDATIONS.required, VALIDATIONS.endsWithMd], 'file.txt')).toBe(
			'File name should end with .md extension',
		)
	})

	it('should handle undefined values', () => {
		expect(validateField([VALIDATIONS.required], undefined)).toBe('This field is mandatory')
		expect(validateField([VALIDATIONS.endsWithMd], undefined)).toBeUndefined()
		expect(validateField([VALIDATIONS.requiredAndEndsWithMd], undefined)).toBe(
			'This field is mandatory',
		)
		expect(validateField([VALIDATIONS.timeShift], undefined)).toBeUndefined()
	})

	it('should work with timeShift validation', () => {
		expect(validateField([VALIDATIONS.timeShift], '+1 day')).toBeUndefined()
		expect(validateField([VALIDATIONS.timeShift], 'invalid')).toBeDefined()
	})
})
