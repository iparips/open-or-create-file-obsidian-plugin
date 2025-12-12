import { describe, expect, it, vi, afterEach } from 'vitest'
import { PreviousNoteCandidatesFinder } from '../index'
import { TimeShiftParser } from '../../timeShift'
import { formatInTimeZone } from 'date-fns-tz'

// Mock the date-fns module to make its `format` function timezone-aware for tests.
vi.mock('date-fns', async (importOriginal) => {
	const actual = await importOriginal<typeof import('date-fns')>()
	return {
		...actual,
		format: (date: Date, formatString: string): string => {
			return formatInTimeZone(date, 'UTC', formatString)
		},
	}
})

describe('PreviousNoteFinder.generateCandidates', () => {
	const stubDate = (dateString: string) => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date(`${dateString}T10:00:00.000Z`))
	}

	afterEach(() => {
		vi.useRealTimers()
	})

	describe('granularity detection', () => {
		it(
			'detects day granularity when pattern contains {month} {day} {dow} and year ' +
				'and correctly rolls back to previous week, month and year',
			() => {
				stubDate('2025-01-02') // Thursday, week 01

				const result = PreviousNoteCandidatesFinder.generateCandidates(
					'01 - Journal/Weekly/{year}/Week-{week}',
					'{month}-{day}-{dow}-{year}.md',
					undefined,
					5,
				)

				expect(result[0]).toBe('01 - Journal/Weekly/2025/Week-01/01-01-Wed-2025.md')
				expect(result[1]).toBe('01 - Journal/Weekly/2024/Week-01/12-31-Tue-2024.md')
				expect(result[2]).toBe('01 - Journal/Weekly/2024/Week-01/12-30-Mon-2024.md')
				expect(result[3]).toBe('01 - Journal/Weekly/2024/Week-52/12-29-Sun-2024.md')
				expect(result[4]).toBe('01 - Journal/Weekly/2024/Week-52/12-28-Sat-2024.md')
			},
		)

		it('detects year granularity when pattern contains {year}', () => {
			stubDate('2025-01-02') // 2025

			const result = PreviousNoteCandidatesFinder.generateCandidates(
				'Archive/{year}',
				'annual-review.md',
				undefined,
				3,
			)

			expect(result[0]).toBe('Archive/2024/annual-review.md')
			expect(result[1]).toBe('Archive/2023/annual-review.md')
			expect(result[2]).toBe('Archive/2022/annual-review.md')
		})
	})

	describe('baseTimeShift handling', () => {
		it('applies baseTimeShift when provided with valid format', () => {
			stubDate('2025-01-02') // Week 01

			const result = PreviousNoteCandidatesFinder.generateCandidates(
				'01 - Journal/Weekly/Week-{week}',
				'todo.md',
				TimeShiftParser.parse('+1 week'),
				3,
			)

			expect(result[0]).toBe('01 - Journal/Weekly/Week-01/todo.md')
			expect(result[1]).toBe('01 - Journal/Weekly/Week-52/todo.md')
			expect(result[2]).toBe('01 - Journal/Weekly/Week-51/todo.md')
		})

		it('applies negative baseTimeShift correctly', () => {
			stubDate('2025-01-02')

			const result = PreviousNoteCandidatesFinder.generateCandidates(
				'01 - Journal/Weekly/Week-{week}',
				'{month}-{day}-{dow}.md',
				TimeShiftParser.parse('-2 days'),
				3,
			)

			expect(result[0]).toBe('01 - Journal/Weekly/Week-01/12-30-Mon.md')
			expect(result[1]).toBe('01 - Journal/Weekly/Week-52/12-29-Sun.md')
			expect(result[2]).toBe('01 - Journal/Weekly/Week-52/12-28-Sat.md')
		})

		it('handles baseTimeShift with +1 day for tomorrow notes', () => {
			stubDate('2025-01-02')

			const result = PreviousNoteCandidatesFinder.generateCandidates(
				'01 - Journal/Weekly/Week-{week}',
				'{month}-{day}-{dow}.md',
				TimeShiftParser.parse('+1 day'),
				3,
			)

			expect(result[0]).toBe('01 - Journal/Weekly/Week-01/01-02-Thu.md')
			expect(result[1]).toBe('01 - Journal/Weekly/Week-01/01-01-Wed.md')
			expect(result[2]).toBe('01 - Journal/Weekly/Week-01/12-31-Tue.md')
		})
	})

	describe('maxAttempts parameter', () => {
		it('generates default 10 candidates when maxAttempts is not specified', () => {
			stubDate('2025-01-02')

			const result = PreviousNoteCandidatesFinder.generateCandidates(
				'01 - Journal/Weekly/Week-{week}',
				'{month}-{day}-{dow}.md',
			)

			expect(result).toHaveLength(10)
		})

		it('generates custom number of candidates when maxAttempts is specified', () => {
			stubDate('2025-01-02')

			const result = PreviousNoteCandidatesFinder.generateCandidates(
				'01 - Journal/Weekly/Week-{week}',
				'{month}-{day}-{dow}.md',
				undefined,
				5,
			)

			expect(result).toHaveLength(5)
		})
	})
})
