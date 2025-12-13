import { describe, expect, it, vi } from 'vitest'
import { PathSegmentBuilder } from '../pathSegmentBuilder'
import { TimeShiftParser } from '../timeShift'
import { formatInTimeZone } from 'date-fns-tz'

// Mock the date-fns module to make its `format` function timezone-aware for tests.
vi.mock('date-fns', async (importOriginal) => {
	const actual = await importOriginal<typeof import('date-fns')>()
	return {
		...actual,
		// Replace the original `format` with our custom stub
		format: (date: Date, formatString: string): string => {
			return formatInTimeZone(date, 'UTC', formatString)
		},
	}
})

describe('build', () => {
	const testDate = new Date('2025-06-07T14:30:45.123Z') // 'Z' means UTC

	describe('basic placeholders (no time shift)', () => {
		it('should replace {year} with formatted year', () => {
			const pattern = 'Year: {year}'
			const result = PathSegmentBuilder.build(pattern, testDate)
			expect(result).toBe('Year: 2025')
		})

		it('should replace {month} with formatted month', () => {
			const pattern = 'Month: {month}'
			const result = PathSegmentBuilder.build(pattern, testDate)
			expect(result).toBe('Month: 06')
		})

		it('should replace {day} with formatted day', () => {
			const pattern = 'Day: {day}'
			const result = PathSegmentBuilder.build(pattern, testDate)
			expect(result).toBe('Day: 07')
		})

		it('should replace {date} with formatted date', () => {
			const pattern = 'Date: {date}'
			const result = PathSegmentBuilder.build(pattern, testDate)
			expect(result).toBe('Date: 2025-06-07')
		})

		it('should replace {time} with formatted time', () => {
			const pattern = 'Time: {time}'
			const result = PathSegmentBuilder.build(pattern, testDate)
			expect(result).toBe('Time: 14-30-45')
		})

		it('should replace {week} with formatted week number', () => {
			const pattern = 'Week: {week}'
			const result = PathSegmentBuilder.build(pattern, testDate)
			expect(result).toBe('Week: 23')
		})

		it('should replace {dow} with formatted day of week', () => {
			const pattern = 'Day of week: {dow}'
			const result = PathSegmentBuilder.build(pattern, testDate)
			expect(result).toBe('Day of week: Sat')
		})

		it('should replace multiple different placeholders in one pattern', () => {
			const pattern = '{year}-{month}-{day}_{time}_{dow}'
			const result = PathSegmentBuilder.build(pattern, testDate)
			expect(result).toBe('2025-06-07_14-30-45_Sat')
		})

		it('should replace multiple instances of the same placeholder', () => {
			const pattern = '{year} was a great year, {year} indeed!'
			const result = PathSegmentBuilder.build(pattern, testDate)
			expect(result).toBe('2025 was a great year, 2025 indeed!')
		})

		it('should handle pattern with no placeholders', () => {
			const pattern = 'This is just a regular string'
			const result = PathSegmentBuilder.build(pattern, testDate)
			expect(result).toBe('This is just a regular string')
		})

		it('should handle empty pattern', () => {
			const pattern = ''
			const result = PathSegmentBuilder.build(pattern, testDate)
			expect(result).toBe('')
		})

		it('should handle pattern with incomplete placeholders', () => {
			const pattern = '{year} and {incomplete and {day}'
			const result = PathSegmentBuilder.build(pattern, testDate)
			expect(result).toBe('2025 and {incomplete and 07')
		})

		it('should handle pattern with all placeholders', () => {
			const pattern = '{year}/{month}/{day} {time} W{week} {dow} {date}'
			const result = PathSegmentBuilder.build(pattern, testDate)
			expect(result).toBe('2025/06/07 14-30-45 W23 Sat 2025-06-07')
		})
	})

	describe('time shift modifiers', () => {
		it('should handle positive day shift', () => {
			const pattern = '{date}'
			const result = PathSegmentBuilder.build(pattern, testDate, TimeShiftParser.parse('+1 day'))
			expect(result).toBe('2025-06-08') // June 7 + 1 day = June 8
		})

		it('should handle negative day shift', () => {
			const pattern = '{date}'
			const result = PathSegmentBuilder.build(pattern, testDate, TimeShiftParser.parse('-1 day'))
			expect(result).toBe('2025-06-06') // June 7 - 1 day = June 6
		})

		it('should handle positive week shift', () => {
			const pattern = '{date}'
			const result = PathSegmentBuilder.build(pattern, testDate, TimeShiftParser.parse('+1 week'))
			expect(result).toBe('2025-06-14') // June 7 + 1 week = June 14
		})

		it('should handle negative week shift', () => {
			const pattern = '{date}'
			const result = PathSegmentBuilder.build(pattern, testDate, TimeShiftParser.parse('-1 week'))
			expect(result).toBe('2025-05-31') // June 7 - 1 week = May 31
		})

		it('should handle positive month shift', () => {
			const pattern = '{date}'
			const result = PathSegmentBuilder.build(pattern, testDate, TimeShiftParser.parse('+1 month'))
			expect(result).toBe('2025-07-07') // June 7 + 1 month = July 7
		})

		it('should handle negative month shift', () => {
			const pattern = '{date}'
			const result = PathSegmentBuilder.build(pattern, testDate, TimeShiftParser.parse('-1 month'))
			expect(result).toBe('2025-05-07') // June 7 - 1 month = May 7
		})

		it('should handle positive year shift', () => {
			const pattern = '{date}'
			const result = PathSegmentBuilder.build(pattern, testDate, TimeShiftParser.parse('+1 year'))
			expect(result).toBe('2026-06-07') // June 7, 2025 + 1 year = June 7, 2026
		})

		it('should handle negative year shift', () => {
			const pattern = '{date}'
			const result = PathSegmentBuilder.build(pattern, testDate, TimeShiftParser.parse('-1 year'))
			expect(result).toBe('2024-06-07') // June 7, 2025 - 1 year = June 7, 2024
		})

		it('should handle plural forms (days, weeks, months, years)', () => {
			const pattern = '{date}'
			expect(PathSegmentBuilder.build(pattern, testDate, TimeShiftParser.parse('+2 days'))).toBe(
				'2025-06-09',
			)
			expect(PathSegmentBuilder.build(pattern, testDate, TimeShiftParser.parse('+2 weeks'))).toBe(
				'2025-06-21',
			)
			expect(PathSegmentBuilder.build(pattern, testDate, TimeShiftParser.parse('+2 months'))).toBe(
				'2025-08-07',
			)
			expect(PathSegmentBuilder.build(pattern, testDate, TimeShiftParser.parse('+2 years'))).toBe(
				'2027-06-07',
			)
		})

		it('should handle all placeholders with time shift', () => {
			const pattern = '{year}-{month}-{day} {dow}'
			const result = PathSegmentBuilder.build(pattern, testDate, TimeShiftParser.parse('+1 day'))
			expect(result).toBe('2025-06-08 Sun') // All placeholders from June 8 (shifted date)
		})

		it('should handle day of week shift correctly', () => {
			const pattern = '{dow}'
			const result = PathSegmentBuilder.build(pattern, testDate, TimeShiftParser.parse('+1 day'))
			expect(result).toBe('Sun') // Saturday + 1 day = Sunday
		})

		it('should handle invalid time shift modifier gracefully', () => {
			const pattern = '{date}'
			const result = PathSegmentBuilder.build(
				pattern,
				testDate,
				TimeShiftParser.parse('invalid modifier'),
			)
			expect(result).toBe('2025-06-07') // Should use original date
		})

		it('should handle edge case: end of month', () => {
			const endOfMonth = new Date('2025-01-31T14:30:45.123+10:00') // January 31, 2025
			const pattern = '{date}'
			const result = PathSegmentBuilder.build(
				pattern,
				endOfMonth,
				TimeShiftParser.parse('+1 month'),
			)
			expect(result).toBe('2025-02-28') // January 31 + 1 month = February 28 (not 31)
		})

		it('should handle edge case: cross year boundary', () => {
			const endOfYear = new Date('2025-12-31T14:30:45.123+10:00') // December 31, 2025
			const pattern = '{year}-{month}-{day}'
			const result = PathSegmentBuilder.build(pattern, endOfYear, TimeShiftParser.parse('+1 day'))
			expect(result).toBe('2026-01-01') // December 31, 2025 + 1 day = January 1, 2026
		})
	})
})
