import { describe, expect, it } from 'vitest'
import { VALIDATIONS } from '../validations'

describe('VALIDATIONS', () => {
	describe('required', () => {
		it('should return error for empty string', () => {
			expect(VALIDATIONS.required('')).toBe('This field is mandatory')
		})

		it('should return error for whitespace-only string', () => {
			expect(VALIDATIONS.required('   ')).toBe('This field is mandatory')
			expect(VALIDATIONS.required('\t\n ')).toBe('This field is mandatory')
		})

		it('should return error for undefined', () => {
			expect(VALIDATIONS.required(undefined)).toBe('This field is mandatory')
		})

		it('should return undefined for valid non-empty string', () => {
			expect(VALIDATIONS.required('valid text')).toBeUndefined()
			expect(VALIDATIONS.required('a')).toBeUndefined()
		})

		it('should return undefined for string with leading/trailing whitespace but content', () => {
			expect(VALIDATIONS.required('  valid  ')).toBeUndefined()
		})
	})

	describe('endsWithMd', () => {
		it('should return undefined for empty string (optional field)', () => {
			expect(VALIDATIONS.endsWithMd('')).toBeUndefined()
		})

		it('should return undefined for undefined (optional field)', () => {
			expect(VALIDATIONS.endsWithMd(undefined)).toBeUndefined()
		})

		it('should return undefined for whitespace-only string', () => {
			expect(VALIDATIONS.endsWithMd('   ')).toBeUndefined()
		})

		it('should return error for non-empty string without .md extension', () => {
			expect(VALIDATIONS.endsWithMd('file.txt')).toBe('File name should end with .md extension')
			expect(VALIDATIONS.endsWithMd('file')).toBe('File name should end with .md extension')
			expect(VALIDATIONS.endsWithMd('file.pdf')).toBe('File name should end with .md extension')
		})

		it('should return undefined for string ending with .md', () => {
			expect(VALIDATIONS.endsWithMd('file.md')).toBeUndefined()
			expect(VALIDATIONS.endsWithMd('my-file.md')).toBeUndefined()
			expect(VALIDATIONS.endsWithMd('folder/file.md')).toBeUndefined()
		})

		it('should handle edge cases with .md in middle of filename', () => {
			expect(VALIDATIONS.endsWithMd('file.md.txt')).toBe('File name should end with .md extension')
			expect(VALIDATIONS.endsWithMd('my.md.file')).toBe('File name should end with .md extension')
		})
	})

	describe('requiredAndEndsWithMd', () => {
		it('should return error for empty string', () => {
			expect(VALIDATIONS.requiredAndEndsWithMd('')).toBe('This field is mandatory')
		})

		it('should return error for undefined', () => {
			expect(VALIDATIONS.requiredAndEndsWithMd(undefined)).toBe('This field is mandatory')
		})

		it('should return error for whitespace-only string', () => {
			expect(VALIDATIONS.requiredAndEndsWithMd('   ')).toBe('This field is mandatory')
		})

		it('should return error for non-empty string without .md extension', () => {
			expect(VALIDATIONS.requiredAndEndsWithMd('file.txt')).toBe(
				'File name should end with .md extension',
			)
			expect(VALIDATIONS.requiredAndEndsWithMd('file')).toBe(
				'File name should end with .md extension',
			)
		})

		it('should return undefined for valid .md file', () => {
			expect(VALIDATIONS.requiredAndEndsWithMd('file.md')).toBeUndefined()
			expect(VALIDATIONS.requiredAndEndsWithMd('my-file.md')).toBeUndefined()
		})

		it('should prioritize required validation over .md validation', () => {
			// Should return "mandatory" error, not ".md" error for empty strings
			expect(VALIDATIONS.requiredAndEndsWithMd('')).toBe('This field is mandatory')
			expect(VALIDATIONS.requiredAndEndsWithMd('   ')).toBe('This field is mandatory')
		})
	})

	describe('timeShift', () => {
		it('should return undefined for empty string (optional field)', () => {
			expect(VALIDATIONS.timeShift('')).toBeUndefined()
		})

		it('should return undefined for undefined (optional field)', () => {
			expect(VALIDATIONS.timeShift(undefined)).toBeUndefined()
		})

		it('should return undefined for whitespace-only string', () => {
			expect(VALIDATIONS.timeShift('   ')).toBeUndefined()
		})

		it('should return undefined for valid time shift patterns', () => {
			expect(VALIDATIONS.timeShift('+1 day')).toBeUndefined()
			expect(VALIDATIONS.timeShift('-1 day')).toBeUndefined()
			expect(VALIDATIONS.timeShift('+2 days')).toBeUndefined()
			expect(VALIDATIONS.timeShift('-3 weeks')).toBeUndefined()
			expect(VALIDATIONS.timeShift('+1 week')).toBeUndefined()
			expect(VALIDATIONS.timeShift('+12 months')).toBeUndefined()
			expect(VALIDATIONS.timeShift('-5 years')).toBeUndefined()
			expect(VALIDATIONS.timeShift('1 day')).toBeUndefined() // Without explicit sign
			expect(VALIDATIONS.timeShift('10 month')).toBeUndefined() // Singular form
		})

		it('should handle case insensitive units', () => {
			expect(VALIDATIONS.timeShift('+1 DAY')).toBeUndefined()
			expect(VALIDATIONS.timeShift('-2 WEEKS')).toBeUndefined()
			expect(VALIDATIONS.timeShift('+3 Month')).toBeUndefined()
			expect(VALIDATIONS.timeShift('-1 Year')).toBeUndefined()
		})

		it('should return error for invalid time shift patterns', () => {
			const expectedError =
				'Time shift must be in format "+N unit" or "-N unit" (e.g., "+1 day", "-2 weeks", "+3 months")'

			expect(VALIDATIONS.timeShift('invalid')).toBe(expectedError)
			expect(VALIDATIONS.timeShift('1')).toBe(expectedError)
			expect(VALIDATIONS.timeShift('day')).toBe(expectedError)
			expect(VALIDATIONS.timeShift('+ 1 day')).toBe(expectedError) // Extra space after sign
			expect(VALIDATIONS.timeShift('+1day')).toBe(expectedError) // No space between number and unit
			expect(VALIDATIONS.timeShift('+1.5 days')).toBe(expectedError) // Decimal numbers not allowed
			expect(VALIDATIONS.timeShift('+1 hour')).toBe(expectedError) // Invalid unit
			expect(VALIDATIONS.timeShift('+1 seconds')).toBe(expectedError) // Invalid unit
			expect(VALIDATIONS.timeShift('++1 day')).toBe(expectedError) // Double sign
			expect(VALIDATIONS.timeShift('1 day extra')).toBe(expectedError) // Extra text
		})

		it('should handle zero values correctly', () => {
			expect(VALIDATIONS.timeShift('0 days')).toBeUndefined() // Zero should be valid
			expect(VALIDATIONS.timeShift('+0 weeks')).toBeUndefined()
			expect(VALIDATIONS.timeShift('-0 months')).toBeUndefined()
		})

		it('should handle whitespace around valid patterns', () => {
			expect(VALIDATIONS.timeShift('  +1 day  ')).toBeUndefined()
			expect(VALIDATIONS.timeShift('\t-2 weeks\n')).toBeUndefined()
		})
	})
})
